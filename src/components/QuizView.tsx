
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import QuizAnswerOptions from './Quiz/QuizAnswerOptions';
import QuizBottomNavigation from './Quiz/QuizBottomNavigation';
import QuizTimer from './Quiz/QuizTimer';
import QuizStats from './Quiz/QuizStats';
import QuizQuestionContent from './Quiz/QuizQuestionContent';
import QuizHeader from './Quiz/QuizHeader';
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
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);

  // Hide navigation and push content up
  useEffect(() => {
    const nav = document.querySelector('nav');
    const body = document.body;
    
    if (nav) {
      nav.style.display = 'none';
      // Add class to body to remove top padding/margin that was accounting for nav
      body.classList.add('quiz-mode-active');
    }

    // Add CSS for quiz mode
    const style = document.createElement('style');
    style.textContent = `
      .quiz-mode-active {
        padding-top: 0 !important;
        margin-top: 0 !important;
      }
      .quiz-mode-active > div {
        padding-top: 0 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (nav) {
        nav.style.display = '';
        body.classList.remove('quiz-mode-active');
      }
      // Remove the style element
      document.head.removeChild(style);
    };
  }, []);

  // Load user points
  useEffect(() => {
    const userPoints = localStorage.getItem(`userPoints_${userName}`) || '0';
    setTotalPoints(parseInt(userPoints));
  }, [userName]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
    
    // Calculate points if answer is correct
    const isCorrect = answerIndex === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      const points = calculatePoints(questions[currentQuestionIndex].difficulty, true);
      setSessionPoints(prev => prev + points);
    }
    
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
    setShowEndConfirmation(true);
  };

  const handleConfirmEndQuiz = () => {
    handleSubmitQuiz();
  };

  const handleCancelEndQuiz = () => {
    setShowEndConfirmation(false);
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

    // Update user points
    const newTotalPoints = totalPoints + sessionPoints;
    localStorage.setItem(`userPoints_${userName}`, newTotalPoints.toString());

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
    <div className="min-h-screen bg-gray-50 pt-0">
      <QuizTimer onTimeUpdate={setTime} />
      
      <div className="max-w-6xl mx-auto px-4 py-4 pb-32">
        {/* Quiz Header */}
        <QuizHeader
          onBack={onBack}
          mode="quiz"
          totalPoints={totalPoints}
          sessionPoints={sessionPoints}
          displayTime={time}
          backButtonText="Back"
          showPoints={feedbackPreference === 'immediate'}
          onEndQuiz={handleEndQuiz}
        />

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
            
            {/* Next Question Button */}
            {feedbackPreference === 'immediate' && showFeedback && canGoNext && (
              <div className="mt-4">
                <Button
                  onClick={handleNext}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next Question
                </Button>
              </div>
            )}
            
            {feedbackPreference === 'end' && hasAnswered && canGoNext && (
              <div className="mt-4">
                <Button
                  onClick={handleNext}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next Question
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* End Quiz Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">End Quiz Session?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to end your quiz session? Your progress will be saved.
              </p>
              <div className="flex space-x-4">
                <Button
                  onClick={handleCancelEndQuiz}
                  variant="outline"
                  className="flex-1 border-gray-300"
                >
                  Continue
                </Button>
                <Button
                  onClick={handleConfirmEndQuiz}
                  variant="destructive"
                  className="flex-1"
                >
                  End Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
