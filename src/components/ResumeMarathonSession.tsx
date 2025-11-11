import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MarathonSession } from '@/types/marathon';

const ResumeMarathonSession: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<MarathonSession | null>(null);

  const checkForIncompleteSession = useCallback(() => {
    const savedSession = localStorage.getItem('currentMarathonSession');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Check if session is incomplete (no endTime)
        if (parsed && !parsed.endTime) {
          setSession(parsed);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error('Error parsing marathon session:', error);
        setSession(null);
      }
    } else {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    checkForIncompleteSession();
    
    // Listen for storage changes (when session is completed/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentMarathonSession') {
        checkForIncompleteSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case of same-tab updates
    const interval = setInterval(checkForIncompleteSession, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [checkForIncompleteSession]);

  const handleResume = useCallback(() => {
    if (session) {
      // Navigate to marathon page with the saved session
      navigate('/marathon', {
        state: {
          marathonSettings: {
            subjects: session.subjects,
            difficulty: session.difficulty,
            timedMode: session.timedMode,
            timeGoalMinutes: session.timeGoalMinutes,
            calculatorEnabled: true,
            darkMode: false,
            fontSize: 'medium' as const
          }
        }
      });
    }
  }, [session, navigate]);

  const getSubjectLabel = useCallback((subjects: ('math' | 'english' | 'both')[]) => {
    if (subjects.includes('both')) return 'Math & Reading/Writing';
    if (subjects.includes('math')) return 'Math';
    if (subjects.includes('english')) return 'Reading/Writing';
    return 'SAT Practice';
  }, []);

  const getDifficultyLabel = useCallback((difficulty: string) => {
    const labels: Record<string, string> = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      mixed: 'Mixed Difficulty'
    };
    return labels[difficulty] || difficulty;
  }, []);

  const getSessionType = useCallback(() => {
    if (!session) return 'Practice Marathon';
    if (session.timedMode) {
      return `Timed Marathon (${session.timeGoalMinutes || 30} min)`;
    }
    return 'Practice Marathon';
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {getSubjectLabel(session.subjects)} Marathon
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {getSessionType()} • {getDifficultyLabel(session.difficulty)}
            </p>
            <Button
              onClick={handleResume}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume Learning
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeMarathonSession;

