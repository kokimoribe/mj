# Test Cleanup Recommendations

Based on the new Product Requirements document, here are recommendations for cleaning up the existing test suite.

## Tests to Remove

### 1. All `/adhoc/` tests

These were created for debugging specific production issues and are no longer needed:

- `bug-fixes-validation.spec.ts`
- `check-production-errors.spec.ts`
- `comprehensive-*.spec.ts`
- `debug-*.spec.ts`
- `player-profile-*.spec.ts`
- `production-*.spec.ts`
- `verify-*.spec.ts`
- All other adhoc tests

**Reason**: These were temporary debugging tests that don't align with the product requirements.

### 2. Duplicate test files

- `rating-display-validation.spec.ts`
- `enhanced-production-test.spec.ts`
- `fixed-production-test.spec.ts`
- `diagnose-production-issues.spec.ts`
- `immediate-action-test.spec.ts`

**Reason**: The new comprehensive test suite covers all these scenarios.

### 3. Old feature tests in `/features/phase-0/`

Keep only if they test unique scenarios not covered in the new tests:

- Review each test case
- Extract any unique edge cases
- Integrate into new comprehensive tests

## Tests to Update

### 1. Keep but align with new requirements:

- `/user-stories/` tests - Update to match new product language
- `/visual-regression/` tests - Keep for visual consistency
- `/integration/` tests - Update data flow to match new requirements

### 2. Component tests to update:

Look for any `.spec.tsx` files that test:

- Uma/oka display (should be removed)
- "Need more games" threshold (should be 1 game, not 2)
- Rating calculations (should expect accumulated values)

## New Test Structure

```
/e2e/
├── features/
│   ├── league-standings.spec.ts    ✅ Created
│   ├── player-profiles.spec.ts     ✅ Created
│   ├── game-history.spec.ts        ✅ Created
│   └── pwa-features.spec.ts        ✅ Created
├── user-stories/                    📝 Update existing
├── visual-regression/               ✅ Keep as-is
├── integration/                     📝 Update to new data flow
├── product-requirements-test-strategy.md  ✅ Created
└── test-cleanup-recommendations.md  ✅ This file
```

## Test Data Requirements

### Remove test data for:

- Uma/oka adjustments (no longer displayed)
- Win rates (not in requirements)
- Advanced statistics (not in requirements)

### Ensure test data includes:

- `rating_before` and `rating_after` for all games
- `rating_change` calculated correctly
- Accumulated rating values (50-100 range)
- Proper date/time formatting

## Implementation Steps

1. **Phase 1: Cleanup**

   ```bash
   # Remove all adhoc tests
   rm -rf e2e/adhoc/

   # Remove duplicate tests
   rm e2e/rating-display-validation.spec.ts
   rm e2e/enhanced-production-test.spec.ts
   rm e2e/fixed-production-test.spec.ts
   rm e2e/diagnose-production-issues.spec.ts
   rm e2e/immediate-action-test.spec.ts
   ```

2. **Phase 2: Update Existing**
   - Review `/user-stories/` tests
   - Update assertions to match new requirements
   - Remove any uma/oka related checks

3. **Phase 3: Run New Tests**

   ```bash
   # Run the new comprehensive test suite
   npm run test:e2e -- features/
   ```

4. **Phase 4: Update CI/CD**
   - Update test commands to use new structure
   - Remove references to deleted tests

## Success Metrics

The test suite should:

1. ✅ Test all features in the Product Requirements
2. ✅ Use product language (not technical jargon)
3. ✅ Focus on user experience
4. ✅ Be maintainable and clear
5. ✅ Serve as progress meter for implementation

## Notes for Developers

- The new tests use `data-testid` attributes extensively
- Tests assume these IDs exist in the implementation
- If a test fails, check if the component has the expected test ID
- Focus on user-visible behavior, not implementation details
