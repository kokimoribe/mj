-- Migration: Allow anonymous game creation for development/testing
-- Removes the authenticated-only restriction from game creation policies

-- ============================================================================
-- UPDATE GAMES POLICIES
-- ============================================================================

-- Drop the authenticated-only policies and any existing anonymous policies
DROP POLICY IF EXISTS "Authenticated users can create games" ON games;
DROP POLICY IF EXISTS "Authenticated users can update games" ON games;
DROP POLICY IF EXISTS "Anyone can create games" ON games;
DROP POLICY IF EXISTS "Anyone can update games" ON games;

-- Allow anyone to create new games (for local development without auth)
CREATE POLICY "Anyone can create games" 
  ON games FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to update games (for recording scores, finishing games)
CREATE POLICY "Anyone can update games" 
  ON games FOR UPDATE 
  USING (true);

-- ============================================================================
-- UPDATE GAME_SEATS POLICIES
-- ============================================================================

-- Drop the authenticated-only policies and any existing anonymous policies
DROP POLICY IF EXISTS "Authenticated users can create game seats" ON game_seats;
DROP POLICY IF EXISTS "Authenticated users can update game seats" ON game_seats;
DROP POLICY IF EXISTS "Anyone can insert game seats" ON game_seats;
DROP POLICY IF EXISTS "Anyone can update game seats" ON game_seats;

-- Allow inserting game seats when creating a game
CREATE POLICY "Anyone can insert game seats" 
  ON game_seats FOR INSERT 
  WITH CHECK (true);

-- Allow updating game seats (for recording final scores)
CREATE POLICY "Anyone can update game seats" 
  ON game_seats FOR UPDATE 
  USING (true);

-- ============================================================================
-- UPDATE HAND_EVENTS POLICIES
-- ============================================================================

-- Drop the authenticated-only policies and any existing anonymous policies
DROP POLICY IF EXISTS "Authenticated users can record hands" ON hand_events;
DROP POLICY IF EXISTS "Authenticated users can update hands" ON hand_events;
DROP POLICY IF EXISTS "Authenticated users can delete hands" ON hand_events;
DROP POLICY IF EXISTS "Anyone can record hands" ON hand_events;
DROP POLICY IF EXISTS "Anyone can update hands" ON hand_events;
DROP POLICY IF EXISTS "Anyone can delete hands" ON hand_events;

-- Allow anyone to record hands
CREATE POLICY "Anyone can record hands" 
  ON hand_events FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to update hands
CREATE POLICY "Anyone can update hands" 
  ON hand_events FOR UPDATE 
  USING (true);

-- Allow anyone to delete hands (for corrections)
CREATE POLICY "Anyone can delete hands" 
  ON hand_events FOR DELETE 
  USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Anyone can create games" ON games IS 
  'Allows game creation without authentication. For production, consider requiring auth.';

COMMENT ON POLICY "Anyone can update games" ON games IS 
  'Allows updating game status without authentication. For production, consider requiring auth.';
