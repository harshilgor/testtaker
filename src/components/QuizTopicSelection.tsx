import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, AlertCircle } from 'lucide-react';
import { Subject } from '../pages/Index';
import QuizView from './QuizView';
import { useQuestionTopics } from '../hooks/useQuestionTopics';
import { useQuizTopicSelection } from '../hooks/useQuizTopicSelection';
import QuizTopicSelector from './Quiz/QuizTopicSelector';
import QuizSettings from './Quiz/QuizSettings';

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
        onBack={() => setStartQuiz(false)}
        subject={subject}
        topics={selectedTopics}
        userName={userName}
        feedbackPreference={feedbackPreference}
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
              <QuizSettings
                questionCount={questionCount}
                feedbackPreference={feedbackPreference}
                onQuestionCountChange={handleQuestionCountChange}
                onFeedbackPreferenceChange={setFeedbackPreference}
              />

              <QuizTopicSelector
                topics={topics}
                selectedTopics={selectedTopics}
                onTopicToggle={handleTopicToggle}
                subject={subject}
                loading={topicsLoading}
              />

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
