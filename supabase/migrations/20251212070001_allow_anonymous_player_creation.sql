-- Migration: Allow anonymous player creation for development/testing
-- Allows creating players without authentication, similar to game creation

-- ============================================================================
-- UPDATE PLAYERS POLICIES
-- ============================================================================

-- Drop the authenticated-only insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON players;

-- Allow anyone to create players (for local development without auth)
CREATE POLICY "Anyone can create players" 
  ON players FOR INSERT 
  WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Anyone can create players" ON players IS 
  'Allows player creation without authentication. For production, consider requiring auth.';

