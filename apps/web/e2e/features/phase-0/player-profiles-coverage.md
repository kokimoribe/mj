# Player Profiles Test Coverage Checklist

## Test Scenarios from Specification

### E2E Tests (player-profiles.spec.ts)

- [x] View Player Profile - Navigate from leaderboard and verify all sections
- [x] Rating Chart Display - Shows progression with discrete points
- [x] Chart Interaction - Tooltip shows on hover/tap
- [x] Load Game History - Shows more games on click (client-side)
- [x] Navigate Back - Returns to previous page
- [x] Empty State - New Player - Shows message for < 2 games
- [x] Performance Stats Calculation - Shows average placement
- [x] Opponent Display - Shows clickable opponent names
- [x] Direct URL Navigation - Loads specific player via /player/[id]

### Component Tests (PlayerProfileView.spec.tsx)

- [x] Data Model - All required fields (id, name, rating, rank, games)
- [x] Rank Calculation - Client-side from leaderboard position
- [x] Chart Display - Shows discrete points with single color
- [x] 30-day Change - Calculates delta or shows N/A
- [x] Chart Edge Case - Shows message for < 2 games
- [x] Average Placement - Calculates mean of all placements
- [x] Last Played Date - Shows formatted date
- [x] No Win Rate - Verifies win rate is not displayed
- [x] All Games Loaded - Single query loads all games
- [x] Client-side Pagination - Shows 5 initially, more on click
- [x] Opponent Links - 3 clickable opponent names
- [x] Game Format - Date • Placement • Score • Rating Change
- [x] Empty State - Encouraging message for 0 games
- [x] Long Name Truncation - Ellipsis for overflow
- [x] Loading State - Shows skeletons
- [x] Error State - Shows error message
- [x] Accessibility - ARIA labels and keyboard navigation

## Success Criteria Coverage

- [x] Profile header shows name, rank, rating, and games played
- [x] Rating chart displays with at least 2 data points
- [x] Chart shows rating progression over time chronologically
- [x] Chart has proper axis labels and scaling
- [x] Touch/click on chart shows exact rating values
- [x] Performance stats show average placement (mean)
- [x] Performance stats show last played date
- [x] Performance stats show 30-day rating change
- [x] Recent games list shows 5 most recent by default
- [x] Each game shows date, placement, score delta, rating change
- [x] Each game lists opponent names (clickable)
- [x] Show more button reveals additional games (client-side)
- [x] Back navigation returns to previous page
- [x] Page loads within 1.5 seconds
- [x] Chart renders smoothly without jank
- [x] Mobile layout is responsive and touch-friendly
- [x] All text meets WCAG contrast requirements

## Edge Cases Coverage

- [x] Single Game - Show message "Need more games for chart"
- [x] No Games - Show empty state with encouraging message
- [x] Very High/Low Ratings - Chart auto-scales appropriately
- [x] Long Name - Truncate with ellipsis in header
- [x] Missing 30-day Data - Show "N/A" for 30-day rating change
- [ ] Rating Decrease Only - Chart displays normally with green points
- [ ] Timezone Handling - Show dates in user's timezone
- [ ] Name Changes - Always show current name (queried by player_id)
- [ ] Tied Placements - Display as provided by data
- [ ] High Sigma (Provisional) - Display same as established ratings

## Technical Requirements Coverage

### Data Strategy

- [x] OpenSkill ratings (μ, σ) - From materialized data
- [x] Rating history array - For chart rendering
- [x] Current rank - Calculated from leaderboard
- [x] Average placement - Client-side calculation
- [x] 30-day rating change - Client-side calculation
- [x] Player names - Current names by player_id
- [x] Opponent information - With current names

### Supabase Queries

- [ ] Player data query with cached_player_ratings
- [ ] Leaderboard query for rank calculation
- [ ] All games query (no pagination)
- [ ] Opponents query with player names
- [ ] Configuration hash usage

### Performance

- [x] Page Load < 1.5 seconds
- [x] Chart Render < 300ms after data
- [x] Show More Games - Instant (client-side)
- [x] Smooth Scrolling - 60fps on mobile
- [x] Chart Interactions < 50ms response

### Chart Library

- [ ] @shadcn/ui charts implementation
- [x] Scatter plot with discrete points
- [x] Touch/hover interactions
- [x] Responsive sizing
- [x] Custom tooltips
- [x] Single color theme (#10b981)

## Mobile Optimizations

- [x] Touch Targets - Minimum 44x44px
- [ ] Swipe Gestures - Right swipe for back
- [x] Chart Touch - Large targets for data points
- [ ] Scroll Performance - CSS transforms
- [x] Load More - Large button
- [x] Font Sizes - Minimum 14px

## Implementation Notes Coverage

- [x] Removed "Advanced Stats" toggle
- [x] Removed "Quick Stats" distinction
- [x] Removed win rate calculations
- [ ] Configuration hash consistency with leaderboard
- [x] All games loading acceptable for < 100 games

## Missing Test Coverage

1. **Supabase Integration**: Current tests mock data, need actual Supabase queries
2. **Chart Library**: Need to test actual @shadcn/ui chart implementation
3. **Swipe Gestures**: Mobile swipe-to-go-back functionality
4. **Timezone Handling**: Proper date display in user timezone
5. **Name Change Handling**: Verify current names always shown
6. **Configuration Hash**: Consistent usage across features
7. **Rating Decrease Only**: Visual verification of green color
8. **Tied Placements**: How ties are displayed in games
