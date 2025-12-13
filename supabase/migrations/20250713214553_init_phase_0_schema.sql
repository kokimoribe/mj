-- Phase 0: Basic Ratings Database Schema
-- Riichi Mahjong League - Infrastructure as Code Implementation

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMERATED TYPES
-- ============================================================================

-- Wind assignments (physical seating positions)
CREATE TYPE riichi_seat AS ENUM ('east', 'south', 'west', 'north');

-- Hand outcomes for future Phase 1 implementation
CREATE TYPE event_type AS ENUM (
  'tsumo',           -- self‑draw win
  'ron',             -- win on discard  
  'draw',            -- exhaustive draw (流局 ryūkyoku)
  'abortive_draw',   -- abortive draw (途中流局 tochuu ryuukyoku)
  'chombo'           -- penalty hand
);

-- Game lifecycle status
CREATE TYPE game_status AS ENUM ('scheduled', 'ongoing', 'finished', 'cancelled');

-- Table assignment types for Phase 2
CREATE TYPE table_type AS ENUM ('automatic', 'manual');

-- ============================================================================
-- SOURCE TABLES (Season-Agnostic Data)
-- ============================================================================

-- Players table: Core player profiles
CREATE TABLE players (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name              TEXT UNIQUE NOT NULL,
  auth_user_id              UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Contact info for scheduling (Phase 2)
  email                     TEXT,
  phone                     TEXT,
  timezone                  TEXT DEFAULT 'America/Los_Angeles',
  
  -- Preferences
  notification_preferences  JSONB DEFAULT '{"email": true, "push": true}',
  
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- Games table: Season-agnostic game sessions
CREATE TABLE games (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Game timing (no season reference - determined at query time)
  started_at      TIMESTAMPTZ NOT NULL,
  finished_at     TIMESTAMPTZ,
  status          game_status DEFAULT 'ongoing',
  
  -- Scheduling (Phase 2)
  scheduled_at    TIMESTAMPTZ,
  table_type      table_type DEFAULT 'automatic',
  location        TEXT DEFAULT 'Host House',
  
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Game seats: Player-to-seat assignments with final scores
CREATE TABLE game_seats (
  game_id         UUID REFERENCES games(id) ON DELETE CASCADE,
  seat            riichi_seat NOT NULL,
  player_id       UUID REFERENCES players(id) ON DELETE RESTRICT,
  final_score     INTEGER,  -- Raw final score (e.g., 48100), null if ongoing
  
  PRIMARY KEY (game_id, seat),
  UNIQUE (game_id, player_id)
);

-- ============================================================================
-- CONFIGURATION SYSTEM (Phase 0.5)
-- ============================================================================

-- Rating configurations: Hash-based configuration storage
CREATE TABLE rating_configurations (
  config_hash     TEXT PRIMARY KEY,  -- SHA-256 of config JSON
  config_data     JSONB NOT NULL,    -- The actual configuration
  name            TEXT,              -- e.g., "Winter 2024", "Experimental High Stakes"
  description     TEXT,              -- Human-readable description
  is_official     BOOLEAN DEFAULT FALSE,  -- Admin-controlled official seasons
  created_by      UUID REFERENCES players(id),  -- Who created this config
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_used_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DERIVED TABLES (Configuration-Driven Cache)
-- ============================================================================

-- Cached player ratings: OpenSkill ratings and statistics per configuration
CREATE TABLE cached_player_ratings (
  config_hash         TEXT REFERENCES rating_configurations(config_hash),
  player_id           UUID REFERENCES players(id),
  
  -- Time bounds for this calculation
  games_start_date    DATE NOT NULL,
  games_end_date      DATE NOT NULL,
  
  -- OpenSkill parameters (computed by Python)
  mu                  NUMERIC(8,4) NOT NULL,
  sigma               NUMERIC(8,4) NOT NULL,
  display_rating      NUMERIC(8,2) NOT NULL,  -- μ - k*σ
  
  -- Game statistics (computed by Python)
  games_played        INTEGER DEFAULT 0,
  total_plus_minus    INTEGER DEFAULT 0,
  best_game_plus      INTEGER,
  worst_game_minus    INTEGER,
  
  -- Streak tracking (computed by Python)
  longest_first_streak       INTEGER DEFAULT 0,
  longest_fourth_free_streak INTEGER DEFAULT 0,
  
  -- Decay tracking
  last_game_date             TIMESTAMPTZ,
  last_decay_applied         TIMESTAMPTZ,
  
  -- Performance statistics (computed by Python)
  tsumo_rate          NUMERIC(5,4),   -- % of hands won by tsumo
  ron_rate            NUMERIC(5,4),   -- % of hands won by ron
  riichi_rate         NUMERIC(5,4),   -- % of hands with riichi declared
  deal_in_rate        NUMERIC(5,4),   -- % of hands where dealt into others
  
  -- Cache metadata
  computed_at         TIMESTAMPTZ DEFAULT NOW(),
  source_data_hash    TEXT NOT NULL,  -- Hash of input game data for cache invalidation
  
  PRIMARY KEY (config_hash, player_id, games_start_date, games_end_date)
);

-- Cached game results: Processed game outcomes with oka/uma per configuration
CREATE TABLE cached_game_results (
  config_hash     TEXT REFERENCES rating_configurations(config_hash),
  game_id         UUID REFERENCES games(id),
  player_id       UUID REFERENCES players(id),
  seat            riichi_seat NOT NULL,
  
  -- Computed by Python function using configuration
  final_score     INTEGER NOT NULL,
  placement       INTEGER NOT NULL CHECK (placement BETWEEN 1 AND 4),
  plus_minus      INTEGER NOT NULL,  -- oka/uma applied per config
  rating_weight   NUMERIC(4,2),     -- for OpenSkill calculation
  
  -- Rating changes from this game
  mu_before       NUMERIC(8,4),
  sigma_before    NUMERIC(8,4),
  mu_after        NUMERIC(8,4),
  sigma_after     NUMERIC(8,4),
  
  -- Cache metadata
  computed_at     TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (config_hash, game_id, player_id),
  UNIQUE (config_hash, game_id, seat)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Players indexes
CREATE INDEX idx_players_display_name ON players(display_name);
CREATE INDEX idx_players_auth_user ON players(auth_user_id);

-- Games indexes
CREATE INDEX idx_games_finished_at ON games(finished_at);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_started_at ON games(started_at);

-- Game seats indexes
CREATE INDEX idx_game_seats_player ON game_seats(player_id);
CREATE INDEX idx_game_seats_game ON game_seats(game_id);

-- Rating configurations indexes
CREATE INDEX idx_rating_configs_official ON rating_configurations(is_official, last_used_at);
CREATE INDEX idx_rating_configs_creator ON rating_configurations(created_by, created_at);

-- Cached ratings indexes
CREATE INDEX idx_cached_ratings_config ON cached_player_ratings(config_hash, display_rating DESC);
CREATE INDEX idx_cached_ratings_player ON cached_player_ratings(player_id, computed_at);
CREATE INDEX idx_cached_ratings_hash ON cached_player_ratings(source_data_hash);

-- Cached results indexes
CREATE INDEX idx_cached_game_results_config ON cached_game_results(config_hash, game_id);
CREATE INDEX idx_cached_game_results_player ON cached_game_results(config_hash, player_id, computed_at);

-- ============================================================================
-- CURRENT LEADERBOARD VIEW
-- ============================================================================

-- Dynamic view for fast leaderboard queries
CREATE OR REPLACE VIEW current_leaderboard AS
SELECT
  p.display_name,
  cpr.display_rating,
  cpr.games_played,
  (rc.config_data->'qualification'->>'minGames')::INTEGER AS min_games_qualify,
  cpr.games_played >= (rc.config_data->'qualification'->>'minGames')::INTEGER AS qualified,
  cpr.total_plus_minus,
  ROUND(cpr.total_plus_minus::NUMERIC / GREATEST(cpr.games_played, 1), 1) AS avg_plus_minus,
  cpr.tsumo_rate,
  cpr.ron_rate,
  cpr.riichi_rate,
  cpr.deal_in_rate,
  cpr.longest_first_streak,
  cpr.longest_fourth_free_streak,
  cpr.last_game_date,
  
  -- Activity status (computed real-time)
  CASE
    WHEN cpr.last_game_date < NOW() - INTERVAL '14 days' THEN 'inactive'
    WHEN cpr.last_game_date < NOW() - INTERVAL '7 days' THEN 'declining'
    ELSE 'active'
  END AS activity_status,
  
  -- Metadata
  cpr.config_hash,
  cpr.computed_at
FROM cached_player_ratings cpr
JOIN players p ON cpr.player_id = p.id
JOIN rating_configurations rc ON cpr.config_hash = rc.config_hash
WHERE rc.is_official = true
ORDER BY cpr.display_rating DESC;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_game_results ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be expanded as needed)

-- Players: Users can read all player profiles, but only update their own
CREATE POLICY "Players are viewable by everyone" 
  ON players FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON players FOR UPDATE 
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile" 
  ON players FOR INSERT 
  WITH CHECK (auth.uid() = auth_user_id);

-- Games: All users can view finished games
CREATE POLICY "Finished games are viewable by everyone" 
  ON games FOR SELECT 
  USING (status = 'finished');

-- Game seats: All users can view game seat data
CREATE POLICY "Game seats are viewable by everyone" 
  ON game_seats FOR SELECT 
  USING (true);

-- Rating configurations: All users can view, only authenticated users can create
CREATE POLICY "Rating configs are viewable by everyone" 
  ON rating_configurations FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create configs" 
  ON rating_configurations FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Cached data: All users can view cached ratings and results
CREATE POLICY "Cached ratings are viewable by everyone" 
  ON cached_player_ratings FOR SELECT 
  USING (true);

CREATE POLICY "Cached results are viewable by everyone" 
  ON cached_game_results FOR SELECT 
  USING (true);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at columns
CREATE TRIGGER update_players_updated_at 
  BEFORE UPDATE ON players 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at 
  BEFORE UPDATE ON games 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Insert default Winter 2024 configuration
INSERT INTO rating_configurations (
  config_hash,
  config_data,
  name,
  description,
  is_official
) VALUES (
  'default_winter_2024_v1',  -- Simple hash for initial setup
  '{
    "timeRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-03-31",
      "name": "Winter 2024"
    },
    "rating": {
      "initialMu": 25.0,
      "initialSigma": 8.33,
      "confidenceFactor": 2.0,
      "decayRate": 0.02
    },
    "scoring": {
      "oka": 20000,
      "uma": [10000, 5000, -5000, -10000]
    },
    "weights": {
      "divisor": 40,
      "min": 0.5,
      "max": 1.5
    },
    "qualification": {
      "minGames": 8,
      "dropWorst": 2
    }
  }'::jsonb,
  'Winter 2024',
  'Official Winter 2024 season configuration with standard EMA rules',
  true
);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE players IS 'Core player profiles - season agnostic';
COMMENT ON TABLE games IS 'Game sessions without embedded season configuration';
COMMENT ON TABLE game_seats IS 'Player seating assignments and final scores';
COMMENT ON TABLE rating_configurations IS 'Hash-based configuration storage for flexible rating system experiments';
COMMENT ON TABLE cached_player_ratings IS 'Computed player ratings and statistics per configuration - can be regenerated';
COMMENT ON TABLE cached_game_results IS 'Processed game outcomes with configuration-specific oka/uma - can be regenerated';

COMMENT ON COLUMN players.auth_user_id IS 'Links to Supabase auth system, nullable for admin-created players';
COMMENT ON COLUMN games.started_at IS 'Game start time - used for season determination via configuration time ranges';
COMMENT ON COLUMN game_seats.final_score IS 'Raw final score (e.g., 48100) - oka/uma applied per configuration';
COMMENT ON COLUMN rating_configurations.config_hash IS 'SHA-256 of normalized config JSON for cache invalidation';
COMMENT ON COLUMN cached_player_ratings.source_data_hash IS 'Hash of source game data for smart cache invalidation';

-- Schema initialization complete