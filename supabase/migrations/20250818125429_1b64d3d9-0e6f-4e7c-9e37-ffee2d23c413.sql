
-- 1) Make question_attempts_v2 accept numeric IDs as text
ALTER TABLE public.question_attempts_v2
  ALTER COLUMN question_id TYPE text USING question_id::text;

-- 2) Helpful index for performance queries
CREATE INDEX IF NOT EXISTS idx_question_attempts_v2_user_created
  ON public.question_attempts_v2 (user_id, created_at DESC);
