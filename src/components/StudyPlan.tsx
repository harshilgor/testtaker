import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Target, BookOpen, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudyPlanProps {
  userName: string;
  onBack: () => void;
}

const StudyPlan: React.FC<StudyPlanProps> = ({ userName, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [testDate, setTestDate] = useState('');
  const [readingWritingCurrent, setReadingWritingCurrent] = useState(200);
  const [readingWritingGoal, setReadingWritingGoal] = useState(350);
  const [mathCurrent, setMathCurrent] = useState(200);
  const [mathGoal, setMathGoal] = useState(350);
  const [mockExamDay, setMockExamDay] = useState('');

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
    // Here you would typically save the study plan to the database
    console.log('Study plan committed:', {
      testDate,
      readingWritingCurrent,
      readingWritingGoal,
      mathCurrent,
      mathGoal,
      mockExamDay
    });
    // For now, just go back to dashboard
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
            Enter Your Test Date
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="testDate"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="pl-10 h-12 text-lg"
              placeholder="Select a test date"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          disabled={!testDate}
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Your Current and Goal Scores</h2>
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
