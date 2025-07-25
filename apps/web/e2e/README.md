# E2E Test Suite for Riichi Mahjong League

This test suite is aligned with the Product Requirements Document and serves as a progress meter for implementation.

## Test Structure

```
e2e/
├── features/                    # Main test suites aligned with product requirements
│   ├── league-standings.spec.ts # Home/leaderboard experience
│   ├── player-profiles.spec.ts  # Player detail views
│   ├── game-history.spec.ts     # Games feed
│   └── pwa-features.spec.ts     # Progressive Web App functionality
│
├── user-stories/               # User-focused scenario tests (kept for narrative testing)
│   ├── view-rankings.spec.ts
│   ├── player-profile.spec.ts
│   ├── find-information.spec.ts
│   ├── mobile-usage.spec.ts
│   └── game-entry.spec.ts
│
├── integration/                # Data flow and integration tests
│   ├── game-history-data-flow.spec.ts
│   ├── mini-chart-data-flow.spec.ts
│   └── rating-delta-calculation.spec.ts
│
├── data-validation/            # Data integrity and validation tests
│   ├── calculation-validation.spec.ts
│   └── data-validation.spec.ts
│
├── visual-regression/          # Screenshot-based visual tests
│   └── screenshots.spec.ts
│
└── features/
    ├── data-integrity/
    │   └── nan-handling.spec.ts
    └── phase-0/                # Legacy tests with unique edge cases
        ├── data-edge-cases.spec.ts
        ├── leaderboard-expanded-card.spec.ts
        └── rating-calculation-regression.spec.ts
```

## Running Tests

### Run all product requirement tests:

```bash
npm run test:e2e -- features/
```

### Run specific feature:

```bash
npm run test:e2e -- features/league-standings.spec.ts
```

### Run user story tests:

```bash
npm run test:e2e -- user-stories/
```

### Run with UI mode for debugging:

```bash
npm run test:e2e -- --ui
```

## Test Philosophy

1. **User-Focused**: Tests describe what users see and do, not technical implementation
2. **Product Aligned**: Every test traces to a requirement in the Product Requirements Document
3. **Progress Tracking**: Failed tests indicate missing or incomplete features
4. **Mobile-First**: Includes mobile-specific scenarios and touch interactions

## Key Test IDs

The tests expect these `data-testid` attributes in the implementation:

### League Standings (Home)

- `leaderboard-view` - Main container
- `player-card-{id}` - Individual player cards
- `player-name` - Player name display
- `player-rating` - Current rating score
- `rating-change` - Rating movement indicator
- `expanded-content` - Expanded card content
- `season-summary` - Games/players count
- `last-updated` - Timestamp
- `offline-indicator` - Offline mode indicator

### Player Profiles

- `player-header` - Header section
- `player-rank` - Rank display (#1, #2, etc.)
- `total-games` - Games played count
- `rating-chart` - Line chart container
- `time-filter-buttons` - 7d/14d/30d/All buttons
- `performance-metrics` - Stats section
- `avg-placement` - Average placement value
- `30d-rating-change` - 30-day change
- `last-played` - Last game date
- `game-history` - Recent games section
- `game-entry` - Individual game row
- `opponent-link` - Clickable opponent name
- `load-more-games` - Load more button

### Game History

- `game-history-view` - Main container
- `game-card` - Individual game card
- `game-date` - Date/time display
- `player-result` - Player result row
- `placement` - Medal emoji
- `final-score` - Point score
- `rating-change` - Rating delta
- `player-filter` - Filter dropdown
- `filter-option` - Dropdown option
- `load-more-button` - Load more games
- `show-less-button` - Show less games

### PWA Features

- `pwa-install-prompt` - Installation prompt
- `install-button` - Install CTA
- `dismiss-button` - Dismiss button
- `offline-indicator` - Offline status

### Navigation

- `bottom-navigation` - Bottom nav bar
- `back-button` - Back navigation

## Success Criteria

Tests validate:

- ✅ All features work as described in Product Requirements
- ✅ Pages load in < 2 seconds
- ✅ Mobile touch targets are ≥ 44x44px
- ✅ Offline mode works with cached data
- ✅ No uma/oka values are displayed (internal calculations only)
- ✅ Rating charts show accumulated values like stock prices
- ✅ All user flows are smooth and intuitive

## Maintenance

When adding new features:

1. Add tests to the appropriate feature file
2. Use consistent test IDs
3. Focus on user-visible behavior
4. Include mobile scenarios
5. Test edge cases and error states
