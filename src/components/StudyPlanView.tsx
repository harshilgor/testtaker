import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Calendar, Clock, BookOpen, Target, TrendingUp, ArrowLeft, Loader2, Play } from 'lucide-react';
import { loadStudyPlan, completeTask, generateStudyPlan, saveStudyPlan, StudyPlan, DailyTask } from '@/services/studyPlanGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// Date utility functions
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

const parseISO = (dateStr: string): Date => {
  return new Date(dateStr);
};

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

type PhaseKey = 'foundation' | 'strengthening' | 'mastery';

interface StudyPlanViewProps {
  userName: string;
  onBack: () => void;
  onCreatePlan?: () => void;
}

const StudyPlanView: React.FC<StudyPlanViewProps> = ({ userName, onBack, onCreatePlan }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      console.log('Loading study plan...');
      let savedPlan = loadStudyPlan();
      console.log('Loaded plan from storage:', savedPlan ? 'Found' : 'Not found');
      
      // If no plan exists but user has preferences, generate it
      if (!savedPlan && user?.id) {
        const preferences = localStorage.getItem('userLearningPlan');
        console.log('Checking preferences:', preferences ? 'Found' : 'Not found');
        if (preferences) {
          try {
            const parsed = JSON.parse(preferences);
            console.log('Parsed preferences:', parsed);
            if (parsed.testDate && parsed.dreamScore && parsed.days && parsed.studyHours) {
              setIsGenerating(true);
              console.log('Generating study plan...');
              const generatedPlan = await generateStudyPlan(user.id, {
                testDate: parsed.testDate,
                dreamScore: parsed.dreamScore,
                days: parsed.days,
                studyHours: parsed.studyHours
              });
              console.log('Generated plan:', generatedPlan);
              saveStudyPlan(generatedPlan);
              savedPlan = generatedPlan;
              console.log('Plan saved and set');
            }
          } catch (error) {
            console.error('Error generating plan from preferences:', error);
          } finally {
            setIsGenerating(false);
          }
        }
      }
      
      setPlan(savedPlan);
      console.log('Final plan state:', savedPlan ? 'Set' : 'Null');
    };

    loadPlan();
    const handleUpdate = () => {
      console.log('Study plan updated event received');
      loadPlan();
    };
    window.addEventListener('studyPlanUpdated', handleUpdate);
    return () => window.removeEventListener('studyPlanUpdated', handleUpdate);
  }, [user?.id]);

  const handleCompleteTask = (taskId: string) => {
    if (!plan) return;
    completeTask(plan.id, taskId);
    const updatedPlan = loadStudyPlan();
    setPlan(updatedPlan);
  };

  const handleStartTask = (task: DailyTask) => {
    switch (task.type) {
      case 'mock_exam':
        navigate('/sat-mock-test');
        break;
      case 'review':
        navigate('/performance-dashboard');
        break;
      case 'practice':
      case 'drill':
      case 'skill_focus':
        // Navigate to quiz with skill/topic
        navigate('/quiz', {
          state: {
            autoSelectTopic: task.skill,
            subject: task.subject === 'math' ? 'math' : task.subject === 'reading-writing' ? 'english' : 'math',
            questionCount: task.questions || 10
          }
        });
        break;
      default:
        navigate('/quiz');
    }
  };

  // Group tasks by date and sort by date - MUST be called before any early returns
  const tasksByDate = useMemo(() => {
    if (!plan || !plan.dailyTasks) return [];
    
    const grouped: Record<string, DailyTask[]> = {};
    plan.dailyTasks.forEach(task => {
      if (!grouped[task.date]) {
        grouped[task.date] = [];
      }
      grouped[task.date].push(task);
    });
    
    // Sort dates and return as array
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, tasks]) => ({
        date,
        tasks: tasks.sort((a, b) => {
          // Sort by type priority: mock_exam > skill_focus > practice > drill > review
          const priority: Record<string, number> = {
            mock_exam: 1,
            skill_focus: 2,
            practice: 3,
            drill: 4,
            review: 5
          };
          return (priority[a.type] || 99) - (priority[b.type] || 99);
        })
      }));
  }, [plan?.dailyTasks]);

  // Calculate stats - MUST be called before any early returns
  const today = plan ? startOfDay(new Date()) : new Date();
  const testDate = plan ? parseISO(plan.testDate) : new Date();
  const daysRemaining = plan ? Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const completedTasks = plan ? plan.dailyTasks.filter(t => t.completed).length : 0;
  const totalTasks = plan ? plan.dailyTasks.length : 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const tasksByDateMap = useMemo(() => {
    const map: Record<string, DailyTask[]> = {};
    tasksByDate.forEach(({ date, tasks }) => {
      map[date] = tasks;
    });
    return map;
  }, [tasksByDate]);

  const dayPhases = useMemo(() => {
    return tasksByDate.map(({ date, tasks }) => ({
      date,
      phase: (tasks[0]?.phase ?? 'foundation') as PhaseKey,
    }));
  }, [tasksByDate]);

  const phaseInfo = useMemo(() => {
    if (plan?.phases) {
      return plan.phases;
    }
    const counts: Record<PhaseKey, number> = { foundation: 0, strengthening: 0, mastery: 0 };
    dayPhases.forEach(({ phase }) => {
      counts[phase] = (counts[phase] || 0) + 1;
    });
    return counts;
  }, [plan?.phases, dayPhases]);

  const todayStart = startOfDay(new Date());

  const completedDayCounts = useMemo(() => {
    const counts: Record<PhaseKey, number> = { foundation: 0, strengthening: 0, mastery: 0 };
    dayPhases.forEach(({ date, phase }) => {
      const dayDate = startOfDay(parseISO(date));
      const tasks = tasksByDateMap[date] ?? [];
      const allCompleted = tasks.length > 0 && tasks.every(task => task.completed);
      if (dayDate < todayStart || (dayDate.getTime() === todayStart.getTime() && allCompleted)) {
        counts[phase] += 1;
      }
    });
    return counts;
  }, [dayPhases, tasksByDateMap, todayStart]);

  const planCompleted = totalTasks > 0 && completedTasks === totalTasks;

  const upcomingDay = useMemo(() => {
    if (planCompleted) return null;
    return dayPhases.find(({ date }) => {
      const dayDate = startOfDay(parseISO(date));
      const tasks = tasksByDateMap[date] ?? [];
      const allCompleted = tasks.length > 0 && tasks.every(task => task.completed);
      return dayDate >= todayStart && !allCompleted;
    }) || null;
  }, [dayPhases, tasksByDateMap, todayStart, planCompleted]);

  let currentPhaseKey: PhaseKey | 'completed' = 'completed';
  let currentPhaseTotalDays = 0;
  let currentPhaseDayIndex = 0;

  if (!planCompleted && upcomingDay) {
    currentPhaseKey = upcomingDay.phase;
    currentPhaseTotalDays = phaseInfo[currentPhaseKey] || 0;
    const upcomingDate = startOfDay(parseISO(upcomingDay.date));
    currentPhaseDayIndex = dayPhases.filter(({ phase, date }) => {
      if (phase !== currentPhaseKey) return false;
      const loopDate = startOfDay(parseISO(date));
      return loopDate <= upcomingDate;
    }).length;
  } else if (planCompleted) {
    currentPhaseKey = 'completed';
  } else if (!planCompleted && !upcomingDay) {
    // All remaining days are in mastery (likely future dates already covered)
    currentPhaseKey = 'mastery';
    currentPhaseTotalDays = phaseInfo.mastery || 0;
    currentPhaseDayIndex = currentPhaseTotalDays;
  }

  const segments = [
    { key: 'foundation' as PhaseKey, label: 'Foundation', color: 'bg-blue-500', days: phaseInfo.foundation },
    { key: 'strengthening' as PhaseKey, label: 'Strengthening', color: 'bg-purple-500', days: phaseInfo.strengthening },
    { key: 'mastery' as PhaseKey, label: 'Mastery', color: 'bg-green-500', days: phaseInfo.mastery },
  ];

  const totalPhaseDays = Math.max(1, segments.reduce((sum, segment) => sum + segment.days, 0));
  const completedStudyDays = Object.values(completedDayCounts).reduce((sum, value) => sum + value, 0);

  const phaseLabels: Record<PhaseKey, string> = {
    foundation: 'Foundation',
    strengthening: 'Strengthening',
    mastery: 'Mastery',
  };

  // Helper functions - MUST be defined before early returns
  const getTaskIcon = (type: DailyTask['type']) => {
    switch (type) {
      case 'mock_exam':
        return <Target className="h-5 w-5 text-purple-600" />;
      case 'review':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'drill':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'skill_focus':
        return <Target className="h-5 w-5 text-orange-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-600" />;
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

  // Early returns - AFTER all hooks and helper functions
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="rounded-2xl border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Generating your study plan...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="rounded-2xl border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">No study plan found. Please create one first.</p>
              <Button 
                onClick={() => {
                  if (onCreatePlan) {
                    onCreatePlan();
                  } else {
                    onBack();
                  }
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Study Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Safety check - if plan exists but has no tasks, show error
  if (!plan.dailyTasks || plan.dailyTasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="rounded-2xl border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">Study plan is empty. Please recreate your study plan.</p>
              <Button 
                onClick={() => {
                  if (onCreatePlan) {
                    onCreatePlan();
                  } else {
                    onBack();
                  }
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Study Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Study Plan</h1>
          <p className="text-gray-600">Track your daily progress toward your goal</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="rounded-2xl border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Score</p>
                  <p className="text-2xl font-bold text-gray-900">{plan.currentScore}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dream Score</p>
                  <p className="text-2xl font-bold text-gray-900">{plan.dreamScore}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Days Remaining</p>
                  <p className="text-2xl font-bold text-gray-900">{daysRemaining}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phase Progress */}
        <Card className="rounded-2xl border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Phase Progress</h2>
              <span className="text-sm text-gray-600">
                {completedStudyDays} / {totalPhaseDays} study days completed
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                {segments.filter(segment => segment.days > 0).map(segment => (
                  <span
                    key={segment.key}
                    className={`${currentPhaseKey === segment.key ? 'text-gray-900' : ''}`}
                  >
                    {segment.label}
                  </span>
                ))}
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                {segments.filter(segment => segment.days > 0).map(segment => {
                  const width = `${(segment.days / totalPhaseDays) * 100}%`;
                  const completionRatio =
                    segment.days > 0
                      ? Math.min(1, completedDayCounts[segment.key] / segment.days)
                      : 0;
                  return (
                    <div key={segment.key} className="h-full relative" style={{ width }}>
                      <div className="absolute inset-0 bg-gray-100" />
                      <div
                        className={`absolute inset-y-0 left-0 ${segment.color} transition-all`}
                        style={{
                          width: `${completionRatio * 100}%`,
                          opacity:
                            currentPhaseKey === segment.key ? 0.95 : 0.45
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">
                {currentPhaseKey === 'completed'
                  ? 'All phases completed 🎉'
                  : `Current Phase: ${phaseLabels[currentPhaseKey as PhaseKey]}`}
              </span>
              {currentPhaseKey !== 'completed' && currentPhaseTotalDays > 0 && (
                <span>
                  Day {Math.min(currentPhaseDayIndex || 1, currentPhaseTotalDays)} of {currentPhaseTotalDays}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Days Stacked Vertically */}
        <div className="space-y-6">
          {tasksByDate.map(({ date, tasks }) => {
            const taskDate = parseISO(date);
            const isTaskToday = isToday(taskDate);
            const isTaskPast = isPast(taskDate) && !isTaskToday;
            
            return (
              <Card key={date} className="rounded-2xl border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {isTaskToday ? "Today" : formatDate(date)}
                    {isTaskToday && <span className="ml-2 text-sm font-normal text-blue-600">• Today</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border ${
                          task.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        } transition-colors`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-0.5">
                              {task.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <button
                                  onClick={() => handleCompleteTask(task.id)}
                                  className="text-gray-400 hover:text-green-600 transition-colors"
                                >
                                  <Circle className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getTaskIcon(task.type)}
                                <span className="text-xs font-medium text-gray-500">
                                  {getTaskTypeLabel(task.type)}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{task.estimatedMinutes} min</span>
                                </div>
                                {task.questions && (
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    <span>{task.questions} questions</span>
                                  </div>
                                )}
                                {task.skill && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                    {task.skill}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {!task.completed && (
                            <Button
                              onClick={() => handleStartTask(task)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium whitespace-nowrap"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanView;

