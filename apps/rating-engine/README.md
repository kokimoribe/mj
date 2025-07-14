# Rating Engine

OpenSkill-based rating calculation service for the Riichi Mahjong League.

## 🚀 Quick Start

```bash
# Install dependencies with uv
uv sync

# Run development server
npm run dev

# Run tests
npm run test

# Lint and format
npm run lint
npm run format
```

## 🎯 Core Functions

### API Endpoints

- `GET /` - Root endpoint with service info
- `GET /health` - Health check endpoint
- `POST /materialize` - Trigger rating materialization for a configuration
- `GET /configurations` - List available rating configurations

### Scripts

- `scripts/materialize_data.py` - Manual materialization (development/testing)
- `scripts/migrate_legacy_data.py` - Import CSV data to database
- `scripts/config_manager.py` - Manage rating configurations
- `scripts/verify_database.py` - Database health checks

## 📊 Materialization System

The rating engine processes raw game data into cached ratings using configuration-driven OpenSkill calculations.

### Quick Usage

```bash
# Run materialization with default Season 3 config
uv run python scripts/materialize_data.py

# List available configurations
uv run python scripts/materialize_data.py --list

# Force refresh (ignore cache)
uv run python scripts/materialize_data.py --force-refresh
```

### API Usage

```bash
# Start API server
uv run python -m rating_engine.main

# Trigger materialization
curl -X POST http://localhost:8000/materialize \
  -H "Content-Type: application/json" \
  -d '{"config_hash": "season_3_legacy", "force_refresh": false}'
```

## 🗄️ Database Requirements

**Environment Variables Required:**

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...  # Server-side key with full permissions
```

**Database Tables Used:**

- `players`, `games`, `game_seats` - Source data
- `rating_configurations` - Configuration storage
- `cached_player_ratings`, `cached_game_results` - Materialized output

## 🧪 Testing

### Test Architecture (Pyramid)

```bash
# Unit tests (33 tests) - Mathematical functions
uv run pytest tests/test_materialization.py -v

# Integration tests (4 tests) - Database interactions
uv run pytest tests/test_integration.py -v

# API tests (11 tests) - HTTP endpoints
uv run pytest tests/test_api.py -v

# All tests
uv run pytest tests/ -v
```

### Test Data

Tests use mocked Supabase responses and synthetic game data. For integration testing with real database:

```bash
# Set TEST_SUPABASE_URL to enable real database tests
export TEST_SUPABASE_URL=https://your-test-project.supabase.co
uv run pytest tests/test_integration.py::TestRealDatabaseConnection -v
```

## 📚 Documentation

- **[Operational Guide](../../docs/08-operational-guide.md)** - Step-by-step procedures
- **[Database Schema](../../docs/03-database-schema.md)** - Table structure
- **[Rating System](../../docs/05-rating-system.md)** - Algorithm details
- **[Materialization Docs](./docs/MATERIALIZATION.md)** - Detailed system documentation

## 🔧 Development

### Project Structure

```
apps/rating-engine/
├── src/rating_engine/
│   ├── main.py                 # FastAPI service (117 lines)
│   └── materialization.py     # Core engine (558 lines)
├── tests/                      # Comprehensive test suite (37 tests)
├── scripts/                    # Operational scripts
├── configs/                    # Rating configuration files
└── docs/                       # Additional documentation
```

### Key Dependencies

- **OpenSkill** - Bayesian rating algorithm
- **FastAPI** - HTTP API framework
- **Supabase** - Database client
- **pytest** - Testing framework
- **uv** - Python package management

---

**Status**: ✅ **Production Ready** - 36/37 tests passing, thoroughly documented, deployed to Vercel Fluid
