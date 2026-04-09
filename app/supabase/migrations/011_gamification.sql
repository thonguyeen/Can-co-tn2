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
