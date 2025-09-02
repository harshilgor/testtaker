import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Target } from 'lucide-react';
import SetGoalDialog from '@/components/Goals/SetGoalDialog';
import { useData } from '@/contexts/DataContext';

interface QuestionsSolvedCardOptimizedProps {
  userName: string;
  marathonStats: any;
}

const QuestionsSolvedCardOptimized: React.FC<QuestionsSolvedCardOptimizedProps> = ({ userName, marathonStats }) => {
  const { quizResults, marathonSessions, mockTests, loading: dataLoading } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '1month' | 'alltime'>('alltime');
  const [goals, setGoals] = useState({ '7days': 0, '1month': 0, 'alltime': 0 });
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const [questionCounts, setQuestionCounts] = useState({ '7days': 0, '1month': 0, 'alltime': 0 });
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setCountsLoading(true);
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) { setCountsLoading(false); return; }
        const uid = user.user.id;
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [allResp, weekResp, monthResp] = await Promise.all([
          supabase.from('question_attempts_v2').select('id', { count: 'exact', head: true }).eq('user_id', uid),
          supabase.from('question_attempts_v2').select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('created_at', sevenDaysAgo),
          supabase.from('question_attempts_v2').select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('created_at', oneMonthAgo),
        ]);

        setQuestionCounts({
          '7days': weekResp.count || 0,
          '1month': monthResp.count || 0,
          'alltime': allResp.count || 0,
        });
      } catch (e) {
        console.error('Failed to load question counts', e);
      } finally {
        setCountsLoading(false);
      }
    };
    fetchCounts();
  }, [userName]);

  useEffect(() => {
    fetchGoals();
  }, [userName]);

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

      if (data) {
        const mapped = { '7days': 0, '1month': 0, 'alltime': 0 };
        data.forEach((g: { period: '7days' | '1month' | 'alltime'; target: number }) => {
          if (g.period in mapped) (mapped as any)[g.period] = g.target || 0;
        });
        setGoals(mapped);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleGoalSave = async (period: '7days' | '1month' | 'alltime', value: number) => {
    setGoals(prev => ({ ...prev, [period]: value }));
  };

  const handleBulkGoalSave = async (newGoals: { '7days': number; '1month': number; 'alltime': number }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const rows = [
        { user_id: user.user.id, period: '7days', target: newGoals['7days'] },
        { user_id: user.user.id, period: '1month', target: newGoals['1month'] },
        { user_id: user.user.id, period: 'alltime', target: newGoals['alltime'] },
      ];

      const { error } = await supabase
        .from('user_goals')
        .upsert(rows, { onConflict: 'user_id,period' });

      if (error) throw error;

      setGoals(newGoals);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const getProgress = (period: '7days' | '1month' | 'alltime') => {
    const current = questionCounts[period];
    const goal = goals[period];
    return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  };

  const getPeriodLabel = (period: '7days' | '1month' | 'alltime') => {
    switch (period) {
      case '7days': return 'Past 7 Days';
      case '1month': return 'Past Month';
      case 'alltime': return 'All Time';
      default: return '';
    }
  };

  const currentCount = questionCounts[selectedPeriod];
  const currentGoal = goals[selectedPeriod];
  const progress = getProgress(selectedPeriod);

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Questions Solved</h3>
          <Target className="h-5 w-5 text-blue-600" />
        </div>

        {/* Period Selection */}
        <div className="flex space-x-2 mb-6">
          {(['7days', '1month', 'alltime'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {getPeriodLabel(period)}
            </button>
          ))}
        </div>

        {/* Main Stats */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">
          {countsLoading ? '...' : currentCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {getPeriodLabel(selectedPeriod)}
          </div>
          
          {currentGoal > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Goal Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {currentCount} / {currentGoal} questions
              </div>
            </div>
          )}
        </div>

        {/* Set Goal Button */}
        <Button
          onClick={() => setGoalDialogOpen(true)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {currentGoal > 0 ? 'Update Goal' : 'Set Goal'}
        </Button>

        {/* Goal Dialog */}
        <SetGoalDialog
          open={goalDialogOpen}
          onOpenChange={setGoalDialogOpen}
          goalType="questions_solved"
          currentGoals={goals}
          onSave={handleBulkGoalSave}
          userName={userName}
        />
      </CardContent>
    </Card>
  );
};

export default QuestionsSolvedCardOptimized;

// Also export as the original name for compatibility  
export { QuestionsSolvedCardOptimized as QuestionsSolvedCard };
