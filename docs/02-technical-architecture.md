# Technical Architecture

*Tech stack, system design, and architectural decisions*

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js PWA  │───▶│   Supabase DB    │───▶│  Python Rating  │
│   (Frontend)    │    │  (Postgres)      │    │   Function      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐             │
         └─────────────▶│  Supabase Auth   │             │
                        │   & Realtime     │             │
                        └──────────────────┘             │
                                 │                       │
                        ┌──────────────────┐             │
                        │   Vercel Edge    │◀────────────┘
                        │   (Hosting)      │
                        └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Next.js 15** | React framework | App Router, PWA support, excellent DX |
| **TypeScript** | Type safety | Critical for data integrity |
| **Tailwind CSS** | Styling | Rapid UI development, mobile-first |
| **PWA (next-pwa)** | Mobile app experience | iOS-friendly, offline capability |

### Backend & Database
| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Supabase** | Database + Auth + Realtime | Postgres, built-in auth, real-time subscriptions |
| **Python** | Rating calculations | OpenSkill library, data science ecosystem |
| **Vercel Functions** | Serverless compute | Seamless Next.js integration |

### Development & Deployment
| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Turborepo** | Monorepo management | Multi-package coordination |
| **pnpm** | Package management | Faster installs, workspace support |
| **Vercel** | Hosting & deployment | Auto-deploy, edge functions |

---

## 📁 Project Structure

```
riichi-league/
├─ packages/
│  ├─ web/                    # Next.js PWA
│  │  ├─ src/
│  │  │  ├─ app/             # App Router pages
│  │  │  ├─ components/      # Reusable UI components
│  │  │  ├─ lib/             # Utilities, Supabase client
│  │  │  └─ types/           # TypeScript definitions
│  │  ├─ public/             # Static assets, PWA manifest
│  │  └─ next.config.mjs     # Next.js + PWA config
│  │
│  └─ supabase/              # Database & migrations
│     ├─ migrations/         # SQL schema files
│     ├─ seed.sql           # Initial data
│     └─ config.toml        # Supabase configuration
│
├─ api/                      # Python rating functions
│  ├─ skill.py              # OpenSkill rating calculation
│  ├─ requirements.txt      # Python dependencies
│  └─ vercel.json          # Vercel function config
│
├─ docs/                     # Project documentation
├─ turbo.json               # Turborepo configuration
├─ pnpm-workspace.yaml     # Workspace definition
└─ .env.example            # Environment variables
```

---

## 🗄️ Data Flow Architecture

### Phase 0: Basic Ratings
```
┌─────────────────┐
│  Admin enters   │
│  final scores   │──┐
│  (manual)       │  │
└─────────────────┘  │
                     ▼
┌─────────────────────────────────────┐
│           Source Tables             │
│  • games (raw final scores)        │
│  • game_seats (player assignments) │
│  • players (profiles)              │
└─────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────┐
│      Python Rating Engine          │
│  • OpenSkill calculations          │
│  • Configuration-driven logic      │
│  • Smart caching system            │
└─────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────┐
│         Derived Tables              │
│  • cached_player_ratings            │
│  • cached_game_results              │
│  • rating_configurations           │
└─────────────────────────────────────┘
```

### Phase 0.5: Configuration Playground
```
┌─────────────────┐    ┌─────────────────┐
│  User adjusts   │    │  Official       │
│  config sliders │    │  season config  │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌──────────────────────────────────────────┐
│        Configuration System              │
│  • Hash-based config identification     │
│  • Smart cache hit/miss detection       │
│  • Real-time rating recalculation       │
└──────────────────────┬───────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────┐
│           Cache Layer                    │
│  • Config hash → cached ratings         │
│  • Source data hash → cache validity    │
│  • Instant switching between configs    │
└──────────────────────────────────────────┘
```
                     ▼ Webhook triggers
┌─────────────────────────────────────┐
│         Python Function             │
│  • Calculate plus-minus (oka/uma)  │
│  • Compute OpenSkill ratings       │
│  • Update performance stats        │
└─────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────┐
│          Derived Tables             │
│  • player_ratings (cached μ/σ)     │
│  • game_results (plus-minus cache) │
└─────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────┐
│            Frontend                 │
│  • Query cached leaderboard        │
│  • Real-time via Supabase          │
└─────────────────────────────────────┘
```

### Phase 1: Live Game Tracking
```
┌─────────────────┐
│   Players use   │
│   webapp to     │──┐
│   record hands  │  │
└─────────────────┘  │
                     ▼
┌─────────────────────────────────────┐
│         Source Tables               │
│  • hand_events (detailed logs)     │
│  • games (live status updates)     │
└─────────────────────────────────────┘
                     │
                     ▼ Real-time subscriptions
┌─────────────────────────────────────┐
│            Frontend                 │
│  • Live game progress              │
│  • Hand-by-hand recording UI       │
└─────────────────────────────────────┘
```

---

## 🔄 Source vs. Derived Tables

### Design Philosophy
**Clean separation between human input and computed results**

### Source Tables (Critical Data)
- **Definition**: Human-recorded data during/after games
- **Characteristics**: Irreplaceable, minimal computation, audit trail
- **Recovery**: Impossible if lost

| Table | Purpose | Phase |
|-------|---------|-------|
| `players` | Player profiles and preferences | 0 |
| `seasons` | Season rules and parameters | 0 |
| `games` | Game scheduling and final scores | 0 |
| `game_seats` | Player-to-seat assignments | 0 |
| `hand_events` | Detailed hand-by-hand logs | 1 |
| `player_availability` | Scheduling availability | 2 |
| `game_queue` | Game scheduling requests | 2 |

### Derived Tables (Computed Cache)
- **Definition**: Results computed by Python function
- **Characteristics**: Performance optimization, recoverable
- **Recovery**: Can be regenerated from source tables

| Table | Purpose | Source |
|-------|---------|--------|
| `player_ratings` | OpenSkill μ/σ values, display ratings | All games in season |
| `game_results` | Plus-minus scores, rating changes | Final scores + season rules |

---

## 🎯 Rating Calculation Pipeline

### Trigger
```sql
-- Supabase webhook fires when game is completed
UPDATE games SET status = 'finished' WHERE id = ?;
```

### Python Function Workflow
```python
def process_game_completion(game_id: str):
    # 1. Extract source data
    game = get_game_with_seats(game_id)
    season = get_season(game.season_id)
    
    # 2. Calculate plus-minus scores
    for seat in game.seats:
        plus_minus = calculate_oka_uma(
            seat.final_score, 
            seat.placement,
            season.oka_settings
        )
        weight = calculate_weight(plus_minus, season.weight_params)
    
    # 3. Update OpenSkill ratings
    teams = [[player] for player in game.players]
    new_ratings = openskill.rate(
        teams, 
        ranks=placements, 
        weights=weights
    )
    
    # 4. Save to derived tables
    upsert_player_ratings(new_ratings)
    upsert_game_results(plus_minus_scores, rating_changes)
    
    # 5. Calculate performance stats (if hand_events exist)
    if game.has_hand_logs:
        update_performance_stats(game.players, season.id)
    
    # 6. Invalidate frontend cache
    revalidate_tag('ratings')
```

---

## 🔐 Authentication & Security

### Authentication Strategy
- **Phase 0**: Optional auth (read-only leaderboard)
- **Phase 1+**: Required for game recording
- **Provider**: Supabase Auth (email/password, OAuth)

### Row Level Security (RLS)
```sql
-- Players can read public leaderboard
CREATE POLICY "public_read_leaderboard" ON player_ratings
  FOR SELECT USING (true);

-- Only authenticated users can record hands
CREATE POLICY "auth_users_record_hands" ON hand_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Players can only edit their own availability
CREATE POLICY "own_availability" ON player_availability
  FOR ALL USING (player_id IN (
    SELECT id FROM players WHERE auth_user_id = auth.uid()
  ));
```

---

## 📱 PWA Configuration

### Manifest
```json
{
  "name": "Riichi League",
  "short_name": "Riichi",
  "description": "Mahjong rankings and game tracking",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1f2937",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Service Worker Features
- **Cache Strategy**: Network-first for data, cache-first for assets
- **Background Sync**: Queue game recording when offline
- **Push Notifications**: Game scheduling alerts (Phase 2)

---

## 🚀 Performance Considerations

### Database Optimization
- **Indexes**: Optimized for leaderboard and game history queries
- **Views**: Pre-computed joins for common queries
- **Connection Pooling**: Supabase handles automatically

### Frontend Optimization
- **Static Generation**: Leaderboard page with ISR
- **Real-time Updates**: Selective subscriptions to avoid over-fetching
- **Mobile Performance**: Touch-optimized, minimal JavaScript

### Caching Strategy
- **Database**: Derived tables cache expensive computations
- **CDN**: Static assets via Vercel Edge
- **Client**: React Query for intelligent data fetching

---

## 🔧 Development Workflow

### Local Development
```bash
# Start all services
pnpm dev

# Equivalent to:
supabase start          # Local Postgres
next dev               # Frontend dev server
```

### Database Migrations
```bash
# Create migration
supabase migration new add_hand_events

# Apply locally
supabase db reset

# Deploy to production
git push  # Auto-deploys via Vercel
```

### Testing Strategy
- **Unit Tests**: Python rating functions
- **Integration Tests**: Database triggers and webhooks
- **E2E Tests**: Critical user flows (game recording)

---

## 📊 Monitoring & Observability

### Key Metrics
- **Performance**: Page load times, function execution duration
- **Reliability**: Error rates, webhook success rates
- **Usage**: Active players, games per week

### Tools
- **Vercel Analytics**: Frontend performance
- **Supabase Dashboard**: Database metrics
- **Custom Logging**: Python function execution

---

*Next: [Database Schema](./03-database-schema.md)*
