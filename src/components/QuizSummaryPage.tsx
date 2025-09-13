
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Trophy, Clock, Target, BookOpen, TrendingUp, TrendingDown, AlertTriangle, Award } from 'lucide-react';
import { Subject } from '@/types/common';
import { QuizQuestion } from '@/types/question';
import CollapsibleQuestionReview from '@/components/CollapsibleQuestionReview';

interface QuizSummaryPageProps {
  questions: QuizQuestion[];
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
  
  // Calculate points based on difficulty (3/6/9 points per correct answer)
  const calculatePointsFromQuestions = (questions: any[], answers: any[]) => {
    let totalPoints = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        const difficulty = question.difficulty || 'medium';
        switch (difficulty.toLowerCase()) {
          case 'easy':
            totalPoints += 3;
            break;
          case 'medium':
            totalPoints += 6;
            break;
          case 'hard':
            totalPoints += 9;
            break;
          default:
            totalPoints += 6; // Default to medium
        }
      }
    });
    return totalPoints;
  };

  const pointsEarned = calculatePointsFromQuestions(questions, answers);
  
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

  const strongestTopic = Object.entries(topicPerformance).reduce((best, current) => 
    current[1].percentage > (best?.[1]?.percentage || 0) ? current : best, null as [string, any] | null);
    
  const weakestTopic = Object.entries(topicPerformance).reduce((worst, current) => 
    current[1].percentage < (worst?.[1]?.percentage || 100) ? current : worst, null as [string, any] | null);

  const avgTimePerQuestion = Math.round(timeElapsed / questions.length);

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
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  <span>{pointsEarned} Points</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
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

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{pointsEarned}</div>
                  <div className="text-purple-700 font-medium">Points Earned</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Topic Performance */}
        {topics.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center mb-6">
                <BookOpen className="h-6 w-6 text-gray-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Topic Performance</h2>
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

        {/* Performance Highlights */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Highlights</h2>
            <div className="space-y-3">
              {strongestTopic && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium">
                      Your strongest topic was {strongestTopic[0]}
                    </p>
                    <p className="text-green-700 text-sm">
                      {strongestTopic[1].correct}/{strongestTopic[1].total} correct ({strongestTopic[1].percentage}% accuracy)
                    </p>
                  </div>
                </div>
              )}
              
              {weakestTopic && weakestTopic[1].percentage < 70 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">
                      You struggled most in {weakestTopic[0]}
                    </p>
                    <p className="text-red-700 text-sm">
                      {weakestTopic[1].correct}/{weakestTopic[1].total} correct ({weakestTopic[1].percentage}% accuracy)
                    </p>
                  </div>
                </div>
              )}

              {avgTimePerQuestion < 30 && scorePercentage < 70 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium">
                      Consider slowing down
                    </p>
                    <p className="text-yellow-700 text-sm">
                      You averaged {avgTimePerQuestion}s per question. Taking more time might improve accuracy.
                    </p>
                  </div>
                </div>
              )}

              {scorePercentage >= 90 && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Trophy className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      Excellent performance!
                    </p>
                    <p className="text-blue-700 text-sm">
                      You demonstrated mastery across all topics. Consider challenging yourself with harder questions.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <CollapsibleQuestionReview questions={questions.map(q => ({ 
          ...q, 
          subject: q.subject || '', 
          difficulty: q.difficulty || 'medium' 
        }))} answers={answers} />

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
