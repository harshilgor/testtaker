-- Fix missing database tables and create all required tables
-- Run this in your Supabase SQL Editor to fix the 404 and missing table errors

-- 1. Create the question_attempts_v2 table (this is causing the 404 error)
CREATE TABLE IF NOT EXISTS public.question_attempts_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    session_id TEXT,
    session_type TEXT DEFAULT 'quiz',
    subject TEXT,
    topic TEXT,
    difficulty TEXT,
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create the quiz_results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topics TEXT[] DEFAULT '{}',
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    time_taken INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create the leaderboard_stats_v2 table (this is missing and causing the error)
CREATE TABLE IF NOT EXISTS public.leaderboard_stats_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 0,
    quiz_count INTEGER NOT NULL DEFAULT 0,
    mock_test_count INTEGER NOT NULL DEFAULT 0,
    marathon_questions_count INTEGER NOT NULL DEFAULT 0,
    visibility TEXT DEFAULT 'public',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- 4. Create the marathon_sessions table
CREATE TABLE IF NOT EXISTS public.marathon_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    incorrect_answers INTEGER NOT NULL DEFAULT 0,
    show_answer_used INTEGER NOT NULL DEFAULT 0,
    time_spent INTEGER NOT NULL DEFAULT 0,
    points_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create the mock_test_results table
CREATE TABLE IF NOT EXISTS public.mock_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    math_score INTEGER,
    english_score INTEGER,
    total_score INTEGER,
    time_taken INTEGER,
    test_type TEXT DEFAULT 'full_sat',
    detailed_results JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    leaderboard_visibility TEXT DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Enable Row Level Security on all tables
ALTER TABLE public.question_attempts_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_stats_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marathon_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for question_attempts_v2
DROP POLICY IF EXISTS "Users can view their own question attempts" ON public.question_attempts_v2;
DROP POLICY IF EXISTS "Users can insert their own question attempts" ON public.question_attempts_v2;
DROP POLICY IF EXISTS "Users can update their own question attempts" ON public.question_attempts_v2;

CREATE POLICY "Users can view their own question attempts" 
  ON public.question_attempts_v2 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question attempts" 
  ON public.question_attempts_v2 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question attempts" 
  ON public.question_attempts_v2 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 9. Create RLS policies for quiz_results
DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can insert their own quiz results" ON public.quiz_results;
DROP POLICY IF EXISTS "Users can update their own quiz results" ON public.quiz_results;

CREATE POLICY "Users can view their own quiz results" 
  ON public.quiz_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results" 
  ON public.quiz_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz results" 
  ON public.quiz_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 10. Create RLS policies for leaderboard_stats_v2
DROP POLICY IF EXISTS "Users can view their own leaderboard stats" ON public.leaderboard_stats_v2;
DROP POLICY IF EXISTS "Users can insert their own leaderboard stats" ON public.leaderboard_stats_v2;
DROP POLICY IF EXISTS "Users can update their own leaderboard stats" ON public.leaderboard_stats_v2;

CREATE POLICY "Users can view their own leaderboard stats" 
  ON public.leaderboard_stats_v2 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leaderboard stats" 
  ON public.leaderboard_stats_v2 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard stats" 
  ON public.leaderboard_stats_v2 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 11. Create RLS policies for marathon_sessions
DROP POLICY IF EXISTS "Users can view their own marathon sessions" ON public.marathon_sessions;
DROP POLICY IF EXISTS "Users can insert their own marathon sessions" ON public.marathon_sessions;
DROP POLICY IF EXISTS "Users can update their own marathon sessions" ON public.marathon_sessions;

CREATE POLICY "Users can view their own marathon sessions" 
  ON public.marathon_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marathon sessions" 
  ON public.marathon_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marathon sessions" 
  ON public.marathon_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 12. Create RLS policies for mock_test_results
DROP POLICY IF EXISTS "Users can view their own mock test results" ON public.mock_test_results;
DROP POLICY IF EXISTS "Users can insert their own mock test results" ON public.mock_test_results;
DROP POLICY IF EXISTS "Users can update their own mock test results" ON public.mock_test_results;

CREATE POLICY "Users can view their own mock test results" 
  ON public.mock_test_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mock test results" 
  ON public.mock_test_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mock test results" 
  ON public.mock_test_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 13. Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 14. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_question_attempts_v2_user_id ON public.question_attempts_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_v2_created_at ON public.question_attempts_v2(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON public.quiz_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_stats_v2_total_points ON public.leaderboard_stats_v2(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_marathon_sessions_user_id ON public.marathon_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_test_results_user_id ON public.mock_test_results(user_id);

-- 15. Create a simple trigger function that doesn't reference missing tables
CREATE OR REPLACE FUNCTION public.trigger_update_all_leaderboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- For now, just return NEW to allow inserts to succeed
  -- We'll implement the full leaderboard logic later
  RETURN NEW;
END;
$function$;

-- 16. Create triggers
DROP TRIGGER IF EXISTS trigger_leaderboard_on_quiz ON public.quiz_results;
DROP TRIGGER IF EXISTS trigger_leaderboard_on_marathon ON public.marathon_sessions;
DROP TRIGGER IF EXISTS trigger_leaderboard_on_mock ON public.mock_test_results;

CREATE TRIGGER trigger_leaderboard_on_quiz
  AFTER INSERT OR UPDATE ON public.quiz_results
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_all_leaderboard_stats();

CREATE TRIGGER trigger_leaderboard_on_marathon
  AFTER INSERT OR UPDATE ON public.marathon_sessions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_all_leaderboard_stats();

CREATE TRIGGER trigger_leaderboard_on_mock
  AFTER INSERT OR UPDATE ON public.mock_test_results
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_all_leaderboard_stats();
63wg