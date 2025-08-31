import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertCircle,
  Filter,
  Clock,
  Target,
  Eye,
  TrendingDown,
  X,
  CheckCircle
} from 'lucide-react';

interface QuestionBankItem {
  id: number;
  question_text: string;
  correct_answer: string;
  correct_rationale: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  skill: string;
  difficulty: string;
  domain: string;
  error_type?: string;
}

interface Mistake {
  id: string;
  question_id: string;
  topic: string;
  difficulty: string;
  subject: string;
  time_spent: number;
  created_at: string;
  review_status: 'unreviewed' | 'reviewed' | 'retried';
  repeat_count: number;
  question_text?: string;
  correct_answer?: string;
  explanation?: string;
  options?: string[];
  user_answer?: string;
  error_type?: string;
}

interface FilterOptions {
  dateRange: string;
  skill: string;
  difficulty: string;
  subject: string;
  reviewStatus: string;
}

const ReviewMistakes: React.FC<{ userName: string }> = ({ userName }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    skill: 'all',
    difficulty: 'all',
    subject: 'all',
    reviewStatus: 'all'
  });
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);
  const [showMistakeDialog, setShowMistakeDialog] = useState(false);

  // Fetch user's mistakes from question attempts
  const { data: userAttempts = [], refetch: refetchMistakes } = useQuery({
    queryKey: ['user-mistakes', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('No authenticated user found');
        return [];
      }

      console.log('Fetching user mistakes for user:', user.user.id);

      // First, let's check if there are ANY attempts for this user
      const { data: allAttempts, error: allError } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.user.id)
        .limit(10);

      if (allError) {
        console.error('Error fetching all attempts:', allError);
        return [];
      }

      console.log(`Total attempts for user: ${allAttempts?.length || 0}`);
      console.log('Sample attempts:', allAttempts);

      // Now get incorrect attempts
      const { data, error } = await supabase
        .from('question_attempts_v2')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('is_correct', false)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching mistakes:', error);
        return [];
      }

      console.log(`Found ${data?.length || 0} mistakes`);
      return data || [];
    },
    enabled: !!userName,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Fetch question details for the mistakes
  const { data: questionDetails = [] } = useQuery({
    queryKey: ['question-details', userAttempts],
    queryFn: async () => {
      if (!userAttempts.length) {
        console.log('No user attempts to fetch question details for');
        return [];
      }

      const questionIds = [...new Set(userAttempts.map(a => a.question_id).filter(Boolean))];
      
      if (!questionIds.length) {
        console.log('No question IDs found in user attempts');
        return [];
      }

      console.log('Fetching question details for question IDs:', questionIds);

      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .in('id', questionIds.map(id => parseInt(id)).filter(id => !isNaN(id)));

      if (error) {
        console.error('Error fetching question details:', error);
        return [];
      }

      console.log(`Found ${data?.length || 0} question details`);
      console.log('Sample question details:', data?.slice(0, 2));
      return data || [];
    },
    enabled: userAttempts.length > 0,
  });

  // Realtime: auto-refresh when user's attempts change
  useEffect(() => {
    let channel: any;
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      channel = supabase
        .channel('review-mistakes-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'question_attempts_v2',
          filter: `user_id=eq.${user.user.id}`
        }, () => {
          refetchMistakes();
        })
        .subscribe();
    })();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userName, refetchMistakes]);

  // Combine attempts with question details and add review status
  const mistakesWithDetails = useMemo(() => {
    console.log('Calculating mistakes with details...');
    console.log('User attempts:', userAttempts.length);
    console.log('Question details:', questionDetails.length);
    
    if (!userAttempts.length || !questionDetails.length) {
      console.log('No user attempts or question details available');
      return [];
    }

    const questionMap = new Map(questionDetails.map(q => [q.id.toString(), q]));
    console.log('Question map size:', questionMap.size);
    
    const mistakes = userAttempts.map(attempt => {
      const question = questionMap.get(attempt.question_id);
      if (!question) {
        console.warn('Question not found for attempt:', attempt.question_id);
        return null;
      }

      // Determine user's answer based on the question options
      const userAnswer = "Incorrect";
      
      // Calculate repeat count for this type of mistake
      const similarMistakes = userAttempts.filter(a => 
        a.question_id !== attempt.question_id && 
        a.topic === attempt.topic
      ).length;
      
      return {
        ...attempt,
        question_text: question.question_text,
        correct_answer: question.correct_answer,
        explanation: question.correct_rationale,
        options: [question.option_a, question.option_b, question.option_c, question.option_d].filter(Boolean),
        user_answer: userAnswer,
        topic: question.skill || attempt.topic,
        difficulty: question.difficulty || attempt.difficulty,
        review_status: 'unreviewed' as const, // Default status
        repeat_count: similarMistakes,
        error_type: (question as any).error_type || 'general'
      } as Mistake;
    }).filter(Boolean) as Mistake[];
    
    console.log('Final mistakes with details:', mistakes.length);
    return mistakes;
  }, [userAttempts, questionDetails]);

  // Filter mistakes based on selected filters
  const filteredMistakes = useMemo(() => {
    let filtered = mistakesWithDetails;

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(mistake => 
        new Date(mistake.created_at) >= cutoffDate
      );
    }

    // Filter by skill/topic
    if (filters.skill !== 'all') {
      filtered = filtered.filter(mistake => mistake.topic === filters.skill);
    }

    // Filter by difficulty
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(mistake => mistake.difficulty === filters.difficulty);
    }

    // Filter by subject
    if (filters.subject !== 'all') {
      filtered = filtered.filter(mistake => mistake.subject === filters.subject);
    }

    // Filter by review status
    if (filters.reviewStatus !== 'all') {
      filtered = filtered.filter(mistake => mistake.review_status === filters.reviewStatus);
    }

    return filtered;
  }, [mistakesWithDetails, filters]);

  // Calculate mistake statistics
  const mistakeStats = useMemo(() => {
    const totalMistakes = mistakesWithDetails.length;
    const recentMistakes = mistakesWithDetails.filter(m => {
      const mistakeDate = new Date(m.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return mistakeDate >= weekAgo;
    }).length;

    // Most common mistake topics
    const topicCounts = mistakesWithDetails.reduce((acc, mistake) => {
      acc[mistake.topic] = (acc[mistake.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, count }));

    // Average time spent on mistakes
    const avgTimeSpent = mistakesWithDetails.length > 0 
      ? mistakesWithDetails.reduce((sum, m) => sum + (m.time_spent || 0), 0) / mistakesWithDetails.length
      : 0;

    return {
      totalMistakes,
      recentMistakes,
      topTopics,
      avgTimeSpent
    };
  }, [mistakesWithDetails]);

  // Get unique values for filters
  const uniqueSkills = useMemo(() => {
    const skills = [...new Set(mistakesWithDetails.map(a => a.topic))].filter(Boolean);
    return skills.sort();
  }, [mistakesWithDetails]);

  const uniqueSubjects = useMemo(() => {
    const subjects = [...new Set(mistakesWithDetails.map(a => a.subject))].filter(Boolean);
    return subjects.sort();
  }, [mistakesWithDetails]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate learning insights based on mistake data
  const generateInsights = (mistake: Mistake) => {
    const insights = [];
    
    if (mistake.time_spent < 15) {
      insights.push("You answered too quickly. Take time to read the question carefully.");
    } else if (mistake.time_spent > 120) {
      insights.push("You spent a long time on this question. Consider reviewing time management strategies.");
    }
    
    if (mistake.repeat_count > 2) {
      insights.push(`This is a recurring mistake in ${mistake.topic}. Focus on understanding the underlying concept.`);
    }
    
    if (insights.length === 0) {
      insights.push("Review the explanation carefully to understand why your answer was incorrect.");
    }
    
    return insights;
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Review Mistakes</h3>
              <p className="text-sm text-gray-500">Identify patterns and improve your performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{filteredMistakes.length} mistakes</span>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Total Mistakes</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{mistakeStats.totalMistakes}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">This Week</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{mistakeStats.recentMistakes}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Top Weak Area</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {mistakeStats.topTopics[0]?.topic || 'N/A'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          
          <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
            <SelectTrigger className="w-32 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.skill} onValueChange={(value) => setFilters(prev => ({ ...prev, skill: value }))}>
            <SelectTrigger className="w-40 border-gray-300">
              <SelectValue placeholder="All Skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {uniqueSkills.map(skill => (
                <SelectItem key={skill} value={skill}>{skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
            <SelectTrigger className="w-32 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mistakes List */}
        <div className="space-y-3">
          {filteredMistakes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No mistakes found</p>
              <p className="text-sm text-gray-400">Great job! Keep up the excellent work.</p>
            </div>
          ) : (
            filteredMistakes.map((mistake, index) => (
              <div 
                key={mistake.id || index} 
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedMistake(mistake);
                  setShowMistakeDialog(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                        {mistake.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                        {mistake.subject}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(mistake.created_at)}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {mistake.question_text || 'Question text not available'}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <X className="h-4 w-4 text-red-500" />
                        <span>Incorrect</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(mistake.time_spent || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{mistake.topic}</span>
                      </div>
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 ml-2" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mistake Detail Dialog */}
        <Dialog open={showMistakeDialog} onOpenChange={setShowMistakeDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Mistake Analysis
              </DialogTitle>
            </DialogHeader>
            
            {selectedMistake && (
              <div className="space-y-6">
                {/* Question */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Question</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedMistake.question_text || 'Question text not available'}</p>
                  </div>
                </div>

                {/* Answer Analysis */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                    <h5 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Your Answer
                    </h5>
                    <p className="text-red-700">{selectedMistake.user_answer || 'Incorrect'}</p>
                  </div>
                  <div className="border border-gray-200 bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Correct Answer
                    </h5>
                    <p className="text-gray-700">{selectedMistake.correct_answer || 'N/A'}</p>
                  </div>
                </div>

                {/* Explanation */}
                {selectedMistake.explanation && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Why This Was Wrong</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedMistake.explanation}</p>
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {formatTime(selectedMistake.time_spent || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {selectedMistake.topic}
                    </div>
                    <div className="text-sm text-gray-600">Topic</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {selectedMistake.difficulty}
                    </div>
                    <div className="text-sm text-gray-600">Difficulty</div>
                  </div>
                </div>

                {/* Learning Insights */}
                <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                  <h5 className="font-medium text-red-900 mb-2">💡 Learning Insight</h5>
                  <ul className="text-red-800 text-sm space-y-1">
                    {generateInsights(selectedMistake).map((insight, index) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ReviewMistakes;

