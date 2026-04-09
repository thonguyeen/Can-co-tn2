-- ═══════════════════════════════════════════════════════
-- CẦN & CÓ: Intent Layer
-- Adds intent + matching + trust on top of FACEBOT social schema
-- ═══════════════════════════════════════════════════════

-- Extend profiles table with trust fields (FACEBOT uses 'profiles' not 'users')
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verification_level VARCHAR(20) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(15);

-- Intents (the core table — replaces both "posts" and "listings")
CREATE TABLE IF NOT EXISTS public.intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Intent type
  type VARCHAR(10) NOT NULL CHECK (type IN ('CAN', 'CO')),

  -- Content
  raw_text TEXT NOT NULL,
  title VARCHAR(300),

  -- Structured data (AI-parsed from raw_text)
  parsed_data JSONB NOT NULL DEFAULT '{}',

  -- Category
  category VARCHAR(100) NOT NULL DEFAULT 'real_estate',
  subcategory VARCHAR(100) DEFAULT 'apartment',

  -- Value
  price BIGINT,
  price_min BIGINT,
  price_max BIGINT,

  -- Location
  address TEXT,
  district VARCHAR(100),
  ward VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Hồ Chí Minh',
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),

  -- Trust & Verification
  trust_score INT DEFAULT 1,
  verification_level VARCHAR(20) DEFAULT 'none',

  -- Social metrics
  comment_count INT DEFAULT 0,
  match_count INT DEFAULT 0,
  view_count INT DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'active',
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intent images (for CÓ posts)
CREATE TABLE IF NOT EXISTS public.intent_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID NOT NULL REFERENCES public.intents(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intent embeddings (for AI matching)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS public.intent_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID NOT NULL UNIQUE REFERENCES public.intents(id) ON DELETE CASCADE,
  embedding vector(1536),
  text_input TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches (AI-generated: CẦN <-> CÓ)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  can_intent_id UUID NOT NULL REFERENCES public.intents(id),
  co_intent_id UUID NOT NULL REFERENCES public.intents(id),
  similarity DECIMAL(5,4),
  explanation TEXT,
  status VARCHAR(20) DEFAULT 'suggested',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(can_intent_id, co_intent_id)
);

-- Verifications (from NHA.AI, adapted)
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  intent_id UUID REFERENCES public.intents(id),
  type VARCHAR(30) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  data JSONB,
  image_url TEXT,
  gps_lat DECIMAL(10,8),
  gps_lng DECIMAL(11,8),
  gps_accuracy DECIMAL(10,2),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations (for direct chat A-B)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID REFERENCES public.intents(id),
  user_a UUID NOT NULL REFERENCES auth.users(id),
  user_b UUID NOT NULL REFERENCES auth.users(id),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(intent_id, user_a, user_b)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot comments (AI advisor comments on intents)
CREATE TABLE IF NOT EXISTS public.intent_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID NOT NULL REFERENCES public.intents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  bot_name VARCHAR(50),
  content TEXT NOT NULL,
  is_bot BOOLEAN DEFAULT FALSE,
  parent_id UUID REFERENCES public.intent_comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_intents_type ON intents(type);
CREATE INDEX IF NOT EXISTS idx_intents_status ON intents(status);
CREATE INDEX IF NOT EXISTS idx_intents_district ON intents(district);
CREATE INDEX IF NOT EXISTS idx_intents_category ON intents(category);
CREATE INDEX IF NOT EXISTS idx_intents_user ON intents(user_id);
CREATE INDEX IF NOT EXISTS idx_intents_price ON intents(price);
CREATE INDEX IF NOT EXISTS idx_matches_can ON matches(can_intent_id);
CREATE INDEX IF NOT EXISTS idx_matches_co ON matches(co_intent_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_intent_comments_intent ON intent_comments(intent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_verifications_user ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user_a, user_b);

-- Agent Memory
CREATE TABLE IF NOT EXISTS public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  memory_type VARCHAR(30) NOT NULL,
  content TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  source_intent_id UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bot_id, user_id, memory_type)
);
CREATE INDEX IF NOT EXISTS idx_agent_memory_bot_user ON agent_memory(bot_id, user_id);

-- Knowledge Graph
CREATE TABLE IF NOT EXISTS public.knowledge_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(30) NOT NULL,
  source_id VARCHAR(100) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  target_type VARCHAR(30) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  weight DECIMAL(5,4) DEFAULT 0.5,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_type, source_id, relation, target_type, target_id)
);
CREATE INDEX IF NOT EXISTS idx_kg_source ON knowledge_edges(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_kg_target ON knowledge_edges(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_kg_relation ON knowledge_edges(relation);

-- Agent Activity Log
CREATE TABLE IF NOT EXISTS public.agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id VARCHAR(50) NOT NULL,
  event VARCHAR(50) NOT NULL,
  intent_id UUID REFERENCES public.intents(id),
  action VARCHAR(50) NOT NULL,
  comment_id UUID REFERENCES public.intent_comments(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_agent_activity_bot ON agent_activity(bot_id);

-- ═══════════════════════════════════════════════════════
-- Realtime
-- ═══════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ═══════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_comments ENABLE ROW LEVEL SECURITY;

-- RLS: intents
CREATE POLICY "Active intents readable by all" ON public.intents
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "Authenticated can create intents" ON public.intents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update intents" ON public.intents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owner can delete intents" ON public.intents
  FOR DELETE USING (auth.uid() = user_id);

-- RLS: intent_images
CREATE POLICY "Intent images readable" ON public.intent_images
  FOR SELECT USING (true);
CREATE POLICY "Owner can manage images" ON public.intent_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM intents WHERE id = intent_id AND user_id = auth.uid())
  );

-- RLS: matches
CREATE POLICY "Match participants can read" ON public.matches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM intents WHERE id = can_intent_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM intents WHERE id = co_intent_id AND user_id = auth.uid())
  );

-- RLS: comments
CREATE POLICY "Comments readable by all" ON public.intent_comments
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can comment" ON public.intent_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_bot = true);

-- RLS: conversations + messages
CREATE POLICY "Participants read conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Authenticated create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_a);
CREATE POLICY "Participants read messages" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id
      AND (user_a = auth.uid() OR user_b = auth.uid()))
  );
CREATE POLICY "Participants send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id
      AND (user_a = auth.uid() OR user_b = auth.uid()))
  );
CREATE POLICY "Participants update messages" ON public.messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id
      AND (user_a = auth.uid() OR user_b = auth.uid()))
  );

-- RLS: notifications
CREATE POLICY "Own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System creates notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);
CREATE POLICY "User reads notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS: verifications
CREATE POLICY "Owner reads verifications" ON public.verifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner creates verifications" ON public.verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: embeddings
CREATE POLICY "Embeddings readable" ON public.intent_embeddings
  FOR SELECT USING (true);
CREATE POLICY "System manages embeddings" ON public.intent_embeddings
  FOR ALL USING (true);
