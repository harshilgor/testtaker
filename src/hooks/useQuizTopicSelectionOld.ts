import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '../types/common';
import { infiniteQuestionService } from '../services/infiniteQuestionService';

export const useQuizTopicSelection = (subject: Subject, topics: any[]) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [feedbackPreference, setFeedbackPreference] = useState<'immediate' | 'end'>('immediate');
  const [loading, setLoading] = useState(false);

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 100) {
      setQuestionCount(value);
    }
  };

  const loadQuizQuestions = async () => {
    console.log('=== QUIZ GENERATION DEBUG ===');
    console.log('Subject:', subject);
    console.log('Selected topics:', selectedTopics);
    console.log('Available topics:', topics);
    console.log('Question count requested:', questionCount);
    
    setLoading(true);
    try {
      // Map subject to database test field
      const testFilter = subject === 'math' ? 'Math' : 'Reading and Writing';
      console.log('Test filter:', testFilter);
      
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

      console.log('Base query filters - assessment: SAT, test:', testFilter);

      // Handle topic filtering - if topics are selected, filter by skill
      if (selectedTopics.length > 0 && !selectedTopics.includes('wrong-questions')) {
        console.log('Processing selected topics for skill filtering...');
        
        // Map selected topic IDs to actual skill names from the topics array
        const selectedSkills: string[] = [];
        
        selectedTopics.forEach(topicId => {
          console.log('Processing topic ID:', topicId);
          
          if (topicId.includes('domain-')) {
            // This is a domain selection, get all skills for this domain
            const domainName = topicId.replace('domain-', '');
            console.log('Domain selection detected:', domainName);
            
            const domainSkills = topics
              .filter(topic => topic.domain === domainName)
              .map(topic => topic.skill);
            
            console.log('Skills found for domain', domainName, ':', domainSkills);
            selectedSkills.push(...domainSkills);
          } else {
            // This is a specific skill selection
            const topic = topics.find(t => t.id === topicId);
            if (topic?.skill) {
              console.log('Skill selection found:', topic.skill);
              selectedSkills.push(topic.skill);
            } else {
              console.log('Topic not found or missing skill for ID:', topicId);
            }
          }
        });
        
        // Remove duplicates
        const uniqueSkills = [...new Set(selectedSkills)];
        console.log('Final unique skills for filtering:', uniqueSkills);
        
        if (uniqueSkills.length > 0) {
          query = query.in('skill', uniqueSkills);
          console.log('Applied skill filter with skills:', uniqueSkills);
        } else {
          console.log('WARNING: No valid skills found for selected topics!');
        }
      } else {
        console.log('No topic filtering applied (no topics selected or wrong-questions selected)');
      }

      const { data: questions, error } = await query
        .order('id')
        .limit(questionCount * 3); // Get more questions to ensure variety

      console.log('Query executed, error:', error);
      console.log('Questions returned:', questions?.length || 0);

      if (error) {
        console.error('Database query error:', error);
        alert('Error loading questions: ' + error.message);
        return [];
      }

      if (!questions || questions.length === 0) {
        console.log('=== NO QUESTIONS FOUND DEBUG ===');
        alert('No questions available for the selected criteria. Please try selecting different topics or check if questions exist in the database.');
        return [];
      }

      // 🔍 DETAILED DEBUG: Check question_prompt data
      console.log('=== QUESTION_PROMPT ANALYSIS ===');
      console.log('Total questions fetched:', questions.length);
      
      // Check each question's prompt status
      questions.forEach((q, index) => {
        const promptStatus = !q.question_prompt ? 'NULL/UNDEFINED' : 
                           q.question_prompt.trim() === '' ? 'EMPTY STRING' : 
                           'HAS DATA';
        console.log(`Question ${q.id} (index ${index}):`, {
          prompt_status: promptStatus,
          prompt_length: q.question_prompt?.length || 0,
          prompt_preview: q.question_prompt ? q.question_prompt.substring(0, 50) + '...' : 'NO PROMPT',
          skill: q.skill
        });
      });

      const questionsWithPrompts = questions.filter(q => q.question_prompt && q.question_prompt.trim());
      console.log(`📊 SUMMARY: ${questionsWithPrompts.length} out of ${questions.length} questions have prompts`);

      const shuffled = questions.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, questionCount);

      console.log(`Successfully loaded ${selectedQuestions.length} questions`);
      console.log('Sample question skills:', selectedQuestions.slice(0, 3).map(q => q.skill));
      
      // 🔍 DEBUG: Check selected questions for prompts
      console.log('=== SELECTED QUESTIONS PROMPT CHECK ===');
      selectedQuestions.forEach((q, index) => {
        console.log(`Selected Question ${index + 1} (ID: ${q.id}):`, {
          has_prompt: !!q.question_prompt,
          prompt: q.question_prompt || 'NO PROMPT'
        });
      });
      
      const formattedQuestions = selectedQuestions.map((q, index) => {
        console.log(`🔄 FORMATTING Question ${index + 1} (ID: ${q.id}):`, {
          raw_prompt: q.question_prompt,
          prompt_will_be_mapped: !!q.question_prompt
        });

        const formatted = {
          id: q.id.toString(),
          content: q.question_text,
          question: q.question_text,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctAnswer: q.correct_answer === 'A' ? 0 : 
                        q.correct_answer === 'B' ? 1 :
                        q.correct_answer === 'C' ? 2 : 3,
          explanation: q.correct_rationale,
          section: subject === 'math' ? 'math' : 'reading-writing',
          topic: q.skill || 'general',
          difficulty: q.difficulty || 'medium',
          imageUrl: q.image ? `https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${q.id}.png` : undefined,
          hasImage: q.image || false,
          // ✅ CRITICAL: Map all the rationale fields
          question_prompt: q.question_prompt,
          incorrect_rationale_a: q.incorrect_rationale_a,
          incorrect_rationale_b: q.incorrect_rationale_b,
          incorrect_rationale_c: q.incorrect_rationale_c,
          incorrect_rationale_d: q.incorrect_rationale_d
        };
        
        console.log(`✅ FORMATTED Question ${index + 1}:`, {
          id: formatted.id,
          has_prompt_in_formatted: !!formatted.question_prompt,
          formatted_prompt: formatted.question_prompt || 'NO PROMPT MAPPED'
        });
        
        return formatted;
      });

      console.log('=== FINAL VERIFICATION ===');
      const finalWithPrompts = formattedQuestions.filter(q => q.question_prompt && q.question_prompt.trim());
      console.log(`📋 FINAL RESULT: ${finalWithPrompts.length} out of ${formattedQuestions.length} formatted questions have prompts`);
      
      if (finalWithPrompts.length > 0) {
        console.log('✅ Questions with prompts in final result:', finalWithPrompts.map(q => ({
          id: q.id,
          prompt: q.question_prompt
        })));
      } else {
        console.log('❌ NO QUESTIONS WITH PROMPTS IN FINAL RESULT');
        console.log('🔍 This means either:');
        console.log('   1. Your database questions don\'t have question_prompt data');
        console.log('   2. The selected questions happened to not have prompts');
        console.log('   3. There\'s a mapping issue (less likely)');
      }
      
      console.log('=== QUIZ GENERATION COMPLETE ===');
      return formattedQuestions;
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      alert('Error loading questions: ' + (error as Error).message);
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
    setFeedbackPreference,
    handleTopicToggle,
    handleQuestionCountChange,
    loadQuizQuestions
  };
};