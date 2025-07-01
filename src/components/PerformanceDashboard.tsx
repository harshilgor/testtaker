
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Target, Check, X, Calendar, Flame, Trophy, TrendingUp, BookOpen, Brain } from 'lucide-react';

interface PerformanceDashboardProps {
  userName: string;
  onBack: () => void;
}

interface QuizResult {
  score: number;
  questions: any[];
  answers: (number | null)[];
  subject: string;
  topics: string[];
  date: string;
  userName: string;
}

interface MockTestResult {
  score: number;
  questions: any[];
  answers: (number | null)[];
  date: string;
  userName: string;
  mathScore?: number;
  englishScore?: number;
}

interface MarathonSession {
  id: string;
  total_questions: number;
  correct_answers: number;
  difficulty: string;
  subjects: string[];
  created_at: string;
}

interface WeakTopic {
  skill: string;
  domain: string;
  accuracy: number;
  totalAttempts: number;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ userName, onBack }) => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [mockTestResults, setMockTestResults] = useState<MockTestResult[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>([false, false, false, false, false, false, false]);

  // Fetch marathon sessions from Supabase
  const { data: marathonSessions = [], isLoading } = useQuery({
    queryKey: ['marathon-sessions-performance', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('marathon_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching marathon sessions:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  // Fetch quiz attempts for weak topics analysis
  const { data: questionAttempts = [] } = useQuery({
    queryKey: ['question-attempts', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching question attempts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userName,
  });

  useEffect(() => {
    const storedQuizzes = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const storedMockTests = JSON.parse(localStorage.getItem('mockTestResults') || '[]');
    
    setQuizResults(storedQuizzes.filter((result: QuizResult) => result.userName === userName));
    setMockTestResults(storedMockTests.filter((result: MockTestResult) => result.userName === userName));
  }, [userName]);

  // Calculate weak topics from question attempts
  useEffect(() => {
    if (questionAttempts.length > 0) {
      const skillStats: { [key: string]: { correct: number; total: number; domain: string } } = {};
      
      questionAttempts.forEach(attempt => {
        const skill = attempt.topic;
        const domain = getSkillDomain(skill);
        
        if (!skillStats[skill]) {
          skillStats[skill] = { correct: 0, total: 0, domain };
        }
        
        skillStats[skill].total += 1;
        if (attempt.is_correct) {
          skillStats[skill].correct += 1;
        }
      });

      const weak = Object.entries(skillStats)
        .map(([skill, stats]) => ({
          skill,
          domain: stats.domain,
          accuracy: Math.round((stats.correct / stats.total) * 100),
          totalAttempts: stats.total
        }))
        .filter(topic => topic.totalAttempts >= 3 && topic.accuracy < 60)
        .sort((a, b) => a.accuracy - b.accuracy);

      setWeakTopics(weak);
    }
  }, [questionAttempts]);

  // Calculate streaks
  useEffect(() => {
    if (questionAttempts.length > 0) {
      const dates = questionAttempts.map(attempt => 
        new Date(attempt.created_at).toDateString()
      );
      const uniqueDates = [...new Set(dates)].sort();
      
      // Calculate current streak
      let streak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
        for (let i = uniqueDates.length - 1; i >= 0; i--) {
          const date = new Date(uniqueDates[i]);
          const expectedDate = new Date(Date.now() - (streak * 86400000));
          
          if (date.toDateString() === expectedDate.toDateString()) {
            streak++;
          } else {
            break;
          }
        }
      }
      
      setCurrentStreak(streak);
      setLongestStreak(Math.max(streak, uniqueDates.length));

      // Calculate weekly activity
      const thisWeek = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - (i * 86400000)).toDateString();
        thisWeek.push(uniqueDates.includes(date));
      }
      setWeeklyActivity(thisWeek);
    }
  }, [questionAttempts]);

  const getSkillDomain = (skill: string): string => {
    const domainMap: { [key: string]: string } = {
      'Linear Equations': 'Heart of Algebra',
      'Linear Inequalities': 'Heart of Algebra',
      'Systems of Equations': 'Heart of Algebra',
      'Quadratic Functions': 'Passport to Advanced Math',
      'Exponential Functions': 'Passport to Advanced Math',
      'Polynomial Functions': 'Passport to Advanced Math',
      'Geometry': 'Additional Topics in Math',
      'Trigonometry': 'Additional Topics in Math',
      'Data Analysis': 'Problem Solving and Data Analysis',
      'Statistics': 'Problem Solving and Data Analysis',
      'Grammar': 'Standard English Conventions',
      'Reading Comprehension': 'Reading',
      'Writing': 'Writing and Language'
    };
    return domainMap[skill] || 'Other';
  };

  // Calculate overall stats
  const totalQuizQuestions = quizResults.reduce((sum, result) => sum + result.questions.length, 0);
  const totalMarathonQuestions = marathonSessions.reduce((sum, session) => sum + (session.total_questions || 0), 0);
  const totalQuestions = totalQuizQuestions + totalMarathonQuestions + questionAttempts.length;
  
  const totalCorrect = quizResults.reduce((sum, result) => {
    return sum + result.answers.filter((answer, index) => 
      answer === result.questions[index]?.correctAnswer
    ).length;
  }, 0) + marathonSessions.reduce((sum, session) => sum + (session.correct_answers || 0), 0);
  
  const totalWrong = totalQuestions - totalCorrect;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const handlePracticeWeakTopic = (skill: string) => {
    console.log('Practice weak topic:', skill);
    // This would navigate to quiz creation with pre-selected topic
  };

  const getDayName = (index: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[index];
  };

  const isFirstTimeUser = totalQuestions === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button onClick={onBack} variant="outline" className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your SAT practice progress and identify areas for improvement</p>
        </div>

        {isFirstTimeUser ? (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Start Your SAT Journey</h2>
              <p className="text-gray-600 mb-4">You haven't taken any quizzes yet. Start now to track your progress!</p>
              <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
                Take Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overall Performance Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Performance Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white shadow-sm border-0 rounded-xl">
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-50 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{totalQuestions}</div>
                    <div className="text-sm text-gray-600">Questions Answered</div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-0 rounded-xl">
                  <CardContent className="p-6 text-center">
                    <div className="bg-red-50 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <X className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{totalWrong}</div>
                    <div className="text-sm text-gray-600">Wrong Answers</div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-0 rounded-xl">
                  <CardContent className="p-6 text-center">
                    <div className="bg-green-50 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{accuracy}%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Practice Scores */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Scores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white shadow-sm border-0 rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Mock Tests</h3>
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{mockTestResults.length}</div>
                    <div className="text-sm text-gray-600">Total Tests Taken</div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-0 rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Practice Questions</h3>
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Quiz Mode: <span className="font-semibold">{totalQuizQuestions}</span></div>
                    <div className="text-sm text-gray-600">Marathon Mode: <span className="font-semibold">{totalMarathonQuestions}</span></div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Streaks */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🔥 Streaks</h2>
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Flame className="h-6 w-6 text-orange-500 mr-2" />
                        <span className="text-lg font-semibold text-gray-900">Current Streak</span>
                      </div>
                      <div className="text-3xl font-bold text-orange-600">{currentStreak} days</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
                        <span className="text-lg font-semibold text-gray-900">Longest Streak</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">{longestStreak} days</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600 mb-3">This Week</div>
                    <div className="flex justify-between">
                      {weeklyActivity.map((active, index) => (
                        <div key={index} className="text-center">
                          <div className={`w-8 h-8 rounded-full mb-1 flex items-center justify-center ${
                            active ? 'bg-blue-600' : 'bg-gray-200'
                          }`}>
                            <div className={`w-3 h-3 rounded-full ${active ? 'bg-white' : ''}`} />
                          </div>
                          <div className="text-xs text-gray-500">{getDayName(index)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weak Topics */}
            {weakTopics.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Topics You Need to Improve</h2>
                <Card className="bg-white shadow-sm border-0 rounded-xl">
                  <CardContent className="p-6">
                    {Object.entries(
                      weakTopics.reduce((acc, topic) => {
                        if (!acc[topic.domain]) acc[topic.domain] = [];
                        acc[topic.domain].push(topic);
                        return acc;
                      }, {} as { [key: string]: WeakTopic[] })
                    ).map(([domain, topics]) => (
                      <div key={domain} className="mb-6 last:mb-0">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          📘 {domain}
                        </h3>
                        <div className="space-y-3">
                          {topics.map((topic) => (
                            <div key={topic.skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="text-sm font-medium text-gray-900">{topic.skill}</div>
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm text-gray-600">Accuracy:</div>
                                  <div className={`text-sm font-semibold ${
                                    topic.accuracy < 40 ? 'text-red-600' : topic.accuracy < 60 ? 'text-yellow-600' : 'text-green-600'
                                  }`}>
                                    {topic.accuracy}%
                                  </div>
                                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        topic.accuracy < 40 ? 'bg-red-500' : topic.accuracy < 60 ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${topic.accuracy}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePracticeWeakTopic(topic.skill)}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              >
                                Practice Again
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Milestones */}
            {totalQuestions >= 50 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Milestones</h2>
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm border-0 rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🎉</div>
                      <div>
                        <div className="font-semibold text-gray-900">Congratulations!</div>
                        <div className="text-gray-600">
                          {totalQuestions >= 100 ? `You've answered over ${Math.floor(totalQuestions / 100) * 100} questions!` : 
                           totalQuestions >= 50 ? "You've answered over 50 questions!" : 
                           "Keep up the great work!"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
