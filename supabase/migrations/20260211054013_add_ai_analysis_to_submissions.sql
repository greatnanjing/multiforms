-- Add AI analysis fields to form_submissions table
-- This enables storing AI-generated insights about form responses

-- Add ai_analysis column to store the AI-generated analysis text
ALTER TABLE "public"."form_submissions"
ADD COLUMN "ai_analysis" text NULL;

-- Add ai_analysis_status to track the analysis status
ALTER TABLE "public"."form_submissions"
ADD COLUMN "ai_analysis_status" varchar(20) DEFAULT 'pending' CHECK ("ai_analysis_status" IN ('pending', 'processing', 'completed', 'failed'));

-- Add index for faster queries on analysis status
CREATE INDEX IF NOT EXISTS "form_submissions_ai_analysis_status_idx" ON "public"."form_submissions"("ai_analysis_status");

-- Add comment for documentation
COMMENT ON COLUMN "public"."form_submissions"."ai_analysis" IS 'AI-generated analysis of the submission (max 200 characters)';

COMMENT ON COLUMN "public"."form_submissions"."ai_analysis_status" IS 'Status of AI analysis: pending, processing, completed, or failed';
