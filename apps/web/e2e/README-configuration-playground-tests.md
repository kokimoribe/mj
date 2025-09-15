# Configuration Playground Test Suite

This directory contains comprehensive E2E and unit tests for the Configuration Playground feature, following TDD principles as outlined in `CLAUDE.md`.

## Test Structure

### E2E Tests (`configuration-playground.spec.ts`)

Comprehensive Playwright tests that map directly to user stories:

1. **User Story 1: Default Season 3 Configuration**
   - Verifies Season 3 loads by default
   - Checks UI is hidden initially
   - Validates performance (<2 second load)

2. **User Story 2: Compare Season Configurations**
   - Tests expanding configuration panel
   - Verifies preset switching with cached data

3. **User Story 3: Create Custom Configurations**
   - Tests custom config creation
   - Validates uma values sum to zero

4. **User Story 4: Materialization Process**
   - Tests non-blocking loading indicator
   - Verifies user can continue browsing

5. **User Story 5: Cross-Page Configuration Context**
   - Tests config persistence across navigation
   - Verifies player profiles use same config

6. **User Story 6: Mobile Experience**
   - Tests responsive design
   - Verifies touch-friendly inputs
   - Tests configuration persistence

### Unit Tests (`ConfigurationPlayground.test.tsx`)

Component-level tests using React Testing Library:

- `ConfigurableLeaderboardHeader` - Header replacement functionality
- `ConfigurationPanel` - Form validation and interactions
- `ConfigurationIndicator` - Global config display
- Mobile responsiveness
- Integration flow tests

## Running Tests

### Before Implementation (TDD Verification)

```bash
# Run verification test to confirm UI doesn't exist yet
npm run test:e2e -- e2e/features/configuration-playground-verify.spec.ts

# Run unit tests to verify components don't exist
npm test -- ConfigurationPlayground.test.tsx
```

### After Implementation

```bash
# Run all Configuration Playground E2E tests
npm run test:e2e -- --grep "Configuration Playground"

# Run specific user story
npm run test:e2e -- --grep "User Story 1"

# Run unit tests
npm test -- ConfigurationPlayground.test
```

## Test Data

Tests use real Supabase data where possible:

- Official configurations (Season 3, Season 4) from `rating_configurations` table
- Player data from `cached_player_ratings` table
- Game data from `cached_game_results` table

## Key Testing Principles

1. **User-Focused**: Tests verify user experience, not implementation
2. **Real Data**: Uses actual Supabase data, not mocks (where feasible)
3. **Comprehensive**: Covers all acceptance criteria from spec
4. **Fail First**: Tests written before implementation (TDD)

## Expected Test Results

### Before Implementation

- All tests should FAIL because components don't exist
- Verification tests should PASS (confirming non-existence)

### After Implementation

- All tests should PASS
- Performance tests should meet targets (<2s load, <500ms config switch)
- Mobile tests should verify touch-friendly UI
- Integration tests should confirm data flow

## Test Helpers

### `ConfigurationPlaygroundPage` Class

Page Object Model providing:

- Locators for all UI elements
- Action methods (expand, select, apply)
- Assertion helpers

### Supabase Helpers

- `getOfficialConfigurations()` - Fetch official configs
- `checkDataExists()` - Verify materialized data

## Notes

- Tests handle both blocking and non-blocking loading states
- URL parameter handling is optional (checks if implemented)
- Some tests are skipped when using real data (e.g., error scenarios)
- Mobile viewport testing at 375x667 (iPhone SE)
