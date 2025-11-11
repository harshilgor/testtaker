import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Target, ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { generateStudyPlan, saveStudyPlan } from '@/services/studyPlanGenerator';
import { useAuth } from '@/contexts/AuthContext';

interface StudyPlanProps {
  userName: string;
  onBack: () => void;
}

const DAYS: Array<{ key: string; label: string; fullLabel: string }> = [
  { key: 'M', label: 'M', fullLabel: 'Monday' },
  { key: 'T', label: 'T', fullLabel: 'Tuesday' },
  { key: 'W', label: 'W', fullLabel: 'Wednesday' },
  { key: 'T2', label: 'T', fullLabel: 'Thursday' },
  { key: 'F', label: 'F', fullLabel: 'Friday' },
  { key: 'S', label: 'S', fullLabel: 'Saturday' },
  { key: 'S2', label: 'S', fullLabel: 'Sunday' },
];

const LEARNING_PLAN_KEY = 'userLearningPlan';

// SAT dates for 2025 and 2026
const satDates = [
  { value: '2025-08-23', label: 'August 23, 2025' },
  { value: '2025-09-13', label: 'September 13, 2025' },
  { value: '2025-10-04', label: 'October 4, 2025' },
  { value: '2025-11-08', label: 'November 8, 2025' },
  { value: '2025-12-06', label: 'December 6, 2025' },
  { value: '2026-03-14', label: 'March 14, 2026' },
  { value: '2026-05-02', label: 'May 2, 2026' },
  { value: '2026-06-06', label: 'June 6, 2026' },
];

const StudyPlan: React.FC<StudyPlanProps> = ({ userName, onBack }) => {
  const { user } = useAuth();
  const [selectedTestDate, setSelectedTestDate] = useState('');
  const [dreamScore, setDreamScore] = useState(1600);
  const [studyDays, setStudyDays] = useState<Record<string, boolean>>({
    M: true,
    T: true,
    W: true,
    T2: true,
    F: true,
    S: true,
    S2: true,
  });
  const [studyHours, setStudyHours] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load existing plan if available
  useEffect(() => {
    const savedPlan = localStorage.getItem(LEARNING_PLAN_KEY);
    if (savedPlan) {
      try {
        const parsed = JSON.parse(savedPlan);
        if (parsed.testDate) setSelectedTestDate(parsed.testDate);
        if (parsed.dreamScore) setDreamScore(parsed.dreamScore);
        if (parsed.days) setStudyDays(parsed.days);
        if (parsed.studyHours) setStudyHours(parsed.studyHours);
      } catch (e) {
        console.error('Error loading saved plan:', e);
      }
    }
  }, []);

  const toggleDay = (dayKey: string) => {
    setStudyDays(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      alert('Please log in to create a study plan');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Save learning plan preferences
      const learningPlan = {
        testDate: selectedTestDate,
        dreamScore,
        days: studyDays,
        studyHours,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(LEARNING_PLAN_KEY, JSON.stringify(learningPlan));
      
      // Generate complete study plan with daily tasks
      const studyPlan = await generateStudyPlan(user.id, {
        testDate: selectedTestDate,
        dreamScore,
        days: studyDays,
        studyHours
      });
      
      // Save the generated study plan
      saveStudyPlan(studyPlan);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('learningPlanUpdated'));
      window.dispatchEvent(new Event('studyPlanUpdated'));
      
      onBack();
    } catch (error) {
      console.error('Error generating study plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error generating study plan: ${errorMessage}. Please check the console for details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = selectedTestDate && dreamScore >= 400 && dreamScore <= 1600 && Object.values(studyDays).some(day => day) && studyHours > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-2xl font-semibold text-gray-900">Create Your Learning Plan</h1>
          <p className="text-gray-600 text-sm mt-1">Set your goals and study schedule</p>
        </div>

        {/* Form Card */}
        <Card className="rounded-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            {/* Test Date */}
            <div className="space-y-2">
              <Label htmlFor="testDate" className="text-sm font-medium text-gray-900">
                Select Test Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select value={selectedTestDate} onValueChange={setSelectedTestDate}>
                  <SelectTrigger className="pl-10 h-11">
                    <SelectValue placeholder="Choose your SAT test date" />
                  </SelectTrigger>
                  <SelectContent>
                    {satDates.map((date) => (
                      <SelectItem key={date.value} value={date.value}>
                        {date.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dream Score */}
            <div className="space-y-2">
              <Label htmlFor="dreamScore" className="text-sm font-medium text-gray-900">
                What is your dream score?
              </Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="dreamScore"
                  type="number"
                  min="400"
                  max="1600"
                  value={dreamScore}
                  onChange={(e) => setDreamScore(Number(e.target.value))}
                  className="pl-10 h-11"
                  placeholder="Enter your target SAT score (400-1600)"
                />
              </div>
              <p className="text-xs text-gray-500">Enter a score between 400 and 1600</p>
            </div>

            {/* Study Days */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                Which days do you want to study?
              </Label>
              <div className="flex items-center gap-3 flex-wrap">
                {DAYS.map((day) => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-full border text-sm font-medium transition-colors ${
                      studyDays[day.key]
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                    aria-label={day.fullLabel}
                    title={day.fullLabel}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">Select the days you'll commit to studying</p>
            </div>

            {/* Study Hours */}
            <div className="space-y-2">
              <Label htmlFor="studyHours" className="text-sm font-medium text-gray-900">
                How many hours can you study per day?
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="studyHours"
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="pl-10 h-11"
                  placeholder="Enter hours (e.g., 2)"
                />
              </div>
              <p className="text-xs text-gray-500">Enter the number of hours you can dedicate daily</p>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={!isFormValid || isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Your Study Plan...
                  </>
                ) : (
                  'Save Learning Plan'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyPlan;
