interface Mistake {
  question_text?: string;
  time_spent: number;
  difficulty: string;
  error_type?: string;
  created_at: string;
  topic: string;
  subject: string;
  user_answer?: string;
  correct_answer?: string;
}

interface TargetedQuestionRequest {
  mistakes: Mistake[];
  userName: string;
  totalMistakes: number;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  subject: string;
  reasoning: string; // Why the student likely got the original wrong
}

interface TargetedQuestionResponse {
  questions: GeneratedQuestion[];
  weaknessInsights: string[];
  overallStrategy: string;
  estimatedTime: string;
}

class TargetedQuestionService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = 'https://kpcprhkubqhslazlhgad.supabase.co';
    this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwY3ByaGt1YnFoc2xhemxoZ2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODkzNTIsImV4cCI6MjA2Mzk2NTM1Mn0.kqHLbGSNGdwtxBKkjqw5Cod6si0j_qnrvpw5u_Q860Q';
  }

  async generateTargetedQuestions(request: TargetedQuestionRequest): Promise<TargetedQuestionResponse> {
    try {
      // Build comprehensive prompt for targeted question generation
      const prompt = this.buildTargetedPrompt(request);
      
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
        return this.parseTargetedResponse(data.insight, request);
      } else {
        throw new Error('No insight in response');
      }
    } catch (error) {
      console.error('Error calling OpenAI Edge Function for targeted questions:', error);
      // Fallback to rule-based question generation
      return this.generateFallbackQuestions(request);
    }
  }

  private buildTargetedPrompt(request: TargetedQuestionRequest): string {
    const { mistakes, userName, totalMistakes } = request;
    
    // Analyze mistakes and create difficulty progression map
    const mistakeAnalysis = this.analyzeMistakes(mistakes);
    
    // Include sample mistakes for context
    const sampleMistakes = mistakes.slice(0, 5).map((m, index) => 
      `Mistake ${index + 1}: ${m.question_text || 'Question text not available'}\nTopic: ${m.topic}, Difficulty: ${m.difficulty}, Time: ${m.time_spent}s, User Answer: ${m.user_answer || 'Unknown'}, Correct: ${m.correct_answer || 'Unknown'}`
    ).join('\n\n');
    
    return `You are an expert SAT tutor creating targeted practice questions to help a student overcome their weaknesses. 

STUDENT: ${userName}
TOTAL MISTAKES: ${totalMistakes}

MISTAKE ANALYSIS:
${mistakeAnalysis}

SAMPLE MISTAKES:
${sampleMistakes}

TASK: Generate 3-5 targeted practice questions that are HARDER than the student's mistakes to help them improve. For each mistake, create a question that:
1. Targets the same topic but at a higher difficulty level
2. Addresses the specific weakness shown in the mistake
3. Includes common traps and misconceptions
4. Provides detailed explanations

Please provide your response in this EXACT JSON format (no additional text, just the JSON):

{
  "questions": [
    {
      "question": "Full question text with all details",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct answer (A, B, C, or D)",
      "explanation": "Detailed explanation of why this answer is correct and common mistakes to avoid",
      "topic": "Specific topic (e.g., 'Algebra', 'Reading Comprehension', 'Grammar')",
      "difficulty": "Medium or Hard (one level up from student's mistake)",
      "subject": "math or english",
      "reasoning": "Why the student likely got the original question wrong and how this question addresses that weakness"
    }
  ],
  "weaknessInsights": [
    "Insight 1 about the student's weakness patterns",
    "Insight 2 about specific areas needing improvement",
    "Insight 3 about study strategies"
  ],
  "overallStrategy": "Overall strategy for improving in these weak areas",
  "estimatedTime": "Estimated time to complete these questions (e.g., '15-20 minutes')"
}

Generate questions that are challenging but achievable. Focus on the most common mistake patterns. Return ONLY the JSON object, no additional text.`;
  }

  private analyzeMistakes(mistakes: Mistake[]): string {
    const topicCounts = new Map<string, number>();
    const difficultyCounts = new Map<string, number>();
    const subjectCounts = new Map<string, number>();
    
    mistakes.forEach(mistake => {
      // Count topics
      topicCounts.set(mistake.topic, (topicCounts.get(mistake.topic) || 0) + 1);
      
      // Count difficulties
      difficultyCounts.set(mistake.difficulty, (difficultyCounts.get(mistake.difficulty) || 0) + 1);
      
      // Count subjects
      subjectCounts.set(mistake.subject, (subjectCounts.get(mistake.subject) || 0) + 1);
    });
    
    // Find most common topics
    const topTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, count]) => `${topic} (${count} mistakes)`)
      .join(', ');
    
    // Find most common difficulties
    const topDifficulties = Array.from(difficultyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([difficulty, count]) => `${difficulty} (${count} mistakes)`)
      .join(', ');
    
    return `Most problematic topics: ${topTopics}
Most common difficulty levels: ${topDifficulties}
Total subjects affected: ${subjectCounts.size}`;
  }

  private parseTargetedResponse(content: string, request: TargetedQuestionRequest): TargetedQuestionResponse {
    try {
      console.log('Raw OpenAI targeted response:', content);
      
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed targeted JSON:', parsed);
        return {
          questions: Array.isArray(parsed.questions) ? parsed.questions : [],
          weaknessInsights: Array.isArray(parsed.weaknessInsights) ? parsed.weaknessInsights : [],
          overallStrategy: parsed.overallStrategy || 'Focus on your weakest areas with targeted practice.',
          estimatedTime: parsed.estimatedTime || '15-20 minutes'
        };
      }

      // Fallback parsing if JSON extraction fails
      return this.parseTextResponse(content, request);
    } catch (error) {
      console.error('Error parsing OpenAI targeted response:', error);
      return this.generateFallbackQuestions(request);
    }
  }

  private parseTextResponse(content: string, request: TargetedQuestionRequest): TargetedQuestionResponse {
    // Fallback parsing for text responses
    const lines = content.split('\n').filter(line => line.trim());
    
    const questions: GeneratedQuestion[] = [];
    const weaknessInsights: string[] = [];
    
    let currentQuestion: Partial<GeneratedQuestion> = {};
    let questionIndex = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('question') && trimmed.includes(':')) {
        if (Object.keys(currentQuestion).length > 0) {
          questions.push(currentQuestion as GeneratedQuestion);
        }
        currentQuestion = {
          question: trimmed.split(':').slice(1).join(':').trim(),
          topic: 'General',
          difficulty: 'Medium',
          subject: 'english'
        };
        questionIndex++;
      } else if (trimmed.startsWith('A)') || trimmed.startsWith('B)') || trimmed.startsWith('C)') || trimmed.startsWith('D)')) {
        if (!currentQuestion.options) currentQuestion.options = [];
        currentQuestion.options.push(trimmed);
      } else if (trimmed.toLowerCase().includes('answer:') || trimmed.toLowerCase().includes('correct:')) {
        currentQuestion.correctAnswer = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.toLowerCase().includes('explanation:')) {
        currentQuestion.explanation = trimmed.split(':').slice(1).join(':').trim();
      }
    });
    
    // Add the last question
    if (Object.keys(currentQuestion).length > 0) {
      questions.push(currentQuestion as GeneratedQuestion);
    }

    return {
      questions: questions.slice(0, 5), // Limit to 5 questions
      weaknessInsights: weaknessInsights.length > 0 ? weaknessInsights : ['Focus on your weakest topics', 'Practice regularly'],
      overallStrategy: 'Focus on your weakest areas with targeted practice.',
      estimatedTime: '15-20 minutes'
    };
  }

  private generateFallbackQuestions(request: TargetedQuestionRequest): TargetedQuestionResponse {
    const { mistakes } = request;
    
    // Create fallback questions based on most common mistake topics
    const topicCounts = new Map<string, number>();
    mistakes.forEach(mistake => {
      topicCounts.set(mistake.topic, (topicCounts.get(mistake.topic) || 0) + 1);
    });
    
    const topTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    const fallbackQuestions: GeneratedQuestion[] = topTopics.map(([topic, count], index) => ({
      question: `This is a practice question targeting your weakness in ${topic}. You had ${count} mistakes in this area. What is the correct approach to solve this type of problem?`,
      options: [
        'Option A: Use the basic formula',
        'Option B: Apply advanced techniques',
        'Option C: Break down into steps',
        'Option D: Use elimination method'
      ],
      correctAnswer: 'C',
      explanation: `This question targets your weakness in ${topic}. The correct approach is to break down complex problems into manageable steps.`,
      topic: topic,
      difficulty: 'Medium',
      subject: mistakes[0]?.subject || 'english',
      reasoning: `You struggled with ${topic} questions, so this practice question helps you develop better problem-solving strategies.`
    }));

    return {
      questions: fallbackQuestions,
      weaknessInsights: [
        `You have ${topTopics[0]?.[1] || 0} mistakes in ${topTopics[0]?.[0] || 'general topics'}`,
        'Focus on understanding the underlying concepts',
        'Practice with progressively harder questions'
      ],
      overallStrategy: 'Focus on your most problematic topics with targeted practice questions.',
      estimatedTime: '15-20 minutes'
    };
  }
}

export const targetedQuestionService = new TargetedQuestionService();
export default targetedQuestionService;
