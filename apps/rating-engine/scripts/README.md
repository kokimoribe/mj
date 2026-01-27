# Rating Engine Scripts

This directory contains utility scripts for managing the rating engine, including data migration and configuration management.

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

## register_configs.py

Registers season YAML configuration files in the database by generating deterministic SHA256 hashes and upserting to the `rating_configurations` table.

### Quick Start

```bash
# From the rating-engine directory
cd apps/rating-engine

# Register specific config files
uv run python scripts/register_configs.py configs/season-4-v2.yaml configs/season-5.yaml

# Register all configs in the configs directory
uv run python scripts/register_configs.py --all

# Register a single config
uv run python scripts/register_configs.py configs/season-5.yaml
```

### Features

- ✅ **Deterministic Hashing** - SHA256 hash based on config content (timeRange, rating, scoring, weights, qualification)
- ✅ **Idempotent** - Safe to run multiple times (uses upsert)
- ✅ **Validation** - Checks for required fields before registration
- ✅ **Batch Support** - Can register multiple configs at once
- ✅ **Clear Output** - Shows config names and hashes

### How Configuration Hashes Work

The hash is generated from the normalized JSON of these fields only:

- `timeRange` - Season date range
- `rating` - OpenSkill parameters
- `scoring` - Oka/uma values
- `weights` - Margin-of-victory weights
- `qualification` - Qualification rules

**Metadata fields** (`name`, `description`, `isOfficial`, `version`, etc.) do **NOT** affect the hash. This means:

- You can update metadata without changing the hash
- Configs with identical parameters will have the same hash (useful for detecting duplicates)

### Requirements

1. **Database**: Phase 0 schema with `rating_configurations` table
2. **Environment**: `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `.env` file
3. **YAML Files**: Valid season configuration files in `configs/` directory

### Usage Examples

```bash
# Register new season configs
uv run python scripts/register_configs.py configs/season-4-v2.yaml configs/season-5.yaml

# Register all configs (useful after adding new seasons)
uv run python scripts/register_configs.py --all

# Register a single config
uv run python scripts/register_configs.py configs/season-5.yaml
```

### Output

The script provides:

- Real-time logging of each config being registered
- Summary table showing config names and their hashes
- Success/failure status for each registration

Example output:

```
✅ Connected to Supabase
📋 Loaded config: Season 4
✅ Config 'Season 4' registered: a1b2c3d4...
📋 Loaded config: Season 5
✅ Config 'Season 5' registered: e5f6g7h8...

============================================================
📊 Registration Summary
============================================================
  Season 4                        a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
  Season 5                        e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6
============================================================

✅ Successfully registered 2 configuration(s)
```

### When to Use

- **Adding new seasons**: After creating a new `season-X.yaml` file
- **Updating configs**: After modifying existing YAML files (will update database records)
- **Database sync**: Ensuring all configs in the repo are registered in the database
- **Verification**: Checking that configs are properly stored before materialization
