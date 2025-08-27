-- Create periodic leaderboard tables for weekly and monthly tracking
CREATE TABLE IF NOT EXISTS public.weekly_leaderboard_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    display_name TEXT NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 0,
    quiz_count INTEGER NOT NULL DEFAULT 0,
    mock_test_count INTEGER NOT NULL DEFAULT 0,
    marathon_questions_count INTEGER NOT NULL DEFAULT 0,
    visibility leaderboard_visibility NOT NULL DEFAULT 'public',
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, week_start_date)
);

CREATE TABLE IF NOT EXISTS public.monthly_leaderboard_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    display_name TEXT NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 0,
    quiz_count INTEGER NOT NULL DEFAULT 0,
    mock_test_count INTEGER NOT NULL DEFAULT 0,
    marathon_questions_count INTEGER NOT NULL DEFAULT 0,
    visibility leaderboard_visibility NOT NULL DEFAULT 'public',
    month_start_date DATE NOT NULL,
    month_end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, month_start_date)
);

-- Enable RLS on periodic leaderboard tables
ALTER TABLE public.weekly_leaderboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_leaderboard_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weekly leaderboard
CREATE POLICY "Anyone can view public weekly leaderboard entries" 
ON public.weekly_leaderboard_stats 
FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Users can view their own weekly leaderboard stats" 
ON public.weekly_leaderboard_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly leaderboard stats" 
ON public.weekly_leaderboard_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly leaderboard stats" 
ON public.weekly_leaderboard_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for monthly leaderboard
CREATE POLICY "Anyone can view public monthly leaderboard entries" 
ON public.monthly_leaderboard_stats 
FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Users can view their own monthly leaderboard stats" 
ON public.monthly_leaderboard_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly leaderboard stats" 
ON public.monthly_leaderboard_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly leaderboard stats" 
ON public.monthly_leaderboard_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to update weekly leaderboard stats
CREATE OR REPLACE FUNCTION public.update_weekly_leaderboard_stats(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_profile RECORD;
    total_points INTEGER := 0;
    quiz_count INTEGER := 0;
    mock_count INTEGER := 0;
    marathon_questions INTEGER := 0;
    week_start DATE;
    week_end DATE;
BEGIN
    -- Get the current week boundaries (Monday to Sunday)
    week_start := date_trunc('week', CURRENT_DATE);
    week_end := week_start + INTERVAL '6 days';
    
    -- Get user profile info
    SELECT display_name, leaderboard_visibility INTO user_profile
    FROM public.profiles 
    WHERE id = target_user_id;
    
    IF user_profile IS NULL THEN
        RETURN;
    END IF;

    -- Calculate points from question attempts for this week
    SELECT COALESCE(SUM(points_earned), 0) INTO total_points
    FROM public.question_attempts_v2 
    WHERE user_id = target_user_id 
      AND created_at >= week_start 
      AND created_at < week_end + INTERVAL '1 day';

    -- Count activities for this week
    SELECT COUNT(DISTINCT session_id) INTO quiz_count
    FROM public.question_attempts_v2 
    WHERE user_id = target_user_id 
      AND session_type = 'quiz'
      AND created_at >= week_start 
      AND created_at < week_end + INTERVAL '1 day';

    SELECT COUNT(DISTINCT session_id) INTO mock_count
    FROM public.question_attempts_v2 
    WHERE user_id = target_user_id 
      AND session_type = 'mocktest'
      AND created_at >= week_start 
      AND created_at < week_end + INTERVAL '1 day';

    SELECT COUNT(*) INTO marathon_questions
    FROM public.question_attempts_v2 
    WHERE user_id = target_user_id 
      AND session_type = 'marathon'
      AND created_at >= week_start 
      AND created_at < week_end + INTERVAL '1 day';

    -- Insert or update weekly leaderboard stats
    INSERT INTO public.weekly_leaderboard_stats (
        user_id, 
        display_name, 
        total_points, 
        quiz_count, 
        mock_test_count, 
        marathon_questions_count,
        visibility,
        week_start_date,
        week_end_date,
        last_updated
    ) VALUES (
        target_user_id,
        COALESCE(user_profile.display_name, 'Anonymous'),
        total_points,
        quiz_count,
        mock_count,
        marathon_questions,
        COALESCE(user_profile.leaderboard_visibility, 'public'),
        week_start,
        week_end,
        now()
    )
    ON CONFLICT (user_id, week_start_date) 
    DO UPDATE SET
        display_name = COALESCE(user_profile.display_name, 'Anonymous'),
        total_points = total_points,
        quiz_count = quiz_count,
        mock_test_count = mock_count,
        marathon_questions_count = marathon_questions,
        visibility = COALESCE(user_profile.leaderboard_visibility, 'public'),
        last_updated = now();
END;
$$;

-- Function to update monthly leaderboard stats
CREATE OR REPLACE FUNCTION public.update_monthly_leaderboard_stats(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_profile RECORD;
    total_points INTEGER := 0;
    quiz_count INTEGER := 0;
    mock_count INTEGER := 0;
    marathon_questions INTEGER := 0;
    month_start DATE;
    month_end DATE;
BEGIN
    -- Get the current month boundaries
    month_start := date_trunc('month', CURRENT_DATE);
    month_end := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
    
    -- Get user profile info
    SELECT display_name, leaderboard_visibility INTO user_profile
    FROM public.profiles 
    WHERE id = target_user_id;
    
    IF user_profile IS NULL THEN
        RETURN;
    END IF;

    -- Calculate points from question attempts for this month
    SELECT COALESCE(SUM(points_earned), 0) INTO total_points
    FROM public.question_attempts_v2 
    WHERE user_id = target_user_id 
      AND created_at >= month_start 
      AND created_at < month_end + INTERVAL '1 day';

    -- Count activities for this month
    SELECT COUNT(DISTINCT session_id) INTO quiz_count
    FROM public.question_attempts_v2 
    WHERE user_id = target_user_id 
      AND session_type = 'quiz'
      AND created_at >= month_start 
      AND created_at < month_end + INTERVAL '1 day';

    SELECT COUNT(DISTINCT session_id) INTO mock_count
    FROM public.question_attempts_v2 
    WHERE user_id = target_user_id 
      AND session_type = 'mocktest'
      AND created_at >= month_start 
      AND created_at < month_end + INTERVAL '1 day';

    SELECT COUNT(*) INTO marathon_questions
    FROM public.question_attempts_v2 
    WHERE user_id = target_user_id 
      AND session_type = 'marathon'
      AND created_at >= month_start 
      AND created_at < month_end + INTERVAL '1 day';

    -- Insert or update monthly leaderboard stats
    INSERT INTO public.monthly_leaderboard_stats (
        user_id, 
        display_name, 
        total_points, 
        quiz_count, 
        mock_test_count, 
        marathon_questions_count,
        visibility,
        month_start_date,
        month_end_date,
        last_updated
    ) VALUES (
        target_user_id,
        COALESCE(user_profile.display_name, 'Anonymous'),
        total_points,
        quiz_count,
        mock_count,
        marathon_questions,
        COALESCE(user_profile.leaderboard_visibility, 'public'),
        month_start,
        month_end,
        now()
    )
    ON CONFLICT (user_id, month_start_date) 
    DO UPDATE SET
        display_name = COALESCE(user_profile.display_name, 'Anonymous'),
        total_points = total_points,
        quiz_count = quiz_count,
        mock_test_count = mock_count,
        marathon_questions_count = marathon_questions,
        visibility = COALESCE(user_profile.leaderboard_visibility, 'public'),
        last_updated = now();
END;
$$;

-- Function to update periodic leaderboard stats (called from points service)
CREATE OR REPLACE FUNCTION public.update_periodic_leaderboard_stats(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public.update_weekly_leaderboard_stats(target_user_id);
    PERFORM public.update_monthly_leaderboard_stats(target_user_id);
END;
$$;