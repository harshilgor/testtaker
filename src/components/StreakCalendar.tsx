import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StreakCalendarProps {
  userName: string;
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
}

interface DayActivity {
  date: Date;
  hasActivity: boolean;
  isToday: boolean;
  streakDay: number; // 0 = no streak, 1+ = day in streak
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({
  userName,
  currentDate = new Date(),
  onDateChange
}) => {
  // Fetch user activity data for the current month
  const { data: activityData = [] } = useQuery({
    queryKey: ['streak-calendar', userName, currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Get activity from all practice modes
      const [quizResults, marathonSessions, mockResults] = await Promise.all([
        supabase
          .from('quiz_results')
          .select('created_at')
          .eq('user_id', user.user.id)
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString()),
        
        supabase
          .from('marathon_sessions')
          .select('created_at')
          .eq('user_id', user.user.id)
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString()),
        
        supabase
          .from('mock_test_results')
          .select('completed_at')
          .eq('user_id', user.user.id)
          .gte('completed_at', startOfMonth.toISOString())
          .lte('completed_at', endOfMonth.toISOString())
      ]);

      // Combine all activity dates
      const activityDates = new Set<string>();
      
      quizResults.data?.forEach(result => {
        const date = new Date(result.created_at).toDateString();
        activityDates.add(date);
      });
      
      marathonSessions.data?.forEach(session => {
        const date = new Date(session.created_at).toDateString();
        activityDates.add(date);
      });
      
      mockResults.data?.forEach(result => {
        const date = new Date(result.completed_at).toDateString();
        activityDates.add(date);
      });

      return Array.from(activityDates).map(dateStr => new Date(dateStr));
    },
    enabled: !!userName,
    staleTime: 300_000, // 5 minutes
  });

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    
    // Get first day of week (Monday = 0)
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days: DayActivity[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      const date = new Date(firstDay.getTime() - (startDay - i) * 24 * 60 * 60 * 1000);
      days.push({
        date,
        hasActivity: false,
        isToday: false,
        streakDay: 0
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const hasActivity = activityData.some(activityDate => 
        activityDate.toDateString() === date.toDateString()
      );
      const isToday = date.toDateString() === today.toDateString();
      
      days.push({
        date,
        hasActivity,
        isToday,
        streakDay: 0 // We'll calculate streak later
      });
    }
    
    // Add empty cells to fill the grid (6 weeks * 7 days = 42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(lastDay.getTime() + i * 24 * 60 * 60 * 1000);
      days.push({
        date,
        hasActivity: false,
        isToday: false,
        streakDay: 0
      });
    }
    
    return days;
  }, [currentDate, activityData]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    onDateChange?.(newDate);
  };

  const monthName = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const getDayColor = (day: DayActivity) => {
    const isCurrentMonth = day.date.getMonth() === currentDate.getMonth();
    
    if (!isCurrentMonth) {
      return 'text-gray-300';
    }
    
    if (day.isToday && day.hasActivity) {
      return 'bg-green-500 text-white font-bold border-2 border-green-600';
    } else if (day.isToday) {
      return 'bg-blue-100 text-blue-800 font-bold border-2 border-blue-400';
    } else if (day.hasActivity) {
      return 'bg-green-500 text-white font-semibold';
    } else {
      return 'text-gray-600 hover:bg-gray-100';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900 text-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <CardTitle className="text-lg font-semibold text-white">
            {monthName.toUpperCase()}
          </CardTitle>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-1"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <div key={index} className="h-8 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-400">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = day.date.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={index}
                className={`
                  h-8 w-8 flex items-center justify-center text-sm rounded-md cursor-pointer transition-colors
                  ${!isCurrentMonth ? 'text-gray-600' : ''}
                  ${day.isToday && day.hasActivity ? 'bg-white text-gray-900 font-bold' : ''}
                  ${day.isToday && !day.hasActivity ? 'border border-gray-500 text-gray-300 font-bold' : ''}
                  ${!day.isToday && day.hasActivity ? 'bg-white text-gray-900 font-semibold' : ''}
                  ${!day.isToday && !day.hasActivity && isCurrentMonth ? 'text-gray-500 hover:bg-gray-800' : ''}
                `}
                title={day.hasActivity ? 'Active day' : 'No activity'}
              >
                {day.date.getDate()}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-white rounded"></div>
                <span className="text-gray-400">Active</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-gray-500 rounded"></div>
                <span className="text-gray-400">Today</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCalendar;