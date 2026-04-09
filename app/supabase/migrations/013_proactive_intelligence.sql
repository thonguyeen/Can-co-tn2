-- ═══════════════════════════════════════════════════════════════
-- PHASE 14: PROACTIVE INTELLIGENCE
-- ═══════════════════════════════════════════════════════════════

-- User memories (persistent context)
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- fact, preference, interest, goal, etc.
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  confidence DECIMAL(3,2) DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  source TEXT DEFAULT 'conversation',
  access_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memories_user ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_type ON user_memories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_user_memories_importance ON user_memories(user_id, importance DESC);
CREATE INDEX IF NOT EXISTS idx_user_memories_expires ON user_memories(expires_at) WHERE expires_at IS NOT NULL;

-- User interests
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  score INTEGER DEFAULT 10 CHECK (score >= 0 AND score <= 100),
  interaction_count INTEGER DEFAULT 1,
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('rising', 'stable', 'declining')),
  related_topics TEXT[] DEFAULT '{}',
  sources TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_score ON user_interests(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_user_interests_category ON user_interests(user_id, category);
CREATE INDEX IF NOT EXISTS idx_user_interests_trend ON user_interests(trend);

-- User activity patterns
CREATE TABLE IF NOT EXISTS user_activity_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  hourly_activity INTEGER[] DEFAULT ARRAY[20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
  preferred_hours INTEGER[] DEFAULT ARRAY[9, 12, 19],
  quiet_hours JSONB DEFAULT '{"start": 23, "end": 7}',
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  last_notification_at TIMESTAMPTZ,
  notification_fatigue INTEGER DEFAULT 0 CHECK (notification_fatigue >= 0 AND notification_fatigue <= 100),
  response_rate DECIMAL(3,2) DEFAULT 0.5 CHECK (response_rate >= 0 AND response_rate <= 1),
  activity_count INTEGER DEFAULT 0,
  notifications_sent INTEGER DEFAULT 0,
  notifications_responded INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_patterns_user ON user_activity_patterns(user_id);

-- Alert triggers
CREATE TABLE IF NOT EXISTS alert_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  conditions JSONB NOT NULL,
  logic TEXT DEFAULT 'and' CHECK (logic IN ('and', 'or')),
  is_active BOOLEAN DEFAULT true,
  channel TEXT,
  cooldown_minutes INTEGER DEFAULT 60,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_triggers_user ON alert_triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_active ON alert_triggers(is_active) WHERE is_active = true;

-- Trigger alerts log
CREATE TABLE IF NOT EXISTS trigger_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trigger_id UUID REFERENCES alert_triggers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context JSONB,
  channel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trigger_alerts_trigger ON trigger_alerts(trigger_id);
CREATE INDEX IF NOT EXISTS idx_trigger_alerts_user ON trigger_alerts(user_id, created_at DESC);

-- Watchlist
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_id TEXT,
  keywords TEXT[] DEFAULT '{}',
  alert_on_mention BOOLEAN DEFAULT true,
  alert_on_breaking BOOLEAN DEFAULT true,
  alert_on_price_change DECIMAL(5,2),
  notes TEXT,
  last_mention_at TIMESTAMPTZ,
  mention_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_name)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_entity ON watchlist(entity_type, entity_name);
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts ON watchlist(alert_on_mention, alert_on_breaking);

-- Outreach log
CREATE TABLE IF NOT EXISTS outreach_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  bot_handle TEXT,
  content TEXT,
  channel TEXT,
  success BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_log_user ON outreach_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_log_type ON outreach_log(type, created_at DESC);

-- User insights (weekly summaries)
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- weekly_summary, interest_change, etc.
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_insights_user ON user_insights(user_id, created_at DESC);

-- User post interactions (for tracking what users have seen)
CREATE TABLE IF NOT EXISTS user_post_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  interaction_type TEXT NOT NULL, -- view, like, comment, share
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id, interaction_type)
);

CREATE INDEX IF NOT EXISTS idx_post_interactions_user ON user_post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post ON user_post_interactions(post_id);

-- Add notified flag to user_predictions if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_predictions' AND column_name = 'notified'
  ) THEN
    ALTER TABLE user_predictions ADD COLUMN notified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Function to get user's active hours
CREATE OR REPLACE FUNCTION get_user_active_hours(p_user_id UUID)
RETURNS INTEGER[] AS $$
DECLARE
  v_hours INTEGER[];
BEGIN
  SELECT hourly_activity INTO v_hours
  FROM user_activity_patterns
  WHERE user_id = p_user_id;

  IF v_hours IS NULL THEN
    -- Default active hours
    v_hours := ARRAY[20,20,20,20,20,20,40,60,70,70,60,70,60,50,50,50,60,70,80,70,50,30,10,5];
  END IF;

  RETURN v_hours;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is in quiet hours
CREATE OR REPLACE FUNCTION is_user_quiet_hours(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_quiet_hours JSONB;
  v_current_hour INTEGER;
  v_start INTEGER;
  v_end INTEGER;
BEGIN
  SELECT quiet_hours INTO v_quiet_hours
  FROM user_activity_patterns
  WHERE user_id = p_user_id;

  IF v_quiet_hours IS NULL THEN
    v_quiet_hours := '{"start": 23, "end": 7}'::JSONB;
  END IF;

  v_current_hour := EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::INTEGER;
  v_start := (v_quiet_hours->>'start')::INTEGER;
  v_end := (v_quiet_hours->>'end')::INTEGER;

  IF v_start < v_end THEN
    RETURN v_current_hour >= v_start AND v_current_hour < v_end;
  ELSE
    RETURN v_current_hour >= v_start OR v_current_hour < v_end;
  END IF;
END;
$$ LANGUAGE plpgsql;
