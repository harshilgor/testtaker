-- Phase 1: Critical Data Exposure Fix - Anonymize Leaderboard Data
-- Add public_username field to profiles for leaderboard display
ALTER TABLE public.profiles 
ADD COLUMN public_username text UNIQUE;

-- Create function to generate anonymous usernames
CREATE OR REPLACE FUNCTION public.generate_public_username()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  random_suffix INTEGER;
BEGIN
  -- Generate a random number for the username
  random_suffix := floor(random() * 9999) + 1;
  
  -- Set public username as Player + random number
  NEW.public_username := 'Player' || random_suffix;
  
  -- Ensure uniqueness by checking if it already exists
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE public_username = NEW.public_username) LOOP
    random_suffix := floor(random() * 9999) + 1;
    NEW.public_username := 'Player' || random_suffix;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate public usernames for new users
CREATE TRIGGER generate_public_username_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.public_username IS NULL)
  EXECUTE FUNCTION public.generate_public_username();

-- Update existing users to have public usernames
UPDATE public.profiles 
SET public_username = 'Player' || (ROW_NUMBER() OVER (ORDER BY created_at))
WHERE public_username IS NULL;

-- Phase 2: Admin Access Control - Create admin roles system
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create security events logging table
CREATE TABLE public.security_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address inet,
    user_agent text,
    details jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Only admins can view security events"
ON public.security_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert security events
CREATE POLICY "System can insert security events"
ON public.security_events
FOR INSERT
WITH CHECK (true);

-- Phase 3: Secure Question Delivery - Create secure question functions
-- Function to get questions without answers (for quiz display)
CREATE OR REPLACE FUNCTION public.get_secure_questions_for_quiz(
  p_section text DEFAULT NULL,
  p_difficulty text DEFAULT NULL,
  p_skill text DEFAULT NULL,
  p_domain text DEFAULT NULL,
  p_limit integer DEFAULT 10,
  p_exclude_ids bigint[] DEFAULT ARRAY[]::bigint[]
)
RETURNS TABLE(
  id bigint,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  section text,
  skill text,
  difficulty text,
  domain text,
  test_name text,
  question_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only return question data without correct answers and explanations
  RETURN QUERY
  SELECT 
    qb.id,
    qb.question_text,
    qb.option_a,
    qb.option_b,
    qb.option_c,
    qb.option_d,
    qb.section,
    qb.skill,
    qb.difficulty,
    qb.domain,
    qb.test as test_name,
    COALESCE(qb.assessment, 'multiple_choice') as question_type
  FROM public.question_bank qb
  WHERE (p_section IS NULL OR qb.section = p_section)
    AND (p_difficulty IS NULL OR qb.difficulty = p_difficulty)
    AND (p_skill IS NULL OR qb.skill = p_skill)
    AND (p_domain IS NULL OR qb.domain = p_domain)
    AND qb.id != ALL(p_exclude_ids)
    AND qb.question_text IS NOT NULL
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$;

-- Update leaderboard RLS policies to use public_username instead of display_name
DROP POLICY IF EXISTS "Anyone can view public leaderboard entries" ON public.leaderboard_stats;
CREATE POLICY "Anyone can view public leaderboard entries"
ON public.leaderboard_stats
FOR SELECT
TO authenticated
USING (visibility = 'public'::leaderboard_visibility);

-- Update leaderboard stats function to use public_username
CREATE OR REPLACE FUNCTION public.update_leaderboard_stats_secure(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_profile RECORD;
  total_points INTEGER := 0;
  quiz_count INTEGER := 0;
  mock_count INTEGER := 0;
  marathon_questions INTEGER := 0;
BEGIN
  -- Get user profile info with public_username
  SELECT public_username, leaderboard_visibility INTO user_profile
  FROM public.profiles 
  WHERE id = target_user_id;
  
  IF user_profile IS NULL THEN
    RETURN;
  END IF;

  -- Calculate total points from question attempts
  SELECT public.calculate_user_total_points(target_user_id) INTO total_points;

  -- Count activities
  SELECT COUNT(DISTINCT session_id) INTO quiz_count
  FROM public.question_attempts_v2 
  WHERE user_id = target_user_id AND session_type = 'quiz';

  SELECT COUNT(DISTINCT session_id) INTO mock_count
  FROM public.question_attempts_v2 
  WHERE user_id = target_user_id AND session_type = 'mocktest';

  SELECT COUNT(*) INTO marathon_questions
  FROM public.question_attempts_v2 
  WHERE user_id = target_user_id AND session_type = 'marathon';

  -- Insert or update leaderboard stats with public_username
  INSERT INTO public.leaderboard_stats (
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
    COALESCE(user_profile.public_username, 'Anonymous'),
    total_points,
    quiz_count,
    mock_count,
    marathon_questions,
    COALESCE(user_profile.leaderboard_visibility, 'public'),
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    display_name = COALESCE(user_profile.public_username, 'Anonymous'),
    total_points = total_points,
    quiz_count = quiz_count,
    mock_test_count = mock_count,
    marathon_questions_count = marathon_questions,
    visibility = COALESCE(user_profile.leaderboard_visibility, 'public'),
    last_updated = now();
END;
$$;