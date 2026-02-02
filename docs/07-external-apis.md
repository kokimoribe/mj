# External APIs & Documentation

_Reference links and documentation for third-party services and libraries_

## Core Technology Stack

### Next.js 15

- **Official Documentation**: https://nextjs.org/docs
- **App Router Guide**: https://nextjs.org/docs/app
- **API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **PWA Configuration**: https://github.com/shadowwalker/next-pwa

#### Key Features Used

- **App Router**: File-based routing system
- **Server Components**: Improved performance and SEO
- **API Routes**: Backend functionality within Next.js
- **PWA Support**: Offline functionality and app-like experience

### Supabase

- **Official Documentation**: https://supabase.com/docs
- **JavaScript Client**: https://supabase.com/docs/reference/javascript
- **Database Guide**: https://supabase.com/docs/guides/database
- **Authentication**: https://supabase.com/docs/guides/auth

#### Services Used

- **PostgreSQL Database**: Source of truth for all game data
- **Authentication**: User management and secure access
- **Live updates**: Use polling or another approach (Supabase Realtime is not a valid option for this project)
- **Edge Functions**: Server-side logic for complex operations

### Python OpenSkill (Rating Engine)

- **OpenSkill Documentation**: https://openskill.me/
- **GitHub Repository**: https://github.com/OpenSkill/openskill.py
- **Algorithm Paper**: https://openskill.me/algorithm

#### Rating System Integration

```python
import openskill

# Basic usage for 4-player game
teams = [[player1], [player2], [player3], [player4]]
new_ratings = openskill.rate(teams, weights=[1.2, 1.0, 0.8, 0.6])
```

---

## Development Tools

### Turborepo (Monorepo Management)

- **Official Docs**: https://turbo.build/repo/docs
- **Configuration**: https://turbo.build/repo/docs/reference/configuration
- **Caching**: https://turbo.build/repo/docs/core-concepts/caching

#### Package Scripts

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  }
}
```

### TypeScript (Type Safety)

- **Official Handbook**: https://www.typescriptlang.org/docs/
- **Next.js Integration**: https://nextjs.org/docs/app/building-your-application/configuring/typescript
- **Supabase Types**: https://supabase.com/docs/guides/api/generating-types

### Tailwind CSS (Styling)

- **Official Docs**: https://tailwindcss.com/docs
- **Next.js Setup**: https://tailwindcss.com/docs/guides/nextjs
- **Component Examples**: https://tailwindui.com/

---

## Database & ORM

### PostgreSQL (Database)

- **Official Documentation**: https://www.postgresql.org/docs/
- **JSON/JSONB Types**: https://www.postgresql.org/docs/current/datatype-json.html
- **Indexes**: https://www.postgresql.org/docs/current/indexes.html

#### SQL Features Used

- **UUID Primary Keys**: For scalable, distributed-friendly IDs
- **JSONB Columns**: Flexible storage for game details
- **Enum Types**: Type-safe status and category fields
- **Views**: Computed leaderboard and statistics
- **Triggers**: Automatic timestamp updates

### Supabase CLI

- **Installation**: https://supabase.com/docs/guides/cli
- **Local Development**: https://supabase.com/docs/guides/cli/local-development
- **Migrations**: https://supabase.com/docs/guides/cli/local-development#database-migrations

#### Common Commands

```bash
# Start local development
supabase start

# Create new migration
supabase migration new "add_hand_events"

# Apply migrations
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > lib/database.types.ts
```

---

## Authentication & Security

### Supabase Auth

- **Auth Guide**: https://supabase.com/docs/guides/auth
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Social Login**: https://supabase.com/docs/guides/auth/social-login

#### RLS Policies

```sql
-- Example: Players can only edit their own profiles
create policy "Users can update own profile" on players
  for update using (auth.uid() = auth_user_id);
```

### Next.js Middleware

- **Middleware Docs**: https://nextjs.org/docs/app/building-your-application/routing/middleware
- **Auth Patterns**: https://supabase.com/docs/guides/auth/auth-helpers/nextjs

---

## UI Components & Design

### Radix UI (Headless Components)

- **Official Docs**: https://www.radix-ui.com/docs
- **Primitives**: https://www.radix-ui.com/docs/primitives/overview/introduction
- **Styling Guide**: https://www.radix-ui.com/docs/primitives/guides/styling

#### Components Used

- **Dialog**: Modal forms for game entry
- **Dropdown Menu**: Navigation and actions
- **Toast**: Success/error notifications
- **Tooltip**: Helpful hints and explanations

### React Hook Form (Form Management)

- **Official Docs**: https://react-hook-form.com/
- **TypeScript Support**: https://react-hook-form.com/ts
- **Validation**: https://react-hook-form.com/api/useform/formstate

### Zod (Schema Validation)

- **Official Docs**: https://zod.dev/
- **TypeScript Integration**: Built-in TypeScript support
- **Form Validation**: Perfect pairing with React Hook Form

---

## Real-time & Performance

### Live Updates (Not Supabase Realtime)

Supabase Realtime is **not a valid option** for this project. Do not use Supabase Realtime channels or postgres_changes subscriptions. For live game updates and other real-time needs, use **polling** (e.g. React Query refetch intervals) or another approach that fits the deployment constraints.

### React Query (Data Fetching)

- **Official Docs**: https://tanstack.com/query/latest
- **Next.js Integration**: https://tanstack.com/query/latest/docs/react/guides/ssr
- **Optimistic Updates**: https://tanstack.com/query/latest/docs/react/guides/optimistic-updates

---

## Deployment & Infrastructure

### Vercel (Frontend Hosting)

- **Official Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://vercel.com/docs/frameworks/nextjs
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables

### Railway (Python Service Hosting)

- **Official Docs**: https://docs.railway.app/
- **Python Deployment**: https://docs.railway.app/guides/python
- **Environment Variables**: https://docs.railway.app/guides/variables

#### Deployment Configuration

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
```

---

## Monitoring & Analytics

### Vercel Analytics

- **Analytics Guide**: https://vercel.com/docs/analytics
- **Speed Insights**: https://vercel.com/docs/speed-insights
- **Web Vitals**: https://vercel.com/docs/analytics/web-vitals

### Sentry (Error Monitoring)

- **Official Docs**: https://docs.sentry.io/
- **Next.js Integration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Performance Monitoring**: https://docs.sentry.io/product/performance/

---

## Development Workflow

### Git & Version Control

- **Conventional Commits**: https://www.conventionalcommits.org/
- **GitFlow**: https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow

### Testing Frameworks

- **Jest**: https://jestjs.io/docs/getting-started
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro
- **Playwright**: https://playwright.dev/docs/intro (for E2E testing)

### Code Quality

- **ESLint**: https://eslint.org/docs/user-guide/getting-started
- **Prettier**: https://prettier.io/docs/en/index.html
- **Husky**: https://typicode.github.io/husky/ (Git hooks)

---

## Mahjong-Specific Resources

### Riichi Mahjong Rules

- **European Mahjong Association Rules**: https://mahjong-europe.org/portal/index.php?option=com_content&task=view&id=30&Itemid=166
- **World Riichi Championship Rules**: https://worldriichi.org/wrc-rules
- **Japanese Mahjong Guide**: https://riichi.wiki/

### Scoring References

- **Yaku List**: https://riichi.wiki/List_of_yaku
- **Point Calculation**: https://riichi.wiki/Scoring
- **Oka and Uma**: https://riichi.wiki/Oka_and_uma

### Software Inspiration

- **Tenhou**: https://tenhou.net/ (Popular online platform)
- **Mahjong Soul**: https://mahjongsoul.yo-star.com/ (Modern mobile platform)
- **MahjongTime**: https://mahjongtime.com/ (Tournament management)

---

## API Rate Limits & Best Practices

### Supabase Limits

- **Free Tier**: 500MB database, 2GB bandwidth
- **API Limits**: https://supabase.com/docs/guides/platform/quotas
- **Connection Pooling**: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

### Vercel Limits

- **Function Execution**: 10s timeout on Hobby plan
- **Bandwidth**: 100GB/month on Hobby plan
- **Build Time**: No hard limits but optimizations recommended

### Best Practices

- **Caching**: Use React Query for client-side caching
- **Pagination**: Implement for large datasets
- **Optimistic Updates**: Improve perceived performance
- **Error Boundaries**: Graceful error handling
- **Loading States**: Clear user feedback during operations

This reference document provides quick access to all external documentation needed for developing and maintaining the Riichi Mahjong League application.
