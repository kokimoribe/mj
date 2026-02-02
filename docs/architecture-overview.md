# Riichi Mahjong League - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │         PWA Frontend (Next.js/React)               │     │
│  │         apps/web/                                  │     │
│  │                                                    │     │
│  │  - Leaderboard View                               │     │
│  │  - Player Profiles                                │     │
│  │  - Games History                                  │     │
│  │  - Configuration Playground                       │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                          │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │   Next.js API Routes │  │  Python Rating Engine   │    │
│  │   /api/materialize   │──▶│  apps/rating-engine/   │    │
│  │   /api/games         │  │                         │    │
│  └──────────────────────┘  │  - FastAPI endpoint    │    │
│              │              │  - OpenSkill calc      │    │
│              │              │  - Materialization     │    │
│              │              └──────────────────────────┘    │
│              │                           │                  │
│              ▼                           ▼                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │              SUPABASE (PostgreSQL)                 │    │
│  │                                                    │    │
│  │  Source Tables:          Cached Tables:           │    │
│  │  - players               - cached_player_ratings  │    │
│  │  - games                 - cached_game_results    │    │
│  │  - game_seats            - rating_configurations  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Rating Calculation Flow (Async/Ahead of Time)

```
1. Admin/System triggers rating calculation
2. Python Rating Engine reads:
   - Games from `games` table
   - Players from `players` table
   - Configuration from `rating_configurations`
3. OpenSkill algorithm processes all games
4. Results written to:
   - `cached_player_ratings` (player ratings per config)
   - `cached_game_results` (game results per config)
```

### 2. Frontend Data Query Flow

```
1. User visits leaderboard
2. Frontend queries Supabase directly:
   - Reads from `cached_player_ratings` for current config
   - Joins with `players` for display names
3. Data displayed in UI (no computation needed)
```

### 3. Configuration Playground Flow

```
1. User creates new configuration in UI
2. Frontend calls `/api/materialize`
3. API validates and stores config in `rating_configurations`
4. API triggers Python Rating Engine (async)
5. Python processes all games with new config
6. Results materialized to cache tables
7. Frontend polls for completion and displays results
```

## Key Architecture Decisions

### 1. **Separation of Concerns**

- **Frontend (Next.js)**: UI/UX, data presentation, user interactions
- **Rating Engine (Python)**: All rating calculations, OpenSkill algorithm
- **Database (Supabase)**: Data storage, caching, queries

### 2. **Materialized View Pattern**

- Ratings are pre-computed and cached
- No real-time calculation on page load
- Enables fast queries and good performance
- Trade-off: Data freshness vs. performance

### 3. **Configuration-Driven Design**

- Each rating configuration has a unique hash
- All cached data is keyed by config hash
- Enables multiple "seasons" or experimental configs
- Users can explore "what-if" scenarios

### 4. **PWA Architecture**

- Mobile-first design
- Offline capability with service workers
- Installable as native app
- Optimized for iOS Safari

## Technology Stack

### Frontend (`apps/web/`)

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand + React Query
- **Database Client**: Supabase JS Client
- **Type Safety**: TypeScript

### Rating Engine (`apps/rating-engine/`)

- **Language**: Python 3.11+
- **Web Framework**: FastAPI
- **Rating Algorithm**: OpenSkill (PlackettLuce model)
- **Database Client**: Supabase Python Client
- **Deployment**: Vercel Serverless Functions

### Database (Supabase)

- **Database**: PostgreSQL
- **Authentication**: Supabase Auth (future)
- **Real-time**: Not using Supabase Realtime (not a valid option for this project). Use polling or another approach for live updates.
- **Storage**: Supabase Storage (future)

## File Structure

```
mj/
├── apps/
│   ├── web/                    # Next.js PWA Frontend
│   │   ├── src/
│   │   │   ├── app/            # Next.js app router pages
│   │   │   ├── components/     # React components
│   │   │   ├── core/           # Business logic
│   │   │   │   ├── domain/     # Types and constants
│   │   │   │   ├── services/   # Service layer
│   │   │   │   └── repositories/ # Data access
│   │   │   ├── lib/            # Utilities and helpers
│   │   │   └── stores/         # Zustand stores
│   │   └── public/             # Static assets
│   │
│   └── rating-engine/          # Python Rating Service
│       ├── api/                # FastAPI endpoints
│       ├── rating_engine/      # Core rating logic
│       ├── configs/            # Rating configurations
│       └── tests/              # Python tests
│
├── supabase/
│   └── migrations/             # Database schema
│
└── docs/                       # Documentation
```

## Important Considerations for Refactoring

### 1. **Maintain Service Boundaries**

- Don't merge Python and TypeScript code
- Keep rating calculation in Python service
- Frontend should only query, not compute

### 2. **Preserve Database Schema**

- Cache tables are critical for performance
- Configuration hash system must be maintained
- Don't break existing materialized data

### 3. **API Compatibility**

- `/api/materialize` endpoint must continue working
- Configuration structure must remain compatible
- Python service expects specific data format

### 4. **Performance Requirements**

- Leaderboard must load in <2 seconds
- No synchronous rating calculations
- Maintain current caching strategy

### 5. **Configuration System**

- Hash-based configs are core to the system
- Multiple configs can coexist
- Users can create custom configs

## Refactoring Guidelines

### Safe to Refactor

- Frontend component organization
- TypeScript types and interfaces
- Import paths and file structure
- UI components and styling
- Client-side state management

### Requires Careful Consideration

- API route changes (must maintain contracts)
- Database query patterns
- Configuration data structure
- Service layer interfaces

### Do Not Change

- Database schema (without migration)
- Python service API contract
- Configuration hash generation
- Cache table structure
- Materialization process

## Current Data Flow Example

### Leaderboard Display

```typescript
// Frontend queries cached data directly
const { data } = await supabase
  .from("cached_player_ratings")
  .select(
    `
    *,
    player:players(display_name)
  `
  )
  .eq("config_hash", configHash)
  .order("display_rating", { ascending: false });
```

### Configuration Playground

```typescript
// Frontend triggers materialization
await fetch("/api/materialize", {
  method: "POST",
  body: JSON.stringify({
    config_hash: hash,
    configuration: configData,
  }),
});

// Python service processes in background
// Frontend polls for completion
```

## Summary

The architecture follows a clear separation between:

1. **Presentation Layer** (Next.js) - UI and user interactions
2. **Computation Layer** (Python) - Rating calculations
3. **Data Layer** (Supabase) - Storage and caching

This separation enables:

- Independent scaling of services
- Technology-appropriate solutions (Python for math, React for UI)
- Performance through caching
- Flexibility through configuration system

Any refactoring should respect these boundaries and maintain the current data flow patterns.
