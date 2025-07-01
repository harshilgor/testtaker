
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '../pages/Index';

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
    console.log('Loading quiz questions...');
    setLoading(true);
    try {
      // Map subject to database section field (assessment column)
      const sectionFilter = subject === 'math' ? 'Math' : 'Reading and Writing';
      console.log('Section filter:', sectionFilter);
      console.log('Selected topics:', selectedTopics);
      console.log('Question count requested:', questionCount);
      
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
        .eq('assessment', sectionFilter)
        .not('question_text', 'is', null);

      // Handle topic filtering - if topics are selected, filter by skill
      if (selectedTopics.length > 0 && !selectedTopics.includes('wrong-questions')) {
        // Map selected topic IDs to actual skill names from the topics array
        const selectedSkills = selectedTopics.map(topicId => {
          if (topicId.includes('domain-')) {
            // This is a domain selection, get all skills for this domain
            const domainName = topicId.replace('domain-', '');
            return topics
              .filter(topic => topic.domain === domainName)
              .map(topic => topic.skill);
          } else {
            // This is a specific skill selection
            const topic = topics.find(t => t.id === topicId);
            return topic?.skill;
          }
        }).flat().filter(Boolean);
        
        console.log('Mapped skills for filtering:', selectedSkills);
        
        if (selectedSkills.length > 0) {
          query = query.in('skill', selectedSkills);
        }
      }

      const { data: questions, error } = await query
        .order('id')
        .limit(questionCount * 3); // Get more questions to ensure variety

      if (error) {
        console.error('Error loading questions:', error);
        alert('Error loading questions: ' + error.message);
        return [];
      }

      if (!questions || questions.length === 0) {
        console.log('No questions found for criteria');
        alert('No questions available for the selected criteria. Please try selecting different topics or check if questions exist in the database.');
        return [];
      }

      const shuffled = questions.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, questionCount);

      console.log(`Loaded ${selectedQuestions.length} questions`);
      
      const formattedQuestions = selectedQuestions.map(q => ({
        id: q.id.toString(),
        question: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctAnswer: q.correct_answer === 'A' ? 0 : 
                      q.correct_answer === 'B' ? 1 :
                      q.correct_answer === 'C' ? 2 : 3,
        explanation: q.correct_rationale,
        subject: subject,
        topic: q.skill || 'general',
        difficulty: q.difficulty || 'medium',
        imageUrl: q.image ? `https://kpcprhkubqhslazlhgad.supabase.co/storage/v1/object/public/question-images/${q.id}.png` : undefined,
        hasImage: q.image || false
      }));

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
