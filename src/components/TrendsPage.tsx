import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Target, 
  Brain, 
  FileText, 
  BookOpen,
  PenTool,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb
} from 'lucide-react';

interface TrendsPageProps {
  userName: string;
  onBack: () => void;
}

interface TodayActivity {
  id: string;
  type: 'marathon' | 'quiz' | 'mocktest';
  title: string;
  questions: number;
  accuracy: number;
  grade?: string;
  score?: number;
  topics: string[];
  icon: React.ReactNode;
}

interface SkillStat {
  skill: string;
  accuracy: number;
}

interface WeeklySummary {
  questionsAnswered: number;
  averageAccuracy: number;
  accuracyChange: number;
  studyTimeHours: number;
  projectedSATScore: number;
  scoreChange: number;
}

const TrendsPage: React.FC<TrendsPageProps> = ({ userName, onBack }) => {
  // Fetch today's data
  const { data: todayMarathonSessions = [] } = useQuery({
    queryKey: ['today-marathon-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: !!userName,
  });

  const { data: todayQuizSessions = [] } = useQuery({
    queryKey: ['today-quiz-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: !!userName,
  });

  const { data: todayMockTests = [] } = useQuery({
    queryKey: ['today-mocktest-sessions', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('mock_test_results')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('completed_at', today.toISOString())
        .order('completed_at', { ascending: false });

      return data || [];
    },
    enabled: !!userName,
  });

  // Get comprehensive activity data for today's analysis
  const { data: allTodayActivities = [] } = useQuery({
    queryKey: ['all-today-activities', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Combine quiz, marathon and mock test data to get comprehensive activity data
      const [quizData, marathonData, mockData] = await Promise.all([
        supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.user.id)
          .gte('created_at', today.toISOString()),
        supabase
          .from('marathon_sessions')
          .select('*')
          .eq('user_id', user.user.id)
          .gte('created_at', today.toISOString()),
        supabase
          .from('mock_test_results')
          .select('*')
          .eq('user_id', user.user.id)
          .gte('completed_at', today.toISOString())
      ]);

      const activities = [];

      // Add quiz activities with synthetic question attempt data
      (quizData.data || []).forEach(quiz => {
        for (let i = 0; i < quiz.total_questions; i++) {
          activities.push({
            is_correct: i < quiz.correct_answers,
            topic: quiz.topics?.[0] || quiz.subject,
            subject: quiz.subject,
            time_spent: Math.floor((quiz.time_taken || 0) / quiz.total_questions),
            created_at: quiz.created_at,
            session_type: 'quiz'
          });
        }
      });

      // Add marathon activities
      (marathonData.data || []).forEach(marathon => {
        for (let i = 0; i < (marathon.total_questions || 0); i++) {
          activities.push({
            is_correct: i < (marathon.correct_answers || 0),
            topic: marathon.subjects?.[0] || 'Mixed',
            subject: marathon.subjects?.[0] || 'Mixed',
            time_spent: 60, // Estimate 1 minute per question
            created_at: marathon.created_at,
            session_type: 'marathon'
          });
        }
      });

      // Add mock test activities
      (mockData.data || []).forEach(mock => {
        // Math questions
        for (let i = 0; i < 54; i++) {
          activities.push({
            is_correct: i < (mock.math_score || 0) / 10, // Rough conversion
            topic: 'Math',
            subject: 'Math',
            time_spent: 80, // Estimate based on SAT timing
            created_at: mock.completed_at,
            session_type: 'mocktest'
          });
        }
        // English questions
        for (let i = 0; i < 44; i++) {
          activities.push({
            is_correct: i < (mock.english_score || 0) / 10,
            topic: 'English',
            subject: 'English', 
            time_spent: 80,
            created_at: mock.completed_at,
            session_type: 'mocktest'
          });
        }
      });

      return activities;
    },
    enabled: !!userName,
  });

  // Fetch weekly data for summary
  const { data: weeklyData = [] } = useQuery({
    queryKey: ['weekly-activities', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get all activities from the past week
      const [quizData, marathonData, mockData] = await Promise.all([
        supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.user.id)
          .gte('created_at', weekAgo.toISOString()),
        supabase
          .from('marathon_sessions')
          .select('*')
          .eq('user_id', user.user.id)
          .gte('created_at', weekAgo.toISOString()),
        supabase
          .from('mock_test_results')
          .select('*')
          .eq('user_id', user.user.id)
          .gte('completed_at', weekAgo.toISOString())
      ]);

      const activities = [];

      // Process all activities similar to today's data
      (quizData.data || []).forEach(quiz => {
        for (let i = 0; i < quiz.total_questions; i++) {
          activities.push({
            is_correct: i < quiz.correct_answers,
            topic: quiz.topics?.[0] || quiz.subject,
            subject: quiz.subject,
            time_spent: Math.floor((quiz.time_taken || 0) / quiz.total_questions),
            created_at: quiz.created_at
          });
        }
      });

      (marathonData.data || []).forEach(marathon => {
        for (let i = 0; i < (marathon.total_questions || 0); i++) {
          activities.push({
            is_correct: i < (marathon.correct_answers || 0),
            topic: marathon.subjects?.[0] || 'Mixed',
            subject: marathon.subjects?.[0] || 'Mixed',
            time_spent: 60,
            created_at: marathon.created_at
          });
        }
      });

      (mockData.data || []).forEach(mock => {
        for (let i = 0; i < 98; i++) { // Total SAT questions
          activities.push({
            is_correct: i < (mock.math_score + mock.english_score) / 20,
            topic: i < 54 ? 'Math' : 'English',
            subject: i < 54 ? 'Math' : 'English',
            time_spent: 80,
            created_at: mock.completed_at
          });
        }
      });

      return activities;
    },
    enabled: !!userName,
  });

  // Process today's activities
  const getTodaysActivities = (): TodayActivity[] => {
    const activities: TodayActivity[] = [];

    // Marathon sessions
    todayMarathonSessions.forEach(session => {
      const accuracy = session.total_questions > 0 ? 
        Math.round(((session.correct_answers || 0) / session.total_questions) * 100) : 0;
      
      activities.push({
        id: session.id,
        type: 'marathon',
        title: 'Marathon Mode',
        questions: session.total_questions || 0,
        accuracy,
        topics: session.subjects || [],
        icon: <Target className="h-4 w-4 text-orange-500" />
      });
    });

    // Quiz sessions
    todayQuizSessions.forEach(session => {
      const grade = session.score_percentage >= 90 ? 'A+' : 
                   session.score_percentage >= 80 ? 'B+' : 
                   session.score_percentage >= 70 ? 'B' : 
                   session.score_percentage >= 60 ? 'C+' : 'C';

      activities.push({
        id: session.id,
        type: 'quiz',
        title: session.subject === 'math' ? 'Algebra Quiz' : 'English Quiz',
        questions: session.total_questions || 0,
        accuracy: Math.round(session.score_percentage || 0),
        grade,
        topics: session.topics || [],
        icon: <Brain className="h-4 w-4 text-purple-500" />
      });
    });

    // Mock tests
    todayMockTests.forEach(session => {
      activities.push({
        id: session.id,
        type: 'mocktest',
        title: 'Mock Test',
        questions: 154,
        accuracy: Math.round((session.total_score / 1600) * 100),
        score: session.total_score,
        topics: ['Math', 'Reading', 'Writing'],
        icon: <FileText className="h-4 w-4 text-green-500" />
      });
    });

    return activities;
  };

  // Calculate performance trends with real data comparison
  const getPerformanceTrends = () => {
    const totalQuestions = allTodayActivities.length;
    const correctAnswers = allTodayActivities.filter(q => q.is_correct).length;
    const overallAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // Calculate yesterday's accuracy for comparison (use weekly data for comparison)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    const yesterdayAttempts = weeklyData.filter(q => {
      const attemptDate = new Date(q.created_at);
      return attemptDate >= yesterday && attemptDate <= yesterdayEnd;
    });
    
    const yesterdayCorrect = yesterdayAttempts.filter(q => q.is_correct).length;
    const yesterdayAccuracy = yesterdayAttempts.length > 0 ? Math.round((yesterdayCorrect / yesterdayAttempts.length) * 100) : 0;
    const accuracyChange = overallAccuracy - yesterdayAccuracy;
    
    // Calculate actual study time in seconds, convert to hours and minutes
    const studyTimeSeconds = allTodayActivities.reduce((sum, q) => sum + (q.time_spent || 0), 0);
    const studyTimeMinutes = Math.floor(studyTimeSeconds / 60);
    const studyTimeHours = Math.floor(studyTimeMinutes / 60);
    const studyTimeRemainder = studyTimeMinutes % 60;

    return {
      overallAccuracy,
      accuracyChange,
      totalQuestions,
      studyTime: `${studyTimeHours}h ${studyTimeRemainder}m`
    };
  };

  // Calculate skills tested today
  const getSkillsTestedToday = (): SkillStat[] => {
    const skillMap = new Map<string, { correct: number; total: number }>();

    allTodayActivities.forEach(attempt => {
      const skill = attempt.topic || attempt.subject;
      if (!skillMap.has(skill)) {
        skillMap.set(skill, { correct: 0, total: 0 });
      }
      
      const skillData = skillMap.get(skill)!;
      skillData.total++;
      if (attempt.is_correct) {
        skillData.correct++;
      }
    });

    const skills: SkillStat[] = [];
    skillMap.forEach((data, skill) => {
      const accuracy = Math.round((data.correct / data.total) * 100);
      skills.push({ skill, accuracy });
    });

    // Return empty array if no real data - no mock data needed
    if (skills.length === 0) {
      return [];
    }

    return skills.slice(0, 4);
  };

  // Calculate weekly summary with real data
  const getWeeklySummary = (): WeeklySummary => {
    const questionsAnswered = weeklyData.length;
    const correctAnswers = weeklyData.filter(q => q.is_correct).length;
    const averageAccuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    
    // Calculate last week's data for comparison
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 14); // Two weeks ago
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7); // One week ago
    
    const lastWeekAttempts = weeklyData.filter(q => {
      const attemptDate = new Date(q.created_at);
      return attemptDate >= lastWeekStart && attemptDate < lastWeekEnd;
    });
    
    const lastWeekCorrect = lastWeekAttempts.filter(q => q.is_correct).length;
    const lastWeekAccuracy = lastWeekAttempts.length > 0 ? Math.round((lastWeekCorrect / lastWeekAttempts.length) * 100) : 0;
    const accuracyChange = averageAccuracy - lastWeekAccuracy;
    
    // Calculate real study time in hours
    const studyTimeSeconds = weeklyData.reduce((sum, q) => sum + (q.time_spent || 0), 0);
    const studyTimeHours = Math.round(studyTimeSeconds / 3600); // Convert to hours
    
    // Estimate SAT score based on accuracy (rough calculation)
    const projectedSATScore = Math.min(1600, Math.max(400, 800 + (averageAccuracy * 8))); // Scale accuracy to SAT range
    const scoreChange = accuracyChange * 8; // Rough correlation between accuracy and SAT points

    return {
      questionsAnswered,
      averageAccuracy,
      accuracyChange,
      studyTimeHours,
      projectedSATScore,
      scoreChange
    };
  };

  const todaysActivities = getTodaysActivities();
  const performanceTrends = getPerformanceTrends();
  const skillsTestedToday = getSkillsTestedToday();
  const weeklySummary = getWeeklySummary();

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getTrendText = (change: number) => {
    if (change > 0) return `+${change}%`;
    if (change < 0) return `${change}%`;
    return 'No change';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learning Trends</h1>
            <p className="text-gray-600">Track your daily progress and performance</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Today's Activities - Left Side */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaysActivities.length > 0 ? (
                todaysActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-600">
                        {activity.questions} questions • {activity.accuracy}% accuracy
                        {activity.grade && (
                          <span className="ml-2">Grade: <span className="font-medium">{activity.grade}</span></span>
                        )}
                        {activity.score && (
                          <span className="ml-2">Score: <span className="font-medium">{activity.score}/1600</span></span>
                        )}
                      </div>
                      {activity.topics.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {activity.topics.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No activities completed today</p>
                  <p className="text-sm">Start practicing to see your progress here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Trends - Right Side */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{performanceTrends.overallAccuracy}%</div>
                  <div className="text-sm text-gray-600">Overall Accuracy</div>
                  <div className="flex items-center justify-center gap-1 text-xs mt-1">
                    {getTrendIcon(performanceTrends.accuracyChange)}
                    <span className={performanceTrends.accuracyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {getTrendText(performanceTrends.accuracyChange)} from yesterday
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{performanceTrends.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Questions Attempted</div>
                  <div className="text-xs text-gray-500 mt-1">{performanceTrends.studyTime} study time</div>
                </div>
              </div>

              {/* Skills Tested Today */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Skills Tested Today</h4>
                <div className="space-y-2">
                  {skillsTestedToday.length > 0 ? (
                    skillsTestedToday.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{skill.skill}</span>
                        <span className={`text-sm font-medium ${
                          skill.accuracy >= 80 ? 'text-green-600' : 
                          skill.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {skill.accuracy}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills tested today</p>
                  )}
                </div>
              </div>

              {/* AI Insights */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  AI Insights
                </h4>
                <div className="text-sm text-gray-600 space-y-2">
                  {(() => {
                    // Generate AI insights based on real data
                    const insights = [];
                    
                    if (skillsTestedToday.length > 0) {
                      const bestSkill = skillsTestedToday.reduce((prev, current) => 
                        current.accuracy > prev.accuracy ? current : prev
                      );
                      const worstSkill = skillsTestedToday.reduce((prev, current) => 
                        current.accuracy < prev.accuracy ? current : prev
                      );
                      
                      if (performanceTrends.accuracyChange > 0) {
                        insights.push(`Your ${bestSkill.skill} accuracy improved by ${performanceTrends.accuracyChange}% today. You're strongest in ${bestSkill.skill} (${bestSkill.accuracy}%).`);
                      } else if (performanceTrends.accuracyChange < 0) {
                        insights.push(`Your accuracy decreased by ${Math.abs(performanceTrends.accuracyChange)}% today. Consider reviewing ${worstSkill.skill} concepts.`);
                      } else {
                        insights.push(`Consistent performance today! You're excelling in ${bestSkill.skill} with ${bestSkill.accuracy}% accuracy.`);
                      }
                      
                      if (worstSkill.accuracy < 70 && skillsTestedToday.length > 1) {
                        insights.push(`Recommendation: Focus on ${worstSkill.skill} practice tomorrow to improve from ${worstSkill.accuracy}%.`);
                      } else if (bestSkill.accuracy >= 90) {
                        insights.push(`Excellent work on ${bestSkill.skill}! Consider challenging yourself with harder problems.`);
                      }
                    } else {
                      insights.push("No activities completed today. Start practicing to see personalized insights!");
                    }
                    
                    return insights.map((insight, index) => (
                      <p key={index} className={index === insights.length - 1 && insights.length > 1 ? "font-medium text-blue-600" : ""}>
                        {insight}
                      </p>
                    ));
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* This Week's Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{weeklySummary.questionsAnswered}</div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{weeklySummary.averageAccuracy}%</div>
                <div className="text-sm text-gray-600">Average Accuracy</div>
                <div className="flex items-center justify-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{weeklySummary.accuracyChange}% from last week
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{weeklySummary.studyTimeHours}h</div>
                <div className="text-sm text-gray-600">Study Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{weeklySummary.projectedSATScore}</div>
                <div className="text-sm text-gray-600">Projected SAT Score</div>
                <div className="flex items-center justify-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{weeklySummary.scoreChange} points
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrendsPage;