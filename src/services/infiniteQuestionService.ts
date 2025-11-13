// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { openaiQuestionService, GeneratedQuestion } from './openaiQuestionService';
import { isAIGenerationAvailable } from '../data/prompts';
import { DatabaseQuestion } from './questionService';
import { generateMathQuestion, GeneratedMathQuestion } from './mathQuestionGenerator';

export interface InfiniteQuestionRequest {
  subject: 'math' | 'english';
  skill: string;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  count: number;
  excludeIds?: number[];
  useAI?: boolean; // Whether to use AI generation when database questions are insufficient
}

export interface InfiniteQuestionResponse {
  questions: DatabaseQuestion[];
  generated_count: number;
  requested_count: number;
  source: 'database' | 'generated' | 'mixed';
  ai_used: boolean;
}

class InfiniteQuestionService {
  private generationCache = new Map<string, DatabaseQuestion[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  /**
   * Get infinite questions by combining database questions with AI-generated ones
   */
  async getInfiniteQuestions(request: InfiniteQuestionRequest): Promise<InfiniteQuestionResponse> {
    const cacheKey = this.getCacheKey(request);
    
    // Check cache first, but only if no excludeIds (cache doesn't account for excludeIds)
    // If excludeIds are provided, we need to fetch fresh to respect exclusions
    if (!request.excludeIds || request.excludeIds.length === 0) {
      if (this.isCacheValid(cacheKey)) {
        const cached = this.generationCache.get(cacheKey);
        if (cached) {
          console.log('Returning cached infinite questions (no exclusions)');
          return {
            questions: cached.slice(0, request.count),
            generated_count: cached.length,
            requested_count: request.count,
            source: 'database',
            ai_used: false
          };
        }
      }
    } else {
      console.log('⚠️ ExcludeIds provided - skipping cache to respect exclusions');
    }

    try {
      // Step 1: Get ALL available database questions (not limited by request.count)
      console.log('🔍 Getting ALL database questions for:', request);
      const allDbQuestions = await this.getAllDatabaseQuestions(request);
      console.log('📊 Found', (allDbQuestions || []).length, 'total database questions');
      
      // Step 2: Filter out already used questions
      const availableDbQuestions = allDbQuestions.filter(q => 
        !(request.excludeIds || []).includes(parseInt(q.id))
      );
      console.log('📊 Available database questions (excluding used):', availableDbQuestions.length);
      
      // Step 3: Use database questions first (up to requested count)
      const dbQuestionsToUse = availableDbQuestions.slice(0, request.count);
      console.log('📊 Using', dbQuestionsToUse.length, 'database questions');
      
      // Step 4: Only generate AI questions if we need more AND have exhausted database
      const neededCount = request.count - dbQuestionsToUse.length;
      let generatedQuestions: DatabaseQuestion[] = [];
      let aiUsed = false;
      
      console.log(`📈 Need ${neededCount} more questions, useAI: ${request.useAI}`);
      console.log(`📊 Database questions available: ${availableDbQuestions.length}, used: ${dbQuestionsToUse.length}`);
      console.log(`📊 Request details:`, {
        skill: request.skill,
        domain: request.domain,
        difficulty: request.difficulty,
        requestedCount: request.count,
        availableDbCount: availableDbQuestions.length,
        dbQuestionsToUse: dbQuestionsToUse.length,
        neededCount: neededCount
      });
      
      // Only use AI if:
      // 1. We need more questions
      // 2. AI is enabled
      // 3. We've used all available database questions (or there are none)
      const hasExhaustedDatabase = availableDbQuestions.length === 0 || 
                                   dbQuestionsToUse.length >= availableDbQuestions.length;
      
      if (neededCount > 0 && request.useAI !== false && hasExhaustedDatabase) {
        console.log(`🤖 Database exhausted! Generating ${neededCount} questions with OpenAI...`);
        console.log(`📊 Database status: available=${availableDbQuestions.length}, used=${dbQuestionsToUse.length}, needed=${neededCount}`);
        
        // Test API connection first
        console.log('🧪 Testing API connection before generation...');
        const apiTestResult = await this.testAPIConnection();
        if (!apiTestResult) {
          console.error('❌ API test failed, skipping AI generation');
          // Even if API test fails, try generating anyway (might be a false negative)
          console.log('⚠️ Proceeding with AI generation despite test failure...');
        }
        
        try {
          const aiQuestions = await this.generateAIQuestions({
            ...request,
            count: neededCount,
            excludeIds: [...(request.excludeIds || []), ...dbQuestionsToUse.map(q => parseInt(q.id))]
          });
          
          generatedQuestions = aiQuestions;
          aiUsed = aiQuestions.length > 0;
          console.log(`✅ Generated ${aiQuestions.length} AI questions`);
          
          if (aiQuestions.length === 0) {
            console.warn('⚠️ AI generation returned 0 questions. This might indicate:');
            console.warn('   - No prompt available for skill/domain/difficulty combination');
            console.warn('   - API connection issue');
            console.warn('   - Generation error');
            console.warn(`   - Request details: skill="${request.skill}", domain="${request.domain}", difficulty="${request.difficulty}"`);
          }
        } catch (error) {
          console.error('❌ Error during AI generation:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            request: request
          });
          // Continue with whatever questions we have
        }
      } else if (neededCount > 0 && !hasExhaustedDatabase) {
        console.log(`⚠️ Not generating AI questions yet - still have ${availableDbQuestions.length - dbQuestionsToUse.length} unused database questions`);
      } else if (neededCount > 0 && request.useAI === false) {
        console.log('⚠️ AI generation is disabled, cannot generate additional questions');
      }

      // Step 5: Combine questions (database first, then AI-generated)
      let allQuestions = [...dbQuestionsToUse, ...generatedQuestions];
      let generatedFromTemplates = false;

      if (allQuestions.length < request.count && request.subject === 'math') {
        const neededFromTemplates = request.count - allQuestions.length;
        console.log(`🧮 Generating ${neededFromTemplates} math fallback questions using templates...`);
        const templateQuestions = this.generateMathFallbackQuestions(
          request.skill,
          request.domain,
          neededFromTemplates,
          request.difficulty
        );
        if (templateQuestions.length > 0) {
          generatedFromTemplates = true;
          allQuestions = [...allQuestions, ...templateQuestions];
        }
      }

      const finalQuestions = allQuestions.slice(0, request.count);
      
      console.log('🔍 Final question combination:', {
        dbQuestionsToUse: dbQuestionsToUse.length,
        generatedQuestions: generatedQuestions.length,
        allQuestions: allQuestions.length,
        finalQuestions: finalQuestions.length,
        requestedCount: request.count
      });

      // Step 6: Cache the results
      this.generationCache.set(cacheKey, finalQuestions);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return {
        questions: finalQuestions,
        generated_count: finalQuestions.length,
        requested_count: request.count,
        source:
          generatedQuestions.length > 0 || generatedFromTemplates
            ? 'mixed'
            : 'database',
        ai_used: aiUsed
      };

    } catch (error) {
      console.error('❌ Error getting infinite questions:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        request: request
      });
      throw error;
    }
  }

  /**
   * Get ALL available database questions (not limited by count)
   */
  private async getAllDatabaseQuestions(request: InfiniteQuestionRequest): Promise<DatabaseQuestion[]> {
    const { subject, skill, domain, difficulty } = request;
    
    // Map subject to database test field
    const testFilter = subject === 'math' ? 'Math' : 'Reading and Writing';
    
    let query = supabase
      .from('question_bank')
      .select(`
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        correct_rationale,
        incorrect_rationale_a,
        incorrect_rationale_b,
        incorrect_rationale_c,
        incorrect_rationale_d,
        assessment,
        skill,
        difficulty,
        domain,
        test,
        question_prompt,
        image
      `)
      .eq('assessment', 'SAT')
      .eq('test', testFilter)
      .not('question_text', 'is', null)
      .not('option_a', 'is', null)
      .not('option_b', 'is', null)
      .not('option_c', 'is', null)
      .not('option_d', 'is', null);

    // Apply filters
    if (skill) {
      query = query.eq('skill', skill);
    }
    
    if (domain) {
      query = query.eq('domain', domain);
    }
    
    if (difficulty && difficulty !== 'mixed') {
      // Map lowercase difficulty to capitalized format used in database
      const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
      query = query.eq('difficulty', capitalizedDifficulty);
    }

    const { data, error } = await query
      .order('id');

    if (error) {
      console.error('❌ Error fetching all database questions:', error);
      console.error('Query details:', {
        subject: request.subject,
        skill: request.skill,
        domain: request.domain,
        difficulty: request.difficulty
      });
      return [];
    }

    console.log('✅ All database query successful, returned:', data?.length || 0, 'questions');
    return data || [];
  }

  /**
   * Get questions from existing database (limited by count)
   */
  private async getDatabaseQuestions(request: InfiniteQuestionRequest): Promise<DatabaseQuestion[]> {
    const { subject, skill, domain, difficulty, excludeIds = [] } = request;
    
    // Map subject to database test field
    const testFilter = subject === 'math' ? 'Math' : 'Reading and Writing';
    
    let query = supabase
      .from('question_bank')
      .select(`
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        correct_rationale,
        incorrect_rationale_a,
        incorrect_rationale_b,
        incorrect_rationale_c,
        incorrect_rationale_d,
        assessment,
        skill,
        difficulty,
        domain,
        test,
        question_prompt,
        image
      `)
      .eq('assessment', 'SAT')
      .eq('test', testFilter)
      .not('question_text', 'is', null)
      .not('option_a', 'is', null)
      .not('option_b', 'is', null)
      .not('option_c', 'is', null)
      .not('option_d', 'is', null);

    // Apply filters
    if (skill) {
      query = query.eq('skill', skill);
    }
    
    if (domain) {
      query = query.eq('domain', domain);
    }
    
    if (difficulty && difficulty !== 'mixed') {
      // Map lowercase difficulty to capitalized format used in database
      const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
      query = query.eq('difficulty', capitalizedDifficulty);
    }

    // Exclude already used questions
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data, error } = await query
      .order('id')
      .limit(request.count * 2); // Get more than needed for variety

    if (error) {
      console.error('❌ Error fetching database questions:', error);
      console.error('Query details:', {
        subject: request.subject,
        skill: request.skill,
        domain: request.domain,
        difficulty: request.difficulty,
        count: request.count
      });
      return [];
    }

    console.log('✅ Database query successful, returned:', data?.length || 0, 'questions');
    return data || [];
  }

  /**
   * Generate new questions using AI
   */
  private async generateAIQuestions(request: InfiniteQuestionRequest): Promise<DatabaseQuestion[]> {
    try {
      console.log('🤖 Starting AI question generation...', request);
      
      // For mixed difficulty, generate questions from multiple difficulty levels
      let generatedQuestions: any[] = [];
      
      if (request.difficulty === 'mixed') {
        console.log('🎯 Mixed difficulty - generating questions from all difficulty levels');
        
        // Test API connection first
        console.log('🧪 Testing API connection...');
        const isConnected = await openaiQuestionService.testConnection();
        if (!isConnected) {
          console.error('❌ API connection test failed, skipping AI generation');
          return [];
        }

        // Generate questions from all three difficulty levels
        const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
        const questionsPerDifficulty = Math.ceil(request.count / 3);
        
        for (const difficulty of difficulties) {
          if (!(await isAIGenerationAvailable(request.skill, request.domain, difficulty))) {
            console.log(`⚠️ AI generation not available for difficulty: ${difficulty}`);
            continue;
          }
          
          console.log(`📡 Generating ${questionsPerDifficulty} questions for ${difficulty} difficulty...`);
          try {
        console.log(`🚀 Generating AI questions for skill "${request.skill}", domain "${request.domain}", difficulty "${difficulty}"`);
        const questions = await openaiQuestionService.generateTopicQuestions(
              request.skill,
              request.domain,
              difficulty,
              questionsPerDifficulty
            );
            generatedQuestions.push(...questions);
            console.log(`✅ Generated ${questions.length} questions for ${difficulty} difficulty`);
          } catch (error) {
            console.error(`❌ Error generating questions for ${difficulty}:`, error);
          }
        }
      } else {
        // Single difficulty generation
        const aiDifficulty = request.difficulty as 'easy' | 'medium' | 'hard';
        
        // Check if AI generation is available for this skill/domain/difficulty combination
        if (!(await isAIGenerationAvailable(request.skill, request.domain, aiDifficulty))) {
        console.log(`AI generation not available for skill: "${request.skill}", domain: "${request.domain}", difficulty: "${aiDifficulty}"`);
          return [];
        }
        console.log('🎯 AI generation parameters:', {
          skill: request.skill,
          domain: request.domain,
          difficulty: aiDifficulty,
          count: request.count
        });
        
        // Test API connection first
        console.log('🧪 Testing API connection...');
        const isConnected = await openaiQuestionService.testConnection();
        if (!isConnected) {
          console.error('❌ API connection test failed, skipping AI generation');
          return [];
        }

        // Generate questions using OpenAI
        console.log('📡 Calling OpenAI API...');
        generatedQuestions = await openaiQuestionService.generateTopicQuestions(
          request.skill,
          request.domain,
          aiDifficulty,
          request.count
        );
      }

      console.log('✅ OpenAI API returned:', generatedQuestions.length, 'questions');
      console.log('📋 Sample generated question:', generatedQuestions[0]);
      console.log('🔍 Generated questions breakdown:', {
        totalGenerated: generatedQuestions.length,
        requestedCount: request.count,
        questionsPerDifficulty: request.difficulty === 'mixed' ? Math.ceil(request.count / 3) : request.count
      });

      if (generatedQuestions.length === 0) {
        console.log('❌ No questions generated by OpenAI API');
        return [];
      }

      // Convert to database format
      console.log('🔄 Converting to database format...');
      const dbFormatQuestions = generatedQuestions.map((q, index) => {
        // For mixed difficulty, use the difficulty from the generated question
        const questionDifficulty = request.difficulty === 'mixed' ? q.difficulty || 'medium' : request.difficulty;
        const converted = openaiQuestionService.convertToDatabaseFormat(
          q,
          request.skill,
          request.domain,
          questionDifficulty,
          request.subject
        );
        console.log(`Converted question ${index + 1}:`, converted);
        return converted;
      });

      console.log('✅ Converted', dbFormatQuestions.length, 'questions to database format');

      // Store generated questions in database for future reference
      if (dbFormatQuestions.length > 0) {
        console.log('💾 Storing generated questions in database...');
        console.log('📋 Questions to store:', dbFormatQuestions.length);
        console.log('📋 Sample question format:', dbFormatQuestions[0]);
        
        // Try to store questions with retry logic
        let storedQuestions = [];
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries && storedQuestions.length === 0) {
          try {
            const { data: insertData, error: insertError } = await supabase
              .from('question_bank')
              .insert(dbFormatQuestions)
              .select();

            if (insertError) {
              console.error(`❌ Error storing generated questions (attempt ${retryCount + 1}):`, insertError);
              console.error('❌ Insert error details:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
              });
              
              retryCount++;
              if (retryCount < maxRetries) {
                console.log(`🔄 Retrying database insert in 2 seconds... (attempt ${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            } else {
              console.log('✅ Successfully stored questions in database');
              console.log('✅ Inserted data:', insertData);
              storedQuestions = insertData || [];
              break;
            }
          } catch (error) {
            console.error(`❌ Unexpected error during database insert (attempt ${retryCount + 1}):`, error);
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`🔄 Retrying database insert in 2 seconds... (attempt ${retryCount + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
        
        if (storedQuestions.length === 0) {
          console.error('❌ Failed to store questions in database after all retries');
          // Still continue with the questions, but log the failure
        } else {
          console.log(`✅ Successfully stored ${storedQuestions.length} questions in database`);
          
          // Update the question IDs with the actual database IDs
          dbFormatQuestions.forEach((question, index) => {
            if (storedQuestions[index]) {
              question.id = storedQuestions[index].id;
            }
          });
          
          // Update question counts for the skill
          await this.updateQuestionCounts(request.skill, request.domain, storedQuestions.length);
          
          // Verify questions were actually stored
          await this.verifyQuestionsStored(storedQuestions, request.skill, request.domain);
        }
      }

      const finalQuestions = dbFormatQuestions.map((q, index) => ({
        ...q,
        // Use the actual database ID if available, otherwise generate a temporary one
        id: q.id || `generated_${Date.now()}_${index}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        metadata: { generated: true, source: 'openai-gpt' }
      }));

      console.log('🎉 AI generation complete:', finalQuestions.length, 'questions ready');
      return finalQuestions;

    } catch (error) {
      console.error('❌ Error generating AI questions:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        request: request
      });
      return [];
    }
  }

  /**
   * Get questions for a specific topic with infinite generation
   */
  async getTopicQuestions(
    subject: 'math' | 'english',
    skill: string,
    domain: string,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed',
    count: number = 10,
    excludeIds: number[] = [],
    useAI: boolean = true
  ): Promise<DatabaseQuestion[]> {
    const response = await this.getInfiniteQuestions({
      subject,
      skill,
      domain,
      difficulty,
      count,
      excludeIds,
      useAI
    });

    return response.questions;
  }

  /**
   * Get adaptive questions based on user performance
   */
  async getAdaptiveQuestions(
    subject: 'math' | 'english',
    userPerformance: {
      weakSkills: string[];
      strongSkills: string[];
      targetDifficulty: 'easy' | 'medium' | 'hard';
      previousMistakes: string[];
    },
    count: number = 10
  ): Promise<DatabaseQuestion[]> {
    // Focus on weak skills with appropriate difficulty
    const response = await this.getInfiniteQuestions({
      subject,
      skill: userPerformance.weakSkills[0] || 'general',
      domain: 'adaptive',
      difficulty: userPerformance.targetDifficulty,
      count,
      useAI: true
    });

    return response.questions;
  }

  /**
   * Test AI generation capability
   */
  async testAIGeneration(): Promise<boolean> {
    try {
      const response = await this.getInfiniteQuestions({
        subject: 'english',
        skill: 'Comprehension',
        domain: 'Information and Ideas',
        difficulty: 'easy',
        count: 1,
        useAI: true
      });
      
      return response.ai_used && response.questions.length > 0;
    } catch (error) {
      console.error('AI generation test failed:', error);
      return false;
    }
  }

  private getCacheKey(request: InfiniteQuestionRequest): string {
    return `${request.subject}_${request.skill}_${request.domain}_${request.difficulty}_${request.count}_${request.useAI}`;
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Test API connection and prompt functionality
   */
  async testAPIConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing API connection and prompt functionality...');
      const testRequest = {
        subject: 'english' as const,
        skill: 'Comprehension',
        domain: 'Information and Ideas',
        difficulty: 'easy' as const,
        count: 1,
        useAI: true
      };
      
      const response = await this.generateAIQuestions(testRequest);
      const success = response.length > 0;
      
      console.log(`🧪 API test result: ${success ? 'SUCCESS' : 'FAILED'}`);
      if (success) {
        console.log('✅ API connection working, prompt generation successful');
      } else {
        console.log('❌ API connection failed or no questions generated');
      }
      
      return success;
    } catch (error) {
      console.error('❌ API test failed:', error);
      return false;
    }
  }

  /**
   * Get the count of available database questions for a skill/domain
   */
  async getAvailableQuestionCount(request: InfiniteQuestionRequest): Promise<number> {
    try {
      const allDbQuestions = await this.getAllDatabaseQuestions(request);
      const availableDbQuestions = allDbQuestions.filter(q => 
        !(request.excludeIds || []).includes(parseInt(q.id))
      );
      
      console.log(`📊 Available questions for ${request.skill}/${request.domain}: ${availableDbQuestions.length}`);
      return availableDbQuestions.length;
    } catch (error) {
      console.error('❌ Error getting available question count:', error);
      return 0;
    }
  }

  /**
   * Update question counts for a skill after adding new questions
   */
  private async updateQuestionCounts(skill: string, domain: string, addedCount: number): Promise<void> {
    try {
      console.log(`📊 Updating question counts for skill: ${skill}, domain: ${domain}, added: ${addedCount}`);
      
      // Get current count for this skill/domain combination
      const { data: currentData, error: countError } = await supabase
        .from('question_bank')
        .select('id', { count: 'exact', head: true })
        .eq('skill', skill)
        .eq('domain', domain)
        .eq('assessment', 'SAT');

      if (countError) {
        console.error('❌ Error getting current question count:', countError);
        return;
      }

      const currentCount = currentData?.length || 0;
      console.log(`📊 Current question count for ${skill}/${domain}: ${currentCount}`);
      console.log(`📊 Added ${addedCount} new questions to ${skill}/${domain}`);
      
      // Log the update for tracking purposes
      console.log(`✅ Question count updated: ${skill}/${domain} now has ${currentCount} questions`);
      
    } catch (error) {
      console.error('❌ Error updating question counts:', error);
    }
  }

  /**
   * Verify that questions were actually stored in the database
   */
  private async verifyQuestionsStored(storedQuestions: any[], skill: string, domain: string): Promise<void> {
    try {
      console.log('🔍 Verifying questions were stored in database...');
      
      if (storedQuestions.length === 0) {
        console.log('⚠️ No questions to verify');
        return;
      }

      // Check if we can retrieve the stored questions
      const { data: verifyData, error: verifyError } = await supabase
        .from('question_bank')
        .select('id, question_text, skill, domain')
        .eq('skill', skill)
        .eq('domain', domain)
        .eq('assessment', 'SAT')
        .order('id', { ascending: false })
        .limit(storedQuestions.length);

      if (verifyError) {
        console.error('❌ Error verifying stored questions:', verifyError);
        return;
      }

      const verifiedCount = verifyData?.length || 0;
      console.log(`✅ Verification complete: Found ${verifiedCount} questions for ${skill}/${domain}`);
      
      if (verifiedCount >= storedQuestions.length) {
        console.log('✅ All generated questions successfully stored and verified');
      } else {
        console.warn(`⚠️ Expected ${storedQuestions.length} questions, but found ${verifiedCount} in database`);
      }
      
    } catch (error) {
      console.error('❌ Error during question verification:', error);
    }
  }

  /**
   * Get current question count for a skill/domain combination
   */
  async getQuestionCount(skill: string, domain: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('id', { count: 'exact', head: true })
        .eq('skill', skill)
        .eq('domain', domain)
        .eq('assessment', 'SAT');

      if (error) {
        console.error('❌ Error getting question count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('❌ Error getting question count:', error);
      return 0;
    }
  }

  /**
   * Clear cache (useful for testing or when you want fresh questions)
   */
  clearCache(): void {
    this.generationCache.clear();
    this.cacheExpiry.clear();
  }

  private generateMathFallbackQuestions(
    skill: string,
    domain: string,
    count: number,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  ): DatabaseQuestion[] {
    const questions: DatabaseQuestion[] = [];

    for (let i = 0; i < count; i++) {
      if (skill === 'Systems of two linear equations in two variables') {
        questions.push(this.createSystemsOfEquationsQuestion(skill, domain));
        continue;
      }

      try {
        const desiredDifficulty =
          difficulty === 'mixed' ? 'easy' : (difficulty as 'easy' | 'medium' | 'hard');
        const generated = generateMathQuestion(undefined, desiredDifficulty);
        questions.push(
          this.convertGeneratedMathQuestion(generated, skill || generated.metadata.skill, domain || generated.metadata.domain, desiredDifficulty)
        );
      } catch (error) {
        console.error('Failed to generate math question via template engine:', error);
      }
    }

    return questions;
  }

  private convertGeneratedMathQuestion(
    question: GeneratedMathQuestion,
    skill: string,
    domain: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ): DatabaseQuestion {
    const id = this.createTemporaryQuestionId();
    const options = question.options || [];

    const letterFromIndex = (index: number) => ['A', 'B', 'C', 'D'][index] || 'A';
    const correctLetter = letterFromIndex(question.correctAnswer ?? 0);

    return {
      id,
      question_text: question.question,
      option_a: options[0] ?? '',
      option_b: options[1] ?? '',
      option_c: options[2] ?? '',
      option_d: options[3] ?? '',
      correct_answer: correctLetter,
      correct_rationale: question.explanation || '',
      incorrect_rationale_a: question.rationales?.incorrect?.A || '',
      incorrect_rationale_b: question.rationales?.incorrect?.B || '',
      incorrect_rationale_c: question.rationales?.incorrect?.C || '',
      incorrect_rationale_d: question.rationales?.incorrect?.D || '',
      skill,
      domain,
      difficulty,
      assessment: 'SAT',
      test: 'Math',
      section: 'Math',
      question_type: 'multiple-choice',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      question_prompt: question.question,
      image: null,
      metadata: {
        source: 'math-template-engine',
        templateId: question.metadata?.templateId
      }
    };
  }

  private createSystemsOfEquationsQuestion(skill: string, domain: string): DatabaseQuestion {
    const randInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    let a1 = randInt(1, 6);
    let b1 = randInt(1, 6);
    let a2 = randInt(1, 6);
    let b2 = randInt(1, 6);

    // Ensure system has a unique solution
    while (a1 * b2 - a2 * b1 === 0) {
      a2 = randInt(1, 6);
      b2 = randInt(1, 6);
    }

    let xSolution = randInt(1, 10);
    let ySolution = randInt(1, 10);

    while (xSolution === ySolution) {
      ySolution = randInt(1, 10);
    }

    const c1 = a1 * xSolution + b1 * ySolution;
    const c2 = a2 * xSolution + b2 * ySolution;

    const askForX = Math.random() < 0.5;
    const targetVariable = askForX ? 'x' : 'y';
    const correctValue = askForX ? xSolution : ySolution;
    const swappedValue = askForX ? ySolution : xSolution;
    const sumValue = xSolution + ySolution;
    let offByOne = correctValue + 1;
    if (offByOne === swappedValue) {
      offByOne = correctValue - 1;
    }
    if (offByOne <= 0 || offByOne === swappedValue || offByOne === sumValue) {
      offByOne = correctValue + 2;
    }

    const id = this.createTemporaryQuestionId();

    const questionText =
      `Solve the system of equations below:\n\n` +
      `${a1}x + ${b1}y = ${c1}\n` +
      `${a2}x + ${b2}y = ${c2}\n\n` +
      `What is the value of ${targetVariable}?`;

    const options = [
      correctValue.toString(),
      swappedValue.toString(),
      sumValue.toString(),
      offByOne.toString()
    ];

    const correctRationale =
      `Substituting the solution (${xSolution}, ${ySolution}) into the system shows that ` +
      `${a1}(${xSolution}) + ${b1}(${ySolution}) = ${c1} and ${a2}(${xSolution}) + ${b2}(${ySolution}) = ${c2}. ` +
      `Therefore, ${targetVariable} = ${correctValue}.`;

    return {
      id,
      question_text: questionText,
      option_a: options[0],
      option_b: options[1],
      option_c: options[2],
      option_d: options[3],
      correct_answer: 'A',
      correct_rationale: correctRationale,
      incorrect_rationale_a: correctRationale,
      incorrect_rationale_a: '',
      incorrect_rationale_b: `This swaps the roles of x and y, giving the value ${swappedValue}.`,
      incorrect_rationale_c: `This adds x and y, yielding ${sumValue}, instead of solving the system.`,
      incorrect_rationale_d: `This value is off by one from the correct solution, which can happen if a sign error occurs during elimination.`,
      skill,
      domain,
      difficulty: 'easy',
      assessment: 'SAT',
      test: 'Math',
      section: 'Math',
      question_type: 'multiple-choice',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      question_prompt: questionText,
      image: null,
      metadata: {
        source: 'math-template-engine',
        templateId: 'algebra-systems-two-linear-equations-easy'
      }
    };
  }

  private createTemporaryQuestionId(): string {
    return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  }
}

export const infiniteQuestionService = new InfiniteQuestionService();
