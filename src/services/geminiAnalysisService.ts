interface GeminiAnalysisRequest {
  topic: string;
  subject: 'math' | 'english';
  mistakes: Array<{
    question_text?: string;
    time_spent: number;
    difficulty: string;
    error_type?: string;
    created_at: string;
  }>;
  avgTimeSpent: number;
  mistakeCount: number;
  userName: string;
}

interface GeminiAnalysisResponse {
  rootCauses: string[];
  specificReasons: string[];
  practiceStrategies: string[];
  overallInsight: string;
  confidenceLevel: 'low' | 'medium' | 'high';
  estimatedImprovementTime: string;
}

class GeminiAnalysisService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = 'https://kpcprhkubqhslazlhgad.supabase.co';
    this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwY3ByaGt1YnFoc2xhemxoZ2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODkzNTIsImV4cCI6MjA2Mzk2NTM1Mn0.kqHLbGSNGdwtxBKkjqw5Cod6si0j_qnrvpw5u_Q860Q';
  }

  async analyzeWeakness(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    try {
      // Build a comprehensive prompt for Gemini
      const prompt = this.buildAnalysisPrompt(request);
      
      // Call the Supabase Edge Function
      const response = await fetch(`${this.supabaseUrl}/functions/v1/gemini-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`Edge Function error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.analysis) {
        // Parse the Gemini response and convert to our format
        return this.parseGeminiResponse(data.analysis, request);
      } else {
        throw new Error('No analysis in response');
      }
    } catch (error) {
      console.error('Error calling Edge Function:', error);
      // Fallback to rule-based analysis
      return this.generateFallbackAnalysis(request);
    }
  }

  private buildAnalysisPrompt(request: GeminiAnalysisRequest): string {
    const { topic, subject, mistakes, avgTimeSpent, mistakeCount, userName } = request;
    
    const timeAnalysis = this.analyzeTimePattern(avgTimeSpent);
    const mistakePatterns = this.analyzeMistakePatterns(mistakes);
    
    // Include actual question texts for better analysis
    const questionTexts = mistakes.slice(0, 5).map(m => m.question_text || 'Question text not available').join('\n\n');
    
    return `You are an expert SAT tutor analyzing a student's performance. 

STUDENT: ${userName}
TOPIC: ${topic}
SUBJECT: ${subject}
TOTAL MISTAKES: ${mistakeCount}
AVERAGE TIME SPENT: ${avgTimeSpent} seconds
TIME PATTERN: ${timeAnalysis}

SAMPLE QUESTIONS STUDENT GOT WRONG:
${questionTexts}

MISTAKE PATTERNS:
${mistakePatterns}

Please provide a detailed analysis in the following EXACT JSON format (no additional text, just the JSON):

{
  "rootCauses": [
    "Fundamental reason 1 - be specific and actionable",
    "Fundamental reason 2 - focus on conceptual gaps",
    "Fundamental reason 3 - learning habits or strategies",
    "Fundamental reason 4 - test-taking approach"
  ],
  "specificReasons": [
    "Specific mistake pattern 1 - what exactly is going wrong",
    "Specific mistake pattern 2 - common errors made",
    "Specific mistake pattern 3 - time management issues",
    "Specific mistake pattern 4 - comprehension problems",
    "Specific mistake pattern 5 - calculation or reasoning errors"
  ],
  "practiceStrategies": [
    "Strategy 1 - specific study technique",
    "Strategy 2 - practice method",
    "Strategy 3 - test-taking approach",
    "Strategy 4 - review technique",
    "Strategy 5 - time management tip",
    "Strategy 6 - conceptual understanding method"
  ],
  "overallInsight": "A 2-3 sentence summary of the main issue and how to address it specifically for ${subject} ${topic}",
  "confidenceLevel": "medium",
  "estimatedImprovementTime": "2-3 weeks"
}

Make the analysis specific to ${subject} and ${topic}. Be encouraging but honest. Focus on actionable insights that the student can implement immediately. Return ONLY the JSON object, no additional text.`;
  }

  private analyzeTimePattern(avgTime: number): string {
    if (avgTime < 30) return "Student is rushing through questions (too fast)";
    if (avgTime < 60) return "Student has good time management";
    if (avgTime < 90) return "Student is taking reasonable time";
    return "Student is spending excessive time on questions (too slow)";
  }

  private analyzeMistakePatterns(mistakes: any[]): string {
    const patterns = [];
    
    // Analyze difficulty patterns
    const difficulties = mistakes.map(m => m.difficulty);
    const mostCommonDifficulty = difficulties.reduce((a, b) => 
      difficulties.filter(d => d === a).length > difficulties.filter(d => d === b).length ? a : b
    );
    patterns.push(`Most common difficulty: ${mostCommonDifficulty}`);
    
    // Analyze time patterns
    const fastMistakes = mistakes.filter(m => m.time_spent < 30).length;
    const slowMistakes = mistakes.filter(m => m.time_spent > 90).length;
    if (fastMistakes > 0) patterns.push(`${fastMistakes} mistakes made too quickly`);
    if (slowMistakes > 0) patterns.push(`${slowMistakes} mistakes took too long`);
    
    // Analyze error types if available
    const errorTypes = mistakes.filter(m => m.error_type).map(m => m.error_type);
    if (errorTypes.length > 0) {
      const uniqueErrors = [...new Set(errorTypes)];
      patterns.push(`Error types: ${uniqueErrors.join(', ')}`);
    }
    
    return patterns.join('\n');
  }

  private parseGeminiResponse(content: string, request: GeminiAnalysisRequest): GeminiAnalysisResponse {
    try {
      console.log('Raw Gemini response:', content);
      
      if (!content) {
        throw new Error('No content in Gemini response');
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON:', parsed);
        return {
          rootCauses: Array.isArray(parsed.rootCauses) ? parsed.rootCauses : [],
          specificReasons: Array.isArray(parsed.specificReasons) ? parsed.specificReasons : [],
          practiceStrategies: Array.isArray(parsed.practiceStrategies) ? parsed.practiceStrategies : [],
          overallInsight: parsed.overallInsight || 'Analysis complete based on your performance patterns.',
          confidenceLevel: parsed.confidenceLevel || 'medium',
          estimatedImprovementTime: parsed.estimatedImprovementTime || '2-3 weeks'
        };
      }

      // Fallback parsing if JSON extraction fails
      return this.parseTextResponse(content, request);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.generateFallbackAnalysis(request);
    }
  }

  private parseTextResponse(content: string, request: GeminiAnalysisRequest): GeminiAnalysisResponse {
    // Fallback parsing for text responses
    const lines = content.split('\n').filter(line => line.trim());
    
    const rootCauses: string[] = [];
    const specificReasons: string[] = [];
    const practiceStrategies: string[] = [];
    
    let currentSection = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('root cause') || trimmed.toLowerCase().includes('fundamental')) {
        currentSection = 'rootCauses';
      } else if (trimmed.toLowerCase().includes('specific') || trimmed.toLowerCase().includes('why')) {
        currentSection = 'specificReasons';
      } else if (trimmed.toLowerCase().includes('strategy') || trimmed.toLowerCase().includes('improve')) {
        currentSection = 'practiceStrategies';
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const item = trimmed.replace(/^[•\-*]\s*/, '').trim();
        if (item && item.length > 10) {
          switch (currentSection) {
            case 'rootCauses':
              if (rootCauses.length < 5) rootCauses.push(item);
              break;
            case 'specificReasons':
              if (specificReasons.length < 6) specificReasons.push(item);
              break;
            case 'practiceStrategies':
              if (practiceStrategies.length < 8) practiceStrategies.push(item);
              break;
          }
        }
      }
    });

    return {
      rootCauses: rootCauses.length > 0 ? rootCauses : this.generateFallbackAnalysis(request).rootCauses,
      specificReasons: specificReasons.length > 0 ? specificReasons : this.generateFallbackAnalysis(request).specificReasons,
      practiceStrategies: practiceStrategies.length > 0 ? practiceStrategies : this.generateFallbackAnalysis(request).practiceStrategies,
      overallInsight: `Based on your performance in ${request.topic}, you need to focus on improving your ${request.subject} skills.`,
      confidenceLevel: 'medium',
      estimatedImprovementTime: '2-3 weeks'
    };
  }

  private generateFallbackAnalysis(request: GeminiAnalysisRequest): GeminiAnalysisResponse {
    // Fallback rule-based analysis when Gemini API fails
    const { topic, subject, avgTimeSpent } = request;
    
    let rootCauses: string[] = [];
    let specificReasons: string[] = [];
    let practiceStrategies: string[] = [];

    if (subject === 'math') {
      if (topic.toLowerCase().includes('algebra')) {
        rootCauses = [
          "Missing fundamental algebraic principles",
          "Rushing through calculations",
          "Not checking work for errors"
        ];
        specificReasons = [
          "Missing negative signs in equations",
          "Confusing order of operations (PEMDAS)",
          "Not isolating variables properly"
        ];
        practiceStrategies = [
          "Practice step-by-step problem solving",
          "Double-check all calculations",
          "Use scratch paper for complex problems"
        ];
      } else if (topic.toLowerCase().includes('geometry')) {
        rootCauses = [
          "Spatial reasoning difficulties",
          "Formula memorization gaps"
        ];
        specificReasons = [
          "Not drawing diagrams to visualize problems",
          "Forgetting geometric formulas and theorems"
        ];
        practiceStrategies = [
          "Draw diagrams for every geometry problem",
          "Memorize key formulas and theorems",
          "Practice with visual aids"
        ];
      }
    } else if (subject === 'english') {
      if (topic.toLowerCase().includes('reading')) {
        rootCauses = [
          "Skimming passages too quickly",
          "Main idea identification struggles"
        ];
        specificReasons = [
          "Missing key details in passages",
          "Confusing fact-based vs. inference questions"
        ];
        practiceStrategies = [
          "Read passages more carefully and slowly",
          "Underline key information while reading",
          "Practice identifying question types"
        ];
      }
    }

    // Add time-based insights
    if (avgTimeSpent < 30) {
      rootCauses.push("Time pressure leading to careless mistakes");
      practiceStrategies.push("Implement time management techniques");
    } else if (avgTimeSpent > 90) {
      rootCauses.push("Over-analysis causing confusion");
      practiceStrategies.push("Practice with simpler problems first");
    }

    return {
      rootCauses: rootCauses.length > 0 ? rootCauses : ["Conceptual understanding gaps", "Need for more practice"],
      specificReasons: specificReasons.length > 0 ? specificReasons : ["Not applying learned concepts correctly", "Missing key details"],
      practiceStrategies: practiceStrategies.length > 0 ? practiceStrategies : ["Review fundamental concepts", "Take practice tests", "Focus on weak areas"],
      overallInsight: `You need to focus on improving your ${topic} skills in ${subject}.`,
      confidenceLevel: 'medium',
      estimatedImprovementTime: '2-3 weeks'
    };
  }

  async generateOverallInsights(mistakes: any[], userName: string): Promise<Array<{
    type: 'warning' | 'tip' | 'focus';
    icon: string;
    title: string;
    message: string;
  }>> {
    try {
      const prompt = `Analyze this student's performance data and provide 3 key insights:

STUDENT: ${userName}
TOTAL MISTAKES: ${mistakes.length}
RECENT MISTAKES (last 7 days): ${mistakes.filter(m => {
        const mistakeDate = new Date(m.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return mistakeDate >= weekAgo;
      }).length}

Provide insights in this JSON format:
{
  "insights": [
    {
      "type": "warning/tip/focus",
      "title": "Insight title",
      "message": "Detailed message about the insight"
    }
  ]
}

Be encouraging but honest. Focus on actionable insights.`;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.insights || [];
          }
        }
      }
    } catch (error) {
      console.error('Error generating overall insights:', error);
    }

    // Fallback insights
    return [
      {
        type: 'warning' as const,
        icon: '⚠️',
        title: 'Recent Struggles',
        message: `${mistakes.filter(m => {
          const mistakeDate = new Date(m.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return mistakeDate >= weekAgo;
        }).length} mistakes this week - consider reviewing fundamentals`
      },
      {
        type: 'tip' as const,
        icon: '💡',
        title: 'Practice Strategy',
        message: 'Focus on your weakest topics first and review explanations thoroughly'
      },
      {
        type: 'focus' as const,
        icon: '🎯',
        title: 'Improvement Focus',
        message: 'Set specific goals for each study session to track your progress'
      }
    ];
  }
}

export const geminiAnalysisService = new GeminiAnalysisService();
export default geminiAnalysisService;
