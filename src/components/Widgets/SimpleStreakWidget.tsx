import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useOptimizedStreak } from '@/hooks/useOptimizedStreak';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SimpleStreakWidgetProps { variant?: 'bare' | 'card' }

const MIN_QUESTIONS_FOR_STREAK = 5;

const SimpleStreakWidget: React.FC<SimpleStreakWidgetProps> = ({ variant = 'card' }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { streakData, questionsToday, isLoading, hasJustReached5Questions } = useOptimizedStreak(user?.user_metadata?.full_name || 'User');
  const [previousQuestionsToday, setPreviousQuestionsToday] = useState(0);
  const [hasShownNotification, setHasShownNotification] = useState(false);

  // Track when user reaches 5 questions and show notification
  useEffect(() => {
    if (questionsToday >= MIN_QUESTIONS_FOR_STREAK && previousQuestionsToday < MIN_QUESTIONS_FOR_STREAK && !hasShownNotification) {
      toast({
        title: "🎉 Today's streak recorded!",
        description: "You've solved 5 questions today. Keep up the great work!",
        duration: 4000,
      });
      setHasShownNotification(true);
    }
    setPreviousQuestionsToday(questionsToday);
  }, [questionsToday, previousQuestionsToday, hasShownNotification, toast]);

  // Reset notification flag when questions reset (new day)
  useEffect(() => {
    if (questionsToday === 0) {
      setHasShownNotification(false);
    }
  }, [questionsToday]);

  if (isLoading) {
    if (variant === 'bare') {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
        </div>
      );
    }
    return (
      <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
        </CardContent>
      </Card>
    );
  }

  const questionsRemaining = Math.max(0, MIN_QUESTIONS_FOR_STREAK - questionsToday);
  const hasStreakToday = questionsToday >= MIN_QUESTIONS_FOR_STREAK;
  const flameColor = hasStreakToday ? 'text-orange-500' : 'text-gray-300';

  const Content = (
    <div className="w-full h-full flex flex-col justify-between pb-4">
      <div className="text-center py-2">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
          <Flame className={`h-5 w-5 lg:h-6 lg:w-6 transition-colors ${flameColor}`} />
        </div>
        <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-0.5">
          {streakData?.current_streak || 0}
        </div>
        <div className="text-xs lg:text-sm text-gray-600 mb-1">
          Day Streak
        </div>
        {!hasStreakToday && questionsRemaining > 0 && (
          <div className="text-xs text-orange-600 font-medium mt-1 px-2 py-1 bg-orange-50 rounded border border-orange-200">
            Solve {questionsRemaining} more {questionsRemaining === 1 ? 'question' : 'questions'} to get today's streak
          </div>
        )}
        {hasStreakToday && (
          <div className="text-xs text-green-700 font-medium mt-1 px-2 py-1 bg-green-50 rounded border border-green-200">
            ✓ Today's streak recorded
          </div>
        )}
      </div>
    </div>
  );

  if (variant === 'bare') {
    return Content;
  }

  return (
    <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">Study Streak</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
        {Content}
      </CardContent>
    </Card>
  );
};

export default SimpleStreakWidget;
