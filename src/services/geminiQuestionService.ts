import { getPrompt } from '../data/questionPrompts';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyA9jfgnHGVloZuP_NrcXAnKnj2_1T7pM8Q';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

export interface GeneratedQuestion {
  passage: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  rationales: {
    correct: string;
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface QuestionGenerationRequest {
  skill: string;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count?: number;
}

export interface QuestionGenerationResponse {
  questions: GeneratedQuestion[];
  success: boolean;
  error?: string;
}

class GeminiQuestionService {
  /**
   * Generate questions using Gemini API with stored prompts
   */
  async generateQuestions(request: QuestionGenerationRequest): Promise<QuestionGenerationResponse> {
    try {
      const { skill, domain, difficulty, count = 1 } = request;
      
      // Get the appropriate prompt
      const prompt = getPrompt(skill, domain, difficulty);
      if (!prompt) {
        return {
          questions: [],
          success: false,
          error: `No prompt found for skill: ${skill}, domain: ${domain}, difficulty: ${difficulty}`
        };
      }

      // Generate questions using Gemini API
      const questions: GeneratedQuestion[] = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const question = await this.generateSingleQuestion(prompt);
          if (question) {
            questions.push(question);
          }
        } catch (error) {
          console.error(`Error generating question ${i + 1}:`, error);
          // Continue with other questions even if one fails
        }
      }

      return {
        questions,
        success: questions.length > 0,
        error: questions.length === 0 ? 'Failed to generate any questions' : undefined
      };

    } catch (error) {
      console.error('Error in generateQuestions:', error);
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate a single question using Gemini API
   */
  private async generateSingleQuestion(prompt: string): Promise<GeneratedQuestion | null> {
    try {
      console.log('🔑 Using API Key:', GEMINI_API_KEY.substring(0, 10) + '...');
      console.log('📡 API URL:', GEMINI_API_URL);
      console.log('📝 Prompt length:', prompt.length);
      console.log('📝 Prompt preview:', prompt.substring(0, 200) + '...');
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      console.log('📡 API Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 API Response data:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('❌ Invalid API response structure:', data);
        throw new Error('Invalid response from Gemini API');
      }

      const content = data.candidates[0].content.parts[0].text;
      console.log('📝 Raw API content:', content);
      
      // Parse the JSON response
      try {
        const parsedQuestion = JSON.parse(content);
        console.log('✅ Parsed question:', parsedQuestion);
        return this.validateAndCleanQuestion(parsedQuestion);
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response as JSON:', content);
        console.error('Parse error:', parseError);
        throw new Error('Invalid JSON response from Gemini API');
      }

    } catch (error) {
      console.error('❌ Error generating single question:', error);
      return null;
    }
  }

  /**
   * Validate and clean the generated question
   */
  private validateAndCleanQuestion(question: any): GeneratedQuestion | null {
    try {
      // Validate required fields
      if (!question.passage || !question.question || !question.options || !question.correct_answer || !question.rationales) {
        throw new Error('Missing required fields in generated question');
      }

      // Validate options
      const options = question.options;
      if (!options.A || !options.B || !options.C || !options.D) {
        throw new Error('Missing required options A, B, C, or D');
      }

      // Validate correct answer
      if (!['A', 'B', 'C', 'D'].includes(question.correct_answer)) {
        throw new Error('Invalid correct answer format');
      }

      // Validate rationales
      const rationales = question.rationales;
      if (!rationales.correct || !rationales.A || !rationales.B || !rationales.C || !rationales.D) {
        throw new Error('Missing required rationales');
      }

      return {
        passage: question.passage.trim(),
        question: question.question.trim(),
        options: {
          A: options.A.trim(),
          B: options.B.trim(),
          C: options.C.trim(),
          D: options.D.trim()
        },
        correct_answer: question.correct_answer as 'A' | 'B' | 'C' | 'D',
        rationales: {
          correct: rationales.correct.trim(),
          A: rationales.A.trim(),
          B: rationales.B.trim(),
          C: rationales.C.trim(),
          D: rationales.D.trim()
        }
      };

    } catch (error) {
      console.error('Error validating question:', error);
      return null;
    }
  }

  /**
   * Convert generated question to database format
   */
  convertToDatabaseFormat(generatedQuestion: GeneratedQuestion, skill: string, domain: string, difficulty: string): any {
    return {
      question_text: generatedQuestion.question,
      option_a: generatedQuestion.options.A,
      option_b: generatedQuestion.options.B,
      option_c: generatedQuestion.options.C,
      option_d: generatedQuestion.options.D,
      correct_answer: generatedQuestion.correct_answer,
      correct_rationale: generatedQuestion.rationales.correct,
      incorrect_rationale_a: generatedQuestion.rationales.A,
      incorrect_rationale_b: generatedQuestion.rationales.B,
      incorrect_rationale_c: generatedQuestion.rationales.C,
      incorrect_rationale_d: generatedQuestion.rationales.D,
      skill: skill,
      domain: domain,
      difficulty: difficulty,
      assessment: 'SAT',
      test: 'Reading and Writing',
      question_prompt: generatedQuestion.passage,
      is_generated: true,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Generate questions for a specific topic
   */
  async generateTopicQuestions(
    skill: string,
    domain: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 5
  ): Promise<GeneratedQuestion[]> {
    const response = await this.generateQuestions({
      skill,
      domain,
      difficulty,
      count
    });

    return response.questions;
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Gemini API connection...');
      console.log('🔑 API Key:', GEMINI_API_KEY.substring(0, 10) + '...');
      console.log('📡 API URL:', GEMINI_API_URL);
      
      // Test with a simple prompt first
      const testResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Generate a simple math question: What is 2+2?"
            }]
          }]
        })
      });

      console.log('📡 Test API Response status:', testResponse.status, testResponse.statusText);
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('❌ API Test Error:', errorText);
        return false;
      }

      const testData = await testResponse.json();
      console.log('✅ API Test Success:', testData);
      return true;
      
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  }
}

export const geminiQuestionService = new GeminiQuestionService();
