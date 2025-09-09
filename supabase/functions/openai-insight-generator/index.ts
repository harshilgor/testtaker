
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionData {
  studyTime: number;
  questionsAttempted: number;
  accuracy: number;
  skills: Array<{
    skillName: string;
    attempted: number;
    correct: number;
    difficulty: {
      easy: { attempted: number; correct: number };
      medium: { attempted: number; correct: number };
      hard: { attempted: number; correct: number };
    };
  }>;
}

interface OpenAIResponse {
  insights: string[];
  nextSteps: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from auth
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body to get target date and timezone offset
    let body: any = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const rawTargetDate = body?.targetDate as string | undefined;
    const tzOffsetMinutes = Number.isFinite(Number(body?.tzOffsetMinutes)) ? Number(body.tzOffsetMinutes) : 0;
    const clientFallbackData = body?.clientFallbackData;
    const promptTemplate = body?.promptTemplate as string | undefined;
    const isMonthly = body?.isMonthly === true;
    const skillAnalysisData = body?.skillAnalysisData;

    // If we received a skill-level analysis request, handle it immediately
    if (skillAnalysisData && skillAnalysisData.skill) {
      const openAIApiKey = Deno.env.get('Insights');
      if (!openAIApiKey) {
        return new Response(JSON.stringify({ success: false, error: 'AI not configured' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const prompt = `You are an expert SAT coach. Analyze the user's performance for the specific skill "${skillAnalysisData.skill}" within the subject ${skillAnalysisData.subject}. Use the provided summary and attempts (if any). The user may have very little data.

SUMMARY: ${JSON.stringify(skillAnalysisData.summary)}
ATTEMPTS (most recent first, capped): ${JSON.stringify(skillAnalysisData.attempts)}

Return STRICT JSON with keys: {
  "summary": string,
  "rootCauses": string[],
  "weaknesses": string[],
  "strengths": string[],
  "trends": string[],
  "benchmarks": string[],
  "recommendations": string[],
  "motivation": string[],
  "projections": string[]
}

Guidance:
- If attempts are empty, motivate and provide a starter plan.
- If attempts exist, diagnose timing vs accuracy, difficulty breakdown, and common mistake patterns.
- Tie advice to SAT score goals and expected impact.
- Keep sentences concise and actionable.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an SAT prep expert. Always reply with valid JSON only.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 900,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ success: false, error: 'OpenAI error' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const openAIData = await response.json();
      const content = openAIData.choices?.[0]?.message?.content || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(content);
      } catch (_) {
        parsed = {};
      }

      return new Response(JSON.stringify({ success: true, analysis: parsed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dateStr = (typeof rawTargetDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawTargetDate))
      ? rawTargetDate
      : new Date().toISOString().split('T')[0];

    // Check daily limit (3 calls per user per day) using user's local day
    const nowMs = Date.now();
    const todayLocal = new Date(nowMs + tzOffsetMinutes * 60_000).toISOString().split('T')[0];
    const { data: existingCalls, error: limitError } = await supabaseClient
      .from('ai_insight_calls')
      .select('*')
      .eq('user_id', user.id)
      .eq('call_date', todayLocal);

    if (limitError) {
      console.error('Error checking daily limit:', limitError);
    }

    if (existingCalls && existingCalls.length >= 3) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Daily limit reached—try again tomorrow',
        limitReached: true 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Compute user's local day window in UTC
    const [yStr, mStr, dStr] = dateStr.split('-');
    const y = Number(yStr), m = Number(mStr), d = Number(dStr);
    let startMs, endMs, dayStart, dayEnd;
    
    if (isMonthly) {
      // For monthly analysis, get data for the entire month
      startMs = Date.UTC(y, m - 1, 1, 0, 0, 0) + tzOffsetMinutes * 60_000;
      endMs = Date.UTC(y, m, 0, 23, 59, 59) + tzOffsetMinutes * 60_000; // Last day of the month
      dayStart = new Date(startMs);
      dayEnd = new Date(endMs);
    } else {
      // For daily analysis, get data for the specific day
      startMs = Date.UTC(y, m - 1, d, 0, 0, 0) + tzOffsetMinutes * 60_000;
      endMs = Date.UTC(y, m - 1, d + 1, 0, 0, 0) + tzOffsetMinutes * 60_000;
      dayStart = new Date(startMs);
      dayEnd = new Date(endMs);
    }

    // Get quiz results for the target date
    const { data: quizResults } = await supabaseClient
      .from('quiz_results')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', dayStart.toISOString())
      .lt('created_at', dayEnd.toISOString());

    // Get marathon sessions for the target date
    const { data: marathonSessions } = await supabaseClient
      .from('marathon_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', dayStart.toISOString())
      .lt('created_at', dayEnd.toISOString());

    // Get mock test results for the target date
    const { data: mockResults } = await supabaseClient
      .from('mock_test_results')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_at', dayStart.toISOString())
      .lt('completed_at', dayEnd.toISOString());

    // Debug logging for window and counts
    console.log('AIInsights window', {
      userId: user.id,
      dateStr,
      isMonthly,
      tzOffsetMinutes,
      dayStart: dayStart.toISOString(),
      dayEnd: dayEnd.toISOString(),
      counts: {
        quizzes: quizResults?.length || 0,
        marathons: marathonSessions?.length || 0,
        mocks: mockResults?.length || 0,
      },
    });

    // Process and anonymize data
    const sessionData = processSessionData(quizResults || [], marathonSessions || [], mockResults || []);

    // Check if we have any data to analyze, use fallback if available
    if (sessionData.questionsAttempted === 0) {
      if (clientFallbackData?.hasLocalData) {
        console.log('Using fallback data from localStorage:', clientFallbackData.basicInsights);
        
        // Create a simple session data structure from fallback
        const fallbackSessionData = {
          studyTime: clientFallbackData.basicInsights.studyTimeMinutes || 0,
          questionsAttempted: clientFallbackData.basicInsights.totalQuestions || 0,
          accuracy: clientFallbackData.basicInsights.accuracy || 0,
          skills: [] // Simplified for fallback
        };

        // Generate insights using fallback data
        const openAIApiKey = Deno.env.get('Insights');
        if (!openAIApiKey) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Unable to generate insight right now—try again later' 
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const prompt = `Analyze this SAT practice session data (from local storage)${isMonthly ? ' for the entire month' : ''}: ${JSON.stringify(fallbackSessionData)}

Generate actionable insights and next steps for SAT improvement based on this performance data.${isMonthly ? ' Provide comprehensive monthly analysis with detailed insights about study patterns, consistency, and long-term progress.' : ''}

You MUST return ONLY a valid JSON object with this exact structure:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "nextSteps": ["step 1", "step 2", "step 3"]
}

Do not include any text before or after the JSON. Focus on SAT-specific advice and be encouraging.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'You are an SAT prep expert analyzing student performance data. Return only valid JSON responses with insights and nextSteps arrays.' 
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: isMonthly ? 800 : 500,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const openAIData = await response.json();
        const aiContent = openAIData.choices[0]?.message?.content;

        let parsedResponse: OpenAIResponse;
        try {
          parsedResponse = JSON.parse(aiContent);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
          console.error('Raw AI content:', aiContent);
          
          // Try to extract JSON from the response if it's wrapped in text
          const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsedResponse = JSON.parse(jsonMatch[0]);
            } catch (secondParseError) {
              console.error('Failed to parse extracted JSON:', secondParseError);
              // Provide fallback insights based on the data
              parsedResponse = {
                insights: [
                  `Completed ${fallbackSessionData.questionsAttempted} questions with ${fallbackSessionData.accuracy}% accuracy`,
                  `Study time: ${fallbackSessionData.studyTime} minutes`,
                  "Focus on reviewing incorrect answers to improve understanding"
                ],
                nextSteps: [
                  "Review explanations for questions you got wrong",
                  "Practice more questions in your weak areas",
                  "Take timed practice tests to improve speed and accuracy"
                ]
              };
            }
          } else {
            // Provide fallback insights based on the data
            parsedResponse = {
              insights: [
                `Completed ${fallbackSessionData.questionsAttempted} questions with ${fallbackSessionData.accuracy}% accuracy`,
                `Study time: ${fallbackSessionData.studyTime} minutes`,
                "Focus on reviewing incorrect answers to improve understanding"
              ],
              nextSteps: [
                "Review explanations for questions you got wrong",
                "Practice more questions in your weak areas",
                "Take timed practice tests to improve speed and accuracy"
              ]
            };
          }
        }

        // Record the API call for daily limit tracking
        await supabaseClient
          .from('ai_insight_calls')
          .insert({
            user_id: user.id,
            call_date: todayLocal,
            created_at: new Date().toISOString()
          });

        // Handle different response formats for fallback
        let insights: string[] = [];
        let nextSteps: string[] = [];
        
        if ((parsedResponse as any).text) {
          // If response has a text field, try to parse it and extract insights
          try {
            const textContent = (parsedResponse as any).text;
            const parsedText = JSON.parse(textContent);
            
            // Extract insights from various possible fields
            insights = [
              ...(parsedText.keyInsights || []),
              ...(parsedText.errorPatterns || []),
              ...(parsedText.insights || [])
            ];
            
            // Extract next steps from various possible fields
            nextSteps = [
              ...(parsedText.actionPlan || []),
              ...(parsedText.nextSteps || []),
              ...(parsedText.recommendations || [])
            ];
            
            // If still empty, create from available data
            if (insights.length === 0 && nextSteps.length === 0) {
              insights = [
                parsedText.dailyOverview || "Completed practice session",
                `Accuracy: ${parsedText.detailedBreakdown?.overallAccuracy || 'N/A'}`,
                `Questions attempted: ${parsedText.detailedBreakdown?.totalQuestions || 'N/A'}`
              ];
              nextSteps = [
                "Review incorrect answers to understand mistakes",
                "Practice more questions in weak areas",
                "Focus on improving accuracy through targeted practice"
              ];
            }
          } catch (parseError) {
            console.error('Failed to parse fallback text response:', parseError);
            // Fallback to basic insights
            insights = ["Practice session completed", "Focus on improving accuracy"];
            nextSteps = ["Review incorrect answers", "Practice more questions"];
          }
        } else {
          // Standard format
          insights = parsedResponse.insights || [];
          nextSteps = parsedResponse.nextSteps || [];
        }

        return new Response(JSON.stringify({
          success: true,
          insights: insights,
          nextSteps: nextSteps
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'No recent data available—complete a session first to enable deeper insights.' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Create data hash for caching
    const dataHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(sessionData)))
      .then(buffer => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join(''));

    // Check for cached response (valid for 24 hours)
    const { data: cachedResponse } = await supabaseClient
      .from('ai_insight_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_date', dateStr)
      .eq('data_hash', dataHash)
      .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedResponse) {
      return new Response(JSON.stringify({
        success: true,
        insights: cachedResponse.response?.insights || [],
        nextSteps: cachedResponse.response?.nextSteps || [],
        text: typeof cachedResponse.response?.text === 'string' ? cachedResponse.response.text : undefined,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call OpenAI API
    const openAIApiKey = Deno.env.get('Insights');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unable to generate insight right now—try again later' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const assembledPrompt = promptTemplate
      ? promptTemplate.replace('[INSERT_JSON_HERE]', JSON.stringify(sessionData))
      : `Analyze this SAT practice session data${isMonthly ? ' for the entire month' : ''}: ${JSON.stringify(sessionData)}

Generate deeper patterns and actionable next steps for SAT improvement. Focus on:
- Performance patterns across skills and difficulties
- Weakness identification and specific gaps
- Progress correlations and trends
- Predictive suggestions for improvement${isMonthly ? `
- Monthly study patterns and consistency
- Long-term progress trends
- Comprehensive skill assessment across the month
- Strategic recommendations for the next month` : ''}

You MUST return ONLY a valid JSON object with this exact structure:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "nextSteps": ["step 1", "step 2", "step 3"]
}

Do not include any text before or after the JSON. Ensure insights reflect SAT-specific skills (Reading, Math, Writing) and difficulties (easy, medium, hard).${isMonthly ? ' Provide comprehensive monthly analysis with detailed insights about study patterns, consistency, and long-term progress.' : ''}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an SAT prep expert analyzing student performance data. Return only valid JSON responses with insights and nextSteps arrays.' 
          },
          { role: 'user', content: assembledPrompt }
        ],
        max_tokens: isMonthly ? 800 : 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openAIData = await response.json();
    const aiContent = openAIData.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error('Empty response from OpenAI');
    }

    let parsedResponse: OpenAIResponse | { text: string };
    if (promptTemplate) {
      // When a custom prompt template is supplied, treat response as plain text
      parsedResponse = { text: aiContent };
    } else {
      try {
        parsedResponse = JSON.parse(aiContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        console.error('Raw AI content:', aiContent);
        
        // Try to extract JSON from the response if it's wrapped in text
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            console.error('Failed to parse extracted JSON:', secondParseError);
            // Provide fallback insights based on the data
            parsedResponse = {
              insights: [
                `Completed ${sessionData.questionsAttempted} questions with ${sessionData.accuracy}% accuracy`,
                `Study time: ${sessionData.studyTime} minutes`,
                "Focus on reviewing incorrect answers to improve understanding"
              ],
              nextSteps: [
                "Review explanations for questions you got wrong",
                "Practice more questions in your weak areas",
                "Take timed practice tests to improve speed and accuracy"
              ]
            };
          }
        } else {
          // Provide fallback insights based on the data
          parsedResponse = {
            insights: [
              `Completed ${sessionData.questionsAttempted} questions with ${sessionData.accuracy}% accuracy`,
              `Study time: ${sessionData.studyTime} minutes`,
              "Focus on reviewing incorrect answers to improve understanding"
            ],
            nextSteps: [
              "Review explanations for questions you got wrong",
              "Practice more questions in your weak areas",
              "Take timed practice tests to improve speed and accuracy"
            ]
          };
        }
      }
    }

    // Cache the response
    await supabaseClient
      .from('ai_insight_cache')
      .upsert({
        user_id: user.id,
        target_date: dateStr,
        data_hash: dataHash,
        response: parsedResponse
      });

    // Record the API call for daily limit tracking
    await supabaseClient
      .from('ai_insight_calls')
      .insert({
        user_id: user.id,
        call_date: todayLocal,
        created_at: new Date().toISOString()
      });

    // Handle different response formats
    let insights: string[] = [];
    let nextSteps: string[] = [];
    
    if ((parsedResponse as any).text) {
      // If response has a text field, try to parse it and extract insights
      try {
        const textContent = (parsedResponse as any).text;
        const parsedText = JSON.parse(textContent);
        
        // Extract insights from various possible fields
        insights = [
          ...(parsedText.keyInsights || []),
          ...(parsedText.errorPatterns || []),
          ...(parsedText.insights || [])
        ];
        
        // Extract next steps from various possible fields
        nextSteps = [
          ...(parsedText.actionPlan || []),
          ...(parsedText.nextSteps || []),
          ...(parsedText.recommendations || [])
        ];
        
        // If still empty, create from available data
        if (insights.length === 0 && nextSteps.length === 0) {
          insights = [
            parsedText.dailyOverview || "Completed practice session",
            `Accuracy: ${parsedText.detailedBreakdown?.overallAccuracy || 'N/A'}`,
            `Questions attempted: ${parsedText.detailedBreakdown?.totalQuestions || 'N/A'}`
          ];
          nextSteps = [
            "Review incorrect answers to understand mistakes",
            "Practice more questions in weak areas",
            "Focus on improving accuracy through targeted practice"
          ];
        }
      } catch (parseError) {
        console.error('Failed to parse text response:', parseError);
        // Fallback to basic insights
        insights = ["Practice session completed", "Focus on improving accuracy"];
        nextSteps = ["Review incorrect answers", "Practice more questions"];
      }
    } else {
      // Standard format
      insights = (parsedResponse as any).insights || [];
      nextSteps = (parsedResponse as any).nextSteps || [];
    }

    return new Response(JSON.stringify({
      success: true,
      insights: insights,
      nextSteps: nextSteps,
      text: (parsedResponse as any).text
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-insight-generator function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Unable to generate insight right now—try again later' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function processSessionData(quizResults: any[], marathonSessions: any[], mockResults: any[]): SessionData {
  let totalStudyTime = 0;
  let totalQuestions = 0;
  let totalCorrect = 0;
  const skillsMap = new Map();

  // Process quiz results
  quizResults.forEach(quiz => {
    totalStudyTime += quiz.time_taken || 0;
    totalQuestions += quiz.total_questions || 0;
    totalCorrect += quiz.correct_answers || 0;

    // Process skills from topics
    if (quiz.topics && Array.isArray(quiz.topics)) {
      quiz.topics.forEach((topic: string) => {
        if (!skillsMap.has(topic)) {
          skillsMap.set(topic, {
            skillName: topic,
            attempted: 0,
            correct: 0,
            difficulty: {
              easy: { attempted: 0, correct: 0 },
              medium: { attempted: 0, correct: 0 },
              hard: { attempted: 0, correct: 0 }
            }
          });
        }
        const skill = skillsMap.get(topic);
        skill.attempted += quiz.total_questions || 0;
        skill.correct += quiz.correct_answers || 0;
        // Assume medium difficulty for quiz questions
        skill.difficulty.medium.attempted += quiz.total_questions || 0;
        skill.difficulty.medium.correct += quiz.correct_answers || 0;
      });
    }
  });

  // Process marathon sessions
  marathonSessions.forEach(marathon => {
    const sessionMinutes = marathon.end_time && marathon.start_time 
      ? Math.round((new Date(marathon.end_time).getTime() - new Date(marathon.start_time).getTime()) / 60000)
      : 0;
    totalStudyTime += sessionMinutes;
    totalQuestions += marathon.total_questions || 0;
    totalCorrect += marathon.correct_answers || 0;

    // Process marathon subjects
    if (marathon.subjects && Array.isArray(marathon.subjects)) {
      marathon.subjects.forEach((subject: string) => {
        if (!skillsMap.has(subject)) {
          skillsMap.set(subject, {
            skillName: subject,
            attempted: 0,
            correct: 0,
            difficulty: {
              easy: { attempted: 0, correct: 0 },
              medium: { attempted: 0, correct: 0 },
              hard: { attempted: 0, correct: 0 }
            }
          });
        }
        const skill = skillsMap.get(subject);
        skill.attempted += marathon.total_questions || 0;
        skill.correct += marathon.correct_answers || 0;
        
        // Distribute across difficulties based on marathon difficulty setting
        const difficulty = marathon.difficulty || 'medium';
        skill.difficulty[difficulty].attempted += marathon.total_questions || 0;
        skill.difficulty[difficulty].correct += marathon.correct_answers || 0;
      });
    }
  });

  // Process mock test results
  mockResults.forEach(mock => {
    totalStudyTime += mock.time_taken || 0;
    const mathQuestions = Math.round((mock.math_score || 0) / 3); // Estimate questions from score
    const englishQuestions = Math.round((mock.english_score || 0) / 3);
    totalQuestions += mathQuestions + englishQuestions;
    totalCorrect += (mock.math_score || 0) + (mock.english_score || 0);

    // Add Math skill
    if (!skillsMap.has('Math')) {
      skillsMap.set('Math', {
        skillName: 'Math',
        attempted: 0,
        correct: 0,
        difficulty: {
          easy: { attempted: 0, correct: 0 },
          medium: { attempted: 0, correct: 0 },
          hard: { attempted: 0, correct: 0 }
        }
      });
    }
    const mathSkill = skillsMap.get('Math');
    mathSkill.attempted += mathQuestions;
    mathSkill.correct += mock.math_score || 0;
    mathSkill.difficulty.medium.attempted += mathQuestions;
    mathSkill.difficulty.medium.correct += mock.math_score || 0;

    // Add English skill
    if (!skillsMap.has('English')) {
      skillsMap.set('English', {
        skillName: 'English',
        attempted: 0,
        correct: 0,
        difficulty: {
          easy: { attempted: 0, correct: 0 },
          medium: { attempted: 0, correct: 0 },
          hard: { attempted: 0, correct: 0 }
        }
      });
    }
    const englishSkill = skillsMap.get('English');
    englishSkill.attempted += englishQuestions;
    englishSkill.correct += mock.english_score || 0;
    englishSkill.difficulty.medium.attempted += englishQuestions;
    englishSkill.difficulty.medium.correct += mock.english_score || 0;
  });

  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    studyTime: totalStudyTime,
    questionsAttempted: totalQuestions,
    accuracy: accuracy,
    skills: Array.from(skillsMap.values())
  };
}
