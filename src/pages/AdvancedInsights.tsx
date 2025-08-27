import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, BarChart3, Eye, Target, Clock, Zap, AlertCircle, Brain, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

type Subject = 'math' | 'reading-writing';
type MetricType = 'best' | 'needs-work' | 'time-intensive' | 'quick';

interface SkillPerformance {
  skill: string;
  accuracy: number;
  questionsAttempted: number;
  avgTime: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

const AdvancedInsights = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<Subject>('reading-writing');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('best');
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiErrorBySkill, setAiErrorBySkill] = useState<Record<string, string | null>>({});
  const [aiBySkill, setAiBySkill] = useState<Record<string, {
    summary?: string;
    rootCauses?: string[];
    weaknesses?: string[];
    strengths?: string[];
    trends?: string[];
    benchmarks?: string[];
    recommendations?: string[];
    motivation?: string[];
    projections?: string[];
  }>>({});
  const [aiBulletsBySkill, setAiBulletsBySkill] = useState<Record<string, string[]>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingLearnSkill, setPendingLearnSkill] = useState<SkillPerformance | null>(null);


  const generateInlineInsights = async (skill: SkillPerformance) => {
    try {
      setAiErrorBySkill(prev => ({ ...prev, [skill.skill]: null }));
      setAiLoading(skill.skill);

      // Build attempts context from localStorage (instant UX), filtered by subject/topic
      const stored: any[] = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const subjectLabel = selectedSubject === 'math' ? 'Math' : 'English';
      const attempts = stored
        .filter((entry: any) => entry?.subject === subjectLabel)
        .flatMap(entry => {
          const answers = Array.isArray(entry.answers) ? entry.answers : [];
          return (entry.questions || []).map((q: any, idx: number) => ({
            topic: q?.topic,
            difficulty: q?.difficulty || 'medium',
            time_spent: Number(q?.timeSpent) || 0,
            is_correct: answers[idx] === q?.correctAnswer,
          }));
        })
        .filter((a: any) => a.topic === skill.skill)
        .slice(-300);

      // Fetch user's dream score goal (optional). Default to 1500 if not set
      let dreamScore = 1500;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: goals } = await supabase
            .from('user_goals')
            .select('target, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1);
          if (Array.isArray(goals) && goals[0]?.target) {
            const t = Number(goals[0].target);
            if (!Number.isNaN(t) && t > 0) dreamScore = t;
          }
        }
      } catch {}

      const payload = {
        subject: selectedSubject,
        skill: skill.skill,
        summary: skill,
        attempts,
        dreamScore
      };

      // Use server-side function to generate analysis (keeps API keys on server)
      const subjectKey = selectedSubject === 'math' ? 'math' : 'english';
      const { data, error } = await supabase.functions.invoke('openai-insight-generator', {
        body: {
          skillAnalysisData: {
            subject: subjectKey,
            skill: skill.skill,
            summary: skill,
            attempts,
            dreamScore
          }
        }
      });

      if (error || !data?.analysis) {
        throw new Error('AI request failed');
      }

      const parsed: any = data.analysis || {};
      setAiBySkill(prev => ({ ...prev, [skill.skill]: parsed || {} }));

      // Build bullet list for simple display
      const collect = (arr?: string[]) => Array.isArray(arr) ? arr.filter(Boolean) : [];
      let bullets: string[] = [
        ...collect(parsed.rootCauses),
        ...collect(parsed.recommendations),
        ...collect(parsed.strengths),
        ...collect(parsed.weaknesses),
        ...collect(parsed.trends),
        ...collect(parsed.benchmarks),
        ...collect(parsed.motivation),
        ...collect(parsed.projections)
      ].slice(0, 12);

      // Heuristic fallback when model returns empty or unparsable JSON
      if (bullets.length === 0) {
        const acc = skill.accuracy;
        const avg = skill.avgTime;
        bullets = [
          `Current accuracy is ${acc}%. Focus error review after each attempt to lift by 10–15%.`,
          `Avg. time per question is ${avg} sec — aim for < 45 sec on Medium and < 30 sec on Easy.`,
          `Practice mix: ${skill.difficultyBreakdown.easy}/${skill.difficultyBreakdown.medium}/${skill.difficultyBreakdown.hard} (E/M/H). Add 3–5 Hard questions daily.`,
          `Do a 10-question timed drill for ${skill.skill}, then re-do only the incorrect ones within 24 hours.`,
          `Tag misses by pattern (inference, vocabulary-in-context, distractor traps) and create one-line rules to counter them.`,
        ];
      }
      setAiBulletsBySkill(prev => ({ ...prev, [skill.skill]: bullets }));
    } catch (e: any) {
      setAiErrorBySkill(prev => ({ ...prev, [skill.skill]: 'Unable to generate insights right now. Please try again.' }));
    } finally {
      setAiLoading(null);
    }
  };

  // Fetch performance data for all skills
  const { data: performanceData = [], isLoading } = useQuery({
    queryKey: ['advanced-insights', selectedSubject],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const testFilter = selectedSubject === 'math' ? 'Math' : 'Reading and Writing';
      
      // First, get ALL available skills for the selected subject
      const { data: allSkills, error: skillsError } = await supabase
        .from('question_bank')
        .select('skill, difficulty')
        .eq('test', testFilter)
        .not('skill', 'is', null);

      if (skillsError) {
        console.error('Error fetching skills:', skillsError);
        return [];
      }

      // Create a map of all skills with default values
      const skillMap = new Map<string, {
        attempts: number;
        correct: number;
        totalTime: number;
        difficulties: { easy: number; medium: number; hard: number };
      }>();

      // Initialize all skills with 0 values
      allSkills?.forEach(skillRow => {
        if (skillRow.skill && !skillMap.has(skillRow.skill)) {
          skillMap.set(skillRow.skill, {
            attempts: 0,
            correct: 0,
            totalTime: 0,
            difficulties: { easy: 0, medium: 0, hard: 0 }
          });
        }
      });

      // Get user attempts for this subject
      const { data: attempts, error: attemptsError } = await supabase
        .from('question_attempts_v2')
        .select(`
          is_correct,
          time_spent,
          difficulty,
          question_id,
          topic
        `)
        .eq('user_id', user.user.id)
        .eq('subject', selectedSubject === 'math' ? 'math' : 'english');

      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
      }

      // If user has attempts, merge the data using the recorded topic directly
      if (attempts && attempts.length > 0) {
        attempts.forEach(attempt => {
          const topic = (attempt as any).topic as string | undefined;
          if (!topic) return;

          if (!skillMap.has(topic)) {
            skillMap.set(topic, {
              attempts: 0,
              correct: 0,
              totalTime: 0,
              difficulties: { easy: 0, medium: 0, hard: 0 }
            });
          }

          const skillData = skillMap.get(topic)!;
          skillData.attempts++;
          if ((attempt as any).is_correct) skillData.correct++;
          skillData.totalTime += (attempt as any).time_spent || 0;

          const difficultyKey = (attempt as any).difficulty?.toLowerCase() as keyof typeof skillData.difficulties;
          if (difficultyKey && skillData.difficulties.hasOwnProperty(difficultyKey)) {
            skillData.difficulties[difficultyKey]++;
          }
        });
      }

      // Merge LOCAL fallback quiz results (when user is not signed in or offline)
      try {
        const stored = JSON.parse(localStorage.getItem('quizResults') || '[]');
        const subjectLabel = selectedSubject === 'math' ? 'Math' : 'English';
        (stored || []).forEach((entry: any) => {
          if (!entry || entry.subject !== subjectLabel || !Array.isArray(entry.questions)) return;
          const answers: number[] = Array.isArray(entry.answers) ? entry.answers : [];
          entry.questions.forEach((q: any, idx: number) => {
            const topic = (q?.topic as string) || 'General';
            if (!skillMap.has(topic)) {
              skillMap.set(topic, {
                attempts: 0,
                correct: 0,
                totalTime: 0,
                difficulties: { easy: 0, medium: 0, hard: 0 }
              });
            }
            const skillData = skillMap.get(topic)!;
            skillData.attempts++;
            const isCorrect = answers[idx] === q?.correctAnswer;
            if (isCorrect) skillData.correct++;
            skillData.totalTime += Math.max(0, Number(q?.timeSpent) || 0);
            const df = (q?.difficulty || 'medium').toLowerCase();
            if (df in skillData.difficulties) {
              (skillData.difficulties as any)[df]++;
            }
          });
        });
      } catch {}

      // Convert to performance array - show ALL skills
      const performance: SkillPerformance[] = Array.from(skillMap.entries()).map(([skill, data]) => ({
        skill,
        accuracy: data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0,
        questionsAttempted: data.attempts,
        avgTime: data.attempts > 0 ? Math.round(data.totalTime / data.attempts) : 0,
        difficultyBreakdown: data.difficulties
      }));

      return performance;
    },
    enabled: true,
  });

  const getFilteredSkills = (metric: MetricType): SkillPerformance[] => {
    if (!performanceData) return [];

    switch (metric) {
      case 'best':
        return [...performanceData].sort((a, b) => {
          // Skills with attempts come first, then by accuracy
          if (a.questionsAttempted === 0 && b.questionsAttempted === 0) return 0;
          if (a.questionsAttempted === 0) return 1;
          if (b.questionsAttempted === 0) return -1;
          return b.accuracy - a.accuracy;
        });
      case 'needs-work':
        return [...performanceData].sort((a, b) => {
          // Skills with attempts come first, then by lowest accuracy
          if (a.questionsAttempted === 0 && b.questionsAttempted === 0) return 0;
          if (a.questionsAttempted === 0) return 1;
          if (b.questionsAttempted === 0) return -1;
          return a.accuracy - b.accuracy;
        });
      case 'time-intensive':
        return [...performanceData].sort((a, b) => {
          // Skills with attempts come first, then by highest time
          if (a.questionsAttempted === 0 && b.questionsAttempted === 0) return 0;
          if (a.questionsAttempted === 0) return 1;
          if (b.questionsAttempted === 0) return -1;
          return b.avgTime - a.avgTime;
        });
      case 'quick':
        return [...performanceData].sort((a, b) => {
          // Skills with attempts come first, then by lowest time
          if (a.questionsAttempted === 0 && b.questionsAttempted === 0) return 0;
          if (a.questionsAttempted === 0) return 1;
          if (b.questionsAttempted === 0) return -1;
          return a.avgTime - b.avgTime;
        });
      default:
        return performanceData;
    }
  };

  const getMetricTitle = (metric: MetricType): string => {
    switch (metric) {
      case 'best': return 'Best Topics';
      case 'needs-work': return 'Needs Work';
      case 'time-intensive': return 'Time Intensive';
      case 'quick': return 'Quick Topics';
    }
  };

  const getMetricDescription = (metric: MetricType): string => {
    switch (metric) {
      case 'best': return 'View your skills from most accurate to the least';
      case 'needs-work': return 'Skills that need more practice';
      case 'time-intensive': return 'Skills that take the most time';
      case 'quick': return 'Skills you solve quickly';
    }
  };

  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
      case 'best': return <Target className="h-4 w-4" />;
      case 'needs-work': return <AlertCircle className="h-4 w-4" />;
      case 'time-intensive': return <Clock className="h-4 w-4" />;
      case 'quick': return <Zap className="h-4 w-4" />;
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const filteredSkills = getFilteredSkills(selectedMetric);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              
              {/* Subject Tabs */}
              <div className="flex gap-2">
                <Button
                  variant={selectedSubject === 'math' ? 'default' : 'ghost'}
                  onClick={() => setSelectedSubject('math')}
                  className="rounded-full gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Mathematics
                </Button>
                <Button
                  variant={selectedSubject === 'reading-writing' ? 'default' : 'ghost'}
                  onClick={() => setSelectedSubject('reading-writing')}
                  className="rounded-full gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Reading & Writing
                </Button>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {(['best', 'needs-work', 'time-intensive', 'quick'] as MetricType[]).map((metric) => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? 'default' : 'ghost'}
                  onClick={() => setSelectedMetric(metric)}
                  className="text-sm gap-2 h-8 px-3"
                >
                  {getMetricIcon(metric)}
                  {getMetricTitle(metric)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Left Sidebar - Skills Menu */}
        <div className="w-80 bg-white border-r border-slate-200 min-h-screen">
          {/* Sidebar Header */}
          <div className="bg-blue-50 p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  {selectedSubject === 'math' ? 'Mathematics' : 'Reading & Writing'}
                </h2>
                <p className="text-sm text-slate-600">
                  {performanceData.length} SKILLS
                </p>
              </div>
            </div>
          </div>

          {/* Skills List */}
          <div className="overflow-y-auto h-[calc(100vh-200px)]">
            <div className="p-4">
              {performanceData.map((skill, index) => (
                <div key={skill.skill}>
                  <div
                    className="py-3 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => {
                      // Scroll to the skill card in the main content
                      const element = document.getElementById(`skill-${skill.skill.replace(/\s+/g, '-').toLowerCase()}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    <div className="text-xs text-slate-500 font-medium mb-1">
                      SKILL {index + 1}
                    </div>
                    <div className="text-sm text-slate-900 font-medium leading-tight">
                      {skill.skill}
                    </div>
                    {skill.questionsAttempted > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${
                          skill.accuracy >= 80 ? 'bg-green-500' :
                          skill.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-xs text-slate-600">{skill.accuracy}% accuracy</span>
                      </div>
                    )}
                  </div>
                  {index < performanceData.length - 1 && (
                    <div className="h-px bg-slate-200 mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                {getMetricIcon(selectedMetric)}
                <h1 className="text-3xl font-bold text-slate-900">
                  {getMetricTitle(selectedMetric)}
                </h1>
              </div>
              <p className="text-slate-600 text-lg">
                {getMetricDescription(selectedMetric)}
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="h-8 bg-slate-200 rounded-lg mb-6"></div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <div className="h-4 bg-slate-200 rounded"></div>
                          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 bg-slate-200 rounded"></div>
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSkills.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data Available</h3>
                  <p className="text-slate-600">
                    No data available for {selectedSubject === 'math' ? 'Mathematics' : 'Reading & Writing'} yet. 
                    Start practicing to see your performance insights!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredSkills.map((skill, index) => (
                  <Card 
                    key={skill.skill} 
                    id={`skill-${skill.skill.replace(/\s+/g, '-').toLowerCase()}`}
                    className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-slate-900">
                              {skill.skill}
                            </h3>
                            {skill.questionsAttempted > 0 && (
                              <Badge variant="outline" className={getAccuracyColor(skill.accuracy)}>
                                {skill.accuracy}% accuracy
                              </Badge>
                            )}
                          </div>
                          {skill.questionsAttempted === 0 && (
                            <p className="text-slate-500 text-sm">No attempts yet</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => { setPendingLearnSkill(skill); setConfirmOpen(true); }}
                            className="gap-2"
                          >
                            <Brain className="h-4 w-4" />
                            Learn
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled
                            className="gap-2"
                          >
                            <TrendingUp className="h-4 w-4" />
                            Advanced
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled
                            className="gap-2"
                          >
                            <BarChart3 className="h-4 w-4" />
                            Compare
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Insight Button */}
                        <div className="lg:col-span-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg px-3 py-2"
                            onClick={() => {
                              const next = expandedSkill === skill.skill ? null : skill.skill;
                              setExpandedSkill(next);
                              if (next) {
                                setAiLoading(skill.skill);
                                setAiErrorBySkill(prev => ({ ...prev, [skill.skill]: null }));
                                generateInlineInsights(skill);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {expandedSkill === skill.skill ? 'Hide Insights' : 'Show AI Insights'}
                          </Button>
                        </div>

                        {/* Right: Performance Metrics */}
                        <div className="lg:col-span-2">
                          <div className="grid grid-cols-2 gap-8">
                            {/* Difficulty Breakdown */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-slate-700 mb-3">Difficulty Breakdown</h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Easy</span>
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                    {skill.difficultyBreakdown.easy}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Medium</span>
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                    {skill.difficultyBreakdown.medium}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Hard</span>
                                  <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                                    {skill.difficultyBreakdown.hard}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-slate-700 mb-3">Performance Metrics</h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Questions Solved</span>
                                  <span className="text-sm font-semibold text-slate-900">{skill.questionsAttempted}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Average Time</span>
                                  <span className="text-sm font-semibold text-slate-900">{formatTime(skill.avgTime)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Success Rate</span>
                                  <span className="text-sm font-semibold text-slate-900">{skill.accuracy}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inline AI Insights */}
                      {expandedSkill === skill.skill && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          {aiLoading === skill.skill && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-blue-700">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm font-medium">Generating AI insights...</span>
                              </div>
                              <div className="space-y-3 animate-pulse">
                                <div className="h-3 bg-blue-200 rounded w-3/4"></div>
                                <div className="h-3 bg-blue-200 rounded w-2/3"></div>
                                <div className="h-3 bg-blue-200 rounded w-4/5"></div>
                              </div>
                            </div>
                          )}
                          {aiErrorBySkill[skill.skill] && (
                            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
                              {aiErrorBySkill[skill.skill]}
                            </div>
                          )}
                          {!aiLoading && !aiErrorBySkill[skill.skill] && (aiBulletsBySkill[skill.skill]?.length ?? 0) > 0 && (
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Brain className="h-5 w-5 text-blue-600" />
                                AI Performance Insights
                              </h4>
                              <ul className="space-y-2">
                                {aiBulletsBySkill[skill.skill].map((bullet, i) => (
                                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learn confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Ready to Learn?
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-600 mb-6">
            We'll open a guided coaching space for <span className="font-semibold text-slate-900">{pendingLearnSkill?.skill}</span> with personalized AI tutoring.
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => {
              const s = pendingLearnSkill?.skill;
              setConfirmOpen(false);
              if (s) navigate('/learn/skill', { state: { subject: selectedSubject, skill: s } });
            }}>
              Start Learning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedInsights;