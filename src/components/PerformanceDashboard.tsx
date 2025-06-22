
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Target, Award, Brain, Clock, BookOpen, Trophy, Zap, Star, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface PerformanceDashboardProps {
  userName: string;
  onBack: () => void;
}

interface WeakTopic {
  topic: string;
  subject: 'math' | 'english';
  accuracy: number;
  totalQuestions: number;
}

interface PerformanceData {
  date: string;
  accuracy: number;
  points: number;
  questionsAnswered: number;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ userName, onBack }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalPoints: 0,
    totalQuestions: 0,
    overallAccuracy: 0,
    streak: 0,
    rank: 0
  });

  // Fetch comprehensive performance data
  const { data: userStats, isLoading } = useQuery({
    queryKey: ['user-performance', userName, selectedTimeframe],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      // Get question attempts for analysis
      const { data: attempts } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(1000);

      // Get marathon sessions
      const { data: marathonSessions } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      // Get quiz results
      const { data: quizResults } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      // Get mock test results
      const { data: mockResults } = await supabase
        .from('mock_test_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('completed_at', { ascending: false });

      return { attempts, marathonSessions, quizResults, mockResults };
    },
    enabled: !!userName,
  });

  useEffect(() => {
    if (userStats?.attempts) {
      // Calculate weak topics
      const topicStats = new Map();
      
      userStats.attempts.forEach(attempt => {
        const key = `${attempt.topic}-${attempt.subject}`;
        if (!topicStats.has(key)) {
          topicStats.set(key, { correct: 0, total: 0, topic: attempt.topic, subject: attempt.subject });
        }
        const stats = topicStats.get(key);
        stats.total++;
        if (attempt.is_correct) stats.correct++;
      });

      const weakTopicsArray: WeakTopic[] = Array.from(topicStats.values())
        .filter(stats => stats.total >= 5) // Only topics with at least 5 attempts
        .map(stats => ({
          topic: stats.topic,
          subject: stats.subject,
          accuracy: Math.round((stats.correct / stats.total) * 100),
          totalQuestions: stats.total
        }))
        .filter(topic => topic.accuracy < 70) // Less than 70% accuracy
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 6);

      setWeakTopics(weakTopicsArray);

      // Calculate performance over time
      const dailyStats = new Map();
      userStats.attempts.forEach(attempt => {
        const date = attempt.created_at.split('T')[0];
        if (!dailyStats.has(date)) {
          dailyStats.set(date, { correct: 0, total: 0, points: 0 });
        }
        const stats = dailyStats.get(date);
        stats.total++;
        if (attempt.is_correct) stats.correct++;
        stats.points += attempt.points_earned || 0;
      });

      const performanceArray = Array.from(dailyStats.entries())
        .map(([date, stats]) => ({
          date,
          accuracy: Math.round((stats.correct / stats.total) * 100),
          points: stats.points,
          questionsAnswered: stats.total
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // Last 30 days

      setPerformanceData(performanceArray);

      // Calculate total stats
      const totalCorrect = userStats.attempts.filter(a => a.is_correct).length;
      const totalPoints = userStats.attempts.reduce((sum, a) => sum + (a.points_earned || 0), 0);
      
      setTotalStats({
        totalPoints,
        totalQuestions: userStats.attempts.length,
        overallAccuracy: userStats.attempts.length > 0 ? Math.round((totalCorrect / userStats.attempts.length) * 100) : 0,
        streak: calculateStreak(userStats.attempts),
        rank: 0 // Calculate from leaderboard if needed
      });
    }
  }, [userStats]);

  const calculateStreak = (attempts: any[]) => {
    let streak = 0;
    for (let i = 0; i < attempts.length; i++) {
      if (attempts[i].is_correct) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const handlePracticeWeakTopic = (topic: WeakTopic) => {
    // Navigate to practice mode for this specific topic
    console.log('Practice topic:', topic);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
              <p className="text-gray-600 mt-1">Track your progress and identify areas for improvement</p>
            </div>
            <Button onClick={onBack} variant="outline" className="bg-white">
              Back to Dashboard
            </Button>
          </div>
          
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Points</p>
                    <p className="text-2xl font-bold">{totalStats.totalPoints.toLocaleString()}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Overall Accuracy</p>
                    <p className="text-2xl font-bold">{totalStats.overallAccuracy}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Current Streak</p>
                    <p className="text-2xl font-bold">{totalStats.streak}</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Questions Solved</p>
                    <p className="text-2xl font-bold">{totalStats.totalQuestions}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Performance Trends
                  </CardTitle>
                  <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((period) => (
                      <Button
                        key={period}
                        variant={selectedTimeframe === period ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTimeframe(period)}
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="points" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="font-medium text-sm">Quick Learner</p>
                    <p className="text-xs text-gray-600">Answered 100+ questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Target className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Accuracy Master</p>
                    <p className="text-xs text-gray-600">80%+ accuracy rate</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <Zap className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="font-medium text-sm">Streak Champion</p>
                    <p className="text-xs text-gray-600">10+ correct in a row</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weak Topics Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-red-600" />
                Areas for Improvement
              </CardTitle>
              <p className="text-sm text-gray-600">Focus on these topics to boost your performance</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weakTopics.map((topic, index) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={topic.subject === 'math' ? 'default' : 'secondary'}>
                          {topic.subject === 'math' ? 'Math' : 'Reading & Writing'}
                        </Badge>
                        <span className="text-sm font-medium text-red-600">{topic.accuracy}%</span>
                      </div>
                      <h4 className="font-medium text-sm mb-2">{topic.topic}</h4>
                      <p className="text-xs text-gray-600 mb-3">{topic.totalQuestions} questions attempted</p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handlePracticeWeakTopic(topic)}
                      >
                        Practice Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {weakTopics.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Great job! No weak areas identified.</p>
                  <p className="text-sm">Keep practicing to maintain your performance.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mock Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Mock Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userStats?.mockResults && userStats.mockResults.length > 0 ? (
                <div className="space-y-3">
                  {userStats.mockResults.slice(0, 3).map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">SAT Practice Test</p>
                        <p className="text-xs text-gray-600">
                          {new Date(result.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{result.total_score || (result.math_score + result.english_score)}</p>
                        <p className="text-xs text-gray-600">Total Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No mock tests completed yet</p>
              )}
            </CardContent>
          </Card>

          {/* Marathon Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Marathon Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userStats?.marathonSessions && userStats.marathonSessions.length > 0 ? (
                <div className="space-y-3">
                  {userStats.marathonSessions.slice(0, 3).map((session: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Marathon Session</p>
                        <p className="text-xs text-gray-600">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {session.correct_answers}/{session.total_questions}
                        </p>
                        <p className="text-xs text-gray-600">
                          {Math.round((session.correct_answers / session.total_questions) * 100)}% Accuracy
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No marathon sessions yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
