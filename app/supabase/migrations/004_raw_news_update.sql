-- Add more fields to raw_news for better tracking

ALTER TABLE raw_news ADD COLUMN IF NOT EXISTS
  content_hash TEXT;

ALTER TABLE raw_news ADD COLUMN IF NOT EXISTS
  crawl_metadata JSONB DEFAULT '{}';

-- Index for deduplication
CREATE INDEX IF NOT EXISTS idx_raw_news_url_hash
  ON raw_news(md5(original_url));

CREATE INDEX IF NOT EXISTS idx_raw_news_content_hash
  ON raw_news(content_hash);

-- Crawl logs table
CREATE TABLE IF NOT EXISTS crawl_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running',
  articles_found INT DEFAULT 0,
  articles_new INT DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_crawl_logs_source ON crawl_logs(source_id);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_status ON crawl_logs(status);
