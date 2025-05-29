import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Check, X, RefreshCw, Clock, Target, Trophy } from 'lucide-react';
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
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showMarathonSummary, setShowMarathonSummary] = useState(false);
  const [mockTestAnswers, setMockTestAnswers] = useState<(number | null)[]>([]);
  const [quizEndTime, setQuizEndTime] = useState<Date | null>(null);

  useEffect(() => {
    setStartTime(new Date());
    if (mode === 'mock') {
      setMockTestAnswers(new Array(mockTestQuestions.length).fill(null));
    }
    loadNextQuestion();
  }, []);

  const loadNextQuestion = () => {
    if (mode === 'mock') {
      if (mockTestIndex < mockTestQuestions.length) {
        setCurrentQuestion(mockTestQuestions[mockTestIndex]);
      } else {
        setMockTestComplete(true);
        setQuizEndTime(new Date());
      }
    } else {
      // Handle the 'both' case by randomly selecting math or english
      let questionSubject: 'math' | 'english';
      if (subject === 'both' || subject === 'mixed') {
        questionSubject = Math.random() > 0.5 ? 'math' : 'english';
      } else {
        questionSubject = subject as 'math' | 'english';
      }
      const question = getRandomQuestion(questionSubject);
      setCurrentQuestion(question);
    }
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
      if (mode === 'mock') {
        const newAnswers = [...mockTestAnswers];
        newAnswers[mockTestIndex] = answerIndex;
        setMockTestAnswers(newAnswers);
      }
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
        setQuizEndTime(new Date());
        const mockTestResult = {
          score: Math.round((score.correct / score.total) * 100),
          questions: mockTestQuestions,
          answers: mockTestAnswers,
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

  const handleEndMarathon = () => {
    setShowMarathonSummary(true);
  };

  const formatTime = (startTime: Date, endTime?: Date) => {
    const finalTime = endTime || new Date();
    const diffMs = finalTime.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (showMarathonSummary) {
    const timeSpent = formatTime(startTime);
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mb-6">
              <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Marathon Complete!</h2>
              <p className="text-gray-600">Great job, {userName}!</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-sm text-green-700 font-medium">Questions Attempted</span>
                </div>
                <div className="text-2xl font-bold text-green-800">{score.total}</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Check className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700 font-medium">Correct Answers</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{score.correct}</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <X className="h-6 w-6 text-red-600 mr-2" />
                  <span className="text-sm text-red-700 font-medium">Wrong Answers</span>
                </div>
                <div className="text-2xl font-bold text-red-800">{score.total - score.correct}</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-sm text-purple-700 font-medium">Time Spent</span>
                </div>
                <div className="text-2xl font-bold text-purple-800">{timeSpent}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{accuracy}%</div>
              <div className="text-gray-600">Overall Accuracy</div>
            </div>

            <Button
              onClick={onBack}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mockTestComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const finalTimeSpent = formatTime(startTime, quizEndTime);
    
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
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
              <div className="mt-4 flex justify-center items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
                  <div className="text-gray-600">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{finalTimeSpent}</div>
                  <div className="text-gray-600">Total Time</div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-gray-600">
                {score.correct} out of {score.total} questions correct
              </div>
            </div>

            {/* Show all questions with answers */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Review Your Answers</h3>
              {mockTestQuestions.map((question, index) => {
                const userAnswer = mockTestAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                        Question {index + 1}
                      </span>
                      {isCorrect ? (
                        <span className="text-green-600 text-sm font-medium">✅ Correct</span>
                      ) : (
                        <span className="text-red-600 text-sm font-medium">❌ Incorrect</span>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{question.question}</h4>
                    
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === question.correctAnswer
                              ? 'bg-green-50 border-green-300 text-green-800'
                              : optionIndex === userAnswer && !isCorrect
                              ? 'bg-red-50 border-red-300 text-red-800'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <span className="font-medium mr-3">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          {option}
                          {optionIndex === question.correctAnswer && (
                            <span className="ml-2 text-green-600 font-medium">(Correct)</span>
                          )}
                          {optionIndex === userAnswer && userAnswer !== question.correctAnswer && (
                            <span className="ml-2 text-red-600 font-medium">(Your Answer)</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
                      <p className="text-blue-800">{question.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => {
                  setMockTestIndex(0);
                  setMockTestComplete(false);
                  setScore({ correct: 0, total: 0 });
                  setMockTestAnswers(new Array(mockTestQuestions.length).fill(null));
                  setStartTime(new Date());
                  setQuizEndTime(null);
                  loadNextQuestion();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake Test
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
              >
                Back to Dashboard
              </Button>
            </div>
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

  const progress = mode === 'mock' ? ((mockTestIndex + 1) / mockTestQuestions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress for Mock Test */}
        {mode === 'mock' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Mock Test</h1>
                <p className="text-gray-600">Question {mockTestIndex + 1} of {mockTestQuestions.length}</p>
              </div>
              
              <div className="text-right min-w-[100px]">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>
            
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Header for Marathon */}
        {mode === 'marathon' && (
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={handleEndMarathon}
              variant="outline"
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              End Marathon
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {subject === 'math' ? 'Math' : subject === 'english' ? 'English' : 'Mixed'} Marathon
              </h1>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Questions: {score.total}</div>
              <div className="text-sm text-green-600">Correct: {score.correct}</div>
              <div className="text-sm text-red-600">Wrong: {score.total - score.correct}</div>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
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
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
              <div className="font-medium mb-2 text-blue-800">
                {selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
              </div>
              <p className="text-blue-700">{currentQuestion.explanation}</p>
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
