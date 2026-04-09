-- ═══════════════════════════════════════════════════════════════
-- PHASE 13: OPENCLAW MULTI-CHANNEL INTEGRATION
-- ═══════════════════════════════════════════════════════════════

-- User channel links
CREATE TABLE IF NOT EXISTS user_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- whatsapp, telegram, discord, imessage
  channel_id TEXT NOT NULL, -- Phone number, chat ID, etc.
  channel_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  subscriptions TEXT[] DEFAULT ARRAY['all'],
  preferences JSONB DEFAULT '{
    "breakingNews": true,
    "dailyDigest": true,
    "digestTime": "07:00",
    "achievements": true,
    "predictions": true,
    "botReplies": true,
    "language": "vi"
  }',
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_user_channels_user ON user_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_channels_channel ON user_channels(channel, channel_id);
CREATE INDEX IF NOT EXISTS idx_user_channels_verified ON user_channels(is_verified);

-- Channel link requests (verification codes)
CREATE TABLE IF NOT EXISTS channel_link_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  channel_id TEXT,
  verification_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, verified, expired
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_requests_code ON channel_link_requests(channel, verification_code, status);
CREATE INDEX IF NOT EXISTS idx_link_requests_expires ON channel_link_requests(expires_at);

-- Push logs
CREATE TABLE IF NOT EXISTS push_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- breaking_news, daily_digest, achievement, etc.
  reference_id TEXT,
  recipients_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_logs_type ON push_logs(type, created_at DESC);

-- Conversation sessions (for multi-turn bot chats)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  bot_handle TEXT,
  messages JSONB DEFAULT '[]',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_channel ON chat_sessions(channel, channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);

-- User predictions table (if not exists)
CREATE TABLE IF NOT EXISTS user_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL,
  selected_option TEXT NOT NULL,
  confidence INTEGER DEFAULT 5 CHECK (confidence >= 1 AND confidence <= 10),
  points_earned INTEGER DEFAULT 0,
  source TEXT DEFAULT 'web', -- web, openclaw
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prediction_id)
);

CREATE INDEX IF NOT EXISTS idx_user_predictions_user ON user_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_prediction ON user_predictions(prediction_id);

-- User achievements table (if not exists)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Add bot_interactions stat to user_stats (if column doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stats' AND column_name = 'bot_interactions'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN bot_interactions INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add weekly_points to user_stats (if column doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stats' AND column_name = 'weekly_points'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN weekly_points INTEGER DEFAULT 0;
  END IF;
END $$;

-- Function to increment prediction vote count
CREATE OR REPLACE FUNCTION increment_prediction_vote(
  p_prediction_id UUID,
  p_option_id TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE predictions
  SET
    total_participants = COALESCE(total_participants, 0) + 1,
    options = (
      SELECT jsonb_agg(
        CASE
          WHEN (opt->>'id') = p_option_id THEN
            opt || jsonb_build_object('vote_count', COALESCE((opt->>'vote_count')::int, 0) + 1)
          ELSE opt
        END
      )
      FROM jsonb_array_elements(options) AS opt
    )
  WHERE id = p_prediction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired link requests
CREATE OR REPLACE FUNCTION clean_expired_link_requests()
RETURNS void AS $$
BEGIN
  UPDATE channel_link_requests
  SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'pending';
END;
$$ LANGUAGE plpgsql;
