
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronUp } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizTimer onTimeUpdate={setTime} />
      
      <div className="max-w-7xl mx-auto px-4 pb-32">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {subject === 'math' ? 'Math' : 'English'} Quiz
            </h1>
          </div>
          <QuizStats
            time={time}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            answeredCount={answeredCount}
          />
        </div>

        {/* Main Content */}
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
            />
          </div>
        </div>
      </div>

      {/* Simple Bottom Navigation Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setIsNavigationOpen(!isNavigationOpen)}
            className="flex items-center space-x-2"
          >
            <span className="text-sm font-medium bg-gray-800 text-white px-3 py-1 rounded mr-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <ChevronUp className={`h-4 w-4 transition-transform ${isNavigationOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation Popup */}
        {isNavigationOpen && (
          <QuizBottomNavigation
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            onGoToQuestion={handleGoToQuestion}
            onNext={handleNext}
            onSubmit={handleSubmitQuiz}
            answeredCount={answeredCount}
          />
        )}
      </div>
    </div>
  );
};

export default QuizView;
