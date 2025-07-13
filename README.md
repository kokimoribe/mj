# Riichi Mahjong League

A Progressive Web App (PWA) for tracking games, rankings, and scheduling for a ~20 player Riichi Mahjong friend group.

## 🎯 Project Overview

**Tech Stack**: Next.js 15 + Supabase + Python (OpenSkill) + Turborepo  
**Status**: Ready to begin Phase 0 implementation  
**Target**: Hobby PWA optimized for mobile game tracking

### Development Phases
- **Phase 0**: 📱 Basic read-only PWA with leaderboard and player stats
- **Phase 0.5**: ⭐ Configuration playground - Interactive rating system experimentation 
- **Phase 1**: 🎯 Live hand-by-hand game tracking
- **Phase 2**: 📅 Game scheduling and availability system

## 📚 Documentation

**👉 Start here**: [**Documentation Index**](./docs/README.md)

### Quick Access
- [**Project Overview**](./docs/01-project-overview.md) - Goals, phases, user stories
- [**Technical Architecture**](./docs/02-technical-architecture.md) - Tech stack and system design
- [**Database Schema**](./docs/03-database-schema.md) - Source vs. derived table design
- [**Development Setup**](./docs/04-development-setup.md) - Getting started guide
- [**Rating System**](./docs/05-rating-system.md) - OpenSkill-based algorithm
- [**Feature Roadmap**](./docs/06-feature-roadmap.md) - Implementation timeline

## 🚀 Quick Start

**Note**: This project is ready to begin Phase 0 implementation. The following commands represent the intended development workflow for building the basic read-only PWA.

```bash
# Clone and install (when implementation starts)
git clone <repository-url>
cd mj
npm install

# Set up Supabase (planned)
supabase start
supabase db reset

# Configure environment (planned)
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your Supabase credentials

# Start development (planned)
npm run dev
```

## 🏗️ Project Structure

```
mj/
├── docs/                    # 📖 Comprehensive documentation
├── apps/
│   ├── web/                # Next.js PWA application
│   └── rating-engine/      # Python OpenSkill service
├── packages/
│   ├── ui/                 # Shared React components
│   ├── database/           # Supabase schema & migrations
│   └── shared/             # Common utilities & types
└── turbo.json              # Turborepo configuration
```

## 🎲 Key Features

### Phase 0 (Ready for Implementation)
- 📱 Read-only PWA with iOS optimization
- 📊 Leaderboard showing OpenSkill-based rankings with margin-of-victory weights
- 👤 Player profiles with rating progression and game history
- 📈 Season statistics and performance tracking
- 🔧 Admin manual game entry (database-only, no webapp write operations)

### Phase 0.5 (Planned) ⭐
- 🎯 Interactive configuration playground with sliders for all rating parameters
- 🎯 Live preview of how rule changes affect current rankings
- 🎯 Smart caching system with hash-based configuration switching
- 🎯 Side-by-side comparison of official vs. experimental rule sets
- 🎯 Save and share interesting configuration combinations

### Phase 1 (Planned)
- 🎯 Hand-by-hand live tracking during games
- 🎯 Real-time scoring updates via WebSockets
- 🎯 Enhanced statistics (win rates, streaks, etc.)
- 🎯 Offline support for reliable game logging
- 🎯 Wind rotation and dealer tracking

### Phase 2 (Future)
- 📅 Game scheduling with availability tracking
- 📅 Automatic scheduling optimization
- 📅 Push notifications for upcoming games
- 📅 Calendar integration

## 🔧 Development

**Prerequisites**: Node.js 20+, Python 3.9+, Supabase CLI

**Current Status**: Planning phase complete, ready for implementation.

```bash
# Planned development commands
npm run dev          # Start all services
npm run dev:web      # Next.js app only
npm run dev:rating   # Python service only
npm run build        # Build for production
npm run test         # Run all tests
```

## 📊 Rating System

Uses **OpenSkill** (Bayesian skill rating) with **margin-of-victory weights**:
- Big wins create larger rating swings
- Upset victories (lower-rated beating higher-rated) have more impact
- Time-based decay for inactive players
- Conservative display rating (μ - 2σ) for competitive balance

## 🏆 League Features

- **Qualification system**: Minimum games to compete for prizes
- **Safety net**: Drop worst games to prevent rating pits
- **Achievement tracking**: Streaks, records, and milestones
- **Seasonal structure**: Configurable tournament parameters
- **Friend-group optimized**: Designed for ~20 players

---

**For detailed information, see the [Documentation Index](./docs/README.md)**