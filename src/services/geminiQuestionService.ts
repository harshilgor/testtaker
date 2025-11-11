import { getPrompt } from '../data/prompts';
import { cleanMathText } from '../utils/mathText';

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
      
      // Generate questions using Gemini API
      const questions: GeneratedQuestion[] = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const prompt = await getPrompt(skill, domain, difficulty);
          if (!prompt) {
            console.warn('⚠️ Gemini: no prompt found during generation loop', { skill, domain, difficulty, iteration: i });
            break;
          }

          const question = await this.generateSingleQuestion(prompt, skill);
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
  private async generateSingleQuestion(prompt: string, skill: string): Promise<GeneratedQuestion | null> {
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
        const cleaned = this.validateAndCleanQuestion(parsedQuestion);
        if (!cleaned) {
          return null;
        }

        if (!this.validateSkillSpecificConstraints(cleaned, skill)) {
          console.warn('⚠️ Gemini question rejected by skill-specific validation', {
            skill,
            question: cleaned
          });
          return null;
        }

        return cleaned;
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
        passage: cleanMathText(question.passage),
        question: cleanMathText(question.question),
        options: {
          A: cleanMathText(options.A),
          B: cleanMathText(options.B),
          C: cleanMathText(options.C),
          D: cleanMathText(options.D)
        },
        correct_answer: question.correct_answer as 'A' | 'B' | 'C' | 'D',
        rationales: {
          correct: cleanMathText(rationales.correct),
          A: cleanMathText(rationales.A),
          B: cleanMathText(rationales.B),
          C: cleanMathText(rationales.C),
          D: cleanMathText(rationales.D)
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
  convertToDatabaseFormat(
    generatedQuestion: GeneratedQuestion,
    skill: string,
    domain: string,
    difficulty: string,
    subject: 'math' | 'english'
  ): any {
    const test = subject === 'math' ? 'Math' : 'Reading and Writing';

    return {
      question_text: cleanMathText(generatedQuestion.question),
      option_a: cleanMathText(generatedQuestion.options.A),
      option_b: cleanMathText(generatedQuestion.options.B),
      option_c: cleanMathText(generatedQuestion.options.C),
      option_d: cleanMathText(generatedQuestion.options.D),
      correct_answer: generatedQuestion.correct_answer,
      correct_rationale: cleanMathText(generatedQuestion.rationales.correct),
      incorrect_rationale_a: cleanMathText(generatedQuestion.rationales.A),
      incorrect_rationale_b: cleanMathText(generatedQuestion.rationales.B),
      incorrect_rationale_c: cleanMathText(generatedQuestion.rationales.C),
      incorrect_rationale_d: cleanMathText(generatedQuestion.rationales.D),
      skill: skill,
      domain: domain,
      difficulty: difficulty,
      assessment: 'SAT',
      test,
      section: test,
      question_type: 'multiple-choice',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      question_prompt: subject === 'english'
        ? cleanMathText(generatedQuestion.passage)
        : cleanMathText(generatedQuestion.question)
    };
  }

  private validateSkillSpecificConstraints(question: GeneratedQuestion, skill: string): boolean {
    const stem = question.question;

    const sqrtMatch = stem.match(/f\(x\)\s*=\s*√\(\s*([-+]?\d+)\s*x\s*([+-]\s*\d+)\s*\)/i);
    const inputMatch = stem.match(/f\(\s*(\d+)\s*\)/i);

    if (sqrtMatch && inputMatch) {
      const coeff = parseInt(sqrtMatch[1].replace(/\s+/g, ''), 10);
      const constant = parseInt(sqrtMatch[2].replace(/\s+/g, ''), 10);
      const inputValue = parseInt(inputMatch[1], 10);

      const radicand = coeff * inputValue + constant;
      const result = Math.sqrt(radicand);

      if (!Number.isFinite(result) || !Number.isInteger(result)) {
        console.warn('⚠️ Gemini rejecting question: radicand not perfect square', {
          coeff,
          constant,
          inputValue,
          radicand
        });
        return false;
      }

      const correctOption = question.options[question.correct_answer];
      if (!correctOption) {
        return false;
      }

      const normalizedCorrect = cleanMathText(correctOption);
      if (normalizedCorrect !== result.toString()) {
        console.warn('⚠️ Gemini rejecting question: correct option mismatch', {
          normalizedCorrect,
          expected: result.toString()
        });
        return false;
      }
    }

    return true;
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
