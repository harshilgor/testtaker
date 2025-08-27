import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Zap, Clock, BookOpen, Brain, Settings } from 'lucide-react';
import AdminPanel from './AdminPanel';
import { useSecureAdminAccess } from '@/hooks/useSecureAdminAccess';
import { useNavigate } from 'react-router-dom';

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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { isAdmin } = useSecureAdminAccess();
  const navigate = useNavigate();

  if (showAdminPanel) {
    return <AdminPanel />;
  }

  const handleMockTestSelect = () => {
    navigate('/sat-mock-test');
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-8 md:mb-10 relative">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
            Welcome back, {userName}!
          </h1>
          <p className="text-base md:text-lg text-gray-600 px-4">
            Choose your practice mode to get started
          </p>
          
          {isAdmin && (
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px]"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Marathon Mode Card */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl">
            <CardContent className="p-6 md:p-8">
              <div className="text-center">
                <div className="bg-orange-50 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Marathon Mode</h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed px-2">
                  3000+ real SAT Practice questions with unlimited practice
                </p>
                
                <div className="flex items-center justify-center space-x-4 mb-6 text-xs md:text-sm text-gray-500">
                  <div className="flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Unlimited
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Self-Paced
                  </div>
                </div>

                <Button 
                  onClick={onMarathonSelect} 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 md:py-4 font-medium text-sm md:text-base rounded-xl min-h-[44px]"
                >
                  Start Marathon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Card */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl">
            <CardContent className="p-6 md:p-8">
              <div className="text-center">
                <div className="bg-purple-50 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Quiz</h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed px-2">
                  Create custom quizzes from specific topics and difficulty levels
                </p>
                
                <div className="flex items-center justify-center space-x-4 mb-6 text-xs md:text-sm text-gray-500">
                  <div className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Custom
                  </div>
                  <div className="flex items-center">
                    <Brain className="h-3 w-3 mr-1" />
                    Targeted
                  </div>
                </div>

                <Button 
                  onClick={onQuizSelect} 
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 md:py-4 font-medium text-sm md:text-base rounded-xl min-h-[44px]"
                >
                  Create Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mock Test Card */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl">
            <CardContent className="p-6 md:p-8">
              <div className="text-center">
                <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Mock Test</h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed px-2">
                  Take a full SAT mock test with real timing and adaptive scoring
                </p>
                
                <div className="flex items-center justify-center space-x-4 mb-6 text-xs md:text-sm text-gray-500">
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    Real Format
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Timed
                  </div>
                </div>

                <Button 
                  onClick={handleMockTestSelect} 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 md:py-4 font-medium text-sm md:text-base rounded-xl min-h-[44px]"
                >
                  Take Mock Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
