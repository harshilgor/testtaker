import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, Calendar, Award, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StudyTimeCardProps {
  userName: string;
}

interface StudyGoal {
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
  streakGoal: number;
}

interface StudyStats {
  today: number; // minutes
  dailyAverage: number; // minutes
  thisWeek: number; // hours
  thisMonth: number; // hours
  currentStreak: number;
  bestStreak: number;
}

const StudyTimeCard: React.FC<StudyTimeCardProps> = ({ userName }) => {
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [studyGoal, setStudyGoal] = useState<StudyGoal>(() => {
    const saved = localStorage.getItem('studyGoal');
    return saved ? JSON.parse(saved) : {
      dailyHours: 2,
      weeklyHours: 14,
      monthlyHours: 60,
      streakGoal: 7
    };
  });

  // Fetch study data
  const { data: marathonSessions = [] } = useQuery({
    queryKey: ['marathon-sessions-study', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching marathon sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  const { data: quizResults = [] } = useQuery({
    queryKey: ['quiz-results-study', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz results:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  const { data: attempts = [] } = useQuery({
    queryKey: ['attempts-study', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('created_at, time_spent')
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error fetching attempts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Calculate study statistics
  const calculateStudyStats = (): StudyStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate today's study time
    let todayMinutes = 0;
    
    // From marathon sessions (1.5 minutes per question)
    marathonSessions.forEach((session: any) => {
      const sessionDate = new Date(session.created_at);
      if (sessionDate >= today) {
        todayMinutes += (session.total_questions || 0) * 1.5;
      }
    });

    // From quiz results (2 minutes per question)
    quizResults.forEach((quiz: any) => {
      const quizDate = new Date(quiz.created_at);
      if (quizDate >= today) {
        todayMinutes += (quiz.total_questions || 0) * 2;
      }
    });

    // From individual attempts
    attempts.forEach((attempt: any) => {
      const attemptDate = new Date(attempt.created_at);
      if (attemptDate >= today) {
        todayMinutes += (attempt.time_spent || 0) / 60;
      }
    });

    // Calculate weekly study time
    let weeklyMinutes = 0;
    marathonSessions.forEach((session: any) => {
      const sessionDate = new Date(session.created_at);
      if (sessionDate >= weekStart) {
        weeklyMinutes += (session.total_questions || 0) * 1.5;
      }
    });

    quizResults.forEach((quiz: any) => {
      const quizDate = new Date(quiz.created_at);
      if (quizDate >= weekStart) {
        weeklyMinutes += (quiz.total_questions || 0) * 2;
      }
    });

    attempts.forEach((attempt: any) => {
      const attemptDate = new Date(attempt.created_at);
      if (attemptDate >= weekStart) {
        weeklyMinutes += (attempt.time_spent || 0) / 60;
      }
    });

    // Calculate monthly study time
    let monthlyMinutes = 0;
    marathonSessions.forEach((session: any) => {
      const sessionDate = new Date(session.created_at);
      if (sessionDate >= monthStart) {
        monthlyMinutes += (session.total_questions || 0) * 1.5;
      }
    });

    quizResults.forEach((quiz: any) => {
      const quizDate = new Date(quiz.created_at);
      if (quizDate >= monthStart) {
        monthlyMinutes += (quiz.total_questions || 0) * 2;
      }
    });

    attempts.forEach((attempt: any) => {
      const attemptDate = new Date(attempt.created_at);
      if (attemptDate >= monthStart) {
        monthlyMinutes += (attempt.time_spent || 0) / 60;
      }
    });

    // Calculate daily average (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    let sevenDayMinutes = 0;
    marathonSessions.forEach((session: any) => {
      const sessionDate = new Date(session.created_at);
      if (sessionDate >= sevenDaysAgo) {
        sevenDayMinutes += (session.total_questions || 0) * 1.5;
      }
    });

    quizResults.forEach((quiz: any) => {
      const quizDate = new Date(quiz.created_at);
      if (quizDate >= sevenDaysAgo) {
        sevenDayMinutes += (quiz.total_questions || 0) * 2;
      }
    });

    attempts.forEach((attempt: any) => {
      const attemptDate = new Date(attempt.created_at);
      if (attemptDate >= sevenDaysAgo) {
        sevenDayMinutes += (attempt.time_spent || 0) / 60;
      }
    });

    // Calculate streak (simplified)
    let currentStreak = 0;
    let bestStreak = 0;
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(date);
    }

    let tempStreak = 0;
    last7Days.forEach(date => {
      let dayMinutes = 0;
      
      marathonSessions.forEach((session: any) => {
        const sessionDate = new Date(session.created_at);
        if (sessionDate.toDateString() === date.toDateString()) {
          dayMinutes += (session.total_questions || 0) * 1.5;
        }
      });

      quizResults.forEach((quiz: any) => {
        const quizDate = new Date(quiz.created_at);
        if (quizDate.toDateString() === date.toDateString()) {
          dayMinutes += (quiz.total_questions || 0) * 2;
        }
      });

      attempts.forEach((attempt: any) => {
        const attemptDate = new Date(attempt.created_at);
        if (attemptDate.toDateString() === date.toDateString()) {
          dayMinutes += (attempt.time_spent || 0) / 60;
        }
      });

      if (dayMinutes >= studyGoal.dailyHours * 60 * 0.5) {
        tempStreak++;
        currentStreak = Math.max(currentStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    bestStreak = Math.max(bestStreak, currentStreak);

    return {
      today: Math.round(todayMinutes),
      dailyAverage: Math.round(sevenDayMinutes / 7),
      thisWeek: Math.round(weeklyMinutes / 60 * 10) / 10,
      thisMonth: Math.round(monthlyMinutes / 60 * 10) / 10,
      currentStreak,
      bestStreak
    };
  };

  const stats = calculateStudyStats();

  // Calculate progress percentages
  const dailyProgress = Math.min(100, (stats.today / (studyGoal.dailyHours * 60)) * 100);
  const weeklyProgress = Math.min(100, (stats.thisWeek / studyGoal.weeklyHours) * 100);
  const monthlyProgress = Math.min(100, (stats.thisMonth / studyGoal.monthlyHours) * 100);

  // Format display values
  const formatTodayDisplay = () => {
    if (stats.today >= 60) {
      const hours = Math.floor(stats.today / 60);
      const minutes = stats.today % 60;
      return {
        value: hours,
        unit: minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`,
        isComplete: stats.today >= studyGoal.dailyHours * 60
      };
    } else {
      return {
        value: stats.today,
        unit: 'min',
        isComplete: stats.today >= studyGoal.dailyHours * 60
      };
    }
  };

  const todayDisplay = formatTodayDisplay();

  const handleSaveGoal = () => {
    localStorage.setItem('studyGoal', JSON.stringify(studyGoal));
    setShowGoalDialog(false);
  };

  const getStatusColor = () => {
    if (dailyProgress >= 100) return 'bg-green-500';
    if (dailyProgress >= 75) return 'bg-yellow-500';
    if (dailyProgress >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMotivationalMessage = () => {
    if (dailyProgress >= 100) return "Amazing! You've exceeded your daily goal! 🎉";
    if (dailyProgress >= 75) return "Great progress! Almost there! 💪";
    if (dailyProgress >= 50) return "Halfway there! Keep going! 🔥";
    if (dailyProgress >= 25) return "Good start! You can do this! ⚡";
    return "Time to start studying! Every minute counts! 📚";
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Study Time</h3>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${getStatusColor()}`}></div>
            <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <Settings className="w-4 h-4 text-gray-500" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Set Study Goals</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dailyHours">Daily Study Goal (hours)</Label>
                    <Input
                      id="dailyHours"
                      type="number"
                      min="0.5"
                      max="12"
                      step="0.5"
                      value={studyGoal.dailyHours}
                      onChange={(e) => setStudyGoal(prev => ({ ...prev, dailyHours: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weeklyHours">Weekly Study Goal (hours)</Label>
                    <Input
                      id="weeklyHours"
                      type="number"
                      min="1"
                      max="84"
                      step="1"
                      value={studyGoal.weeklyHours}
                      onChange={(e) => setStudyGoal(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyHours">Monthly Study Goal (hours)</Label>
                    <Input
                      id="monthlyHours"
                      type="number"
                      min="4"
                      max="360"
                      step="1"
                      value={studyGoal.monthlyHours}
                      onChange={(e) => setStudyGoal(prev => ({ ...prev, monthlyHours: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="streakGoal">Streak Goal (days)</Label>
                    <Input
                      id="streakGoal"
                      type="number"
                      min="1"
                      max="365"
                      step="1"
                      value={studyGoal.streakGoal}
                      onChange={(e) => setStudyGoal(prev => ({ ...prev, streakGoal: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <Button onClick={handleSaveGoal} className="w-full">
                    Save Goals
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Metric */}
        <div className="text-4xl font-bold text-gray-900 mb-1">{todayDisplay.value}</div>
        <div className="text-sm text-gray-500 mb-4">{todayDisplay.unit}</div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(dailyProgress)}%</span>
          </div>
          <Progress value={dailyProgress} className="h-2" />
        </div>

        {/* Progress Button */}
        <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              Progress
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Study Progress</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Motivational Message */}
              <div className="text-sm text-gray-600 italic text-center">
                {getMotivationalMessage()}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">Daily Average</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {stats.dailyAverage} min
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">This Week</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {stats.thisWeek}h
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(weeklyProgress)}% of goal
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-600">This Month</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {stats.thisMonth}h
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(monthlyProgress)}% of goal
                  </div>
                </div>
              </div>

              {/* Goal Summary */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Daily Goal</span>
                </div>
                <div className="text-sm text-blue-800">
                  {studyGoal.dailyHours} hours • {studyGoal.weeklyHours}h/week • {studyGoal.monthlyHours}h/month
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StudyTimeCard;
