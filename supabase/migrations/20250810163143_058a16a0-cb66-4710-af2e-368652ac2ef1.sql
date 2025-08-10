-- Create user_goals table to store goals per period
CREATE TABLE IF NOT EXISTS public.user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period text NOT NULL CHECK (period IN ('7days','1month','alltime')),
  target integer NOT NULL CHECK (target >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period)
);

-- Helper function to update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on user_goals
DROP TRIGGER IF EXISTS set_user_goals_updated_at ON public.user_goals;
CREATE TRIGGER set_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS and add policies
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Users can view their own goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
CREATE POLICY "Users can view their own goals"
ON public.user_goals
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own goals
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.user_goals;
CREATE POLICY "Users can insert their own goals"
ON public.user_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own goals
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
CREATE POLICY "Users can update their own goals"
ON public.user_goals
FOR UPDATE
USING (auth.uid() = user_id);
