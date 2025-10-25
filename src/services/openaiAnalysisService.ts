interface OpenAIAnalysisRequest {
  mistakes: Array<{
    question_text?: string;
    time_spent: number;
    difficulty: string;
    error_type?: string;
    created_at: string;
    topic: string;
    subject: string;
  }>;
  userName: string;
  totalMistakes: number;
  avgTimeSpent: number;
}

interface OpenAIAnalysisResponse {
  weaknesses: string[];
  explanations: string[];
  recommendations: string[];
  overallInsight: string;
  confidenceLevel: 'low' | 'medium' | 'high';
  estimatedImprovementTime: string;
  quizQuestions?: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

class OpenAIAnalysisService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  async analyzeWeaknesses(request: OpenAIAnalysisRequest): Promise<OpenAIAnalysisResponse> {
    try {
      // Build comprehensive prompt for OpenAI
      const prompt = this.buildAnalysisPrompt(request);
      
      // Call the Supabase Edge Function
      const response = await fetch(`${this.supabaseUrl}/functions/v1/openai-insight-generator`, {
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
      
      if (data.insight) {
        // Parse the OpenAI response and convert to our format
        return this.parseOpenAIResponse(data.insight, request);
      } else {
        throw new Error('No insight in response');
      }
    } catch (error) {
      console.error('Error calling OpenAI Edge Function:', error);
      // Fallback to rule-based analysis
      return this.generateFallbackAnalysis(request);
    }
  }

  private buildAnalysisPrompt(request: OpenAIAnalysisRequest): string {
    const { mistakes, userName, totalMistakes, avgTimeSpent } = request;
    
    // Include sample questions for better analysis
    const sampleQuestions = mistakes.slice(0, 10).map((m, index) => 
      `Question ${index + 1}: ${m.question_text || 'Question text not available'}\nTopic: ${m.topic}, Difficulty: ${m.difficulty}, Time: ${m.time_spent}s`
    ).join('\n\n');
    
    return `You are an expert SAT tutor analyzing a student's performance. Please provide a comprehensive analysis in the following EXACT JSON format (no additional text, just the JSON):

STUDENT: ${userName}
TOTAL MISTAKES: ${totalMistakes}
AVERAGE TIME SPENT: ${avgTimeSpent} seconds

SAMPLE QUESTIONS STUDENT GOT WRONG:
${sampleQuestions}

Please analyze this data and provide insights in this EXACT JSON format:

{
  "weaknesses": [
    "Specific weakness 1 - be detailed and actionable",
    "Specific weakness 2 - focus on conceptual gaps",
    "Specific weakness 3 - learning habits or strategies",
    "Specific weakness 4 - test-taking approach"
  ],
  "explanations": [
    "Detailed explanation of weakness 1 with examples",
    "Detailed explanation of weakness 2 with examples",
    "Detailed explanation of weakness 3 with examples",
    "Detailed explanation of weakness 4 with examples"
  ],
  "recommendations": [
    "Specific recommendation 1 - actionable study technique",
    "Specific recommendation 2 - practice method",
    "Specific recommendation 3 - test-taking strategy",
    "Specific recommendation 4 - review technique",
    "Specific recommendation 5 - time management tip"
  ],
  "overallInsight": "A comprehensive 2-3 sentence summary analyzing the student's overall performance patterns, most critical weaknesses, and the most important action to take for improvement",
  "confidenceLevel": "high",
  "estimatedImprovementTime": "2-4 weeks with focused practice"
}

Analyze ALL ${totalMistakes} mistakes comprehensively. Be specific about patterns, provide concrete examples from the questions, and give actionable advice. Focus on the most impactful improvements the student can make. Return ONLY the JSON object, no additional text.`;
  }

  private parseOpenAIResponse(content: string, request: OpenAIAnalysisRequest): OpenAIAnalysisResponse {
    try {
      console.log('Raw OpenAI response:', content);
      
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON:', parsed);
        return {
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
          explanations: Array.isArray(parsed.explanations) ? parsed.explanations : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          overallInsight: parsed.overallInsight || 'Analysis complete based on your performance patterns.',
          confidenceLevel: parsed.confidenceLevel || 'medium',
          estimatedImprovementTime: parsed.estimatedImprovementTime || '2-3 weeks'
        };
      }

      // Fallback parsing if JSON extraction fails
      return this.parseTextResponse(content, request);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return this.generateFallbackAnalysis(request);
    }
  }

  private parseTextResponse(content: string, request: OpenAIAnalysisRequest): OpenAIAnalysisResponse {
    // Fallback parsing for text responses
    const lines = content.split('\n').filter(line => line.trim());
    
    const weaknesses: string[] = [];
    const explanations: string[] = [];
    const recommendations: string[] = [];
    
    let currentSection = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('weakness') || trimmed.toLowerCase().includes('struggle')) {
        currentSection = 'weaknesses';
      } else if (trimmed.toLowerCase().includes('explanation') || trimmed.toLowerCase().includes('why')) {
        currentSection = 'explanations';
      } else if (trimmed.toLowerCase().includes('recommendation') || trimmed.toLowerCase().includes('strategy')) {
        currentSection = 'recommendations';
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const item = trimmed.replace(/^[•\-*]\s*/, '').trim();
        if (item && item.length > 10) {
          switch (currentSection) {
            case 'weaknesses':
              if (weaknesses.length < 4) weaknesses.push(item);
              break;
            case 'explanations':
              if (explanations.length < 4) explanations.push(item);
              break;
            case 'recommendations':
              if (recommendations.length < 5) recommendations.push(item);
              break;
          }
        }
      }
    });

    return {
      weaknesses: weaknesses.length > 0 ? weaknesses : this.generateFallbackAnalysis(request).weaknesses,
      explanations: explanations.length > 0 ? explanations : this.generateFallbackAnalysis(request).explanations,
      recommendations: recommendations.length > 0 ? recommendations : this.generateFallbackAnalysis(request).recommendations,
      overallInsight: `Based on your performance with ${request.totalMistakes} mistakes, you need to focus on improving your SAT skills.`,
      confidenceLevel: 'medium',
      estimatedImprovementTime: '2-3 weeks'
    };
  }

  private generateFallbackAnalysis(request: OpenAIAnalysisRequest): OpenAIAnalysisResponse {
    const { totalMistakes, avgTimeSpent } = request;
    
    let weaknesses: string[] = [];
    let explanations: string[] = [];
    let recommendations: string[] = [];

    // Analyze time patterns
    if (avgTimeSpent < 30) {
      weaknesses.push("Rushing through questions too quickly");
      explanations.push("You're spending less than 30 seconds per question on average, which suggests you may be rushing and not reading carefully enough.");
      recommendations.push("Slow down and read each question thoroughly before answering");
    } else if (avgTimeSpent > 90) {
      weaknesses.push("Spending too much time on individual questions");
      explanations.push("You're spending over 90 seconds per question on average, which may indicate over-analysis or getting stuck on difficult problems.");
      recommendations.push("Practice time management and learn when to move on from difficult questions");
    }

    // Analyze mistake patterns
    if (totalMistakes > 20) {
      weaknesses.push("High frequency of mistakes across multiple topics");
      explanations.push("With over 20 mistakes, there may be fundamental gaps in understanding across different SAT topics.");
      recommendations.push("Focus on reviewing fundamental concepts before attempting practice questions");
    }

    // General recommendations
    recommendations.push("Review explanations for every mistake you make");
    recommendations.push("Practice regularly with focused study sessions");
    recommendations.push("Take practice tests under timed conditions");

    return {
      weaknesses: weaknesses.length > 0 ? weaknesses : ["Need to improve overall SAT performance", "Focus on fundamental concepts"],
      explanations: explanations.length > 0 ? explanations : ["Review your mistakes to identify patterns", "Practice more to improve accuracy"],
      recommendations: recommendations.length > 0 ? recommendations : ["Study regularly", "Review mistakes", "Take practice tests"],
      overallInsight: `You have ${totalMistakes} mistakes to review. Focus on understanding the patterns in your errors to improve your SAT performance.`,
      confidenceLevel: 'medium',
      estimatedImprovementTime: '2-3 weeks'
    };
  }
}

export const openaiAnalysisService = new OpenAIAnalysisService();
export default openaiAnalysisService;
