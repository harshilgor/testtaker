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
  onMockTestSelect: () => void;
  onQuizSelect: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  onMockTestSelect,
  onQuizSelect
}) => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [questStats, setQuestStats] = useState({ completed: 0, total: 0 });
  const [loadingQuests, setLoadingQuests] = useState(true);
  const { isAdmin } = useSecureAdminAccess();
  const navigate = useNavigate();

  // Generate dynamic quests based on user weaknesses
  const generateDynamicQuests = () => {
    // For new users, show basic quests
    if (questStats.total === 0) {
      return [
        {
          title: "Solve 10 Analysis Questions",
          points: 50,
          progress: 0,
          progressText: "0/10 questions",
          topic: "analysis",
          subject: "math"
        },
        {
          title: "Complete 5 Reading Passages",
          points: 40,
          progress: 0,
          progressText: "0/5 passages",
          topic: "reading",
          subject: "english"
        },
        {
          title: "Practice 15 Algebra Problems",
          points: 60,
          progress: 0,
          progressText: "0/15 problems",
          topic: "algebra",
          subject: "math"
        }
      ];
    }

    // For existing users, generate quests based on performance
    // This would ideally come from user performance data
    return [
      {
        title: "Improve Geometry Skills",
        points: 45,
        progress: 30,
        progressText: "3/10 questions",
        topic: "geometry",
        subject: "math"
      },
      {
        title: "Master Grammar Rules",
        points: 35,
        progress: 60,
        progressText: "6/10 questions",
        topic: "grammar",
        subject: "english"
      },
      {
        title: "Practice Word Problems",
        points: 55,
        progress: 0,
        progressText: "0/12 problems",
        topic: "word_problems",
        subject: "math"
      }
    ];
  };

  // Handle starting a quest
  const handleStartQuest = (quest: any) => {
    // Navigate to quiz with specific topic
    navigate('/quiz', { 
      state: { 
        autoSelectTopic: quest.topic,
        subject: quest.subject,
        questionCount: quest.title.includes('10') ? 10 : quest.title.includes('15') ? 15 : quest.title.includes('12') ? 12 : 5
      }
    });
  };

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
              </div>
              
              <div className="flex items-center gap-2">
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

            {/* Main Content - Live Quests + Practice Modes + Widgets */}
            <div className="flex-1 flex items-start gap-6 overflow-hidden">
              {/* Left Side - Live Quests (Smaller) */}
              <div className="flex-shrink-0 w-80">
                <Card className="w-80 h-80 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 flex flex-col">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Live Quests</h3>
                        <p className="text-xs text-gray-600">{questStats.completed}/{questStats.total} completed</p>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      {loadingQuests ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Dynamic Quests based on user weaknesses */}
                          {generateDynamicQuests().map((quest, index) => (
                            <div key={index} className="bg-white rounded border border-blue-100 p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-900 truncate">{quest.title}</span>
                                <span className="text-xs text-blue-600 font-medium">+{quest.points}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-blue-500 h-1 rounded-full" 
                                  style={{ width: `${quest.progress}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{quest.progressText}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => setShowQuestsModal(true)}
                      className="w-full mt-auto bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded"
                    >
                      View All Quests
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Center - Practice Modes - Stacked Vertically */}
              <div className="flex-1 max-w-md">
                <div className="space-y-6 h-full">
                  {/* Practice Card */}
                  <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl flex-1">
                    <CardContent className="p-6 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-6">
                        <div className="bg-purple-50 rounded-full p-4 w-16 h-16 flex items-center justify-center flex-shrink-0">
                          <Brain className="h-8 w-8 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Practice</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Custom
                            </div>
                            <div className="flex items-center">
                              <Brain className="h-4 w-4 mr-2" />
                              Targeted
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={onQuizSelect} 
                          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 text-base rounded-lg flex-shrink-0"
                        >
                          Create
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mock Test Card */}
                  <Card className="hover:shadow-lg transition-shadow border border-gray-100 rounded-xl flex-1">
                    <CardContent className="p-6 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-6">
                        <div className="bg-blue-50 rounded-full p-4 w-16 h-16 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Mock Test</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Real Format
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Timed
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={handleMockTestSelect} 
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-base rounded-lg flex-shrink-0"
                        >
                          Take Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Side - Your Stats Widget */}
              <div className="flex-shrink-0 w-80">
                <div className="w-80 h-64 overflow-hidden">
                  <WidgetCarousel />
                </div>
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
