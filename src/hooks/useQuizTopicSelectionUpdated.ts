import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '../types/common';
import { infiniteQuestionService } from '../services/infiniteQuestionService';

export const useQuizTopicSelection = (subject: Subject, topics: any[]) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [feedbackPreference, setFeedbackPreference] = useState<'immediate' | 'end'>('immediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuestionCount(value);
    }
  };

  const loadQuizQuestions = async () => {
    console.log('=== INFINITE QUIZ GENERATION DEBUG ===');
    console.log('Subject:', subject);
    console.log('Selected topics:', selectedTopics);
    console.log('Available topics:', topics);
    console.log('Question count requested:', questionCount);
    
    setLoading(true);
    setError(null);
    try {
      // Handle wrong questions selection (special case)
      if (selectedTopics.includes('wrong-questions')) {
        console.log('Wrong questions selected - will load from user mistakes');
        return [];
      }

      // Get selected topic details
      const selectedTopicObjects = topics.filter(topic => selectedTopics.includes(topic.id));
      console.log('Selected topic objects:', selectedTopicObjects);

      if (selectedTopicObjects.length === 0) {
        console.log('❌ No topics selected');
        setError('Please select at least one topic');
        return [];
      }

      // For now, use the first selected topic for infinite generation
      // In the future, we could generate questions for multiple topics
      const primaryTopic = selectedTopicObjects[0];
      console.log('Primary topic for generation:', primaryTopic);

      // Use infinite question service
      console.log('🚀 Using infinite question service...');
      const response = await infiniteQuestionService.getQuestions({
        subject: subject,
        skill: primaryTopic.skill,
        domain: primaryTopic.domain,
        difficulty: 'easy', // Default to easy, could be made configurable
        count: questionCount,
        useAI: true // Enable AI generation
      });

      console.log(`📊 Infinite service returned ${response.questions.length} questions`);
      console.log(`🤖 AI was used: ${response.aiUsed}`);

      if (response.questions.length === 0) {
        console.log('❌ No questions generated');
        setError('No questions could be generated for the selected topic');
        return [];
      }

      // Log sample questions for debugging
      console.log('📋 Sample generated questions:');
      response.questions.slice(0, 3).forEach((q, index) => {
        console.log(`Question ${index + 1}:`, {
          id: q.id,
          skill: q.skill,
          difficulty: q.difficulty,
          domain: q.domain,
          has_prompt: !!q.question_prompt,
          is_ai_generated: q.metadata?.source === 'gemini-ai',
          prompt_preview: q.question_prompt ? q.question_prompt.substring(0, 100) + '...' : 'NO PROMPT'
        });
      });

      // Format questions for the quiz component
      const formattedQuestions = response.questions.map((question, index) => {
        const formatted = {
          id: question.id,
          question_text: question.question_text,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d,
          correct_answer: question.correct_answer,
          correct_rationale: question.correct_rationale,
          incorrect_rationale_a: question.incorrect_rationale_a,
          incorrect_rationale_b: question.incorrect_rationale_b,
          incorrect_rationale_c: question.incorrect_rationale_c,
          incorrect_rationale_d: question.incorrect_rationale_d,
          skill: question.skill,
          difficulty: question.difficulty,
          domain: question.domain,
          test: question.test || (subject === 'math' ? 'Math' : 'Reading and Writing'),
          assessment: question.assessment || 'SAT',
          question_prompt: question.question_prompt,
          image: question.image,
          metadata: question.metadata
        };
        
        console.log(`✅ FORMATTED Question ${index + 1}:`, {
          id: formatted.id,
          skill: formatted.skill,
          difficulty: formatted.difficulty,
          is_ai_generated: formatted.metadata?.source === 'gemini-ai',
          has_prompt: !!formatted.question_prompt
        });
        
        return formatted;
      });

      console.log('=== INFINITE QUIZ GENERATION COMPLETE ===');
      console.log(`🎉 Successfully generated ${formattedQuestions.length} questions`);
      console.log(`🤖 AI was used: ${response.aiUsed}`);
      
      return formattedQuestions;
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      setError('Error loading questions: ' + (error as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedTopics,
    questionCount,
    feedbackPreference,
    loading,
    error,
    setFeedbackPreference,
    handleTopicToggle,
    handleQuestionCountChange,
    loadQuizQuestions
  };
};

