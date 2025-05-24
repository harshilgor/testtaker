
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, RefreshCw } from 'lucide-react';
import { Subject } from '../pages/Index';
import { getRandomQuestion, mockTestQuestions } from '../data/questions';

interface QuestionViewProps {
  subject: Subject | 'mixed';
  mode: 'marathon' | 'mock';
  userName: string;
  onBack: () => void;
}

interface Question {
  id: string;
  subject: 'math' | 'english';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QuestionView: React.FC<QuestionViewProps> = ({ subject, mode, userName, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [mockTestIndex, setMockTestIndex] = useState(0);
  const [mockTestComplete, setMockTestComplete] = useState(false);

  useEffect(() => {
    loadNextQuestion();
  }, []);

  const loadNextQuestion = () => {
    if (mode === 'mock') {
      if (mockTestIndex < mockTestQuestions.length) {
        setCurrentQuestion(mockTestQuestions[mockTestIndex]);
      } else {
        setMockTestComplete(true);
      }
    } else {
      const question = getRandomQuestion(subject as Subject);
      setCurrentQuestion(question);
    }
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;
    
    setShowResult(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNextQuestion = () => {
    if (mode === 'mock') {
      if (mockTestIndex === mockTestQuestions.length - 1) {
        // Store mock test result
        const mockTestResult = {
          score: Math.round((score.correct / score.total) * 100),
          questions: mockTestQuestions,
          answers: new Array(mockTestQuestions.length).fill(null), // This would need to be tracked properly
          date: new Date().toISOString(),
          userName
        };
        
        const existingMockTests = JSON.parse(localStorage.getItem('mockTestResults') || '[]');
        existingMockTests.push(mockTestResult);
        localStorage.setItem('mockTestResults', JSON.stringify(existingMockTests));
      }
      setMockTestIndex(prev => prev + 1);
    }
    loadNextQuestion();
  };

  if (mockTestComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className={`rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center ${
              percentage >= 70 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {percentage >= 70 ? (
                <Check className={`h-10 w-10 text-green-600`} />
              ) : (
                <X className={`h-10 w-10 ${percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`} />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mock Test Complete!</h2>
            <p className="text-gray-600">Great job, {userName}!</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
            <div className="text-gray-600">
              {score.correct} out of {score.total} questions correct
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => {
                setMockTestIndex(0);
                setMockTestComplete(false);
                setScore({ correct: 0, total: 0 });
                loadNextQuestion();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Test
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'mock' ? 'Mock Test' : `${subject === 'math' ? 'Math' : 'English'} Marathon`}
            </h1>
            {mode === 'mock' && (
              <p className="text-gray-600">Question {mockTestIndex + 1} of {mockTestQuestions.length}</p>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-lg font-bold text-blue-600">
              {score.correct}/{score.total}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentQuestion.subject === 'math' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {currentQuestion.subject === 'math' ? 'Mathematics' : 'English'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? showResult
                      ? index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-red-500 bg-red-50 text-red-900'
                      : 'border-blue-500 bg-blue-50'
                    : showResult && index === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center">
                  <span className="font-medium mr-3 text-gray-500">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                  {showResult && selectedAnswer === index && (
                    <span className="ml-auto">
                      {index === currentQuestion.correctAnswer ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                    </span>
                  )}
                  {showResult && index === currentQuestion.correctAnswer && selectedAnswer !== index && (
                    <span className="ml-auto">
                      <Check className="h-5 w-5 text-green-600" />
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Result and Explanation */}
          {showResult && (
            <div className={`p-4 rounded-lg mb-6 ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`font-medium mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </div>
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {mode === 'mock' && mockTestIndex === mockTestQuestions.length - 1 
                  ? 'Finish Test' 
                  : 'Next Question'
                }
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionView;
