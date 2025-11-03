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
  X,
  CheckCircle,
  PlayCircle,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  TrendingDown,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RealTimePerformanceService } from '@/services/realTimePerformanceService';
import { useAuth } from '@/contexts/AuthContext';
import { infiniteQuestionService } from '@/services/infiniteQuestionService';

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

const ReviewMistakes: React.FC<{ userName: string; selectedDomain?: string | null }> = ({ userName, selectedDomain = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { questionAttempts, isInitialized } = useData();
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    skill: 'all',
    difficulty: 'all',
    subject: 'all',
    reviewStatus: 'all',
    bookmarked: false
  });
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'total'>('total');
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);
  const [showMistakeDialog, setShowMistakeDialog] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set());
  const [showTargetWeaknessDialog, setShowTargetWeaknessDialog] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [targetWeaknessQuestionCount, setTargetWeaknessQuestionCount] = useState<number>(20);
  const [domainSkillsData, setDomainSkillsData] = useState<Record<string, { skill: string; domain: string }[]>>({});
  const [domainAccuracy, setDomainAccuracy] = useState<Record<string, number>>({});
  const [skillAccuracy, setSkillAccuracy] = useState<Record<string, number>>({});
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [loadingDomainData, setLoadingDomainData] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

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

  // Use cached data from DataContext for instant loading
  const userAttempts = useMemo(() => {
    if (!isInitialized || !questionAttempts.length) {
      console.log('🔍 ReviewMistakes: No data available', { isInitialized, questionAttemptsLength: questionAttempts.length });
      return [];
    }
    
    // Filter to only incorrect attempts (mistakes)
    const mistakes = questionAttempts.filter(attempt => !attempt.is_correct);
    console.log(`🚀 Using cached data: ${mistakes.length} mistakes loaded instantly`);
    console.log('🔍 ReviewMistakes debug:', {
      totalAttempts: questionAttempts.length,
      correctAttempts: questionAttempts.filter(a => a.is_correct).length,
      incorrectAttempts: mistakes.length,
      sampleMistakes: mistakes.slice(0, 3).map(m => ({
        id: m.id,
        question_id: m.question_id,
        is_correct: m.is_correct,
        created_at: m.created_at
      }))
    });
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

    // Filter by selected domain
    if (selectedDomain) {
      filtered = filtered.filter(mistake => {
        // Check if this is a Reading & Writing or Math domain
        const readingWritingDomains = [
          'Information and Ideas',
          'Craft and Structure',
          'Expression of Ideas',
          'Standard English Conventions'
        ];
        const mathDomains = [
          'Algebra',
          'Advanced Math',
          'Problem-Solving and Data Analysis'
        ];
        
        let mappedDomain = '';
        if (readingWritingDomains.includes(selectedDomain)) {
          mappedDomain = RealTimePerformanceService.mapTopicToDomain(mistake.topic);
        } else if (mathDomains.includes(selectedDomain)) {
          mappedDomain = RealTimePerformanceService.mapTopicToMathDomain(mistake.topic);
        }
        
        return mappedDomain === selectedDomain;
      });
    }

    // Filter by time period (today, week, or total)
    if (timePeriod !== 'total') {
      const now = new Date();
      const cutoffDate = new Date();
      
      if (timePeriod === 'today') {
        cutoffDate.setHours(0, 0, 0, 0);
      } else if (timePeriod === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      }
      
      filtered = filtered.filter(mistake => 
        new Date(mistake.created_at) >= cutoffDate
      );
    }

    // Filter by date range (from filters dropdown)
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
  }, [mistakesWithDetails, filters, bookmarkedQuestions, selectedDomain, timePeriod]);

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
    if (!selectedDomain) {
      // If no domain selected, return all skills
      const skills = [...new Set(mistakesWithDetails.map(a => a.topic))].filter(Boolean);
      return skills.sort();
    }
    
    // If domain is selected, filter skills to only those in that domain
    const readingWritingDomains = [
      'Information and Ideas',
      'Craft and Structure',
      'Expression of Ideas',
      'Standard English Conventions'
    ];
    const mathDomains = [
      'Algebra',
      'Advanced Math',
      'Problem-Solving and Data Analysis'
    ];
    
    const skills = mistakesWithDetails
      .filter(mistake => {
        let mappedDomain = '';
        if (readingWritingDomains.includes(selectedDomain)) {
          mappedDomain = RealTimePerformanceService.mapTopicToDomain(mistake.topic);
        } else if (mathDomains.includes(selectedDomain)) {
          mappedDomain = RealTimePerformanceService.mapTopicToMathDomain(mistake.topic);
        }
        return mappedDomain === selectedDomain;
      })
      .map(a => a.topic)
      .filter(Boolean);
    
    const uniqueSkills = [...new Set(skills)];
    return uniqueSkills.sort();
  }, [mistakesWithDetails, selectedDomain]);

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

  // Get available domains
  const availableDomains = useMemo(() => {
    const readingWritingDomains = [
      'Information and Ideas',
      'Craft and Structure',
      'Expression of Ideas',
      'Standard English Conventions'
    ];
    
    const mathDomains = [
      'Algebra',
      'Advanced Math',
      'Problem-Solving and Data Analysis'
    ];
    
    return {
      readingWriting: readingWritingDomains,
      math: mathDomains,
      all: [...readingWritingDomains, ...mathDomains]
    };
  }, []);

  // Load domain and skill data when dialog opens
  useEffect(() => {
    if (showTargetWeaknessDialog && user) {
      loadDomainSkillsData();
    }
  }, [showTargetWeaknessDialog, user]);

  // Load domain and skill data from question_bank and calculate accuracy
  const loadDomainSkillsData = async () => {
    if (!user) return;
    setLoadingDomainData(true);
    
    try {
      // Load all skills from question_bank grouped by domain
      const [rwData, mathData] = await Promise.all([
        supabase
          .from('question_bank')
          .select('skill, domain')
          .eq('test', 'Reading and Writing')
          .eq('assessment', 'SAT')
          .not('skill', 'is', null)
          .not('domain', 'is', null),
        supabase
          .from('question_bank')
          .select('skill, domain')
          .eq('test', 'Math')
          .eq('assessment', 'SAT')
          .not('skill', 'is', null)
          .not('domain', 'is', null)
      ]);

      // Group skills by domain
      const domainSkills: Record<string, { skill: string; domain: string }[]> = {};
      
      [...(rwData.data || []), ...(mathData.data || [])].forEach(row => {
        const domain = row.domain as string;
        const skill = row.skill as string;
        if (!domainSkills[domain]) {
          domainSkills[domain] = [];
        }
        // Avoid duplicates
        if (!domainSkills[domain].find(s => s.skill === skill)) {
          domainSkills[domain].push({ skill, domain });
        }
      });

      setDomainSkillsData(domainSkills);

      // Load user attempts to calculate accuracy
      const { data: attempts } = await supabase
        .from('question_attempts_v2')
        .select('topic, subject, is_correct')
        .eq('user_id', user.id)
        .limit(5000);

      if (attempts && attempts.length > 0) {
        // Calculate domain accuracy
        const domainStats: Record<string, { correct: number; total: number }> = {};
        const skillStats: Record<string, { correct: number; total: number }> = {};

        attempts.forEach(attempt => {
          const topic = attempt.topic || '';
          if (!topic) return;

          // Map topic to domain
          const subjectLower = attempt.subject?.toLowerCase() || '';
          const isMath = subjectLower.includes('math');
          const domain = isMath
            ? RealTimePerformanceService.mapTopicToMathDomain(topic)
            : RealTimePerformanceService.mapTopicToDomain(topic);

          // Domain stats
          if (!domainStats[domain]) {
            domainStats[domain] = { correct: 0, total: 0 };
          }
          domainStats[domain].total++;
          if (attempt.is_correct) {
            domainStats[domain].correct++;
          }

          // Skill stats (topic = skill)
          if (!skillStats[topic]) {
            skillStats[topic] = { correct: 0, total: 0 };
          }
          skillStats[topic].total++;
          if (attempt.is_correct) {
            skillStats[topic].correct++;
          }
        });

        // Calculate accuracy percentages
        const domainAcc: Record<string, number> = {};
        Object.keys(domainStats).forEach(domain => {
          const stats = domainStats[domain];
          domainAcc[domain] = stats.total > 0 
            ? Math.round((stats.correct / stats.total) * 100) 
            : 0;
        });

        const skillAcc: Record<string, number> = {};
        Object.keys(skillStats).forEach(skill => {
          const stats = skillStats[skill];
          skillAcc[skill] = stats.total > 0 
            ? Math.round((stats.correct / stats.total) * 100) 
            : 0;
        });

        setDomainAccuracy(domainAcc);
        setSkillAccuracy(skillAcc);
      }
    } catch (error) {
      console.error('Error loading domain skills data:', error);
    } finally {
      setLoadingDomainData(false);
    }
  };

  // Handle "Target My Weakness" button click - opens dialog
  const handleTargetWeakness = () => {
    if (!user) return;
    setShowTargetWeaknessDialog(true);
  };

  // Handle starting the quiz with selected domains/skills
  const handleStartTargetWeaknessQuiz = async () => {
    if (generatingQuiz) return;
    
    setGeneratingQuiz(true);
    
    try {
      let questionsToGenerate: any[] = [];
      
      if (selectedDomains.size === 0 && selectedSkills.size === 0) {
        // If nothing selected, use default behavior (weak topics)
        const { data: attempts, error } = await supabase
          .from('question_attempts_v2')
          .select('topic, subject, is_correct')
          .eq('user_id', user!.id)
          .limit(5000);

        if (!error && attempts && attempts.length > 0) {
          const topicStats = new Map<string, { correct: number; total: number }>();
          
          attempts.forEach(attempt => {
            const topic = attempt.topic || 'Unknown';
            const current = topicStats.get(topic) || { correct: 0, total: 0 };
            current.total++;
            if (attempt.is_correct) {
              current.correct++;
            }
            topicStats.set(topic, current);
          });
          
          const weak: Array<{ topic: string; accuracy: number }> = [];
          topicStats.forEach((stats, topic) => {
            if (stats.total >= 3) {
              const topicAccuracy = Math.round((stats.correct / stats.total) * 100);
              if (topicAccuracy < 60) {
                weak.push({ topic, accuracy: topicAccuracy });
              }
            }
          });
          
          const weakTopics = weak.sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
          
          if (weakTopics.length > 0) {
            // Generate questions for weak topics
            const questionsPerTopic = Math.ceil(targetWeaknessQuestionCount / weakTopics.length);
            for (const weakTopic of weakTopics) {
              // Determine subject from topic
              const subjectLower = weakTopic.topic.toLowerCase();
              const isMath = subjectLower.includes('algebra') || subjectLower.includes('equation') || 
                            subjectLower.includes('math') || subjectLower.includes('geometry');
              const subject: 'math' | 'english' = isMath ? 'math' : 'english';
              
              // Find domain for this topic
              const domain = isMath
                ? RealTimePerformanceService.mapTopicToMathDomain(weakTopic.topic)
                : RealTimePerformanceService.mapTopicToDomain(weakTopic.topic);
              
              try {
                const response = await infiniteQuestionService.getInfiniteQuestions({
                  subject,
                  skill: weakTopic.topic,
                  domain,
                  difficulty: 'mixed',
                  count: questionsPerTopic,
                  useAI: true
                });
                questionsToGenerate.push(...response.questions);
              } catch (error) {
                console.error(`Error generating questions for ${weakTopic.topic}:`, error);
              }
            }
          }
        }
      } else {
        // Generate questions from selected domains/skills
        const selectedDomainsArray = Array.from(selectedDomains);
        const selectedSkillsArray = Array.from(selectedSkills);
        
        // Determine which domains/skills to use
        if (selectedSkillsArray.length > 0) {
          // If skills are selected, use those
          const questionsPerSkill = Math.ceil(targetWeaknessQuestionCount / selectedSkillsArray.length);
          
          for (const skill of selectedSkillsArray) {
            // Find which domain this skill belongs to
            let domain = '';
            let subject: 'math' | 'english' = 'english';
            
            // Check all domains to find which one contains this skill
            for (const [dom, skills] of Object.entries(domainSkillsData)) {
              if (skills.some(s => s.skill === skill)) {
                domain = dom;
                // Determine subject from domain
                const readingWritingDomains = ['Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions'];
                subject = readingWritingDomains.includes(dom) ? 'english' : 'math';
                break;
              }
            }
            
            if (domain) {
              try {
                const response = await infiniteQuestionService.getInfiniteQuestions({
                  subject,
                  skill,
                  domain,
                  difficulty: 'mixed',
                  count: questionsPerSkill,
                  useAI: true
                });
                questionsToGenerate.push(...response.questions);
              } catch (error) {
                console.error(`Error generating questions for skill ${skill}:`, error);
              }
            }
          }
        } else if (selectedDomainsArray.length > 0) {
          // If only domains are selected, generate questions for all skills in those domains
          const questionsPerDomain = Math.ceil(targetWeaknessQuestionCount / selectedDomainsArray.length);
          
          for (const domain of selectedDomainsArray) {
            const domainSkills = domainSkillsData[domain] || [];
            if (domainSkills.length > 0) {
              const questionsPerSkill = Math.ceil(questionsPerDomain / domainSkills.length);
              
              for (const { skill } of domainSkills) {
                // Determine subject from domain
                const readingWritingDomains = ['Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions'];
                const subject: 'math' | 'english' = readingWritingDomains.includes(domain) ? 'english' : 'math';
                
                try {
                  const response = await infiniteQuestionService.getInfiniteQuestions({
                    subject,
                    skill,
                    domain,
                    difficulty: 'mixed',
                    count: questionsPerSkill,
                    useAI: true
                  });
                  questionsToGenerate.push(...response.questions);
                } catch (error) {
                  console.error(`Error generating questions for ${skill} in ${domain}:`, error);
                }
              }
            }
          }
        }
      }
      
      // Limit to requested question count
      const finalQuestions = questionsToGenerate.slice(0, targetWeaknessQuestionCount);
      
      // Convert to QuizQuestion format
      const quizQuestions = finalQuestions.map((q, index) => {
        // Convert correct_answer to numeric index
        let correctAnswerIndex = 0;
        const correctAns = String(q.correct_answer || 'A').toUpperCase();
        if (correctAns === 'A' || correctAns === '1') correctAnswerIndex = 0;
        else if (correctAns === 'B' || correctAns === '2') correctAnswerIndex = 1;
        else if (correctAns === 'C' || correctAns === '3') correctAnswerIndex = 2;
        else if (correctAns === 'D' || correctAns === '4') correctAnswerIndex = 3;
        
        // Convert id to number
        let questionId: number;
        if (typeof q.id === 'number') {
          questionId = q.id;
        } else if (typeof q.id === 'string' && !isNaN(parseInt(q.id))) {
          questionId = parseInt(q.id);
        } else {
          questionId = index + 1;
        }
        
        return {
          id: questionId,
          question: q.question_text || q.question || '',
          options: [
            q.option_a || q.options?.[0] || 'Option A',
            q.option_b || q.options?.[1] || 'Option B',
            q.option_c || q.options?.[2] || 'Option C',
            q.option_d || q.options?.[3] || 'Option D'
          ],
          correctAnswer: correctAnswerIndex,
          explanation: q.correct_rationale || q.explanation || '',
          topic: q.skill || q.topic || '',
          subject: q.test === 'Math' ? 'math' : 'english',
          difficulty: (q.difficulty || 'medium').toLowerCase()
        };
      });
      
      if (quizQuestions.length === 0) {
        alert('No questions could be generated. Please try selecting different domains or skills.');
        setGeneratingQuiz(false);
        return;
      }
      
      // Navigate to quiz page with questions
      setShowTargetWeaknessDialog(false);
      navigate('/quiz', {
        state: {
          mode: 'target-weakness',
          questions: quizQuestions,
          questionCount: quizQuestions.length,
          targetWeakness: {
            domains: Array.from(selectedDomains),
            skills: Array.from(selectedSkills)
          }
        }
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate quiz. Please try again.');
      setGeneratingQuiz(false);
    }
  };

  const toggleDomain = (domain: string) => {
    setSelectedDomains(prev => {
      const newSet = new Set(prev);
      if (newSet.has(domain)) {
        newSet.delete(domain);
        // Also remove all skills from this domain
        const domainSkills = domainSkillsData[domain] || [];
        setSelectedSkills(prevSkills => {
          const newSkillSet = new Set(prevSkills);
          domainSkills.forEach(s => newSkillSet.delete(s.skill));
          return newSkillSet;
        });
      } else {
        newSet.add(domain);
        // Also select all skills from this domain
        const domainSkills = domainSkillsData[domain] || [];
        setSelectedSkills(prevSkills => {
          const newSkillSet = new Set(prevSkills);
          domainSkills.forEach(s => newSkillSet.add(s.skill));
          return newSkillSet;
        });
      }
      return newSet;
    });
  };

  const toggleSkill = (skill: string, domain: string) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skill)) {
        newSet.delete(skill);
        // Check if domain should be unselected (if no skills selected)
        const domainSkills = domainSkillsData[domain] || [];
        const hasOtherSelectedSkills = domainSkills.some(s => s.skill !== skill && newSet.has(s.skill));
        if (!hasOtherSelectedSkills) {
          setSelectedDomains(prevDomains => {
            const newDomainSet = new Set(prevDomains);
            newDomainSet.delete(domain);
            return newDomainSet;
          });
        }
      } else {
        newSet.add(skill);
      }
      return newSet;
    });
  };

  const toggleDomainExpansion = (domain: string) => {
    setExpandedDomains(prev => {
      const newSet = new Set(prev);
      if (newSet.has(domain)) {
        newSet.delete(domain);
      } else {
        newSet.add(domain);
      }
      return newSet;
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
    <div>
      <Card className="rounded-2xl border border-gray-200 shadow-sm">
        <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Review Mistakes</h3>
              <p className="text-sm text-gray-600">Identify patterns and improve your performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{filteredMistakes.length} mistakes</span>
            <Button
              onClick={handleTargetWeakness}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              <Target className="h-4 w-4" />
              Target My Weakness
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

        {/* Time Period Toggles */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            onClick={() => setTimePeriod('today')}
            variant={timePeriod === 'today' ? 'default' : 'outline'}
            className={timePeriod === 'today' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
            size="sm"
          >
            Today
          </Button>
          <Button
            onClick={() => setTimePeriod('week')}
            variant={timePeriod === 'week' ? 'default' : 'outline'}
            className={timePeriod === 'week' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
            size="sm"
          >
            This Week
          </Button>
          <Button
            onClick={() => setTimePeriod('total')}
            variant={timePeriod === 'total' ? 'default' : 'outline'}
            className={timePeriod === 'total' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
            size="sm"
          >
            Total
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
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
          
          <Button
            onClick={() => {
              setFilters({
                dateRange: 'all',
                skill: 'all',
                difficulty: 'all',
                subject: 'all',
                reviewStatus: 'all',
                bookmarked: false
              });
              setTimePeriod('total');
            }}
            variant="outline"
            size="sm"
            className="border-gray-300"
          >
            Show All Mistakes
          </Button>

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
                className="border border-gray-200 rounded-2xl p-4 bg-white hover:border-gray-300 transition-colors cursor-pointer"
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

        {/* Target My Weakness Dialog */}
        <Dialog open={showTargetWeaknessDialog} onOpenChange={setShowTargetWeaknessDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Target My Weakness
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {loadingDomainData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <>
                  {/* Domain and Skill Selection */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Domains & Skills to Practice</h3>
                    
                    {/* Reading & Writing Section */}
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase">Reading & Writing</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableDomains.readingWriting.map(domain => {
                          const domainSkills = domainSkillsData[domain] || [];
                          const isExpanded = expandedDomains.has(domain);
                          const isDomainSelected = selectedDomains.has(domain);
                          const domainAcc = domainAccuracy[domain] ?? null;
                          
                          return (
                            <div key={domain} className="border border-gray-200 rounded-xl overflow-hidden">
                              {/* Domain Header */}
                              <button
                                onClick={() => toggleDomain(domain)}
                                className={`w-full p-3 flex items-center justify-between text-left transition-all ${
                                  isDomainSelected
                                    ? 'bg-purple-50 border-l-4 border-l-purple-600'
                                    : 'bg-white hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isDomainSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                                  }`}>
                                    {isDomainSelected && <CheckCircle className="h-3 w-3 text-white" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">{domain}</span>
                                      {domainAcc !== null && (
                                        <Badge variant="outline" className={`text-xs ${
                                          domainAcc < 60 ? 'border-red-300 text-red-700 bg-red-50' :
                                          domainAcc < 80 ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                                          'border-green-300 text-green-700 bg-green-50'
                                        }`}>
                                          {domainAcc}% accuracy
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {domainSkills.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleDomainExpansion(domain);
                                    }}
                                    className="ml-2 p-1 hover:bg-gray-100 rounded"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </button>

                              {/* Skills List */}
                              {isExpanded && domainSkills.length > 0 && (
                                <div className="bg-gray-50 border-t border-gray-200">
                                  {domainSkills.map(({ skill }) => {
                                    const isSkillSelected = selectedSkills.has(skill);
                                    const skillAcc = skillAccuracy[skill] ?? null;
                                    
                                    return (
                                      <button
                                        key={skill}
                                        onClick={() => toggleSkill(skill, domain)}
                                        className={`w-full p-3 pl-12 flex items-center justify-between text-left hover:bg-gray-100 transition-all border-b border-gray-200 last:border-b-0 ${
                                          isSkillSelected ? 'bg-purple-50' : ''
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                            isSkillSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                                          }`}>
                                            {isSkillSelected && <CheckCircle className="h-2.5 w-2.5 text-white" />}
                                          </div>
                                          <span className="text-sm text-gray-700">{skill}</span>
                                        </div>
                                        {skillAcc !== null && (
                                          <Badge variant="outline" className={`text-xs ml-2 ${
                                            skillAcc < 60 ? 'border-red-300 text-red-700 bg-red-50' :
                                            skillAcc < 80 ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                                            'border-green-300 text-green-700 bg-green-50'
                                          }`}>
                                            {skillAcc}%
                                          </Badge>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Math Section */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase">Math</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableDomains.math.map(domain => {
                          const domainSkills = domainSkillsData[domain] || [];
                          const isExpanded = expandedDomains.has(domain);
                          const isDomainSelected = selectedDomains.has(domain);
                          const domainAcc = domainAccuracy[domain] ?? null;
                          
                          return (
                            <div key={domain} className="border border-gray-200 rounded-xl overflow-hidden">
                              {/* Domain Header */}
                              <button
                                onClick={() => toggleDomain(domain)}
                                className={`w-full p-3 flex items-center justify-between text-left transition-all ${
                                  isDomainSelected
                                    ? 'bg-purple-50 border-l-4 border-l-purple-600'
                                    : 'bg-white hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isDomainSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                                  }`}>
                                    {isDomainSelected && <CheckCircle className="h-3 w-3 text-white" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">{domain}</span>
                                      {domainAcc !== null && (
                                        <Badge variant="outline" className={`text-xs ${
                                          domainAcc < 60 ? 'border-red-300 text-red-700 bg-red-50' :
                                          domainAcc < 80 ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                                          'border-green-300 text-green-700 bg-green-50'
                                        }`}>
                                          {domainAcc}% accuracy
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {domainSkills.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleDomainExpansion(domain);
                                    }}
                                    className="ml-2 p-1 hover:bg-gray-100 rounded"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </button>

                              {/* Skills List */}
                              {isExpanded && domainSkills.length > 0 && (
                                <div className="bg-gray-50 border-t border-gray-200">
                                  {domainSkills.map(({ skill }) => {
                                    const isSkillSelected = selectedSkills.has(skill);
                                    const skillAcc = skillAccuracy[skill] ?? null;
                                    
                                    return (
                                      <button
                                        key={skill}
                                        onClick={() => toggleSkill(skill, domain)}
                                        className={`w-full p-3 pl-12 flex items-center justify-between text-left hover:bg-gray-100 transition-all border-b border-gray-200 last:border-b-0 ${
                                          isSkillSelected ? 'bg-purple-50' : ''
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                            isSkillSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                                          }`}>
                                            {isSkillSelected && <CheckCircle className="h-2.5 w-2.5 text-white" />}
                                          </div>
                                          <span className="text-sm text-gray-700">{skill}</span>
                                        </div>
                                        {skillAcc !== null && (
                                          <Badge variant="outline" className={`text-xs ml-2 ${
                                            skillAcc < 60 ? 'border-red-300 text-red-700 bg-red-50' :
                                            skillAcc < 80 ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                                            'border-green-300 text-green-700 bg-green-50'
                                          }`}>
                                            {skillAcc}%
                                          </Badge>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      {selectedDomains.size === 0 && selectedSkills.size === 0
                        ? "Leave unselected to practice your weakest topics automatically"
                        : `${selectedDomains.size} domain${selectedDomains.size !== 1 ? 's' : ''}, ${selectedSkills.size} skill${selectedSkills.size !== 1 ? 's' : ''} selected`
                      }
                    </p>
                  </div>
                </>
              )}

              {/* Question Count */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetWeaknessQuestionCount}
                  onChange={(e) => setTargetWeaknessQuestionCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Choose between 1-100 questions</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowTargetWeaknessDialog(false)}
                  size="sm"
                  disabled={generatingQuiz}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartTargetWeaknessQuiz}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                  disabled={generatingQuiz}
                >
                  {generatingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    'Start Practice'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewMistakes;

