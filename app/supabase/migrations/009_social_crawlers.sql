-- ═══════════════════════════════════════════════════════════════
-- PHASE 9: SOCIAL MEDIA CRAWLERS
-- ═══════════════════════════════════════════════════════════════

-- Add content_hash column for better deduplication
ALTER TABLE raw_news ADD COLUMN IF NOT EXISTS content_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_raw_news_content_hash ON raw_news(content_hash);

-- Update sources column to store richer metadata
COMMENT ON COLUMN raw_news.sources IS 'Source metadata: {id, name, platform, category[], credibility, platform_data}';

-- Create crawler_runs table to track crawl history
CREATE TABLE IF NOT EXISTS crawler_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  platforms TEXT[],
  total_sources INTEGER DEFAULT 0,
  total_items_crawled INTEGER DEFAULT 0,
  total_items_saved INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crawler_runs_status ON crawler_runs(status);
CREATE INDEX IF NOT EXISTS idx_crawler_runs_started ON crawler_runs(started_at DESC);

-- Create source_stats table to track per-source metrics
CREATE TABLE IF NOT EXISTS source_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id TEXT NOT NULL UNIQUE,
  source_name TEXT,
  platform TEXT,
  total_crawled INTEGER DEFAULT 0,
  total_saved INTEGER DEFAULT 0,
  last_crawled_at TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_stats_platform ON source_stats(platform);

-- Function to update source stats
CREATE OR REPLACE FUNCTION update_source_stats(
  p_source_id TEXT,
  p_source_name TEXT,
  p_platform TEXT,
  p_crawled INTEGER,
  p_saved INTEGER,
  p_error TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO source_stats (source_id, source_name, platform, total_crawled, total_saved, last_crawled_at, error_count, last_error, updated_at)
  VALUES (p_source_id, p_source_name, p_platform, p_crawled, p_saved, NOW(),
    CASE WHEN p_error IS NOT NULL THEN 1 ELSE 0 END, p_error, NOW())
  ON CONFLICT (source_id) DO UPDATE SET
    total_crawled = source_stats.total_crawled + EXCLUDED.total_crawled,
    total_saved = source_stats.total_saved + EXCLUDED.total_saved,
    last_crawled_at = NOW(),
    error_count = CASE WHEN p_error IS NOT NULL THEN source_stats.error_count + 1 ELSE source_stats.error_count END,
    last_error = COALESCE(p_error, source_stats.last_error),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE crawler_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read crawler_runs" ON crawler_runs FOR SELECT USING (true);

ALTER TABLE source_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read source_stats" ON source_stats FOR SELECT USING (true);
