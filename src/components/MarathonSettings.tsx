import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MarathonSettings } from '../types/marathon';
import { supabase } from '@/integrations/supabase/client';
interface MarathonSettingsProps {
  onStart: (settings: MarathonSettings) => void;
  onBack: () => void;
}
interface QuestionStats {
  math: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  english: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  total: number;
}
interface UserProgress {
  questionsAttempted: number;
  totalAvailable: number;
}
const MarathonSettingsComponent: React.FC<MarathonSettingsProps> = ({
  onStart,
  onBack
}) => {
  const [settings, setSettings] = useState<MarathonSettings>({
    subjects: ['both'],
    difficulty: 'mixed',
    adaptiveLearning: true,
    timedMode: false,
    timeGoalMinutes: 30,
    calculatorEnabled: true,
    darkMode: false,
    fontSize: 'medium'
  });
  const [questionStats, setQuestionStats] = useState<QuestionStats>({
    math: {
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0
    },
    english: {
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0
    },
    total: 0
  });
  const [userProgress, setUserProgress] = useState<UserProgress>({
    questionsAttempted: 0,
    totalAvailable: 0
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadQuestionStats();
    loadUserProgress();
  }, []);
  const loadQuestionStats = async () => {
    try {
      // Get question counts by section and difficulty
      const {
        data: mathQuestions
      } = await supabase.from('question_bank').select('difficulty').eq('section', 'math').eq('is_active', true);
      const {
        data: englishQuestions
      } = await supabase.from('question_bank').select('difficulty').eq('section', 'reading-writing').eq('is_active', true);
      const {
        count: totalCount
      } = await supabase.from('question_bank').select('*', {
        count: 'exact',
        head: true
      }).eq('is_active', true);

      // Count by difficulty for math
      const mathStats = {
        easy: 0,
        medium: 0,
        hard: 0,
        total: 0
      };
      mathQuestions?.forEach(q => {
        if (q.difficulty === 'easy') mathStats.easy++;else if (q.difficulty === 'medium') mathStats.medium++;else if (q.difficulty === 'hard') mathStats.hard++;
        mathStats.total++;
      });

      // Count by difficulty for english
      const englishStats = {
        easy: 0,
        medium: 0,
        hard: 0,
        total: 0
      };
      englishQuestions?.forEach(q => {
        if (q.difficulty === 'easy') englishStats.easy++;else if (q.difficulty === 'medium') englishStats.medium++;else if (q.difficulty === 'hard') englishStats.hard++;
        englishStats.total++;
      });
      setQuestionStats({
        math: mathStats,
        english: englishStats,
        total: totalCount || 0
      });
    } catch (error) {
      console.error('Error loading question stats:', error);
    }
  };
  const loadUserProgress = async () => {
    try {
      const {
        data: user
      } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get user's marathon session stats
      const {
        data: sessions
      } = await supabase.from('marathon_sessions').select('total_questions').eq('user_id', user.user.id);
      const questionsAttempted = sessions?.reduce((sum, session) => sum + (session.total_questions || 0), 0) || 0;
      setUserProgress({
        questionsAttempted,
        totalAvailable: questionStats.total
      });
    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setLoading(false);
    }
  };
  const getAvailableQuestions = () => {
    if (settings.subjects.includes('both')) {
      if (settings.difficulty === 'mixed') {
        return questionStats.total;
      } else {
        return questionStats.math[settings.difficulty as keyof typeof questionStats.math] + questionStats.english[settings.difficulty as keyof typeof questionStats.english];
      }
    } else if (settings.subjects.includes('math')) {
      if (settings.difficulty === 'mixed') {
        return questionStats.math.total;
      } else {
        return questionStats.math[settings.difficulty as keyof typeof questionStats.math];
      }
    } else if (settings.subjects.includes('english')) {
      if (settings.difficulty === 'mixed') {
        return questionStats.english.total;
      } else {
        return questionStats.english[settings.difficulty as keyof typeof questionStats.english];
      }
    }
    return 0;
  };
  const handleStart = () => {
    onStart(settings);
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading question statistics...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="max-w-2xl w-full p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marathon Mode Settings</h1>
          <p className="text-gray-600">Customize your practice session</p>
        </div>

        {/* Question Statistics */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Available Questions</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Math Questions:</p>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Easy:</span>
                  <Badge variant="outline">{questionStats.math.easy}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <Badge variant="outline">{questionStats.math.medium}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Hard:</span>
                  <Badge variant="outline">{questionStats.math.hard}</Badge>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <Badge>{questionStats.math.total}</Badge>
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium">English Questions:</p>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Easy:</span>
                  <Badge variant="outline">{questionStats.english.easy}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <Badge variant="outline">{questionStats.english.medium}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Hard:</span>
                  <Badge variant="outline">{questionStats.english.hard}</Badge>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <Badge>{questionStats.english.total}</Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <span className="font-medium">Your Progress:</span>
              <Badge variant="secondary">
                {userProgress.questionsAttempted} questions attempted
              </Badge>
            </div>
          </div>
        </Card>

        {/* Current Selection Info */}
        <Card className="p-4 mb-6 bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Selected Configuration</h3>
          <div className="flex justify-between items-center">
            <span>Available for this session:</span>
            <Badge className="bg-green-600">
              {getAvailableQuestions()} questions
            </Badge>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Subject Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Subject Focus</Label>
            <div className="grid grid-cols-3 gap-3">
              {[{
              value: 'math',
              label: 'Math Only'
            }, {
              value: 'english',
              label: 'English Only'
            }, {
              value: 'both',
              label: 'Both Subjects'
            }].map(option => <Button key={option.value} variant={settings.subjects.includes(option.value as any) ? 'default' : 'outline'} onClick={() => setSettings(prev => ({
              ...prev,
              subjects: [option.value as any]
            }))} className="w-full" disabled={option.value === 'english' && questionStats.english.total === 0}>
                  {option.label}
                  {option.value === 'english' && questionStats.english.total === 0 && <Badge variant="destructive" className="ml-2">No Questions</Badge>}
                </Button>)}
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <Label className="text-base font-medium mb-3 block">Difficulty Level</Label>
            <div className="grid grid-cols-4 gap-3">
              {[{
              value: 'easy',
              label: 'Easy'
            }, {
              value: 'medium',
              label: 'Medium'
            }, {
              value: 'hard',
              label: 'Hard'
            }, {
              value: 'mixed',
              label: 'Mixed'
            }].map(option => <Button key={option.value} variant={settings.difficulty === option.value ? 'default' : 'outline'} onClick={() => setSettings(prev => ({
              ...prev,
              difficulty: option.value as any
            }))} className="w-full">
                  {option.label}
                </Button>)}
            </div>
          </div>

          {/* Adaptive Learning */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <Label className="font-medium">Adaptive Learning</Label>
              <p className="text-sm text-gray-600">Focus on your weak topics automatically</p>
            </div>
            <Switch checked={settings.adaptiveLearning} onCheckedChange={checked => setSettings(prev => ({
            ...prev,
            adaptiveLearning: checked
          }))} />
          </div>

          {/* Timed Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Timed Mode</Label>
                <p className="text-sm text-gray-600">Set a time goal for your session</p>
              </div>
              <Switch checked={settings.timedMode} onCheckedChange={checked => setSettings(prev => ({
              ...prev,
              timedMode: checked
            }))} />
            </div>
            
            {settings.timedMode && <div className="ml-4">
                <Label htmlFor="timeGoal" className="text-sm">Time Goal (minutes)</Label>
                <Input id="timeGoal" type="number" min="5" max="180" value={settings.timeGoalMinutes} onChange={e => setSettings(prev => ({
              ...prev,
              timeGoalMinutes: parseInt(e.target.value)
            }))} className="w-24 mt-1" />
              </div>}
          </div>

          {/* Calculator */}
          {(settings.subjects.includes('math') || settings.subjects.includes('both')) && <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Calculator</Label>
                <p className="text-sm text-gray-600">Enable or disable the in-app calculator</p>
              </div>
              <Switch checked={settings.calculatorEnabled} onCheckedChange={checked => setSettings(prev => ({
            ...prev,
            calculatorEnabled: checked
          }))} />
            </div>}

          {/* Font Size */}
          <div>
            
            <div className="grid grid-cols-3 gap-3">
              {[{
              value: 'small',
              label: 'Small'
            }, {
              value: 'medium',
              label: 'Medium'
            }, {
              value: 'large',
              label: 'Large'
            }].map(option => {})}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
          <Button onClick={handleStart} className="bg-orange-600 hover:bg-orange-700" disabled={getAvailableQuestions() === 0}>
            Start Marathon ({getAvailableQuestions()} questions)
          </Button>
        </div>
      </Card>
    </div>;
};
export default MarathonSettingsComponent;