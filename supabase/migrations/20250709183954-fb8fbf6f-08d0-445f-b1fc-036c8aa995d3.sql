
-- Create a table to track user streaks
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Create policies for user streaks
CREATE POLICY "Users can view their own streaks" 
  ON public.user_streaks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" 
  ON public.user_streaks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
  ON public.user_streaks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a function to update user streaks
CREATE OR REPLACE FUNCTION public.update_user_streak(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  last_activity DATE;
  current_streak_count INTEGER := 0;
  longest_streak_count INTEGER := 0;
  has_activity_today BOOLEAN := false;
BEGIN
  -- Check if user has any activity today (quiz, marathon, or mock test)
  SELECT EXISTS (
    SELECT 1 FROM public.quiz_results 
    WHERE user_id = target_user_id AND DATE(created_at) = today_date
    UNION ALL
    SELECT 1 FROM public.marathon_sessions 
    WHERE user_id = target_user_id AND DATE(created_at) = today_date
    UNION ALL
    SELECT 1 FROM public.mock_test_results 
    WHERE user_id = target_user_id AND DATE(completed_at) = today_date
  ) INTO has_activity_today;
  
  -- Only proceed if user has activity today
  IF NOT has_activity_today THEN
    RETURN;
  END IF;
  
  -- Get current streak data
  SELECT current_streak, longest_streak, last_activity_date 
  INTO current_streak_count, longest_streak_count, last_activity
  FROM public.user_streaks 
  WHERE user_id = target_user_id;
  
  -- If no record exists, create initial record
  IF NOT FOUND THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (target_user_id, 1, 1, today_date);
    RETURN;
  END IF;
  
  -- If already updated today, don't update again
  IF last_activity = today_date THEN
    RETURN;
  END IF;
  
  -- Calculate new streak
  IF last_activity = today_date - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    current_streak_count := current_streak_count + 1;
  ELSIF last_activity < today_date - INTERVAL '1 day' THEN
    -- Missed days, reset streak
    current_streak_count := 1;
  END IF;
  
  -- Update longest streak if current is higher
  IF current_streak_count > longest_streak_count THEN
    longest_streak_count := current_streak_count;
  END IF;
  
  -- Update the record
  UPDATE public.user_streaks 
  SET 
    current_streak = current_streak_count,
    longest_streak = longest_streak_count,
    last_activity_date = today_date,
    updated_at = now()
  WHERE user_id = target_user_id;
END;
$$;

-- Create a trigger function to automatically update streaks
CREATE OR REPLACE FUNCTION public.trigger_streak_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.update_user_streak(NEW.user_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for all activity tables
CREATE TRIGGER update_streak_on_quiz_completion
  AFTER INSERT ON public.quiz_results
  FOR EACH ROW EXECUTE FUNCTION public.trigger_streak_update();

CREATE TRIGGER update_streak_on_marathon_completion
  AFTER INSERT ON public.marathon_sessions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_streak_update();

CREATE TRIGGER update_streak_on_mock_test_completion
  AFTER INSERT ON public.mock_test_results
  FOR EACH ROW EXECUTE FUNCTION public.trigger_streak_update();
