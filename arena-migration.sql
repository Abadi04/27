-- ============================================================
-- الساحة (Arena) — migration
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS arena_messages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT        NOT NULL,
  content      TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 280),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '60 minutes')
);

-- 2. Index for efficient expiry filtering
CREATE INDEX IF NOT EXISTS idx_arena_expires ON arena_messages (expires_at);
CREATE INDEX IF NOT EXISTS idx_arena_anon ON arena_messages (anonymous_id);

-- 3. Enable Row Level Security
ALTER TABLE arena_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Anyone (including anonymous Supabase users) can read non-expired messages
CREATE POLICY "arena_read_live" ON arena_messages
  FOR SELECT
  USING (expires_at > NOW());

-- Authenticated (including anonymous) users can insert their own messages
CREATE POLICY "arena_insert_own" ON arena_messages
  FOR INSERT
  WITH CHECK (anonymous_id = auth.uid()::text);

-- Users can only delete their own messages
CREATE POLICY "arena_delete_own" ON arena_messages
  FOR DELETE
  USING (anonymous_id = auth.uid()::text);

-- 5. Enable Realtime on the table
-- (Run in Supabase Dashboard → Database → Replication → enable arena_messages)
-- OR via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE arena_messages;

-- 6. Cleanup function — deletes expired messages
CREATE OR REPLACE FUNCTION cleanup_arena_messages()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM arena_messages WHERE expires_at <= NOW();
$$;

-- 7. Schedule cleanup every 5 minutes using pg_cron
-- (Requires pg_cron extension — enable it in Supabase Dashboard → Extensions)
SELECT cron.schedule(
  'cleanup-arena-messages',   -- job name
  '*/5 * * * *',             -- every 5 minutes
  'SELECT cleanup_arena_messages()'
);

-- ============================================================
-- To verify setup:
-- SELECT * FROM arena_messages LIMIT 5;
-- SELECT cron.job WHERE jobname = 'cleanup-arena-messages';
-- ============================================================
