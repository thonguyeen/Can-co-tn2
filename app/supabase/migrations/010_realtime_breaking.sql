-- ═══════════════════════════════════════════════════════════════
-- Migration 010: Realtime & Breaking News
-- ═══════════════════════════════════════════════════════════════

-- Breaking news table
CREATE TABLE IF NOT EXISTS breaking_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  summary TEXT DEFAULT '',
  urgency_level TEXT NOT NULL DEFAULT 'medium'
    CHECK (urgency_level IN ('critical', 'high', 'medium', 'low')),
  category TEXT NOT NULL DEFAULT 'general',
  related_topics TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for breaking_news
CREATE INDEX IF NOT EXISTS idx_breaking_active ON breaking_news(is_active, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_breaking_post ON breaking_news(post_id);
CREATE INDEX IF NOT EXISTS idx_breaking_category ON breaking_news(category);

-- Story clusters table
CREATE TABLE IF NOT EXISTS story_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  urgency_level TEXT DEFAULT 'low',
  is_breaking BOOLEAN DEFAULT false,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cluster membership (posts belong to clusters)
CREATE TABLE IF NOT EXISTS cluster_posts (
  cluster_id UUID NOT NULL REFERENCES story_clusters(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  similarity REAL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (cluster_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_cluster_posts_post ON cluster_posts(post_id);

-- Add is_breaking flag to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_breaking BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS breaking_detected_at TIMESTAMPTZ;

-- Enable Realtime for posts and breaking_news tables
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE breaking_news;

-- Function to auto-deactivate expired breaking news
CREATE OR REPLACE FUNCTION deactivate_expired_breaking()
RETURNS void AS $$
BEGIN
  UPDATE breaking_news
  SET is_active = false
  WHERE is_active = true
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update cluster post count
CREATE OR REPLACE FUNCTION update_cluster_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE story_clusters
    SET post_count = post_count + 1, updated_at = NOW()
    WHERE id = NEW.cluster_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE story_clusters
    SET post_count = post_count - 1, updated_at = NOW()
    WHERE id = OLD.cluster_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cluster_post_count
AFTER INSERT OR DELETE ON cluster_posts
FOR EACH ROW EXECUTE FUNCTION update_cluster_post_count();
