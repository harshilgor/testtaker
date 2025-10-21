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
  
  // Difficulty selection state
  const [difficultyCounts, setDifficultyCounts] = useState({
    easy: 0,
    medium: 0,
    hard: 0
  });
  const [useDifficultySelection, setUseDifficultySelection] = useState(false);

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

  const handleDifficultyCountChange = (difficulty: 'easy' | 'medium' | 'hard', value: number) => {
    setDifficultyCounts(prev => ({
      ...prev,
      [difficulty]: Math.max(0, value)
    }));
  };

  const toggleDifficultySelection = () => {
    setUseDifficultySelection(!useDifficultySelection);
    if (!useDifficultySelection) {
      // When enabling difficulty selection, distribute current question count
      const total = questionCount;
      const easyCount = Math.floor(total * 0.4);
      const mediumCount = Math.floor(total * 0.4);
      const hardCount = total - easyCount - mediumCount;
      
      setDifficultyCounts({
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount
      });
    }
  };

  const getTotalQuestions = () => {
    if (useDifficultySelection) {
      return difficultyCounts.easy + difficultyCounts.medium + difficultyCounts.hard;
    }
    return questionCount;
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

      // Generate questions based on difficulty selection
      let allQuestions: any[] = [];
      
      if (useDifficultySelection) {
        console.log('🎯 Using difficulty selection mode');
        console.log('Difficulty counts:', difficultyCounts);
        
        // Generate questions for each difficulty level
        for (const [difficulty, count] of Object.entries(difficultyCounts)) {
          if (count > 0) {
            console.log(`📊 Generating ${count} ${difficulty} questions...`);
            
            const response = await infiniteQuestionService.getInfiniteQuestions({
              subject: subject,
              skill: primaryTopic.skill,
              domain: primaryTopic.domain,
              difficulty: difficulty as 'easy' | 'medium' | 'hard',
              count: count,
              useAI: true
            });
            
            console.log(`✅ Generated ${response.questions.length} ${difficulty} questions`);
            allQuestions.push(...response.questions);
          }
        }
      } else {
        // Use simple mixed difficulty generation
        console.log('🚀 Using simple mixed difficulty mode...');
        const response = await infiniteQuestionService.getInfiniteQuestions({
          subject: subject,
          skill: primaryTopic.skill,
          domain: primaryTopic.domain,
          difficulty: 'mixed',
          count: questionCount,
          useAI: true
        });
        
        allQuestions = response.questions;
      }

      console.log(`📊 Total questions generated: ${allQuestions.length}`);
      console.log(`📊 Requested count: ${useDifficultySelection ? getTotalQuestions() : questionCount}, Received count: ${allQuestions.length}`);

      if (allQuestions.length === 0) {
        console.log('❌ No questions generated');
        setError('No questions could be generated for the selected topic. Please try a different topic or check your internet connection.');
        return [];
      }

      // Log sample questions for debugging
      console.log('📋 Sample generated questions:');
      allQuestions.slice(0, 3).forEach((q, index) => {
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
      const formattedQuestions = allQuestions.map((question, index) => {
        const formatted = {
          id: question.id,
          // For Reading and Writing questions, question_text is the passage, question_prompt is the question
          content: question.question_text, // This is the passage text
          question: question.question_prompt, // This is the actual question
          question_text: question.question_text,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d,
          // Create options array for QuizAnswerPanel compatibility
          options: [
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d
          ],
          correct_answer: question.correct_answer,
          correctAnswer: question.correct_answer === 'A' ? 0 : question.correct_answer === 'B' ? 1 : question.correct_answer === 'C' ? 2 : 3,
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
      console.log(`📊 Final question count: ${formattedQuestions.length} (requested: ${useDifficultySelection ? getTotalQuestions() : questionCount})`);
      
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
    loadQuizQuestions,
    // Difficulty selection
    difficultyCounts,
    useDifficultySelection,
    handleDifficultyCountChange,
    toggleDifficultySelection,
    getTotalQuestions
  };
};
