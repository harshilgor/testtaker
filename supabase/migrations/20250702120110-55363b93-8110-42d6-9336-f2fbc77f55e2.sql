
-- Create a table to track daily user activity for streak calculation
CREATE TABLE public.user_daily_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT NOT NULL DEFAULT 'login', -- 'login', 'quiz', 'marathon', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS
ALTER TABLE public.user_daily_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activity" 
  ON public.user_daily_activity 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" 
  ON public.user_daily_activity 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity" 
  ON public.user_daily_activity 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a function to calculate current streak for a user
CREATE OR REPLACE FUNCTION public.calculate_user_streak(target_user_id UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER, weekly_activity BOOLEAN[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_streak_count INTEGER := 0;
  longest_streak_count INTEGER := 0;
  temp_streak INTEGER := 0;
  activity_date DATE;
  last_date DATE;
  week_activity BOOLEAN[] := ARRAY[false, false, false, false, false, false, false];
  week_start DATE;
  day_of_week INTEGER;
BEGIN
  -- Calculate current streak (consecutive days from today backwards)
  FOR activity_date IN 
    SELECT DISTINCT activity_date 
    FROM public.user_daily_activity 
    WHERE user_id = target_user_id 
    ORDER BY activity_date DESC
  LOOP
    IF last_date IS NULL THEN
      -- First iteration
      IF activity_date = CURRENT_DATE OR activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
        current_streak_count := 1;
        last_date := activity_date;
      ELSE
        -- No recent activity, streak is 0
        EXIT;
      END IF;
    ELSE
      -- Check if this date is consecutive to the last date
      IF activity_date = last_date - INTERVAL '1 day' THEN
        current_streak_count := current_streak_count + 1;
        last_date := activity_date;
      ELSE
        -- Gap found, stop counting current streak
        EXIT;
      END IF;
    END IF;
  END LOOP;

  -- Calculate longest streak
  temp_streak := 0;
  last_date := NULL;
  
  FOR activity_date IN 
    SELECT DISTINCT activity_date 
    FROM public.user_daily_activity 
    WHERE user_id = target_user_id 
    ORDER BY activity_date ASC
  LOOP
    IF last_date IS NULL THEN
      temp_streak := 1;
      last_date := activity_date;
    ELSE
      IF activity_date = last_date + INTERVAL '1 day' THEN
        temp_streak := temp_streak + 1;
        last_date := activity_date;
      ELSE
        -- Gap found, reset temp streak
        IF temp_streak > longest_streak_count THEN
          longest_streak_count := temp_streak;
        END IF;
        temp_streak := 1;
        last_date := activity_date;
      END IF;
    END IF;
  END LOOP;
  
  -- Check final streak
  IF temp_streak > longest_streak_count THEN
    longest_streak_count := temp_streak;
  END IF;

  -- Calculate this week's activity (Monday = 1, Sunday = 7)
  week_start := CURRENT_DATE - INTERVAL '1 day' * (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
  
  FOR i IN 0..6 LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.user_daily_activity 
      WHERE user_id = target_user_id 
      AND activity_date = week_start + INTERVAL '1 day' * i
    ) INTO week_activity[i + 1];
  END LOOP;

  RETURN QUERY SELECT current_streak_count, longest_streak_count, week_activity;
END;
$$;

-- Create function to record user activity
CREATE OR REPLACE FUNCTION public.record_user_activity(activity_type TEXT DEFAULT 'login')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_daily_activity (user_id, activity_date, activity_type)
  VALUES (auth.uid(), CURRENT_DATE, activity_type)
  ON CONFLICT (user_id, activity_date) 
  DO UPDATE SET 
    activity_type = EXCLUDED.activity_type,
    created_at = now();
END;
$$;
