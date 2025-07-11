
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Calculator } from 'lucide-react';
import { Subject } from '../types/common';
import QuizTopicSelection from './QuizTopicSelection';
import { useAutoTopicSelection } from '@/hooks/useAutoTopicSelection';

interface QuizProps {
  userName: string;
  onBack: () => void;
}

const Quiz: React.FC<QuizProps> = ({ userName, onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const { autoSelection, clearAutoSelection } = useAutoTopicSelection();

  useEffect(() => {
    // If there's an auto selection, automatically navigate to that subject
    if (autoSelection && !selectedSubject) {
      setSelectedSubject(autoSelection.subject);
    }
  }, [autoSelection, selectedSubject]);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    clearAutoSelection(); // Clear any pending auto selection
  };

  if (selectedSubject) {
    return (
      <QuizTopicSelection
        subject={selectedSubject}
        userName={userName}
        onBack={handleBackToSubjects}
        onBackToDashboard={onBack}
        autoSelection={autoSelection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 md:mb-10">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center mr-4 px-4 py-2 rounded-xl min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Quiz</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto items-stretch">
          {/* Math Quiz Card */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl h-full">
            <CardContent className="p-8 md:p-10 h-full flex flex-col">
              <div className="text-center flex-1 flex flex-col">
                <div className="bg-green-50 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Calculator className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Math Quiz</h3>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed px-2">
                    Choose from algebra, geometry, data analysis, and advanced math topics
                  </p>
                </div>
                <Button
                  onClick={() => handleSubjectSelect('math')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 md:py-4 font-medium rounded-xl min-h-[44px] mt-8"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Create Math Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* English Quiz Card */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl h-full">
            <CardContent className="p-8 md:p-10 h-full flex flex-col">
              <div className="text-center flex-1 flex flex-col">
                <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">English Quiz</h3>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed px-2">
                    Focus on reading comprehension, writing, and language conventions
                  </p>
                </div>
                <Button
                  onClick={() => handleSubjectSelect('english')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-4 font-medium rounded-xl min-h-[44px] mt-8"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create English Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
