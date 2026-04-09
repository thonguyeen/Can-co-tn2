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
