-- Fix the ambiguous column reference in trigger functions
-- Run this in your Supabase SQL Editor to fix the 'total_points' ambiguous column error

-- First, let's check what the current trigger function looks like and fix it
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

-- Now let's fix the update_leaderboard_stats_v2 function to avoid ambiguous column references
CREATE OR REPLACE FUNCTION public.update_leaderboard_stats_v2(target_user_id UUID)
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
BEGIN
  -- Get user profile
  SELECT display_name, leaderboard_visibility 
  INTO user_profile 
  FROM profiles 
  WHERE id = target_user_id;

  -- Calculate total points from quiz results (be explicit about table names)
  SELECT COALESCE(SUM(
    CASE 
      WHEN qr.correct_answers IS NOT NULL THEN 
        (qr.correct_answers * 10) -- 10 points per correct answer
      ELSE 0 
    END
  ), 0)
  INTO calculated_total_points
  FROM quiz_results qr
  WHERE qr.user_id = target_user_id;

  -- Count quiz sessions
  SELECT COUNT(*) INTO quiz_count
  FROM quiz_results qr
  WHERE qr.user_id = target_user_id;

  -- Add points from marathon sessions (be explicit about table names)
  SELECT COALESCE(SUM(
    CASE 
      WHEN ms.correct_answers IS NOT NULL THEN 
        (ms.correct_answers * 5) -- 5 points per correct marathon answer
      ELSE 0 
    END
  ), 0)
  INTO marathon_questions
  FROM marathon_sessions ms
  WHERE ms.user_id = target_user_id;

  -- Count mock test sessions (be explicit about table names)
  SELECT COUNT(*) INTO mock_count
  FROM mock_test_results mtr
  WHERE mtr.user_id = target_user_id;

  -- Add mock test points (be explicit about table names)
  SELECT COALESCE(SUM(
    CASE 
      WHEN mtr.total_score IS NOT NULL THEN 
        (mtr.total_score / 10) -- Convert SAT score to points
      ELSE 0 
    END
  ), 0)
  INTO calculated_total_points
  FROM mock_test_results mtr
  WHERE mtr.user_id = target_user_id;

  -- Update or insert leaderboard stats
  INSERT INTO leaderboard_stats_v2 (
    user_id, 
    display_name, 
    total_points, 
    quiz_count, 
    mock_test_count, 
    marathon_questions_count,
    visibility,
    last_updated
  ) VALUES (
    target_user_id,
    COALESCE(user_profile.display_name, 'Anonymous'),
    calculated_total_points,
    quiz_count,
    mock_count,
    marathon_questions,
    COALESCE(user_profile.leaderboard_visibility, 'public'),
    now()
  )
  ON CONFLICT (user_id) 
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

-- Also fix the update_periodic_leaderboard_stats function
CREATE OR REPLACE FUNCTION public.update_periodic_leaderboard_stats(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_profile RECORD;
  week_start DATE := date_trunc('week', CURRENT_DATE)::date;
  week_end DATE := week_start + INTERVAL '6 days';
  month_start DATE := date_trunc('month', CURRENT_DATE)::date;
  month_end DATE := (month_start + INTERVAL '1 month - 1 day')::date;
  calculated_total_points INTEGER := 0;
  quiz_count INTEGER := 0;
  mock_count INTEGER := 0;
  marathon_questions INTEGER := 0;
BEGIN
  -- Get user profile
  SELECT display_name, leaderboard_visibility 
  INTO user_profile 
  FROM profiles 
  WHERE id = target_user_id;

  -- Calculate weekly stats (be explicit about table names)
  SELECT COALESCE(SUM(
    CASE 
      WHEN qr.correct_answers IS NOT NULL THEN 
        (qr.correct_answers * 10)
      ELSE 0 
    END
  ), 0)
  INTO calculated_total_points
  FROM quiz_results qr
  WHERE qr.user_id = target_user_id 
    AND qr.created_at >= week_start 
    AND qr.created_at < week_end + INTERVAL '1 day';

  SELECT COUNT(*) INTO quiz_count
  FROM quiz_results qr
  WHERE qr.user_id = target_user_id 
    AND qr.created_at >= week_start 
    AND qr.created_at < week_end + INTERVAL '1 day';

  SELECT COALESCE(SUM(
    CASE 
      WHEN ms.correct_answers IS NOT NULL THEN 
        (ms.correct_answers * 5)
      ELSE 0 
    END
  ), 0)
  INTO marathon_questions
  FROM marathon_sessions ms
  WHERE ms.user_id = target_user_id 
    AND ms.created_at >= week_start 
    AND ms.created_at < week_end + INTERVAL '1 day';

  SELECT COUNT(*) INTO mock_count
  FROM mock_test_results mtr
  WHERE mtr.user_id = target_user_id 
    AND mtr.completed_at >= week_start 
    AND mtr.completed_at < week_end + INTERVAL '1 day';

  -- Add mock test points for the week
  SELECT COALESCE(SUM(
    CASE 
      WHEN mtr.total_score IS NOT NULL THEN 
        (mtr.total_score / 10)
      ELSE 0 
    END
  ), 0)
  INTO calculated_total_points
  FROM mock_test_results mtr
  WHERE mtr.user_id = target_user_id 
    AND mtr.completed_at >= week_start 
    AND mtr.completed_at < week_end + INTERVAL '1 day';

  -- Insert or update weekly leaderboard stats
  INSERT INTO weekly_leaderboard_stats (
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

  -- Reset for monthly calculations
  calculated_total_points := 0;
  quiz_count := 0;
  mock_count := 0;
  marathon_questions := 0;

  -- Calculate monthly stats (be explicit about table names)
  SELECT COALESCE(SUM(
    CASE 
      WHEN qr.correct_answers IS NOT NULL THEN 
        (qr.correct_answers * 10)
      ELSE 0 
    END
  ), 0)
  INTO calculated_total_points
  FROM quiz_results qr
  WHERE qr.user_id = target_user_id 
    AND qr.created_at >= month_start 
    AND qr.created_at < month_end + INTERVAL '1 day';

  SELECT COUNT(*) INTO quiz_count
  FROM quiz_results qr
  WHERE qr.user_id = target_user_id 
    AND qr.created_at >= month_start 
    AND qr.created_at < month_end + INTERVAL '1 day';

  SELECT COALESCE(SUM(
    CASE 
      WHEN ms.correct_answers IS NOT NULL THEN 
        (ms.correct_answers * 5)
      ELSE 0 
    END
  ), 0)
  INTO marathon_questions
  FROM marathon_sessions ms
  WHERE ms.user_id = target_user_id 
    AND ms.created_at >= month_start 
    AND ms.created_at < month_end + INTERVAL '1 day';

  SELECT COUNT(*) INTO mock_count
  FROM mock_test_results mtr
  WHERE mtr.user_id = target_user_id 
    AND mtr.completed_at >= month_start 
    AND mtr.completed_at < month_end + INTERVAL '1 day';

  -- Add mock test points for the month
  SELECT COALESCE(SUM(
    CASE 
      WHEN mtr.total_score IS NOT NULL THEN 
        (mtr.total_score / 10)
      ELSE 0 
    END
  ), 0)
  INTO calculated_total_points
  FROM mock_test_results mtr
  WHERE mtr.user_id = target_user_id 
    AND mtr.completed_at >= month_start 
    AND mtr.completed_at < month_end + INTERVAL '1 day';

  -- Insert or update monthly leaderboard stats
  INSERT INTO monthly_leaderboard_stats (
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
