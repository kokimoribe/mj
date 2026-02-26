# Live Game Emoji Reactions — Feature Documentation

This document describes a planned feature: allowing spectators on the live game page to add emoji reactions to each hand history item. It is **blocked on user authentication** (not yet implemented). Revisit this doc when auth is available.

---

## Overview

- **Where:** `/game/[id]/live` — spectators viewing a game in progress.
- **What:** Each hand in the hand history can receive emoji reactions (e.g. 👍 👏 🔥). Spectators see aggregate counts and can add or remove their own reaction.
- **Stable key for a hand:** `(game_id, hand_seq)` — one “hand” = one round (e.g. East 1, Honba 0), grouped by `hand_seq` in the UI.

---

## Dependency: User Authentication

**Per-user reactions require a notion of “who reacted.”**

- The desired data model stores one row per (game, hand, emoji, **user**).
- **User auth is not implemented yet.** Until it is, we cannot reliably identify spectators (e.g. no `user_id` or session to attach to reactions).
- **Action:** Implement user authentication first (e.g. Supabase Auth, anonymous or signed-in). Then use the authenticated user (or anonymous user) id as `user_id` (or `spectator_id`) when recording reactions.

---

## Data Model (Per-User)

**Table: `hand_reactions`**

| Column       | Type        | Notes                                                         |
| ------------ | ----------- | ------------------------------------------------------------- |
| `id`         | uuid        | PK, default `gen_random_uuid()`                               |
| `game_id`    | uuid        | FK → `games(id)`, NOT NULL                                    |
| `hand_seq`   | int         | NOT NULL, matches `hand_events.hand_seq`                      |
| `emoji`      | text        | NOT NULL, e.g. `"👍"`, `"🔥"`                                 |
| `user_id`    | uuid        | FK → auth users (or `users` table when implemented), NOT NULL |
| `created_at` | timestamptz | default `now()`                                               |

- **Unique constraint:** `(game_id, hand_seq, emoji, user_id)` — one reaction per user per hand per emoji (user can react with multiple different emojis on the same hand).
- **Indexes:** `(game_id, hand_seq)` for listing reactions for a game’s hand history; optionally `(user_id)` for “my reactions” queries.

**Aggregates for UI:** Count by `(game_id, hand_seq, emoji)` for display; and “did current user react with this emoji?” by joining on `user_id`.

---

## API (Planned)

- **Read reactions (with counts and “mine”)**
  - Option A: Extend `GET /api/games/[gameId]` to include reactions when the request is authenticated (e.g. `reactionsByHand: Record<hand_seq, { [emoji]: { count: number, mine: boolean } }>`).
  - Option B: `GET /api/games/[gameId]/reactions` — returns same shape; call when authenticated. Page can poll this alongside or instead of embedding in game payload.

- **Add reaction:** `POST /api/games/[gameId]/hands/[handSeq]/reactions`
  - Body: `{ emoji: "👍" }`.
  - Requires auth; server sets `user_id` from session.

- **Remove reaction:** `DELETE /api/games/[gameId]/hands/[handSeq]/reactions?emoji=👍`
  - Requires auth; deletes row for current user + game + hand_seq + emoji.

- **Rate limiting:** Per user (and optionally per IP) to prevent spam (e.g. max N reactions per minute per game).

---

## UI Integration

- **Scope:** Live page only (`/game/[id]/live`). Hand history comes from `game.handEvents`, rendered by `HandHistory` → `HandHistoryItem` (`apps/web/src/components/features/game-recording/HandHistory.tsx`).
- **Hand identity in UI:** Each item has `hand.handSeq`; page has `gameId` → key = `(gameId, hand.handSeq)`.
- **Display:** On each hand row (e.g. right side): show emoji pills with counts (e.g. `👍 3  🔥 1`). If current user has reacted, show “mine” state (e.g. highlighted/filled).
- **Actions:** Click emoji to add; click again (or “remove”) to remove. Use a fixed emoji set (e.g. 👍 👏 🔥 😱 ❤️) to avoid abuse.
- **Optional props on `HandHistory` / `HandHistoryItem`:** e.g. `gameId`, `reactionsByHand`, `onReaction`, `onRemoveReaction` — only passed on the live page so the shared component stays generic.

---

## Polling

- The live page already polls `GET /api/games/[gameId]` (e.g. every 30s) and on visibility/focus. Once reactions are included in that response (or in a parallel reactions endpoint), the same polling pattern will keep reaction counts and “mine” state up to date. No WebSockets required for MVP.

---

## Implementation Order (When Unblocked)

1. **Auth:** Implement user authentication (anonymous or signed-in) so every spectator has a stable `user_id` (or equivalent).
2. **Schema:** Add migration for `hand_reactions` with unique `(game_id, hand_seq, emoji, user_id)` and indexes.
3. **API:** Add POST/DELETE for reactions; extend GET game (or add GET reactions) to return reaction counts and “mine” per hand/emoji.
4. **Live page:** Fetch reactions (with game or separately), pass into `HandHistory`/`HandHistoryItem`, render emoji pills and wire add/remove.
5. **Rate limiting and polish:** Per-user (and optionally per-IP) limits; fixed emoji set; accessibility (e.g. labels, keyboard).

---

## References

- Live page: `apps/web/src/app/game/[id]/live/page.tsx`
- Hand history components: `apps/web/src/components/features/game-recording/HandHistory.tsx` (`HandHistory`, `HandHistoryItem`)
- Hand identity: `(game_id, hand_seq)`; in DB `hand_events` has one row per seat, in UI grouped by `hand_seq`
- Game API: `apps/web/src/app/api/games/[gameId]/route.ts` (GET returns game + `handEvents`)
