// @ts-nocheck
// Utility functions for testing question generation in browser console

import { geminiQuestionService } from '../services/geminiQuestionService';
import { infiniteQuestionService } from '../services/infiniteQuestionService';

// Make these available globally for console testing
declare global {
  interface Window {
    testQuestionGeneration: () => Promise<void>;
    testDirectGemini: () => Promise<void>;
    testInfiniteService: () => Promise<void>;
    validateQuestion: (question: any) => void;
  }
}

export const setupConsoleTests = () => {
  // Test direct Gemini API
  window.testDirectGemini = async () => {
    console.log('🧪 Testing Direct Gemini API...');
    try {
      const questions = await geminiQuestionService.generateTopicQuestions(
        'Comprehension',
        'Information and Ideas',
        'easy',
        1
      );
      
      console.log('✅ Success! Generated question:', questions[0]);
      validateQuestion(questions[0]);
    } catch (error) {
      console.error('❌ Failed:', error);
    }
  };

  // Test infinite question service
  window.testInfiniteService = async () => {
    console.log('🧪 Testing Infinite Question Service...');
    try {
      const response = await infiniteQuestionService.getInfiniteQuestions({
        subject: 'english',
        skill: 'Comprehension',
        domain: 'Information and Ideas',
        difficulty: 'easy',
        count: 2,
        useAI: true
      });
      
      console.log('✅ Success! Response:', response);
      response.questions.forEach((q, i) => {
        console.log(`Question ${i + 1}:`, q);
        validateQuestion(q);
      });
    } catch (error) {
      console.error('❌ Failed:', error);
    }
  };

  // Test API connection
  window.testQuestionGeneration = async () => {
    console.log('🧪 Testing Question Generation System...');
    
    try {
      // Test 1: API Connection
      console.log('1️⃣ Testing API connection...');
      const isConnected = await geminiQuestionService.testConnection();
      console.log(isConnected ? '✅ API Connected' : '❌ API Failed');
      
      if (!isConnected) {
        console.error('❌ Cannot proceed - API connection failed');
        return;
      }

      // Test 2: Direct Generation
      console.log('2️⃣ Testing direct generation...');
      await window.testDirectGemini();
      
      // Test 3: Infinite Service
      console.log('3️⃣ Testing infinite service...');
      await window.testInfiniteService();
      
      console.log('🎉 All tests completed!');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  };

  // Simple API test
  window.testGeminiAPI = async () => {
    console.log('🧪 Testing Gemini API directly...');
    try {
      const isConnected = await geminiQuestionService.testConnection();
      console.log(isConnected ? '✅ API Working' : '❌ API Failed');
    } catch (error) {
      console.error('❌ API Test Error:', error);
    }
  };

  // Test environment variables
  window.testEnv = () => {
    console.log('🔍 Environment Variables Test:');
    console.log('VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ Found' : '❌ Missing');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Found' : '❌ Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing');
    
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      console.log('API Key Preview:', import.meta.env.VITE_GEMINI_API_KEY.substring(0, 10) + '...');
    }
  };

  // Validate a single question
  window.validateQuestion = (question: any) => {
    console.log('🔍 Validating question...');
    
    const checks = {
      hasPassage: !!(question.passage || question.question_prompt),
      hasQuestion: !!(question.question || question.question_text),
      hasOptions: !!(question.options || (question.option_a && question.option_b && question.option_c && question.option_d)),
      hasCorrectAnswer: !!(question.correct_answer && ['A', 'B', 'C', 'D'].includes(question.correct_answer)),
      hasCorrectRationale: !!(question.rationales?.correct || question.correct_rationale),
      hasIncorrectRationales: !!(question.rationales?.A || question.incorrect_rationale_a)
    };

    const passed = Object.values(checks).every(Boolean);
    
    console.log('Validation Results:', checks);
    console.log(passed ? '✅ Question is valid' : '❌ Question has issues');
    
    if (!passed) {
      const failed = Object.entries(checks).filter(([_, passed]) => !passed);
      console.log('Failed checks:', failed.map(([check]) => check));
    }

    return passed;
  };

  console.log('🚀 Question generation test utilities loaded!');
  console.log('Available commands:');
  console.log('- testQuestionGeneration() - Run full test suite');
  console.log('- testDirectGemini() - Test direct Gemini API');
  console.log('- testInfiniteService() - Test infinite question service');
  console.log('- testGeminiAPI() - Simple API connection test');
  console.log('- testEnv() - Test environment variables');
  console.log('- validateQuestion(question) - Validate a question object');
};

// Auto-setup when imported
setupConsoleTests();
