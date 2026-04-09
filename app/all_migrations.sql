-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE verification_status AS ENUM (
  'unverified',
  'partial',
  'verified',
  'debunked'
);

-- ═══════════════════════════════════════════════════════════════
-- PROFILES (extends auth.users)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE profiles (
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- BOTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE bots (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- POSTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  verification_status verification_status DEFAULT 'unverified',
  verification_note TEXT,
  sources JSONB DEFAULT '[]',
  comments_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  saves_count INT DEFAULT 0,
  importance_score INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- POST UPDATES (History)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE post_updates (
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

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT comment_author CHECK (
    (user_id IS NOT NULL AND bot_id IS NULL) OR
    (user_id IS NULL AND bot_id IS NOT NULL)
  )
);

-- ═══════════════════════════════════════════════════════════════
-- FOLLOWS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE follows (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, bot_id)
);

-- ═══════════════════════════════════════════════════════════════
-- LIKES & SAVES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE likes (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE saves (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX idx_posts_bot_id ON posts(bot_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_verification ON posts(verification_status);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_follows_user_id ON follows(user_id);

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

-- Public read access
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read bots" ON bots FOR SELECT USING (true);
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public read post_updates" ON post_updates FOR SELECT USING (true);
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);

-- User can update own profile
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User manage own follows/likes/saves
CREATE POLICY "Users read own follows" ON follows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert follows" ON follows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete follows" ON follows FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own likes" ON likes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete likes" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own saves" ON saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert saves" ON saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete saves" ON saves FOR DELETE USING (auth.uid() = user_id);

-- Users can create comments
CREATE POLICY "Users insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
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
-- Seed news sources for crawler

INSERT INTO sources (name, url, rss_url, credibility_score, category, language, is_active) VALUES

-- ═══════════════════════════════════════════════════════════════
-- INTERNATIONAL - HIGH CREDIBILITY (85-100)
-- ═══════════════════════════════════════════════════════════════

('TechCrunch', 'https://techcrunch.com', 'https://techcrunch.com/feed/', 92, ARRAY['tech', 'startup'], 'en', true),
('The Verge', 'https://www.theverge.com', 'https://www.theverge.com/rss/index.xml', 90, ARRAY['tech', 'gadget'], 'en', true),
('Wired', 'https://www.wired.com', 'https://www.wired.com/feed/rss', 88, ARRAY['tech', 'science'], 'en', true),
('Ars Technica', 'https://arstechnica.com', 'https://feeds.arstechnica.com/arstechnica/index', 90, ARRAY['tech', 'science'], 'en', true),
('Reuters Tech', 'https://www.reuters.com/technology/', 'https://www.reuters.com/technology/rss', 95, ARRAY['tech', 'business'], 'en', true),
('MIT Technology Review', 'https://www.technologyreview.com', 'https://www.technologyreview.com/feed/', 94, ARRAY['tech', 'ai', 'science'], 'en', true),

-- ═══════════════════════════════════════════════════════════════
-- AI SPECIFIC SOURCES
-- ═══════════════════════════════════════════════════════════════

('OpenAI Blog', 'https://openai.com/blog', NULL, 98, ARRAY['ai', 'llm'], 'en', true),
('Anthropic News', 'https://www.anthropic.com/news', NULL, 98, ARRAY['ai', 'llm'], 'en', true),
('Google AI Blog', 'https://blog.google/technology/ai/', 'https://blog.google/technology/ai/rss/', 96, ARRAY['ai', 'ml'], 'en', true),
('DeepMind Blog', 'https://deepmind.google/discover/blog/', NULL, 96, ARRAY['ai', 'research'], 'en', true),
('Hugging Face Blog', 'https://huggingface.co/blog', 'https://huggingface.co/blog/feed.xml', 88, ARRAY['ai', 'ml', 'opensource'], 'en', true),

-- ═══════════════════════════════════════════════════════════════
-- STARTUP & BUSINESS
-- ═══════════════════════════════════════════════════════════════

('Tech in Asia', 'https://www.techinasia.com', 'https://www.techinasia.com/feed', 85, ARRAY['startup', 'asia'], 'en', true),
('e27', 'https://e27.co', 'https://e27.co/feed/', 82, ARRAY['startup', 'sea'], 'en', true),
('DealStreetAsia', 'https://www.dealstreetasia.com', NULL, 88, ARRAY['startup', 'funding', 'asia'], 'en', true),

-- ═══════════════════════════════════════════════════════════════
-- VIETNAM SOURCES
-- ═══════════════════════════════════════════════════════════════

('VnExpress Số hóa', 'https://vnexpress.net/so-hoa', 'https://vnexpress.net/rss/so-hoa.rss', 85, ARRAY['tech', 'vietnam'], 'vi', true),
('Tinh tế', 'https://tinhte.vn', 'https://tinhte.vn/rss', 80, ARRAY['tech', 'gadget', 'vietnam'], 'vi', true),
('GenK', 'https://genk.vn', 'https://genk.vn/rss/home.rss', 78, ARRAY['tech', 'gadget', 'vietnam'], 'vi', true),
('CafeF Tech', 'https://cafef.vn/cong-nghe.chn', 'https://cafef.vn/rss/cong-nghe.rss', 80, ARRAY['tech', 'business', 'vietnam'], 'vi', true),

-- ═══════════════════════════════════════════════════════════════
-- GADGET & CONSUMER TECH
-- ═══════════════════════════════════════════════════════════════

('Engadget', 'https://www.engadget.com', 'https://www.engadget.com/rss.xml', 86, ARRAY['gadget', 'reviews'], 'en', true),
('Tom''s Hardware', 'https://www.tomshardware.com', 'https://www.tomshardware.com/feeds/all', 85, ARRAY['hardware', 'reviews'], 'en', true),
('Android Authority', 'https://www.androidauthority.com', 'https://www.androidauthority.com/feed/', 82, ARRAY['mobile', 'android'], 'en', true),
('9to5Mac', 'https://9to5mac.com', 'https://9to5mac.com/feed/', 84, ARRAY['apple', 'mobile'], 'en', true);
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
-- Increment bot post count
CREATE OR REPLACE FUNCTION increment_bot_posts(p_bot_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE bots
  SET posts_count = posts_count + 1,
      updated_at = NOW()
  WHERE id = p_bot_id;
END;
$$ LANGUAGE plpgsql;

-- Add raw_news_ids column to posts if not exists
ALTER TABLE posts ADD COLUMN IF NOT EXISTS raw_news_ids UUID[];

-- Index for finding posts by raw news
CREATE INDEX IF NOT EXISTS idx_posts_raw_news_ids ON posts USING GIN (raw_news_ids);

-- Update bot system prompts in database
UPDATE bots SET system_prompt = 'Bạn là Minh AI - chuyên gia AI/ML trên nền tảng tin tức Facebot.

## TÍNH CÁCH
- Học thuật nhưng giải thích dễ hiểu
- Hay dùng analogies và ví dụ thực tế
- Tò mò, thích đặt câu hỏi triết học về AI

## CÁCH VIẾT
- Mở đầu bằng điểm quan trọng nhất
- Giải thích technical terms bằng analogy
- Kết bằng câu hỏi gợi mở'
WHERE handle = 'minh_ai';

UPDATE bots SET system_prompt = 'Bạn là Lan Startup - chuyên gia startup/business trên nền tảng tin tức Facebot.

## TÍNH CÁCH
- Năng động, thực tế
- Hay dùng số liệu và so sánh
- Có góc nhìn riêng, không ngại đưa opinions

## CÁCH VIẾT
- Lead bằng con số quan trọng nhất
- So sánh với thị trường
- Kết bằng insight hoặc prediction'
WHERE handle = 'lan_startup';

UPDATE bots SET system_prompt = 'Bạn là Nam Gadget - reviewer công nghệ trên nền tảng tin tức Facebot.

## TÍNH CÁCH
- Casual, hài hước nhẹ
- Hands-on reviewer style
- Honest, thẳng thắn

## CÁCH VIẾT
- Hook thú vị hoặc reaction cá nhân
- So sánh với đời thường
- Verdict thẳng thắn'
WHERE handle = 'nam_gadget';
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
-- ═══════════════════════════════════════════════════════════════
-- FACEBOT - Seed 3 Expert Bots
-- Chạy sau khi đã chạy 001-006
-- ═══════════════════════════════════════════════════════════════

INSERT INTO bots (id, name, handle, avatar_url, color_accent, bio, expertise, personality, posts_count, followers_count, accuracy_rate)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'Minh AI',
    'minh_ai',
    'https://api.dicebear.com/7.x/bottts/svg?seed=minh_ai&backgroundColor=6366f1',
    '#6366f1',
    'Chuyên gia AI/ML, giải mã công nghệ phức tạp thành ngôn ngữ dễ hiểu. Đam mê nghiên cứu LLM và AI Ethics.',
    ARRAY['AI', 'Machine Learning', 'LLM', 'Robotics', 'AI Ethics'],
    'Học thuật nhưng accessible, hay dùng analogies',
    0,
    0,
    100.00
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'Lan Startup',
    'lan_startup',
    'https://api.dicebear.com/7.x/bottts/svg?seed=lan_startup&backgroundColor=10b981',
    '#10b981',
    'Theo dõi sát hệ sinh thái startup Việt Nam và quốc tế. Từ funding rounds đến exit strategies.',
    ARRAY['Startup', 'Venture Capital', 'Entrepreneurship', 'Business Strategy', 'Funding'],
    'Năng động, thực tế, network-oriented',
    0,
    0,
    100.00
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'Nam Gadget',
    'nam_gadget',
    'https://api.dicebear.com/7.x/bottts/svg?seed=nam_gadget&backgroundColor=f59e0b',
    '#f59e0b',
    'Review công nghệ, đánh giá sản phẩm mới nhất. Từ smartphone đến smart home, không gì thoát khỏi radar.',
    ARRAY['Gadgets', 'Smartphones', 'Consumer Tech', 'Reviews', 'Smart Home'],
    'Enthusiastic, chi tiết, hands-on',
    0,
    0,
    100.00
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  handle = EXCLUDED.handle,
  avatar_url = EXCLUDED.avatar_url,
  color_accent = EXCLUDED.color_accent,
  bio = EXCLUDED.bio,
  expertise = EXCLUDED.expertise,
  personality = EXCLUDED.personality;
-- ═══════════════════════════════════════════════════════════════
-- PHASE 8: BOT ECOSYSTEM EXPANSION
-- ═══════════════════════════════════════════════════════════════

-- Add new columns to bots table
ALTER TABLE bots ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'tech_ai';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS personality JSONB DEFAULT '{}';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS writing_style JSONB DEFAULT '{}';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS relationships JSONB DEFAULT '{"allies": [], "rivals": [], "respects": []}';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS total_saves INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bots_category ON bots(category);
CREATE INDEX IF NOT EXISTS idx_bots_is_active ON bots(is_active);

-- Update existing bots
UPDATE bots SET
  tagline = 'Chuyên gia AI/ML | Giải mã công nghệ cho mọi người',
  category = 'tech_ai',
  color_accent = '#8B5CF6',
  is_active = true
WHERE handle = 'minh_ai';

UPDATE bots SET
  tagline = 'Theo dõi startup & đầu tư | Data-driven insights',
  category = 'business',
  color_accent = '#F97316',
  is_active = true
WHERE handle = 'lan_startup';

UPDATE bots SET
  tagline = 'Reviewer công nghệ | Thẳng thắn & Thực tế',
  category = 'gadgets',
  color_accent = '#06B6D4',
  is_active = true
WHERE handle = 'nam_gadget';

-- Insert 6 new bots
INSERT INTO bots (id, name, handle, avatar_url, color_accent, expertise, system_prompt, tagline, category, is_active, followers_count, posts_count)
VALUES
  (
    'b1000000-0000-0000-0000-000000000004',
    'Hùng Crypto',
    'hung_crypto',
    NULL,
    '#F59E0B',
    ARRAY['Bitcoin', 'Ethereum', 'DeFi', 'NFT', 'Web3', 'Trading'],
    'Bạn là Hùng Crypto - chuyên gia crypto/Web3 trên nền tảng tin tức Facebot.',
    'Crypto trader | Web3 builder | DYOR advocate',
    'crypto',
    true,
    780, 31
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'Mai Finance',
    'mai_finance',
    NULL,
    '#10B981',
    ARRAY['Chứng khoán', 'Macro', 'FED', 'VN-Index', 'Bonds', 'Gold'],
    'Bạn là Mai Finance - chuyên gia tài chính/chứng khoán trên nền tảng tin tức Facebot.',
    'Phân tích tài chính | Macro & Micro insights',
    'finance',
    true,
    1560, 45
  ),
  (
    'b1000000-0000-0000-0000-000000000006',
    'Tuấn Esports',
    'tuan_esports',
    NULL,
    '#EC4899',
    ARRAY['Esports', 'League of Legends', 'Valorant', 'Mobile Legends', 'Streaming'],
    'Bạn là Tuấn Esports - chuyên gia gaming/esports trên nền tảng tin tức Facebot.',
    'Esports enthusiast | Game analyst | Drama tracker',
    'gaming',
    true,
    3200, 67
  ),
  (
    'b1000000-0000-0000-0000-000000000007',
    'Linh Lifestyle',
    'linh_lifestyle',
    NULL,
    '#A855F7',
    ARRAY['Viral Trends', 'Social Media', 'Pop Culture', 'Memes', 'TikTok'],
    'Bạn là Linh Lifestyle - chuyên gia trends/lifestyle trên nền tảng tin tức Facebot.',
    'Trend spotter | Viral tracker | Culture observer',
    'lifestyle',
    true,
    4500, 89
  ),
  (
    'b1000000-0000-0000-0000-000000000008',
    'Đức Security',
    'duc_security',
    NULL,
    '#EF4444',
    ARRAY['Cybersecurity', 'Hacking', 'Privacy', 'Data Breaches', 'Malware'],
    'Bạn là Đức Security - chuyên gia cybersecurity trên nền tảng tin tức Facebot.',
    'Cybersecurity analyst | Threat hunter | Privacy advocate',
    'security',
    true,
    920, 28
  ),
  (
    'b1000000-0000-0000-0000-000000000009',
    'An Politics',
    'an_politics',
    NULL,
    '#6B7280',
    ARRAY['Chính trị', 'Chính sách', 'Quan hệ quốc tế', 'Xã hội', 'Luật pháp'],
    'Bạn là An Politics - chuyên gia chính trị/xã hội trên nền tảng tin tức Facebot.',
    'Chính trị & Xã hội | Fact-based analysis | Trung lập',
    'politics',
    true,
    670, 34
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  category = EXCLUDED.category,
  color_accent = EXCLUDED.color_accent;

-- Create bot_relationships table
CREATE TABLE IF NOT EXISTS bot_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  related_bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('ally', 'rival', 'respects')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bot_id, related_bot_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_bot_relationships_bot ON bot_relationships(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_relationships_type ON bot_relationships(relationship_type);

-- RLS for bot_relationships
ALTER TABLE bot_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bot_relationships" ON bot_relationships FOR SELECT USING (true);
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
-- ═══════════════════════════════════════════════════════════════
-- Migration 011: Gamification System
-- ═══════════════════════════════════════════════════════════════

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  likes_given INTEGER DEFAULT 0,
  comments_made INTEGER DEFAULT 0,
  first_comments INTEGER DEFAULT 0,
  bot_replies_received INTEGER DEFAULT 0,
  unique_bots_interacted INTEGER DEFAULT 0,
  posts_viewed INTEGER DEFAULT 0,
  predictions_made INTEGER DEFAULT 0,
  predictions_correct INTEGER DEFAULT 0,
  prediction_streak INTEGER DEFAULT 0,
  verified_reports INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_stats_points ON user_stats(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_streak ON user_stats(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_level ON user_stats(current_level DESC);

-- Point transactions
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_action ON point_transactions(action);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Predictions
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  options JSONB NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved')),
  correct_option TEXT,
  resolved_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ NOT NULL,
  total_participants INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status, closes_at);
CREATE INDEX IF NOT EXISTS idx_predictions_category ON predictions(category);

-- User predictions
CREATE TABLE IF NOT EXISTS user_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  confidence INTEGER DEFAULT 5 CHECK (confidence >= 1 AND confidence <= 10),
  result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'correct', 'wrong')),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prediction_id)
);

CREATE INDEX IF NOT EXISTS idx_user_predictions_user ON user_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_prediction ON user_predictions(prediction_id);

-- Reactions table (expanded)
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- Helper function: increment user stat
CREATE OR REPLACE FUNCTION increment_user_stat(
  p_user_id UUID,
  p_stat TEXT
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'UPDATE user_stats SET %I = COALESCE(%I, 0) + 1, updated_at = NOW() WHERE user_id = $1',
    p_stat, p_stat
  ) USING p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function: increment prediction votes
CREATE OR REPLACE FUNCTION increment_prediction_votes(
  p_id UUID,
  opt_id TEXT
)
RETURNS VOID AS $$
DECLARE
  v_options JSONB;
BEGIN
  SELECT options INTO v_options FROM predictions WHERE id = p_id;

  v_options := (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'id' = opt_id
        THEN jsonb_set(elem, '{voteCount}', to_jsonb(COALESCE((elem->>'voteCount')::int, 0) + 1))
        ELSE elem
      END
    )
    FROM jsonb_array_elements(v_options) elem
  );

  UPDATE predictions
  SET
    options = v_options,
    total_participants = total_participants + 1
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
