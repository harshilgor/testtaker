
import React from 'react';
import { Button } from '@/components/ui/button';

interface SATTestIntroductionProps {
  onStartTest: () => void;
}

const SATTestIntroduction: React.FC<SATTestIntroductionProps> = ({ onStartTest }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Digital SAT Practice Test</h1>
            <p className="text-gray-600 mb-6">
              This practice test mirrors the official Digital SAT format with adaptive modules and real timing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-4">Section 1: Reading and Writing</h3>
              <ul className="text-blue-800 space-y-2">
                <li>• Module 1: 27 questions (32 minutes)</li>
                <li>• Module 2: 27 questions (32 minutes)</li>
                <li>• Adaptive difficulty based on Module 1 performance</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-4">Section 2: Math</h3>
              <ul className="text-green-800 space-y-2">
                <li>• Module 1: 22 questions (35 minutes)</li>
                <li>• Module 2: 22 questions (35 minutes)</li>
                <li>• Calculator available throughout</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={onStartTest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Start SAT Practice Test
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Total test time: approximately 2 hours and 14 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SATTestIntroduction;
