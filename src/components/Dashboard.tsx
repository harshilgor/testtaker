
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Zap, BookOpen, Brain, Settings } from 'lucide-react';
import AdminPanel from './AdminPanel';
import { useAdminAccess } from '@/hooks/useAdminAccess';

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

  if (showAdminPanel) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col px-4 py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-12 relative">
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Welcome back, {userName}!
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Choose your practice mode to continue your SAT preparation journey
            </p>
          </div>
          
          {/* Admin Access Button - Only visible to admin */}
          {isAdmin && (
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Marathon Mode */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 hover:scale-105">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Marathon Mode</h3>
                <p className="text-slate-600 mb-6 text-base leading-relaxed">3000+ real SAT practice questions with unlimited practice and instant feedback</p>
                
                <div className="flex items-center justify-center space-x-6 mb-6 text-sm text-slate-500">
                  <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
                    <Zap className="h-3 w-3 mr-1 text-orange-500" />
                    Unlimited
                  </div>
                  <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
                    <Brain className="h-3 w-3 mr-1 text-orange-500" />
                    Adaptive
                  </div>
                </div>

                <Button 
                  onClick={onMarathonSelect} 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200"
                >
                  Start Marathon
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Mode */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50 hover:scale-105">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Quiz Mode</h3>
                <p className="text-slate-600 mb-6 text-base leading-relaxed">Create custom quizzes from specific topics and difficulty levels for focused practice</p>
                
                <div className="flex items-center justify-center space-x-6 mb-6 text-sm text-slate-500">
                  <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
                    <BookOpen className="h-3 w-3 mr-1 text-purple-500" />
                    Custom
                  </div>
                  <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
                    <Brain className="h-3 w-3 mr-1 text-purple-500" />
                    Targeted
                  </div>
                </div>

                <Button 
                  onClick={onQuizSelect} 
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200"
                >
                  Create Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mock Test Mode */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:scale-105">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Mock Test</h3>
                <p className="text-slate-600 mb-6 text-base leading-relaxed">Take a full SAT mock test with real timing and adaptive scoring system</p>
                
                <div className="flex items-center justify-center space-x-6 mb-6 text-sm text-slate-500">
                  <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
                    <FileText className="h-3 w-3 mr-1 text-blue-500" />
                    Real Format
                  </div>
                  <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
                    <Brain className="h-3 w-3 mr-1 text-blue-500" />
                    Timed
                  </div>
                </div>

                <Button 
                  onClick={onMockTestSelect} 
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200"
                >
                  Take Mock Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Features Banner */}
        <Card className="mt-12 border-0 shadow-xl bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              🚀 Premium SAT Preparation Platform
            </h3>
            <p className="text-slate-600 text-lg mb-6 max-w-3xl mx-auto">
              Experience comprehensive SAT preparation with our AI-powered platform. Track your progress, 
              identify weak areas, and achieve your target score with personalized learning paths.
            </p>
            <div className="flex justify-center items-center space-x-8 text-sm text-slate-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                AI-Powered Analytics
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                Unlimited Practice
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                Real SAT Experience
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
