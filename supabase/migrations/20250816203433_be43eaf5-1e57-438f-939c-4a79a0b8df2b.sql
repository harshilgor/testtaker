-- Fix the periodic leaderboard functions to avoid column ambiguity
CREATE OR REPLACE FUNCTION public.update_weekly_leaderboard_stats(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    user_profile RECORD;
    calculated_total_points INTEGER := 0;
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
    SELECT COALESCE(SUM(points_earned), 0) INTO calculated_total_points
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
        calculated_total_points,
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
        total_points = calculated_total_points,
        quiz_count = quiz_count,
        mock_test_count = mock_count,
        marathon_questions_count = marathon_questions,
        visibility = COALESCE(user_profile.leaderboard_visibility, 'public'),
        last_updated = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_monthly_leaderboard_stats(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    user_profile RECORD;
    calculated_total_points INTEGER := 0;
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
    SELECT COALESCE(SUM(points_earned), 0) INTO calculated_total_points
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
        calculated_total_points,
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
        total_points = calculated_total_points,
        quiz_count = quiz_count,
        mock_test_count = mock_count,
        marathon_questions_count = marathon_questions,
        visibility = COALESCE(user_profile.leaderboard_visibility, 'public'),
        last_updated = now();
END;
$function$;

-- Now create the trigger function and triggers
CREATE OR REPLACE FUNCTION public.trigger_update_all_leaderboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update regular leaderboard stats
    PERFORM public.update_leaderboard_stats_v2(NEW.user_id);
    -- Update periodic (weekly/monthly) stats
    PERFORM public.update_periodic_leaderboard_stats(NEW.user_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Create triggers for all activity tables
CREATE TRIGGER trigger_leaderboard_on_quiz
  AFTER INSERT OR UPDATE ON quiz_results
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_all_leaderboard_stats();

CREATE TRIGGER trigger_leaderboard_on_marathon
  AFTER INSERT OR UPDATE ON marathon_sessions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_all_leaderboard_stats();

CREATE TRIGGER trigger_leaderboard_on_mock
  AFTER INSERT OR UPDATE ON mock_test_results
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_all_leaderboard_stats();