import React, { useState, useEffect, useMemo } from 'react';
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

  // Boundaries for periods
  const now = useMemo(() => new Date(), []);
  const sevenDaysAgo = useMemo(() => new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), [now]);
  const oneMonthAgo = useMemo(() => new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), [now]);

  // Helper to include record based on period
  const isInPeriod = (dateStr: string | null | undefined, period: '7days' | '1month' | 'alltime') => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (period === '7days') return d >= sevenDaysAgo;
    if (period === '1month') return d >= oneMonthAgo;
    return true; // alltime
  };

  // Compute totals across all modes, memoized and side-effect free
  const counts = useMemo(() => {
    const safeQuizzes = quizResults || [];
    const safeMarathons = marathonSessions || [];
    const safeMocks = mockTests || [];

    const computeFor = (period: '7days' | '1month' | 'alltime') => {
      const quizTotal = safeQuizzes
        .filter(q => isInPeriod(q.created_at, period))
        .reduce((sum, q) => sum + (q.total_questions || 0), 0);

      const marathonTotal = safeMarathons
        .filter(m => isInPeriod(m.created_at, period))
        .reduce((sum, m) => sum + (m.total_questions || 0), 0);

      // Mock tests don't have total_questions; estimate per test based on SAT sections
      const mockPerTestQuestions = 20 + 44; // Math + English
      const mockTotal = safeMocks
        .filter(m => isInPeriod((m.completed_at || m.created_at) as string, period))
        .reduce((sum) => sum + mockPerTestQuestions, 0);

      return quizTotal + marathonTotal + mockTotal;
    };

    return {
      sevenDays: computeFor('7days'),
      oneMonth: computeFor('1month'),
      allTime: computeFor('alltime'),
    };
  }, [quizResults, marathonSessions, mockTests, sevenDaysAgo, oneMonthAgo]);

  // Goals
  useEffect(() => {
  const fetchGoals = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data, error } = await supabase
        .from('user_goals')
        .select('period, target')
        .eq('user_id', user.user.id);
        if (error) return;
        const mapped = { '7days': 0, '1month': 0, 'alltime': 0 } as { '7days': number; '1month': number; 'alltime': number };
        (data || []).forEach((g: { period: '7days' | '1month' | 'alltime'; target: number }) => {
          mapped[g.period] = g.target || 0;
        });
        setGoals(mapped);
      } catch {}
    };
    fetchGoals();
  }, [userName]);

  const handleBulkGoalSave = async (newGoals: { '7days': number; '1month': number; 'alltime': number }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const rows = [
        { user_id: user.user.id, period: '7days', target: newGoals['7days'] },
        { user_id: user.user.id, period: '1month', target: newGoals['1month'] },
        { user_id: user.user.id, period: 'alltime', target: newGoals['alltime'] },
      ];
      await supabase.from('user_goals').upsert(rows, { onConflict: 'user_id,period' });
      setGoals(newGoals);
    } catch {}
  };

  const getProgress = (period: '7days' | '1month' | 'alltime') => {
    const current = period === '7days' ? counts.sevenDays : period === '1month' ? counts.oneMonth : counts.allTime;
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

  const currentCount = useMemo(() => (
    selectedPeriod === '7days' ? counts.sevenDays : selectedPeriod === '1month' ? counts.oneMonth : counts.allTime
  ), [selectedPeriod, counts]);

  const currentGoal = goals[selectedPeriod];
  const progress = getProgress(selectedPeriod);
  const isLoading = dataLoading;

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
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>
            </div>
          ) : (
            <>
          <div className="text-3xl font-bold text-gray-900 mb-2">
                {currentCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {getPeriodLabel(selectedPeriod)}
          </div>
            </>
          )}
          
          {currentGoal > 0 && !isLoading && (
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
