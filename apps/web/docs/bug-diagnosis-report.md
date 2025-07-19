# Bug Diagnosis Report - Phase 0 Backend Issues

## Executive Summary

Through deep analysis of the codebase and live testing, I've identified and diagnosed the root causes of all Phase 0 backend failures. The issues stem from schema mismatches between the Python backend code and the actual Supabase database structure.

## Current Production Status

### Working ✅
- **Health Check**: `https://mj-skill-rating.vercel.app/` returns healthy
- **Leaderboard**: `/leaderboard` endpoint returns data successfully

### Broken ❌
1. **Player Profile** (`/players/{id}`)
   - Error: `column current_leaderboard.player_name does not exist`
   - Root Cause: Code uses `player_name` but database has `display_name`

2. **Games History** (`/games`)
   - Error: `Could not find a relationship between 'games' and 'game_scores'`
   - Root Cause: Code references non-existent `game_scores` table (should be `game_seats`)

3. **Season Stats** (`/stats/season`)
   - Error: Similar column name issues

## Root Cause Analysis

### Database Schema (Actual)
```sql
-- From /supabase/migrations/20250713214553_init_phase_0_schema.sql
CREATE TABLE players (
  display_name TEXT UNIQUE NOT NULL,  -- NOT player_name
  ...
);

CREATE TABLE game_seats (  -- NOT game_scores
  game_id UUID REFERENCES games(id),
  seat riichi_seat NOT NULL,
  player_id UUID REFERENCES players(id),
  final_score INTEGER,
  ...
);

CREATE VIEW current_leaderboard AS
SELECT
  p.display_name,  -- NOT player_name
  cpr.display_rating,
  ...
FROM cached_player_ratings cpr
JOIN players p ON cpr.player_id = p.id
...
```

### Backend Code (Incorrect)
Located in `/apps/rating-engine/api/index.py`:

1. **Line 340** (player profile):
   ```python
   # WRONG: Looking for player_name
   result = supabase.table("current_leaderboard")\
       .select("*")\
       .eq("player_name", player_id)\
       .single()\
       .execute()
   ```

2. **Line 282** (games):
   ```python
   # WRONG: Querying non-existent game_scores table
   result = supabase.table("games")\
       .select("*, game_scores(*)")\
       .order("started_at", desc=True)\
       .limit(limit)\
       .execute()
   ```

## Fix Implementation

### 1. Player Profile Endpoint Fix
```python
# Line 340 - Change to:
result = supabase.table("current_leaderboard")\
    .select("*")\
    .eq("display_name", player_id)\
    .single()\
    .execute()

# Also update other references from player_name to display_name
```

### 2. Games Endpoint Fix
```python
# Line 282 - Change to:
result = supabase.table("games")\
    .select("*, game_seats(*, players(display_name))")\
    .order("started_at", desc=True)\
    .limit(limit)\
    .execute()

# Update processing logic to use game_seats instead of game_scores
```

### 3. Stats Endpoint Fix
```python
# Update all references from player_name to display_name
```

## Verification Process

### 1. Local Testing Setup

```bash
# Clone and setup
cd apps/rating-engine
uv sync

# Set environment
export SUPABASE_URL="your-url"
export SUPABASE_SECRET_KEY="your-key"

# Run locally
uv run uvicorn rating_engine.main:app --reload --port 8000
```

### 2. Test Script

Run the provided test script:
```bash
cd apps/web
./scripts/test-apis.sh http://localhost:8000 http://localhost:3000
```

Expected output:
```
🐍 Python Backend API Tests
───────────────────────────
Testing Health Check... ✓ PASS (200 OK, field exists)
Testing Leaderboard... ✓ PASS (200 OK, field exists)
Testing Player Profile (joseph)... ✓ PASS (200 OK, field exists)
Testing Games History... ✓ PASS (200 OK, field exists)
Testing Season Stats... ✓ PASS (200 OK, field exists)
Testing Configurations... ✓ PASS (200 OK, field exists)
```

### 3. Production Verification

After deployment:
```bash
./scripts/test-apis.sh https://mj-skill-rating.vercel.app https://your-app.vercel.app
```

## Deployment Process

### 1. Deploy Backend Fix
```bash
cd apps/rating-engine
git add api/index.py
git commit -m "Fix database schema mismatches in API endpoints"
git push
vercel --prod
```

### 2. Monitor Deployment
```bash
# Watch logs
vercel logs --prod --follow

# Test endpoints
curl https://mj-skill-rating.vercel.app/players/joseph
```

### 3. Verify Frontend
- Visit production site
- Check player profiles load
- Verify game history displays
- Confirm statistics page works

## Prevention Measures

### 1. Schema Validation
Add database schema tests to prevent future mismatches:
```python
def test_database_schema():
    """Verify expected tables and columns exist"""
    # Check players.display_name exists
    # Check game_seats table exists
    # Verify current_leaderboard view structure
```

### 2. Integration Tests
Add API integration tests that run against real database:
```python
def test_all_endpoints():
    """Test all API endpoints with real data"""
    # Test each endpoint
    # Verify response structure
    # Check for errors
```

### 3. CI/CD Pipeline
- Run schema validation before deployment
- Execute integration tests in staging
- Require passing tests for production deployment

## Current Fix Status

The fixes have been implemented in the Python backend code at `/apps/rating-engine/api/index.py`. The changes need to be:
1. Committed to version control
2. Deployed to production
3. Verified using the test scripts

Once deployed, all Phase 0 functionality should work correctly.