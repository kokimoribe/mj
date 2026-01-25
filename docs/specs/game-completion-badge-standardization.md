# Game Completion Badge Standardization

## Overview

Standardize the **finished/completed** indicator badge across game pages so users see the same “Completed ✅” badge wherever a finished game is displayed.

This spec uses the existing `/games/[id]` “Completed ✅” badge as the baseline.

## User Stories

### As a user, I want finished games to be clearly marked the same way everywhere so that I don’t have to re-learn UI cues per page.

- Finished games show **“Completed ✅”** in the top-right header area on:
  - `/games/[id]`
  - `/game/[id]`
  - `/game/[id]/live`
- The badge uses the same visual treatment everywhere.

## UI/UX Specifications

### Completed badge (baseline)

- Text: `Completed ✅`
- Component: `Badge` (outline variant)
- Styling: `border-green-500 text-green-500`

### Non-finished states

- This spec only standardizes the **finished** badge.
- Existing “LIVE GAME” indicators or other non-finished status indicators remain unchanged unless explicitly updated in a future spec.

## Success Criteria

- [ ] Finished games render the baseline “Completed ✅” badge consistently on `/games/[id]`, `/game/[id]`, and `/game/[id]/live`.
- [ ] A shared component is used to avoid future divergence.
- [ ] Component tests exist to lock the baseline appearance/label.
