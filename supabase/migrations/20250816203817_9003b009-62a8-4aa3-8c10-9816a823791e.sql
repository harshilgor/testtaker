-- Initialize weekly and monthly stats for all users and update with real data
INSERT INTO weekly_leaderboard_stats (user_id, display_name, total_points, quiz_count, mock_test_count, marathon_questions_count, visibility, week_start_date, week_end_date)
SELECT 
  p.id as user_id,
  p.display_name,
  0 as total_points,
  0 as quiz_count,
  0 as mock_test_count, 
  0 as marathon_questions_count,
  COALESCE(p.leaderboard_visibility, 'public') as visibility,
  date_trunc('week', CURRENT_DATE)::date as week_start_date,
  (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date as week_end_date
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM weekly_leaderboard_stats w 
  WHERE w.user_id = p.id 
  AND w.week_start_date = date_trunc('week', CURRENT_DATE)::date
);

INSERT INTO monthly_leaderboard_stats (user_id, display_name, total_points, quiz_count, mock_test_count, marathon_questions_count, visibility, month_start_date, month_end_date)
SELECT 
  p.id as user_id,
  p.display_name,
  0 as total_points,
  0 as quiz_count,
  0 as mock_test_count,
  0 as marathon_questions_count,
  COALESCE(p.leaderboard_visibility, 'public') as visibility,
  date_trunc('month', CURRENT_DATE)::date as month_start_date,
  (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date as month_end_date
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM monthly_leaderboard_stats m 
  WHERE m.user_id = p.id 
  AND m.month_start_date = date_trunc('month', CURRENT_DATE)::date
);

-- Now update the stats with real data for all users with activity
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