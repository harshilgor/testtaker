-- Fix RLS policies for quiz_results and question_attempts_v2 tables
-- This migration adds proper RLS policies to allow users to insert their own quiz data

-- Enable RLS on quiz_results table if not already enabled
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_results table
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

-- Enable RLS on question_attempts_v2 table if not already enabled
ALTER TABLE public.question_attempts_v2 ENABLE ROW LEVEL SECURITY;

-- Create policies for question_attempts_v2 table
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

-- Also ensure marathon_sessions and mock_test_results have proper policies
-- Enable RLS on marathon_sessions table if not already enabled
ALTER TABLE public.marathon_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for marathon_sessions table
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

-- Enable RLS on mock_test_results table if not already enabled
ALTER TABLE public.mock_test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for mock_test_results table
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
