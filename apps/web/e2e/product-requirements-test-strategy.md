# Product Requirements Test Strategy

This document outlines the test strategy aligned with the unified Product Requirements document.

## Test Structure

We'll organize tests into 4 main feature areas matching the product requirements:

1. **league-standings.spec.ts** - Tests for the home/leaderboard experience
2. **player-profiles.spec.ts** - Tests for individual player views
3. **game-history.spec.ts** - Tests for the games feed
4. **pwa-features.spec.ts** - Tests for Progressive Web App functionality

## Test Coverage Map

### 1. League Standings (Home)

**Core Features to Test**:

- [ ] Players display in rating order (highest first)
- [ ] Current rating scores visible for each player
- [ ] Rating movement indicators (↑2.4 or ↓1.2) with colors
- [ ] Expandable player cards on tap
- [ ] Mini performance chart in expanded view
- [ ] Pull to refresh functionality
- [ ] Last updated timestamp
- [ ] Season summary (total games and active players)
- [ ] Offline mode with cached data
- [ ] Touch targets minimum 44x44px
- [ ] Smooth expand/collapse animations

### 2. Player Profiles

**Core Features to Test**:

- [ ] Player header with name, rank (#1, #2), rating, total games
- [ ] Rating chart displays like stock price chart
- [ ] Chart shows accumulated ratings (not deltas)
- [ ] Interactive chart with tap/hover for exact values
- [ ] Time period filters (7d, 14d, 30d, All)
- [ ] Average placement calculation
- [ ] 30-day rating change display
- [ ] Last played date
- [ ] Recent games list with proper formatting
- [ ] Rating changes per game (↑2.4)
- [ ] Clickable opponent names
- [ ] Load more games functionality
- [ ] Navigation from leaderboard
- [ ] Direct URL access (/player/[id])
- [ ] Back navigation

### 3. Game History

**Core Features to Test**:

- [ ] Games in reverse chronological order
- [ ] Date and time display
- [ ] 4 players with placement medals (🥇🥈🥉4️⃣)
- [ ] Final scores in points (with commas)
- [ ] Rating changes for each player (↑1.2 or ↓0.8)
- [ ] Player filter dropdown
- [ ] Game count per player in dropdown
- [ ] "All Games" filter option
- [ ] Initial 10 games display
- [ ] Load More / Show Less toggle
- [ ] NO uma/oka adjustments shown
- [ ] Only final table scores displayed

### 4. PWA Features

**Core Features to Test**:

- [ ] Installation prompt appears
- [ ] Dismissible with remembered preference
- [ ] Auto-hidden when already installed
- [ ] Offline data viewing
- [ ] Offline indicator
- [ ] Auto-sync on reconnection
- [ ] Home screen installation
- [ ] App manifest configuration

## Performance Requirements

All tests should validate:

- Page load < 2 seconds
- Time to interactive < 1 second
- 60fps animations
- Zero layout shift (CLS < 0.1)

## Test Removal Strategy

### Tests to Remove/Consolidate:

1. All adhoc/ tests - these were for debugging specific issues
2. Duplicate validation tests
3. Tests checking for uma/oka display (now explicitly NOT shown)
4. Tests for features not in requirements (advanced stats, win rates)

### Tests to Keep/Update:

1. Core user flow tests
2. Data integrity tests
3. Performance tests
4. Accessibility tests

## Implementation Priority

1. **Phase 1**: Core functionality tests
   - Basic display and navigation
   - Data accuracy
   - User interactions

2. **Phase 2**: Edge cases and error states
   - Empty states
   - Network failures
   - Invalid data

3. **Phase 3**: Performance and accessibility
   - Load times
   - Animation smoothness
   - Screen reader support
   - Keyboard navigation
