import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '../types/common';

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
        
        // Let's check what's actually in the database
        const { data: debugQuestions, error: debugError } = await supabase
          .from('question_bank')
          .select('assessment, test, skill, question_prompt, count(*)')
          .eq('assessment', 'SAT')
          .eq('test', testFilter)
          .not('question_text', 'is', null);
          
        console.log('Debug query for available questions:', debugQuestions);
        console.log('Debug query error:', debugError);
        
        alert('No questions available for the selected criteria. Please try selecting different topics or check if questions exist in the database.');
        return [];
      }

      // 🔍 DEBUG: Check question_prompt data before shuffling
      console.log('=== QUESTION_PROMPT DEBUG ===');
      const questionsWithPrompts = questions.filter(q => q.question_prompt && q.question_prompt.trim());
      console.log(`Questions with question_prompt: ${questionsWithPrompts.length} out of ${questions.length}`);
      console.log('Sample questions with prompts:', questionsWithPrompts.slice(0, 3).map(q => ({
        id: q.id,
        question_prompt: q.question_prompt,
        question_text: q.question_text?.substring(0, 50) + '...'
      })));

      const shuffled = questions.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, questionCount);

      console.log(`Successfully loaded ${selectedQuestions.length} questions`);
      console.log('Sample question skills:', selectedQuestions.slice(0, 3).map(q => q.skill));
      
      // 🔍 DEBUG: Check selected questions for prompts
      const selectedWithPrompts = selectedQuestions.filter(q => q.question_prompt && q.question_prompt.trim());
      console.log(`Selected questions with prompts: ${selectedWithPrompts.length} out of ${selectedQuestions.length}`);
      
      const formattedQuestions = selectedQuestions.map(q => {
        const formatted = {
          id: q.id.toString(),
          content: q.question_text, // 🔧 IMPORTANT: Change this to match your interface
          question: q.question_text, // Keep both for compatibility
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
        
        // 🔍 DEBUG: Log each question's prompt mapping
        if (q.question_prompt) {
          console.log(`Question ${q.id} - Raw prompt:`, q.question_prompt);
          console.log(`Question ${q.id} - Formatted prompt:`, formatted.question_prompt);
        }
        
        return formatted;
      });

      console.log('=== QUIZ GENERATION COMPLETE ===');
      
      // 🔍 FINAL DEBUG: Verify formatted questions have prompts
      const finalWithPrompts = formattedQuestions.filter(q => q.question_prompt && q.question_prompt.trim());
      console.log(`Final formatted questions with prompts: ${finalWithPrompts.length} out of ${formattedQuestions.length}`);
      
      if (finalWithPrompts.length > 0) {
        console.log('✅ SUCCESS: Questions with prompts found:', finalWithPrompts.map(q => ({
          id: q.id,
          hasPrompt: !!q.question_prompt,
          promptLength: q.question_prompt?.length || 0,
          promptPreview: q.question_prompt?.substring(0, 100) + '...'
        })));
      } else {
        console.log('❌ WARNING: No questions with prompts in final result');
      }
      
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