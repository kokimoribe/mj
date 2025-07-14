# Data Materialization System

## Overview

The data materialization system computes derived data (ratings, statistics) from source game logs and stores them in cached tables for fast access. The system is designed to be **idempotent** - running it multiple times with the same configuration and source data produces the same results.

## Architecture

### Core Components

1. **MaterializationEngine** (`src/rating_engine/materialization.py`)
   - Core computation logic
   - OpenSkill rating calculations
   - Statistics aggregation
   - Cache management

2. **Manual Script** (`scripts/materialize_data.py`)
   - Command-line interface for local execution
   - Development and testing tool
   - Manual override capabilities

3. **FastAPI Endpoints** (`src/rating_engine/main.py`)
   - HTTP API for remote execution
   - Integration with Vercel Edge Functions
   - Production webhook support

### Data Flow

```
Source Data (games, players, game_seats)
    ↓
Configuration (rating_configurations)
    ↓
Materialization Engine
    ↓
Derived Data (cached_player_ratings, cached_game_results)
```

## Configuration-Driven Processing

The system uses configuration hashes to determine what to compute:

1. **Configuration Hash**: SHA-256 of configuration JSON (sorted keys)
2. **Source Data Hash**: SHA-256 of relevant game data for cache invalidation
3. **Idempotent Operations**: Same config + same source data = same results

### Example: Season 3 Configuration

```yaml
# Season 3 Configuration
name: "Season 3"
timeRange:
  startDate: "2022-02-16"
  endDate: "2025-07-22"
rating:
  initialMu: 25.0
  initialSigma: 8.33
  confidenceFactor: 2.0
  decayRate: 0.02
scoring:
  oka: 20000
  uma: [10000, 5000, -5000, -10000]
weights:
  divisor: 40
  min: 0.5
  max: 1.5
qualification:
  minGames: 8
  dropWorst: 2
```

## Usage

### 1. Local Script (Recommended for Testing)

```bash
# Run with Season 3 config (default)
uv run python scripts/materialize_data.py

# Run with specific config name
uv run python scripts/materialize_data.py --config "Season 3"

# Run with exact config hash
uv run python scripts/materialize_data.py --config-hash abc123...

# Force refresh (ignore cache)
uv run python scripts/materialize_data.py --force-refresh

# List all configurations
uv run python scripts/materialize_data.py --list
```

### 2. FastAPI Endpoints

Start the development server:

```bash
cd apps/rating-engine
uv run python -m rating_engine.main
```

**Materialize Data:**

```bash
curl -X POST "http://localhost:8000/materialize" \
  -H "Content-Type: application/json" \
  -d '{"config_hash": "abc123...", "force_refresh": false}'
```

**List Configurations:**

```bash
curl "http://localhost:8000/configurations"
```

### 3. Integration with Next.js (Vercel Edge Functions)

```typescript
// app/api/materialize/route.ts
export async function POST(request: Request) {
  const { config_hash, force_refresh } = await request.json();

  const response = await fetch(`${RATING_ENGINE_URL}/materialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config_hash, force_refresh }),
  });

  return Response.json(await response.json());
}
```

## Environment Variables

Create a `.env` file in `apps/rating-engine/`:

```bash
# Supabase Connection (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...  # NOT the anon key!

# Optional: Development settings
LOG_LEVEL=INFO
```

⚠️ **Important**: Use the **SECRET KEY** (starts with `sb_secret_`), not the anon key. Create this in your Supabase dashboard under Settings → API Keys.

## Cache Invalidation Strategy

The system uses smart caching to avoid unnecessary recalculations:

1. **Source Data Hash**: Computed from game IDs, timestamps, and final scores
2. **Cache Validation**: Compare stored source_data_hash with current data
3. **Automatic Invalidation**: Cache is invalid if source data changes
4. **Manual Override**: Use `force_refresh=true` to bypass cache

### Cache States

- **Cache Hit**: Source data unchanged, return existing results
- **Cache Miss**: Source data changed, recalculate everything
- **Force Refresh**: Manually triggered recalculation

## Computed Data

### Player Ratings Table (cached_player_ratings)

- **OpenSkill Parameters**: mu, sigma, display_rating
- **Game Statistics**: games_played, total_plus_minus, best/worst games
- **Streak Tracking**: longest_first_streak, longest_fourth_free_streak
- **Performance Metrics**: tsumo_rate, ron_rate, riichi_rate, deal_in_rate (Phase 1)
- **Cache Metadata**: computed_at, source_data_hash

### Game Results Table (cached_game_results)

- **Game Outcome**: final_score, placement, plus_minus
- **Rating Changes**: mu_before/after, sigma_before/after
- **Weight Calculation**: rating_weight (margin-of-victory)
- **Cache Metadata**: computed_at

## Error Handling

### Common Issues

1. **Missing Configuration**: Config hash not found in database
2. **Database Connection**: Check SUPABASE_URL and SUPABASE_SECRET_KEY
3. **Incomplete Games**: Games without 4 players or final scores are skipped
4. **Permission Errors**: Ensure secret key has read/write access to cache tables

### Recovery Strategies

1. **Clear Cache**: Delete cached\_\* records for problematic config_hash
2. **Rebuild Configuration**: Update rating_configurations table
3. **Manual Override**: Use `force_refresh=true` to ignore cache issues

## Performance Considerations

### Optimization Strategies

1. **Time Range Filtering**: Only process games within configuration timeRange
2. **Batch Operations**: Insert all records in single database transaction
3. **Smart Caching**: Avoid recalculation when source data unchanged
4. **Index Usage**: Database indexes on config_hash, player_id, game_id

### Expected Performance

- **24 games, 7 players**: ~1-2 seconds
- **100 games, 20 players**: ~5-10 seconds
- **1000 games, 50 players**: ~30-60 seconds

Cache hits should return in <100ms regardless of data size.

## Development Workflow

### Testing Changes

1. **Update Configuration**: Modify YAML in `configs/` directory
2. **Load to Database**: Use `config_manager.py` to sync changes
3. **Test Locally**: Run `materialize_data.py` with new config
4. **Verify Results**: Check cached tables in Supabase dashboard
5. **Deploy**: Push changes to trigger production materialization

### Adding New Metrics

1. **Update Schema**: Add columns to cached_player_ratings table
2. **Modify Calculation**: Update PlayerRating dataclass and computation logic
3. **Test Backwards Compatibility**: Ensure existing configs still work
4. **Document Changes**: Update this README with new metrics

## Production Deployment

### Vercel Edge Functions

Create `app/api/webhook/materialize/route.ts`:

```typescript
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Verify webhook authenticity
  const signature = request.headers.get("authorization");
  if (!isValidSignature(signature)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract config hash from payload
  const { config_hash } = await request.json();

  // Call rating engine
  const response = await fetch(`${process.env.RATING_ENGINE_URL}/materialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config_hash, force_refresh: false }),
  });

  return Response.json(await response.json());
}
```

### Database Triggers

Set up triggers in Supabase to automatically materialize when games are completed:

```sql
-- Trigger materialization when game status changes to 'finished'
CREATE OR REPLACE FUNCTION trigger_materialization()
RETURNS TRIGGER AS $$
BEGIN
  -- Call webhook to materialize data
  PERFORM net.http_post(
    url := 'https://your-app.vercel.app/api/webhook/materialize',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := format('{"config_hash": "%s"}', 'official_season_hash')::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER game_completion_trigger
  AFTER UPDATE ON games
  FOR EACH ROW
  WHEN (OLD.status != 'finished' AND NEW.status = 'finished')
  EXECUTE FUNCTION trigger_materialization();
```

## Monitoring

### Key Metrics to Track

1. **Materialization Success Rate**: % of successful runs
2. **Cache Hit Rate**: % of requests served from cache
3. **Processing Time**: Time to materialize by data size
4. **Error Rate**: Failed materializations per time period

### Logging

The system logs at INFO level by default:

```
🚀 Starting materialization for config: abc123...
📋 Loaded config: Season 3
🎮 Loaded 24 games in time range
📊 Calculated ratings for 7 players
💾 Stored materialized data
✅ Materialization complete! Processed 7 players and 24 games
```

Enable DEBUG logging for detailed troubleshooting:

```bash
LOG_LEVEL=DEBUG uv run python scripts/materialize_data.py
```
