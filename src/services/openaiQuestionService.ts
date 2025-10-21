import { getPrompt } from '../data/questionPrompts';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Debug environment variable loading
console.log('🔍 Environment variables debug:');
console.log('🔍 VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('🔍 VITE_OPENAI_API_KEY length:', import.meta.env.VITE_OPENAI_API_KEY?.length || 0);
console.log('🔍 OPENAI_API_KEY:', OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('🔍 OPENAI_API_KEY length:', OPENAI_API_KEY.length);

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

class OpenAIQuestionService {
  /**
   * Generate questions using OpenAI GPT API with stored prompts
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

      // Generate questions using OpenAI API
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
   * Generate a single question using OpenAI API
   */
  private async generateSingleQuestion(prompt: string): Promise<GeneratedQuestion | null> {
    try {
      console.log('🔑 Using OpenAI API Key:', OPENAI_API_KEY.substring(0, 10) + '...');
      console.log('📡 API URL:', OPENAI_API_URL);
      console.log('📝 Prompt length:', prompt.length);
      console.log('📝 Prompt preview:', prompt.substring(0, 200) + '...');
      
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert SAT question generator. Generate high-quality SAT questions in the exact JSON format requested. Always respond with valid JSON only, no additional text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          response_format: { type: "json_object" }
        })
      });

      console.log('📡 API Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 API Response data:', data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('❌ Invalid API response structure:', data);
        throw new Error('Invalid response from OpenAI API');
      }

      const content = data.choices[0].message.content;
      console.log('📝 Raw API content:', content);
      
      // Parse the JSON response
      try {
        const parsedQuestion = JSON.parse(content);
        console.log('✅ Parsed question:', parsedQuestion);
        return this.validateAndCleanQuestion(parsedQuestion);
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI response as JSON:', content);
        console.error('Parse error:', parseError);
        throw new Error('Invalid JSON response from OpenAI API');
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
      console.log('🧪 Testing OpenAI API connection...');
      console.log('🔑 API Key (first 20 chars):', OPENAI_API_KEY.substring(0, 20) + '...');
      console.log('🔑 API Key length:', OPENAI_API_KEY.length);
      console.log('📡 API URL:', OPENAI_API_URL);
      
      // Check if API key is properly set
      if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 10) {
        console.error('❌ API Key is not properly set or too short');
        return false;
      }
      
      // Check API key format
      if (!OPENAI_API_KEY.startsWith('sk-')) {
        console.error('❌ API Key does not start with "sk-" - invalid format');
        console.error('❌ API Key starts with:', OPENAI_API_KEY.substring(0, 5));
        return false;
      }
      
      // Test with a simple prompt first
      console.log('📡 Making API call...');
      const testResponse = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: 'Say "Hello"'
            }
          ],
          max_tokens: 10
        })
      });

      console.log('📡 Test API Response status:', testResponse.status, testResponse.statusText);
      console.log('📡 Test API Response headers:', Object.fromEntries(testResponse.headers.entries()));
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('❌ API Test Error Response:', errorText);
        console.error('❌ API Test Error Status:', testResponse.status, testResponse.statusText);
        return false;
      }

      const testData = await testResponse.json();
      console.log('✅ API Test Success Response:', testData);
      return true;
      
    } catch (error) {
      console.error('❌ API connection test failed with error:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return false;
    }
  }
}

export const openaiQuestionService = new OpenAIQuestionService();
