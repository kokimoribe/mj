# Game History

## Overview

The Game History page provides a chronological view of all games played in the current season (i.e. the default config) of the Riichi Mahjong League. It displays game results with scores, placements, and rating impacts, allowing players to review past games and track season progression. The page supports filtering and pagination for easy navigation through the season's games.

## User Stories

### As a player, I want to see all recent games so that I can track league activity

- View games in reverse chronological order (newest first)
- See who played in each game and their placements
- Understand score distributions and adjustments
- Know when each game was played

### As a player, I want to find specific games so that I can review particular results

- Filter games by player participation
- Navigate through pages of historical games
- See games from specific date ranges
- Quickly identify games I played in

### As a player, I want to understand game outcomes so that I can learn from results

- See final scores and plus/minus adjustments
- View how ratings changed for each player
- Identify high-scoring games or notable upsets
- Access more details about specific games

## UI/UX Specifications

### Visual Design

```
┌─────────────────────────────────────────┐
│ 🎮 Game History                         │
│ Season 3 (name of config) • 24 games                     │
├─────────────────────────────────────────┤
│ [All Games ▼] [Filter by Player]       │
├─────────────────────────────────────────┤
│ 📅 Jul 6, 2025 • 7:46 PM               │
│ ┌─────────────────────────────────────┐ │
│ │ 🥇 Joseph   42,700 → +32,700 ↑0.8   │ │
│ │ 🥈 Alice    31,100 → +16,100 ↑0.4   │ │
│ │ 🥉 Mikey    14,400 → -20,600 ↓0.3   │ │
│ │ 4️⃣ Frank     11,800 → -28,200 ↓0.5   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📅 Jul 3, 2025 • 8:15 PM               │
│ ┌─────────────────────────────────────┐ │
│ │ 🥇 Josh     45,200 → +35,200 ↑1.2   │ │
│ │ 🥈 Joseph   32,800 → +17,800 ↑0.3   │ │
│ │ 🥉 Hyun     18,500 → -21,500 ↓0.4   │ │
│ │ 4️⃣ Mikey     3,500 → -31,500 ↓0.6   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Load More Games]                       │
├─────────────────────────────────────────┤
│ [Leaderboard] [Players] [Games] [Stats] │
└─────────────────────────────────────────┘
```

### Component Hierarchy

- `GameHistoryView` - Main container
  - `PageHeader` - Title and game count
  - `FilterControls` - Filtering options
    - `PlayerFilter` - Dropdown to filter by player
    - `DateRangeFilter` - Date range selector (Phase 1)
  - `GamesList` - Scrollable list of games
    - `GameCard` - Individual game result
      - `GameHeader` - Date and time
      - `PlayerResults` - 4 player results
        - `PlayerResult` - Individual result line
  - `LoadMoreButton` - Pagination control (toggles to ShowLessButton)

### Interaction Patterns

1. **Filtering**
   - Dropdown shows all players + "All Games" option
   - Selecting player shows only their games
   - Filter persists during session
   - Clear filter returns to all games

2. **Game Cards**
   - Compact view shows essential information
   - Consistent layout for easy scanning
   - Visual hierarchy with placement medals
   - Tap entire card for details (Phase 1)

3. **Pagination (Show/Hide Toggle)**
   - Load 10 games initially
   - "Load More Games" adds 10 more games
   - After loading more, button changes to "Show Less Games"
   - "Show Less Games" hides the additional games (back to initial 10)
   - Smooth scroll preservation
   - Loading indicator during fetch

### Game Card Layout

```
Each game card contains:
- Date/time header
- 4 player rows with:
  - Placement icon (🥇🥈🥉4️⃣)
  - Player name
  - Final score → Plus/minus
  - Rating change (↑/↓ with value)
```

### Score Display Format

```
Raw Score → Adjusted Score
42,700 → +32,700 (Uma/Oka applied)
11,800 → -28,200 (Uma/Oka applied)
```

### Rating Change Display

```
Rating changes use the precision from the data:
↑0.8 or ↑1.23 (based on actual value)
↓0.5 or ↓0.567 (based on actual value)
```

### Date Format

```
Use a simple, consistent format:
"Jul 6, 2025 • 7:46 PM" (or similar readable format)
Can use browser's default locale or a fixed format
```

## Technical Requirements

### Data Model

```typescript
interface GameResult {
  playerId: string;
  playerName: string;
  placement: number; // 1-4
  rawScore: number; // Final table score
  scoreAdjustment: number; // Plus/minus with uma/oka
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
}

interface Game {
  id: string;
  date: string; // ISO 8601 format
  seasonId: string;
  results: GameResult[]; // Always 4 players
}

interface GameHistoryData {
  games: Game[];
  totalGames: number;
  hasMore: boolean;
  nextCursor?: string;
  showingAll: boolean; // Track if showing all loaded games or just initial 10
}

interface FilterOptions {
  playerId?: string; // undefined = all games
  dateFrom?: string;
  dateTo?: string;
}
```

### Configuration

```typescript
// Default season config hash (hardcoded for Season 3)
const DEFAULT_SEASON_CONFIG_HASH = "season_3_2024";
const currentSeasonConfigHash = DEFAULT_SEASON_CONFIG_HASH;
```

### Supabase Queries

```typescript
// Get paginated game history
const { data: games, count } = await supabase
  .from("games")
  .select(
    `
    id,
    finished_at,
    game_seats!inner(
      seat,
      player_id,
      final_score,
      players!inner(
        id,
        name
      )
    ),
    cached_game_results!inner(
      player_id,
      placement,
      raw_score,
      score_delta,
      rating_before,
      rating_after,
      rating_change
    )
  `,
    { count: "exact" }
  )
  .eq("status", "finished")
  .eq("cached_game_results.config_hash", currentSeasonConfigHash)
  .order("finished_at", { ascending: false })
  .range(offset, offset + limit - 1);

// Filter by player (when filter is active)
const { data: playerGames } = await supabase
  .from("game_seats")
  .select(
    `
    game_id,
    games!inner(
      id,
      finished_at,
      status
    )
  `
  )
  .eq("player_id", playerId)
  .eq("games.status", "finished")
  .order("games.finished_at", { ascending: false })
  .range(offset, offset + limit - 1);

// Then fetch full game details for filtered games
const gameIds = playerGames.map(g => g.game_id);
const { data: filteredGames } = await supabase
  .from("games")
  .select(/* same select as above */)
  .in("id", gameIds);

// Get all players for the filter dropdown
const { data: allPlayers } = await supabase
  .from("players")
  .select("id, name")
  .order("name", { ascending: true });
```

**Query Performance Requirements:**

- Initial page load: < 300ms
- Pagination: < 200ms per page
- Filter application: < 300ms
- Use React Query with 5 minute cache

### Performance Requirements

- **Initial Load**: < 1 second for first 10 games
- **Filter Application**: < 300ms response time
- **Load More**: < 500ms for additional games
- **Scroll Performance**: 60fps during scroll
- **Memory Management**: Virtualize list if > 50 games

## Success Criteria

- [x] Games display in reverse chronological order
- [x] Each game shows date and time
- [x] All 4 players shown with placement order
- [x] Placement indicators (🥇🥈🥉4️⃣) display correctly
- [x] Raw scores show with comma formatting
- [x] Score adjustments show with +/- prefix
- [x] Rating changes show with ↑/↓ indicators
- [x] Player filter dropdown includes all players
- [x] Filtering by player shows only their games
- [x] "All Games" option shows complete history
- [x] Load More button fetches additional games
- [x] Load More button changes to Show Less after loading
- [x] Show Less button hides additional games (back to initial 10)
- [x] Loading state shows during data fetch
- [x] Season game count displays in header
- [x] Empty state shows when no games match filter
- [x] Mobile layout remains readable
- [x] Touch targets meet minimum size
- [x] Page loads within 1 second

## Test Scenarios

1. **View All Games**
   - Given: Season has games played
   - When: User navigates to Games tab
   - Then: Shows 10 most recent games

2. **Load More Games**
   - Given: More than 10 games exist
   - When: User taps "Load More Games"
   - Then: 10 additional games append to list
   - And: Button changes to "Show Less Games"

2a. **Show Less Games**

- Given: User has loaded additional games
- When: User taps "Show Less Games"
- Then: Additional games are hidden
- And: Button changes back to "Load More Games"

3. **Filter by Player**
   - Given: Games list is displayed
   - When: User selects player from dropdown
   - Then: Only games with that player show

4. **Clear Filter**
   - Given: Player filter is active
   - When: User selects "All Games"
   - Then: All games show again

5. **Game Result Display**
   - Given: A game is displayed
   - When: Viewing the game card
   - Then: Shows all 4 players in placement order

6. **Score Formatting**
   - Given: Game has final scores
   - When: Displaying scores
   - Then: Numbers format with commas (31,100)

7. **Rating Changes**
   - Given: Game caused rating changes
   - When: Viewing results
   - Then: Shows ↑/↓ with change amount

8. **Empty State**
   - Given: No games match filter
   - When: Filter is applied
   - Then: Shows "No games found" message

## Edge Cases

1. **No Games**: Show "No games played yet" message
2. **Single Game**: Still shows in list format
3. **Long Names**: Truncate with ellipsis
4. **Large Scores**: Format with commas (100,000)
5. **Negative Scores**: Display with minus sign
6. **Zero Rating Change**: Show "—" instead of ↑/↓
7. **Missing Player**: Show placeholder name
8. **Same Timestamp**: Secondary sort by game ID

## Filter Behavior

### Player Filter Rules

1. **Default State**: "All Games" selected
2. **Player List**: Show all players from the database (even with 0 games)
3. **Player Option Format**: "PlayerName (X games)"
4. **Sort Order**: By game count descending
5. **Persistence**: Remember during session
6. **URL State**: Update URL for shareable links

### Future Filters (Phase 1)

- Date range picker
- Placement filter (show only 1st place games)
- Score threshold filter
- Multi-player filter

## Mobile Considerations

1. **Responsive Layout**:
   - Single column on mobile
   - Full width game cards
   - Appropriate font sizes

2. **Touch Optimization**:
   - Large tap targets for filters
   - Swipe to refresh (optional)
   - Smooth scrolling

3. **Performance**:
   - Lazy load images (if added)
   - Efficient re-renders
   - Minimal layout shifts

## Accessibility Requirements

- **Screen Reader Support**:
  - Announce game results clearly
  - Read placement, name, scores in order
  - Indicate filtered state

- **Keyboard Navigation**:
  - Tab through filters and games
  - Enter to activate controls
  - Focus management on load more

- **Visual Design**:
  - Don't rely only on emoji for placement
  - Sufficient color contrast
  - Clear visual hierarchy

- **Loading States**:
  - Announce when loading
  - Indicate completion
  - Error messages if failure
