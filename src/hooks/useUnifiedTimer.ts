import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerConfig {
  initialTime?: number; // in seconds
  countDown?: boolean; // true for countdown, false for count up
  autoStart?: boolean;
  onTimeUp?: () => void;
  onTick?: (currentTime: number) => void;
}

export const useUnifiedTimer = ({
  initialTime = 0,
  countDown = false,
  autoStart = false,
  onTimeUp,
  onTick
}: TimerConfig = {}) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTime(initialTime);
    setIsRunning(false);
    setIsFinished(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialTime]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Format time in a more readable way (e.g., "2 minutes", "45 seconds")
  const formatTimeReadable = useCallback((seconds: number): string => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    
    if (mins === 0) {
      return `${secs} second${secs !== 1 ? 's' : ''}`;
    } else if (secs === 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }, []);

  useEffect(() => {
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = countDown ? prevTime - 1 : prevTime + 1;
          
          // Call onTick callback
          onTick?.(newTime);
          
          // Check if countdown finished
          if (countDown && newTime <= 0) {
            setIsFinished(true);
            setIsRunning(false);
            onTimeUp?.();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isFinished, countDown, onTimeUp, onTick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    time,
    isRunning,
    isFinished,
    startTimer,
    pauseTimer,
    resetTimer,
    stopTimer,
    formatTime,
    formatTimeReadable,
    formattedTime: formatTime(time),
    readableTime: formatTimeReadable(time)
  };
};