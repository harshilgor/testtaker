import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertCircle,
  Brain,
  Filter,
  Clock,
  Target,
  BookOpen,
  TrendingDown,
  Eye,
  Save,
  RefreshCw
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
  error_type?: string; // New field for error categorization
}

interface Mistake {
  id: string;
  question_id: string;
  topic: string;
  difficulty: string;
  subject: string;
  time_spent: number;
  created_at: string;
  review_status: 'unreviewed' | 'reviewed' | 'retried'; // New field for review tracking
  repeat_count: number; // Track how many times this type of mistake occurs
  // Question data from question_bank
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

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterOptions;
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
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  // Fetch user's mistakes from question attempts
  const { data: userAttempts = [] } = useQuery({
    queryKey: ['user-mistakes', userName],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      console.log('Fetching user mistakes...');

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

      console.log(`Found ${data?.length || 0} mistakes from question_attempts_v2`);
      
      // Also check for mistakes from localStorage quiz results as backup
      let combinedMistakes = data || [];
      try {
        const storedQuizzes = JSON.parse(localStorage.getItem('quizResults') || '[]');
        const userQuizzes = storedQuizzes.filter((r: any) => r.userName === userName);
        
        userQuizzes.forEach((quiz: any) => {
          if (quiz.questions && quiz.answers) {
            quiz.questions.forEach((question: any, index: number) => {
              const userAnswer = quiz.answers[index];
              if (userAnswer !== question.correctAnswer && userAnswer !== null) {
                // Add as a mistake
                combinedMistakes.push({
                  id: `local-${quiz.date}-${index}`,
                  user_id: user.user.id,
                  question_id: question.id?.toString() || `local-q-${index}`,
                  topic: question.topic || question.skill || quiz.subject,
                  subject: quiz.subject,
                  difficulty: question.difficulty || 'medium',
                  is_correct: false,
                  time_spent: question.timeSpent || 0,
                  created_at: quiz.date,
                  session_type: 'quiz',
                  session_id: quiz.date,
                  points_earned: 0
                });
              }
            });
          }
        });
      } catch (e) {
        console.warn('Failed to merge local quiz mistakes:', e);
      }
      
      console.log(`Total mistakes (DB + localStorage): ${combinedMistakes.length}`);
      return combinedMistakes;
    },
    enabled: !!userName,
  });

  // Fetch question details for the mistakes
  const { data: questionDetails = [] } = useQuery({
    queryKey: ['question-details', userAttempts],
    queryFn: async () => {
      if (!userAttempts.length) return [];

      const questionIds = [...new Set(userAttempts.map(a => a.question_id).filter(Boolean))];
      
      if (!questionIds.length) return [];

      console.log('Fetching question details for:', questionIds);

      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .in('id', questionIds.map(id => parseInt(id)).filter(id => !isNaN(id)));

      if (error) {
        console.error('Error fetching question details:', error);
        return [];
      }

      console.log(`Found ${data?.length || 0} question details`);
      return data || [];
    },
    enabled: userAttempts.length > 0,
  });

  // Combine attempts with question details and add review status
  const mistakesWithDetails = useMemo(() => {
    if (!userAttempts.length || !questionDetails.length) return [];

    const questionMap = new Map(questionDetails.map(q => [q.id.toString(), q]));
    
    return userAttempts.map(attempt => {
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

    // Most common error type
    const errorTypeCounts = mistakesWithDetails.reduce((acc, mistake) => {
      const errorType = mistake.error_type || 'general';
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrorType = Object.entries(errorTypeCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalMistakes,
      recentMistakes,
      topTopics,
      avgTimeSpent,
      topErrorType: topErrorType ? { type: topErrorType[0], count: topErrorType[1], percentage: Math.round((topErrorType[1] / totalMistakes) * 100) } : null
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
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Save current filter preset
  const saveCurrentFilter = () => {
    if (!newFilterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: newFilterName,
      filters: { ...filters }
    };
    
    setSavedFilters(prev => [...prev.slice(-4), newFilter]); // Keep only 5 presets
    setNewFilterName('');
    setShowSaveFilterDialog(false);
  };

  // Apply saved filter
  const applySavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
  };

  // Get related mistakes for detailed review
  const getRelatedMistakes = (currentMistake: Mistake) => {
    return mistakesWithDetails
      .filter(m => 
        m.id !== currentMistake.id && 
        m.topic === currentMistake.topic &&
        new Date(m.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      )
      .slice(0, 3);
  };

  // Generate learning tips based on mistake data
  const generateLearningTips = (mistake: Mistake) => {
    const tips = [];
    
    if (mistake.time_spent < 10) {
      tips.push("This might be a rushed guess—try reading twice");
    } else if (mistake.time_spent > 120) {
      tips.push("You spent a lot of time on this question. Consider reviewing time management strategies.");
    }
    
    if (mistake.repeat_count > 2) {
      tips.push(`You've missed this type ${mistake.repeat_count} times—review the rule here`);
    }
    
    if (tips.length === 0) {
      tips.push("Take your time to understand the question fully before answering.");
    }
    
    return tips;
  };

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Review Mistakes</h3>
              <p className="text-sm text-gray-500">Learn from your errors</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-red-50 text-red-700">
            {filteredMistakes.length} mistakes
          </Badge>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{mistakeStats.totalMistakes}</div>
            <div className="text-sm text-red-600">Total Mistakes</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{mistakeStats.recentMistakes}</div>
            <div className="text-sm text-orange-600">This Week</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {mistakeStats.topTopics[0]?.topic || 'N/A'}
            </div>
            <div className="text-sm text-blue-600">Top Weak Area</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatTime(mistakeStats.avgTimeSpent)}
            </div>
            <div className="text-sm text-purple-600">Avg. Time</div>
          </div>
        </div>

        {/* Most Common Error Type Card */}
        {mistakeStats.topErrorType && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Most Common Error Type</h4>
                <p className="text-sm text-gray-600">
                  {mistakeStats.topErrorType.type}: {mistakeStats.topErrorType.percentage}% of Mistakes
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, skill: mistakeStats.topErrorType!.type }))}
              >
                View All
              </Button>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.skill} onValueChange={(value) => setFilters(prev => ({ ...prev, skill: value }))}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.subject} onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {uniqueSubjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.reviewStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, reviewStatus: value }))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unreviewed">Unreviewed</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="retried">Retried</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveFilterDialog(true)}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Filters
          </Button>
        </div>

        {/* Saved Filter Presets */}
        {savedFilters.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Saved Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map(filter => (
                <Button
                  key={filter.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applySavedFilter(filter)}
                  className="text-xs"
                >
                  {filter.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Mistakes List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredMistakes.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No mistakes found with current filters</p>
              <p className="text-sm text-gray-400">Great job! Keep up the good work!</p>
            </div>
          ) : (
            filteredMistakes.map((mistake, index) => (
              <div key={mistake.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-xs ${
                        mistake.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        mistake.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {mistake.difficulty}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {mistake.subject}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(mistake.created_at)}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {mistake.question_text || 'Question text not available'}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>Your answer: {mistake.user_answer || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(mistake.time_spent || 0)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMistake(mistake);
                      setShowMistakeDialog(true);
                    }}
                    className="ml-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mistake Detail Dialog */}
        <Dialog open={showMistakeDialog} onOpenChange={setShowMistakeDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Mistake Review
              </DialogTitle>
            </DialogHeader>
            
            {selectedMistake && (
              <div className="space-y-4">
                {/* Question Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${
                      selectedMistake.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      selectedMistake.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedMistake.difficulty}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {selectedMistake.subject}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(selectedMistake.created_at)}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedMistake.question_text || 'Question text not available'}
                    </p>
                  </div>
                </div>

                {/* Answer Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h5 className="font-medium text-red-900 mb-1">Your Answer</h5>
                    <p className="text-red-700">{selectedMistake.user_answer || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-1">Correct Answer</h5>
                    <p className="text-green-700">{selectedMistake.correct_answer || 'N/A'}</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-800">
                      {formatTime(selectedMistake.time_spent || 0)}
                    </div>
                    <div className="text-sm text-blue-600">Time Spent</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-800">
                      {selectedMistake.topic}
                    </div>
                    <div className="text-sm text-purple-600">Topic</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-800">
                      {selectedMistake.difficulty}
                    </div>
                    <div className="text-sm text-orange-600">Difficulty</div>
                  </div>
                </div>

                {/* Learning Tips */}
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h5 className="font-medium text-yellow-900 mb-2">💡 Learning Tips</h5>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    {generateLearningTips(selectedMistake).map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Related Mistakes */}
                {(() => {
                  const relatedMistakes = getRelatedMistakes(selectedMistake);
                  if (relatedMistakes.length > 0) {
                    return (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Related Mistakes</h5>
                        <div className="space-y-2">
                          {relatedMistakes.map((related, index) => (
                            <div key={related.id} className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="text-sm text-gray-700 line-clamp-1">
                                {related.question_text}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedMistake(related);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Save Filter Dialog */}
        <Dialog open={showSaveFilterDialog} onOpenChange={setShowSaveFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save Filter Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Filter Name</label>
                <input
                  type="text"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  placeholder="e.g., My Weak Math Topics This Month"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSaveFilterDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveCurrentFilter} disabled={!newFilterName.trim()}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ReviewMistakes;
