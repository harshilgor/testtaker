import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, CheckCircle, X, Flag, RotateCcw, Target, Brain, Timer } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  domain: string;
}

interface PracticeMode {
  type: 'weakness-practice';
  focusTopics: string[];
  targetScore: number;
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface MistakesQuizViewProps {
  questions: Question[];
  userName: string;
  onBack: () => void;
  quizTitle: string;
  quizDescription: string;
  practiceMode?: PracticeMode;
}

const MistakesQuizView: React.FC<MistakesQuizViewProps> = ({
  questions,
  userName,
  onBack,
  quizTitle,
  quizDescription,
  practiceMode
}) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  // Start timer when component mounts
  useEffect(() => {
    setStartTime(new Date());
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    // Convert correct answer letter to index
    const correctAnswerIndex = currentQuestion.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
    const correct = selectedAnswer === correctAnswerIndex;
    
    setIsCorrect(correct);
    setShowResult(true);

    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz completed
      handleQuizComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
      setShowResult(true);
      setIsCorrect(answers[currentQuestionIndex - 1] === (currentQuestion.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0)));
    }
  };

  const handleQuizComplete = () => {
    const correctAnswers = answers.filter((answer, index) => {
      if (answer === null) return false;
      const correctAnswerIndex = questions[index].correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
      return answer === correctAnswerIndex;
    }).length;

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setQuizCompleted(true);
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers(new Array(questions.length).fill(null));
    setShowResult(false);
    setQuizCompleted(false);
    setScore(0);
    setTimeSpent(0);
    setStartTime(new Date());
  };

  const handleBackToDashboard = () => {
    onBack();
  };

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {score >= 80 ? (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                ) : score >= 60 ? (
                  <Target className="h-10 w-10 text-yellow-600" />
                ) : (
                  <Brain className="h-10 w-10 text-blue-600" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
              <p className="text-gray-600 mb-6">Great job completing the practice session!</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{score}%</div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{formatTime(timeSpent)}</div>
                  <div className="text-sm text-gray-600">Time Taken</div>
                </div>
              </div>

              {practiceMode && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Weakness Practice Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Focus Topics:</span>
                      <p className="text-blue-600">{practiceMode.focusTopics.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Target Score:</span>
                      <p className="text-blue-600">{practiceMode.targetScore}%</p>
                    </div>
                  </div>
                  {score >= practiceMode.targetScore ? (
                    <div className="mt-2 text-green-700 font-medium">
                      🎉 You exceeded your target score!
                    </div>
                  ) : (
                    <div className="mt-2 text-orange-700 font-medium">
                      Keep practicing to reach your target score of {practiceMode.targetScore}%
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button onClick={handleRetake} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
                <Button onClick={handleBackToDashboard} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{quizTitle}</h1>
              <p className="text-sm text-gray-500">{quizDescription}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Question</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentQuestionIndex + 1} / {questions.length}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Time</div>
              <div className="text-lg font-semibold text-gray-900">{formatTime(timeSpent)}</div>
            </div>
          </div>
        </div>

        {/* Practice Mode Info */}
        {practiceMode && (
          <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Focus Topics:</span>
                    <span className="text-sm text-blue-700">{practiceMode.focusTopics.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Target Score:</span>
                    <span className="text-sm text-blue-700">{practiceMode.targetScore}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Est. Duration:</span>
                    <span className="text-sm text-blue-700">{practiceMode.estimatedDuration} min</span>
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${
                  practiceMode.difficulty === 'easy' ? 'border-green-300 text-green-700' :
                  practiceMode.difficulty === 'medium' ? 'border-yellow-300 text-yellow-700' :
                  'border-red-300 text-red-700'
                }`}>
                  {practiceMode.difficulty} difficulty
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="bg-white border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.topic}
                </Badge>
                <Badge variant="outline" className={`text-xs ${
                  currentQuestion.difficulty === 'easy' ? 'border-green-300 text-green-700' :
                  currentQuestion.difficulty === 'medium' ? 'border-yellow-300 text-yellow-700' :
                  'border-red-300 text-red-700'
                }`}>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{currentQuestion.question}</h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className={`w-full justify-start h-auto p-4 ${
                    selectedAnswer === index 
                      ? "bg-blue-600 text-white border-blue-600" 
                      : "hover:bg-gray-50"
                  }`}
                  disabled={showResult}
                >
                  <span className="mr-3 font-medium">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-left">{option}</span>
                </Button>
              ))}
            </div>

            {/* Submit Button */}
            {!showResult && (
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit Answer
              </Button>
            )}

            {/* Result Display */}
            {showResult && (
              <div className={`p-4 rounded-lg border ${
                isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className={`text-sm ${
                  isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            {showResult && (
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex-1"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MistakesQuizView;
