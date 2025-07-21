# PWA Leaderboard

## Overview

The PWA Leaderboard is the primary landing page of the Riichi Mahjong League application, displaying current season rankings with OpenSkill ratings. It provides a mobile-first, installable Progressive Web App experience optimized for iOS devices, showing player standings at a glance with expandable details for deeper insights.

## User Stories

### As a player, I want to view current rankings so that I can see where I stand

- See my position in the leaderboard immediately upon opening the app
- View my current rating with the latest change indicator
- Compare my standing against other players
- Understand how many games I've played this season

### As a player, I want to install the app on my phone so that I can access it like a native app

- Install the PWA on iOS Safari with an app icon
- Launch from home screen without browser UI
- Access the app offline with cached data
- Receive a smooth app-like experience

### As a player, I want to see rating trends so that I can track progress

- View rating change since last game (↑/↓ indicators)
- Tap on a player to see expanded statistics
- Pull to refresh for latest data
- See when the data was last updated

## UI/UX Specifications

### Visual Design

```
┌─────────────────────────────────────────┐
│ 🀄 Riichi League  [Season 3] [Menu ≡]   │
├─────────────────────────────────────────┤
│ 🏆 Season 3 Leaderboard                 │
│ 24 games • 7 players • Updated 2h ago   │
├─────────────────────────────────────────┤
│ Joseph     46.3  ↑2.1    20 games      │
│ Josh       39.2  ↓0.8    16 games      │
│ Mikey      36.0  ↑0.4    23 games      │
│ Hyun       32.2  ↓1.2    14 games      │
│ Koki       31.9  ↑0.6    20 games      │
│ Rayshone   20.5  ↑4.2     2 games      │
│ Jackie     15.4  ↑9.1     1 game       │
├─────────────────────────────────────────┤
│ [Leaderboard] [Players] [Games] [Stats] │
└─────────────────────────────────────────┘
```

**Note**: "Updated 2h ago" is calculated from the `materialized_at` timestamp in the cached data.

### Component Hierarchy

- `AppLayout` - Main app wrapper with header and navigation
  - `Header` - App title, season selector, menu
  - `LeaderboardView` - Main content area
    - `SeasonSummary` - Games count, player count, last update
    - `PlayerList` - Scrollable list of players
      - `ExpandablePlayerCard` - Individual player row
  - `BottomNavigation` - Tab-based navigation

### Interaction Patterns

1. **Pull to Refresh**
   - Drag down from top to refresh data
   - Show loading spinner during refresh
   - Haptic feedback on refresh trigger
   - Invalidates all React Query caches
   - Shows dismissible error toast on failure

2. **Expandable Cards**
   - Tap player row to expand
   - Smooth animation (200ms)
   - Show average placement and mini rating chart
   - "View Full Profile →" link

3. **Navigation**
   - Bottom tab navigation for mobile
   - Active tab highlighted with primary color
   - Maintain scroll position when switching tabs

### Expanded Card View

```
┌─────────────────────────────────────────┐
│ Joseph     46.3  ↑2.1    20 games       │
├─────────────────────────────────────────┤
│ Avg Placement: 2.1                      │
│ Win Rate: 30%                           │
│ Last Played: 3 days ago                 │
│                                         │
│ Rating Trend: ▁▂▄█▆▇█ (last 10 games)  │
│                                         │
│ [View Full Profile →]                   │
└─────────────────────────────────────────┘
```

**Note**: The sparkline shows the last 10 rating values from the `rating_history` array. If fewer than 10 games, show all available data points.

## Technical Requirements

### Data Model

```typescript
interface Player {
  id: string;
  name: string;
  rating: number;
  ratingChange: number;
  gamesPlayed: number;
  rank: number; // Calculated client-side based on rating order
  ratingHistory?: number[]; // Array of last 10 ratings for sparkline
  averagePlacement?: number; // Calculated on-demand
  winRate?: number; // Calculated on-demand
  lastPlayed?: string; // From last_game_date or calculated
}

interface LeaderboardData {
  season: {
    id: string;
    name: string;
    totalGames: number; // Derived from max games_played
    activePlayers: number; // Count of players array
    lastUpdated: string; // From materialized_at timestamp
  };
  players: Player[];
}
```

### Configuration

```typescript
// Default season config hash (manually updated per season)
const DEFAULT_SEASON_CONFIG_HASH = "season_3_2024"; // Update this value for new seasons

// Get current season configuration
const currentSeasonConfigHash = process.env.NEXT_PUBLIC_SEASON_CONFIG_HASH || DEFAULT_SEASON_CONFIG_HASH;
```

### Supabase Queries

```typescript
// Get current season leaderboard with materialization timestamp
const { data: leaderboard } = await supabase
  .from("cached_player_ratings")
  .select(
    `
    player_id,
    players!inner(
      id,
      name
    ),
    rating,
    mu,
    sigma,
    games_played,
    last_game_date,
    rating_change,
    rating_history,
    materialized_at
  `
  )
  .eq("config_hash", currentSeasonConfigHash)
  .order("rating", { ascending: false });

// Calculate season metadata client-side
const seasonData = {
  totalGames: Math.max(...leaderboard.map(p => p.games_played)),
  activePlayers: leaderboard.length,
  lastUpdated: leaderboard[0]?.materialized_at || new Date().toISOString()
};

// Calculate player stats for expanded view (client-side)
function calculatePlayerStats(playerId: string, allGames: GameResult[]) {
  const playerGames = allGames.filter(g => 
    g.players.some(p => p.id === playerId)
  );
  
  const placements = playerGames.map(g => {
    const player = g.players.find(p => p.id === playerId);
    return player.placement;
  });
  
  return {
    averagePlacement: placements.reduce((a, b) => a + b, 0) / placements.length,
    winRate: (placements.filter(p => p === 1).length / placements.length) * 100,
    lastPlayed: playerGames[0]?.date
  };
}

// Alternative: If stats need to be materialized, query from cached results
const { data: playerGameResults } = await supabase
  .from("cached_game_player_results")
  .select(
    `
    placement,
    games!inner(finished_at)
  `
  )
  .eq("player_id", playerId)
  .eq("config_hash", currentSeasonConfigHash)
  .order("games.finished_at", { ascending: false })
  .limit(10); // For sparkline data
```

**Query Performance Requirements:**

- Initial leaderboard query: < 200ms
- Player summary query: < 100ms
- Use React Query for client-side caching (5 minute stale time)

### Performance Requirements

- **Initial Load**: < 2 seconds on 3G mobile connection
- **Time to Interactive**: < 1 second
- **Refresh Action**: < 500ms with optimistic UI
- **Card Expansion**: < 100ms animation
- **Offline Support**: Show cached data when offline

### PWA Requirements

1. **Web App Manifest**
   - App name: "Riichi League"
   - Short name: "Mahjong"
   - Theme color: Match app primary color
   - Background color: Dark theme background
   - Icons: Multiple sizes for iOS/Android

2. **Service Worker**
   - Cache-first strategy for app shell
   - Network-first for API data with fallback
   - Cache duration: 2 days for offline data
   - Simple offline indicator when no connection

3. **iOS Specific**
   - Apple touch icons
   - Status bar styling
   - Splash screens for different devices
   - Viewport meta tags for proper scaling

## Success Criteria

- [x] PWA installable on iOS devices via Safari
- [x] Leaderboard displays all active players with current ratings
- [x] Ratings show with OpenSkill calculation (μ - 2σ)
- [x] Rating changes display since last game (↑/↓ with value)
- [x] Pull to refresh updates data from server
- [x] Player cards expand on tap with smooth animation
- [x] Expanded cards show additional stats (avg placement, games)
- [x] "View Full Profile" navigates to player detail page
- [x] Bottom navigation allows switching between main sections
- [x] Last update timestamp shows data freshness
- [x] Offline mode shows cached data with indicator
- [x] Page loads in under 2 seconds on mobile
- [x] No layout shift during load (CLS < 0.1)
- [x] Touch targets meet 44x44px minimum
- [x] Proper ranking order (highest rating first)

## Test Scenarios

1. **PWA Installation Flow**
   - Given: User visits the app in iOS Safari
   - When: User taps "Share" → "Add to Home Screen"
   - Then: App installs with custom icon and launches fullscreen

2. **View Current Rankings**
   - Given: User opens the app
   - When: Leaderboard loads
   - Then: Players display in rating order with current values

3. **Pull to Refresh**
   - Given: User is viewing the leaderboard
   - When: User pulls down from top
   - Then: Data refreshes and shows latest ratings

4. **Expand Player Details**
   - Given: User sees the leaderboard
   - When: User taps on a player row
   - Then: Card expands showing additional statistics

5. **Offline Access**
   - Given: User has previously loaded the app
   - When: User opens app without internet
   - Then: Cached leaderboard displays with offline indicator

6. **Navigate to Profile**
   - Given: User has expanded a player card
   - When: User taps "View Full Profile"
   - Then: App navigates to detailed player profile page

7. **Rating Change Indicators**
   - Given: A player's rating has changed
   - When: Viewing the leaderboard
   - Then: Shows ↑ or ↓ with the change amount

8. **Season Summary Display**
   - Given: Season has active games
   - When: Viewing leaderboard header
   - Then: Shows total games, player count, and last update time

## Edge Cases

1. **No Games Played**: Show "0 games played" message
2. **Single Player**: Still show leaderboard format
3. **Tied Ratings**: Sort by games played, then alphabetically
4. **Very Long Names**: Truncate with ellipsis on mobile
5. **Stale Data**: Show warning if data > 24 hours old
6. **Query Failures**: Show stale data if available, otherwise error message
7. **Offline Mode**: Basic functionality maintained, no pull-to-refresh

## Accessibility Requirements

- **Screen Reader Support**: Proper ARIA labels for rankings
- **Keyboard Navigation**: Tab through players, Enter to expand
- **Color Contrast**: WCAG AA compliance for all text
- **Focus Indicators**: Visible focus states for all interactive elements
- **Motion Preferences**: Respect reduced motion settings
