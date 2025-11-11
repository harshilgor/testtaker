import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TotalXPWidgetProps { 
  variant?: 'bare' | 'card' 
}

interface AttemptRow {
  topic?: string | null;
  subject?: string | null;
  difficulty?: string | null;
  is_correct: boolean;
  created_at: string;
}

const XP_FOR = {
  easy: 10,
  medium: 25,
  hard: 50,
};

const PENALTY_INCORRECT = 15;

function calculateTotalXP(attempts: AttemptRow[]): number {
  let totalXP = 0;
  
  attempts.forEach(attempt => {
    const diff = (attempt.difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard';
    const gained = attempt.is_correct 
      ? (XP_FOR[diff] || 25) 
      : -PENALTY_INCORRECT;
    totalXP += gained;
  });
  
  return Math.max(0, totalXP);
}

const TotalXPWidget: React.FC<TotalXPWidgetProps> = ({ variant = 'card' }) => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttempts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('question_attempts_v2')
          .select('topic, subject, difficulty, is_correct, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5000);

        if (!error && data) {
          setAttempts(data as AttemptRow[]);
        }
      } catch (error) {
        console.error('Error loading attempts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAttempts();
  }, [user]);

  const totalXP = useMemo(() => {
    return calculateTotalXP(attempts);
  }, [attempts]);

  if (loading) {
    if (variant === 'bare') {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      );
    }
    return (
      <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  const Content = (
    <div className="w-full h-full flex flex-col justify-between pb-4">
      <div className="text-center py-2">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
          <Star className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
        </div>
        <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-0.5">
          {totalXP.toLocaleString()}
        </div>
        <div className="text-xs lg:text-sm text-gray-600">
          Total XP Earned
        </div>
      </div>
    </div>
  );

  if (variant === 'bare') {
    return Content;
  }

  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">Total XP</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
        {Content}
      </CardContent>
    </Card>
  );
};

export default TotalXPWidget;
