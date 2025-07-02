
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Calculator } from 'lucide-react';
import { Subject } from '../types/common';
import QuizTopicSelection from './QuizTopicSelection';

interface QuizProps {
  userName: string;
  onBack: () => void;
}

const Quiz: React.FC<QuizProps> = ({ userName, onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
  };

  if (selectedSubject) {
    return (
      <QuizTopicSelection
        subject={selectedSubject}
        userName={userName}
        onBack={handleBackToSubjects}
        onBackToDashboard={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create Quiz</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow border border-gray-100">
            <div className="text-center">
              <div className="bg-green-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calculator className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Math Quiz</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Choose from algebra, geometry, data analysis, and advanced math topics
              </p>
              <Button
                onClick={() => handleSubjectSelect('math')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Create Math Quiz
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow border border-gray-100">
            <div className="text-center">
              <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">English Quiz</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Focus on reading comprehension, writing, and language conventions
              </p>
              <Button
                onClick={() => handleSubjectSelect('english')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Create English Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
