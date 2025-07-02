
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Flag, ArrowRight } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import QuizTimer from './Quiz/QuizTimer';
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
    } else {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];
  const isFlagged = flaggedQuestions[currentQuestionIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const hasAnswered = selectedAnswer !== null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header Bar - SAT Style */}
      <div className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 px-3 py-1 rounded text-sm font-medium">
            QUIZ
          </div>
          <div className="text-sm">
            Topics: {topics.join(', ')}
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-sm font-medium">
            {formatTime(time)}
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800"
          >
            Exit Quiz
          </Button>
        </div>
      </div>

      {/* Timer Component */}
      <QuizTimer onTimeUpdate={setTime} />

      {/* Main Content Area */}
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Question Content */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-8 bg-white overflow-y-auto">
              <div className="max-w-3xl">
                {/* Question Header */}
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Question</h2>
                  <div className="text-lg leading-relaxed text-gray-900">
                    {currentQuestion.question}
                  </div>
                </div>

                {/* Question Image if available */}
                {currentQuestion.imageUrl && (
                  <div className="mb-6">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Question diagram" 
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Answer Options */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-8 bg-white border-l border-gray-200 flex flex-col">
              <div className="flex-1">
                {/* Question Info Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Question</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mark-review"
                        checked={isFlagged}
                        onChange={handleToggleFlag}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="mark-review" className="text-sm text-gray-600">
                        Mark for Review
                      </label>
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="mb-8">
                  <p className="text-sm text-gray-600 mb-4">Choose the best answer.</p>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedAnswer === index;
                      const isCorrectAnswer = index === currentQuestion.correctAnswer;
                      const shouldShowCorrect = feedbackPreference === 'immediate' && showFeedback;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                            isSelected
                              ? shouldShowCorrect
                                ? isCorrectAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-red-500 bg-red-50'
                                : 'border-blue-500 bg-blue-50'
                              : shouldShowCorrect && isCorrectAnswer
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                              isSelected
                                ? shouldShowCorrect
                                  ? isCorrectAnswer
                                    ? 'border-green-500 bg-green-500 text-white'
                                    : 'border-red-500 bg-red-500 text-white'
                                  : 'border-blue-500 bg-blue-500 text-white'
                                : shouldShowCorrect && isCorrectAnswer
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : 'border-gray-300'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="flex-1">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback Section */}
                {showFeedback && feedbackPreference === 'immediate' && (
                  <div className={`p-4 rounded-lg mb-6 ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Next Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setIsNavigationOpen(!isNavigationOpen)}
            className="flex items-center space-x-3 border-gray-300 hover:bg-gray-50 px-6 py-2"
          >
            <span className="text-sm font-medium bg-gray-800 text-white px-3 py-1 rounded">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <ChevronUp className={`h-4 w-4 transition-transform ${isNavigationOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation Grid */}
        {isNavigationOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-10 gap-2 max-w-2xl mx-auto">
              {questions.map((_, index) => {
                const isAnswered = answers[index] !== null;
                const isCurrent = index === currentQuestionIndex;
                const isFlaggedQuestion = flaggedQuestions[index];
                
                return (
                  <button
                    key={index}
                    onClick={() => handleGoToQuestion(index)}
                    className={`w-10 h-10 text-sm font-medium rounded ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isAnswered
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-white text-gray-600 border border-gray-300'
                    } ${isFlaggedQuestion ? 'ring-2 ring-orange-400' : ''} hover:bg-opacity-80`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border-2 border-orange-400 rounded"></div>
                <span>Flagged</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
