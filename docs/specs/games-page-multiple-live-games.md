# Games Page - Multiple Live Games

## Overview

The `/games` page should display **all** games with `status = "ongoing"` as a “Live Games” section above the finished game history list.

Today, the UI only displays a single ongoing game (the most recently started). This spec changes the UI/query to support multiple concurrent ongoing games.

## User Stories

### As a league participant, I want to see all ongoing games on the `/games` page so that I can quickly jump into the correct live game.

**Acceptance Criteria**

- The `/games` page fetches a list of ongoing games (not a single item).
- Ongoing games are sorted by `started_at` descending:
  - Most recently started game appears first
  - Older ongoing games appear below
- If there are no ongoing games, the Live Games section is not shown.
- Finished game history behavior is unchanged (still shows finished games).

## UI/UX Specifications

### Live Games Section

- Display a section header/badge indicating Live Games.
- Render one card per ongoing game.
- Each card links to that game’s live view (`/game/[id]/live`), consistent with the existing behavior.

## Technical Requirements

### Data Fetching

- Add a Supabase query helper `fetchOngoingGames()` that returns a list of ongoing games ordered by `started_at DESC`.
- Update `/games` UI to use `fetchOngoingGames()` via React Query with a short stale time (30s, same as current behavior).

### Component Architecture

- Refactor `LiveGameCard` to render a **single provided game** (prop) so it can be used in a list.
- `LiveGameCard` may independently load any additional per-game details needed for rendering (e.g., hand events).

## Test Scenarios

1. **Multiple ongoing games**
   - Given two games with `status="ongoing"` and different `started_at`
   - When visiting `/games`
   - Then two live game cards are shown
   - And the card for the more recently started game appears first

2. **No ongoing games**
   - Given zero games with `status="ongoing"`
   - When visiting `/games`
   - Then no live game section is rendered
