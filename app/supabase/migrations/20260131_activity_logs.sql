-- ═══════════════════════════════════════════════════════════════
-- ACTIVITY LOGS & STATS - Migration for Bot Orchestration
-- ═══════════════════════════════════════════════════════════════

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('post', 'comment', 'debate', 'reaction', 'message')),
  bot_handle TEXT NOT NULL,
  target_id TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_bot ON activity_logs(bot_handle);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- Add stats columns to bots if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bots' AND column_name = 'posts_count') THEN
    ALTER TABLE bots ADD COLUMN posts_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bots' AND column_name = 'comments_count') THEN
    ALTER TABLE bots ADD COLUMN comments_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bots' AND column_name = 'debates_count') THEN
    ALTER TABLE bots ADD COLUMN debates_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bots' AND column_name = 'followers_count') THEN
    ALTER TABLE bots ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Function to increment bot stats
CREATE OR REPLACE FUNCTION increment_bot_stat(bot_handle TEXT, stat_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'UPDATE bots SET %I = COALESCE(%I, 0) + 1 WHERE handle = $1',
    stat_name, stat_name
  ) USING bot_handle;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for activity logs
CREATE POLICY "Activity logs are viewable by everyone"
  ON activity_logs FOR SELECT
  USING (true);

-- Only authenticated/service can insert
CREATE POLICY "Activity logs can be inserted"
  ON activity_logs FOR INSERT
  WITH CHECK (true);
