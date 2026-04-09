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
