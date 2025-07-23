# Adhoc E2E Tests

This directory contains adhoc tests for verifying current database state.

## Current Status (December 2024)

The Supabase project has disabled legacy API keys. The app is currently unable to connect because:

1. The environment uses the old "anon key" format
2. Supabase now requires the new "publishable key" format
3. Error message: "Legacy API keys are disabled"

## To Fix

1. Go to the Supabase dashboard for project `soihuphdqgkbafozrzqn`
2. Navigate to Settings → API
3. Copy the new publishable key (listed as "anon public")
4. Update `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="new_key_from_dashboard"
   ```

## Test Files

- `snapshot-delta-values.spec.ts` - Captures and verifies delta calculations with real data
  - Test 1: Captures leaderboard delta values and verifies calculations
  - Test 2: Verifies profile page deltas match leaderboard
  - Test 3: Captures game history rating progressions

These tests are designed to work with the actual database state and will fail if:

- The database connection fails (current issue)
- The data changes significantly
- The UI structure changes

## Running Tests

Once the API key is updated:

```bash
npm run test:e2e -- e2e/adhoc/snapshot-delta-values.spec.ts
```

## Expected Data (Based on Code Review)

The tests expect to find players with:

- Current ratings (e.g., 1613.4 for Koki)
- 7-day deltas (e.g., ▲38.8)
- Rating history with proper calculations

The delta calculation should follow:

```
Delta = Current Rating - Rating Before Oldest Game in Period
```
