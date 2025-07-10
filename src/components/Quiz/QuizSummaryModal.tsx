
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Target, Clock, Award, Eye, TrendingUp, TrendingDown, AlertTriangle, Flame, X } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useUserStreak } from '@/hooks/useUserStreak';
import { supabase } from '@/integrations/supabase/client';

interface TopicPerformance {
  topic: string;
  attempted: number;
  correct: number;
  accuracy: number;
  avgTime?: number;
}

interface QuestionReview {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  topic: string;
  explanation?: string;
}

interface QuizSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: any[];
  answers: (number | null)[];
  timeElapsed: number;
  userName: string;
  subject: string;
  topics: string[];
  onBackToDashboard: () => void;
}

const QuizSummaryModal: React.FC<QuizSummaryModalProps> = ({
  isOpen,
  onClose,
  questions,
  answers,
  timeElapsed,
  userName,
  subject,
  topics,
  onBackToDashboard
}) => {
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([]);
  const [questionReviews, setQuestionReviews] = useState<QuestionReview[]>([]);
  const [showQuestionReview, setShowQuestionReview] = useState(false);
  const { isMobile } = useResponsiveLayout();
  const { streakData } = useUserStreak(userName);

  // Calculate performance metrics
  const correctAnswers = answers.reduce((count, answer, index) => {
    return answer === questions[index]?.correctAnswer ? count + 1 : count;
  }, 0);
  
  const totalQuestions = questions.length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const avgTimePerQuestion = Math.round(timeElapsed / totalQuestions);
  const pointsEarned = correctAnswers * 10;

  useEffect(() => {
    if (!questions || questions.length === 0) return;

    // Calculate topic performance
    const topicStats: { [key: string]: { attempted: number; correct: number; totalTime: number } } = {};
    
    questions.forEach((question, index) => {
      const topic = question.topic || question.skill || 'General';
      const isCorrect = answers[index] === question.correctAnswer;
      
      if (!topicStats[topic]) {
        topicStats[topic] = { attempted: 0, correct: 0, totalTime: 0 };
      }
      topicStats[topic].attempted++;
      if (isCorrect) {
        topicStats[topic].correct++;
      }
      topicStats[topic].totalTime += avgTimePerQuestion; // Approximate time per question
    });

    const topicPerf: TopicPerformance[] = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      attempted: stats.attempted,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.attempted) * 100),
      avgTime: Math.round(stats.totalTime / stats.attempted)
    })).sort((a, b) => a.accuracy - b.accuracy); // Sort by accuracy (weak first)
    
    setTopicPerformance(topicPerf);

    // Create question reviews
    const reviews: QuestionReview[] = questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      const optionLabels = ['A', 'B', 'C', 'D'];
      
      return {
        id: question.id?.toString() || index.toString(),
        question: question.question,
        userAnswer: userAnswer !== null ? `${optionLabels[userAnswer]}. ${question.options[userAnswer]}` : 'No answer',
        correctAnswer: `${optionLabels[question.correctAnswer]}. ${question.options[question.correctAnswer]}`,
        isCorrect,
        topic: question.topic || question.skill || 'General',
        explanation: question.explanation || 'No explanation available'
      };
    });
    
    setQuestionReviews(reviews);
  }, [questions, answers, avgTimePerQuestion]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getBadgeColor = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (accuracy >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getBadgeEmoji = (accuracy: number) => {
    if (accuracy >= 70) return '🟢';
    if (accuracy >= 50) return '🟡';
    return '🔴';
  };

  const strongestTopic = topicPerformance.length > 0 ? topicPerformance[topicPerformance.length - 1] : null;
  const weakestTopic = topicPerformance.length > 0 ? topicPerformance[0] : null;

  if (showQuestionReview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh]' : 'max-w-4xl max-h-[80vh]'} overflow-y-auto`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Question by Question Review</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestionReview(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {questionReviews.map((review, index) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Question {index + 1}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    review.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {review.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-gray-700">{review.question}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Your Answer:</p>
                    <p className={`text-sm ${review.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {review.userAnswer}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Correct Answer:</p>
                    <p className="text-sm text-green-700">{review.correctAnswer}</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                  <p className="text-sm text-blue-700">{review.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh]' : 'max-w-4xl max-h-[80vh]'} overflow-y-auto p-0`}>
        <div className="min-h-full bg-gray-50 py-3 md:py-6 px-2 md:px-4">
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            
            {/* Streak Section */}
            {streakData && streakData.current_streak > 0 && (
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                  <div className="flex items-center space-x-3">
                    <Flame className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-orange-500`} />
                    <div>
                      <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-gray-900`}>
                        🔥 {streakData.current_streak}-day streak!
                      </h3>
                      <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        Keep practicing to maintain your momentum
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
                <div className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
                  <Trophy className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-blue-600 mx-auto mb-2`} />
                  <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900`}>Quiz Complete!</h1>
                  <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-lg'}`}>Great job, {userName}!</p>
                </div>
              </CardContent>
            </Card>

            {/* Session Overview */}
            <Card>
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-4`}>Quiz Overview</h2>
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-blue-600`}>{totalQuestions}</div>
                    <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Questions</div>
                  </div>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-green-600`}>{correctAnswers}</div>
                    <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Correct</div>
                  </div>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-purple-600`}>{accuracy}%</div>
                    <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-orange-600`}>{formatTime(timeElapsed)}</div>
                    <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topic Performance */}
            {topicPerformance.length > 0 && (
              <Card>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-4`}>Topic Performance</h2>
                  <div className="space-y-3">
                    {topicPerformance.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`${isMobile ? 'text-lg' : 'text-xl'}`}>{getBadgeEmoji(topic.accuracy)}</span>
                          <div>
                            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>{topic.topic}</h3>
                            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                              {topic.correct}/{topic.attempted} correct • {topic.accuracy}% accuracy
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full border ${getBadgeColor(topic.accuracy)} ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                          {topic.accuracy >= 70 ? 'Strong' : topic.accuracy >= 50 ? 'Moderate' : 'Weak'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Highlights */}
            {topicPerformance.length > 0 && (
              <Card>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-4`}>Performance Highlights</h2>
                  <div className="space-y-3">
                    {strongestTopic && (
                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className={`text-green-800 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                            Your strongest topic was {strongestTopic.topic}
                          </p>
                          <p className={`text-green-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {strongestTopic.correct}/{strongestTopic.attempted} correct ({strongestTopic.accuracy}% accuracy)
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {weakestTopic && weakestTopic.accuracy < 70 && topicPerformance.length > 1 && (
                      <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className={`text-red-800 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                            You struggled most in {weakestTopic.topic}
                          </p>
                          <p className={`text-red-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {weakestTopic.correct}/{weakestTopic.attempted} correct ({weakestTopic.accuracy}% accuracy)
                          </p>
                          <Button variant="outline" size="sm" className={`mt-2 text-red-700 border-red-300 hover:bg-red-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            Practice this topic
                          </Button>
                        </div>
                      </div>
                    )}

                    {avgTimePerQuestion < 30 && accuracy < 70 && (
                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className={`text-yellow-800 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                            Consider slowing down
                          </p>
                          <p className={`text-yellow-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            You averaged {avgTimePerQuestion}s per question. Taking more time might improve accuracy.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Review */}
            <Card>
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>Question Review</h2>
                  <Button 
                    variant="outline" 
                    className={`${isMobile ? 'text-xs px-3 py-1' : 'text-sm'}`}
                    onClick={() => setShowQuestionReview(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review Questions
                  </Button>
                </div>
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Review all {totalQuestions} questions with detailed explanations and correct answers.
                </p>
              </CardContent>
            </Card>

            {/* Points Earned */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
                <Award className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-purple-600 mx-auto mb-3`} />
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-2`}>Points Earned</h2>
                <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-purple-800 mb-2`}>
                  {pointsEarned}
                </div>
                <p className={`text-purple-700 ${isMobile ? 'text-sm' : 'text-base'}`}>Great work!</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row ${isMobile ? 'gap-3' : 'gap-4'} justify-center`}>
              <Button
                onClick={() => {
                  onClose();
                  // Start new quiz logic here if needed
                }}
                variant="outline"
                className={`border-blue-600 text-blue-600 hover:bg-blue-50 ${isMobile ? 'px-4 py-3' : 'px-8 py-3'} rounded-xl font-medium`}
              >
                New Quiz
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  onBackToDashboard();
                }}
                className={`bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'px-4 py-3' : 'px-8 py-3'} rounded-xl font-medium`}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizSummaryModal;
