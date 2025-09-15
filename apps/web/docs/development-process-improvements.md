# Development Process Improvements

## Lessons Learned from Rating System Issues

### Why We Didn't Catch the Issues

1. **Missing Specification Details**
   - The original specs didn't explicitly state that "1st place should gain rating, 4th place should lose rating"
   - Rating delta consistency across views wasn't specified
   - The μ - 2σ formula was mentioned but not validated in tests

2. **Insufficient Test Coverage**
   - Tests checked that calculations ran without error, but not that results were sensible
   - No tests verified that winners gain rating and losers lose rating
   - No cross-view consistency tests
   - No manual calculation verification tests

3. **Assumptions vs. Validation**
   - We assumed correct implementation if tests passed
   - We didn't validate the business logic matches real-world expectations

## Improved Development Process

### 1. Enhanced Specification Writing

Before implementation, specifications must include:

```markdown
## Invariants (Things that must always be true)

- [ ] 1st place players must have ratingChange >= -0.1 (accounting for volatility)
- [ ] 4th place players must have ratingChange <= 0.1 (accounting for volatility)
- [ ] Rating changes must be identical across all views

## Edge Cases

- What happens when scores are tied?
- What happens with incomplete games?
- How do we handle missing data?

## Validation Examples

- Given: Player in 1st with rating 50.0
- When: Game completes
- Then: Rating should increase (e.g., to 52.3, change = +2.3)
```

### 2. Test-Driven Development with Business Logic Tests

Create tests that validate business logic, not just code execution:

```typescript
describe("Rating System Business Logic", () => {
  it("1st place players should gain rating", async () => {
    const result = await calculateRatings(gameData);
    const firstPlace = result.find(p => p.placement === 1);
    expect(firstPlace.ratingChange).toBeGreaterThan(-0.1);
  });

  it("4th place players should lose rating", async () => {
    const result = await calculateRatings(gameData);
    const fourthPlace = result.find(p => p.placement === 4);
    expect(fourthPlace.ratingChange).toBeLessThan(0.1);
  });
});
```

### 3. Cross-View Consistency Tests

Always test that the same data appears correctly in multiple views:

```typescript
describe("Cross-View Consistency", () => {
  it("rating changes should match across all views", async () => {
    const gameId = "test-game-123";

    // Get from player profile
    const profileDelta = await getProfileGameDelta(gameId);

    // Get from game history
    const historyDelta = await getHistoryGameDelta(gameId);

    // Get from chart data
    const chartDelta = await getChartGameDelta(gameId);

    expect(profileDelta).toBe(historyDelta);
    expect(historyDelta).toBe(chartDelta);
  });
});
```

### 4. Manual Calculation Verification

Include tests that manually verify calculations:

```typescript
it("displayed values should match manual calculations", () => {
  const before = { mu: 25, sigma: 8 };
  const after = { mu: 26, sigma: 7.5 };

  const ratingBefore = before.mu - 2 * before.sigma; // 9
  const ratingAfter = after.mu - 2 * after.sigma; // 11
  const expectedChange = ratingAfter - ratingBefore; // 2

  const displayedChange = calculateRatingChange(before, after);

  expect(displayedChange).toBeCloseTo(expectedChange, 1);
});
```

### 5. Visual Regression Testing

For UI consistency, add visual regression tests:

```typescript
test("rating displays should be visually consistent", async ({ page }) => {
  // Take screenshots of each view
  await page.goto("/player/123");
  await page.screenshot({ path: "player-rating.png" });

  await page.goto("/games");
  await page.screenshot({ path: "games-rating.png" });

  // Compare with baseline images
  expect(await page.screenshot()).toMatchSnapshot("ratings.png");
});
```

### 6. Production Validation Checklist

Before deploying:

- [ ] Run manual spot checks on real data
- [ ] Verify edge cases behave correctly
- [ ] Check that all views show consistent data
- [ ] Validate business logic (winners win, losers lose)
- [ ] Review calculations with domain expert

### 7. Monitoring and Alerts

After deployment:

```typescript
// Add monitoring for suspicious patterns
if (placement === 1 && ratingChange < -1) {
  logWarning("1st place player lost significant rating", {
    gameId,
    playerId,
    ratingChange,
  });
}

if (placement === 4 && ratingChange > 1) {
  logWarning("4th place player gained significant rating", {
    gameId,
    playerId,
    ratingChange,
  });
}
```

## Implementation Checklist for New Features

1. **Specification Phase**
   - [ ] Write detailed spec with invariants
   - [ ] Include edge cases and examples
   - [ ] Get user approval on spec
   - [ ] Identify cross-view consistency requirements

2. **Test Phase**
   - [ ] Write business logic tests (not just technical tests)
   - [ ] Write cross-view consistency tests
   - [ ] Write manual calculation verification tests
   - [ ] Write edge case tests

3. **Implementation Phase**
   - [ ] Follow TDD - tests first, then code
   - [ ] Validate against real data during development
   - [ ] Check for logical consistency

4. **Verification Phase**
   - [ ] All tests pass
   - [ ] Manual spot checks pass
   - [ ] Cross-view consistency verified
   - [ ] Business logic makes sense

5. **Post-Deployment**
   - [ ] Monitor for anomalies
   - [ ] Gather user feedback
   - [ ] Document any issues for future reference

This process would have caught both the rating calculation bug (where winners were losing rating) and any rating delta inconsistencies by explicitly testing for business logic correctness rather than just technical correctness.
