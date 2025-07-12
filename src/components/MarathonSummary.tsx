import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Target, Clock, Award, Eye, TrendingUp, TrendingDown, AlertTriangle, ArrowLeft } from 'lucide-react';
import { getSessionTotalPoints } from '@/services/pointsService';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

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
  options?: string[];
  difficulty?: string;
}

interface MarathonSummaryProps {
  sessionStats: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    showAnswerUsed: number;
    timeSpent: number;
    pointsEarned: number;
  };
  sessionData?: {
    questions: any[];
    answers: any[];
    topics: string[];
    subjects: string[];
  };
  sessionId?: string;
  onBackToDashboard: () => void;
  onBackToSettings: () => void;
  userName: string;
}

const MarathonSummary: React.FC<MarathonSummaryProps> = ({
  sessionStats,
  sessionData,
  sessionId,
  onBackToDashboard,
  onBackToSettings,
  userName
}) => {
  const [actualPointsEarned, setActualPointsEarned] = useState(sessionStats.pointsEarned);
  const [loading, setLoading] = useState(true);
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([]);
  const [questionReviews, setQuestionReviews] = useState<QuestionReview[]>([]);
  const { isMobile } = useResponsiveLayout();

  console.log('MarathonSummary - sessionData:', sessionData);
  console.log('MarathonSummary - sessionStats:', sessionStats);

  // Calculate points based on difficulty
  const calculatePointsFromQuestions = (questions: any[], answers: any[]) => {
    let totalPoints = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer || userAnswer === question.correct_answer;
      
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

  // Calculate real topic performance from session data
  useEffect(() => {
    if (sessionData?.questions && sessionData?.answers) {
      console.log('Processing session data for topic performance...');
      const topicStats: { [key: string]: { attempted: number; correct: number; totalTime: number } } = {};
      
      sessionData.questions.forEach((question, index) => {
        const topic = question.topic || question.skill || question.domain || 'General';
        const userAnswer = sessionData.answers[index];
        const isCorrect = userAnswer === question.correctAnswer || userAnswer === question.correct_answer;
        
        if (!topicStats[topic]) {
          topicStats[topic] = { attempted: 0, correct: 0, totalTime: 0 };
        }
        
        topicStats[topic].attempted++;
        if (isCorrect) {
          topicStats[topic].correct++;
        }
      });

      const topics: TopicPerformance[] = Object.entries(topicStats).map(([topic, stats]) => ({
        topic,
        attempted: stats.attempted,
        correct: stats.correct,
        accuracy: Math.round((stats.correct / stats.attempted) * 100),
        avgTime: Math.round(stats.totalTime / stats.attempted) || 45 // fallback average
      })).sort((a, b) => a.accuracy - b.accuracy); // Sort by accuracy (weak first)
      
      console.log('Calculated topic performance:', topics);
      setTopicPerformance(topics);

      // Generate question reviews from actual session data
      const reviews: QuestionReview[] = sessionData.questions.map((question, index) => ({
        id: question.id || `q-${index}`,
        question: question.question || question.questionText || question.question_text || `Question ${index + 1}`,
        userAnswer: sessionData.answers[index] || 'No answer',
        correctAnswer: question.correctAnswer || question.correct_answer || 'Unknown',
        isCorrect: sessionData.answers[index] === (question.correctAnswer || question.correct_answer),
        topic: question.topic || question.skill || question.domain || 'General',
        explanation: question.explanation || question.correct_rationale || 'No explanation available',
        options: [question.option_a, question.option_b, question.option_c, question.option_d].filter(Boolean),
        difficulty: question.difficulty || 'medium'
      }));
      
      console.log('Generated question reviews:', reviews);
      setQuestionReviews(reviews);
    } else {
      console.log('No session data available for topic performance calculation');
    }
  }, [sessionData]);

  useEffect(() => {
    const fetchActualPoints = async () => {
      if (sessionId) {
        try {
          const points = await getSessionTotalPoints(sessionId, 'marathon');
          console.log('Points from database:', points);
          setActualPointsEarned(points);
        } catch (error) {
          console.error('Error fetching session points:', error);
          // Calculate points based on question difficulty and correct answers
          if (sessionData?.questions && sessionData?.answers) {
            const calculatedPoints = calculatePointsFromQuestions(sessionData.questions, sessionData.answers);
            console.log('Calculated points from session data:', calculatedPoints);
            setActualPointsEarned(calculatedPoints);
          } else {
            // Fallback: assume medium difficulty (6 points per correct answer)
            const calculatedPoints = sessionStats.correctAnswers * 6;
            console.log('Calculated fallback points (medium difficulty):', calculatedPoints);
            setActualPointsEarned(calculatedPoints);
          }
        }
      } else {
        // Calculate points based on question difficulty and correct answers
        if (sessionData?.questions && sessionData?.answers) {
          const calculatedPoints = calculatePointsFromQuestions(sessionData.questions, sessionData.answers);
          console.log('Calculated points from session data (no session ID):', calculatedPoints);
          setActualPointsEarned(calculatedPoints);
        } else {
          // Fallback: assume medium difficulty (6 points per correct answer)
          const calculatedPoints = sessionStats.correctAnswers * 6;
          console.log('Calculated points (no session ID, medium difficulty):', calculatedPoints);
          setActualPointsEarned(calculatedPoints);
        }
      }
      setLoading(false);
    };

    fetchActualPoints();
  }, [sessionId, sessionStats.pointsEarned, sessionStats.correctAnswers, sessionData]);

  const accuracy = sessionStats.totalQuestions > 0 
    ? Math.round((sessionStats.correctAnswers / sessionStats.totalQuestions) * 100) 
    : 0;

  const avgTimePerQuestion = sessionStats.totalQuestions > 0 
    ? Math.round(sessionStats.timeSpent / sessionStats.totalQuestions) 
    : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getBadgeColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (accuracy >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getBadgeEmoji = (accuracy: number) => {
    if (accuracy >= 80) return '🟢';
    if (accuracy >= 60) return '🟡';
    return '🔴';
  };

  const strongestTopic = topicPerformance.length > 0 ? topicPerformance[topicPerformance.length - 1] : null;
  const weakestTopic = topicPerformance.length > 0 ? topicPerformance[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-3 md:py-6 px-2 md:px-4">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        
        {/* Updated Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBackToDashboard}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Marathon Complete!</h1>
            </div>
          </div>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Session Overview */}
        <Card>
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-4`}>Session Overview</h2>
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-blue-600`}>{sessionStats.totalQuestions}</div>
                <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Questions</div>
              </div>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-green-600`}>{sessionStats.correctAnswers}</div>
                <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Correct</div>
              </div>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-purple-600`}>{accuracy}%</div>
                <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Accuracy</div>
              </div>
              <div className="text-center">
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-orange-600`}>{formatTime(sessionStats.timeSpent)}</div>
                <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Performance - Only show if we have topic data */}
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
                      {topic.accuracy >= 80 ? 'Strong' : topic.accuracy >= 60 ? 'Moderate' : 'Weak'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Highlights - Only show if we have multiple topics */}
        {topicPerformance.length > 1 && (
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
                
                {weakestTopic && weakestTopic.accuracy < 70 && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className={`text-red-800 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                        You struggled most in {weakestTopic.topic}
                      </p>
                      <p className={`text-red-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {weakestTopic.correct}/{weakestTopic.attempted} correct ({weakestTopic.accuracy}% accuracy)
                      </p>
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

        {/* Time Analysis */}
        <Card>
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-4`}>Time Analysis</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-800`}>{avgTimePerQuestion}s</div>
                <div className={`text-blue-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Avg per question</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <Target className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-indigo-800`}>{formatTime(sessionStats.timeSpent)}</div>
                <div className={`text-indigo-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>Question Review</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className={`${isMobile ? 'text-xs px-3 py-1' : 'text-sm'}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Review Questions
                  </Button>
                </DialogTrigger>
                <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh]' : 'max-w-4xl max-h-[80vh]'} overflow-y-auto`}>
                  <DialogHeader>
                    <DialogTitle>Question by Question Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {questionReviews.length > 0 ? questionReviews.map((review, index) => (
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
                        
                        {review.options && review.options.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">Options:</p>
                            <div className="grid gap-1">
                              {review.options.map((option, optIndex) => (
                                <div key={optIndex} className={`text-sm p-2 rounded ${
                                  option === review.correctAnswer ? 'bg-green-100 text-green-800' :
                                  option === review.userAnswer ? 'bg-red-100 text-red-800' :
                                  'bg-gray-50 text-gray-700'
                                }`}>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
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
                        {review.explanation && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                            <p className="text-sm text-blue-700">{review.explanation}</p>
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No questions available for review.</p>
                        <p className="text-sm text-gray-400 mt-2">Session data may not have been properly captured.</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Review all {sessionStats.totalQuestions} questions with detailed explanations and correct answers.
            </p>
          </CardContent>
        </Card>

        {/* Points Earned */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center`}>
            <Award className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} text-purple-600 mx-auto mb-3`} />
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-2`}>Points Earned</h2>
            <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-purple-800 mb-2`}>
              {loading ? '...' : actualPointsEarned}
            </div>
            <p className={`text-purple-700 ${isMobile ? 'text-sm' : 'text-base'}`}>Great work!</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row ${isMobile ? 'gap-3' : 'gap-4'} justify-center`}>
          <Button
            onClick={onBackToSettings}
            variant="outline"
            className={`border-blue-600 text-blue-600 hover:bg-blue-50 ${isMobile ? 'px-4 py-3' : 'px-8 py-3'} rounded-xl font-medium`}
          >
            New Marathon
          </Button>
          <Button
            onClick={onBackToDashboard}
            className={`bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'px-4 py-3' : 'px-8 py-3'} rounded-xl font-medium`}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarathonSummary;
