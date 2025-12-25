-- Migration: Add RLS policies for game creation and recording
-- This allows the web app to create new games and record hands

-- ============================================================================
-- UPDATE GAMES SELECT POLICY
-- ============================================================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Finished games are viewable by everyone" ON games;
DROP POLICY IF EXISTS "Games are viewable by everyone" ON games;

-- Create a more permissive select policy that allows viewing all games
CREATE POLICY "Games are viewable by everyone" 
  ON games FOR SELECT 
  USING (true);

-- ============================================================================
-- GAMES INSERT/UPDATE POLICIES
-- ============================================================================

-- Allow anyone to create new games (for game recording feature)
-- In production, you might want to restrict this to authenticated users
CREATE POLICY "Anyone can create games" 
  ON games FOR INSERT 
  WITH CHECK (true);

-- Allow updating games (for recording scores, finishing games)
CREATE POLICY "Anyone can update games" 
  ON games FOR UPDATE 
  USING (true);

-- ============================================================================
-- GAME_SEATS INSERT/UPDATE POLICIES
-- ============================================================================

-- Allow inserting game seats when creating a game
CREATE POLICY "Anyone can insert game seats" 
  ON game_seats FOR INSERT 
  WITH CHECK (true);

-- Allow updating game seats (for recording final scores)
CREATE POLICY "Anyone can update game seats" 
  ON game_seats FOR UPDATE 
  USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Games are viewable by everyone" ON games IS 
  'All games (ongoing and finished) are publicly viewable';

COMMENT ON POLICY "Anyone can create games" ON games IS 
  'Allows game creation from the web app. Consider restricting to authenticated users in production.';

COMMENT ON POLICY "Anyone can update games" ON games IS 
  'Allows updating game status and timestamps for game recording.';

COMMENT ON POLICY "Anyone can insert game seats" ON game_seats IS 
  'Allows assigning players to seats when creating a game.';

COMMENT ON POLICY "Anyone can update game seats" ON game_seats IS 
  'Allows recording final scores for game seats.';
