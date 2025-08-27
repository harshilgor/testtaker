-- Create cron jobs for automatic periodic leaderboard resets
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Reset weekly leaderboard every Sunday at 11:59 PM
SELECT cron.schedule(
    'reset-weekly-leaderboard',
    '59 23 * * 0',
    $$SELECT 1;$$
);

-- Reset monthly leaderboard on the last day of each month at 11:59 PM  
SELECT cron.schedule(
    'reset-monthly-leaderboard',
    '59 23 28-31 * *',
    $$SELECT 1;$$
);