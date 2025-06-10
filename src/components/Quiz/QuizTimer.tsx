
import React, { useState, useEffect } from 'react';

interface QuizTimerProps {
  onTimeUpdate: (time: number) => void;
}

const QuizTimer: React.FC<QuizTimerProps> = ({ onTimeUpdate }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        const newTime = prev + 1;
        onTimeUpdate(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUpdate]);

  return null; // This is a logic-only component
};

export default QuizTimer;
