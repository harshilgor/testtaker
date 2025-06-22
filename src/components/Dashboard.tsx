
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Zap, Clock, BookOpen, Brain, Settings, TrendingUp, Target, Award, Star, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminPanel from './AdminPanel';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface DashboardProps {
  userName: string;
  onMarathonSelect: () => void;
  onMockTestSelect: () => void;
  onQuizSelect: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  onMarathonSelect,
  onMockTestSelect,
  onQuizSelect
}) => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { isAdmin } = useAdminAccess();

  // Fetch user progress and stats
  const { data: userProgress } = useQuery({
    queryKey: ['user-dashboard-progress', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      // Get recent attempts for progress tracking
      const { data: recentAttempts } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Get total points
      const totalPoints = recentAttempts?.reduce((sum, attempt) => sum + (attempt.points_earned || 0), 0) || 0;
      
      // Calculate accuracy
      const correctAttempts = recentAttempts?.filter(a => a.is_correct).length || 0;
      const accuracy = recentAttempts?.length ? Math.round((correctAttempts / recentAttempts.length) * 100) : 0;

      // Find weak topics
      const topicStats = new Map();
      recentAttempts?.forEach(attempt => {
        const key = attempt.topic;
        if (!topicStats.has(key)) {
          topicStats.set(key, { correct: 0, total: 0, subject: attempt.subject });
        }
        const stats = topicStats.get(key);
        stats.total++;
        if (attempt.is_correct) stats.correct++;
      });

      const weakTopics = Array.from(topicStats.entries())
        .filter(([_, stats]) => stats.total >= 3)
        .map(([topic, stats]) => ({
          topic,
          accuracy: Math.round((stats.correct / stats.total) * 100),
          subject: stats.subject,
          total: stats.total
        }))
        .filter(topic => topic.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3);

      return {
        totalPoints,
        totalQuestions: recentAttempts?.length || 0,
        accuracy,
        weakTopics,
        streak: calculateStreak(recentAttempts || [])
      };
    },
    enabled: !!userName,
  });

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

  const getProgressLevel = (points: number) => {
    if (points < 100) return { level: 1, progress: points, nextLevel: 100 };
    if (points < 500) return { level: 2, progress: points - 100, nextLevel: 400 };
    if (points < 1000) return { level: 3, progress: points - 500, nextLevel: 500 };
    if (points < 2000) return { level: 4, progress: points - 1000, nextLevel: 1000 };
    return { level: 5, progress: points - 2000, nextLevel: 1000 };
  };

  const handlePracticeWeakTopic = (topic: any) => {
    // Navigate to targeted practice for this topic
    console.log('Practice weak topic:', topic);
  };

  if (showAdminPanel) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />;
  }

  const level = userProgress ? getProgressLevel(userProgress.totalPoints) : { level: 1, progress: 0, nextLevel: 100 };
  const progressPercentage = (level.progress / level.nextLevel) * 100;

  return (
    <div className="min-h-screen flex flex-col px-4 py-4 md:py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header with progress */}
        <div className="text-center mb-6 md:mb-8 relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h1>
              <p className="text-base md:text-lg text-gray-600">
                Ready to continue your learning journey?
              </p>
            </div>
            
            {/* Admin Access Button */}
            {isAdmin && (
              <Button
                onClick={() => setShowAdminPanel(true)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress Card */}
          {userProgress && (
            <Card className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-6 w-6 text-yellow-300 mr-2" />
                      <span className="text-2xl font-bold">Level {level.level}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 bg-purple-300" />
                    <p className="text-sm text-purple-100 mt-1">
                      {level.progress}/{level.nextLevel} to next level
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <Award className="h-6 w-6 mx-auto mb-2 text-yellow-300" />
                    <p className="text-2xl font-bold">{userProgress.totalPoints}</p>
                    <p className="text-sm text-purple-100">Total Points</p>
                  </div>
                  
                  <div className="text-center">
                    <Target className="h-6 w-6 mx-auto mb-2 text-green-300" />
                    <p className="text-2xl font-bold">{userProgress.accuracy}%</p>
                    <p className="text-sm text-purple-100">Accuracy</p>
                  </div>
                  
                  <div className="text-center">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-orange-300" />
                    <p className="text-2xl font-bold">{userProgress.streak}</p>
                    <p className="text-sm text-purple-100">Current Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Weak Topics */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-red-500" />
                Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {userProgress?.weakTopics && userProgress.weakTopics.length > 0 ? (
                <div className="space-y-3">
                  {userProgress.weakTopics.map((topic: any, index: number) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border-l-2 border-red-300">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={topic.subject === 'math' ? 'default' : 'secondary'} className="text-xs">
                          {topic.subject === 'math' ? 'Math' : 'R&W'}
                        </Badge>
                        <span className="text-xs font-medium text-red-600">{topic.accuracy}%</span>
                      </div>
                      <p className="text-xs font-medium mb-2">{topic.topic}</p>
                      <Button 
                        size="sm" 
                        className="w-full text-xs h-7"
                        onClick={() => handlePracticeWeakTopic(topic)}
                      >
                        Practice <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs text-gray-500">No weak areas found!</p>
                  <p className="text-xs text-gray-400">Keep practicing to maintain performance</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Practice Modes */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Marathon Mode */}
            <Card className="hover:shadow-lg transition-all border border-gray-100 hover:border-orange-300">
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <div className="bg-orange-50 rounded-full p-2 md:p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                    <Zap className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Marathon Mode</h3>
                  <p className="text-gray-600 mb-3 md:mb-4 text-sm leading-relaxed">3000+ real SAT Practice questions with unlimited practice</p>
                  
                  <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      Unlimited
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Self-Paced
                    </div>
                  </div>

                  <Button onClick={onMarathonSelect} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 md:py-3 font-medium text-sm md:text-base">
                    Start Marathon
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Mode */}
            <Card className="hover:shadow-lg transition-all border border-gray-100 hover:border-purple-300">
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <div className="bg-purple-50 rounded-full p-2 md:p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                    <Brain className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Quiz</h3>
                  <p className="text-gray-600 mb-3 md:mb-4 text-sm leading-relaxed">Create custom quizzes from specific topics and difficulty levels</p>
                  
                  <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Custom
                    </div>
                    <div className="flex items-center">
                      <Brain className="h-3 w-3 mr-1" />
                      Targeted
                    </div>
                  </div>

                  <Button onClick={onQuizSelect} className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 md:py-3 font-medium text-sm md:text-base">
                    Create Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mock Test Mode */}
            <Card className="hover:shadow-lg transition-all border border-gray-100 hover:border-blue-300">
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <div className="bg-blue-50 rounded-full p-2 md:p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                    <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Mock Test</h3>
                  <p className="text-gray-600 mb-3 md:mb-4 text-sm leading-relaxed">Take a full SAT mock test with real timing and adaptive scoring</p>
                  
                  <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      Real Format
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Timed
                    </div>
                  </div>

                  <Button onClick={onMockTestSelect} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 md:py-3 font-medium text-sm md:text-base">
                    Take Mock Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Daily Challenge */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-500 rounded-full p-3">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Daily Challenge</h3>
                  <p className="text-sm text-gray-600">Complete 10 questions to earn bonus points</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">7/10</p>
                <p className="text-xs text-gray-500">Questions completed</p>
              </div>
            </div>
            <Progress value={70} className="mt-4 h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
