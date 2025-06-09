
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Target, Award, Flag, ChevronUp } from 'lucide-react';
import QuestionImage from './QuestionImage';
import QuizAnswerOptions from './Quiz/QuizAnswerOptions';
import QuizBottomNavigation from './Quiz/QuizBottomNavigation';
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
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];
  const isFlagged = flaggedQuestions[currentQuestionIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const canGoNext = currentQuestionIndex < questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm">{formatTime(time)}</span>
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-sm">Answered: {answeredCount}/{questions.length}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Question Content */}
          <div>
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <Button
                    onClick={handleToggleFlag}
                    variant="outline"
                    size="sm"
                    className={isFlagged ? 'text-yellow-600 border-yellow-300' : ''}
                  >
                    <Flag className={`h-4 w-4 ${isFlagged ? 'fill-yellow-400' : ''}`} />
                  </Button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-800 leading-relaxed mb-4">
                    {currentQuestion.question}
                  </p>
                  
                  {currentQuestion.hasImage && currentQuestion.imageUrl && (
                    <div className="mb-4">
                      <QuestionImage imageUrl={currentQuestion.imageUrl} alt="Question Image" />
                    </div>
                  )}
                </div>

                {/* Show feedback if immediate feedback is enabled and user answered */}
                {feedbackPreference === 'immediate' && showFeedback && selectedAnswer !== null && (
                  <div className={`p-4 rounded-lg border ${
                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {currentQuestion.explanation}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-red-700 mt-2">
                        The correct answer is: {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                      </p>
                    )}
                  </div>
                )}

                {/* Next button for end feedback preference */}
                {feedbackPreference === 'end' && selectedAnswer !== null && (
                  <div className="mt-6">
                    {canGoNext ? (
                      <Button
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Next Question
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitQuiz}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Submit Quiz
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
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
