
import React from 'react';
import { Button } from '@/components/ui/button';
import { Marathon, FileText, Zap, Clock } from 'lucide-react';

interface DashboardProps {
  userName: string;
  onMarathonSelect: () => void;
  onMockTestSelect: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userName, onMarathonSelect, onMockTestSelect }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Ready to boost your SAT score? Choose your practice mode:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Marathon Mode */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Zap className="h-10 w-10 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Marathon Mode</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Dive into unlimited practice questions. Choose between Math or English and get 
                random questions from all topics to strengthen your skills.
              </p>
              
              <div className="flex items-center justify-center space-x-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Marathon className="h-4 w-4 mr-1" />
                  Unlimited Questions
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Self-Paced
                </div>
              </div>

              <Button
                onClick={onMarathonSelect}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold"
              >
                Start Marathon
              </Button>
            </div>
          </div>

          {/* Mock Test Mode */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mock Test</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Experience a full SAT simulation with timed sections, real question formats, 
                and comprehensive scoring to track your progress.
              </p>
              
              <div className="flex items-center justify-center space-x-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Real SAT Format
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Timed Sections
                </div>
              </div>

              <Button
                onClick={onMockTestSelect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              >
                Take Mock Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
