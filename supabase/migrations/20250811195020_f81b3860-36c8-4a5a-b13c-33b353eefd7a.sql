-- Fix security issues with function search paths and enhance profiles table security

-- Update existing functions to use proper search_path for security
-- (Only updating functions that actually exist)
ALTER FUNCTION public.update_leaderboard_stats() SET search_path = 'public';
ALTER FUNCTION public.trigger_update_leaderboard_stats() SET search_path = 'public';
ALTER FUNCTION public.update_user_streak(uuid) SET search_path = 'public';
ALTER FUNCTION public.trigger_streak_update() SET search_path = 'public';
ALTER FUNCTION public.refresh_all_leaderboard_stats() SET search_path = 'public';
ALTER FUNCTION public.calculate_points(integer, text) SET search_path = 'public';
ALTER FUNCTION public.mark_question_used_in_session(text, text, text, integer) SET search_path = 'public';
ALTER FUNCTION public.update_leaderboard_stats(uuid) SET search_path = 'public';
ALTER FUNCTION public.calculate_user_total_points(uuid) SET search_path = 'public';
ALTER FUNCTION public.update_leaderboard_stats_v2(uuid) SET search_path = 'public';
ALTER FUNCTION public.trigger_update_leaderboard_on_attempt() SET search_path = 'public';
ALTER FUNCTION public.get_random_questions(text, text, text, text, integer, bigint[]) SET search_path = 'public';
ALTER FUNCTION public.import_questions_batch(jsonb) SET search_path = 'public';
ALTER FUNCTION public.get_unused_questions_for_session(text, text, text, text, integer) SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';

-- Enhance profiles table security with explicit policies
-- Add additional security policy for profiles table to prevent any potential data leakage
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Ensure no anonymous access to profiles table
CREATE POLICY "Deny anonymous access to profiles" 
  ON public.profiles 
  FOR ALL
  TO anon
  USING (false);

-- Add policy to restrict profile creation to authenticated users only
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update the update policy to be more explicit
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add a policy to prevent deletion of profiles (data retention)
CREATE POLICY "Prevent profile deletion" 
  ON public.profiles 
  FOR DELETE 
  TO authenticated
  USING (false);