-- Create table to track daily AI insight API calls for rate limiting
CREATE TABLE IF NOT EXISTS public.ai_insight_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  call_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_insight_calls ENABLE ROW LEVEL SECURITY;

-- Create policies for AI insight calls
CREATE POLICY "Users can insert their own AI insight calls" 
ON public.ai_insight_calls 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI insight calls" 
ON public.ai_insight_calls 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for efficient daily limit queries
CREATE INDEX IF NOT EXISTS idx_ai_insight_calls_user_date 
ON public.ai_insight_calls (user_id, call_date);