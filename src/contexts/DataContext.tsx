import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

// Define data types
interface QuizResult {
  id: string;
  user_id: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_taken: number;
  created_at: string;
}


interface QuestionAttempt {
  id: string;
  user_id: string;
  question_id: string;
  topic: string;
  difficulty: string;
  subject: string;
  time_spent: number;
  created_at: string;
  is_correct: boolean;
  session_id: string | null;
  session_type: string;
  points_earned: number;
}


interface MarathonSession {
  id: string;
  user_id: string;
  subjects: string[];
  difficulty: string | null;
  timed_mode: boolean | null;
  adaptive_learning: boolean | null;
  show_answer_used: number | null;
  incorrect_answers: number | null;
  correct_answers: number | null;
  time_goal_minutes: number | null;
  total_questions: number | null;
  end_time: string | null;
  start_time: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  username: string | null;
  public_username: string | null;
  created_at: string;
  updated_at: string;
}

interface DataState {
  quizResults: QuizResult[];
  questionAttempts: QuestionAttempt[];
  marathonSessions: MarathonSession[];
  userProfile: UserProfile | null;
  streakData: any[];
  mockTests: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface DataContextType extends DataState {
  refreshData: () => Promise<void>;
  refreshQuizData: () => Promise<void>;
  refreshPerformanceData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<DataState>({
    quizResults: [],
    questionAttempts: [],
    marathonSessions: [],
    userProfile: null,
    streakData: [],
    mockTests: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });

  // Fetch all data for the user
  const fetchAllData = async () => {
    if (!user?.id) return;

    console.log('🚀 Starting instant data prefetch for user:', user.id);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch all data in parallel for maximum speed
      const [
        quizResultsResponse,
        questionAttemptsResponse,
        marathonSessionsResponse,
        userProfileResponse,
        streakDataResponse,
        mockTestsResponse,
      ] = await Promise.all([
        supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('question_attempts_v2')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('marathon_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        
        supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        
        supabase
          .from('mock_test_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      // Check for errors
      const errors = [
        quizResultsResponse.error,
        questionAttemptsResponse.error,
        marathonSessionsResponse.error,
        userProfileResponse.error,
        streakDataResponse.error,
        mockTestsResponse.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Data fetch errors:', errors);
        throw new Error(`Failed to fetch data: ${errors.map(e => e?.message).join(', ')}`);
      }

      // Update state with all fetched data
      setState(prev => ({
        ...prev,
        quizResults: quizResultsResponse.data || [],
        questionAttempts: questionAttemptsResponse.data || [],
        marathonSessions: marathonSessionsResponse.data || [],
        userProfile: userProfileResponse.data || null,
        streakData: streakDataResponse.data || [],
        mockTests: mockTestsResponse.data || [],
        loading: false,
        lastUpdated: new Date(),
      }));

      // Prefetch query cache for instant component loading
      queryClient.setQueryData(['quizResults', user.id], quizResultsResponse.data);
      queryClient.setQueryData(['questionAttempts', user.id], questionAttemptsResponse.data);
      queryClient.setQueryData(['marathonSessions', user.id], marathonSessionsResponse.data);
      queryClient.setQueryData(['userProfile', user.id], userProfileResponse.data);
      queryClient.setQueryData(['streakData', user.id], streakDataResponse.data);
      queryClient.setQueryData(['mockTests', user.id], mockTestsResponse.data);

      console.log('✅ Instant data prefetch completed successfully');
      console.log('📊 Data loaded:', {
        quizResults: quizResultsResponse.data?.length || 0,
        questionAttempts: questionAttemptsResponse.data?.length || 0,
        marathonSessions: marathonSessionsResponse.data?.length || 0,
        streakData: streakDataResponse.data?.length || 0,
        mockTests: mockTestsResponse.data?.length || 0,
      });

    } catch (error) {
      console.error('❌ Data prefetch failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      }));
    }
  };

  // Refresh specific data types
  const refreshQuizData = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({ ...prev, quizResults: data || [] }));
      queryClient.setQueryData(['quizResults', user.id], data);
      
      console.log('🔄 Quiz data refreshed');
    } catch (error) {
      console.error('Failed to refresh quiz data:', error);
    }
  };

  const refreshPerformanceData = async () => {
    if (!user?.id) return;
    
    try {
      const [questionAttemptsResponse, marathonSessionsResponse] = await Promise.all([
        supabase
          .from('question_attempts_v2')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('marathon_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (questionAttemptsResponse.error) throw questionAttemptsResponse.error;
      if (marathonSessionsResponse.error) throw marathonSessionsResponse.error;

      setState(prev => ({
        ...prev,
        questionAttempts: questionAttemptsResponse.data || [],
        marathonSessions: marathonSessionsResponse.data || [],
      }));

      queryClient.setQueryData(['questionAttempts', user.id], questionAttemptsResponse.data);
      queryClient.setQueryData(['marathonSessions', user.id], marathonSessionsResponse.data);
      
      console.log('🔄 Performance data refreshed');
    } catch (error) {
      console.error('Failed to refresh performance data:', error);
    }
  };

  // Load data when user logs in
  useEffect(() => {
    if (user?.id) {
      fetchAllData();
    } else {
      // Clear data when user logs out
      setState({
        quizResults: [],
        questionAttempts: [],
        marathonSessions: [],
        userProfile: null,
        streakData: [],
        mockTests: [],
        loading: false,
        error: null,
        lastUpdated: null,
      });
      queryClient.clear();
    }
  }, [user?.id, queryClient]);

  // Listen for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const channels = [
      supabase
        .channel('quiz_results_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'quiz_results', filter: `user_id=eq.${user.id}` },
          () => refreshQuizData()
        ),
      
      supabase
        .channel('question_attempts_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'question_attempts_v2', filter: `user_id=eq.${user.id}` },
          () => refreshPerformanceData()
        ),
      
      supabase
        .channel('marathon_sessions_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'marathon_sessions', filter: `user_id=eq.${user.id}` },
          () => refreshPerformanceData()
        ),
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user?.id]);

  const contextValue: DataContextType = {
    ...state,
    refreshData: fetchAllData,
    refreshQuizData,
    refreshPerformanceData,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
