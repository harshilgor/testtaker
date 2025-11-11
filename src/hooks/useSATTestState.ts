
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  content: string;
  passage?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  section: 'reading-writing' | 'math';
  topic: string;
}

type TestSection = 'reading-writing' | 'math';
type TestModule = 1 | 2;

interface TestProgress {
  section: TestSection;
  module: TestModule;
  questionIndex: number;
  timeRemaining: number;
}

export const useSATTestState = (
  initialSection: TestSection = 'reading-writing',
  initialModuleTimeSeconds: number = 32 * 60
) => {
  const [currentProgress, setCurrentProgress] = useState<TestProgress>({
    section: initialSection,
    module: 1,
    questionIndex: 0,
    timeRemaining: initialModuleTimeSeconds
  });
  
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [eliminatedAnswers, setEliminatedAnswers] = useState<{ [key: string]: Set<number> }>({});
  const [eliminateMode, setEliminateMode] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [moduleResults, setModuleResults] = useState<any[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDisplayName, setUserDisplayName] = useState('User');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const loadUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.display_name) {
          setUserDisplayName(profile.display_name);
        }
      }
    };
    loadUserInfo();
  }, []);

  return {
    currentProgress,
    setCurrentProgress,
    selectedAnswers,
    setSelectedAnswers,
    markedForReview,
    setMarkedForReview,
    eliminatedAnswers,
    setEliminatedAnswers,
    eliminateMode,
    setEliminateMode,
    testCompleted,
    setTestCompleted,
    showNavigator,
    setShowNavigator,
    showTransition,
    setShowTransition,
    moduleResults,
    setModuleResults,
    currentQuestions,
    setCurrentQuestions,
    loading,
    setLoading,
    userDisplayName,
    startTime
  };
};
