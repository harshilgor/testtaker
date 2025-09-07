import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useData } from '@/contexts/DataContext';
import { 
  AlertCircle,
  Filter,
  Clock,
  Target,
  Eye,
  TrendingDown,
  X,
  CheckCircle,
  PlayCircle,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ComprehensiveWeaknessInsights from './ComprehensiveWeaknessInsights';

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
  bookmarked: boolean;
}

interface PracticeData {
  questions: Mistake[];
  focusTopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number;
  targetScore: number;
}

const ReviewMistakes: React.FC<{ userName: string }> = ({ userName }) => {
  const navigate = useNavigate();
  const { questionAttempts, isInitialized } = useData();
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'latest',
    skill: 'all',
    difficulty: 'all',
    subject: 'all',
    reviewStatus: 'all',
    bookmarked: false
  });
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);
  const [showMistakeDialog, setShowMistakeDialog] = useState(false);
  const [showWeaknessInsights, setShowWeaknessInsights] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());

  // Load bookmarked questions from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem(`bookmarked_questions_${userName}`);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      const ids = Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
      setBookmarkedQuestions(new Set(ids));
    }
  }, [userName]);

  // Save bookmarked questions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`bookmarked_questions_${userName}`, JSON.stringify([...bookmarkedQuestions]));
  }, [bookmarkedQuestions, userName]);

  // Load solved questions from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem(`solved_questions_${userName}`);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      const ids = Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
      setSolvedQuestions(new Set(ids));
    }
  }, [userName]);

  // Save solved questions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`solved_questions_${userName}`, JSON.stringify([...solvedQuestions]));
  }, [solvedQuestions, userName]);

  // Toggle bookmark for a question
  const toggleBookmark = (questionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening the question dialog
    const id = String(questionId);
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Check if a question is bookmarked
  const isBookmarked = (questionId: string) => bookmarkedQuestions.has(String(questionId));

  // Handle practice session start from WeaknessInsights
  const handleStartPractice = (practiceData: PracticeData) => {
    // Store practice data in localStorage for the quiz component to access
    localStorage.setItem('weaknessPracticeData', JSON.stringify(practiceData));
    
    // Navigate to the quiz page with practice mode
    navigate('/quiz', { 
      state: { 
        mode: 'weakness-practice',
        practiceData: practiceData
      }
    });
  };

  // Use cached data from DataContext for instant loading
  const userAttempts = useMemo(() => {
    if (!isInitialized || !questionAttempts.length) {
      return [];
    }
    
    // Filter to only incorrect attempts (mistakes)
    const mistakes = questionAttempts.filter(attempt => !attempt.is_correct);
    console.log(`🚀 Using cached data: ${mistakes.length} mistakes loaded instantly`);
    return mistakes;
  }, [questionAttempts, isInitialized]);

  // Use cached question details for instant loading
  const questionDetails = useMemo(() => {
    if (!userAttempts.length) {
      return [];
    }

    // Try to get question details from localStorage cache first
    try {
      const cachedQuestions = localStorage.getItem('question_bank_cache');
      if (cachedQuestions) {
        const parsed = JSON.parse(cachedQuestions);
        const questionIds = [...new Set(userAttempts.map(a => a.question_id).filter(Boolean))];
        const cachedDetails = questionIds
          .map(id => parsed.find((q: any) => q.id === parseInt(id)))
          .filter(Boolean);
        
        if (cachedDetails.length > 0) {
          console.log(`🚀 Using cached question details: ${cachedDetails.length} questions loaded instantly`);
          return cachedDetails;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached question details:', error);
    }

    // Fallback: return empty array for now, will be populated by background fetch
    return [];
  }, [userAttempts]);

  // Background fetch for question details (non-blocking)
  const { data: freshQuestionDetails = [] } = useQuery({
    queryKey: ['question-details', userAttempts],
    queryFn: async () => {
      if (!userAttempts.length) return [];

      const questionIds = [...new Set(userAttempts.map(a => a.question_id).filter(Boolean))];
      if (!questionIds.length) return [];

      console.log('🔄 Background fetching question details for:', questionIds.length, 'questions');

      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .in('id', questionIds.map(id => parseInt(id)).filter(id => !isNaN(id)));

      if (error) {
        console.error('Error fetching question details:', error);
        return [];
      }

      // Cache the results for instant loading next time
      try {
        const existingCache = JSON.parse(localStorage.getItem('question_bank_cache') || '[]');
        const newCache = [...existingCache, ...(data || [])];
        // Remove duplicates
        const uniqueCache = newCache.filter((item: any, index: number, self: any[]) => 
          index === self.findIndex((t: any) => t.id === item.id)
        );
        localStorage.setItem('question_bank_cache', JSON.stringify(uniqueCache));
        console.log('💾 Question details cached for instant loading');
      } catch (error) {
        console.warn('Failed to cache question details:', error);
      }

      return data || [];
    },
    enabled: userAttempts.length > 0,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  // Note: Real-time updates are handled by DataContext, no need for separate subscription

  // Combine attempts with question details and add review status
  const mistakesWithDetails = useMemo(() => {
    console.log('Calculating mistakes with details...');
    console.log('User attempts:', userAttempts.length);
    console.log('Cached question details:', questionDetails.length);
    console.log('Fresh question details:', freshQuestionDetails.length);
    
    if (!userAttempts.length) {
      console.log('No user attempts available');
      return [];
    }

    // Merge cached and fresh question details
    const allQuestionDetails = [...questionDetails, ...freshQuestionDetails];
    const uniqueQuestionDetails = allQuestionDetails.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );

    if (!uniqueQuestionDetails.length) {
      console.log('No question details available yet, will show basic info');
      // Return basic mistakes without full question details
      return userAttempts.map(attempt => ({
        ...attempt,
        question_text: `Question ${attempt.question_id}`,
        correct_answer: 'Loading...',
        explanation: 'Loading question details...',
        options: ['Loading...', 'Loading...', 'Loading...', 'Loading...'],
        user_answer: 'Incorrect',
        topic: attempt.topic,
        difficulty: attempt.difficulty,
        review_status: 'unreviewed' as const,
        repeat_count: 0,
        error_type: 'general'
      } as Mistake));
    }

    const questionMap = new Map(uniqueQuestionDetails.map(q => [q.id.toString(), q]));
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
  }, [userAttempts, questionDetails, freshQuestionDetails]);

  // Filter mistakes based on selected filters
  const filteredMistakes = useMemo(() => {
    let filtered = mistakesWithDetails;

    // Apply bookmarked filter first
    if (filters.bookmarked) {
      filtered = filtered.filter(mistake => bookmarkedQuestions.has(String(mistake.question_id)));
      // Deduplicate by question_id so a question appears only once
      const seen = new Set<string>();
      filtered = filtered.filter(m => {
        const id = String(m.question_id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      if (filters.dateRange === 'latest') {
        // For "latest", we'll sort by date and take the most recent ones
        // This will be handled after all filtering is done
      } else {
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

    // Handle "latest" filter - sort by date and take the 10 most recent
    if (filters.dateRange === 'latest') {
      filtered = filtered
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
    }

    return filtered;
  }, [mistakesWithDetails, filters, bookmarkedQuestions]);

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

  // Handle "Solve Mistakes" button click
  const handleSolveMistakes = () => {
    // If no real mistakes, create demo questions for testing
    if (filteredMistakes.length === 0) {
      const demoQuestions = [
        {
          id: 1,
          question: "What is the value of x in the equation 2x + 5 = 13?",
          options: ["x = 3", "x = 4", "x = 5", "x = 6"],
          correctAnswer: "B",
          explanation: "To solve 2x + 5 = 13, subtract 5 from both sides to get 2x = 8, then divide by 2 to get x = 4.",
          subject: "Math",
          topic: "Linear Equations",
          difficulty: "medium",
          domain: "Algebra"
        },
        {
          id: 2,
          question: "Which of the following is a synonym for 'ubiquitous'?",
          options: ["Rare", "Everywhere", "Hidden", "Temporary"],
          correctAnswer: "B",
          explanation: "Ubiquitous means existing or being everywhere at the same time; omnipresent.",
          subject: "English",
          topic: "Vocabulary",
          difficulty: "medium",
          domain: "Reading"
        },
        {
          id: 3,
          question: "What is the slope of the line passing through points (2, 3) and (4, 7)?",
          options: ["1", "2", "3", "4"],
          correctAnswer: "B",
          explanation: "Using the slope formula: m = (y₂ - y₁)/(x₂ - x₁) = (7 - 3)/(4 - 2) = 4/2 = 2",
          subject: "Math",
          topic: "Coordinate Geometry",
          difficulty: "medium",
          domain: "Algebra"
        }
      ];

      const mistakeQuizData = {
        type: 'mistakes-review',
        questions: demoQuestions,
        title: 'Demo Mistakes Quiz',
        description: `Practice with ${demoQuestions.length} sample questions`,
        createdAt: new Date().toISOString(),
        userName: userName
      };

      localStorage.setItem('currentMistakeQuiz', JSON.stringify(mistakeQuizData));
      navigate('/quiz?mode=mistakes');
      console.log(`🎯 Starting demo mistakes quiz with ${demoQuestions.length} questions`);
      return;
    }

    // Convert mistakes to quiz format
    const mistakeQuestions = filteredMistakes.map(mistake => {
      const question = questionDetails.find(q => q.id.toString() === mistake.question_id);
      if (!question) return null;

      return {
        id: question.id,
        question: question.question_text || '',
        options: [
          question.option_a,
          question.option_b, 
          question.option_c,
          question.option_d
        ].filter(Boolean),
        correctAnswer: question.correct_answer || 'A',
        explanation: question.correct_rationale || '',
        subject: mistake.subject || 'General',
        topic: mistake.topic || question.skill || 'General',
        difficulty: mistake.difficulty || question.difficulty || 'medium',
        domain: question.domain || 'General'
      };
    }).filter(Boolean);

    if (mistakeQuestions.length === 0) {
      console.warn('No valid mistake questions found');
      return;
    }

    // Store the mistake quiz data in localStorage for the quiz page
    const mistakeQuizData = {
      type: 'mistakes-review',
      questions: mistakeQuestions,
      title: 'Review Your Mistakes',
      description: `Practice ${mistakeQuestions.length} questions you previously got wrong`,
      createdAt: new Date().toISOString(),
      userName: userName
    };

    localStorage.setItem('currentMistakeQuiz', JSON.stringify(mistakeQuizData));
    
    // Navigate to quiz page
    navigate('/quiz?mode=mistakes');
    
    console.log(`🎯 Starting mistakes quiz with ${mistakeQuestions.length} questions`);
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
    <div className={`${showWeaknessInsights ? 'flex gap-6' : ''}`}>
      {/* Weakness Insights Panel */}
      {showWeaknessInsights && (
        <div className="w-1/3">
          <Card className="bg-white border border-gray-200 shadow-sm h-fit">
            <CardContent className="p-6">
                            <ComprehensiveWeaknessInsights
                mistakes={mistakesWithDetails}
                userName={userName}
                onStartPractice={handleStartPractice}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Mistakes Panel */}
      <div className={`${showWeaknessInsights ? 'w-2/3' : 'w-full'}`}>
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{filteredMistakes.length} mistakes</span>
            <Button
              onClick={() => setShowWeaknessInsights(!showWeaknessInsights)}
              variant="outline"
              className="flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
              size="sm"
            >
              <Target className="h-4 w-4" />
              {showWeaknessInsights ? 'Hide Practice' : 'Practice'}
            </Button>
            <Button
              onClick={handleSolveMistakes}
              disabled={filteredMistakes.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              size="sm"
            >
              <PlayCircle className="h-4 w-4" />
              Solve Mistakes
            </Button>
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
              <SelectItem value="latest">Latest</SelectItem>
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

          {/* Bookmarked Filter Button */}
          <Button
            onClick={() => setFilters(prev => ({ ...prev, bookmarked: !prev.bookmarked }))}
            variant={filters.bookmarked ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              filters.bookmarked 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            size="sm"
          >
            {filters.bookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            Bookmarked
            {filters.bookmarked && (
              <Badge variant="secondary" className="ml-1 bg-white text-blue-600">
                {bookmarkedQuestions.size}
              </Badge>
            )}
          </Button>
        </div>

        {/* Mistakes List */}
        <div className="space-y-3">
          {filteredMistakes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                {filters.bookmarked ? 'No bookmarked questions found' : 'No mistakes found'}
              </p>
              <p className="text-sm text-gray-400">
                {filters.bookmarked 
                  ? 'Bookmark questions you want to review later.' 
                  : 'Great job! Keep up the excellent work.'
                }
              </p>
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
                  <div className="flex items-center gap-2">
                    {/* Bookmark Button */}
                    <Button
                      onClick={(e) => toggleBookmark(mistake.question_id, e)}
                      variant="ghost"
                      size="sm"
                      className={`p-2 h-8 w-8 ${
                        isBookmarked(mistake.question_id)
                          ? "text-blue-600 hover:text-blue-700"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {isBookmarked(mistake.question_id) ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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
      </div>
    </div>
  );
};

export default ReviewMistakes;

