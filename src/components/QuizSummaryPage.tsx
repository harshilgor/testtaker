
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Trophy, Clock, Target, BookOpen } from 'lucide-react';
import { Subject } from '@/types/common';

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

interface QuizSummaryPageProps {
  questions: Question[];
  answers: (number | null)[];
  topics: string[];
  timeElapsed: number;
  onRetakeQuiz: () => void;
  onBackToDashboard: () => void;
  userName: string;
  subject: Subject;
}

const QuizSummaryPage: React.FC<QuizSummaryPageProps> = ({
  questions,
  answers,
  topics,
  timeElapsed,
  onRetakeQuiz,
  onBackToDashboard,
  userName,
  subject
}) => {
  const correctAnswers = answers.filter((answer, index) => 
    answer === questions[index].correctAnswer
  ).length;
  
  const incorrectAnswers = questions.length - correctAnswers;
  const scorePercentage = Math.round((correctAnswers / questions.length) * 100);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return "Outstanding! You're mastering this material!";
    if (percentage >= 80) return "Great job! You have a solid understanding.";
    if (percentage >= 70) return "Good work! Keep practicing to improve.";
    if (percentage >= 60) return "Not bad! Focus on areas that need improvement.";
    return "Keep studying! You'll get better with practice.";
  };

  // Calculate topic-wise performance
  const topicPerformance = topics.reduce((acc, topic) => {
    const topicQuestions = questions.filter(q => q.topic === topic);
    const topicCorrectAnswers = topicQuestions.filter((q, index) => {
      const globalIndex = questions.findIndex(question => question.id === q.id);
      return answers[globalIndex] === q.correctAnswer;
    }).length;
    
    acc[topic] = {
      total: topicQuestions.length,
      correct: topicCorrectAnswers,
      percentage: topicQuestions.length > 0 ? Math.round((topicCorrectAnswers / topicQuestions.length) * 100) : 0
    };
    
    return acc;
  }, {} as Record<string, { total: number; correct: number; percentage: number }>);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBackToDashboard}
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-yellow-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Quiz Complete!</h1>
            </div>
            <p className="text-gray-600">Here's how you performed</p>
          </div>
        </div>

        {/* Score Overview */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(scorePercentage)}`}>
                {scorePercentage}%
              </div>
              <p className="text-xl text-gray-600 mb-4">{getScoreMessage(scorePercentage)}</p>
              <div className="flex justify-center items-center space-x-8 text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Time: {formatTime(timeElapsed)}</span>
                </div>
                <div className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  <span>{correctAnswers}/{questions.length} Correct</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{correctAnswers}</div>
                  <div className="text-green-700 font-medium">Correct Answers</div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">{incorrectAnswers}</div>
                  <div className="text-red-700 font-medium">Incorrect Answers</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{formatTime(timeElapsed)}</div>
                  <div className="text-blue-700 font-medium">Time Taken</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Topic Performance */}
        {topics.length > 1 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <BookOpen className="h-6 w-6 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Performance by Topic</h2>
              </div>
              
              <div className="space-y-4">
                {Object.entries(topicPerformance).map(([topic, performance]) => (
                  <div key={topic} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{topic}</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${performance.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-0">
                          {performance.correct}/{performance.total} ({performance.percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Review */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Question Review</h2>
            
            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={question.id} className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">
                          Question {index + 1}: {question.question}
                        </h3>
                        <div className="grid gap-2">
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex}
                              className={`p-2 rounded text-sm ${
                                optionIndex === question.correctAnswer
                                  ? 'bg-green-100 text-green-800 font-medium'
                                  : optionIndex === userAnswer && userAnswer !== question.correctAnswer
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-white text-gray-700'
                              }`}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {option}
                              {optionIndex === question.correctAnswer && (
                                <span className="ml-2 text-green-600">✓ Correct</span>
                              )}
                              {optionIndex === userAnswer && userAnswer !== question.correctAnswer && (
                                <span className="ml-2 text-red-600">✗ Your answer</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRetakeQuiz}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Retake Quiz
          </Button>
          
          <Button
            onClick={onBackToDashboard}
            variant="outline"
            className="flex items-center justify-center px-8 py-3"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizSummaryPage;
