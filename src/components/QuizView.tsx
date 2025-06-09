import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Target, Award, Flag } from 'lucide-react';
import QuestionImage from './QuestionImage';
import QuizQuestionNavigator from './Quiz/QuizQuestionNavigator';
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
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onBack, subject, topics, userName }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [time, setTime] = useState(0);
  const [showResults, setShowResults] = useState(false);

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
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleToggleFlag = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlaggedQuestions(newFlagged);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
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

  return (
    <div className="min-h-screen bg-gray-50 py-6 pb-20">
      <div className="max-w-7xl mx-auto px-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-280px)]">
          {/* Left Side - Question Content */}
          <div className="lg:col-span-2">
            <Card className="h-full border-gray-200">
              <CardContent className="p-6 h-full flex flex-col">
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
                
                <div className="flex-1 overflow-y-auto">
                  <p className="text-gray-800 leading-relaxed mb-6">
                    {currentQuestion.question}
                  </p>
                  
                  {currentQuestion.hasImage && currentQuestion.imageUrl && (
                    <div className="mb-4">
                      <QuestionImage imageUrl={currentQuestion.imageUrl} alt="Question Image" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Navigation and Answer Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Navigator */}
            <QuizQuestionNavigator
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              onGoToQuestion={handleGoToQuestion}
            />

            {/* Answer Options */}
            <QuizAnswerOptions
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
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
    </div>
  );
};

export default QuizView;
