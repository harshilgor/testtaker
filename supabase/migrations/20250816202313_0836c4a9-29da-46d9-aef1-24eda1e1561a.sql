-- Fix the cron job syntax by removing nested BEGIN/END blocks
-- Reset monthly leaderboard on the last day of each month at 11:59 PM
SELECT cron.schedule(
    'reset-monthly-leaderboard',
    '59 23 28-31 * *', -- Last few days of month at 11:59 PM
    $$
    SELECT CASE 
        WHEN CURRENT_DATE = (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE 
        THEN public.reset_monthly_leaderboard()
        ELSE NULL
    END;
    $$
);