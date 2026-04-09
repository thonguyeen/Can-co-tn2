-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 201: RPC Functions cho Bot Envoy
-- ═══════════════════════════════════════════════════════════════

-- Atomic increment posts_today (tránh race condition)
CREATE OR REPLACE FUNCTION increment_posts_today(bot_handle_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE bots 
  SET posts_today = posts_today + 1 
  WHERE handle = bot_handle_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset daily quota cho tất cả envoy bots (gọi bởi cron job)
CREATE OR REPLACE FUNCTION reset_all_envoy_quota()
RETURNS INT AS $$
DECLARE
  affected INT;
BEGIN
  UPDATE bots 
  SET posts_today = 0 
  WHERE is_envoy = true;
  
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- DONE! Migration 201 hoàn tất.
-- ═══════════════════════════════════════════════════════════════
