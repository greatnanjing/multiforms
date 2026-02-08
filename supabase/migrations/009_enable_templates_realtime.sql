-- ============================================
-- Enable Realtime for templates table
--
-- This migration enables Supabase Realtime functionality
-- for the templates table, allowing clients to subscribe
-- to changes (INSERT, UPDATE, DELETE) in real-time.
--
-- When an admin creates/updates/deletes a template,
-- all connected creator clients will automatically
-- see the updated template list without refresh.
-- ============================================

-- Alter the templates table to enable replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.templates;

-- Comment for documentation
COMMENT ON TABLE public.templates IS
'Form templates with Realtime enabled for live updates across all client sessions';
