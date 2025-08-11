
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface StreakCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  activityDates: Date[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ isOpen, onClose, activityDates }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    // Convert to Monday = 0, Sunday = 6
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
    
    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const hasActivityOnDate = (day: number) => {
    if (!day) return false;
    
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = checkDate.toDateString();
    
    return activityDates.some(activityDate => 
      activityDate.toDateString() === dateString
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg font-semibold">Calendar</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousMonth}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-white text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextMonth}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day, index) => (
              <div key={index} className="text-center text-slate-400 text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={`
                  h-10 w-10 flex items-center justify-center text-sm rounded-lg
                  ${day ? 'text-slate-300' : ''}
                  ${day && hasActivityOnDate(day) 
                    ? 'bg-green-500 text-white font-semibold' 
                    : day 
                      ? 'hover:bg-slate-700' 
                      : ''
                  }
                `}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-slate-300">Days with streak activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border border-slate-600 rounded"></div>
              <span className="text-slate-400">Days without activity</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakCalendar;
