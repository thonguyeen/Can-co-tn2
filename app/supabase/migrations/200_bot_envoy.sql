-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 200: Bot Envoy System
-- Biến Bot thành Nhân Viên Môi Giới Địa Phương
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. MỞ RỘNG BẢNG bots — Thêm "Hộ Khẩu + Nghề"
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE bots
  ADD COLUMN IF NOT EXISTS assigned_province TEXT,
  ADD COLUMN IF NOT EXISTS assigned_district TEXT,
  ADD COLUMN IF NOT EXISTS assigned_ward TEXT,
  ADD COLUMN IF NOT EXISTS assigned_province_code TEXT,
  ADD COLUMN IF NOT EXISTS assigned_district_code TEXT,
  ADD COLUMN IF NOT EXISTS assigned_ward_code TEXT,
  ADD COLUMN IF NOT EXISTS assigned_categories TEXT[] DEFAULT '{real_estate}',
  ADD COLUMN IF NOT EXISTS daily_quota INT DEFAULT 10,
  ADD COLUMN IF NOT EXISTS posts_today INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_envoy BOOLEAN DEFAULT FALSE;

-- Constraint: Quota phải trong khoảng 5-100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_daily_quota'
  ) THEN
    ALTER TABLE bots ADD CONSTRAINT chk_daily_quota
      CHECK (daily_quota >= 5 AND daily_quota <= 100);
  END IF;
END $$;

-- Index cho Bot Envoy
CREATE INDEX IF NOT EXISTS idx_bots_envoy ON bots(is_envoy) WHERE is_envoy = true;

-- ═══════════════════════════════════════════════════════════════
-- 2. MỞ RỘNG BẢNG intents — Cho phép Bot đăng bài
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE intents
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bot_handle TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Cho phép user_id NULL khi bài của Bot
ALTER TABLE intents ALTER COLUMN user_id DROP NOT NULL;

-- Constraint: Bot phải có bot_handle, User phải có user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_bot_intent'
  ) THEN
    ALTER TABLE intents ADD CONSTRAINT chk_bot_intent
      CHECK (
        (is_bot = FALSE AND user_id IS NOT NULL)
        OR (is_bot = TRUE AND bot_handle IS NOT NULL)
      );
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_intents_bot ON intents(is_bot) WHERE is_bot = true;
CREATE INDEX IF NOT EXISTS idx_intents_bot_handle ON intents(bot_handle);
CREATE INDEX IF NOT EXISTS idx_intents_source_url ON intents(source_url);

-- ═══════════════════════════════════════════════════════════════
-- 3. TẠO BẢNG crawl_sources — Quản lý nguồn cào
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS crawl_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'rss'
    CHECK (source_type IN ('rss', 'html', 'api')),
  category TEXT NOT NULL DEFAULT 'real_estate',
  province TEXT,
  district TEXT,
  is_active BOOLEAN DEFAULT true,
  last_crawled_at TIMESTAMPTZ,
  crawl_interval_minutes INT DEFAULT 60,
  total_items_crawled INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index cho nguồn active
CREATE INDEX IF NOT EXISTS idx_crawl_sources_active
  ON crawl_sources(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════
-- 4. CẬP NHẬT RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- RLS cho crawl_sources (chỉ service role)
ALTER TABLE crawl_sources ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Drop old policy nếu tồn tại
  DROP POLICY IF EXISTS "Service role full access crawl_sources" ON crawl_sources;
  
  -- Cho phép đọc (service role sẽ bypass RLS)
  CREATE POLICY "Service role full access crawl_sources" ON crawl_sources
    FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Cập nhật policy đọc intents: Bài bot cũng hiện trên Feed
DO $$
BEGIN
  DROP POLICY IF EXISTS "Active intents readable by all" ON intents;
  
  CREATE POLICY "Active intents readable by all" ON intents
    FOR SELECT USING (
      status = 'active'
      OR user_id = auth.uid()
      OR is_bot = true
    );
END $$;

-- Cập nhật policy insert intents: Bot cũng được insert (qua service role)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated can create intents" ON intents;
  
  CREATE POLICY "Authenticated can create intents" ON intents
    FOR INSERT WITH CHECK (
      auth.uid() = user_id  -- Bài user thường
      OR is_bot = true       -- Bài bot (service role bypass)
    );
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 5. Thêm Realtime cho crawl_sources (optional)
-- ═══════════════════════════════════════════════════════════════
-- ALTER PUBLICATION supabase_realtime ADD TABLE crawl_sources;

-- ═══════════════════════════════════════════════════════════════
-- DONE! Migration 200_bot_envoy hoàn tất.
-- ═══════════════════════════════════════════════════════════════
