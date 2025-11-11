import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, Circle, BookOpen, Target, TrendingUp } from 'lucide-react';
import { loadStudyPlan, DailyTask } from '@/services/studyPlanGenerator';

interface LearningPlanCardProps {
  onEdit?: () => void;
  onViewPlan?: () => void;
}

const DAYS: Array<{ key: string; label: string }> = [
  { key: 'M', label: 'M' },
  { key: 'T', label: 'T' },
  { key: 'W', label: 'W' },
  { key: 'T2', label: 'T' },
  { key: 'F', label: 'F' },
  { key: 'S', label: 'S' },
  { key: 'S2', label: 'S' },
];

const LEARNING_PLAN_KEY = 'userLearningPlan';

const LearningPlanCard: React.FC<LearningPlanCardProps> = ({ onEdit, onViewPlan }) => {
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({
    M: true,
    T: true,
    W: true,
    T2: true,
    F: true,
    S: true,
    S2: true,
  });
  const [hasPlan, setHasPlan] = useState(false);
  const [dreamScore, setDreamScore] = useState<number | null>(null);
  const [studyHours, setStudyHours] = useState<number | null>(null);
  const [testDate, setTestDate] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<any>(null);

  // Get today's tasks
  const todayTasks = useMemo(() => {
    if (!studyPlan || !studyPlan.dailyTasks) return [];
    const today = new Date().toISOString().split('T')[0];
    return studyPlan.dailyTasks.filter((task: DailyTask) => task.date === today);
  }, [studyPlan]);

  const loadPlan = () => {
    // Check if user has a saved learning plan
    const savedPlan = localStorage.getItem(LEARNING_PLAN_KEY);
    if (savedPlan) {
      try {
        const parsed = JSON.parse(savedPlan);
        if (parsed.days) {
          setActiveDays(parsed.days);
        }
        if (parsed.dreamScore) {
          setDreamScore(parsed.dreamScore);
        }
        if (parsed.studyHours) {
          setStudyHours(parsed.studyHours);
        }
        if (parsed.testDate) {
          setTestDate(parsed.testDate);
        }
        setHasPlan(true);
      } catch (e) {
        // Invalid saved plan, treat as no plan
        setHasPlan(false);
      }
    } else {
      setHasPlan(false);
    }

    // Also load the study plan for today's tasks
    const plan = loadStudyPlan();
    setStudyPlan(plan);
  };

  useEffect(() => {
    loadPlan();

    // Listen for storage changes (when plan is updated from another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LEARNING_PLAN_KEY) {
        loadPlan();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event (for same-tab updates)
    const handlePlanUpdate = () => {
      loadPlan();
    };
    
    window.addEventListener('learningPlanUpdated', handlePlanUpdate);
    
    // Also listen for study plan updates
    const handleStudyPlanUpdate = () => {
      const plan = loadStudyPlan();
      setStudyPlan(plan);
    };
    window.addEventListener('studyPlanUpdated', handleStudyPlanUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('learningPlanUpdated', handlePlanUpdate);
      window.removeEventListener('studyPlanUpdated', handleStudyPlanUpdate);
    };
  }, []);

  const handleEdit = () => {
    if (onEdit) onEdit();
  };

  const activeDaysCount = Object.values(activeDays).filter(Boolean).length;

  const getTaskIcon = (type: DailyTask['type']) => {
    switch (type) {
      case 'mock_exam':
        return <Target className="h-3 w-3 text-purple-600" />;
      case 'review':
        return <BookOpen className="h-3 w-3 text-blue-600" />;
      case 'drill':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'skill_focus':
        return <Target className="h-3 w-3 text-orange-600" />;
      default:
        return <Circle className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTaskTypeLabel = (type: DailyTask['type']) => {
    switch (type) {
      case 'mock_exam':
        return 'Mock Exam';
      case 'review':
        return 'Review';
      case 'drill':
        return 'Drill';
      case 'skill_focus':
        return 'Skill Focus';
      default:
        return 'Practice';
    }
  };

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">Learning plan</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {hasPlan ? (
          <>
            {dreamScore && (
              <p className="text-gray-600 text-sm mb-2">
                Target score: <span className="font-semibold text-gray-900">{dreamScore}</span>
              </p>
            )}
            {studyHours && (
              <p className="text-gray-600 text-sm mb-4">
                Study time: <span className="font-semibold text-gray-900">{studyHours} hours/day</span>
              </p>
            )}

            {/* Today's Tasks - Glass Component */}
            {todayTasks.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-white/60 backdrop-blur-md border border-white/20 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-700">Today's Tasks</span>
                  <span className="text-xs text-gray-500">({todayTasks.length})</span>
                </div>
                <div className="space-y-2">
                  {todayTasks.slice(0, 2).map((task: DailyTask) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        task.completed
                          ? 'bg-green-50/50 border border-green-200/50'
                          : 'bg-white/40 border border-gray-200/50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {getTaskIcon(task.type)}
                          <span className="text-xs font-medium text-gray-700 truncate">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedMinutes} min</span>
                          </div>
                          {task.questions && (
                            <div className="flex items-center gap-0.5">
                              <BookOpen className="h-3 w-3" />
                              <span>{task.questions} q</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {todayTasks.length > 2 && (
                    <p className="text-xs text-gray-500 text-center pt-1">
                      +{todayTasks.length - 2} more task{todayTasks.length - 2 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-600 text-sm mb-4">
            Create a personalized study plan to reach your goals.
          </p>
        )}

        <div className="flex items-center gap-3 mb-4">
          {DAYS.map((d) => (
            <span
              key={d.key}
              className={`inline-flex items-center justify-center h-8 w-8 rounded-full border text-sm font-medium transition-colors ${
                activeDays[d.key]
                  ? 'bg-white border-gray-300 text-gray-900'
                  : 'bg-white border-gray-200 text-gray-400'
              }`}
              aria-label={d.label}
            >
              {d.label}
            </span>
          ))}
        </div>

        {hasPlan && onViewPlan ? (
          <Button variant="link" className="p-0 h-auto text-blue-600" onClick={onViewPlan}>
            View Study Plan
          </Button>
        ) : (
          <Button variant="link" className="p-0 h-auto text-blue-600" onClick={handleEdit}>
            Create Study Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningPlanCard;


