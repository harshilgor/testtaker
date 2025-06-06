
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface MarathonTimerProps {
  timeGoalMinutes: number;
  onTimeUp: () => void;
}

const MarathonTimer: React.FC<MarathonTimerProps> = ({ timeGoalMinutes, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(timeGoalMinutes * 60); // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    const percentage = (timeLeft / (timeGoalMinutes * 60)) * 100;
    if (percentage <= 10) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage <= 25) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className={`fixed top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg border ${getColorClass()} font-mono text-sm font-medium z-50`}>
      <Clock className="h-4 w-4" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default MarathonTimer;
