import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Zap, Clock, BookOpen, Brain } from 'lucide-react';
interface DashboardProps {
  userName: string;
  onMarathonSelect: () => void;
  onMockTestSelect: () => void;
  onQuizSelect: () => void;
}
const Dashboard: React.FC<DashboardProps> = ({
  userName,
  onMarathonSelect,
  onMockTestSelect,
  onQuizSelect
}) => {
  return <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600">
            Choose your practice mode to get started
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Marathon Mode */}
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="text-center">
              <div className="bg-orange-50 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Marathon Mode</h3>
              <p className="text-gray-600 mb-3 text-sm leading-relaxed my-[22px]">3000+ real SAT Practice questions </p>
              
              <div className="flex items-center justify-center space-x-3 mb-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Unlimited
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Self-Paced
                </div>
              </div>

              <Button onClick={onMarathonSelect} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 text-sm font-medium">
                Start Marathon
              </Button>
            </div>
          </div>

          {/* Quiz Mode */}
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="text-center">
              <div className="bg-purple-50 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quiz</h3>
              <p className="text-gray-600 mb-3 text-sm leading-relaxed">Create custom quizzes from specific topics </p>
              
              <div className="flex items-center justify-center space-x-3 mb-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Custom
                </div>
                <div className="flex items-center">
                  <Brain className="h-3 w-3 mr-1" />
                  Targeted
                </div>
              </div>

              <Button onClick={onQuizSelect} className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 text-sm font-medium">
                Create Quiz
              </Button>
            </div>
          </div>

          {/* Mock Test Mode */}
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100">
            <div className="text-center">
              <div className="bg-blue-50 rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Mock Test</h3>
              <p className="text-gray-600 mb-3 text-sm leading-relaxed">Take a full SAT mock test, with real timing and scoring</p>
              
              <div className="flex items-center justify-center space-x-3 mb-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  Real Format
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Timed
                </div>
              </div>

              <Button onClick={onMockTestSelect} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 text-sm font-medium">
                Take Mock Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Dashboard;