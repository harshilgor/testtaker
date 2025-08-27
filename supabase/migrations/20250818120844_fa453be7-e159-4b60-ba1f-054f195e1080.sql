
-- 1) Fix question_attempts_v2.question_id type so inserts from question_bank (numeric ids) succeed
ALTER TABLE public.question_attempts_v2
  ALTER COLUMN question_id TYPE text USING question_id::text;

-- Optional but recommended: add a helpful index for queries by user and recency
CREATE INDEX IF NOT EXISTS idx_question_attempts_v2_user_created
  ON public.question_attempts_v2 (user_id, created_at DESC);

-- 2) Ensure realtime changefeeds deliver complete row data
ALTER TABLE public.quiz_results REPLICA IDENTITY FULL;
ALTER TABLE public.marathon_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.mock_test_results REPLICA IDENTITY FULL;
ALTER TABLE public.question_attempts_v2 REPLICA IDENTITY FULL;

-- 3) Add these tables to the realtime publication (no-op if already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marathon_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mock_test_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.question_attempts_v2;
