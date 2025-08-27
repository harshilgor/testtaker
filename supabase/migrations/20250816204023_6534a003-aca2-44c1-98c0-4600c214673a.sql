-- Update periodic functions to calculate points from existing session tables since question_attempts_v2 is empty
CREATE OR REPLACE FUNCTION public.update_weekly_leaderboard_stats(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    user_profile RECORD;
    calculated_total_points INTEGER := 0;
    calculated_quiz_count INTEGER := 0;
    calculated_mock_count INTEGER := 0;
    calculated_marathon_questions INTEGER := 0;
    week_start DATE;
    week_end DATE;
    quiz_points INTEGER := 0;
    mock_points INTEGER := 0;
    marathon_points INTEGER := 0;
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

    -- Calculate points from existing tables for this week
    SELECT 
      COALESCE(SUM(public.calculate_points(correct_answers, 'medium')), 0),
      COUNT(*)
    INTO quiz_points, calculated_quiz_count
    FROM public.quiz_results 
    WHERE user_id = target_user_id 
      AND created_at >= week_start 
      AND created_at < week_end + INTERVAL '1 day';

    SELECT 
      COALESCE(SUM(public.calculate_points(COALESCE(math_score, 0) + COALESCE(english_score, 0), 'medium')), 0),
      COUNT(*)
    INTO mock_points, calculated_mock_count
    FROM public.mock_test_results 
    WHERE user_id = target_user_id 
      AND completed_at >= week_start 
      AND completed_at < week_end + INTERVAL '1 day';

    SELECT 
      COALESCE(SUM(public.calculate_points(COALESCE(correct_answers, 0), COALESCE(difficulty, 'medium'))), 0),
      COALESCE(SUM(COALESCE(total_questions, 0)), 0)
    INTO marathon_points, calculated_marathon_questions
    FROM public.marathon_sessions 
    WHERE user_id = target_user_id 
      AND created_at >= week_start 
      AND created_at < week_end + INTERVAL '1 day';

    calculated_total_points := quiz_points + mock_points + marathon_points;

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
        calculated_quiz_count,
        calculated_mock_count,
        calculated_marathon_questions,
        COALESCE(user_profile.leaderboard_visibility, 'public'),
        week_start,
        week_end,
        now()
    )
    ON CONFLICT (user_id, week_start_date) 
    DO UPDATE SET
        display_name = COALESCE(user_profile.display_name, 'Anonymous'),
        total_points = calculated_total_points,
        quiz_count = calculated_quiz_count,
        mock_test_count = calculated_mock_count,
        marathon_questions_count = calculated_marathon_questions,
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
    calculated_quiz_count INTEGER := 0;
    calculated_mock_count INTEGER := 0;
    calculated_marathon_questions INTEGER := 0;
    month_start DATE;
    month_end DATE;
    quiz_points INTEGER := 0;
    mock_points INTEGER := 0;
    marathon_points INTEGER := 0;
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

    -- Calculate points from existing tables for this month
    SELECT 
      COALESCE(SUM(public.calculate_points(correct_answers, 'medium')), 0),
      COUNT(*)
    INTO quiz_points, calculated_quiz_count
    FROM public.quiz_results 
    WHERE user_id = target_user_id 
      AND created_at >= month_start 
      AND created_at < month_end + INTERVAL '1 day';

    SELECT 
      COALESCE(SUM(public.calculate_points(COALESCE(math_score, 0) + COALESCE(english_score, 0), 'medium')), 0),
      COUNT(*)
    INTO mock_points, calculated_mock_count
    FROM public.mock_test_results 
    WHERE user_id = target_user_id 
      AND completed_at >= month_start 
      AND completed_at < month_end + INTERVAL '1 day';

    SELECT 
      COALESCE(SUM(public.calculate_points(COALESCE(correct_answers, 0), COALESCE(difficulty, 'medium'))), 0),
      COALESCE(SUM(COALESCE(total_questions, 0)), 0)
    INTO marathon_points, calculated_marathon_questions
    FROM public.marathon_sessions 
    WHERE user_id = target_user_id 
      AND created_at >= month_start 
      AND created_at < month_end + INTERVAL '1 day';

    calculated_total_points := quiz_points + mock_points + marathon_points;

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
        calculated_quiz_count,
        calculated_mock_count,
        calculated_marathon_questions,
        COALESCE(user_profile.leaderboard_visibility, 'public'),
        month_start,
        month_end,
        now()
    )
    ON CONFLICT (user_id, month_start_date) 
    DO UPDATE SET
        display_name = COALESCE(user_profile.display_name, 'Anonymous'),
        total_points = calculated_total_points,
        quiz_count = calculated_quiz_count,
        mock_test_count = calculated_mock_count,
        marathon_questions_count = calculated_marathon_questions,
        visibility = COALESCE(user_profile.leaderboard_visibility, 'public'),
        last_updated = now();
END;
$function$;

-- Update all users' periodic stats with real data
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM quiz_results
  LOOP
    PERFORM public.update_periodic_leaderboard_stats(user_record.user_id);
  END LOOP;
  
  FOR user_record IN SELECT DISTINCT user_id FROM marathon_sessions
  LOOP
    PERFORM public.update_periodic_leaderboard_stats(user_record.user_id);
  END LOOP;
  
  FOR user_record IN SELECT DISTINCT user_id FROM mock_test_results
  LOOP
    PERFORM public.update_periodic_leaderboard_stats(user_record.user_id);
  END LOOP;
END $$;