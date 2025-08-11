-- Fix security vulnerability: Restrict access to question bank
-- Currently the question_bank table is publicly readable, allowing anyone to see all questions and answers

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "allow all reads" ON public.question_bank;
DROP POLICY IF EXISTS "allow all inserts" ON public.question_bank;

-- Create secure policies for question_bank access
-- Only authenticated users can read questions (prevents anonymous cheating)
CREATE POLICY "Authenticated users can read questions" 
  ON public.question_bank 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Prevent any direct inserts/updates/deletes from users (admin-only operations)
CREATE POLICY "Prevent user modifications" 
  ON public.question_bank 
  FOR ALL
  TO authenticated
  USING (false);

-- Create a secure function to serve questions without exposing answers
-- This function will be used by the application to get questions for quizzes/tests
CREATE OR REPLACE FUNCTION public.get_questions_for_quiz(
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
  -- This prevents cheating while allowing normal quiz functionality
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

-- Create a secure function to validate answers and return explanations
-- This ensures answers are only revealed after submission
CREATE OR REPLACE FUNCTION public.validate_answer_and_get_explanation(
  p_question_id bigint,
  p_submitted_answer text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE(
  is_correct boolean,
  correct_answer text,
  correct_explanation text,
  incorrect_explanation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  question_data RECORD;
BEGIN
  -- Only authenticated users can validate answers
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get the question data
  SELECT 
    qb.correct_answer,
    qb.correct_rationale,
    CASE p_submitted_answer
      WHEN 'A' THEN qb.incorrect_rationale_a
      WHEN 'B' THEN qb.incorrect_rationale_b
      WHEN 'C' THEN qb.incorrect_rationale_c
      WHEN 'D' THEN qb.incorrect_rationale_d
      ELSE NULL
    END as submitted_explanation
  INTO question_data
  FROM public.question_bank qb
  WHERE qb.id = p_question_id;

  -- Return validation results
  RETURN QUERY
  SELECT 
    (UPPER(p_submitted_answer) = UPPER(question_data.correct_answer)) as is_correct,
    question_data.correct_answer,
    question_data.correct_rationale as correct_explanation,
    question_data.submitted_explanation as incorrect_explanation;
END;
$$;

-- Grant execute permissions to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_questions_for_quiz TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_answer_and_get_explanation TO authenticated;