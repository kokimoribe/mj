# Comprehensive Troubleshooting Guide

## Architecture Overview

The Riichi Mahjong League uses a hybrid architecture:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js   │────▶│ Python API   │────▶│   Supabase   │
│  Frontend   │     │   Backend    │     │   Database   │
└─────────────┘     └──────────────┘     └──────────────┘
```

- **Frontend**: Next.js app at `/apps/web`
- **Backend**: Python FastAPI at `/apps/rating-engine`
- **Database**: PostgreSQL on Supabase

## Known Issues & Root Causes

### 1. Backend API Failures

**Issue**: Three endpoints fail with database column/table errors:
- `/api/players/{id}` - "column current_leaderboard.player_name does not exist"
- `/api/games` - "Could not find relationship between 'games' and 'game_scores'"
- `/api/stats/season` - "'player_name'"

**Root Cause**: The Python backend uses incorrect table/column names:
- Uses `player_name` instead of `display_name`
- References non-existent `game_scores` table instead of `game_seats`
- Tries to access `mu`/`sigma` columns not in `current_leaderboard` view

**Fix Applied**: Updated `/apps/rating-engine/api/index.py` to use correct schema

### 2. Frontend API Proxy Issues

**Issue**: Frontend API routes hardcode production Python API URL

**Location**: 
- `/apps/web/src/app/api/leaderboard/route.ts`
- `/apps/web/src/app/api/games/route.ts`

**Impact**: Cannot test backend changes locally

## Troubleshooting Process

### Step 1: Verify Database Schema

```bash
# Check if tables exist
psql $DATABASE_URL -c "\dt"

# Verify column names
psql $DATABASE_URL -c "\d players"
psql $DATABASE_URL -c "\d game_seats"
psql $DATABASE_URL -c "\d current_leaderboard"
```

Expected tables:
- `players` (with `display_name` column)
- `games`
- `game_seats` (not `game_scores`)
- `cached_player_ratings`
- `cached_game_results`

### Step 2: Test Python Backend Locally

```bash
# Navigate to rating engine
cd apps/rating-engine

# Install dependencies
uv sync

# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SECRET_KEY="your-service-role-key"

# Run backend locally
uv run uvicorn rating_engine.main:app --reload --port 8000

# Test endpoints
curl http://localhost:8000/
curl http://localhost:8000/leaderboard
curl http://localhost:8000/players/joseph
curl http://localhost:8000/games
curl http://localhost:8000/stats/season
```

### Step 3: Configure Frontend to Use Local Backend

Create `.env.local` in `/apps/web`:
```env
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
```

Update API routes to use environment variable:
```typescript
// In route.ts files
const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'https://mj-skill-rating.vercel.app';
```

### Step 4: Test Frontend Locally

```bash
# Navigate to web app
cd apps/web

# Install dependencies
npm install

# Run frontend
npm run dev

# Test pages
open http://localhost:3000
open http://localhost:3000/player/joseph
open http://localhost:3000/games
open http://localhost:3000/stats
```

## Verification Checklist

### Local Development

- [ ] Python backend starts without errors
- [ ] All Python API endpoints return data:
  - [ ] GET `/` returns service info
  - [ ] GET `/leaderboard` returns player list
  - [ ] GET `/players/{id}` returns player details
  - [ ] GET `/games` returns game history
  - [ ] GET `/stats/season` returns statistics
- [ ] Frontend connects to local backend
- [ ] All pages load without errors:
  - [ ] Home page shows leaderboard
  - [ ] Player profiles load
  - [ ] Game history displays
  - [ ] Statistics page works

### Production Verification

```bash
# Test production API
curl https://mj-skill-rating.vercel.app/
curl https://mj-skill-rating.vercel.app/leaderboard

# Check frontend
open https://your-app.vercel.app
```

## Debugging Commands

### Check Logs

```bash
# Frontend logs (local)
npm run dev

# Backend logs (local)
uv run uvicorn rating_engine.main:app --reload --log-level debug

# Vercel logs (production)
vercel logs --prod
```

### Database Queries

```sql
-- Check players
SELECT * FROM players LIMIT 5;

-- Check games
SELECT * FROM games ORDER BY started_at DESC LIMIT 5;

-- Check ratings
SELECT * FROM current_leaderboard LIMIT 5;

-- Check game seats
SELECT * FROM game_seats gs
JOIN games g ON gs.game_id = g.id
ORDER BY g.started_at DESC LIMIT 20;
```

### API Testing Script

Create `test-api.sh`:
```bash
#!/bin/bash
API_URL=${1:-"http://localhost:8000"}

echo "Testing API at: $API_URL"

echo -e "\n1. Health check:"
curl -s "$API_URL/" | jq .

echo -e "\n2. Leaderboard:"
curl -s "$API_URL/leaderboard" | jq '.players[:2]'

echo -e "\n3. Player profile:"
curl -s "$API_URL/players/joseph" | jq .

echo -e "\n4. Games:"
curl -s "$API_URL/games" | jq '.games[:1]'

echo -e "\n5. Stats:"
curl -s "$API_URL/stats/season" | jq .
```

## Common Error Solutions

### "Connection refused" on localhost:8000
- Ensure Python backend is running: `uv run uvicorn rating_engine.main:app --reload`
- Check port isn't already in use: `lsof -i :8000`

### "CORS error" in browser
- Python backend includes CORS middleware for localhost:3000
- If testing from different port, update CORS in `/apps/rating-engine/api/index.py`

### "No data" in frontend
- Check browser console for API errors
- Verify environment variables are set
- Check Network tab for failed requests

### Database connection errors
- Verify `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are set
- Ensure using service role key (not anon key) for backend
- Check Supabase dashboard for connection limits

## Deployment Process

### Deploy Backend Fix

```bash
cd apps/rating-engine
vercel --prod
```

### Deploy Frontend

```bash
cd apps/web
vercel --prod
```

### Verify Deployment

1. Test production API endpoints
2. Check frontend pages load correctly
3. Monitor error logs
4. Run integration tests

## Monitoring

### Health Checks

```bash
# Create monitoring script
while true; do
  curl -s https://mj-skill-rating.vercel.app/ | jq .status
  sleep 60
done
```

### Error Tracking

- Check Vercel Functions logs
- Monitor Supabase logs
- Set up error alerts for failed API calls

## Next Steps

1. Fix Python backend column/table references ✓
2. Update frontend to use configurable API URL
3. Add integration tests for all endpoints
4. Set up continuous monitoring
5. Document deployment process