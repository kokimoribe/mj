# Data Architecture & Materialization Strategy

## Overview

This document defines the data architecture for the Riichi Mahjong League application, specifically outlining what data is materialized where, when materialization occurs, and how different parts of the system interact.

## Core Principles

1. **OpenSkill Calculations**: All rating calculations using the OpenSkill library must be performed in the Python serverless function
2. **Idempotent Operations**: All materialization operations must be idempotent - running them multiple times produces the same result
3. **Trigger-Based Updates**: Materialization runs automatically via Supabase webhooks when source data changes
4. **Simple Architecture**: Optimize for a hobby project with < 20 users and < 100 games per player

## Data Flow Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Source Data   │────►│ Supabase Trigger │────►│ Python Function │
│  (games table)  │     │    (webhook)     │     │  (OpenSkill)    │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web App UI    │◄────│  Cached Tables   │◄────│ Materialization │
│  (Next.js)      │     │  (Supabase)      │     │    Results      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Database Schema Requirements

### Source Tables (Already Exist)

- `games` - Game records with timestamps
- `game_seats` - Player positions and scores for each game
- `players` - Player information
- `configs` - Rating configuration settings

### Materialized Tables (To Be Created/Updated)

#### `cached_player_ratings`

Stores current ratings and statistics that require OpenSkill calculations.

```sql
CREATE TABLE cached_player_ratings (
  player_id UUID REFERENCES players(id),
  config_hash TEXT,

  -- OpenSkill values
  mu FLOAT NOT NULL,
  sigma FLOAT NOT NULL,
  rating FLOAT NOT NULL, -- μ - 2σ

  -- Aggregate data
  games_played INTEGER NOT NULL,
  last_game_date TIMESTAMP,
  rating_change FLOAT, -- Change from previous game

  -- Historical data for charts
  rating_history FLOAT[], -- Array of last 10-20 ratings

  -- Metadata
  materialized_at TIMESTAMP DEFAULT NOW(),

  PRIMARY KEY (player_id, config_hash)
);
```

#### `cached_game_results`

Stores per-game results with rating impacts.

```sql
CREATE TABLE cached_game_results (
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES players(id),
  config_hash TEXT,

  -- Game data
  placement INTEGER NOT NULL,
  raw_score INTEGER NOT NULL,
  score_delta INTEGER NOT NULL, -- After uma/oka

  -- Rating data (requires OpenSkill)
  rating_before FLOAT NOT NULL,
  rating_after FLOAT NOT NULL,
  rating_change FLOAT NOT NULL,

  PRIMARY KEY (game_id, player_id, config_hash)
);
```

## Materialization Strategy

### What Gets Materialized (Python/OpenSkill)

1. **Rating Calculations**: μ (mu), σ (sigma), derived rating (μ - 2σ)
2. **Rating History**: Array of historical ratings for charts
3. **Rating Changes**: Per-game rating deltas
4. **Before/After Ratings**: Rating snapshots for each game

### What Gets Calculated via SQL Queries

1. **Total Games Count**: MAX(games_played) across players
2. **Active Players Count**: COUNT of players with games
3. **Player Rankings**: ORDER BY rating DESC

### What Gets Calculated Client-Side

1. **Current Rank**: Position in sorted leaderboard
2. **Average Placement**: Mean of placement values
3. **Time-based Deltas**: 30-day rating change
4. **UI Formatting**: Date formatting, number formatting

## Python Serverless Function

### API Design

```python
# /api/materialize-ratings
async def materialize_ratings(request):
    """
    Single endpoint that materializes all OpenSkill-dependent data.

    Triggered by:
    1. Supabase webhook on game insert/update
    2. Manual call for configuration playground

    Args:
        config_hash: Configuration to use for calculations
        game_ids: Optional list of specific games to process

    Returns:
        {
            "success": true,
            "processed_games": 24,
            "updated_players": 7,
            "materialized_at": "2024-01-20T15:30:00Z"
        }
    """
    config_hash = request.json.get('config_hash', 'season_3_2024')

    # 1. Fetch configuration
    config = fetch_config(config_hash)

    # 2. Fetch all games for this config
    games = fetch_games_for_config(config_hash)

    # 3. Initialize OpenSkill with config parameters
    openskill = initialize_openskill(config)

    # 4. Process games chronologically
    player_ratings = {}
    game_results = []

    for game in sorted(games, key=lambda g: g.finished_at):
        # Calculate new ratings
        results = calculate_game_ratings(game, player_ratings, openskill)
        game_results.extend(results)

        # Update player ratings
        for result in results:
            player_ratings[result.player_id] = result.new_rating

    # 5. Materialize to database
    await materialize_player_ratings(player_ratings, config_hash)
    await materialize_game_results(game_results, config_hash)

    return {"success": True, ...}
```

### Trigger Configuration

```sql
-- Supabase webhook trigger
CREATE OR REPLACE FUNCTION trigger_rating_materialization()
RETURNS trigger AS $$
BEGIN
  -- Only trigger for finished games
  IF NEW.status = 'finished' THEN
    -- Call webhook to Python function
    PERFORM net.http_post(
      url := 'https://your-app.vercel.app/api/materialize-ratings',
      body := json_build_object(
        'config_hash', 'season_3_2024',
        'game_ids', ARRAY[NEW.id]
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_game_finished
AFTER INSERT OR UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION trigger_rating_materialization();
```

## Implementation Notes

### Idempotency

- Always recalculate from the beginning of the season
- Use `INSERT ... ON CONFLICT UPDATE` for all materializations
- Include `materialized_at` timestamp for cache invalidation

### Performance Optimization

- Process all games in a single function invocation
- Batch database writes
- Use array operations where possible
- Cache configuration lookups

### Error Handling

- Log all errors but don't retry automatically
- Return partial results if some games fail
- Include error details in response

### Configuration Playground Support

- Accept custom config_hash parameter
- Create temporary configurations on demand
- Clean up old temporary configs periodically

## Data Access Patterns

### Direct Supabase Queries (Recommended)

Given the hobby project scale, direct Supabase queries from the Next.js app are acceptable:

```typescript
// Example: Fetch leaderboard
const { data } = await supabase
  .from("cached_player_ratings")
  .select("*")
  .eq("config_hash", "season_3_2024")
  .order("rating", { ascending: false });
```

### Benefits of This Approach

1. **Simplicity**: No additional API layer to maintain
2. **Real-time**: Can use Supabase subscriptions if needed
3. **Type Safety**: Generate types from database schema
4. **Performance**: Direct database access with RLS

## Migration Strategy

1. **Create New Tables**: Add cached_player_ratings and cached_game_results
2. **Initial Materialization**: Run Python function for all historical data
3. **Enable Triggers**: Set up webhooks for new games
4. **Update Frontend**: Switch to new cached tables
5. **Cleanup**: Remove old materialization code

## Monitoring & Maintenance

- **Health Check**: Monitor materialized_at timestamps
- **Stale Data Alert**: Warn if data > 24 hours old
- **Manual Refresh**: Admin endpoint to force re-materialization
- **Cleanup**: Periodically remove old config_hash entries
