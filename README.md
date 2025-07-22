# Riichi Mahjong League

A web application for tracking Riichi Mahjong games and player ratings within a small group.

## Prerequisites

- Node.js 22.17.0 (LTS) - use `nvm use` in the project root
- Docker (for local Supabase development)
- Python 3.11+ (for rating engine development)

## Getting Started

```bash
git clone <repository-url>
cd mj
nvm use
npm install
npm run build
npm run dev
```

## Development Commands

```bash
# Development
npm run dev              # Start all services in parallel
npm run dev:web          # Web app only (http://localhost:3000)
npm run dev:rating       # Python rating engine only (http://localhost:8000)

# Building & Testing
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run type-check       # TypeScript validation
npm run test             # Run all tests
npm run clean            # Clean build artifacts

# Database
npx supabase start       # Start local Supabase (Docker required)
npx supabase db reset    # Reset local database to latest migration
npx supabase db push     # Deploy local changes to remote
npx supabase status      # Check connection status
```

## Project Structure

```
mj/
├── apps/
│   ├── web/            # Next.js PWA frontend
│   └── rating-engine/  # Python FastAPI service
├── packages/
│   ├── database/       # Supabase client and types
│   ├── shared/         # Common utilities
│   └── ui/             # Shared React components
├── docs/               # Project documentation
├── supabase/          # Database migrations
└── turbo.json         # Turborepo configuration
```

### Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL), Python FastAPI
- **Rating System**: OpenSkill algorithm
- **Build System**: Turborepo
- **Deployment**: Vercel

## Documentation

See [docs/README.md](./docs/README.md) for detailed documentation including:

- Project architecture and design decisions
- Database schema documentation
- Development setup guides
- Rating system implementation details
- Operational procedures
