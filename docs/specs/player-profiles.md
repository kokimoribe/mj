# Player Profiles

## Overview

The Player Profile page provides comprehensive information about an individual player's performance in the Riichi Mahjong League. It displays rating history visualization, detailed game logs, performance statistics, and trends over the current season. This page is accessible by tapping on a player from the leaderboard or through direct navigation.

## User Stories

### As a player, I want to view my detailed statistics so that I can understand my performance

- See my current rating and rank in the league
- View my rating progression over time with a visual chart
- Check my average placement and win rate
- Review my recent game history with details

### As a player, I want to track my improvement so that I can measure progress

- See rating changes over the season with a line chart
- Compare current performance to season start
- Identify trends in my placements
- Understand which games impacted my rating most

### As a player, I want to review past games so that I can learn from results

- See chronological list of games I've played
- View placement, scores, and rating changes for each game
- See who I played against in each game
- Access game details for deeper analysis

## UI/UX Specifications

### Visual Design

```
┌─────────────────────────────────────────┐
│ ← Joseph                                │
│ Rank #1 • Rating: 46.3 • 20 games      │
├─────────────────────────────────────────┤
│ 📈 Rating Progression                   │
│                                         │
│  50 ┤              ╱╲                  │
│  45 ┤          ╱╲╱  ╲___              │
│  40 ┤      ╱╲╱           ╲            │
│  35 ┤  ___╱                           │
│  30 └─────────────────────────────     │
│     Jun         Jul         Aug         │
│                                         │
│ Current: 46.3 | 30-day: ↑4.2          │
├─────────────────────────────────────────┤
│ 🎯 Performance Stats                    │
│ Average Placement: 2.1                  │
│ Win Rate: 30% (6/20)                    │
│ Last Played: 3 days ago                 │
├─────────────────────────────────────────┤
│ 🎮 Recent Games                         │
│                                         │
│ Jul 6 • 1st • +32,700 pts • ↑0.8      │
│ vs. Alice, Mikey, Frank                 │
│                                         │
│ Jul 3 • 2nd • +15,200 pts • ↑0.3      │
│ vs. Josh, Hyun, Mikey                   │
│                                         │
│ Jul 1 • 3rd • -5,100 pts • ↓0.2       │
│ vs. Joseph, Jackie, Hyun                │
│                                         │
│ [Load More Games]                       │
└─────────────────────────────────────────┘
```

### Component Hierarchy

- `PlayerProfileView` - Main profile container
  - `ProfileHeader` - Back button, name, rank, rating, games
  - `RatingChart` - Line chart showing rating over time
    - `ChartControls` - Time range selector (if applicable)
  - `PerformanceStats` - Key statistics section
  - `GameHistory` - Recent games list
    - `GameEntry` - Individual game result
    - `LoadMoreButton` - Pagination control

### Interaction Patterns

1. **Rating Chart Interactions**
   - Tap/hover on data points to see exact values
   - Pinch to zoom on mobile (Phase 1 enhancement)
   - Smooth line interpolation between games
   - Highlight current rating point

2. **Game History**
   - Initial load shows 5 most recent games
   - "Load More" lists 5 additional games
   - App can load all historical player games, load into memory instead of making two separate db queries for first 5 recent games + all games.
   - Each game shows essential information
   - Tap game for expanded view (Phase 1)

3. **Navigation**
   - Back arrow returns to previous page
   - Swipe right to go back (iOS gesture)
   - Bottom navigation remains accessible

### Rating Chart Specifications

```
Chart Type: Line Chart
X-axis: Date of games (chronological)
Y-axis: Rating value (auto-scaled)
Data Points: One per game played
Line Style: Smooth curve, 2px width
Colors:
  - Upward trend: Green (#10b981)
  - Downward trend: Red (#ef4444)
  - Current point: Primary blue (#0ea5e9)
Touch Feedback: Show tooltip with rating value
```

### Game Entry Format

```
┌─────────────────────────────────────────┐
│ [Date] • [Placement] • [±Score] • [↑↓Rating] │
│ vs. [Opponent1], [Opponent2], [Opponent3]    │
└─────────────────────────────────────────┘
```

## Technical Requirements

### Data Model

```typescript
interface PlayerProfile {
  id: string;
  name: string;
  currentRating: number;
  currentRank: number;
  totalGamesPlayed: number;
  seasonStats: {
    averagePlacement: number;
    winRate: number;
    totalWins: number;
    lastPlayedDate: string;
    ratingChange30Days: number;
    ratingChangeSeason: number;
  };
}

interface RatingHistoryPoint {
  gameId: string;
  date: string;
  rating: number;
  ratingChange: number;
  placement: number;
}

interface GameHistoryEntry {
  id: string;
  date: string;
  placement: number;
  finalScore: number;
  scoreDelta: number; // Plus/minus adjustment
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
  opponents: Array<{
    id: string;
    name: string;
    placement: number;
  }>;
}

interface PlayerProfileData {
  profile: PlayerProfile;
  ratingHistory: RatingHistoryPoint[];
  recentGames: {
    games: GameHistoryEntry[];
    hasMore: boolean;
    nextCursor?: string;
  };
}
```

### Supabase Queries

```typescript
// Get player profile with stats and rating history
const { data: profile } = await supabase
  .from("players")
  .select(
    `
    id,
    name,
    cached_player_ratings!inner(
      rating,
      mu,
      sigma,
      games_played,
      last_game_date,
      rating_change_30d,
      rating_change_season,
      rank
    ),
    cached_player_stats!inner(
      average_placement,
      win_rate,
      total_wins
    )
  `
  )
  .eq("id", playerId)
  .eq("cached_player_ratings.config_hash", currentSeasonConfigHash)
  .eq("cached_player_stats.config_hash", currentSeasonConfigHash)
  .single();

// Get rating history for chart
const { data: ratingHistory } = await supabase
  .from("cached_game_player_results")
  .select(
    `
    game_id,
    games!inner(finished_at),
    rating_after,
    rating_change,
    placement
  `
  )
  .eq("player_id", playerId)
  .eq("config_hash", currentSeasonConfigHash)
  .order("games.finished_at", { ascending: true });

// Get paginated game history
const { data: games } = await supabase
  .from("cached_game_player_results")
  .select(
    `
    game_id,
    games!inner(
      id,
      finished_at
    ),
    placement,
    raw_score,
    score_delta,
    rating_before,
    rating_after,
    rating_change
  `
  )
  .eq("player_id", playerId)
  .eq("config_hash", currentSeasonConfigHash)
  .order("games.finished_at", { ascending: false })
  .range(offset, offset + limit - 1);

// Get opponents for each game (separate query for efficiency)
const gameIds = games.map(g => g.game_id);
const { data: opponents } = await supabase
  .from("game_seats")
  .select(
    `
    game_id,
    seat,
    player_id,
    players!inner(name),
    final_score
  `
  )
  .in("game_id", gameIds)
  .neq("player_id", playerId);
```

**Query Performance Requirements:**

- Profile query: < 200ms
- Rating history: < 300ms
- Game history: < 200ms per page
- Use React Query with 5 minute cache

### Performance Requirements

- **Page Load**: < 1.5 seconds (from navigation)
- **Chart Render**: < 300ms after data load
- **Load More**: < 500ms for additional games
- **Smooth Scrolling**: 60fps on mobile devices
- **Chart Interactions**: < 50ms response time

### Chart Library Requirements

- **Library**: Recharts or Chart.js (lightweight)
- **Bundle Impact**: < 50KB gzipped
- **Features Required**:
  - Line chart with smooth curves
  - Touch interactions
  - Responsive sizing
  - Custom tooltips
  - Accessible (keyboard + screen reader)

## Success Criteria

- [x] Profile header shows name, rank, rating, and games played
- [x] Rating chart displays with at least 2 data points
- [x] Chart shows rating progression over time chronologically
- [x] Chart has proper axis labels and scaling
- [x] Touch/click on chart shows exact rating values
- [x] Performance stats show average placement
- [x] Performance stats show win rate with fraction
- [x] Performance stats show last played date
- [x] Recent games list shows 5 most recent by default
- [x] Each game shows date, placement, score delta, rating change
- [x] Each game lists opponent names
- [x] Load more button fetches additional games
- [x] Back navigation returns to previous page
- [x] Page loads within 1.5 seconds
- [x] Chart renders smoothly without jank
- [x] Mobile layout is responsive and touch-friendly
- [x] All text meets WCAG contrast requirements

## Test Scenarios

1. **View Player Profile**
   - Given: User is on leaderboard
   - When: User taps on a player
   - Then: Profile page loads with all sections

2. **Rating Chart Display**
   - Given: Player has played multiple games
   - When: Profile page loads
   - Then: Chart shows rating progression over time

3. **Chart Interaction**
   - Given: Rating chart is displayed
   - When: User taps on a data point
   - Then: Tooltip shows exact rating value

4. **Load Game History**
   - Given: Player has more than 5 games
   - When: User taps "Load More Games"
   - Then: Additional 5 games load below existing ones

5. **Navigate Back**
   - Given: User is viewing a profile
   - When: User taps back arrow
   - Then: Returns to previous page (leaderboard)

6. **Empty State - New Player**
   - Given: Player has < 2 games
   - When: Viewing their profile
   - Then: Shows "Not enough data" for chart

7. **Performance Stats Calculation**
   - Given: Player has played games
   - When: Viewing stats section
   - Then: Average placement calculates correctly

8. **Opponent Display**
   - Given: Game history is shown
   - When: Viewing game entries
   - Then: All three opponents listed for each game

## Edge Cases

1. **Single Game**: Show message "Need more games for chart"
2. **No Games**: Show empty state with encouraging message
3. **Very High/Low Ratings**: Chart scales appropriately
4. **Long Name**: Truncate with ellipsis in header
5. **Missing Data**: Show placeholders for unavailable stats
6. **Rating Decrease Only**: Chart still displays properly
7. **Timezone Handling**: Show dates in user's timezone

## Mobile Optimizations

1. **Touch Targets**: Minimum 44x44px for all tappable elements
2. **Swipe Gestures**: Right swipe for back navigation
3. **Chart Touch**: Large touch targets for data points
4. **Scroll Performance**: Use CSS transforms for smooth scrolling
5. **Load More**: Large button easy to tap
6. **Font Sizes**: Minimum 14px for readability
