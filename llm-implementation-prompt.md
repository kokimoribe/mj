# LLM Implementation Prompt: Riichi Mahjong League PWA 

---
CURRENT PHASE: Phase 0
CURRENT TASK: Phase 0 task 01
---

**TASK 01: Initialize Project Structure**

Create the Turborepo monorepo structure as documented:

1. Set up root `package.json` with Turborepo
2. Create `apps/web/` with Next.js 15 + PWA
3. Create `apps/rating-engine/` with Python/FastAPI structure, using modern Python tooling like `uv` and `ruff`
4. Create `packages/database/` with Supabase configuration
5. Implement basic `turbo.json` configuration
6. Set up development workflow with `npm run dev`

Reference: `/docs/04-development-setup.md` for exact structure and commands

Success: Running `npm run dev` starts all services successfully

---

## Project Context
You are implementing **Phase 0** of a Riichi Mahjong League tracking system - a **basic read-only PWA** with leaderboard functionality for ~20 players at a single location with 2 mahjong tables.

## Phase 0 Goal: Basic Read-Only PWA with Leaderboard
Create a **mobile-first Progressive Web App** that displays:
- Current season player rankings using OpenSkill ratings
- Individual player profiles with game history
- Mobile-optimized leaderboard interface
- PWA functionality for iOS devices

This phase establishes the core read-only viewing experience before adding configuration options in later phases.

---

## Technical Architecture Overview

### Stack
- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Rating Engine**: Python Edge Functions for OpenSkill calculations
- **Deployment**: Vercel (frontend) + Supabase (backend)
- **PWA**: Service worker with offline capability

### Key Design Principles
1. **Source vs. Derived Data Separation**: Human-recorded game data (source) vs. computed ratings/stats (derived cache)
2. **Mobile-First PWA**: iOS Safari optimization with app-like experience
3. **Fixed Configuration**: Single hardcoded rating configuration (no experimentation UI in Phase 0)
4. **Read-Only Interface**: Display-only PWA, admin data entry via database tools
5. **Performance Focus**: Fast loading, offline capability, smooth mobile experience

---

## Phase 0 Implementation Requirements

## Phase 0 Core Features (Read-Only PWA)

### 1. Leaderboard Display (Primary Feature)
- **Current season rankings** with OpenSkill ratings displayed prominently
- **Rating display**: R = μ - 2σ format for conservative ranking
- **Player information**: Names, games played, win rate, recent form
- **Rating trends**: Visual indicators for rating changes (↑↓)
- **Mobile-optimized**: Touch-friendly, vertical scrolling list design

### 2. Player Profile Pages
- **Individual rating progression**: Chart showing rating over time
- **Game history**: Recent games with scores and rating changes  
- **Basic statistics**: Games played, average placement, plus-minus
- **Mobile navigation**: Smooth transitions between leaderboard and profiles

### 3. PWA Experience
- **Installable**: Add to home screen on iOS/Android
- **Offline capability**: Cached leaderboard data when network unavailable
- **App-like feel**: Full-screen mode, smooth animations
- **Fast loading**: Optimized for mobile networks

### Phase 0 Success Criteria
✅ PWA installable on iOS devices  
✅ Leaderboard loads in <2 seconds on mobile  
✅ Rating calculations match OpenSkill specifications  
✅ Mobile interface intuitive for mahjong players  
✅ Player profiles accessible via leaderboard taps

### Rating System Implementation (Fixed Configuration)

#### Hardcoded Configuration for Phase 0
Use these fixed values (configuration UI comes in later phases):

```typescript
// Fixed rating configuration for Phase 0
const PHASE_0_RATING_CONFIG = {
  // OpenSkill base parameters
  mu: 25.0,           // Initial rating mean
  sigma: 8.333,       // Initial rating uncertainty  
  beta: 4.167,        // Performance difference for 76% win probability
  tau: 0.0833,        // Rating uncertainty increase over time
  
  // Display rating calculation
  displayRating: (mu: number, sigma: number) => mu - 2 * sigma,
  
  // Mahjong margin-of-victory weighting  
  weightScale: (plusMinus: number) => Math.max(0.5, Math.min(1.5, 1 + plusMinus / 40)),
  
  // Season qualification rules
  minGamesForRanking: 8,     // Minimum games to appear on leaderboard
  worstGamesDropped: 2,      // Best-of counting (will implement later)
  
  // Plus-minus calculation (traditional Japanese scoring)
  oka: 20000,                // Return bonus points
  uma: [15000, 5000, -5000, -15000]  // 1st/2nd/3rd/4th place bonuses
};
```

#### Implementation Priority
**Phase 0 Focus**: Get basic OpenSkill + margin-of-victory working with fixed config  
**Future Phases**: Add configuration playground UI to experiment with parameters

---

## Data Architecture (Simplified for Phase 0)

### Source Tables (Human Input via Database Admin)
```sql
-- Games table: Raw final scores (manually entered)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id),
  game_date TIMESTAMPTZ NOT NULL,
  final_scores INTEGER[] NOT NULL,  -- [28000, 25000, 24000, 23000]
  player_ids UUID[] NOT NULL,       -- 4 players in finish order
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic season and player tables
CREATE TABLE seasons (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT false
);

CREATE TABLE players (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Derived Tables (Computed by Rating Engine)
```sql
-- Current ratings cache (updated by Python function)
CREATE TABLE player_ratings (
  player_id UUID REFERENCES players(id),
  season_id UUID REFERENCES seasons(id),
  mu DECIMAL NOT NULL,
  sigma DECIMAL NOT NULL,
  display_rating DECIMAL NOT NULL,  -- mu - 2*sigma
  games_played INTEGER NOT NULL,
  last_game_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (player_id, season_id)
);

-- Basic stats cache
CREATE TABLE player_stats (
  player_id UUID REFERENCES players(id),
  season_id UUID REFERENCES seasons(id),
  placement_counts INTEGER[] NOT NULL,  -- [1st, 2nd, 3rd, 4th] counts
  total_plus_minus BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (player_id, season_id)
);
```

---

## Phase 0 Implementation Steps

### Step 1: Supabase Database Setup
1. **Create Supabase project** and get connection details
2. **Run SQL migrations** to create tables above
3. **Set up RLS policies** for read-only public access
4. **Insert sample data** (1 season, 5-6 players, 10-15 games) for testing
5. **Test database connection** from local development

### Step 2: Rating Engine (Python Edge Function)
1. **Install OpenSkill library** in Python environment
2. **Create rating calculation function** with fixed Phase 0 config
3. **Implement plus-minus weighting** for margin-of-victory
4. **Create cache update logic** to populate derived tables
5. **Test with sample games** and verify rating calculations

### Step 3: Next.js PWA Foundation  
1. **Initialize Next.js project** with TypeScript and Tailwind
2. **Configure Supabase client** for database access
3. **Set up PWA basics**: manifest.json, service worker, offline capability
4. **Create mobile-first design system** with Tailwind components
5. **Test PWA installation** on iOS device

### Step 4: Core Leaderboard Interface
1. **Leaderboard page** (`/`) - main ranking display
   - Fetch current season ratings from `player_ratings` table
   - Mobile-optimized card/list layout
   - Sort by display_rating descending
   - Show games played, recent form indicators

2. **Player profile pages** (`/player/[id]`) 
   - Individual rating history and basic stats
   - Game history for this player
   - Simple navigation back to leaderboard

3. **PWA Polish**
   - Offline caching of leaderboard data
   - Loading states and error handling
   - Smooth mobile navigation

### Step 5: PWA Implementation
1. Service worker for offline caching
2. App manifest for installability
---

## Phase 0 Success Criteria

### MVP Functional Requirements ✅
- **Leaderboard Display**: Current season rankings visible on mobile
- **Rating System**: OpenSkill + margin-of-victory calculations working
- **Player Profiles**: Individual rating progression and game history
- **PWA Installation**: App installable on iOS devices  
- **Mobile Optimization**: Touch-friendly interface, fast loading

### Technical Validation ✅
- Database tables populated with sample data (5-6 players, 10+ games)
- Rating calculations match OpenSkill specification with margin-of-victory
- Supabase integration working (auth not required for read-only)
- Next.js PWA properly configured with offline capability
- Mobile-first responsive design tested on iOS Safari

### Quality Standards ✅
- Page load time < 2 seconds on mobile networks
- Zero JavaScript errors in browser console
- Proper error handling for network failures
- Clean TypeScript code with proper typing
- PWA manifest and service worker functional

---

## Post-Phase 0 Roadmap (Future LLM Prompts)

### Phase 1: Admin Interface & Real-time
- Game entry webapp (no more database manual entry)
- Real-time leaderboard updates via Supabase Realtime
- Hand-by-hand statistics and detailed game tracking

### Phase 2: Configuration Playground
- Interactive parameter controls with live preview
- Multiple rating system experiments
- Smart caching for configuration changes
- Configuration saving and sharing

### Phase 3: Social Features
- Player matchmaking and scheduling
- Game history comments and notes
- Achievement system and badges

---

## Development Notes

### Fixed Configuration Rationale
Phase 0 uses hardcoded rating parameters to:
1. **Validate core algorithm** without configuration complexity
2. **Focus on mobile PWA experience** as primary deliverable  
3. **Establish data architecture** that supports future experimentation
4. **Prove OpenSkill + margin-of-victory concept** with real usage

### Architecture Investment Justification
Despite hobby-scale usage (~20 players), sophisticated patterns provide:
- **Learning opportunity** with enterprise-grade technologies
- **Scalability foundation** if league grows significantly  
- **Portfolio project** demonstrating complex rating system design
- **Code reusability** for other competitive game tracking

### Key Implementation Priorities
1. **Mobile PWA experience** - primary interface for players
2. **Rating accuracy** - OpenSkill calculations must be mathematically correct
3. **Performance** - fast loading and smooth interactions on mobile
4. **Data integrity** - robust source/derived separation for reliability

Remember: Start with minimal working implementation, then add sophistication. Phase 0 success = working mobile leaderboard PWA that players actually want to use.
