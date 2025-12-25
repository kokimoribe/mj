-- Add game format enum type for different game lengths
-- hanchan: East + South rounds (8 hands minimum)
-- tonpuusen: East round only (4 hands minimum)
CREATE TYPE game_format AS ENUM ('hanchan', 'tonpuusen');

-- Add game_format column with default to hanchan (most common format)
ALTER TABLE games ADD COLUMN game_format game_format DEFAULT 'hanchan';

-- Add index for filtering games by format
CREATE INDEX idx_games_format ON games(game_format);

-- Add comment for documentation
COMMENT ON COLUMN games.game_format IS 'Game length format: hanchan (East+South) or tonpuusen (East only)';

