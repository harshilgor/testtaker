import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, AlertCircle } from 'lucide-react';
import { Subject } from '../types/common';
import QuizView from './QuizView';
import { useQuestionTopics } from '../hooks/useQuestionTopics';
import { useQuizTopicSelection } from '../hooks/useQuizTopicSelection';
import DomainTopicSelector from './Quiz/DomainTopicSelector';
import QuizSettings from './Quiz/QuizSettings';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface QuizTopicSelectionProps {
  subject: Subject;
  userName: string;
  onBack: () => void;
  onBackToDashboard: () => void;
}

const QuizTopicSelection: React.FC<QuizTopicSelectionProps> = ({
  subject,
  userName,
  onBack,
  onBackToDashboard
}) => {
  const { isMobile } = useResponsiveLayout();
  const [startQuiz, setStartQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  
  const { mathTopics, englishTopics, loading: topicsLoading, error } = useQuestionTopics();
  const topics = subject === 'math' ? mathTopics : englishTopics;
  
  const {
    selectedTopics,
    questionCount,
    feedbackPreference,
    loading,
    setFeedbackPreference,
    handleTopicToggle,
    handleQuestionCountChange,
    loadQuizQuestions
  } = useQuizTopicSelection(subject, topics);

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

  if (startQuiz && quizQuestions.length > 0) {
    return (
      <QuizView
        questions={quizQuestions}
        selectedTopics={selectedTopics}
        feedbackPreference={feedbackPreference}
        onBack={() => setStartQuiz(false)}
        subject={subject}
        topics={selectedTopics}
        userName={userName}
      />
    );
  }

  const isStartDisabled = selectedTopics.length === 0 || questionCount <= 0 || loading;
  const selectedTopicsCount = selectedTopics.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button onClick={onBack} variant="outline" className="flex items-center mr-4">
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
                <p className="text-yellow-700 text-sm mt-1">Using fallback topic list. Error: {error}</p>
              </div>
            </div>
          )}

          {!topicsLoading && !loading && (
            <>
              <QuizSettings
                questionCount={questionCount}
                feedbackPreference={feedbackPreference}
                onQuestionCountChange={handleQuestionCountChange}
                onFeedbackPreferenceChange={setFeedbackPreference}
              />

              <DomainTopicSelector
                topics={topics}
                selectedTopics={selectedTopics}
                onTopicToggle={handleTopicToggle}
                subject={subject}
                loading={topicsLoading}
              />

              {selectedTopics.length === 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-center">Please select at least one topic to continue.</p>
                </div>
              )}

              <Button
                onClick={handleStartQuiz}
                disabled={isStartDisabled}
                className={`w-full py-3 text-center ${isMobile ? 'text-sm' : 'text-base'} flex items-center justify-center ${
                  isStartDisabled 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Play className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                <span>
                  {selectedTopics.length === 0 
                    ? 'Select Topics to Start Quiz'
                    : isMobile
                      ? 'Start Quiz'
                      : `Start Quiz (${selectedTopicsCount} topics, ${questionCount} questions)`
                  }
                </span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTopicSelection;
