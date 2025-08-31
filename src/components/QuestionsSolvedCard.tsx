import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Target } from 'lucide-react';
import SetGoalDialog from '@/components/Goals/SetGoalDialog';

interface QuestionsSolvedCardProps {
  userName: string;
  marathonStats: any;
}

const QuestionsSolvedCard: React.FC<QuestionsSolvedCardProps> = ({ userName, marathonStats }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '1month' | 'alltime'>('alltime');
  const [questionCounts, setQuestionCounts] = useState({
    '7days': 0,
    '1month': 0,
    'alltime': 0
  });
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState({ '7days': 0, '1month': 0, 'alltime': 0 });
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchQuestionCounts();
    fetchGoals();
  }, [userName]);

  const fetchQuestionCounts = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get all question counts in parallel
      const [
        quizResults7Days,
        quizResults1Month,
        quizResultsAllTime,
        marathonAttempts7Days,
        marathonAttempts1Month,
        marathonAttemptsAllTime,
        mockTests7Days,
        mockTests1Month,
        mockTestsAllTime
      ] = await Promise.all([
        // 7 days - Quiz
        supabase
          .from('quiz_results')
          .select('total_questions')
          .eq('user_id', user.user.id)
          .gte('created_at', sevenDaysAgo.toISOString()),
        
        // 1 month - Quiz
        supabase
          .from('quiz_results')
          .select('total_questions')
          .eq('user_id', user.user.id)
          .gte('created_at', oneMonthAgo.toISOString()),
        
        // All time - Quiz
        supabase
          .from('quiz_results')
          .select('total_questions')
          .eq('user_id', user.user.id),
        
        // 7 days - Marathon
        supabase
          .from('marathon_sessions')
          .select('total_questions')
          .eq('user_id', user.user.id)
          .gte('created_at', sevenDaysAgo.toISOString()),
        
        // 1 month - Marathon
        supabase
          .from('marathon_sessions')
          .select('total_questions')
          .eq('user_id', user.user.id)
          .gte('created_at', oneMonthAgo.toISOString()),
        
        // All time - Marathon
        supabase
          .from('marathon_sessions')
          .select('total_questions')
          .eq('user_id', user.user.id),
        
        // 7 days - Mock Tests
        supabase
          .from('mock_test_results')
          .select('id')
          .eq('user_id', user.user.id)
          .gte('completed_at', sevenDaysAgo.toISOString()),
        
        // 1 month - Mock Tests
        supabase
          .from('mock_test_results')
          .select('id')
          .eq('user_id', user.user.id)
          .gte('completed_at', oneMonthAgo.toISOString()),
        
        // All time - Mock Tests
        supabase
          .from('mock_test_results')
          .select('id')
          .eq('user_id', user.user.id)
      ]);

      // Calculate totals for each period
      const counts = {
        '7days': 
          (quizResults7Days.data?.reduce((sum, quiz) => sum + (quiz.total_questions || 0), 0) || 0) +
          (marathonAttempts7Days.data?.reduce((sum, session) => sum + (session.total_questions || 0), 0) || 0) +
          (mockTests7Days.data?.length || 0) * 154,
        
        '1month': 
          (quizResults1Month.data?.reduce((sum, quiz) => sum + (quiz.total_questions || 0), 0) || 0) +
          (marathonAttempts1Month.data?.reduce((sum, session) => sum + (session.total_questions || 0), 0) || 0) +
          (mockTests1Month.data?.length || 0) * 154,
        
        'alltime': 
          (quizResultsAllTime.data?.reduce((sum, quiz) => sum + (quiz.total_questions || 0), 0) || 0) +
          (marathonAttemptsAllTime.data?.reduce((sum, session) => sum + (session.total_questions || 0), 0) || 0) +
          (mockTestsAllTime.data?.length || 0) * 154
      };

      setQuestionCounts(counts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching question counts:', error);
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('period, target')
        .eq('user_id', user.user.id);
        
      if (error) {
        console.error('Error fetching goals:', error);
        return;
      }
      
      const goalsMap = { '7days': 0, '1month': 0, 'alltime': 0 } as Record<'7days' | '1month' | 'alltime', number>;
      data?.forEach((row: { period: '7days' | '1month' | 'alltime'; target: number }) => {
        goalsMap[row.period] = row.target || 0;
      });
      setGoals(goalsMap);
    } catch (e) {
      console.error('Error fetching goals:', e);
    }
  };

  const handleSaveGoals = async (updated: { '7days': number; '1month': number; 'alltime': number }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      
      // Use individual upserts for each period to ensure proper saving
      const upsertPromises = Object.entries(updated).map(([period, target]) =>
        supabase
          .from('user_goals')
          .upsert({
            user_id: user.user.id,
            period,
            target,
          }, {
            onConflict: 'user_id,period'
          })
      );
      
      const results = await Promise.all(upsertPromises);
      
      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Error saving goals:', errors);
        return;
      }
      
      console.log('Goals saved successfully');
      setGoals(updated);
      setGoalDialogOpen(false);
      
      // Refresh goals to confirm they were saved
      await fetchGoals();
    } catch (e) {
      console.error('Error saving goals:', e);
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case '7days': return 'Last 7 Days';
      case '1month': return 'Last Month';
      case 'alltime': return 'Total Questions';
    }
  };

  const getProgressWidth = () => {
    const currentCount = questionCounts[selectedPeriod];
    const goal = goals[selectedPeriod] || 0;
    if (goal > 0) return Math.min((currentCount / goal) * 100, 100);
    const maxCount = questionCounts.alltime;
    if (selectedPeriod === 'alltime') return 84; // Default width for all time
    return maxCount > 0 ? Math.min((currentCount / maxCount) * 100, 100) : 0;
  };

  const getGoalProgressText = () => {
    const currentCount = questionCounts[selectedPeriod];
    const goal = goals[selectedPeriod] || 0;
    
    if (goal > 0) {
      const percentage = Math.round((currentCount / goal) * 100);
      return `${percentage}% of your goal reached`;
    }
    
    return 'Set a goal to track progress';
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Questions Solved</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setGoalDialogOpen(true)}>
              <Target className="h-3.5 w-3.5 mr-1" /> Set goal
            </Button>
            <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            </div>
          </div>
        </div>
        
        <div className="text-4xl font-bold text-gray-900 mb-1">
          {loading ? '...' : questionCounts[selectedPeriod].toLocaleString()}
        </div>
        <div className="text-sm text-gray-500 mb-4">{getPeriodLabel()}</div>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${getProgressWidth()}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(() => {
              const current = questionCounts[selectedPeriod];
              const goal = goals[selectedPeriod];
              if (goal && goal > 0) return `${current} of ${goal} goal`;
              return selectedPeriod === 'alltime'
                ? `${current} questions solved`
                : `${current} of ${questionCounts.alltime} total`;
            })()}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mb-4">
          {getGoalProgressText()}
        </div>

        {/* Time Period Buttons */}
        <div className="flex gap-1">
          <Button
            variant={selectedPeriod === '7days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('7days')}
            className="flex-1 text-xs py-2 h-8"
          >
            7 Days
          </Button>
          <Button
            variant={selectedPeriod === '1month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('1month')}
            className="flex-1 text-xs py-2 h-8"
          >
            1 Month
          </Button>
          <Button
            variant={selectedPeriod === 'alltime' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('alltime')}
            className="flex-1 text-xs py-2 h-8"
          >
            All Time
          </Button>
        </div>
        <SetGoalDialog
          open={goalDialogOpen}
          onOpenChange={setGoalDialogOpen}
          initialTargets={goals}
          onSave={handleSaveGoals}
        />
      </CardContent>
    </Card>
  );
};

export default QuestionsSolvedCard;
