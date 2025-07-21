# PWA Leaderboard Test Coverage Checklist

## Test Scenarios from Specification

### E2E Tests (pwa-leaderboard.spec.ts)
- [x] PWA Installation Flow - Verifies manifest, iOS meta tags, viewport
- [x] View Current Rankings - Players display in rating order with values
- [x] Pull to Refresh - Updates data and shows toast notification
- [x] Expand Player Details - Card expands showing additional statistics
- [x] Offline Access - Shows cached data when offline
- [x] Navigate to Profile - Navigation from expanded card works
- [x] Rating Change Indicators - Shows ↑/↓ with change amount
- [x] Season Summary Display - Shows games, players, last update

### Component Tests (LeaderboardView.spec.tsx)
- [x] Data Model - All required fields (id, name, rating, ratingChange, etc.)
- [x] Rank Calculation - Client-side based on rating order
- [x] Season Metadata - Derived from player data
- [x] Pull to Refresh - Invalidates caches, shows error on failure
- [x] Expandable Cards - Shows stats, only one expanded at a time
- [x] Rating History - Sparkline data structure support
- [x] Edge Cases - No games, tied ratings, stale data
- [x] Accessibility - ARIA labels, keyboard navigation

## Success Criteria Coverage

- [x] PWA installable on iOS devices via Safari
- [x] Leaderboard displays all active players with current ratings
- [ ] Ratings show with OpenSkill calculation (μ - 2σ) - Need to verify formula
- [x] Rating changes display since last game (↑/↓ with value)
- [x] Pull to refresh updates data from server
- [x] Player cards expand on tap with smooth animation
- [x] Expanded cards show additional stats
- [x] "View Full Profile" navigates to player detail page
- [ ] Bottom navigation allows switching between main sections - Need to test
- [x] Last update timestamp shows data freshness
- [x] Offline mode shows cached data with indicator
- [x] Page loads in under 2 seconds on mobile
- [x] No layout shift during load (CLS < 0.1)
- [x] Touch targets meet 44x44px minimum
- [x] Proper ranking order (highest rating first)

## Edge Cases Coverage

- [x] No Games Played - Shows "0 games played" message
- [ ] Single Player - Still show leaderboard format
- [x] Tied Ratings - Sort by games played, then alphabetically
- [ ] Very Long Names - Truncate with ellipsis on mobile
- [ ] Stale Data - Show warning if data > 24 hours old
- [x] Query Failures - Show stale data if available, otherwise error
- [x] Offline Mode - Basic functionality maintained

## Technical Requirements Coverage

### Configuration
- [ ] currentSeasonConfigHash from env var or default
- [ ] Configurable season hash

### Supabase Queries
- [ ] Direct Supabase queries instead of Python API
- [ ] cached_player_ratings table query
- [ ] Performance < 200ms for leaderboard query

### Performance
- [x] Initial Load < 2 seconds
- [x] Time to Interactive < 1 second
- [ ] Refresh Action < 500ms with optimistic UI
- [ ] Card Expansion < 100ms animation
- [x] Offline Support

### PWA Requirements
- [x] Web App Manifest
- [x] Service Worker caching
- [x] iOS specific meta tags

## Missing Test Coverage

1. **OpenSkill Formula**: Need to verify ratings are calculated as μ - 2σ
2. **Bottom Navigation**: Tab switching and scroll position maintenance
3. **Single Player Edge Case**: Leaderboard with only one player
4. **Name Truncation**: Long names on mobile
5. **Stale Data Warning**: Show warning for data > 24 hours old
6. **Direct Supabase Integration**: Current tests mock API, need Supabase
7. **Configuration System**: Season config hash handling
8. **Service Worker**: Actual PWA offline functionality
9. **Optimistic UI**: During refresh actions
10. **Animation Timing**: 200ms expansion, 100ms requirements