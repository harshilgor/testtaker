import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Zap, Clock, BookOpen, Brain, Settings } from 'lucide-react';
import AdminPanel from './AdminPanel';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useNavigate } from 'react-router-dom';
import { useStreakData } from '@/hooks/useStreakData';

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
  const { isAdmin } = useAdminAccess();
  const navigate = useNavigate();
  const { recordActivity } = useStreakData();

  // Record dashboard visit activity
  useEffect(() => {
    recordActivity('dashboard_visit');
  }, [recordActivity]);

  if (showAdminPanel) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />;
  }

  const handleMockTestSelect = () => {
    navigate('/sat-mock-test');
  };

  const handleQuizSelect = () => {
    recordActivity('quiz_start');
    onQuizSelect();
  };

  const handleMarathonSelect = () => {
    recordActivity('marathon_start');
    onMarathonSelect();
  };

  const handleMockTestSelectWithActivity = () => {
    recordActivity('mocktest_start');
    handleMockTestSelect();
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-4 md:py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-6 md:mb-8 relative">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h1>
          <p className="text-base md:text-lg text-gray-600">
            Choose your practice mode to get started
          </p>
          
          {/* Admin Access Button - Only visible to admin */}
          {isAdmin && (
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Marathon Mode */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="bg-orange-50 rounded-full p-2 md:p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <Zap className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Marathon Mode</h3>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm leading-relaxed">3000+ real SAT Practice questions with unlimited practice</p>
                
                <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Unlimited
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Self-Paced
                  </div>
                </div>

                <Button onClick={handleMarathonSelect} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 md:py-3 font-medium text-sm md:text-base">
                  Start Marathon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Mode */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="bg-purple-50 rounded-full p-2 md:p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <Brain className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Quiz</h3>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm leading-relaxed">Create custom quizzes from specific topics and difficulty levels</p>
                
                <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Custom
                  </div>
                  <div className="flex items-center">
                    <Brain className="h-3 w-3 mr-1" />
                    Targeted
                  </div>
                </div>

                <Button onClick={handleQuizSelect} className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 md:py-3 font-medium text-sm md:text-base">
                  Create Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mock Test Mode */}
          <Card className="hover:shadow-lg transition-shadow border border-gray-100">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className="bg-blue-50 rounded-full p-2 md:p-3 w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Mock Test</h3>
                <p className="text-gray-600 mb-3 md:mb-4 text-sm leading-relaxed">Take a full SAT mock test with real timing and adaptive scoring</p>
                
                <div className="flex items-center justify-center space-x-3 md:space-x-4 mb-3 md:mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    Real Format
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Timed
                  </div>
                </div>

                <Button onClick={handleMockTestSelectWithActivity} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 md:py-3 font-medium text-sm md:text-base">
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
