# Operational Guide

_Essential procedures for developers and LLM coding agents working with the Riichi Mahjong League system_

## 🎯 Quick Reference

| **Need to...**                | **Use this command/approach**                                          |
| ----------------------------- | ---------------------------------------------------------------------- |
| **Connect to production DB**  | `psql $POSTGRES_URL_NON_POOLING`                                       |
| **Run local development**     | `npm run dev` (from project root)                                      |
| **Generate migration**        | `supabase db diff -f new_migration_name`                               |
| **Sync local data from prod** | `supabase db dump --data-only -f production_data.sql` then import      |
| **Import data to local DB**   | `docker exec -i supabase_db_mj psql -U postgres < production_data.sql` |
| **Run materialization**       | `uv run python scripts/materialize_data.py`                            |
| **Check test coverage**       | `uv run pytest tests/ -v` (from rating-engine/)                        |
| **Deploy to production**      | `git push origin main` (auto-deploy)                                   |

---

## 🔐 Database Connection Guide

### Understanding Connection Types

**When to use psql (Direct PostgreSQL)**:

- ✅ Schema inspection (`\dt`, `\d table_name`)
- ✅ Manual data queries and analysis
- ✅ Complex joins and aggregations
- ✅ Database administration tasks
- ✅ Migration testing and validation

**When to use Supabase Client (Python/JavaScript)**:

- ✅ Application code (CRUD operations)
- ✅ Row Level Security (RLS) enforcement
- ✅ Real-time subscriptions
- ✅ Authentication-aware queries
- ✅ Production application logic

### Connection Credentials Explained

````bash
```bash
# ⚠️ CRITICAL UPDATE: Legacy keys disabled July 14, 2025

# ✅ NEW REQUIRED KEYS (Use these for all new code)
SUPABASE_SECRET_KEY="sb_secret_..."      # Backend operations (replaces SERVICE_ROLE_KEY)
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."  # Frontend operations (replaces ANON_KEY)

# 1. SUPABASE_URL - Base URL for all Supabase operations
SUPABASE_URL="https://soihuphdqgkbafozrzqn.supabase.co"

# ❌ LEGACY KEYS (DISABLED - Will return "Legacy API keys are disabled")
# SUPABASE_ANON_KEY="eyJhbGci..."  # Use SUPABASE_PUBLISHABLE_KEY instead
# SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."  # Use SUPABASE_SECRET_KEY instead

# 4. POSTGRES_URL_NON_POOLING - Direct PostgreSQL connection
POSTGRES_URL_NON_POOLING="postgres://postgres.soih..."  # Use for: psql, migrations

# 5. POSTGRES_URL - Pooled connection (for high-concurrency apps)
POSTGRES_URL="postgres://postgres.soih..."  # Use for: Production apps with connection pooling
````

````

### Connection Examples

**1. Connect with psql (Database Administration)**

```bash
# Production database
psql $POSTGRES_URL_NON_POOLING

# Useful psql commands:
\dt                          # List all tables
\d cached_player_ratings     # Describe table structure
\du                          # List database users
\l                           # List all databases
\c database_name             # Connect to different database
\timing                      # Show query execution time
````

**2. Connect with Supabase Client (Python)**

```python
import os
from supabase import create_client

# For application code (respects RLS)
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SECRET_KEY")  # ✅ Use new SECRET_KEY (replaces SERVICE_ROLE_KEY)
)

# Query examples:
result = supabase.table("cached_player_ratings").select("*").execute()
games = supabase.table("games").select("*").eq("status", "finished").execute()
```

**3. Connect with Supabase Client (JavaScript/TypeScript)**

```typescript
import { createClient } from "@supabase/supabase-js";

// For frontend code (respects RLS, user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! // ✅ Use new PUBLISHABLE_KEY (replaces ANON_KEY)
);

// For backend/API routes (admin access)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY! // ✅ Use new SECRET_KEY (replaces SERVICE_ROLE_KEY)
);
```

---

## 🗄️ Migration Workflow

### Understanding Our Migration System

**Current Migration State (Baselined December 2024):**

- `20251228193722_remote_schema.sql` - **Authoritative baseline** from production

> ⚠️ **Important Context**: Our migration history was baselined from production in December 2024. All prior historical migrations were discarded and replaced with a single authoritative snapshot. See [Migration Baseline Strategy](#migration-baseline-strategy) below for details.

**Migration Principles:**

- ✅ **Forward-only** - Never edit existing migrations
- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Reversible** - Include cleanup in separate migration if needed
- ✅ **Tested** - Test locally before deploying
- ✅ **CLI-only** - Never modify schema via Supabase Dashboard

### Step-by-Step Migration Process

**1. Generate New Migration**

```bash
# Create new migration file based on local changes
supabase db diff -f descriptive_migration_name

# Example outputs:
# supabase/migrations/20250714123456_add_player_preferences.sql
```

**2. Review Generated Migration**

```bash
# Check what was generated
cat supabase/migrations/20250714*_add_player_preferences.sql

# Verify it looks correct:
# - Only includes intended changes
# - Has proper IF NOT EXISTS clauses
# - Includes comments for clarity
```

**3. Test Migration Locally**

```bash
# Reset local database and apply all migrations
supabase db reset

# Verify schema state
psql $DATABASE_URL -c "\dt"

# Test with sample data
uv run python scripts/migrate_legacy_data.py
```

**4. Deploy to Production**

```bash
# Push migrations to remote Supabase
supabase db push

# Verify deployment
psql $POSTGRES_URL_NON_POOLING -c "\dt"
```

### Common Migration Patterns

**Adding a New Table:**

```sql
-- Migration: Add player preferences table
CREATE TABLE IF NOT EXISTS player_preferences (
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    notification_email BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT true,
    timezone TEXT DEFAULT 'America/Los_Angeles',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (player_id)
);

-- Add RLS policy
ALTER TABLE player_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
    ON player_preferences FOR ALL
    USING (auth.uid() = (SELECT auth_user_id FROM players WHERE id = player_id));

-- Add helpful comment
COMMENT ON TABLE player_preferences IS 'Player notification and display preferences';
```

**Adding a New Column:**

```sql
-- Migration: Add player location for scheduling
ALTER TABLE players
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS time_zone TEXT DEFAULT 'America/Los_Angeles';

-- Update existing data if needed
UPDATE players SET time_zone = 'America/Los_Angeles' WHERE time_zone IS NULL;
```

---

## 🔄 Syncing Local Database with Production Data

### Overview

When you need fresh production data in your local development environment (e.g., after pulling schema changes or starting work on a new feature), follow this process to sync data from production to local Supabase.

### Prerequisites

- Local Supabase running (`supabase start`)
- Linked to production project (`supabase link --project-ref YOUR_PROJECT_REF`)
- Docker running (required for local Supabase)

### Step-by-Step Sync Process

**1. Dump Production Data**

```bash
# From project root
supabase db dump --data-only -f production_data.sql
```

This creates a SQL file with all production data (INSERT statements only, no schema).

**2. Reset Local Database with Schema**

```bash
# Reset local database and apply migrations (skip seed data)
supabase db reset --no-seed
```

This ensures your local schema matches your migration files.

**3. Import Production Data**

⚠️ **Important**: The `supabase db execute` command does NOT accept piped input. Use Docker instead:

```bash
# Import data using Docker
docker exec -i supabase_db_mj psql -U postgres < production_data.sql
```

> **Note**: The container name `supabase_db_mj` is project-specific. Find yours with `docker ps --format "{{.Names}}" | grep supabase`

**4. Verify Import**

```bash
# Check data was imported
docker exec supabase_db_mj psql -U postgres -c "
SELECT 'games' as table_name, COUNT(*) FROM public.games
UNION ALL SELECT 'players', COUNT(*) FROM public.players
UNION ALL SELECT 'game_seats', COUNT(*) FROM public.game_seats;
"
```

### Quick Reference Commands

```bash
# Full sync in one go (copy-paste friendly)
supabase db dump --data-only -f production_data.sql && \
supabase db reset --no-seed && \
docker exec -i supabase_db_mj psql -U postgres < production_data.sql
```

### Common Issues and Solutions

**"command not found: psql"**

You don't need psql installed locally. Use Docker instead:

```bash
# ❌ Won't work without psql installed
psql "postgresql://postgres:postgres@localhost:54322/postgres" < production_data.sql

# ✅ Use Docker instead
docker exec -i supabase_db_mj psql -U postgres < production_data.sql
```

**"supabase db execute" shows help instead of running SQL**

The `supabase db execute` command doesn't accept piped input well. Always use Docker:

```bash
# ❌ Doesn't work as expected
cat production_data.sql | supabase db execute

# ✅ Use Docker instead
docker exec -i supabase_db_mj psql -U postgres < production_data.sql
```

**Finding your Docker container name**

```bash
# List all Supabase containers
docker ps --format "{{.Names}}" | grep supabase

# Common naming pattern: supabase_db_{project_name}
```

**Data shows in database but not in app**

After importing data, you may need to:

1. **Restart your dev server** - Next.js may have cached empty state
2. **Clear browser cache** - React Query may have cached empty responses
3. **Run materialization** - Some views require computed data (see Materialization Operations below)

### When to Sync

- ✅ After pulling schema changes from production (`supabase db pull`)
- ✅ Starting work on a feature that needs realistic data
- ✅ Debugging a production issue locally
- ✅ After `supabase db reset` clears your local data

### Security Notes

- `production_data.sql` contains real production data - don't commit it to git
- The file is already in `.gitignore`
- Delete after use if working with sensitive data

---

## ⚡ Materialization Operations

### Understanding the Materialization System

**What it does:**

- Processes raw game data using OpenSkill algorithm
- Applies configuration-specific rules (oka/uma, time ranges)
- Caches results in `cached_player_ratings` and `cached_game_results`
- Enables fast leaderboard queries and configuration experimentation

**Important Notes:**

- ⚠️ **Materialization is manual only** - there is no automatic triggering when games finish
- ⚠️ **Game history fallback** - The game history view will display basic game information (player names, scores, placement) even when materialization hasn't run yet, using raw data from `game_seats`. Rating changes will show as "↑0.0" until materialization completes.

**When to run materialization:**

- ✅ After adding new games to the database
- ✅ When testing new rating configurations
- ✅ After database schema changes affecting rating calculations
- ✅ When cache invalidation is needed

### Materialization Procedures

**1. Check Current Status**

```bash
# List available configurations
uv run python scripts/materialize_data.py --list

# Check what's cached
psql $POSTGRES_URL_NON_POOLING -c "
SELECT config_hash, COUNT(*) as player_count, MAX(computed_at) as last_computed
FROM cached_player_ratings
GROUP BY config_hash;
"
```

**2. Run Materialization (Local Development)**

```bash
cd apps/rating-engine

# Default: Materialize Season 3 configuration
uv run python scripts/materialize_data.py

# Specific configuration by name
uv run python scripts/materialize_data.py --config "Season 4"

# Force refresh (ignore cache)
uv run python scripts/materialize_data.py --force-refresh

# Specific configuration by hash
uv run python scripts/materialize_data.py --config-hash abc123...
```

**3. Run Materialization (API)**

```bash
# Start the FastAPI server
uv run python -m rating_engine.main

# Trigger materialization via HTTP
curl -X POST http://localhost:8000/materialize \
  -H "Content-Type: application/json" \
  -d '{"config_hash": "season_3_legacy", "force_refresh": false}'

# Check available configurations
curl http://localhost:8000/configurations
```

**4. Verify Results**

```sql
-- Check materialized player ratings
SELECT
    p.display_name,
    cpr.display_rating,
    cpr.games_played,
    cpr.total_plus_minus,
    cpr.computed_at
FROM cached_player_ratings cpr
JOIN players p ON cpr.player_id = p.id
WHERE cpr.config_hash = 'season_3_legacy'
ORDER BY cpr.display_rating DESC
LIMIT 10;

-- Check materialized game results
SELECT
    g.started_at,
    p.display_name,
    cgr.final_score,
    cgr.placement,
    cgr.plus_minus
FROM cached_game_results cgr
JOIN games g ON cgr.game_id = g.id
JOIN players p ON cgr.player_id = p.id
WHERE cgr.config_hash = 'season_3_legacy'
ORDER BY g.started_at DESC, cgr.placement ASC
LIMIT 20;
```

### Materialization Troubleshooting

**Common Issues:**

**"Game history shows games but rating changes are '↑0.0'"**

This is expected behavior when materialization hasn't run yet. The game history view falls back to raw `game_seats` data to display basic game information immediately. To see actual rating changes:

1. Run materialization for the current season configuration
2. Refresh the game history page
3. Rating changes will now display correctly

**"No games found for configuration"**

```bash
# Check time range in configuration
psql $POSTGRES_URL_NON_POOLING -c "
SELECT name, config_data->'timeRange' as time_range
FROM rating_configurations
WHERE config_hash = 'your_config_hash';
"

# Check available games
psql $POSTGRES_URL_NON_POOLING -c "
SELECT
    MIN(started_at) as earliest_game,
    MAX(started_at) as latest_game,
    COUNT(*) as total_games
FROM games
WHERE status = 'finished';
"
```

**"Database connection failed"**

```bash
# Verify environment variables
echo $SUPABASE_URL
echo ${SUPABASE_SECRET_KEY:0:20}...  # Should start with "sb_secret_"

# Test connection
psql $POSTGRES_URL_NON_POOLING -c "SELECT NOW();"
```

---

## 🔄 Migration Baseline Strategy

### Background

In December 2024, we encountered a migration sync issue between local Supabase and production:

- Local repo contained many historical migration files
- Production database only had one recorded migration
- Despite **schema parity**, Supabase CLI commands (`db pull`, `db push`) failed due to migration history mismatch

### Root Cause

Production schema was created or modified outside of Supabase CLI migrations (e.g., dashboard SQL, initial bootstrap). As a result:

- The schema existed ✅
- But migration history did not reflect how it was created ❌

**Key insight**: Supabase does not infer migration history from schema. This created **schema parity without migration parity**, which the CLI correctly refuses to reconcile automatically.

### Key Supabase Concepts

**Migration Tracking Table:**

Supabase CLI uses this table to track applied migrations:

```sql
supabase_migrations.schema_migrations
```

⚠️ **NOT** `supabase_migrations.migrations` - only migrations recorded in `schema_migrations` are considered "applied" by the CLI.

### Resolution Strategy (Baseline from Production)

We intentionally discarded historical migration history and created a single authoritative baseline migration from production. **This is the recommended and safest approach when production is already live.**

#### Step-by-Step Fix (What We Did)

**1. Backed up local migrations**

```bash
mkdir /tmp/supabase_old_migrations
mv supabase/migrations/* /tmp/supabase_old_migrations/
```

**2. Reverted the only applied prod migration**

```bash
supabase migration repair --status reverted 20251226080041
```

> This only updates migration history - ❌ No schema changes, ❌ No data changes

**3. Pulled production schema**

```bash
supabase db pull
```

This generated a new baseline migration: `supabase/migrations/20251228193722_remote_schema.sql`

**4. Confirmed and accepted baseline**

When prompted: `Update remote migration history table? [Y/n]` → Answered `Y`

This:

- Recorded the baseline as applied ✅
- Did not re-execute SQL on production ✅

### Final State After Baseline

**Production:**

- Schema unchanged
- Data untouched
- Migration history: `20251228193722_remote_schema` (applied)

**Local:**

- One baseline migration
- No historical drift
- CLI commands work normally

### Verification Commands

```bash
# Check migration sync status
supabase migration list

# Check for schema drift
supabase db diff --linked
```

**Expected output:**

- One applied migration
- No schema diff

### Rules Going Forward

#### ✅ DO

- Use `supabase migration new <name>` to create migrations
- Apply changes with `supabase db push`
- Commit migrations to git
- Treat migrations as the **only** schema change mechanism

#### ❌ DO NOT

- Run schema SQL via Supabase Dashboard
- Manually alter production schema
- Edit `schema_migrations` by hand
- Reintroduce old migrations from backup

### Why This Approach Was Chosen

- **Zero risk** to production data
- **Clean, future-proof** migration graph
- **Aligns** with Supabase CLI expectations
- **Prevents** repeat drift issues
- **Industry-standard** solution for live DBs

### When to Use This Pattern Again

Use this baseline strategy if:

- Production schema exists but migrations are missing
- Migration history is corrupted or incomplete
- Early development didn't use migrations consistently

> **TL;DR**: Production schema is the source of truth. Migrations must reflect reality exactly. When they don't, baseline from production.

---

## 🧪 Testing Workflows

### Test Types and When to Run Them

**Unit Tests** (33 tests) - Mathematical functions, validation

```bash
cd apps/rating-engine
uv run pytest tests/test_materialization.py -v
```

**Integration Tests** (4 tests) - Database interactions with mocks

```bash
uv run pytest tests/test_integration.py -v
```

**API Tests** (11 tests) - HTTP endpoints

```bash
uv run pytest tests/test_api.py -v
```

**All Tests** - Complete test suite

```bash
uv run pytest tests/ -v --tb=short
```

### Test-Driven Development Patterns

**Before making changes:**

```bash
# Run existing tests to ensure baseline
uv run pytest tests/ -v

# Run specific test file while developing
uv run pytest tests/test_materialization.py::TestMaterializationConfig -v
```

**After making changes:**

```bash
# Run full test suite
uv run pytest tests/ -v

# Check test coverage (if coverage is installed)
uv run pytest tests/ --cov=rating_engine --cov-report=html
```

---

## 🚀 Development Workflows

### Daily Development Routine

**1. Start Development Session**

```bash
# From project root
nvm use                    # Switch to correct Node.js version
npm run dev               # Start all services (Next.js + Python)

# Or start services individually:
npm run dev:web           # Next.js only (port 3000)
npm run dev:rating        # Python FastAPI only (port 8000)
```

**2. Working with Database Changes**

```bash
# After schema changes, generate migration
supabase db diff -f my_feature_name

# Test migration locally
supabase db reset

# Test materialization with new schema
cd apps/rating-engine
uv run python scripts/materialize_data.py --force-refresh
```

**3. Working with Rating Engine Changes**

```bash
cd apps/rating-engine

# Run tests during development
uv run pytest tests/test_materialization.py -v

# Test API endpoints
uv run python -m rating_engine.main
# Then in another terminal:
curl http://localhost:8000/health
```

### Debugging Common Issues

**"Tests failing after dependency changes"**

```bash
# Regenerate lock file
uv lock

# Reinstall dependencies
uv sync

# Clear caches
rm -rf .pytest_cache/ .ruff_cache/ __pycache__/
```

**"Database schema out of sync"**

```bash
# Reset local database to match migrations
supabase db reset

# Re-run legacy data migration
uv run python scripts/migrate_legacy_data.py
```

**"Materialization producing wrong results"**

```bash
# Check configuration hash
uv run python scripts/materialize_data.py --list

# Force complete refresh
uv run python scripts/materialize_data.py --force-refresh

# Check source data
psql $POSTGRES_URL_NON_POOLING -c "
SELECT COUNT(*) as total_games,
       COUNT(CASE WHEN status = 'finished' THEN 1 END) as finished_games
FROM games;
"
```

---

## 📊 Data Analysis Workflows

### Common Database Queries

**Player Performance Analysis:**

```sql
-- Top players by rating
SELECT
    p.display_name,
    cpr.display_rating,
    cpr.mu,
    cpr.sigma,
    cpr.games_played,
    cpr.total_plus_minus
FROM cached_player_ratings cpr
JOIN players p ON cpr.player_id = p.id
WHERE cpr.config_hash = 'season_3_legacy'
ORDER BY cpr.display_rating DESC;

-- Game results for specific player
SELECT
    g.started_at,
    cgr.final_score,
    cgr.placement,
    cgr.plus_minus,
    cgr.mu_after,
    cgr.sigma_after
FROM cached_game_results cgr
JOIN games g ON cgr.game_id = g.id
JOIN players p ON cgr.player_id = p.id
WHERE p.display_name = 'Koki'
  AND cgr.config_hash = 'season_3_legacy'
ORDER BY g.started_at DESC;
```

**System Health Checks:**

```sql
-- Check data consistency
SELECT
    'cached_player_ratings' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT config_hash) as config_count,
    MAX(computed_at) as last_update
FROM cached_player_ratings
UNION ALL
SELECT
    'cached_game_results' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT config_hash) as config_count,
    MAX(computed_at) as last_update
FROM cached_game_results;

-- Check game data quality
SELECT
    status,
    COUNT(*) as game_count,
    MIN(started_at) as earliest,
    MAX(started_at) as latest
FROM games
GROUP BY status;
```

---

## 🔧 Production Operations

### Deployment Procedures

**1. Pre-deployment Checklist**

```bash
# Run full test suite
cd apps/rating-engine && uv run pytest tests/ -v

# Check for any schema changes
supabase db diff

# Verify environment variables are set
env | grep SUPABASE
```

**2. Deploy to Production**

```bash
# Commit and push (triggers auto-deployment)
git add .
git commit -m "feat: add new feature"
git push origin main

# Monitor deployment
vercel logs --follow
```

**3. Post-deployment Verification**

```bash
# Test production API endpoints
curl https://your-app.vercel.app/api/health

# Verify materialization works in production
curl -X POST https://your-rating-engine.vercel.app/materialize \
  -H "Content-Type: application/json" \
  -d '{"config_hash": "season_3_legacy"}'

# Check database state
psql $POSTGRES_URL_NON_POOLING -c "
SELECT COUNT(*) FROM cached_player_ratings
WHERE computed_at > NOW() - INTERVAL '1 hour';
"
```

### Monitoring and Maintenance

**Regular Health Checks:**

```bash
# Weekly: Check system health
psql $POSTGRES_URL_NON_POOLING -c "
SELECT
    table_name,
    row_count,
    last_update,
    CASE
        WHEN last_update < NOW() - INTERVAL '7 days' THEN 'STALE'
        ELSE 'OK'
    END as status
FROM (
    SELECT 'cached_player_ratings' as table_name,
           COUNT(*) as row_count,
           MAX(computed_at) as last_update
    FROM cached_player_ratings
    UNION ALL
    SELECT 'games' as table_name,
           COUNT(*) as row_count,
           MAX(started_at) as last_update
    FROM games
) health_check;
"

# Monthly: Re-materialize all configurations
cd apps/rating-engine
uv run python scripts/materialize_data.py --force-refresh
```

---

## 🤖 LLM Coding Agent Guidelines

### Key Context for AI Assistants

**Project Structure Understanding:**

- This is a **monorepo** with multiple apps and packages
- **Python rating engine** is separate from **Next.js web app**
- **Database operations** use both psql and Supabase clients
- **Testing** follows pyramid architecture (unit > integration > e2e)

**When assisting with database tasks:**

1. **Always check** what credentials/connection method to use
2. **Prefer Supabase client** for application logic
3. **Use psql** for schema inspection and admin tasks
4. **Generate migrations** rather than direct schema changes

**When assisting with rating engine tasks:**

1. **Run tests first** to understand current state
2. **Use materialization scripts** for testing changes
3. **Check environment variables** before debugging connection issues
4. **Reference existing patterns** in materialization.py

**Common Commands to Suggest:**

```bash
# Check project status
npm run dev                  # Start development
uv run pytest tests/ -v     # Run tests
supabase db reset           # Reset local database
psql $POSTGRES_URL_NON_POOLING  # Connect to database

# Common troubleshooting
uv sync                     # Fix Python dependencies
npm run build               # Test build process
supabase status             # Check Supabase connection
```

---

## 📚 Additional Resources

### Documentation Links

- **[Project Overview](./01-project-overview.md)** - Goals and phases
- **[Technical Architecture](./02-technical-architecture.md)** - System design
- **[Database Schema](./03-database-schema.md)** - Table structure
- **[Development Setup](./04-development-setup.md)** - Initial setup
- **[Rating System](./05-rating-system.md)** - Algorithm details

### External References

- **[Supabase Documentation](https://supabase.com/docs)** - Database and auth
- **[OpenSkill Documentation](https://github.com/philihp/openskill.py)** - Rating algorithm
- **[FastAPI Documentation](https://fastapi.tiangolo.com/)** - Python API framework
- **[Next.js Documentation](https://nextjs.org/docs)** - Frontend framework

---

_Last updated: December 28, 2025_
_For questions or improvements to this guide, update this file and submit a PR._
