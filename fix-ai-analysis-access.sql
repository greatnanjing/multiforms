-- Execute this directly in Supabase Dashboard SQL Editor
-- https://supabase.com/dashboard/project/tyhmopsotdtoiorgjvoy/sql

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Allow public access for AI analysis" ON public.form_submissions;

-- Add policy to allow public access to form_submissions for AI analysis polling
CREATE POLICY "Allow public access for AI analysis"
    ON public.form_submissions FOR SELECT
    USING (true);

-- Verify the policy was created
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'form_submissions'
AND policyname = 'Allow public access for AI analysis';
