
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play, AlertCircle } from 'lucide-react';
import { Subject } from '../pages/Index';
import QuizView from './QuizView';
import { useQuestionTopics } from '../hooks/useQuestionTopics';
import QuizFeedbackPreference from './Quiz/QuizFeedbackPreference';
import { supabase } from '@/integrations/supabase/client';

interface QuizTopicSelectionProps {
  subject: Subject;
  userName: string;
  onBack: () => void;
  onBackToDashboard: () => void;
}

const wrongQuestionsTopics = [
  { id: 'wrong-questions', name: 'Questions I Got Wrong', description: 'Practice questions you previously answered incorrectly', count: 0 },
];

const QuizTopicSelection: React.FC<QuizTopicSelectionProps> = ({
  subject,
  userName,
  onBack,
  onBackToDashboard
}) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [feedbackPreference, setFeedbackPreference] = useState<'immediate' | 'end'>('immediate');
  const [startQuiz, setStartQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { mathTopics, englishTopics, loading: topicsLoading, error } = useQuestionTopics();

  const topics = subject === 'math' ? mathTopics : englishTopics;
  const allTopics = [...topics, ...wrongQuestionsTopics];

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const loadQuizQuestions = async () => {
    console.log('Loading quiz questions...');
    setLoading(true);
    try {
      const sectionFilter = subject === 'math' ? 'math' : 'reading-writing';
      console.log('Section filter:', sectionFilter);
      console.log('Selected topics:', selectedTopics);
      console.log('Question count requested:', questionCount);
      
      // If specific topics are selected, filter by skills
      let query = supabase
        .from('question_bank')
        .select('*')
        .eq('section', sectionFilter)
        .not('question_text', 'is', null);

      // If topics are selected and not "wrong-questions", filter by skills
      if (selectedTopics.length > 0 && !selectedTopics.includes('wrong-questions')) {
        const selectedSkills = selectedTopics.map(topicId => {
          const topic = topics.find(t => t.id === topicId);
          return topic?.skill;
        }).filter(Boolean);
        
        if (selectedSkills.length > 0) {
          query = query.in('skill', selectedSkills);
        }
      }

      const { data: questions, error } = await query
        .order('id')
        .limit(questionCount * 2); // Get more questions to randomize

      if (error) {
        console.error('Error loading questions:', error);
        alert('Error loading questions: ' + error.message);
        return [];
      }

      if (!questions || questions.length === 0) {
        console.log('No questions found for criteria');
        alert('No questions available for the selected criteria.');
        return [];
      }

      // Shuffle and take requested number
      const shuffled = questions.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, questionCount);

      console.log(`Loaded ${selectedQuestions.length} questions`);
      
      // Convert to quiz format
      const formattedQuestions = selectedQuestions.map(q => ({
        id: parseInt(q.id),
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

  const handleStartQuiz = async () => {
    if (selectedTopics.length > 0 && questionCount > 0) {
      const questions = await loadQuizQuestions();
      if (questions.length > 0) {
        setQuizQuestions(questions);
        setStartQuiz(true);
      }
    } else {
      alert('Please select at least one topic and specify the number of questions.');
    }
  };

  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 100) {
      setQuestionCount(value);
    }
  };

  if (startQuiz && quizQuestions.length > 0) {
    return (
      <QuizView
        questions={quizQuestions}
        onBack={() => setStartQuiz(false)}
        subject={subject}
        topics={selectedTopics}
        userName={userName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {subject === 'math' ? 'Math' : 'English'} Quiz Setup
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          {(topicsLoading || loading) && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {loading ? 'Loading questions...' : 'Loading available topics...'}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Unable to load topics from database</p>
                <p className="text-yellow-700 text-sm mt-1">Using default topic list. Error: {error}</p>
              </div>
            </div>
          )}

          {!topicsLoading && !loading && (
            <>
              <QuizFeedbackPreference
                feedbackPreference={feedbackPreference}
                onPreferenceChange={setFeedbackPreference}
              />

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Topics</h2>
                <div className="grid gap-4">
                  {allTopics.map(topic => (
                    <div key={topic.id} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <Checkbox
                        id={topic.id}
                        checked={selectedTopics.includes(topic.id)}
                        onCheckedChange={() => handleTopicToggle(topic.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={topic.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                          {topic.name} ({topic.count} questions)
                        </label>
                        <p className="text-xs text-gray-600 mt-1">{topic.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {topics.length === 0 && !topicsLoading && (
                  <p className="text-gray-500 text-center py-4">No topics available for {subject}</p>
                )}
              </div>

              <div className="mb-8">
                <label htmlFor="questionCount" className="block text-lg font-semibold text-gray-900 mb-4">
                  Number of Questions
                </label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max="100"
                  value={questionCount}
                  onChange={handleQuestionCountChange}
                  placeholder="Enter number of questions (1-100)"
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-2">Enter any number between 1 and 100</p>
              </div>

              <Button
                onClick={handleStartQuiz}
                disabled={selectedTopics.length === 0 || questionCount <= 0 || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Quiz ({selectedTopics.length} topics, {questionCount} questions)
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTopicSelection;
