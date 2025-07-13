# Development Setup Guide

_Setting up the Riichi Mahjong League development environment_

## Prerequisites

This guide assumes you're setting up the project from scratch or helping an LLM coding agent understand the development environment.

### Required Tools

- **Node.js 22.17.0 (LTS)** with npm (managed via nvm)
- **Python 3.9+** with pip
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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 4. Set Up Python Rating Engine

```bash
# Create virtual environment
cd apps/rating-engine
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Test rating engine
python -m pytest tests/
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
python -m pytest tests/test_rating_engine.py::test_config_driven_ratings

# Cache performance tests
python -m pytest tests/test_caching.py::test_cache_hit_rates

# Configuration validation tests
python -m pytest tests/test_config_validation.py

# Integration tests with multiple configurations
python -m pytest tests/test_integration.py::test_config_switching
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

---

## Phase-Specific Setup

### Phase 0: Leaderboard Only

- Basic `players`, `games`, `game_seats` tables (season-agnostic)
- Python rating engine for configuration-driven calculations
- Simple game entry form (final scores only)

### Phase 0.5: Configuration Playground

- Add `rating_configurations` and `cached_*` tables
- Configuration UI with sliders and live preview
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

### Environment Setup

```bash
# Vercel for frontend
vercel deploy

# Supabase for backend
supabase link --project-ref your-project-ref
supabase db push

# Python service (Railway/Heroku)
git push railway main
```

### Environment Variables

```bash
# Production .env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
PYTHON_RATING_ENGINE_URL=https://your-rating-engine.railway.app
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

---

## LLM Agent Guidelines

### For Code Changes

1. **Read Schema First**: Always check `docs/03-database-schema.md`
2. **Understand Phases**: Know which phase features you're implementing
3. **Source vs Derived**: Never modify derived tables directly
4. **Python Functions**: Rating logic belongs in Python, not SQL
5. **Test Thoroughly**: Changes affect competitive league data

### Development Flow

1. **Schema Changes**: Update migrations first
2. **Backend Logic**: Implement in Python rating engine
3. **Frontend Components**: Build UI consuming the data
4. **Integration**: Test end-to-end workflow
5. **Documentation**: Update relevant docs

This setup guide provides everything needed to develop and extend the Riichi Mahjong League application across all planned phases.
