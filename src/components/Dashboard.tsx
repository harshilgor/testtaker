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
        <div className="text-center mb-6 relative flex-shrink-0">
          <div className="flex items-center justify-center gap-4 mb-3">
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
          <p className="text-sm md:text-base text-gray-600">
            Choose your practice mode to get started
          </p>
          
          {isAdmin && (
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 min-h-[40px] min-w-[40px]"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Main Content - Practice Modes + Widgets */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Practice Modes - Left Side */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
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

          {/* Widgets - Right Side - Much Smaller */}
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
