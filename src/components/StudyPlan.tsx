import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Target, BookOpen, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface StudyPlanProps {
  userName: string;
  onBack: () => void;
}

const StudyPlan: React.FC<StudyPlanProps> = ({ userName, onBack }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTestDate, setSelectedTestDate] = useState('');
  const [readingWritingCurrent, setReadingWritingCurrent] = useState(600);
  const [readingWritingGoal, setReadingWritingGoal] = useState(700);
  const [mathCurrent, setMathCurrent] = useState(600);
  const [mathGoal, setMathGoal] = useState(700);
  const [mockExamDay, setMockExamDay] = useState('');

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

  // Fetch user attempts to calculate current score
  const { data: userAttempts = [] } = useQuery({
    queryKey: ['user-attempts-study-plan', userName],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user attempts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Calculate predicted scores based on performance
  useEffect(() => {
    if (userAttempts.length === 0) return;

    // Calculate accuracy from attempts
    const totalAttempts = userAttempts.length;
    const correctAttempts = userAttempts.filter(attempt => attempt.is_correct).length;
    const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0.5;

    // Calculate average time per question
    const totalTime = userAttempts.reduce((sum, attempt) => sum + (attempt.time_spent || 0), 0);
    const avgTimePerQuestion = totalAttempts > 0 ? totalTime / totalAttempts : 120;

    // Base score calculation
    const baseScore = 800 + (accuracy * 800);
    
    // Adjust based on time (faster = better score)
    const timeAdjustment = Math.max(-100, Math.min(100, (120 - avgTimePerQuestion) * 2));
    
    // Adjust based on difficulty of questions attempted
    const difficultyAdjustment = userAttempts.reduce((sum, attempt) => {
      const difficulty = attempt.difficulty?.toLowerCase();
      if (difficulty === 'easy') return sum + 0;
      if (difficulty === 'medium') return sum + 50;
      if (difficulty === 'hard') return sum + 100;
      return sum;
    }, 0) / Math.max(1, totalAttempts);

    const totalScore = Math.min(1600, Math.max(400, baseScore + timeAdjustment + difficultyAdjustment));
    
    // Split into sections
    const readingWritingPredicted = Math.round(totalScore * 0.52);
    const mathPredicted = Math.round(totalScore * 0.48);

    // Set current scores
    setReadingWritingCurrent(readingWritingPredicted);
    setMathCurrent(mathPredicted);
  }, [userAttempts]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCommitGoal = () => {
    // Save the study plan to localStorage
    const learningPlan = {
      testDate: selectedTestDate,
      readingWritingCurrent,
      readingWritingGoal,
      mathCurrent,
      mathGoal,
      mockExamDay,
      days: {
        M: true,
        T: true,
        W: true,
        T2: true,
        F: true,
        S: true,
        S2: true,
      },
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('userLearningPlan', JSON.stringify(learningPlan));
    console.log('Study plan committed:', learningPlan);
    // Go back to dashboard
    onBack();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create a Study Plan</h2>
        <p className="text-gray-600">Fill out the information below to generate a plan to improve your score on the SAT.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="testDate" className="text-lg font-semibold text-gray-800 mb-2 block">
            Select Your Test Date
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Select value={selectedTestDate} onValueChange={setSelectedTestDate}>
              <SelectTrigger className="pl-10 h-12 text-lg">
                <SelectValue placeholder="Select a test date" />
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
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          disabled={!selectedTestDate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Your Dream Scores</h2>
        <p className="text-gray-600">Your current scores are auto-calculated based on your performance</p>
      </div>

      {/* Reading & Writing Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Reading & Writing:</h3>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="rwCurrent" className="text-sm text-gray-600 mb-1 block">Current Score:</Label>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <span className="text-2xl font-bold text-gray-700">{readingWritingCurrent}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              +{readingWritingGoal - readingWritingCurrent}pts
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${((readingWritingGoal - readingWritingCurrent) / (800 - readingWritingCurrent)) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <Label htmlFor="rwGoal" className="text-sm text-gray-600 mb-1 block">Goal Score:</Label>
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <span className="text-2xl font-bold text-green-700">{readingWritingGoal}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Current</span>
            <span>Goal</span>
            <span>800</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full relative">
            <div 
              className="absolute h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ 
                left: `${(readingWritingCurrent / 800) * 100}%`,
                width: `${((readingWritingGoal - readingWritingCurrent) / 800) * 100}%`
              }}
            />
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              style={{ left: `${(readingWritingGoal / 800) * 100}%` }}
            />
          </div>
        </div>

        {/* Score Input Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rwCurrentInput" className="text-sm text-gray-600 mb-1 block">Current Score</Label>
            <Input
              id="rwCurrentInput"
              type="number"
              min="200"
              max="800"
              value={readingWritingCurrent}
              onChange={(e) => setReadingWritingCurrent(Number(e.target.value))}
              className="text-center"
            />
          </div>
          <div>
            <Label htmlFor="rwGoalInput" className="text-sm text-gray-600 mb-1 block">Goal Score</Label>
            <Input
              id="rwGoalInput"
              type="number"
              min="200"
              max="800"
              value={readingWritingGoal}
              onChange={(e) => setReadingWritingGoal(Number(e.target.value))}
              className="text-center"
            />
          </div>
        </div>
      </div>

      {/* Math Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Math:</h3>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="mathCurrent" className="text-sm text-gray-600 mb-1 block">Current Score:</Label>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <span className="text-2xl font-bold text-gray-700">{mathCurrent}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              +{mathGoal - mathCurrent}pts
            </div>
            <div className="w-16 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${((mathGoal - mathCurrent) / (800 - mathCurrent)) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <Label htmlFor="mathGoal" className="text-sm text-gray-600 mb-1 block">Goal Score:</Label>
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <span className="text-2xl font-bold text-green-700">{mathGoal}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Current</span>
            <span>Goal</span>
            <span>800</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full relative">
            <div 
              className="absolute h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ 
                left: `${(mathCurrent / 800) * 100}%`,
                width: `${((mathGoal - mathCurrent) / 800) * 100}%`
              }}
            />
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              style={{ left: `${(mathGoal / 800) * 100}%` }}
            />
          </div>
        </div>

        {/* Score Input Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mathCurrentInput" className="text-sm text-gray-600 mb-1 block">Current Score</Label>
            <Input
              id="mathCurrentInput"
              type="number"
              min="200"
              max="800"
              value={mathCurrent}
              onChange={(e) => setMathCurrent(Number(e.target.value))}
              className="text-center"
            />
          </div>
          <div>
            <Label htmlFor="mathGoalInput" className="text-sm text-gray-600 mb-1 block">Goal Score</Label>
            <Input
              id="mathGoalInput"
              type="number"
              min="200"
              max="800"
              value={mathGoal}
              onChange={(e) => setMathGoal(Number(e.target.value))}
              className="text-center"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={handleBack}
          variant="outline"
          className="px-8 py-3 text-lg"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter your Preferred Day for Mock Exams</h2>
        <p className="text-gray-600">Your plan will include a weekly mock exam on this day of week.</p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="mockExamDay" className="text-lg font-semibold text-gray-800 mb-2 block">
          Select Day of Week
        </Label>
        <Select value={mockExamDay} onValueChange={setMockExamDay}>
          <SelectTrigger className="h-12 text-lg">
            <SelectValue placeholder="Select a day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sunday">Sunday</SelectItem>
            <SelectItem value="monday">Monday</SelectItem>
            <SelectItem value="tuesday">Tuesday</SelectItem>
            <SelectItem value="wednesday">Wednesday</SelectItem>
            <SelectItem value="thursday">Thursday</SelectItem>
            <SelectItem value="friday">Friday</SelectItem>
            <SelectItem value="saturday">Saturday</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={handleBack}
          variant="outline"
          className="px-8 py-3 text-lg"
        >
          Back
        </Button>
        <Button 
          onClick={handleCommitGoal}
          disabled={!mockExamDay}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          Commit To My Goal
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Study Plan</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </motion.div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlan;
