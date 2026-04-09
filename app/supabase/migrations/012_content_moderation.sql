-- ═══════════════════════════════════════════════════════════════
-- Content Moderation: Add violation tracking to profiles
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS violation_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Content violations log (for audit trail)
CREATE TABLE IF NOT EXISTS content_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  violation_type TEXT NOT NULL,   -- 'sexual', 'illegal', 'vulgar', 'spam'
  ai_reason TEXT,                 -- AI explanation of why it was flagged
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_violations ENABLE ROW LEVEL SECURITY;

-- Admin can read all violations, users can see their own
CREATE POLICY "Users read own violations"
  ON content_violations FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (via API)
CREATE POLICY "Service insert violations"
  ON content_violations FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_violations_user ON content_violations(user_id);
CREATE INDEX idx_violations_created ON content_violations(created_at DESC);
