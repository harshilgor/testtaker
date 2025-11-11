import { getPrompt } from '../data/prompts';
import { cleanMathText } from '../utils/mathText';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Debug environment variable loading
console.log('🔍 Environment variables debug:');
console.log('🔍 VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('🔍 VITE_OPENAI_API_KEY length:', import.meta.env.VITE_OPENAI_API_KEY?.length || 0);
console.log('🔍 OPENAI_API_KEY:', OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('🔍 OPENAI_API_KEY length:', OPENAI_API_KEY.length);

export interface GeneratedQuestion {
  passage?: string;
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
  chartData?: {
    x_labels: string[];
    y_data: number[];
    x_axis_title: string;
    y_axis_title: string;
  };
  metadata?: Record<string, unknown>;
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
      
      // Generate questions using OpenAI API
      const questions: GeneratedQuestion[] = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const prompt = await getPrompt(skill, domain, difficulty);
          if (!prompt) {
            console.warn('⚠️ No prompt found during generation loop', { skill, domain, difficulty, iteration: i });
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
   * Generate a single question using OpenAI API
   */
  private async generateSingleQuestion(prompt: string, skill: string): Promise<GeneratedQuestion | null> {
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
      
      let content = '';
      if (data.choices?.[0]?.message?.content) {
        content = data.choices[0].message.content;
      } else if (Array.isArray(data.choices?.[0]?.message?.content?.parts)) {
        content = data.choices[0].message.content.parts.map((part: any) => part.text || '').join('\n');
      } else {
        console.error('❌ Invalid API response structure:', data);
        throw new Error('Invalid response from OpenAI API');
      }
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
          console.warn('⚠️ Generated question rejected by skill-specific validation', {
            skill,
            question: cleaned
          });
          return null;
        }

        return cleaned;
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
      // Math/graph-style schema: nested question object with stem + options array or object
      if (question?.question?.stem && (Array.isArray(question?.question?.options) || typeof question?.question?.options === 'object')) {
        const rawOptions = question.question.options;
        const optionEntries: Array<{ key: string; text: string }> = Array.isArray(rawOptions)
          ? rawOptions
          : Object.entries(rawOptions || {}).map(([key, text]) => ({
              key,
              text: typeof text === 'string' ? text : ''
            }));

        const optionMap: Record<string, string> = {};
        optionEntries.forEach((option, index) => {
          const fallbackKey = ['A', 'B', 'C', 'D'][index] || '';
          const normalizedKey = (option?.key || fallbackKey || '').trim().toUpperCase();
          const text = option?.text ?? '';
          if (['A', 'B', 'C', 'D'].includes(normalizedKey) && text) {
            optionMap[normalizedKey] = cleanMathText(text);
          }
        });

        let correctKey: string | number | undefined =
          question.solution?.correctAnswerKey ??
          question.solution?.correct_option ??
          question.solution?.correct_answer ??
          question.question?.correctAnswer ??
          question.correct_answer ??
          question.solution?.answer;

        if (typeof correctKey === 'number') {
          correctKey = ['A', 'B', 'C', 'D'][correctKey] || '';
        }
        if (typeof correctKey === 'string') {
          correctKey = correctKey.trim().toUpperCase();
        }
        if (!['A', 'B', 'C', 'D'].includes(correctKey as string)) {
          console.warn('⚠️ Could not determine correct answer key from generated question', {
            provided: correctKey,
            solution: question.solution
          });
          throw new Error('Missing correct answer key in generated math question');
        }

        const rationaleObj =
          question.solution?.rationale ??
          question.rationales ??
          {};

        if (!optionMap.A || !optionMap.B || !optionMap.C || !optionMap.D) {
          console.warn('⚠️ Invalid math options map produced by AI', optionEntries);
          throw new Error('Missing required options in generated math question');
        }

        return {
          passage: typeof question.question?.context === 'string'
            ? cleanMathText(question.question.context)
            : undefined,
          question: cleanMathText(String(question.question.stem)),
          options: {
            A: optionMap.A,
            B: optionMap.B,
            C: optionMap.C,
            D: optionMap.D
          },
          correct_answer: correctKey as 'A' | 'B' | 'C' | 'D',
          rationales: {
            correct: cleanMathText(String(rationaleObj.correct || '')),
            A: cleanMathText(String(rationaleObj.A || '')),
            B: cleanMathText(String(rationaleObj.B || '')),
            C: cleanMathText(String(rationaleObj.C || '')),
            D: cleanMathText(String(rationaleObj.D || ''))
          },
          chartData: question.chartData,
          metadata: {
            steps: question.solution?.steps,
            raw: question
          }
        };
      }

      // Default reading-style schema
      if (!question.passage || !question.question || !question.options || !question.correct_answer || !question.rationales) {
        console.warn('⚠️ Generated question missing expected fields', question);
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
        passage: typeof question.passage === 'string' ? cleanMathText(question.passage) : undefined,
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
        console.warn('⚠️ Rejecting question: radicand is not perfect square', {
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
        console.warn('⚠️ Rejecting question: correct option does not match evaluated result', {
          normalizedCorrect,
          expected: result.toString()
        });
        return false;
      }
    }

    return true;
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

    const record: any = {
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
      question_prompt: subject === 'english'
        ? cleanMathText(generatedQuestion.passage)
        : cleanMathText(generatedQuestion.question)
    };

    if (generatedQuestion.chartData) {
      record.chart_data = generatedQuestion.chartData;
      record.image = this.generateQuickChartUrl(generatedQuestion.chartData);
      record.has_image = true;
      record.image_alt_text = `${generatedQuestion.chartData.y_axis_title} vs ${generatedQuestion.chartData.x_axis_title} graph`;
    }

    return record;
  }

  private generateQuickChartUrl(chartData: {
    x_labels: string[];
    y_data: number[];
    x_axis_title: string;
    y_axis_title: string;
  }): string {
    const config = {
      type: 'line',
      data: {
        labels: chartData.x_labels,
        datasets: [
          {
            label: chartData.y_axis_title,
            data: chartData.y_data,
            fill: false,
            borderColor: '#2563eb',
            backgroundColor: '#2563eb',
            tension: 0.3
          }
        ]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: chartData.x_axis_title
            }
          },
          y: {
            title: {
              display: true,
              text: chartData.y_axis_title
            },
            beginAtZero: false
          }
        }
      }
    };

    const encodedConfig = encodeURIComponent(JSON.stringify(config));
    return `https://quickchart.io/chart?c=${encodedConfig}`;
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
