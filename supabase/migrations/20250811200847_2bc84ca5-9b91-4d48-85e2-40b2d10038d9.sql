
-- Fix critical security issue: Restrict question_usage table access to users' own data
-- This prevents privacy violations where users could see other users' study patterns

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.question_usage;
DROP POLICY IF EXISTS "allow all inserts" ON public.question_usage;

-- Create secure policies that only allow users to see their own data
CREATE POLICY "Users can view their own question usage" 
  ON public.question_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question usage" 
  ON public.question_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update question_usage table to make user_id non-nullable for security
-- This ensures all records have a user_id for proper RLS enforcement
ALTER TABLE public.question_usage 
  ALTER COLUMN user_id SET NOT NULL;

-- Add index for better performance on user_id queries
CREATE INDEX IF NOT EXISTS idx_question_usage_user_id 
  ON public.question_usage(user_id);
