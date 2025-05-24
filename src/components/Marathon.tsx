
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, BookOpen } from 'lucide-react';
import QuestionView from './QuestionView';
import { Subject } from '../pages/Index';

interface MarathonProps {
  userName: string;
  selectedSubject: Subject | null;
  onSubjectSelect: (subject: Subject) => void;
  onBack: () => void;
}

const Marathon: React.FC<MarathonProps> = ({ userName, selectedSubject, onSubjectSelect, onBack }) => {
  if (!selectedSubject) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="mb-4 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Marathon Mode
            </h1>
            <p className="text-xl text-gray-600">
              Choose your subject and dive into unlimited practice questions, {userName}!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Math */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Calculator className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Mathematics</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Practice algebra, geometry, statistics, and advanced math concepts. 
                  Build your problem-solving skills with varied question types.
                </p>
                
                <Button
                  onClick={() => onSubjectSelect('math')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                >
                  Start Math Practice
                </Button>
              </div>
            </div>

            {/* English */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200">
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">English</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Master reading comprehension, writing skills, and language usage. 
                  Improve your critical analysis and grammar proficiency.
                </p>
                
                <Button
                  onClick={() => onSubjectSelect('english')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
                >
                  Start English Practice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuestionView
      subject={selectedSubject}
      mode="marathon"
      userName={userName}
      onBack={onBack}
    />
  );
};

export default Marathon;
