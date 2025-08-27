
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarathonSettings } from '../types/marathon';
import QuestionStatsCard from './Marathon/QuestionStatsCard';
import CurrentSelectionCard from './Marathon/CurrentSelectionCard';
import SubjectSelection from './Marathon/SubjectSelection';
import DifficultySelection from './Marathon/DifficultySelection';
import SettingsToggles from './Marathon/SettingsToggles';
import { useMarathonQuestionStats } from './Marathon/useMarathonQuestionStats';
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning';
import { ArrowLeft, Play, Settings, BookOpen, Target, Clock, Brain, TrendingDown } from 'lucide-react';

interface MarathonSettingsProps {
  onStart: (settings: MarathonSettings) => void;
  onBack: () => void;
}

const MarathonSettingsComponent: React.FC<MarathonSettingsProps> = ({
  onStart,
  onBack
}) => {
  const [settings, setSettings] = useState<MarathonSettings>({
    subjects: ['both'],
    difficulty: 'mixed',
    timedMode: false,
    timeGoalMinutes: 30,
    calculatorEnabled: true,
    darkMode: false,
    fontSize: 'medium',
    adaptiveLearning: false
  });

  const { questionStats, userProgress, loading } = useMarathonQuestionStats();
  const { weaknessScores } = useAdaptiveLearning();

  const getAvailableQuestions = () => {
    if (settings.subjects.includes('both')) {
      if (settings.difficulty === 'mixed') {
        return questionStats.total;
      } else {
        return questionStats.math[settings.difficulty as keyof typeof questionStats.math] + 
               questionStats.english[settings.difficulty as keyof typeof questionStats.english];
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
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading question statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="hover:bg-white/80 rounded-full p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Marathon Mode
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg ml-12">
            Customize your practice session for optimal learning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Statistics */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Available Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionStatsCard 
                  questionStats={questionStats} 
                  userProgress={userProgress} 
                />
              </CardContent>
            </Card>

            {/* Adaptive Learning Insights */}
            {settings.adaptiveLearning && weaknessScores.length > 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl text-purple-800">
                    <Brain className="h-5 w-5" />
                    AI Learning Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-purple-700">
                      Based on your recent performance, I'll focus on these areas:
                    </p>
                    <div className="space-y-3">
                      {weaknessScores.slice(0, 3).map((weakness, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <TrendingDown className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{weakness.topic}</p>
                              <p className="text-xs text-gray-600 capitalize">{weakness.subject}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-purple-700">
                              {Math.round((1 - weakness.accuracy) * 100)}% focus
                            </p>
                            <p className="text-xs text-gray-500">
                              {weakness.totalAttempts} attempts
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subject Selection */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Subject Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <SubjectSelection 
                  settings={settings}
                  onSettingsChange={setSettings}
                  englishQuestionCount={questionStats.english.total}
                />
              </CardContent>
            </Card>

            {/* Difficulty Selection */}
            {!settings.adaptiveLearning && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Difficulty Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <DifficultySelection 
                    settings={settings}
                    onSettingsChange={setSettings}
                  />
                </CardContent>
              </Card>
            )}

            {/* Settings Toggles */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Session Options</CardTitle>
              </CardHeader>
              <CardContent>
                <SettingsToggles 
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Start */}
          <div className="space-y-6">
            {/* Current Selection Summary */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-green-800">
                  <Target className="h-5 w-5" />
                  Session Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CurrentSelectionCard 
                  availableQuestions={getAvailableQuestions()} 
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Available</span>
                  </div>
                  <span className="font-bold text-blue-600">{questionStats.total}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Your Progress</span>
                  </div>
                  <span className="font-bold text-green-600">{userProgress.questionsAttempted}</span>
                </div>
                {settings.adaptiveLearning && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">AI Learning</span>
                    </div>
                    <span className="font-bold text-purple-600">Active</span>
                  </div>
                )}
                {settings.timedMode && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Time Goal</span>
                    </div>
                    <span className="font-bold text-orange-600">{settings.timeGoalMinutes}m</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Start Button */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Play className="h-6 w-6" />
                    <h3 className="text-xl font-bold">Ready to Start?</h3>
                  </div>
                  <p className="text-blue-100">
                    {getAvailableQuestions()} questions available for this session
                  </p>
                  {settings.adaptiveLearning && (
                    <p className="text-blue-200 text-sm">
                      AI will adapt questions based on your performance
                    </p>
                  )}
                  <Button 
                    onClick={handleStart} 
                    className="w-full bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg" 
                    disabled={getAvailableQuestions() === 0}
                    size="lg"
                  >
                    {getAvailableQuestions() === 0 ? 'No Questions Available' : 'Start Marathon'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarathonSettingsComponent;
