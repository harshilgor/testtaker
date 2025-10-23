import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Zap, Clock, BookOpen, Brain, Settings, Trophy, Target } from 'lucide-react';
import AdminPanel from './AdminPanel';
import { useSecureAdminAccess } from '@/hooks/useSecureAdminAccess';
import { useNavigate } from 'react-router-dom';
import QuestsModal from './Quests/QuestsModal';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import RecentSessionsPrefetcher from './Performance/RecentSessionsPrefetcher';
import WidgetCarousel from './Widgets/WidgetCarousel';

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
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [questStats, setQuestStats] = useState({ completed: 0, total: 0 });
  const [loadingQuests, setLoadingQuests] = useState(true);
  const { isAdmin } = useSecureAdminAccess();
  const navigate = useNavigate();

  // Fetch quest statistics
  useEffect(() => {
    const fetchQuestStats = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data: quests, error } = await supabase
          .from('user_quests')
          .select('completed, quest_type')
          .eq('user_id', user.user.id)
          .gte('expires_at', new Date().toISOString());

        if (error) {
          console.error('Error fetching quest stats:', error);
          return;
        }

        const dailyQuests = quests?.filter(q => q.quest_type === 'daily') || [];
        const completed = dailyQuests.filter(q => q.completed).length;
        const total = dailyQuests.length;

        setQuestStats({ completed, total });
      } catch (error) {
        console.error('Error in fetchQuestStats:', error);
      } finally {
        setLoadingQuests(false);
      }
    };

    fetchQuestStats();
  }, []);

  if (showAdminPanel) {
    return <AdminPanel />;
  }

  const handleMockTestSelect = () => {
    navigate('/sat-mock-test');
  };

  return (
    <div className="h-screen flex flex-col px-4 py-6 overflow-hidden">
      {/* Pre-fetch recent sessions data for instant loading on Performance page */}
      <RecentSessionsPrefetcher userName={userName} />
      
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, {userName}!
            </h1>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowQuestsModal(true)}
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 px-4 py-2 font-medium text-sm rounded-xl min-h-[40px] flex items-center gap-2 relative"
              >
                <Trophy className="h-4 w-4" />
                Daily Quests
                {!loadingQuests && questStats.total > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                  >
                    {questStats.completed}/{questStats.total}
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-sm md:text-base text-gray-600 hidden md:block">
              Choose your practice mode to get started
            </p>
            {isAdmin && (
              <Button
                onClick={() => setShowAdminPanel(true)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 min-h-[40px] min-w-[40px]"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content - Practice Modes + Widgets */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Practice Modes - Left Side - Stacked Vertically */}
          <div className="flex-shrink-0 w-80">
            <div className="space-y-4 h-full">
              {/* Marathon Mode Card */}
              <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-50 rounded-full p-3 w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Marathon Mode</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Zap className="h-3 w-3 mr-1" />
                          Unlimited
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Self-Paced
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={onMarathonSelect} 
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm rounded-lg flex-shrink-0"
                    >
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quiz Card */}
              <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-50 rounded-full p-3 w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Brain className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Quiz</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <div className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Custom
                        </div>
                        <div className="flex items-center">
                          <Brain className="h-3 w-3 mr-1" />
                          Targeted
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={onQuizSelect} 
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 text-sm rounded-lg flex-shrink-0"
                    >
                      Create
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mock Test Card */}
              <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 rounded-full p-3 w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Mock Test</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          Real Format
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Timed
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleMockTestSelect} 
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm rounded-lg flex-shrink-0"
                    >
                      Take Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Content - Middle Section */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">2,847</div>
                  <div className="text-xs text-blue-700">Questions Solved</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">84.2%</div>
                  <div className="text-xs text-green-700">Accuracy</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">#15</div>
                  <div className="text-xs text-purple-700">Leaderboard</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card className="flex-1">
              <CardContent className="p-4 h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Speed Demon</div>
                      <div className="text-xs text-gray-600">Completed 50 questions in 30 minutes</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Accuracy Master</div>
                      <div className="text-xs text-gray-600">Achieved 95% accuracy in Math</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Study Streak</div>
                      <div className="text-xs text-gray-600">18 days in a row!</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Widgets - Right Side */}
          <div className="flex-shrink-0 w-80 overflow-hidden">
            <WidgetCarousel />
          </div>
        </div>
      </div>

      {/* Quests Modal */}
      <QuestsModal 
        open={showQuestsModal}
        onClose={() => setShowQuestsModal(false)}
        userName={userName}
        onQuestCompleted={() => {
          // Refresh quest stats when a quest is completed
          const fetchQuestStats = async () => {
            try {
              const { data: user } = await supabase.auth.getUser();
              if (!user.user) return;

              const { data: quests, error } = await supabase
                .from('user_quests')
                .select('completed, quest_type')
                .eq('user_id', user.user.id)
                .gte('expires_at', new Date().toISOString());

              if (error) {
                console.error('Error fetching quest stats:', error);
                return;
              }

              const dailyQuests = quests?.filter(q => q.quest_type === 'daily') || [];
              const completed = dailyQuests.filter(q => q.completed).length;
              const total = dailyQuests.length;

              setQuestStats({ completed, total });
            } catch (error) {
              console.error('Error in fetchQuestStats:', error);
            }
          };

          fetchQuestStats();
        }}
      />
    </div>
  );
};

export default Dashboard;
