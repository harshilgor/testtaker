import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = 'AIzaSyBhOTKC0-sJXvoXNpCShWPKfJ6_1BG2h2w';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface AnalysisRequest {
  userData: {
    mistakes: any[];
    quizResults: any[];
    marathonSessions: any[];
    mockTests: any[];
    userName: string;
  };
  analysisType: 'weakness' | 'comprehensive';
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Parse request body
    const body: AnalysisRequest = await req.json();
    const { userData, analysisType } = body;

    if (!userData || !analysisType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Build the prompt based on analysis type
    let prompt = '';
    
    if (analysisType === 'comprehensive') {
      prompt = `Analyze this user's SAT prep performance data and provide comprehensive insights. 

User: ${userData.userName}

Data Summary:
- Total Mistakes: ${userData.mistakes.length}
- Quiz Results: ${userData.quizResults.length}
- Marathon Sessions: ${userData.marathonSessions.length}
- Mock Tests: ${userData.mockTests.length}

Please provide a detailed analysis in the following JSON format:
{
  "overallAnalysis": "Brief overview of user's performance",
  "keyWeaknesses": ["List of main areas of weakness"],
  "learningPatterns": ["Observations about how the user learns"],
  "improvementStrategies": ["Specific strategies to improve"],
  "timeManagementInsights": ["Insights about time management"],
  "subjectSpecificAdvice": {
    "Math": ["Math-specific advice"],
    "Reading": ["Reading-specific advice"],
    "Writing": ["Writing-specific advice"]
  },
  "priorityActions": ["Top 3 actions to take immediately"],
  "confidenceLevel": "High/Medium/Low based on data",
  "estimatedImprovementTime": "Estimated time to see improvement"
}

Focus on actionable insights and specific recommendations based on the user's actual performance data.`;
    } else {
      prompt = `Analyze this user's weaknesses in SAT prep and provide targeted insights.

User: ${userData.userName}

Mistakes Data: ${JSON.stringify(userData.mistakes.slice(0, 10))}

Please provide weakness analysis in JSON format:
{
  "weaknessSummary": "Overview of main weaknesses",
  "topWeakAreas": ["List of weakest topics"],
  "commonMistakePatterns": ["Patterns in mistakes"],
  "targetedRecommendations": ["Specific recommendations"]
}`;
    }

    // Call Gemini API
    const geminiResponse = await fetch(GEMINI_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData: GeminiResponse = await geminiResponse.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    const analysisText = geminiData.candidates[0].content.parts[0].text;

    // Try to parse as JSON, fallback to text if parsing fails
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisText);
    } catch (e) {
      // If JSON parsing fails, return the text as-is
      parsedAnalysis = {
        rawAnalysis: analysisText,
        parseError: 'Response was not valid JSON, returning as text'
      };
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: parsedAnalysis,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    
    return new Response(JSON.stringify({
      error: 'Analysis failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
