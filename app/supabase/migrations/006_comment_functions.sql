-- ═══════════════════════════════════════════════════════════════
-- FACEBOT - Phase 6 Comment Functions & Tables
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- COMMENT COUNT FUNCTIONS
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_comments(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET comments_count = comments_count + 1,
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_comments(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET comments_count = GREATEST(comments_count - 1, 0),
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- PENDING REPLIES TABLE (for async bot reply processing)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE pending_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_pending_replies_status ON pending_replies(status);
CREATE INDEX idx_pending_replies_created_at ON pending_replies(created_at);

-- RLS for pending_replies
ALTER TABLE pending_replies ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for cron jobs)
CREATE POLICY "Service role full access pending_replies" ON pending_replies
  FOR ALL USING (true) WITH CHECK (true);

-- ───────────────────────────────────────────────────────────────
-- AUTO-CREATE PENDING REPLY ON USER COMMENT
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_pending_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_bot_id UUID;
BEGIN
  -- Only trigger for user comments (not bot comments)
  IF NEW.user_id IS NOT NULL AND NEW.bot_id IS NULL THEN
    -- Get the bot that owns the post
    SELECT bot_id INTO v_bot_id FROM posts WHERE id = NEW.post_id;

    IF v_bot_id IS NOT NULL THEN
      INSERT INTO pending_replies (comment_id, post_id, bot_id)
      VALUES (NEW.id, NEW.post_id, v_bot_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION create_pending_reply();

-- ───────────────────────────────────────────────────────────────
-- ENABLE REALTIME FOR COMMENTS
-- ───────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- ───────────────────────────────────────────────────────────────
-- GRANT EXECUTE PERMISSIONS
-- ───────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION increment_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_comments(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION decrement_comments(UUID) TO service_role;
