-- Phase 1: Hand-by-Hand Game Recording
-- Adds hand_events table and updates RLS policies for game recording

-- ============================================================================
-- HAND EVENTS TABLE
-- ============================================================================

-- Hand-by-hand tracking for detailed game recording
CREATE TABLE hand_events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id          UUID REFERENCES games(id) ON DELETE CASCADE,
  hand_seq         SMALLINT NOT NULL,
  seat             riichi_seat NOT NULL,
  event_type       event_type NOT NULL,
  riichi_declared  BOOLEAN NOT NULL DEFAULT FALSE,
  points_delta     INTEGER NOT NULL,
  pot_delta        INTEGER NOT NULL DEFAULT 0,
  round_kanji      CHAR(1) NOT NULL CHECK (round_kanji IN ('E','S','W','N')),
  kyoku            SMALLINT NOT NULL CHECK (kyoku BETWEEN 1 AND 4),
  honba            SMALLINT NOT NULL DEFAULT 0,
  details          JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (game_id, hand_seq, seat)
);

-- Details JSONB structure:
-- {
--   "han": number,
--   "fu": number,
--   "yakuList": string[],
--   "dealerId": uuid,
--   "loserId": uuid (for ron only),
--   "riichiSticks": number (riichi sticks on table before hand),
--   "isDealer": boolean
-- }

COMMENT ON TABLE hand_events IS 'Hand-by-hand game logs for detailed tracking - Phase 1';
COMMENT ON COLUMN hand_events.hand_seq IS 'Sequential hand number within a game (1, 2, 3...)';
COMMENT ON COLUMN hand_events.seat IS 'Physical seat position of the player this event affects';
COMMENT ON COLUMN hand_events.event_type IS 'Type of hand result: tsumo, ron, draw, abortive_draw, chombo';
COMMENT ON COLUMN hand_events.riichi_declared IS 'Whether this player declared riichi this hand';
COMMENT ON COLUMN hand_events.points_delta IS 'Points gained or lost by this player in this hand';
COMMENT ON COLUMN hand_events.pot_delta IS 'Change to riichi stick pot (usually 0 or -1000 for riichi declaration)';
COMMENT ON COLUMN hand_events.round_kanji IS 'Current round: E(ast), S(outh), W(est), N(orth)';
COMMENT ON COLUMN hand_events.kyoku IS 'Dealer rotation within round (1-4)';
COMMENT ON COLUMN hand_events.honba IS 'Number of consecutive dealer wins/draws';
COMMENT ON COLUMN hand_events.details IS 'Additional details: han, fu, yaku list, dealer/loser IDs';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_hand_events_game ON hand_events(game_id);
CREATE INDEX idx_hand_events_game_seq ON hand_events(game_id, hand_seq);
CREATE INDEX idx_hand_events_seat ON hand_events(seat);

-- ============================================================================
-- ROW LEVEL SECURITY FOR HAND EVENTS
-- ============================================================================

ALTER TABLE hand_events ENABLE ROW LEVEL SECURITY;

-- Anyone can view hand events
CREATE POLICY "Hand events are viewable by everyone" 
  ON hand_events FOR SELECT 
  USING (true);

-- Authenticated users can insert hand events
CREATE POLICY "Authenticated users can record hands" 
  ON hand_events FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update hand events
CREATE POLICY "Authenticated users can update hands" 
  ON hand_events FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Authenticated users can delete hand events (for corrections)
CREATE POLICY "Authenticated users can delete hands" 
  ON hand_events FOR DELETE 
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- UPDATE EXISTING RLS POLICIES FOR GAMES AND GAME_SEATS
-- ============================================================================

-- Drop existing restrictive policies on games
DROP POLICY IF EXISTS "Finished games are viewable by everyone" ON games;

-- Games: All users can view all games (not just finished)
CREATE POLICY "Games are viewable by everyone" 
  ON games FOR SELECT 
  USING (true);

-- Games: Authenticated users can create games
CREATE POLICY "Authenticated users can create games" 
  ON games FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Games: Authenticated users can update games
CREATE POLICY "Authenticated users can update games" 
  ON games FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Game seats: Authenticated users can insert
CREATE POLICY "Authenticated users can create game seats" 
  ON game_seats FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Game seats: Authenticated users can update (for final scores)
CREATE POLICY "Authenticated users can update game seats" 
  ON game_seats FOR UPDATE 
  USING (auth.role() = 'authenticated');

