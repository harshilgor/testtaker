
-- Create a table to track weekly and monthly leaderboard periods
CREATE TABLE public.leaderboard_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index to ensure only one current period per type
CREATE UNIQUE INDEX idx_leaderboard_periods_current ON public.leaderboard_periods (period_type) WHERE is_current = true;

-- Create a table to store weekly and monthly leaderboard stats
CREATE TABLE public.periodic_leaderboard_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_id UUID NOT NULL REFERENCES public.leaderboard_periods(id),
  display_name TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  quiz_count INTEGER NOT NULL DEFAULT 0,
  mock_test_count INTEGER NOT NULL DEFAULT 0,
  marathon_questions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index to prevent duplicate user stats per period
CREATE UNIQUE INDEX idx_periodic_leaderboard_user_period ON public.periodic_leaderboard_stats (user_id, period_id);

-- Add RLS policies
ALTER TABLE public.leaderboard_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periodic_leaderboard_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can view leaderboard periods
CREATE POLICY "Anyone can view leaderboard periods" 
  ON public.leaderboard_periods 
  FOR SELECT 
  USING (true);

-- Anyone can view periodic leaderboard stats
CREATE POLICY "Anyone can view periodic leaderboard stats" 
  ON public.periodic_leaderboard_stats 
  FOR SELECT 
  USING (true);

-- System can insert/update periods (for cron jobs)
CREATE POLICY "System can manage leaderboard periods" 
  ON public.leaderboard_periods 
  FOR ALL 
  USING (true);

-- System can insert/update periodic stats (for cron jobs)
CREATE POLICY "System can manage periodic leaderboard stats" 
  ON public.periodic_leaderboard_stats 
  FOR ALL 
  USING (true);

-- Function to initialize current periods
CREATE OR REPLACE FUNCTION public.initialize_leaderboard_periods()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_start TIMESTAMP WITH TIME ZONE;
  week_end TIMESTAMP WITH TIME ZONE;
  month_start TIMESTAMP WITH TIME ZONE;
  month_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate current week (Sunday to Saturday)
  week_start := date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
  week_end := week_start + INTERVAL '6 days 23 hours 59 minutes 59 seconds';
  
  -- Calculate current month
  month_start := date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
  month_end := (month_start + INTERVAL '1 month') - INTERVAL '1 second';
  
  -- Insert current weekly period if it doesn't exist
  INSERT INTO public.leaderboard_periods (period_type, period_start, period_end, is_current)
  VALUES ('weekly', week_start, week_end, true)
  ON CONFLICT DO NOTHING;
  
  -- Insert current monthly period if it doesn't exist
  INSERT INTO public.leaderboard_periods (period_type, period_start, period_end, is_current)
  VALUES ('monthly', month_start, month_end, true)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Function to update periodic leaderboard stats
CREATE OR REPLACE FUNCTION public.update_periodic_leaderboard_stats(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
  current_week_id UUID;
  current_month_id UUID;
  week_points INTEGER := 0;
  week_quiz_count INTEGER := 0;
  week_mock_count INTEGER := 0;
  week_marathon_questions INTEGER := 0;
  month_points INTEGER := 0;
  month_quiz_count INTEGER := 0;
  month_mock_count INTEGER := 0;
  month_marathon_questions INTEGER := 0;
  week_start TIMESTAMP WITH TIME ZONE;
  month_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user profile info
  SELECT display_name INTO user_profile
  FROM public.profiles 
  WHERE id = target_user_id;
  
  IF user_profile IS NULL THEN
    RETURN;
  END IF;

  -- Get current periods
  SELECT id, period_start INTO current_week_id, week_start
  FROM public.leaderboard_periods 
  WHERE period_type = 'weekly' AND is_current = true;
  
  SELECT id, period_start INTO current_month_id, month_start
  FROM public.leaderboard_periods 
  WHERE period_type = 'monthly' AND is_current = true;
  
  IF current_week_id IS NULL OR current_month_id IS NULL THEN
    RETURN;
  END IF;

  -- Calculate weekly stats
  SELECT 
    COALESCE(SUM(points_earned), 0),
    COUNT(DISTINCT CASE WHEN session_type = 'quiz' THEN session_id END),
    COUNT(DISTINCT CASE WHEN session_type = 'mocktest' THEN session_id END),
    COUNT(CASE WHEN session_type = 'marathon' THEN 1 END)
  INTO week_points, week_quiz_count, week_mock_count, week_marathon_questions
  FROM public.question_attempts_v2 
  WHERE user_id = target_user_id 
    AND created_at >= week_start;

  -- Calculate monthly stats
  SELECT 
    COALESCE(SUM(points_earned), 0),
    COUNT(DISTINCT CASE WHEN session_type = 'quiz' THEN session_id END),
    COUNT(DISTINCT CASE WHEN session_type = 'mocktest' THEN session_id END),
    COUNT(CASE WHEN session_type = 'marathon' THEN 1 END)
  INTO month_points, month_quiz_count, month_mock_count, month_marathon_questions
  FROM public.question_attempts_v2 
  WHERE user_id = target_user_id 
    AND created_at >= month_start;

  -- Insert or update weekly stats
  INSERT INTO public.periodic_leaderboard_stats (
    user_id, period_id, display_name, total_points, 
    quiz_count, mock_test_count, marathon_questions_count
  ) VALUES (
    target_user_id, current_week_id, COALESCE(user_profile.display_name, 'Anonymous'),
    week_points, week_quiz_count, week_mock_count, week_marathon_questions
  )
  ON CONFLICT (user_id, period_id) 
  DO UPDATE SET
    display_name = COALESCE(user_profile.display_name, 'Anonymous'),
    total_points = week_points,
    quiz_count = week_quiz_count,
    mock_test_count = week_mock_count,
    marathon_questions_count = week_marathon_questions,
    updated_at = now();

  -- Insert or update monthly stats
  INSERT INTO public.periodic_leaderboard_stats (
    user_id, period_id, display_name, total_points,
    quiz_count, mock_test_count, marathon_questions_count
  ) VALUES (
    target_user_id, current_month_id, COALESCE(user_profile.display_name, 'Anonymous'),
    month_points, month_quiz_count, month_mock_count, month_marathon_questions
  )
  ON CONFLICT (user_id, period_id) 
  DO UPDATE SET
    display_name = COALESCE(user_profile.display_name, 'Anonymous'),
    total_points = month_points,
    quiz_count = month_quiz_count,
    mock_test_count = month_mock_count,
    marathon_questions_count = month_marathon_questions,
    updated_at = now();
END;
$$;

-- Function to reset weekly leaderboard (called by cron)
CREATE OR REPLACE FUNCTION public.reset_weekly_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_week_start TIMESTAMP WITH TIME ZONE;
  new_week_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Mark current weekly period as not current
  UPDATE public.leaderboard_periods 
  SET is_current = false 
  WHERE period_type = 'weekly' AND is_current = true;
  
  -- Calculate new week period (next Sunday to Saturday)
  new_week_start := date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
  new_week_end := new_week_start + INTERVAL '6 days 23 hours 59 minutes 59 seconds';
  
  -- Create new weekly period
  INSERT INTO public.leaderboard_periods (period_type, period_start, period_end, is_current)
  VALUES ('weekly', new_week_start, new_week_end, true);
  
  -- Initialize stats for all users in the new period
  INSERT INTO public.periodic_leaderboard_stats (user_id, period_id, display_name, total_points, quiz_count, mock_test_count, marathon_questions_count)
  SELECT 
    p.id,
    (SELECT id FROM public.leaderboard_periods WHERE period_type = 'weekly' AND is_current = true),
    COALESCE(p.display_name, 'Anonymous'),
    0, 0, 0, 0
  FROM public.profiles p
  ON CONFLICT (user_id, period_id) DO NOTHING;
END;
$$;

-- Function to reset monthly leaderboard (called by cron)
CREATE OR REPLACE FUNCTION public.reset_monthly_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_month_start TIMESTAMP WITH TIME ZONE;
  new_month_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Mark current monthly period as not current
  UPDATE public.leaderboard_periods 
  SET is_current = false 
  WHERE period_type = 'monthly' AND is_current = true;
  
  -- Calculate new month period
  new_month_start := date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
  new_month_end := (new_month_start + INTERVAL '1 month') - INTERVAL '1 second';
  
  -- Create new monthly period
  INSERT INTO public.leaderboard_periods (period_type, period_start, period_end, is_current)
  VALUES ('monthly', new_month_start, new_month_end, true);
  
  -- Initialize stats for all users in the new period
  INSERT INTO public.periodic_leaderboard_stats (user_id, period_id, display_name, total_points, quiz_count, mock_test_count, marathon_questions_count)
  SELECT 
    p.id,
    (SELECT id FROM public.leaderboard_periods WHERE period_type = 'monthly' AND is_current = true),
    COALESCE(p.display_name, 'Anonymous'),
    0, 0, 0, 0
  FROM public.profiles p
  ON CONFLICT (user_id, period_id) DO NOTHING;
END;
$$;

-- Initialize current periods
SELECT public.initialize_leaderboard_periods();

-- Set up cron jobs for automatic resets
-- Reset weekly leaderboard every Sunday at 11:59 PM UTC
SELECT cron.schedule(
  'reset-weekly-leaderboard',
  '59 23 * * 0',
  'SELECT public.reset_weekly_leaderboard();'
);

-- Reset monthly leaderboard on the last day of each month at 11:59 PM UTC
SELECT cron.schedule(
  'reset-monthly-leaderboard', 
  '59 23 28-31 * *',
  'SELECT CASE WHEN EXTRACT(DAY FROM (CURRENT_DATE + INTERVAL ''1 day'')) = 1 THEN public.reset_monthly_leaderboard() END;'
);

-- Update trigger to maintain periodic stats when question attempts are added
CREATE OR REPLACE FUNCTION public.trigger_update_periodic_leaderboard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.update_periodic_leaderboard_stats(NEW.user_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger on question_attempts_v2
DROP TRIGGER IF EXISTS trigger_update_periodic_leaderboard_on_attempt ON public.question_attempts_v2;
CREATE TRIGGER trigger_update_periodic_leaderboard_on_attempt
  AFTER INSERT ON public.question_attempts_v2
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_periodic_leaderboard();
