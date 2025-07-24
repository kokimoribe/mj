# Player Profiles

## Overview

The Player Profile page provides comprehensive information about an individual player's performance in the Riichi Mahjong League. It displays rating history visualization, detailed game logs, performance statistics, and trends over the current season. This page is accessible by tapping on a player from the leaderboard or through direct navigation (e.g., `/player/[id]`).

## User Stories

### As a player, I want to view my detailed statistics so that I can understand my performance

- See my current rating and rank in the league
- View my rating progression over time with a visual chart
- Check my average placement across all games
- Review my complete game history with details

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
│ [7d] [14d] [30d] [All]                 │
│                                         │
│  50 ┤              •                   │
│  45 ┤          •  •  •                │
│  40 ┤      •  •        •              │
│  35 ┤  •  •                           │
│  30 └─────────────────────────────     │
│     Jun         Jul         Aug         │
│                                         │
│ Current: 46.3 | Period Δ: ↑4.2         │
├─────────────────────────────────────────┤
│ 🎯 Performance Stats                    │
│ Average Placement: 2.1                  │
│ Last Played: 3 days ago                 │
├─────────────────────────────────────────┤
│ 🎮 Recent Games • Showing 5 of 20       │
│                                         │
│ Jul 6 • 1st • +32,700 pts • ↑0.8      │
│ vs. Alice, Mikey, Frank                 │
│                                         │
│ Jul 3 • 2nd • +15,200 pts • ↑0.3      │
│ vs. Josh, Hyun, Mikey                   │
│                                         │
│ Jul 1 • 3rd • -5,100 pts • ↓0.2       │
│ vs. Koki, Jackie, Hyun                  │
│                                         │
│ [Show More Games]                       │
└─────────────────────────────────────────┘
```

**Note**: The chart shows discrete points for each game played. All games are loaded initially and paginated client-side (showing 5 at a time).

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
   - Single green color (#10b981) for all data points
   - Discrete points for each game (no connecting lines by default)
   - Highlight current rating point
   - Simple scatter plot visualization (simpler is better)

2. **Game History**
   - All games loaded initially (single query)
   - Client-side pagination showing 5 games at a time
   - Shows "Showing X of Y" indicator in header
   - "Show More Games" reveals next 5 games
   - Each game shows placement, score, rating change
   - Opponent names are clickable links to their profiles

3. **Navigation**
   - Back arrow returns to leaderboard (simplest approach)
   - Swipe right to go back (iOS gesture)
   - Bottom navigation remains accessible
   - Direct URL access via `/player/[id]`

### Rating Chart Specifications

```
Chart Type: Interactive Scatter Plot with Time Range Selection
X-axis: Date of games (chronological)
Y-axis: Rating value (auto-scaled with padding)
Data Points: One per game played
Point Style: Filled circles, 6px diameter
Time Range Selector:
  - Options: [7d] [14d] [30d] [All]
  - Default: All games
  - Updates chart and delta calculation

Interactive Features:
  - Touch/hover on points: Show tooltip with rating and date
  - Mobile: Touch points for details
  - Desktop: Hover for instant feedback
  - Simple value display (no crosshair)

Visual Design:
  - All points: Green (#10b981) - single color
  - Current point: Larger size (8px) with label
  - Background grid: Subtle gray
  - Clean, minimalist appearance

Chart Library: @shadcn/ui charts (based on Recharts)
Note: Keep visualization simple - no zoom controls or complex interactions
```

### Game Entry Format

```
┌─────────────────────────────────────────┐
│ [Date] • [Placement] • [±Score] • [↑↓Rating] │
│ vs. [Opponent1], [Opponent2], [Opponent3]    │
└─────────────────────────────────────────┘
```

## Technical Requirements

### Data Strategy

**Materialization Requirements:**

- OpenSkill ratings (μ, σ) - Must be calculated in Python serverless function
- Rating history array - Materialized for efficient chart rendering
- Games played count - Can be materialized or calculated from games
- Last game date - Can be materialized or derived from games

**Client-side Calculations:**

- Current rank - Calculated from leaderboard position
- Average placement - Mean of all game placements
- Time-based rating changes:
  - 7-day: Delta from oldest game within 7 days
  - 14-day: Delta from oldest game within 14 days
  - 30-day: Delta from oldest game within 30 days
  - All-time: Delta from first game in season
- Dynamic period delta - Updates based on selected time range in chart

**Runtime Queries:**

- Player names - Always fetch current names by player_id
- Opponent information - Join with players table for current names

### Data Model

```typescript
interface PlayerProfile {
  id: string;
  name: string;
  currentRating: number;
  currentRank: number; // Position in leaderboard (calculated client-side from cached leaderboard data)
  totalGamesPlayed: number;
  seasonStats: {
    averagePlacement: number; // Mean of all placements
    lastPlayedDate: string;
    ratingChangePeriod: number | null; // Delta for selected time period
    selectedPeriod: "7d" | "14d" | "30d" | "all"; // Current selection
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
  }>; // Always 3 opponents in 4-player mahjong
}

interface PlayerProfileData {
  profile: PlayerProfile;
  ratingHistory: RatingHistoryPoint[]; // All games for chart
  allGames: GameHistoryEntry[]; // All games loaded at once
  currentSeasonConfigHash: string;
}
```

### Supabase Queries

```typescript
// Configuration from environment or default
// Must match the configuration used in leaderboard feature
const currentSeasonConfigHash =
  process.env.NEXT_PUBLIC_SEASON_CONFIG_HASH || "season_3_2024";

// Get player basic info and current rating
const { data: playerData } = await supabase
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
      rating_history
    )
  `
  )
  .eq("id", playerId)
  .eq("cached_player_ratings.config_hash", currentSeasonConfigHash)
  .single();

// Get current leaderboard to calculate rank
const { data: leaderboard } = await supabase
  .from("cached_player_ratings")
  .select("player_id, rating")
  .eq("config_hash", currentSeasonConfigHash)
  .order("rating", { ascending: false });

// Calculate rank client-side from cached leaderboard position
const currentRank = leaderboard.findIndex(p => p.player_id === playerId) + 1;

// Get ALL games for this player (no pagination in query)
const { data: allGames } = await supabase
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
  .order("games.finished_at", { ascending: false });

// Get opponents for all games in a single query
const gameIds = allGames.map(g => g.game_id);
const { data: allOpponents } = await supabase
  .from("game_seats")
  .select(
    `
    game_id,
    seat,
    player_id,
    players!inner(id, name),
    final_score,
    placement
  `
  )
  .in("game_id", gameIds)
  .order("seat", { ascending: true });

// Group opponents by game
const opponentsByGame = allOpponents.reduce((acc, opp) => {
  if (!acc[opp.game_id]) acc[opp.game_id] = [];
  if (opp.player_id !== playerId) {
    acc[opp.game_id].push({
      id: opp.player_id,
      name: opp.players.name,
      placement: opp.placement,
    });
  }
  return acc;
}, {});

// Calculate statistics client-side
const placements = allGames.map(g => g.placement);
const averagePlacement =
  placements.reduce((a, b) => a + b, 0) / placements.length;

// Calculate rating changes for different time periods
function calculateRatingDelta(
  days: number,
  allGames: GameResult[],
  currentRating: number
) {
  if (days === null) {
    // "All" period - use first game
    const firstGame = allGames[allGames.length - 1];
    return firstGame ? currentRating - firstGame.rating_before : null;
  }

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - days);

  // Find oldest game within the time period
  const gamesInPeriod = allGames.filter(
    g => new Date(g.games.finished_at) >= targetDate
  );

  if (gamesInPeriod.length === 0) return null;

  // Get the oldest game's rating_before as baseline
  const oldestGameInPeriod = gamesInPeriod[gamesInPeriod.length - 1];
  return currentRating - oldestGameInPeriod.rating_before;
}

// Usage for different periods
const rating7Days = calculateRatingDelta(7, allGames, currentRating);
const rating14Days = calculateRatingDelta(14, allGames, currentRating);
const rating30Days = calculateRatingDelta(30, allGames, currentRating);
const ratingAllTime = calculateRatingDelta(null, allGames, currentRating);
```

**Query Performance Requirements:**

- Player data query: < 200ms
- Leaderboard query (for rank): < 200ms
- All games query: < 500ms (expecting < 100 games per player)
- Opponents query: < 300ms
- Use React Query with 5 minute stale time
- All queries can run in parallel

### Performance Requirements

- **Page Load**: < 1.5 seconds (from navigation)
- **Chart Render**: < 300ms after data load
- **Load More**: < 500ms for additional games
- **Smooth Scrolling**: 60fps on mobile devices
- **Chart Interactions**: < 50ms response time

### Chart Library Requirements

- **Library**: @shadcn/ui charts (based on Recharts)
- **Bundle Impact**: Included in shadcn/ui components
- **Features Required**:
  - Scatter plot with discrete points
  - Touch/hover interactions for tooltips
  - Responsive sizing
  - Custom tooltips showing rating and date
  - Accessible (keyboard + screen reader)
  - Single color theme (#10b981)

## Success Criteria

- [x] Profile header shows name, rank, rating, and games played
- [x] Rating chart displays with at least 2 data points
- [x] Chart shows rating progression over time chronologically
- [x] Chart has proper axis labels and scaling
- [x] Touch/click on chart shows exact rating values
- [x] Performance stats show average placement (mean)
- [x] Performance stats show last played date
- [x] Performance stats show 30-day rating change
- [x] Recent games list shows 5 most recent by default
- [x] Shows "Showing X of Y" games indicator
- [x] Each game shows date, placement, score delta, rating change
- [x] Each game lists opponent names (clickable)
- [x] Show more button reveals additional games (client-side)
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
   - When: User taps "Show More Games"
   - Then: Next 5 games appear instantly (client-side)

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
   - Then: Average placement shows mean value

8. **Opponent Display**
   - Given: Game history is shown
   - When: Viewing game entries
   - Then: All three opponents listed with clickable names

9. **Direct URL Navigation**
   - Given: User has player ID
   - When: Navigating to /player/[id]
   - Then: Profile loads for that specific player

## Edge Cases

1. **Single Game**: Show message "Need more games for chart"
2. **No Games**: Show empty state with encouraging message
3. **Very High/Low Ratings**: Chart auto-scales with appropriate padding
4. **Long Name**: Truncate with ellipsis in header
5. **Missing 30-day Data**: Show "N/A" for 30-day rating change
6. **Rating Decrease Only**: Chart displays normally with green points
7. **Timezone Handling**: Show dates in user's timezone
8. **Name Changes**: Always show current name (queried by player_id from denormalized database)
9. **Tied Placements**: Display as provided by data
10. **High Sigma (Provisional)**: Display same as established ratings
11. **Invalid Data Values**:
    - **Infinity/NaN Ratings**: Display "--" for chart points, exclude from calculations
    - **Invalid Average Placement**: Show "--" if calculation results in NaN/Infinity
    - **Missing Games Data**: Show "No data available" message
    - **Negative Values**: Log error and display closest valid value (0 for counts)
12. **Chart Rendering**:
    - **Insufficient Data**: Show "Need at least 2 games for chart" message
    - **All Invalid Points**: Display "Unable to render chart" with explanation
    - **Mixed Valid/Invalid**: Render valid points only, skip invalid ones

## Mobile Optimizations

1. **Touch Targets**: Minimum 44x44px for all tappable elements
2. **Swipe Gestures**: Right swipe for back navigation
3. **Chart Touch**: Large touch targets for data points
4. **Scroll Performance**: Use CSS transforms for smooth scrolling
5. **Load More**: Large button easy to tap
6. **Font Sizes**: Minimum 14px for readability

## Mobile iOS vs Desktop Chrome Strategy

**Approach**: Responsive design with functional parity across platforms.

**Mobile (iOS, <768px)**:

- Touch-optimized chart interactions
- Swipe gestures for navigation
- Time range buttons sized for touch
- Single column layout
- Bottom navigation remains visible

**Desktop (Chrome, ≥768px)**:

- Hover states on chart points
- Keyboard navigation support
- Same time range selector UI
- Single column layout (consistency)
- Bottom navigation remains (functional parity)

**Chart Interactions**:

- Mobile: Touch points for tooltips
- Desktop: Hover for instant feedback
- Both: Click/tap to lock tooltip
- Both: Simple, clean visualization

## Implementation Notes

1. **Removed Features**: The following features from existing tests should be removed as they don't align with the simplified requirements:
   - "Advanced Stats" toggle showing μ, σ, total points
   - "Quick Stats" section distinction
   - Win rate calculations and display (removed per feedback)
2. **Configuration**: Use the same configuration hash as the leaderboard feature for consistency

3. **Performance**: With expected < 100 games per player and < 20 users total, loading all games at once is acceptable

4. **Chart Implementation**: Use @shadcn/ui charts for consistency with the design system

5. **Development Environment**: Test against production Supabase data (no mock data needed)
