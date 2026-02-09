-- Add questions column to templates table
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;
