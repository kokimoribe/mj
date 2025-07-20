# Season Statistics

## Overview

The Season Statistics page provides comprehensive analytics and insights about the current season of the Riichi Mahjong League. It showcases league-wide statistics, records, achievements, and interesting data discoveries that reward user exploration. The page follows a progressive disclosure pattern, starting with highlights and allowing users to dig deeper into advanced analytics.

## User Stories

### As a player, I want to see season highlights so that I can understand league trends

- View total games played and active players
- See notable records and achievements
- Understand overall season progression
- Discover interesting patterns in the data

### As a player, I want to explore detailed statistics so that I can gain insights

- Dig into placement distributions across all players
- Discover hidden patterns like seat luck statistics
- Understand rating system mathematics
- Find fun facts and surprising correlations

### As a player, I want to see records and achievements so that I feel motivated

- Know who has the biggest win or worst loss
- Track winning streaks and consistency
- See superlatives like "Most Improved"
- Celebrate notable accomplishments

## UI/UX Specifications

### Visual Design

```
┌─────────────────────────────────────────┐
│ 📊 Season 3 Statistics                  │
├─────────────────────────────────────────┤
│ 🏁 Season Overview                      │
│ 24 games played • 7 active players      │
│ Started Jun 1 • 12 weeks • 50% complete │
├─────────────────────────────────────────┤
│ 🏆 Records & Achievements               │
│                                         │
│ Highest Score    Josh      +51,200     │
│ Biggest Comeback Mikey     -31k to 1st  │
│ Win Streak       Joseph    3 games      │
│ Most Consistent  Alice     σ = 1.8      │
│                                         │
│ [Explore All Records →]                 │
├─────────────────────────────────────────┤
│ 🎯 Quick Insights                       │
│                                         │
│ • East seat wins 35% more often        │
│ • Games average 96 minutes              │
│ • 4th place comebacks: 2 this season    │
│                                         │
│ [Discover More →]                       │
├─────────────────────────────────────────┤
│ 📈 Explore Statistics                   │
│                                         │
│ [Placement Analysis] [Seat Performance] │
│ [Rating Mathematics] [Fun Discoveries]  │
└─────────────────────────────────────────┘
```

### Component Hierarchy

- `StatsView` - Main statistics container
  - `SeasonOverview` - High-level season summary
  - `RecordsSection` - Notable records and achievements
    - `RecordCard` - Individual record display
    - `ExploreLink` - Navigate to full records
  - `QuickInsights` - Interesting statistics highlights
  - `ExploreSection` - Deep-dive categories
    - `StatCategory` - Expandable statistics section

### Progressive Disclosure Sections

#### 1. Placement Analysis (Expanded View)

```
┌─────────────────────────────────────────┐
│ 🎯 Placement Distribution               │
│                                         │
│ Average Placement by Player             │
│ Joseph    █████████░ 2.1               │
│ Alice     ███████░░░ 2.3               │
│ Josh      ██████░░░░ 2.5               │
│ Hyun      █████░░░░░ 2.7               │
│ Mikey     ████░░░░░░ 2.9               │
│                                         │
│ Overall Distribution                    │
│ 1st: 25% ████████                      │
│ 2nd: 25% ████████                      │
│ 3rd: 25% ████████                      │
│ 4th: 25% ████████                      │
└─────────────────────────────────────────┘
```

#### 2. Seat Performance (Hidden Gem)

```
┌─────────────────────────────────────────┐
│ 🪑 The Seat Advantage                   │
│                                         │
│ Did you know? Your starting seat        │
│ affects your chances of winning!        │
│                                         │
│ East (起家):  35% win rate ⭐⭐⭐⭐⭐    │
│ South: 26% win rate ⭐⭐⭐⭐            │
│ West:  22% win rate ⭐⭐⭐              │
│ North: 17% win rate ⭐⭐                │
│                                         │
│ 💡 Tip: The dealer advantage is real!   │
│                                         │
│ [See Player Seat Stats →]               │
└─────────────────────────────────────────┘
```

#### 3. Rating Mathematics (For the Curious)

```
┌─────────────────────────────────────────┐
│ 📐 How Ratings Really Work              │
│                                         │
│ OpenSkill Rating = μ - 2σ               │
│                                         │
│ μ (mu) = Your "true" skill level        │
│ σ (sigma) = Uncertainty about skill     │
│                                         │
│ Interactive Example:                    │
│ Your μ: 35 │ Your σ: 3                  │
│ Display Rating: 35 - 6 = 29             │
│                                         │
│ [Try Rating Calculator →]               │
└─────────────────────────────────────────┘
```

#### 4. Fun Discoveries

```
┌─────────────────────────────────────────┐
│ 🎲 Surprising Statistics                │
│                                         │
│ 🍀 Luckiest Player                      │
│ Jackie: Won with < 25k pts twice!       │
│                                         │
│ 😅 The 4th Place Club                   │
│ Mikey: 8 fourth places (most resilient) │
│                                         │
│ 🎯 Perfect Attendance                   │
│ Joseph & Mikey: Played every week       │
│                                         │
│ 🌙 Night Owl Award                      │
│ 73% of games start after 8 PM           │
│                                         │
│ [More Fun Facts →]                      │
└─────────────────────────────────────────┘
```

## Technical Requirements

### Data Model

```typescript
interface SeasonOverview {
  seasonId: string;
  seasonName: string;
  totalGames: number;
  activePlayers: number;
  startDate: string;
  weeksDuration: number;
  percentComplete: number;
}

interface Record {
  category: string;
  description: string;
  playerName: string;
  value: string | number;
  date?: string;
  gameId?: string;
}

interface PlacementStats {
  playerId: string;
  playerName: string;
  averagePlacement: number;
  placementCounts: {
    first: number;
    second: number;
    third: number;
    fourth: number;
  };
}

interface SeatStats {
  seat: "east" | "south" | "west" | "north";
  gamesPlayed: number;
  averagePlacement: number;
  winRate: number;
}

interface QuickInsight {
  icon: string;
  text: string;
  value?: string;
  hint?: string;
}

interface SeasonStatistics {
  overview: SeasonOverview;
  records: Record[];
  insights: QuickInsight[];
  placementStats: PlacementStats[];
  seatStats: SeatStats[];
  funFacts: Array<{
    title: string;
    description: string;
    emoji: string;
  }>;
}
```

### Supabase Queries

```typescript
// Get season overview and basic stats
const { data: seasonStats } = await supabase
  .from("cached_season_stats")
  .select(
    `
    config_hash,
    total_games,
    active_players,
    season_start_date,
    weeks_duration,
    percent_complete
  `
  )
  .eq("config_hash", currentSeasonConfigHash)
  .single();

// Get records and achievements
const { data: records } = await supabase
  .from("cached_season_records")
  .select(
    `
    category,
    description,
    player_id,
    players!inner(name),
    value,
    game_id,
    achieved_at
  `
  )
  .eq("config_hash", currentSeasonConfigHash)
  .order("category");

// Get placement statistics for all players
const { data: placementStats } = await supabase
  .from("cached_player_stats")
  .select(
    `
    player_id,
    players!inner(name),
    average_placement,
    placement_counts,
    games_played
  `
  )
  .eq("config_hash", currentSeasonConfigHash)
  .order("average_placement");

// Get seat performance statistics
const { data: seatStats } = await supabase
  .from("cached_seat_stats")
  .select(
    `
    seat,
    games_played,
    average_placement,
    win_rate
  `
  )
  .eq("config_hash", currentSeasonConfigHash)
  .order("seat");

// Get fun facts and insights
const { data: insights } = await supabase
  .from("cached_season_insights")
  .select(
    `
    type,
    title,
    description,
    value,
    emoji
  `
  )
  .eq("config_hash", currentSeasonConfigHash)
  .in("type", ["quick_insight", "fun_fact"]);
```

**Query Performance Requirements:**

- Initial overview: < 200ms
- Records query: < 300ms
- Statistics queries: < 200ms each
- Use React Query with 10 minute cache for all stats

### Performance Requirements

- **Initial Load**: < 1 second for overview
- **Section Expansion**: < 100ms (client-side)
- **Chart Rendering**: < 300ms for visualizations
- **Smooth Animations**: 60fps for expansions
- **Data Freshness**: Update every 10 minutes

## Success Criteria

- [x] Season overview shows games, players, progress
- [x] Records section displays at least 4 achievements
- [x] Each record shows category, player, and value
- [x] Quick insights show 3+ interesting statistics
- [x] Explore section has 4 expandable categories
- [x] Placement analysis shows bar chart visualization
- [x] Average placements calculate correctly
- [x] Seat performance reveals surprising statistics
- [x] Rating mathematics has interactive explanation
- [x] Fun discoveries show personality and engagement
- [x] All sections expand/collapse smoothly
- [x] Mobile layout remains readable
- [x] Data updates automatically when new games added
- [x] Empty states handle new seasons gracefully
- [x] Page loads within 1 second

## Test Scenarios

1. **View Season Overview**
   - Given: Season has games played
   - When: User navigates to Stats tab
   - Then: Shows games count, players, and progress

2. **View Records**
   - Given: Games have been played
   - When: Viewing records section
   - Then: Shows relevant achievements with values

3. **Expand Statistics Section**
   - Given: User sees explore buttons
   - When: User taps "Placement Analysis"
   - Then: Section expands showing detailed stats

4. **Seat Performance Discovery**
   - Given: User expands seat performance
   - When: Viewing the statistics
   - Then: Shows seat advantages with visual indicators

5. **Interactive Rating Demo**
   - Given: User expands rating mathematics
   - When: Viewing the explanation
   - Then: Shows interactive example with real values

6. **Explore All Records**
   - Given: Records section is visible
   - When: User taps "Explore All Records"
   - Then: Navigates to comprehensive records page

7. **Empty Season State**
   - Given: New season with no games
   - When: Viewing statistics
   - Then: Shows encouraging empty state

8. **Calculate Averages**
   - Given: Players have different game counts
   - When: Showing placement averages
   - Then: Calculations are accurate

## Statistical Calculations

### Required Calculations

1. **Average Placement**: Sum of placements / games played
2. **Win Rate**: First places / total games \* 100
3. **Seat Win Rate**: Wins from seat / games from seat
4. **Completion Percentage**: Games played / expected games
5. **Consistency (σ)**: Standard deviation of placements

### Record Categories

- **Score Records**: Highest, lowest, biggest swing
- **Streak Records**: Consecutive wins, placements
- **Improvement**: Biggest rating gain in period
- **Participation**: Most games, perfect attendance
- **Unusual**: Statistical outliers and anomalies

## Progressive Disclosure Strategy

1. **Surface Level**:
   - Show highlights and teasers
   - Use intriguing copy to encourage exploration
   - Visual indicators for expandable content

2. **First Expansion**:
   - Reveal detailed statistics
   - Add context and explanations
   - Maintain mystery for deeper levels

3. **Deep Exploration**:
   - Technical details for enthusiasts
   - Interactive elements
   - Easter eggs and surprises

## Mobile Optimizations

1. **Touch Interactions**:
   - Large tap targets for sections
   - Smooth expansion animations
   - Swipe between stat categories

2. **Visual Design**:
   - Compact visualizations
   - Horizontal scrolling for charts
   - Collapsible sections save space

3. **Performance**:
   - Lazy load detailed statistics
   - Client-side calculations
   - Minimal server requests

## Accessibility Requirements

- **Screen Readers**:
  - Describe all statistics clearly
  - Announce section state (expanded/collapsed)
  - Provide text alternatives for charts

- **Keyboard Support**:
  - Navigate sections with arrows
  - Enter/Space to expand sections
  - Tab through interactive elements

- **Visual Accessibility**:
  - High contrast for all text
  - Don't rely solely on color
  - Clear section boundaries
