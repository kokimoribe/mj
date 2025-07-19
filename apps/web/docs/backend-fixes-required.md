# Backend Fixes Required for Phase 0

## Critical Issues Blocking Phase 0

### 1. GET /api/players/{id} - Player Profile Endpoint
**Error**: `column current_leaderboard.player_name does not exist`

**Expected Fix**:
```python
# Current (broken):
query = "SELECT * FROM current_leaderboard WHERE player_name = ?"

# Should be:
query = "SELECT * FROM players WHERE display_name = ?"
# OR use the cached_player_ratings table with proper joins
```

### 2. GET /api/games - Game History Endpoint
**Error**: `Could not find relationship between 'games' and 'game_scores'`

**Expected Fix**:
```python
# The backend expects a 'game_scores' table that doesn't exist
# Should use the 'game_seats' table instead:
query = """
  SELECT g.*, gs.* 
  FROM games g
  JOIN game_seats gs ON g.id = gs.game_id
  ORDER BY g.started_at DESC
"""
```

### 3. GET /api/stats/season - Season Statistics Endpoint
**Error**: `'player_name'`

**Expected Fix**:
```python
# Similar to above, using wrong column name
# Should use 'display_name' from players table
```

## Database Schema Reference

The actual database uses these tables/columns:
- `players` table with `display_name` (not `player_name`)
- `game_seats` table (not `game_scores`)
- `cached_player_ratings` for ratings data
- `cached_game_results` for processed game results

## Quick Fix Path

1. Update the Python backend API to use correct table/column names
2. Test each endpoint individually
3. Verify data format matches frontend expectations
4. Run integration tests

## Testing Commands After Fix

```bash
# Test each endpoint
curl http://localhost:3000/api/leaderboard
curl http://localhost:3000/api/players/joseph
curl http://localhost:3000/api/games
curl http://localhost:3000/api/stats/season
```