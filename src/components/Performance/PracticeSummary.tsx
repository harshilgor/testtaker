import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PracticeSummaryProps {
  userName: string;
}

interface SummaryStats {
  quizQuestions: number;
  quizAccuracy: number;
  marathonQuestions: number;
  marathonAvgTime: string;
  mockTests: number;
  mockAvgScore: number;
  lastQuizAttempt: string;
  lastMarathonSession: string;
  lastMockAttempt: string;
  quizDifficulty: { easy: number; medium: number; hard: number };
  marathonDifficulty: { easy: number; medium: number; hard: number };
}

const PracticeSummary: React.FC<PracticeSummaryProps> = ({ userName }) => {
  const [quizOpen, setQuizOpen] = useState(false);
  const [marathonOpen, setMarathonOpen] = useState(false);

  // Fetch real data from database
  const { data: summaryStats, isLoading } = useQuery<SummaryStats>({
    queryKey: ['practice-summary', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return {
          quizQuestions: 0,
          quizAccuracy: 0,
          marathonQuestions: 0,
          marathonAvgTime: '0s',
          mockTests: 0,
          mockAvgScore: 0,
          lastQuizAttempt: 'Never',
          lastMarathonSession: 'Never',
          lastMockAttempt: 'Never',
          quizDifficulty: { easy: 0, medium: 0, hard: 0 },
          marathonDifficulty: { easy: 0, medium: 0, hard: 0 }
        };
      }

      // Get difficulty breakdown from question attempts
      const { data: attempts } = await supabase
        .from('question_attempts_v2')
        .select('difficulty, session_type, is_correct, time_spent')
        .eq('user_id', user.user.id);

      const quizDifficulty = { easy: 0, medium: 0, hard: 0 };
      const marathonDifficulty = { easy: 0, medium: 0, hard: 0 };
      let quizCorrect = 0;
      let quizTotal = 0;
      let marathonTotal = 0;
      let marathonTotalTime = 0;

      if (attempts) {
        attempts.forEach((attempt: any) => {
          const difficulty = attempt.difficulty?.toLowerCase();
          if (!['easy', 'medium', 'hard'].includes(difficulty)) return;

          if (attempt.session_type === 'quiz') {
            quizDifficulty[difficulty as keyof typeof quizDifficulty]++;
            quizTotal++;
            if (attempt.is_correct) quizCorrect++;
          } else if (attempt.session_type === 'marathon') {
            marathonDifficulty[difficulty as keyof typeof marathonDifficulty]++;
            marathonTotal++;
            marathonTotalTime += attempt.time_spent || 0;
          }
        });
      }

      // Get latest sessions
      const [quizResults, marathonSessions, mockResults] = await Promise.all([
        supabase
          .from('quiz_results')
          .select('created_at')
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false })
          .limit(1),
        
        supabase
          .from('marathon_sessions')
          .select('created_at')
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false })
          .limit(1),
        
        supabase
          .from('mock_test_results')
          .select('completed_at, total_score')
          .eq('user_id', user.user.id)
          .order('completed_at', { ascending: false })
      ]);

      const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };

      const avgMarathonTime = marathonTotal > 0 ? 
        Math.round(marathonTotalTime / marathonTotal) + 's' : '0s';

      const mockAvgScore = mockResults.data && mockResults.data.length > 0 ? 
        Math.round(mockResults.data.reduce((sum, result) => sum + (result.total_score || 0), 0) / mockResults.data.length) : 0;

      return {
        quizQuestions: quizTotal,
        quizAccuracy: quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0,
        marathonQuestions: marathonTotal,
        marathonAvgTime: avgMarathonTime,
        mockTests: mockResults.data?.length || 0,
        mockAvgScore,
        lastQuizAttempt: quizResults.data?.[0]?.created_at ? formatDate(quizResults.data[0].created_at) : 'Never',
        lastMarathonSession: marathonSessions.data?.[0]?.created_at ? formatDate(marathonSessions.data[0].created_at) : 'Never',
        lastMockAttempt: mockResults.data?.[0]?.completed_at ? formatDate(mockResults.data[0].completed_at) : 'Never',
        quizDifficulty,
        marathonDifficulty
      };
    },
    enabled: !!userName,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = summaryStats!;

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Practice Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quiz Mode */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center mr-2">
                <span className="text-blue-600 text-sm">?</span>
              </div>
              <h3 className="font-semibold text-gray-900">Quiz Mode</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-3xl font-bold text-gray-900">{stats.quizQuestions}</span>
                <span className="text-3xl font-bold text-gray-900">{stats.quizAccuracy}%</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Questions Solved</span>
                <span>Avg. Accuracy</span>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Attempt</span>
                  <span className="text-gray-700">{stats.lastQuizAttempt}</span>
                </div>
              </div>
              
              <Collapsible open={quizOpen} onOpenChange={setQuizOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-xs p-2 h-8">
                    <span>Difficulty breakdown</span>
                    {quizOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 text-sm font-medium">{stats.quizDifficulty.easy}</span>
                    <span className="text-blue-600 text-sm font-medium">{stats.quizDifficulty.medium}</span>
                    <span className="text-purple-600 text-sm font-medium">{stats.quizDifficulty.hard}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Easy</span>
                    <span>Medium</span>
                    <span>Hard</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Marathon Mode */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center mr-2">
                <span className="text-orange-600 text-sm">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900">Marathon Mode</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-3xl font-bold text-gray-900">{stats.marathonQuestions}</span>
                <span className="text-3xl font-bold text-gray-900">{stats.marathonAvgTime}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Questions Solved</span>
                <span>Avg. Time/Question</span>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Longest Session</span>
                  <span className="text-gray-700">{Math.max(...Object.values(stats.marathonDifficulty))} Questions</span>
                </div>
              </div>
              
              <Collapsible open={marathonOpen} onOpenChange={setMarathonOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-xs p-2 h-8">
                    <span>Difficulty breakdown</span>
                    {marathonOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 text-sm font-medium">{stats.marathonDifficulty.easy}</span>
                    <span className="text-blue-600 text-sm font-medium">{stats.marathonDifficulty.medium}</span>
                    <span className="text-purple-600 text-sm font-medium">{stats.marathonDifficulty.hard}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Easy</span>
                    <span>Medium</span>
                    <span>Hard</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Mock Tests */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center mr-2">
                <span className="text-purple-600 text-sm">📝</span>
              </div>
              <h3 className="font-semibold text-gray-900">Mock Tests</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-3xl font-bold text-gray-900">{stats.mockTests}</span>
                <span className="text-3xl font-bold text-gray-900">{stats.mockAvgScore}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tests Completed</span>
                <span>Avg. Score</span>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Attempt</span>
                  <span className="text-gray-700">{stats.lastMockAttempt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeSummary;