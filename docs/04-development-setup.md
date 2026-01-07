# Development Setup Guide

_Setting up the Riichi Mahjong League development environment_

## Prerequisites

This guide assumes you're setting up the project from scratch or helping an LLM coding agent understand the development environment.

### Required Tools

- **Node.js 22.17.0 (LTS)** with npm (managed via nvm)
- **Python 3.12+** with uv (modern Python package manager)
- **Git** for version control
- **Supabase CLI** for database management
- **VS Code** (recommended) with extensions

### Tech Stack Overview

- **Frontend**: Next.js 15 (App Router) with Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Rating Engine**: Python with OpenSkill library
- **Monorepo**: Turborepo for multi-package management
- **Deployment**: Vercel (frontend) + Supabase (backend)

---

## Project Structure

```
mj/
├── docs/                    # Documentation (this directory)
├── apps/
│   ├── web/                # Next.js PWA application
│   └── rating-engine/      # Python OpenSkill service
├── packages/
│   ├── ui/                 # Shared React components
│   ├── database/           # Supabase schema & migrations
│   └── shared/             # Common utilities & types
├── turbo.json              # Turborepo configuration
├── package.json            # Root workspace configuration
└── README.md               # Project overview
```

---

## Quick Start

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd mj

# Use the correct Node.js version
nvm use 22.17.0
# If you don't have nvm installed, install it first:
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

npm install
```

### 2. Set Up Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init

# Start local Supabase
supabase start

# Apply database schema
supabase db reset
```

### 3. Configure Environment Variables

```bash
# Copy environment template
cp apps/web/.env.example apps/web/.env.local

# Edit with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
SUPABASE_SECRET_KEY=sb_secret_your_key_here
```

### 4. Set Up Python Rating Engine

```bash
# Navigate to rating engine directory
cd apps/rating-engine

# Install dependencies with uv (creates virtual environment automatically)
uv sync

# Test rating engine
uv run pytest tests/
```

### 5. Start Development

```bash
# Start all services (from project root)
npm run dev

# Or start individually:
npm run dev:web        # Next.js app on :3000
npm run dev:rating     # Python service on :8000
```

---

## Database Schema Setup

### Source vs. Derived Tables with Configuration System

The database follows a **source/derived** architecture with **configuration-driven** rating calculations:

#### Source Tables (Critical)

- `players` - Player profiles and auth
- `games` - Game sessions (season-agnostic)
- `game_seats` - Player seating assignments with final scores
- `hand_events` - Hand-by-hand game logs (Phase 1)
- `player_availability` - Scheduling data (Phase 2)

#### Configuration System (Phase 0.5)

- `rating_configurations` - Hash-based configuration storage
- Configuration parameters stored as JSONB (time ranges, rating params, scoring rules)
- Smart caching system with automatic invalidation

#### Derived Tables (Cache)

- `cached_player_ratings` - OpenSkill ratings and statistics per configuration
- `cached_game_results` - Processed game outcomes with oka/uma per configuration
- `current_leaderboard` - View for fast leaderboard queries

### Configuration Management

```yaml
# config/rating_defaults.yaml
default_season_2024:
  timeRange:
    startDate: "2024-01-01"
    endDate: "2024-03-31"
    name: "Winter 2024"
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

### Initial Data Seeding

```sql
-- Create test games (no season reference)
insert into games (started_at, finished_at, status)
values
  ('2024-01-15 19:00:00', '2024-01-15 22:30:00', 'finished'),
  ('2024-01-22 19:00:00', '2024-01-22 22:15:00', 'finished');

-- Create test players
insert into players (display_name, email)
values
  ('Alice', 'alice@example.com'),
  ('Bob', 'bob@example.com'),
  ('Charlie', 'charlie@example.com'),
  ('Diana', 'diana@example.com');

-- Insert default configuration
insert into rating_configurations (config_hash, config_data, name, is_official)
values (
  'abc123...', -- Generated hash
  '{"timeRange": {"startDate": "2024-01-01", ...}}',
  'Winter 2024',
  true
);
```

---

## Python Rating Engine

### Architecture

The Python service handles all rating calculations with configuration-driven logic:

```python
# Core function signature
def get_ratings_for_config(
    config: RatingConfiguration,
    force_recompute: bool = False
) -> Dict[str, PlayerRating]:
    """
    Get player ratings for a specific configuration.
    Uses smart caching based on config hash and source data hash.
    """

# Configuration management
def load_official_season_config() -> RatingConfiguration:
    """Load current official season configuration."""

def generate_config_hash(config: RatingConfiguration) -> str:
    """Generate deterministic hash for configuration caching."""

def get_cached_ratings(
    config_hash: str,
    source_data_hash: str
) -> Optional[Dict[str, PlayerRating]]:
    """Check for cached ratings with given config and source data."""
```

### Key Responsibilities

1. **Configuration Processing**: Parse and validate rating configurations
2. **Smart Caching**: Hash-based cache hit/miss detection
3. **OpenSkill Calculations**: Update μ/σ ratings using config parameters
4. **Oka/Uma Processing**: Convert raw scores using config scoring rules
5. **Statistics Generation**: Calculate win rates, streaks, etc.
6. **Decay Management**: Apply time-based rating decay per config
7. **Cache Management**: Store and invalidate cached results
8. **Data Validation**: Ensure game results consistency

### Configuration-Driven Testing Strategy

```bash
# Unit tests for rating calculations with different configs
uv run pytest tests/test_rating_engine.py::test_config_driven_ratings

# Cache performance tests
uv run pytest tests/test_caching.py::test_cache_hit_rates

# Configuration validation tests
uv run pytest tests/test_config_validation.py

# Integration tests with multiple configurations
uv run pytest tests/test_integration.py::test_config_switching
```

---

## Frontend Development

### Next.js App Structure

```
apps/web/
├── app/                    # App Router pages
│   ├── (dashboard)/       # Dashboard layout group
│   ├── game/              # Game tracking pages
│   └── api/               # API routes & webhooks
├── components/            # React components
├── lib/                   # Utilities & Supabase client
├── types/                 # TypeScript definitions
└── public/                # Static assets
```

### Key Components

- **Leaderboard**: Real-time ranking display with configuration switching
- **ConfigurationPlayground**: UI for experimenting with rating parameters (Phase 0.5)
- **GameTracker**: Hand-by-hand input interface (Phase 1)
- **PlayerStats**: Individual performance metrics
- **Scheduler**: Game scheduling interface (Phase 2)

### Configuration UI Components (Phase 0.5)

- **ConfigSliders**: Interactive controls for all rating parameters
- **LivePreview**: Real-time rating updates as users adjust settings
- **CompareMode**: Side-by-side comparison of different configurations
- **ConfigSaver**: Save and share interesting rule combinations
- **OfficialBadge**: Visual indicator for admin-controlled official seasons

### Development Workflow

```bash
# Start with hot reload
npm run dev:web

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (including configuration system tests)
npm run test

# Test configuration playground
npm run test:config
```

---

## Database Migrations

### Current Migration State

> ⚠️ **Important**: Our migration history was baselined from production in December 2024. The single authoritative migration is `20251228193722_remote_schema.sql`. See [Migration Baseline Strategy](./08-operational-guide.md#migration-baseline-strategy) for full context.

### Schema Changes

```bash
# Generate new migration
supabase migration new "add_hand_events_table"

# Edit migration file in supabase/migrations/
# Apply locally
supabase db reset

# Apply to production
supabase db push
```

### Data Migrations

```bash
# For complex data transformations
supabase migration new "migrate_old_games_format"

# Include both schema and data changes
# Test thoroughly before production
```

### Migration Rules

- **Always use CLI**: Never modify schema via Supabase Dashboard
- **Forward-only**: Never edit existing migration files
- **CLI is source of truth**: All schema changes must go through `supabase migration new`

If you encounter migration sync issues, see the [Migration Baseline Strategy](./08-operational-guide.md#migration-baseline-strategy) for recovery procedures.

---

## Phase-Specific Setup

### Phase 0: Leaderboard Only

- Basic `players`, `games`, `game_seats` tables (season-agnostic)
- Python rating engine for configuration-driven calculations
- Simple game entry form (final scores only)

### Phase 0.5: Configuration Playground

- Add `rating_configurations` and `cached_*` tables
- Smart caching system with hash-based invalidation
- User experimentation features

### Phase 1: Live Game Tracking

- Add `hand_events` table
- Real-time game interface components
- Enhanced Python functions for hand processing with caching

### Phase 2: Scheduling System

- Add `player_availability` table
- Calendar integration components
- Notification system setup

---

## Production Deployment

### Vercel Deployment (Monorepo)

The project uses **GitHub-integrated Vercel deployment** with Turborepo optimization:

```bash
# Automatic deployment
git push origin main          # Triggers auto-deploy to Vercel

# Manual deployment (if needed)
vercel --prod
vercel logs --follow         # Monitor deployment logs
```

### Deployment Architecture

```
GitHub Repository → Vercel Integration → Turborepo Build
     ↓                      ↓                    ↓
  Git Push            Auto Trigger        turbo build --filter=web
     ↓                      ↓                    ↓
  Webhook             Build Process       Next.js Production Build
     ↓                      ↓                    ↓
  Success             Deploy to CDN       Live Production Site
```

### Environment Variables

**Required for Production:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

**Optional (for advanced features):**

```bash
SUPABASE_SECRET_KEY=sb_secret_your_key_here
PYTHON_RATING_ENGINE_URL=https://your-rating-engine.vercel.app
```

### Python Rating Engine Deployment

The Python rating engine is configured to use **Python 3.12** (Vercel's default), which provides optimal performance and compatibility:

```bash
# For Vercel deployment, ensure your pyproject.toml specifies:
# requires-python = ">=3.12"

# uv will automatically use Python 3.12 when available
uv sync --extra dev
```

**Vercel Configuration:**

- Python 3.12 is Vercel's default runtime (no additional configuration needed)
- Uses Node.js 22.x for optimal compatibility
- Dependencies managed via `pyproject.toml` (modern Python standard)

### Database Deployment

```bash
# Deploy schema changes to production
npx supabase db push

# Deploy to specific environment
npx supabase db push --db-url $DATABASE_URL
```

---

## Troubleshooting

### Common Issues

1. **Supabase Connection**: Check environment variables and local instance
2. **Python Dependencies**: Ensure virtual environment is activated
3. **Schema Errors**: Run `supabase db reset` to rebuild from migrations
4. **Rating Calculations**: Check Python service logs and test data

### Debug Commands

```bash
# Check Supabase status
supabase status

# View database logs
supabase logs db

# Test Python service
curl http://localhost:8000/health

# Check Next.js build
npm run build
```

### Build Issues

**Local Build Testing:**

```bash
# Test build locally first
npm run build

# Debug specific workspace
npx turbo build --filter=web --verbose

# Check for TypeScript errors
npm run type-check
```

**Vercel Build Failures:**

```bash
# Check Vercel logs
vercel logs --follow

# Test build command locally
npx turbo build --filter=web
```

### Environment Issues

**Missing Environment Variables:**

```bash
# Check Vercel environment variables
vercel env ls

# Pull production environment locally
vercel env pull .env.local
```

**Supabase Connection:**

```bash
# Check local Supabase status
npx supabase status

# Test database connection
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### Monorepo Detection Issues

**If Vercel doesn't detect monorepo properly:**

1. Ensure `.vercel/repo.json` exists at project root
2. Check project is linked: `vercel projects ls`
3. Verify `apps/web/vercel.json` has correct build command:
   ```json
   {
     "buildCommand": "turbo build --filter=web",
     "framework": "nextjs"
   }
   ```

### Performance Optimization

**Turborepo Caching:**

- **Local**: `.turbo/` cache speeds up repeated builds
- **Remote**: Vercel provides shared cache across deployments
- **Selective Building**: Only changed packages rebuild

**Build Times:**

- **Cold Build**: ~60-90 seconds (all packages)
- **Incremental**: ~15-30 seconds (cached dependencies)
- **Development**: ~2-5 seconds (hot reload)

---
