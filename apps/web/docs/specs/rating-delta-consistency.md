# Rating Delta Consistency Specification

## Overview

Rating deltas (changes) must be consistently calculated and displayed across all views in the application. This ensures users see the same rating change values whether they're looking at the rating chart tooltip, recent games list, or game history page.

## User Stories

### As a player, I want to see consistent rating changes so that I can trust the data

- When I hover over a point in my rating chart, the change shown should match the game's actual rating change
- When I view my recent games, the rating changes should match what I see in the chart
- When I view the game history page, all rating changes should be consistent with other views

## Technical Requirements

### Data Model

```typescript
// Rating change is calculated once and stored
interface GameResult {
  ratingBefore: number; // μ - 2σ before the game
  ratingAfter: number; // μ - 2σ after the game
  ratingChange: number; // ratingAfter - ratingBefore
}
```

### Calculation Formula

All rating calculations use the OpenSkill formula:

- Display Rating = μ - 2σ
- Rating Change = (μ_after - 2σ_after) - (μ_before - 2σ_before)

### Display Requirements

1. **Rating Chart Tooltip**
   - Must show the exact `ratingChange` value from the game data
   - Format: "Change: +X.X" or "Change: -X.X"
   - Always show one decimal place

2. **Recent Games List**
   - Must show the exact `ratingChange` value
   - Format: "↑X.X" for positive, "↓X.X" for negative
   - Always show one decimal place

3. **Game History Page**
   - Must show the exact `ratingChange` value for each player
   - Format: "↑X.X" for positive, "↓X.X" for negative
   - Always show one decimal place

## Validation Requirements

### Manual Calculation Verification

- Chart tooltips must be verifiable by calculating: current_rating - previous_rating
- The displayed change must match the calculated difference (within 0.1 tolerance for floating point)

### Cross-View Consistency

- The same game must show identical rating changes across all views
- No view should perform its own calculation - all must use the stored `ratingChange` value

## Success Criteria

- [ ] Rating changes in chart tooltips match the stored game data
- [ ] Rating changes in recent games match the stored game data
- [ ] Rating changes in game history match the stored game data
- [ ] Manual calculation (current - previous) matches displayed change
- [ ] All views show consistent formatting (one decimal place)

## Test Scenarios

1. **Chart Tooltip Accuracy**
   - Given: A player with multiple games
   - When: Hovering over each chart point
   - Then: The change shown matches ratingAfter - ratingBefore

2. **Cross-View Consistency**
   - Given: A specific game with known rating changes
   - When: Viewing the game in different parts of the app
   - Then: The rating change is identical in all views

3. **Manual Verification**
   - Given: Two consecutive games
   - When: Calculating the difference between their ratings
   - Then: The result matches the displayed rating change

## Implementation Notes

### Common Pitfalls to Avoid

1. **Do NOT recalculate rating changes in the UI** - Always use the stored value
2. **Do NOT use different formulas in different views** - Consistency is key
3. **Do NOT round differently in different views** - Always use .toFixed(1)

### Testing Strategy

1. **Unit Tests**: Verify rating change calculation in queries.ts
2. **Component Tests**: Verify each component displays the value correctly
3. **E2E Tests**: Verify consistency across views with real data
4. **Manual Tests**: Spot-check calculations for accuracy
