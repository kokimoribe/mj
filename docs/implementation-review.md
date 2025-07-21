# Implementation Review: PWA Leaderboard & Player Profiles

## Executive Summary

This review analyzes the current implementation of the PWA Leaderboard and Player Profiles features against their specifications. While the core functionality is well-implemented, there are several opportunities for cleanup, refactoring, and better alignment with the original specifications.

## PWA Leaderboard Review

### ✅ Well-Implemented Aspects

- **Component Structure**: Follows the specified hierarchy correctly
- **PWA Features**: Installable, offline support, service worker
- **UI/UX**: Pull-to-refresh, expandable cards, responsive design
- **Data Fetching**: React Query integration with proper caching
- **Accessibility**: Keyboard navigation and ARIA attributes

### ❌ Issues & Gaps

1. **Sorting Logic**: Missing proper tie-breaking (should be rating → games → name)
2. **Missing Components**: No SeasonSummary, no season selector
3. **Performance**: No minHeight on cards causing layout shift
4. **Hardcoded Values**: Win rate and average placement are mocked

### 🔧 Refactoring Opportunities

#### 1. Extract Sorting Logic

```typescript
// utils/leaderboard.ts
export const sortPlayers = (players: Player[]): Player[] => {
  return [...players].sort((a, b) => {
    // Primary: Rating (descending)
    if (a.rating !== b.rating) return b.rating - a.rating;
    // Secondary: Games played (descending)
    if (a.games !== b.games) return b.games - a.games;
    // Tertiary: Name (alphabetical)
    return a.name.localeCompare(b.name);
  });
};
```

#### 2. Prevent Layout Shift

```typescript
// Add to ExpandablePlayerCard styles
const cardStyles = {
  minHeight: "80px", // Prevents layout shift
  transition: "all 200ms ease-in-out",
};
```

#### 3. Remove Unused Components

- Delete `RatingCard` component (appears to be legacy)
- Consolidate duplicate functionality

## Player Profiles Review

### ✅ Well-Implemented Aspects

- **Navigation Flow**: Smooth transition from leaderboard
- **Chart Visualization**: Rating history with tooltips
- **Game History**: Detailed game entries with scores
- **Loading States**: Proper skeleton loaders and error handling
- **Mobile Responsive**: Touch-friendly interface

### ❌ Issues & Gaps

1. **Critical Bugs**:
   - Shows rating as rank (e.g., "Rank #46.3" instead of "Rank #1")
   - 30-day change is hardcoded instead of calculated
   - Average placement is hardcoded instead of calculated

2. **Missing Features**:
   - Opponent names aren't clickable links
   - No client-side pagination (fetches from API)
   - No "Showing X of Y games" indicator
   - Chart doesn't handle < 2 games edge case

3. **Incorrect Features**:
   - Shows "Win Rate" (should be removed)
   - Shows "Advanced Stats" section (should be removed)
   - Uses "Quick Stats" instead of "Performance Stats"

### 🔧 Refactoring Opportunities

#### 1. Unified Data Fetching

```typescript
// hooks/usePlayerProfileData.ts
export const usePlayerProfileData = (playerId: string) => {
  return useQueries({
    queries: [
      {
        queryKey: ["player", playerId],
        queryFn: () => fetchPlayerProfile(playerId),
      },
      {
        queryKey: ["leaderboard"], // For rank calculation
        queryFn: fetchLeaderboard,
      },
      {
        queryKey: ["player-games", playerId],
        queryFn: () => fetchAllPlayerGames(playerId), // Load all at once
      },
    ],
    combine: results => {
      const [playerResult, leaderboardResult, gamesResult] = results;

      if (playerResult.data && leaderboardResult.data && gamesResult.data) {
        const rank = calculateRank(playerId, leaderboardResult.data);
        const stats = calculateStats(gamesResult.data);

        return {
          profile: { ...playerResult.data, rank },
          stats,
          games: gamesResult.data,
          isLoading: false,
        };
      }

      return {
        isLoading: results.some(r => r.isLoading),
        error: results.find(r => r.error)?.error,
      };
    },
  });
};
```

#### 2. Calculation Utilities

```typescript
// utils/playerStats.ts
export const calculateStats = (games: Game[]) => {
  const placements = games.map(g => g.placement);
  const avgPlacement =
    placements.reduce((a, b) => a + b, 0) / placements.length;

  const thirtyDaysAgo = subDays(new Date(), 30);
  const oldGames = games.filter(g => new Date(g.date) <= thirtyDaysAgo);
  const rating30DaysAgo = oldGames[0]?.ratingBefore;
  const currentRating = games[0]?.ratingAfter || 0;
  const change30Day = rating30DaysAgo ? currentRating - rating30DaysAgo : null;

  return {
    averagePlacement,
    rating30DayChange: change30Day,
    lastPlayed: games[0]?.date,
  };
};
```

#### 3. Component Organization

```typescript
// Suggested file structure
src/components/features/player/
├── PlayerProfileView/
│   ├── index.tsx              // Main container
│   ├── ProfileHeader.tsx      // Name, rank, rating display
│   ├── PerformanceStats.tsx  // Statistics section
│   └── hooks/
│       ├── usePlayerData.ts   // Data fetching
│       └── usePlayerStats.ts  // Calculations
├── RatingChart/
│   ├── index.tsx              // Chart component
│   └── chartConfig.ts         // Chart configuration
└── GameHistory/
    ├── index.tsx              // Games list container
    ├── GameEntry.tsx          // Individual game
    └── useClientPagination.ts // Pagination hook
```

## Shared Improvements

### 1. Type Safety

```typescript
// types/player.ts
export interface PlayerProfile {
  id: string;
  name: string;
  rating: number;
  mu: number;
  sigma: number;
  games: number;
  rank?: number; // Calculated client-side
  ratingHistory?: number[];
}

export interface GameEntry {
  id: string;
  date: string;
  placement: 1 | 2 | 3 | 4;
  score: number;
  plusMinus: number;
  ratingChange: number;
  opponents: Opponent[];
}
```

### 2. Consistent Data Layer

```typescript
// lib/api/players.ts
export const playerApi = {
  async getProfile(playerId: string): Promise<PlayerProfile> {
    // Centralized API logic
  },

  async getGames(playerId: string): Promise<GameEntry[]> {
    // Load all games at once for client-side pagination
  },

  async getLeaderboard(): Promise<PlayerProfile[]> {
    // Shared between features
  },
};
```

### 3. Performance Optimizations

- Implement virtual scrolling for large player lists
- Use `React.memo` with proper comparison functions
- Add `will-change: transform` for animations
- Preload player profiles on hover

### 4. Testing Strategy

```typescript
// __tests__/integration/player-flow.test.ts
describe("Player Flow Integration", () => {
  it("navigates from leaderboard to profile correctly", async () => {
    // Test the full user journey
  });

  it("calculates statistics correctly", () => {
    // Test calculation logic with various data sets
  });

  it("handles edge cases gracefully", () => {
    // 0 games, 1 game, missing data, etc.
  });
});
```

## Implementation Priorities

### Phase 1: Critical Fixes (1-2 days)

1. Fix rank display in player profiles
2. Calculate statistics instead of hardcoding
3. Fix leaderboard sorting logic
4. Make opponent names clickable

### Phase 2: Feature Alignment (2-3 days)

1. Remove win rate and advanced stats
2. Implement client-side pagination
3. Add missing UI indicators
4. Handle edge cases properly

### Phase 3: Performance & Polish (1-2 days)

1. Prevent layout shift
2. Optimize bundle size
3. Add loading optimizations
4. Improve test coverage

## Conclusion

The current implementation provides a solid foundation but needs refinement to fully align with specifications. The suggested refactoring will improve maintainability, performance, and user experience while ensuring the code accurately reflects the original design intent.

Key benefits of these improvements:

- **Better User Experience**: Accurate data, smoother interactions
- **Improved Maintainability**: Clear separation of concerns
- **Enhanced Performance**: Optimized data fetching and rendering
- **Stronger Type Safety**: Comprehensive TypeScript coverage
- **Easier Testing**: Modular, testable components

The implementation demonstrates good engineering practices but would benefit from these targeted improvements to achieve full specification compliance.
