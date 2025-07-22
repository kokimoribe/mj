# Legacy Data Migration Scripts

This directory contains scripts for migrating legacy CSV game data into the Phase 0 database schema using the modern Supabase Python client.

## migrate_legacy_data.py

Transforms legacy CSV mahjong game logs into the Phase 0 database schema using the Supabase client API.

### Quick Start

```bash
# From the rating-engine directory
cd /Users/koki/workspace/mj/apps/rating-engine

# Run the migration (fully idempotent - safe to run multiple times)
uv run python scripts/migrate_legacy_data.py
```

### Features

- ✅ **Modern Supabase Client** - Uses official supabase-py library
- ✅ **Fully idempotent** - Safe to run multiple times
- ✅ **Deterministic UUIDs** - Consistent game IDs across runs
- ✅ Creates player records from legacy text names
- ✅ Converts CSV games to `games` + `game_seats` tables
- ✅ Creates Season 3 rating configuration
- ✅ Comprehensive logging and validation
- ✅ Proper error handling and cleanup
- ✅ **Table Truncation** - Cleans existing data before migration
- ✅ **Correct Timestamps** - Uses `played_at` for game times (not record timestamp)

### Requirements

1. **Database**: Phase 0 schema deployed via Supabase migrations
2. **Environment**: `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `.env` file
3. **CSV File**: `legacy_logs.csv` in project root with expected format:
   ```
   Timestamp,played_at,East player,East points,South player,South points,West player,West points,North player,North points
   ```

### Expected Results

For the current legacy data (102 games, 11 players):

- **11 player records** (Eric, Hyun, Jackie, Joseph, Josh, Justin, Koki, Mikey, Rayshone, Stephan, William)
- **102 game records** (all marked as 'finished')
- **408 game seat records** (4 per game)
- **1 rating configuration** (Season 3: legacy period)

### Usage

```bash
# Simple execution - truncates existing data and re-imports everything
uv run python scripts/migrate_legacy_data.py

# Keep existing player records (only truncate games/game_seats/player_ratings)
uv run python scripts/migrate_legacy_data.py --keep-players
```

The script will automatically:

1. Connect to Supabase using environment variables
2. Truncate existing game data (optionally keeping players)
3. Load the Season 3 configuration
4. Process the CSV file and create all necessary records
5. Report success with counts

### Idempotency & Safety

The script is **fully idempotent** using Supabase's built-in upsert functionality:

- **Players**: Looked up by display_name, created if not found
- **Games**: Uses deterministic UUIDs based on CSV content
- **Game Seats**: Uses Supabase conflict resolution
- **Rating Config**: Uses content hash for uniqueness

**Game ID Format**: Deterministic UUID5 based on played_at timestamp and sorted player names

### Configuration Created

The script creates the Season 3 rating configuration from `configs/season-3.yaml` with:

- **Modern Supabase Integration**: Uses official Python client
- **Content Hash**: Ensures configuration uniqueness
- **Proper Enum Handling**: Correctly maps to database schema
- **Error Recovery**: Graceful handling of connection issues

### Logging

- Real-time console output with emojis
- INFO level logging for key operations
- Detailed error messages with context
- Supabase client provides automatic request logging

### Architecture Benefits

- **Modern API**: Leverages Supabase's built-in features
- **Type Safety**: Better integration with Python type hints
- **Authentication**: Proper service role key usage
- **Maintainability**: Clean, readable code that's easy to extend
- **Performance**: Efficient batch operations with Supabase
