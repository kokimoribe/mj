# Player Profile Requirements

_Detailed specifications for the player profile page features_

## Overview

The player profile page provides comprehensive information about a player's performance, including rating history visualization and detailed game logs. This document specifies the exact requirements for these features.

## Rating History Chart

### Visual Requirements

1. **Chart Type**: Line chart showing rating progression over time
2. **X-axis**: Game dates (chronological)
3. **Y-axis**: Rating values
4. **Data Points**: 
   - Each game should be a point on the chart
   - Show rating value on hover/tap
   - Connect points with a smooth line
5. **Visual Indicators**:
   - Green for rating increases
   - Red for rating decreases
   - Highlight current/latest rating

### Data Requirements

1. **Time Range**: Show all games from current season
2. **Update Frequency**: Real-time as new games are added
3. **Performance**: Chart should render within 500ms
4. **Fallback**: Show "Not enough data" message if < 2 games

### Mobile Optimization

1. **Touch Interactions**: 
   - Tap to see exact rating value
   - Pinch to zoom (optional for Phase 0)
2. **Responsive Design**: 
   - Full width on mobile
   - Appropriate height (200-250px)
3. **Performance**: Smooth scrolling and interactions

## Recent Games Section

### Game Entry Display

Each game entry should show:

1. **Date & Time**: Format "MMM D, YYYY • H:MM PM"
2. **Placement**: Visual indicator (🥇🥈🥉4️⃣)
3. **Final Score**: Raw score in points
4. **Plus/Minus**: Score adjustment with uma/oka
5. **Rating Change**: Show rating delta (↑/↓ with value)
6. **Opponents**: Names of other players in the game

### Layout Example

```
┌─────────────────────────────────────────┐
│ Jul 6, 2025 • 7:46 PM                  │
│ 🥇 1st Place                            │
│ Score: 42,700 → +32,700 pts            │
│ Rating: 34.5 → 35.3 (↑0.8)             │
│ vs. Alice, Mikey, Frank                 │
└─────────────────────────────────────────┘
```

### Interaction

1. **Initial Display**: Show 5 most recent games
2. **Load More**: Button to load additional games
3. **Game Details**: Tap to expand for full game breakdown (Phase 1)

## Implementation Priority

### Phase 0 Requirements (Must Have)

1. ✅ Basic rating chart with line visualization
2. ✅ Recent games list with core information
3. ✅ Mobile-optimized layout
4. ✅ Load more functionality

### Phase 1 Enhancements (Nice to Have)

1. ⏳ Interactive chart with touch controls
2. ⏳ Expandable game details
3. ⏳ Filter by date range
4. ⏳ Export game history

## Technical Specifications

### Rating Chart Library

- Use lightweight charting library (e.g., Recharts, Chart.js)
- Bundle size < 50KB
- SSR compatible
- Accessible (ARIA labels)

### Data Structure

```typescript
interface RatingHistoryPoint {
  gameId: string
  date: string
  rating: number
  ratingChange: number
  placement: number
}

interface GameDetail {
  id: string
  date: string
  placement: number
  score: number
  plusMinus: number
  ratingBefore: number
  ratingAfter: number
  ratingChange: number
  opponents: Array<{
    name: string
    placement: number
    score: number
  }>
}
```

### API Endpoints

1. **GET /players/{playerId}/rating-history**
   - Returns array of RatingHistoryPoint
   - Ordered by date ascending

2. **GET /players/{playerId}/games**
   - Returns paginated array of GameDetail
   - Default limit: 5
   - Max limit: 20
   - Ordered by date descending

## Acceptance Criteria

1. ✅ Rating chart displays with at least 2 data points
2. ✅ Chart shows correct rating progression
3. ✅ Recent games show all required information
4. ✅ Load more button fetches additional games
5. ✅ Mobile layout is responsive and usable
6. ✅ Page loads within 2 seconds
7. ✅ No JavaScript errors in console
8. ✅ Accessible via keyboard navigation