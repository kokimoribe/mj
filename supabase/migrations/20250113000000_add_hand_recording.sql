-- Hand Recording Feature - Database Schema
-- Phase 1 Implementation: Hand-by-hand game recording

-- ============================================================================
-- ENUMERATED TYPES
-- ============================================================================

-- Hand outcome types
CREATE TYPE hand_outcome AS ENUM (
  'ron',              -- Win on discard
  'tsumo',            -- Self-draw win
  'exhaustive_draw',  -- Normal draw (流局)
  'abortive_draw',    -- Special draw (途中流局)
  'double_ron',       -- Two players win
  'triple_ron',       -- Three players win
  'chombo'            -- Penalty
);

-- Wind rounds
CREATE TYPE wind_round AS ENUM ('east', 'south', 'west', 'north');

-- Action types for hand events
CREATE TYPE hand_action_type AS ENUM (
  'riichi',           -- Riichi declaration
  'win',              -- Winning (ron or tsumo)
  'deal_in',          -- Dealing into someone's win
  'payment',          -- Payment for tsumo
  'tenpai',           -- In tenpai at draw
  'not_tenpai',       -- Not in tenpai at draw
  'chombo_penalty',   -- Chombo penalty payment
  'honba_payment'     -- Honba stick payment
);

-- ============================================================================
-- HANDS TABLE - Core hand records
-- ============================================================================

CREATE TABLE hands (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id           UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  
  -- Round information
  hand_number       INTEGER NOT NULL CHECK (hand_number > 0),
  wind_round        wind_round NOT NULL,
  round_number      INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 4),
  honba_count       INTEGER NOT NULL DEFAULT 0 CHECK (honba_count >= 0),
  riichi_pot_before INTEGER NOT NULL DEFAULT 0 CHECK (riichi_pot_before >= 0),
  
  -- Outcome
  outcome_type      hand_outcome NOT NULL,
  dealer_seat       riichi_seat NOT NULL,
  
  -- Scores after this hand (snapshot for each player)
  scores_after      JSONB NOT NULL, -- {"player_id": score, ...}
  
  -- Metadata
  completed_at      TIMESTAMPTZ, -- NULL if incomplete/pending verification
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  created_by        UUID REFERENCES players(id),
  
  -- Constraints
  UNIQUE (game_id, hand_number)
);

-- ============================================================================
-- HAND ACTIONS TABLE - Detailed actions within each hand
-- ============================================================================

CREATE TABLE hand_actions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hand_id           UUID NOT NULL REFERENCES hands(id) ON DELETE CASCADE,
  player_id         UUID NOT NULL REFERENCES players(id),
  
  -- Action details
  action_type       hand_action_type NOT NULL,
  action_order      INTEGER NOT NULL CHECK (action_order > 0),
  points_delta      INTEGER, -- Points gained/lost
  riichi_stick_delta INTEGER DEFAULT 0, -- Riichi sticks gained/lost
  honba_stick_delta INTEGER DEFAULT 0, -- Honba payments
  
  -- Additional context
  target_player_id  UUID REFERENCES players(id), -- For deal_in actions
  details           JSONB, -- Flexible field for han, fu, yaku, etc.
  
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique action order per hand
  UNIQUE (hand_id, action_order)
);

-- ============================================================================
-- HAND SUMMARY VIEW - Simplified view for display
-- ============================================================================

CREATE OR REPLACE VIEW hand_summaries AS
SELECT 
  h.id,
  h.game_id,
  h.hand_number,
  h.wind_round,
  h.round_number,
  h.honba_count,
  h.outcome_type,
  h.dealer_seat,
  h.scores_after,
  h.completed_at,
  
  -- Extract winner(s) and key information
  CASE 
    WHEN h.outcome_type IN ('ron', 'tsumo') THEN
      (SELECT jsonb_build_object(
        'winner_id', ha.player_id,
        'winner_name', p.display_name,
        'points', ha.points_delta,
        'han', ha.details->>'han',
        'fu', ha.details->>'fu',
        'yaku', ha.details->'yaku'
      )
      FROM hand_actions ha
      JOIN players p ON ha.player_id = p.id
      WHERE ha.hand_id = h.id AND ha.action_type = 'win'
      LIMIT 1)
    WHEN h.outcome_type IN ('double_ron', 'triple_ron') THEN
      (SELECT jsonb_agg(jsonb_build_object(
        'winner_id', ha.player_id,
        'winner_name', p.display_name,
        'points', ha.points_delta
      ))
      FROM hand_actions ha
      JOIN players p ON ha.player_id = p.id
      WHERE ha.hand_id = h.id AND ha.action_type = 'win')
    ELSE NULL
  END AS winner_info,
  
  -- Riichi declarations
  (SELECT jsonb_agg(ha.player_id)
   FROM hand_actions ha
   WHERE ha.hand_id = h.id AND ha.action_type = 'riichi') AS riichi_players,
  
  -- Tenpai players (for draws)
  (SELECT jsonb_agg(ha.player_id)
   FROM hand_actions ha
   WHERE ha.hand_id = h.id AND ha.action_type = 'tenpai') AS tenpai_players,
   
  h.created_at,
  h.updated_at
FROM hands h;

-- ============================================================================
-- GAME HAND STATS - Aggregated statistics per game
-- ============================================================================

CREATE OR REPLACE VIEW game_hand_stats AS
SELECT
  g.id AS game_id,
  COUNT(h.id) AS total_hands,
  COUNT(CASE WHEN h.outcome_type = 'ron' THEN 1 END) AS ron_count,
  COUNT(CASE WHEN h.outcome_type = 'tsumo' THEN 1 END) AS tsumo_count,
  COUNT(CASE WHEN h.outcome_type = 'exhaustive_draw' THEN 1 END) AS draw_count,
  COUNT(CASE WHEN h.outcome_type = 'chombo' THEN 1 END) AS chombo_count,
  MAX(h.hand_number) AS last_hand_number,
  MAX(h.wind_round) AS last_wind_round,
  MAX(h.round_number) AS last_round_number,
  CASE 
    WHEN COUNT(h.id) = 0 THEN 'no_hands'
    WHEN COUNT(h.id) < 8 THEN 'partial'
    ELSE 'complete'
  END AS data_quality
FROM games g
LEFT JOIN hands h ON g.id = h.game_id
GROUP BY g.id;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Hands indexes
CREATE INDEX idx_hands_game_id ON hands(game_id, hand_number);
CREATE INDEX idx_hands_created_at ON hands(created_at DESC);
CREATE INDEX idx_hands_dealer ON hands(dealer_seat);
CREATE INDEX idx_hands_outcome ON hands(outcome_type);

-- Hand actions indexes
CREATE INDEX idx_hand_actions_hand_id ON hand_actions(hand_id, action_order);
CREATE INDEX idx_hand_actions_player_id ON hand_actions(player_id);
CREATE INDEX idx_hand_actions_type ON hand_actions(action_type);

-- ============================================================================
-- FUNCTIONS FOR HAND RECORDING
-- ============================================================================

-- Function to validate hand data consistency
CREATE OR REPLACE FUNCTION validate_hand_data(hand_data jsonb)
RETURNS boolean AS $$
DECLARE
  total_points_delta INTEGER;
  total_riichi_delta INTEGER;
BEGIN
  -- Check that points balance to zero
  SELECT SUM((action->>'points_delta')::INTEGER)
  INTO total_points_delta
  FROM jsonb_array_elements(hand_data->'actions') AS action
  WHERE action->>'points_delta' IS NOT NULL;
  
  IF total_points_delta != 0 THEN
    RAISE EXCEPTION 'Points do not balance to zero: %', total_points_delta;
  END IF;
  
  -- Check riichi sticks balance (except for wins where pot is collected)
  -- This is more complex and would need full implementation
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get next dealer after a hand
CREATE OR REPLACE FUNCTION get_next_dealer(
  current_dealer riichi_seat,
  outcome hand_outcome,
  dealer_won boolean
) RETURNS riichi_seat AS $$
BEGIN
  -- Dealer continues if they won or were tenpai in draw (based on rules)
  IF dealer_won OR outcome = 'chombo' THEN
    RETURN current_dealer;
  END IF;
  
  -- Otherwise rotate counter-clockwise
  RETURN CASE current_dealer
    WHEN 'east' THEN 'south'::riichi_seat
    WHEN 'south' THEN 'west'::riichi_seat
    WHEN 'west' THEN 'north'::riichi_seat
    WHEN 'north' THEN 'east'::riichi_seat
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE hand_actions ENABLE ROW LEVEL SECURITY;

-- Hands: Everyone can view, only authenticated can create/update
CREATE POLICY "Hands are viewable by everyone" 
  ON hands FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create hands" 
  ON hands FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow updates within 5 minute correction window
CREATE POLICY "Users can update recent hands" 
  ON hands FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    created_at > NOW() - INTERVAL '5 minutes'
  );

-- Hand actions: Similar policies
CREATE POLICY "Hand actions are viewable by everyone" 
  ON hand_actions FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create hand actions" 
  ON hand_actions FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update recent hand actions" 
  ON hand_actions FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    created_at > NOW() - INTERVAL '5 minutes'
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for hands
CREATE TRIGGER update_hands_updated_at 
  BEFORE UPDATE ON hands 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE hands IS 'Hand-by-hand game records for detailed game history';
COMMENT ON TABLE hand_actions IS 'Individual player actions within each hand';
COMMENT ON COLUMN hands.scores_after IS 'Snapshot of all player scores after this hand';
COMMENT ON COLUMN hands.completed_at IS 'NULL for incomplete/unverified hands';
COMMENT ON COLUMN hand_actions.details IS 'Flexible JSON for han, fu, yaku, notes, etc.';
COMMENT ON COLUMN hand_actions.target_player_id IS 'Used for deal_in to specify who won';