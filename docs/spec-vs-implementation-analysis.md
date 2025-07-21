# Spec vs Implementation Analysis

This document categorizes each issue found during the implementation review, determining whether it's a spec deficiency that needs updating or an implementation bug that should be fixed.

## PWA Leaderboard Issues

### 1. Sorting Logic: Missing proper tie-breaking

**Category: Implementation Bug**

- **Spec Reference**: Lines 313-314 state "Tied Ratings: Sort by games played, then alphabetically"
- **Action**: Fix implementation to follow spec's tie-breaking rules

### 2. Missing Components: No SeasonSummary, no season selector

**Category: Mixed**

- **SeasonSummary**: Implementation Bug - spec clearly defines this component (lines 37-39)
- **Season Selector**: Spec Deficiency - spec mentions it in the header (line 36) but doesn't detail how it works
- **Action**:
  - Implement SeasonSummary component per spec
  - Update spec to clarify season selector behavior

### 3. Performance: No minHeight on cards causing layout shift

**Category: Implementation Bug**

- **Spec Reference**: Line 219 requires "No layout shift during load (CLS < 0.1)"
- **Action**: Fix implementation to prevent layout shift

### 4. Hardcoded Values: Win rate and average placement are mocked

**Category: Implementation Bug**

- **Spec Reference**: Lines 88-96 show these should be calculated, with formulas in lines 177-192
- **Action**: Implement proper calculations per spec

## Player Profiles Issues

### 1. Shows rating as rank (e.g., "Rank #46.3" instead of "Rank #1")

**Category: Implementation Bug**

- **Spec Reference**: Lines 37 and 152-153 clearly distinguish rank from rating
- **Action**: Fix implementation to show correct rank

### 2. 30-day change is hardcoded instead of calculated

**Category: Implementation Bug**

- **Spec Reference**: Lines 290-301 provide exact calculation logic
- **Action**: Implement calculation per spec

### 3. Average placement is hardcoded instead of calculated

**Category: Implementation Bug**

- **Spec Reference**: Lines 286-288 show calculation: "Mean of all game placements"
- **Action**: Implement calculation per spec

### 4. Opponent names aren't clickable links

**Category: Implementation Bug**

- **Spec Reference**: Line 95 states "Opponent names are clickable links to their profiles"
- **Action**: Make opponent names clickable

### 5. No client-side pagination (fetches from API)

**Category: Implementation Bug**

- **Spec Reference**: Lines 68-69 and 91-94 specify client-side pagination
- **Action**: Implement client-side pagination

### 6. No "Showing X of Y games" indicator

**Category: Spec Enhancement**

- **Spec Reference**: Line 54 shows "Recent Games (Showing 5 of 20)" but this is just visual mockup
- **Action**: This is a nice-to-have enhancement, not a spec requirement

### 7. Chart doesn't handle < 2 games edge case

**Category: Implementation Bug**

- **Spec Reference**: Lines 401-402 specify "Single Game: Show message 'Need more games for chart'"
- **Action**: Implement edge case handling per spec

### 8. Shows "Win Rate" (should be removed)

**Category: Implementation Bug**

- **Spec Reference**: Lines 426-428 explicitly state "Removed Features" including "Win rate calculations and display"
- **Action**: Remove win rate from implementation

### 9. Shows "Advanced Stats" section (should be removed)

**Category: Implementation Bug**

- **Spec Reference**: Lines 426-428 explicitly state to remove "Advanced Stats toggle showing μ, σ, total points"
- **Action**: Remove advanced stats from implementation

### 10. Uses "Quick Stats" instead of "Performance Stats"

**Category: Implementation Bug**

- **Spec Reference**: Line 50 clearly labels this section as "Performance Stats"
- **Action**: Rename to match spec

## Summary

### Implementation Bugs to Fix (14 items):

1. **Leaderboard sorting logic** - Add proper tie-breaking
2. **Missing SeasonSummary component** - Implement per spec
3. **Layout shift prevention** - Add minHeight to cards
4. **Hardcoded win rate/avg placement** - Calculate properly
5. **Rank display bug** - Show rank number, not rating value
6. **Hardcoded 30-day change** - Calculate from game history
7. **Hardcoded average placement** - Calculate from games
8. **Non-clickable opponent names** - Make them links
9. **Server-side pagination** - Switch to client-side
10. **Missing chart edge case** - Handle < 2 games
11. **Win rate display** - Remove entirely
12. **Advanced stats section** - Remove entirely
13. **"Quick Stats" naming** - Rename to "Performance Stats"
14. **Missing last update timestamp** - Show data freshness

### Spec Deficiencies to Update (2 items):

1. **Season selector behavior** - Spec mentions it exists but doesn't detail functionality
2. **"Showing X of Y" indicator** - Nice enhancement but not in original spec

### Enhancements Beyond Spec (1 item):

1. **Games count indicator** - The "Showing 5 of 20" is helpful UX but not required by spec

## Recommendations

1. **Priority 1**: Fix all implementation bugs to match existing specs (14 items)
2. **Priority 2**: Update specs to clarify season selector behavior
3. **Priority 3**: Consider adding the "Showing X of Y" enhancement to specs as it improves UX

The vast majority of issues (87.5%) are implementation bugs where the code doesn't match the already well-defined specifications. Only 2 items represent actual spec deficiencies, confirming that the specs are comprehensive and the implementation simply needs to be aligned with them.
