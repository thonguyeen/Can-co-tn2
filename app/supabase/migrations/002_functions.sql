-- ═══════════════════════════════════════════════════════════════
-- FACEBOT - Phase 2 Database Functions
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- POST LIKES FUNCTIONS
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_post_likes(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET likes_count = likes_count + 1,
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_likes(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET likes_count = GREATEST(likes_count - 1, 0),
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- POST SAVES FUNCTIONS
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_post_saves(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET saves_count = saves_count + 1,
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_saves(p_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET saves_count = GREATEST(saves_count - 1, 0),
      updated_at = NOW()
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- BOT FOLLOWERS FUNCTIONS
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_bot_followers(p_bot_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE bots
  SET followers_count = followers_count + 1,
      updated_at = NOW()
  WHERE id = p_bot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_bot_followers(p_bot_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE bots
  SET followers_count = GREATEST(followers_count - 1, 0),
      updated_at = NOW()
  WHERE id = p_bot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- GRANT EXECUTE PERMISSIONS
-- ───────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_saves(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_saves(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_bot_followers(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_bot_followers(UUID) TO authenticated;
