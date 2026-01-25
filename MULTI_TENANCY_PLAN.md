# Multi-Tenancy / Organizations Plan

This document outlines what it would take to evolve this app from a single-club installation into a **multi-tenant SaaS** that supports **separate organizations (clubs/leagues/studios)** with strong data isolation.

## Goals

- **Hard tenant isolation**: no cross-org data leakage.
- **Support multiple orgs per user** (e.g., a player participates in multiple leagues).
- **Role-based access** per org (owner/admin/member).
- Minimal disruption to existing features: leaderboard, player profiles, game history, hand recording, rating materialization.

## Current State (Key Observations)

- Data is effectively **single-tenant**: tables like `players`, `games`, `game_seats`, `hands`, `hand_actions`, `hand_events`, caches, and `rating_configurations` have **no org identifier**.
- Some RLS policies in the schema are currently **very permissive** (e.g., “Anyone can create/update ...”), which is incompatible with SaaS multi-tenancy.
- Some query paths assume global uniqueness (e.g., `players.display_name` unique globally, lookups by `display_name`).

## Tenancy Model (Recommended)

### A. Shared DB, shared tables (row-based multi-tenancy)

- Add `organization_id` to tenant-scoped tables and enforce isolation via **RLS** and **query patterns**.
- This aligns well with Supabase/Postgres and is the typical SaaS approach at this scale.

### B. Org naming and URLs

- Use an **org slug** for human-friendly routing and invitation flows.
- Possible routing patterns:
  - Path-based: `/org/[slug]/leaderboard`, `/org/[slug]/games/...` (recommended for clarity)
  - Subdomain-based: `[slug].yourapp.com` (nice later; more operational complexity)

## Data Model Changes (Database)

### 1) New tables

#### `organizations`

- `id uuid primary key default uuid_generate_v4()`
- `name text not null`
- `slug text not null unique`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- optional: `settings jsonb default '{}'::jsonb` (branding, defaults, etc.)
- optional: `plan text` / `billing_customer_id text` (future billing)

#### `organization_members`

Represents membership and roles. A user can belong to multiple orgs.

- `organization_id uuid not null references organizations(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `role text not null` (or an enum) in: `owner`, `admin`, `member`
- `created_at timestamptz default now()`
- `primary key (organization_id, user_id)`

### 2) Add `organization_id` to tenant-scoped tables

Add an `organization_id` column (FK to `organizations`) to:

- `players`
- `games`
- `game_seats`
- `hands`
- `hand_actions`
- `hand_events`
- `rating_configurations`
- `cached_player_ratings`
- `cached_game_results`
- `current_ratings` / `rating_histories` / `materialization_cache` (if used for org-visible data)

**Indexing**: create indexes on `organization_id` (and compound indexes for common queries).

### 3) Update uniqueness constraints to be org-scoped

Example changes:

- `players.display_name` should be unique **within an org**, not globally:
  - from: `unique(display_name)`
  - to: `unique(organization_id, display_name)`

Similarly, any other “global unique” assumptions should be revisited.

### 4) Views

Views like `current_leaderboard` must include `organization_id` and filter appropriately (or rely on RLS).

## Authorization & RLS (Critical)

### Tenant isolation policy pattern

The core pattern is:

- Row is accessible if `row.organization_id` is in the set of organizations for `auth.uid()`.

Example (conceptual):

```sql
-- SELECT policy example
create policy "org members can read players"
on public.players
for select
using (
  organization_id in (
    select organization_id
    from public.organization_members
    where user_id = auth.uid()
  )
);
```

### Role-based permissions

Use separate policies for write actions:

- **Owner/Admin**: create/update games, edit players, manage configs, manage members.
- **Member**: read most org data; limited writes (e.g., record hands) if desired.

### Remove permissive policies

Any “Anyone can create/update/delete …” policies should be removed or constrained to org membership and role.

## Application Changes

### 1) Organization context

Introduce a reliable way for the app to know “current org”:

- Store `organization_id` (or `slug`) in:
  - URL (recommended)
  - plus optionally local storage for convenience
- Provide an org switcher UI when a user belongs to multiple orgs.

### 2) Query changes (JS/TS)

All queries must become org-aware. Common approaches:

- **Always include `organization_id` filters** on `from("...")` queries, OR
- Rely primarily on RLS (still recommended to include org filters where it improves performance/clarity).

Areas to update:

- `apps/web/src/lib/supabase/queries.ts`
- `apps/web/src/core/repositories/*`
- `packages/database/index.ts`
- Any server routes under `apps/web/src/app/api/*`

### 3) Rating engine changes (Python)

Rating materialization and any read endpoints must be org-aware:

- Load games/players/configurations for a specific org.
- Ensure caches (`cached_player_ratings`, `cached_game_results`) are written with `organization_id`.

### 4) UX flows

#### Org onboarding

- “Create organization” flow:
  - org name + slug
  - creator becomes `owner`

#### Joining an org (future)

- Invitation links, email invites, or admin-added members.

## Migration Strategy (Existing Single-Club Data)

1. Create a default org (e.g., “Original Club”).
2. Backfill `organization_id` for all existing rows to that org.
3. Create `organization_members` rows for existing users (at least one owner/admin).
4. Update constraints (e.g., `players` unique display name becomes `(organization_id, display_name)`).
5. Replace permissive RLS with org-aware policies.

**Note**: During migration, temporarily allowing `organization_id` to be nullable can reduce risk, but the end state should enforce `NOT NULL` on tenant-scoped tables.

## Implementation Phases (Suggested)

### Phase 1: Database foundation (schema + RLS)

- Add `organizations` / `organization_members`.
- Add `organization_id` columns + indexes.
- Backfill/migrate existing data to a default org.
- Update constraints + views.
- Replace permissive policies with org-aware policies.

### Phase 2: App + API wiring

- Add org context (routing + state).
- Update all reads/writes to be org-aware.
- Ensure API routes and server components respect org selection.

### Phase 3: UX for org management

- Org selector (if multi-membership).
- Org settings page (rename, slug, settings).
- Member management (roles).

### Phase 4: Tests + hardening

- E2E tests for:
  - org isolation (user in Org A cannot see Org B data)
  - org switching
  - role boundaries (member vs admin)
- Performance checks (indexes, common queries).

## Effort (Rough)

- **Phase 1**: 2–4 days (schema, migration, RLS, view updates)
- **Phase 2**: 3–6 days (query refactors across web + API + rating engine)
- **Phase 3**: 2–4 days (org UX + management screens)
- **Phase 4**: 1–3 days (tests, polish, perf)

Total: **~8–17 focused days**, depending on how strict roles/UX/billing need to be initially.

## Risks / Things to Watch

- **RLS correctness**: easiest place to introduce security bugs.
- **Global uniqueness assumptions**: `display_name` and any slug/ID lookup patterns must become org-scoped.
- **Cross-table joins**: ensure all joined tables share the same `organization_id` and policies don’t leak.
- **Caches/materialization**: cached tables must be org-scoped or they will leak data across orgs.

## Recommended Next Step

Implement Phase 1 in a single PR:

- Supabase migration(s) adding org tables + `organization_id` columns.
- Backfill script/SQL for existing data.
- Replace permissive RLS policies with org-scoped policies.
- Minimal “org context” wiring (even hardcoded default org) to keep the app working during transition.
