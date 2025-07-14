# 🎌 Riichi Mahjong League

A Progressive Web App for tracking Riichi Mahjong games, rankings, and scheduling within a friend group. Built with **Turborepo + Vercel + Supabase + Next.js** for optimal monorepo development.

🎯 **Status**: **PRODUCTION READY** ✅  
📊 **Current Data**: 24 games, 7 players, 3 configurations  
🔧 **Architecture**: Modern secret key auth, Phase 0 schema complete

## 🚀 Quick Start

**Prerequisites**: Node.js 22.17.0 (LTS) - use `nvm use` in the project root to automatically switch to the correct version.

```bash
git clone <repository-url>
cd mj
nvm use  # Automatically uses version from .nvmrc
npm install
npm run build
npm run dev
```

## ⚙️ Development Commands

### **Development**

```bash
npm run dev              # Start all services in parallel
npm run dev:web          # Web app only (http://localhost:3000)
npm run dev:rating       # Python rating engine only (http://localhost:8000)
```

### **Building & Testing**

```bash
npm run build            # Build all packages (Turborepo orchestrated)
npm run lint             # Lint all packages (ESLint + Ruff)
npm run type-check       # TypeScript validation across workspace
npm run test             # Run all tests (Frontend + Python)
npm run clean            # Clean all build artifacts
```

### **Database**

```bash
npx supabase start       # Start local Supabase (Docker required)
npx supabase db reset    # Reset local database to latest migration
npx supabase db push     # Deploy local changes to remote (production)
npx supabase status      # Check connection status
```

### **Deployment**

```bash
git push origin main     # Auto-deploy to Vercel (GitHub integration)
vercel --prod           # Manual deployment (if needed)
vercel logs --follow    # Monitor deployment logs
```

## 🏗️ Architecture

**Monorepo Structure:**

```
mj/
├── apps/
│   ├── web/            # Next.js 15 PWA + Tailwind CSS v4
│   └── rating-engine/  # Python FastAPI + OpenSkill + uv
├── packages/
│   ├── database/       # Supabase client + TypeScript types
│   ├── shared/         # Common utilities + types
│   └── ui/             # Shared React components
├── docs/               # Project documentation
├── supabase/          # Database schema + migrations
└── turbo.json         # Turborepo configuration
```

**Tech Stack:**

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS v4, PWA
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Rating Engine**: Python, FastAPI, OpenSkill, uv package manager
- **Build System**: Turborepo (monorepo orchestration + caching)
- **Deployment**: Vercel (monorepo-aware + GitHub integration)
- **Database**: Supabase with infrastructure-as-code migrations

## 📚 Documentation

**👉 Start here**: [**Documentation Index**](./docs/README.md)

### Quick Access

- [**Project Overview**](./docs/01-project-overview.md) - Goals, phases, user stories
- [**Technical Architecture**](./docs/02-technical-architecture.md) - Tech stack and system design
- [**Database Schema**](./docs/03-database-schema.md) - Source vs. derived table design
- [**Development Setup**](./docs/04-development-setup.md) - Getting started guide
- [**Rating System**](./docs/05-rating-system.md) - OpenSkill-based algorithm
- [**Feature Roadmap**](./docs/06-feature-roadmap.md) - Implementation timeline
