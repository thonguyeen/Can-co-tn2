-- ═══════════════════════════════════════════════════════════════
-- FACEBOT - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('unverified', 'partial', 'verified', 'debunked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- BOTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  color_accent TEXT,
  bio TEXT,
  expertise TEXT[],
  personality TEXT,
  system_prompt TEXT,
  posts_count INT DEFAULT 0,
  followers_count INT DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 100.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- SOURCES (News sources for crawler)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  rss_url TEXT,
  credibility_score INT DEFAULT 70,
  category TEXT,
  language TEXT DEFAULT 'vi',
  is_active BOOLEAN DEFAULT true,
  last_crawled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- RAW_NEWS (Crawled news before processing)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS raw_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  original_url TEXT NOT NULL,
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  is_processed BOOLEAN DEFAULT false,
  post_id UUID,
  content_hash TEXT,
  crawl_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- POSTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  raw_news_id UUID REFERENCES raw_news(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  verification_status verification_status DEFAULT 'unverified',
  verification_note TEXT,
  sources JSONB DEFAULT '[]',
  comments_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  saves_count INT DEFAULT 0,
  importance_score INT DEFAULT 50,
  is_breaking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link raw_news to posts
ALTER TABLE raw_news DROP CONSTRAINT IF EXISTS raw_news_post_id_fkey;
ALTER TABLE raw_news ADD CONSTRAINT raw_news_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL;

-- ═══════════════════════════════════════════════════════════════
-- POST UPDATES (History)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS post_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  old_status verification_status,
  new_status verification_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- FOLLOWS, LIKES, SAVES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS follows (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, bot_id)
);

CREATE TABLE IF NOT EXISTS likes (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS saves (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- ═══════════════════════════════════════════════════════════════
-- CRAWL LOGS
-- ═══════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════
-- BREAKING NEWS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS breaking_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  summary TEXT,
  urgency_level TEXT DEFAULT 'normal',
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- STORY CLUSTERS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS story_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  category TEXT,
  post_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cluster_posts (
  cluster_id UUID NOT NULL REFERENCES story_clusters(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) DEFAULT 1.0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (cluster_id, post_id)
);

-- ═══════════════════════════════════════════════════════════════
-- GAMIFICATION
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  points INT DEFAULT 0,
  level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  last_active_date DATE,
  posts_read INT DEFAULT 0,
  comments_made INT DEFAULT 0,
  likes_given INT DEFAULT 0,
  shares_made INT DEFAULT 0,
  correct_predictions INT DEFAULT 0,
  total_predictions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INT NOT NULL,
  action TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INT,
  closes_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  selected_option INT NOT NULL,
  confidence INT DEFAULT 50,
  is_correct BOOLEAN,
  points_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prediction_id)
);

CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  reference_id UUID,
  reference_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_posts_bot_id ON posts(bot_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_verification ON posts(verification_status);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_user_id ON follows(user_id);
CREATE INDEX IF NOT EXISTS idx_raw_news_processed ON raw_news(is_processed);
CREATE INDEX IF NOT EXISTS idx_raw_news_source ON raw_news(source_id);
CREATE INDEX IF NOT EXISTS idx_sources_active ON sources(is_active);
CREATE INDEX IF NOT EXISTS idx_breaking_active ON breaking_news(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read bots" ON bots;
CREATE POLICY "Public read bots" ON bots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read posts" ON posts;
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read post_updates" ON post_updates;
CREATE POLICY "Public read post_updates" ON post_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read comments" ON comments;
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read sources" ON sources;
CREATE POLICY "Public read sources" ON sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read raw_news" ON raw_news;
CREATE POLICY "Public read raw_news" ON raw_news FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read breaking_news" ON breaking_news;
CREATE POLICY "Public read breaking_news" ON breaking_news FOR SELECT USING (true);

-- User policies
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users read own follows" ON follows;
CREATE POLICY "Users read own follows" ON follows FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert follows" ON follows;
CREATE POLICY "Users insert follows" ON follows FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete follows" ON follows;
CREATE POLICY "Users delete follows" ON follows FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own likes" ON likes;
CREATE POLICY "Users read own likes" ON likes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert likes" ON likes;
CREATE POLICY "Users insert likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete likes" ON likes;
CREATE POLICY "Users delete likes" ON likes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own saves" ON saves;
CREATE POLICY "Users read own saves" ON saves FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert saves" ON saves;
CREATE POLICY "Users insert saves" ON saves FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete saves" ON saves;
CREATE POLICY "Users delete saves" ON saves FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert comments" ON comments;
CREATE POLICY "Users insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own stats" ON user_stats;
CREATE POLICY "Users read own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own reactions" ON reactions;
CREATE POLICY "Users manage own reactions" ON reactions FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- SEED BOTS (9 personas)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO bots (id, name, handle, color_accent, bio, expertise, is_active) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Minh AI', 'minh_ai', '#8B5CF6', 'Chuyên gia AI/ML | Giải mã công nghệ cho mọi người', ARRAY['AI', 'Machine Learning', 'LLM', 'Deep Learning'], true),
  ('b1000000-0000-0000-0000-000000000002', 'Lan Startup', 'lan_startup', '#F97316', 'Theo dõi startup & đầu tư | Data-driven insights', ARRAY['Startup', 'Funding', 'Business', 'VC'], true),
  ('b1000000-0000-0000-0000-000000000003', 'Nam Gadget', 'nam_gadget', '#06B6D4', 'Reviewer công nghệ | Thẳng thắn & Thực tế', ARRAY['Hardware', 'Smartphones', 'Reviews', 'Tech'], true),
  ('b1000000-0000-0000-0000-000000000004', 'Hùng Crypto', 'hung_crypto', '#F59E0B', 'Crypto trader | Web3 builder | DYOR advocate', ARRAY['Crypto', 'Bitcoin', 'DeFi', 'Web3'], true),
  ('b1000000-0000-0000-0000-000000000005', 'Mai Finance', 'mai_finance', '#10B981', 'Phân tích tài chính | Macro & Micro insights', ARRAY['Finance', 'Stock', 'Investment', 'Economics'], true),
  ('b1000000-0000-0000-0000-000000000006', 'Tuấn Esports', 'tuan_esports', '#EC4899', 'Esports enthusiast | Game analyst | Drama tracker', ARRAY['Esports', 'Gaming', 'Streaming', 'LOL'], true),
  ('b1000000-0000-0000-0000-000000000007', 'Linh Lifestyle', 'linh_lifestyle', '#A855F7', 'Trend spotter | Viral tracker | Culture observer', ARRAY['Trends', 'Social Media', 'Pop Culture', 'Viral'], true),
  ('b1000000-0000-0000-0000-000000000008', 'Đức Security', 'duc_security', '#EF4444', 'Cybersecurity analyst | Threat hunter | Privacy advocate', ARRAY['Cybersecurity', 'Privacy', 'Hacking', 'Security'], true),
  ('b1000000-0000-0000-0000-000000000009', 'An Politics', 'an_politics', '#6B7280', 'Chính trị & Xã hội | Fact-based analysis | Trung lập', ARRAY['Politics', 'Policy', 'Geopolitics', 'Society'], true)
ON CONFLICT (handle) DO UPDATE SET
  name = EXCLUDED.name,
  color_accent = EXCLUDED.color_accent,
  bio = EXCLUDED.bio,
  expertise = EXCLUDED.expertise,
  is_active = EXCLUDED.is_active;

-- ═══════════════════════════════════════════════════════════════
-- SEED SOURCES
-- ═══════════════════════════════════════════════════════════════

INSERT INTO sources (name, url, rss_url, credibility_score, category, language, is_active) VALUES
  ('VnExpress', 'https://vnexpress.net', 'https://vnexpress.net/rss/tin-moi-nhat.rss', 85, 'general', 'vi', true),
  ('Zing News', 'https://zingnews.vn', 'https://zingnews.vn/rss/tin-moi.rss', 80, 'general', 'vi', true),
  ('Tinh tế', 'https://tinhte.vn', 'https://tinhte.vn/rss', 90, 'tech', 'vi', true),
  ('Genk', 'https://genk.vn', 'https://genk.vn/rss/home.rss', 85, 'tech', 'vi', true),
  ('CafeF', 'https://cafef.vn', 'https://cafef.vn/rss/home.rss', 80, 'finance', 'vi', true),
  ('TechCrunch', 'https://techcrunch.com', 'https://techcrunch.com/feed/', 95, 'tech', 'en', true),
  ('The Verge', 'https://theverge.com', 'https://www.theverge.com/rss/index.xml', 90, 'tech', 'en', true),
  ('CoinDesk', 'https://coindesk.com', 'https://www.coindesk.com/arc/outboundfeeds/rss/', 85, 'crypto', 'en', true)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════════

SELECT 'Migration completed successfully!' as status;
