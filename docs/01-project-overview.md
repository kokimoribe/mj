# Project Overview

_Product goals, user stories, and implementation phases_

---

## 🎯 Project Goals

Create a **Progressive Web App (PWA)** to track Riichi Mahjong games and rankings for a **~20 player friend group**.

### Core Requirements

- **Mobile-first**: PWA optimized for iOS (no native app needed)
- **Social**: Hype-driven leaderboard that rewards skill and participation
- **Hobby-scale**: Single location, ~20 players, 2 mahjong tables

---

## 👥 User Stories

### Players

- **View leaderboard** to see current rankings and ratings
- **Check game history** to review past performance
- **Track statistics** like tsumo rate, riichi rate, deal-in rate
- **Get notifications** for scheduled games
- **Set availability** for game scheduling (Phase 2)
- **Explore data** with configurable rules)

### League Commissioner (Admin)

- **Record game results** manually (Phase 0) or via webapp (Phase 1)

---

## 🗓️ Implementation Phases

### Phase 0: Basic Read-Only PWA with Leaderboard

**Goal**: Get the website up and running as a PWA showing the ratings leaderboard

**Features**:

- **Read-only leaderboard**: Display current player rankings and ratings
- **Game history**: View past games and individual player performance
- **Player profiles**: Basic stats and rating progression
- **Mobile PWA**: iOS-optimized progressive web app
- **OpenSkill integration**: Rating calculations using margin-of-victory weights

**Data Entry**: Admin manually inserts final scores into database (no write operations in webapp)

**Success Criteria**:

- PWA installable on iOS devices
- Leaderboard displays current season rankings
- OpenSkill ratings calculated and displayed
- Game history and player stats accessible
- Mobile-responsive design optimized for iOS Safari

### Phase 0.5: Configuration Playground ⭐

**Goal**: Interactive rating system experimentation

**Features**:

- **Configuration UI**: Controls for all rating parameters
- **Live Preview**: See how rule changes affect current rankings

**Key Innovation**: Source data remains season-agnostic; all rating logic is configuration-driven

**Success Criteria**:

- Users can experiment with rating parameters
- Cache hit rate >90% for common configurations
- Official season ratings remain stable and performant
- Sub-second page loads

---

### Phase 1: Live Game Tracking

**Goal**: In-app game recording with detailed statistics

**Features**:

- Create and start new games
- Hand-by-hand recording interface
- Real-time game progress updates
- Detailed performance statistics
- Mobile-optimized data entry

**Data Entry**: Admin records each hand via touch-friendly UI

**Technical Requirements**:

- Supabase realtime for live updates
- Intuitive mobile interface for quick data entry
- Hand event logging (tsumo, ron, riichi, chombo, etc.)
- Performance stats calculation from hand logs

---

### Phase 2: Game Scheduling

**Goal**: Automated game scheduling based on availability

**Features**:

- Player availability windows
- Automatic game matching (4 players)
- Game queue system
- Calendar view of scheduled games
- Table assignment (automatic vs. manual table)

**Constraints**:

- Single location (host house)
- Max 2 concurrent games
- Prioritize automatic mahjong table

---

## 🏆 Rating System Overview

### Core Principles

- **Skill-based**: OpenSkill algorithm (μ/σ model)
- **Margin-aware**: Big wins matter more than narrow ones
- **Anti-camping**: Gentle rating decay for inactive players
- **Upset-sensitive**: High-rated players lose more when beaten by lower-rated
- **Recovery-friendly**: Never trap frequent 4th-placers

### Key Metrics

- **Display Rating**: R = μ - 2σ (less conservative than μ - 3σ)
- **Plus-Minus Scoring**: Oka + Uma applied for zero-sum results
- **Weight Scaling**: W = 1 + (± ÷ 40), clamped 0.5 - 1.5

### Season Rules

- **Length**: configurable per season (roughly 12 weeks)
- **Qualification**: Every player is already qualified
- **Decay**: σ \*= 1.02 weekly if inactive

_See [Rating System](./05-rating-system.md) for detailed algorithm specification._

---

## 📊 Data Architecture Philosophy

### Source vs. Derived Separation

- **Source Tables**: Human-recorded data (critical, irreplaceable)
- **Derived Tables**: Computed cache (recoverable, performance optimization)

### Processing Pipeline

1. **Human Input**: Record raw final scores in source tables
2. **Python Function**: Calculate ratings, plus-minus, statistics
3. **Cache Update**: Store results in derived tables
4. **Frontend Display**: Query cached data for fast UI

This separation ensures:

- **Data integrity**: Critical game logs preserved
- **Maintainability**: Business logic centralized in Python
- **Performance**: Expensive computations cached
- **Recovery**: Derived data can be regenerated

---

## 🔧 Technical Constraints

### Scale

- **Users**: ~20 players total
- **Games**: ~2-3 per week
- **Location**: Single house, 2 tables max
- **Season**: 12 weeks, ~25-30 games total

### Platform

- **Primary**: Mobile web (iOS Safari)
- **Secondary**: Desktop web
- **No native apps**: PWA only

### Budget

- **Hosting**: Vercel Hobby plan
- **Database**: Supabase free tier
- **Development**: Single developer

---

## 📈 Success Metrics

### Phase 0

- 🎯 PWA installable on iOS devices
- 🎯 Leaderboard displays player rankings with OpenSkill ratings
- 🎯 Game history and player profiles functional
- 🎯 Mobile-responsive design optimized for touch
- 🎯 Admin can manually enter game results (database-only)

### Phase 0.5

- 🎯 Interactive configuration playground implementation
- 🎯 User experimentation features

### Phase 1

- 🎯 Complete game recording < 5 minutes
- 🎯 Zero data entry errors during live games
- 🎯 Real-time updates visible to all players

### Phase 2

- 🎯80% of games scheduled automatically
- 🎯 <24 hour average from queue to scheduled game
- 🎯 Zero scheduling conflicts

---

_Next: [Technical Architecture](./02-technical-architecture.md)_
