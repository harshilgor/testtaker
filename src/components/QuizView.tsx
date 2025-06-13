
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import QuizAnswerOptions from './Quiz/QuizAnswerOptions';
import QuizBottomNavigation from './Quiz/QuizBottomNavigation';
import QuizTimer from './Quiz/QuizTimer';
import QuizStats from './Quiz/QuizStats';
import QuizQuestionContent from './Quiz/QuizQuestionContent';
import { calculatePoints } from '@/services/pointsService';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  imageUrl?: string;
  hasImage?: boolean;
}

interface QuizViewProps {
  questions: Question[];
  onBack: () => void;
  subject: string;
  topics: string[];
  userName: string;
  feedbackPreference: 'immediate' | 'end';
}

const QuizView: React.FC<QuizViewProps> = ({ 
  questions, 
  onBack, 
  subject, 
  topics, 
  userName, 
  feedbackPreference 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [time, setTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
    
    // Show immediate feedback if preference is set to immediate
    if (feedbackPreference === 'immediate') {
      setShowFeedback(true);
    }
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowFeedback(false);
    setIsNavigationOpen(false);
  };

  const handleToggleFlag = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlaggedQuestions(newFlagged);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
    }
  };

  const handleEndQuiz = () => {
    if (confirm('Are you sure you want to end the quiz? Your progress will be saved.')) {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    const correctAnswers = answers.reduce((count, answer, index) => {
      return answer === questions[index].correctAnswer ? count + 1 : count;
    }, 0);

    const totalScore = answers.reduce((score, answer, index) => {
      if (answer === questions[index].correctAnswer) {
        return score + calculatePoints(questions[index].difficulty, true);
      }
      return score;
    }, 0);

    const quizResult = {
      score: Math.round((correctAnswers / questions.length) * 100),
      questions: questions,
      answers: answers,
      subject: subject,
      topics: topics,
      date: new Date().toLocaleDateString(),
      userName: userName,
      totalScore: totalScore,
      correctAnswers: correctAnswers
    };

    const storedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    storedResults.push(quizResult);
    localStorage.setItem('quizResults', JSON.stringify(storedResults));
    onBack();
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];
  const isFlagged = flaggedQuestions[currentQuestionIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const canGoNext = currentQuestionIndex < questions.length - 1;
  const hasAnswered = selectedAnswer !== null;

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <QuizTimer onTimeUpdate={setTime} />
      
      <div className="max-w-6xl mx-auto px-4 py-2 pb-32">
        {/* Header - Bluebook style */}
        <div className="mb-4 flex justify-between items-center bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {subject === 'math' ? 'Math' : 'Reading and Writing'} Assessment
            </h1>
          </div>
          <QuizStats
            time={time}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            answeredCount={answeredCount}
          />
        </div>

        {/* Main Content - Two column layout like Bluebook */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Question Content */}
          <div>
            <QuizQuestionContent
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              selectedAnswer={selectedAnswer}
              isFlagged={isFlagged}
              showFeedback={showFeedback}
              feedbackPreference={feedbackPreference}
              onToggleFlag={handleToggleFlag}
              onNext={handleNext}
              onSubmit={handleSubmitQuiz}
              onEndQuiz={handleEndQuiz}
              canGoNext={canGoNext}
            />
          </div>

          {/* Right Side - Answer Options */}
          <div>
            <QuizAnswerOptions
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
              showCorrectAnswer={feedbackPreference === 'immediate' && showFeedback}
              isCorrect={isCorrect}
              feedbackPreference={feedbackPreference}
              hasAnswered={hasAnswered}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Bluebook style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setIsNavigationOpen(!isNavigationOpen)}
            className="flex items-center space-x-3 border-gray-300 hover:bg-gray-50 px-6 py-2"
          >
            <span className="text-sm font-medium bg-gray-800 text-white px-3 py-1 rounded text-center min-w-[120px]">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <ChevronUp className={`h-4 w-4 transition-transform ${isNavigationOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation Popup - Enhanced Bluebook style */}
        {isNavigationOpen && (
          <QuizBottomNavigation
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            onGoToQuestion={handleGoToQuestion}
            answeredCount={answeredCount}
            selectedTopics={topics}
          />
        )}
      </div>
    </div>
  );
};

export default QuizView;
