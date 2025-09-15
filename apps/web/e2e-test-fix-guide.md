# E2E Test Environment Fix Guide

## 🔍 Issues Identified

### 1. Network Connectivity Issue

The local dev server on port 3000 is not responding to HTTP requests properly, causing all E2E tests to timeout.

### 2. Selector Mismatches

Original tests were using incorrect selectors that didn't match the actual components.

### 3. Missing Test IDs

Some components were missing `data-testid` attributes (now fixed).

## ✅ Fixes Applied

### Component Updates

Added `data-testid` attributes to:

- `ConfigurableLeaderboardHeader`: `data-testid="leaderboard-header"`
- `ConfigurationPanel`: `data-testid="configuration-panel"`
- `ConfigurationIndicator`: `data-testid="config-indicator"`

### Test File Created

Created `e2e/configuration-playground-simple.spec.ts` with correct selectors.

## 🛠️ How to Fix E2E Test Environment

### Step 1: Kill and Restart Dev Server

```bash
# Find and kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Start fresh dev server
cd apps/web
npm run dev
```

### Step 2: Verify Server is Accessible

```bash
# In a new terminal, test the server
curl http://localhost:3000
# Should return HTML, not hang
```

### Step 3: Run Simple E2E Test

```bash
# Run the simplified test with correct selectors
npm run test:e2e -- e2e/configuration-playground-simple.spec.ts
```

### Step 4: If Tests Still Fail - Use Mock Mode

The test helpers already support mocking API responses. Update the test to use mocks:

```typescript
import { mockAPIResponses } from "./utils/test-helpers";

test.beforeEach(async ({ page }) => {
  // Enable API mocking
  await mockAPIResponses(page);

  // Then navigate
  await page.goto("/");
});
```

## 🔧 Alternative Solutions

### 1. Direct Supabase Testing

If the dev server continues to have issues, tests can connect directly to Supabase:

```typescript
// In test setup
const supabase = createClient(
  process.env.SUPABASE_URL || "https://gtqonrgwequdnzvhbuod.supabase.co",
  process.env.SUPABASE_ANON_KEY || "..."
);
```

### 2. Use Production URL

For verification, tests can run against production:

```bash
PLAYWRIGHT_BASE_URL=https://mj.skitzo.dev npm run test:e2e
```

### 3. Docker Environment

Consider containerizing the test environment to avoid local issues:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.54.1-focal
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["npm", "run", "test:e2e"]
```

## 📋 Test Consolidation Needed

These test files should be consolidated:

- `e2e/features/configuration-playground.spec.ts` (original)
- `e2e/features/configuration-playground-verify.spec.ts`
- `e2e/configuration-playground-simple.spec.ts` (new simplified)
- `e2e/verify-configuration-playground.spec.ts`

Keep the best parts of each and create one comprehensive test suite.

## 🎯 Next Steps

1. Fix the dev server connectivity issue
2. Consolidate duplicate test files
3. Add missing test scenarios from the spec
4. Set up CI/CD to run E2E tests automatically

## 🏗️ Long-term Recommendations

1. **Test Environment Configuration**
   - Create `.env.test` with test-specific settings
   - Use a separate test database/project in Supabase
   - Configure Playwright to always use fresh browser contexts

2. **Test Organization**
   - Follow the existing pattern in `src/lib/test-ids.ts`
   - Group tests by feature in subdirectories
   - Use page object pattern for maintainability

3. **CI/CD Integration**
   - Run E2E tests on pull requests
   - Use GitHub Actions with Playwright
   - Store test artifacts (screenshots, videos) on failure

4. **Mock Strategy**
   - Use mocks for unit/integration tests
   - Use real API for E2E smoke tests
   - Have a flag to switch between modes
