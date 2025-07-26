# Production E2E Test Analysis

## Summary

The E2E tests are failing against the Vercel deployment (`https://rtmjp.vercel.app/`) due to a configuration issue, not because the production site is inaccessible or broken.

## Root Cause

1. **Tests use relative URLs**: All E2E tests use relative paths like `await page.goto("/")`
2. **Production config has no baseURL**: The `playwright.production.config.ts` intentionally doesn't set a `baseURL`
3. **Invalid navigation**: Without a baseURL, Playwright cannot navigate to "/" - it's an invalid URL

## Evidence

### Production Site Status

- ✅ Site is accessible at https://rtmjp.vercel.app/
- ✅ Returns HTTP 200 status
- ✅ All test elements are present (`[data-testid="leaderboard-view"]`, player cards, etc.)
- ✅ API calls to Supabase are working
- ✅ PWA is configured and ready for installation
- ✅ No CSP or security headers blocking automation

### Test Configuration Issues

```typescript
// playwright.config.ts (default)
use: {
  baseURL: "http://localhost:3000",  // Works for local dev
}

// playwright.production.config.ts
use: {
  // NO baseURL - we'll use full URLs in tests
}

// Current test code
await page.goto("/");  // This fails without baseURL!
```

## Solutions

### Option 1: Environment Variable (Recommended)

```bash
# Run tests with custom base URL
PLAYWRIGHT_BASE_URL=https://rtmjp.vercel.app npx playwright test
```

However, this requires modifying the config to use the environment variable:

```typescript
// playwright.config.ts
use: {
  baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
}
```

### Option 2: Use Production Config with baseURL

Update `playwright.production.config.ts`:

```typescript
use: {
  baseURL: "https://rtmjp.vercel.app",
  // ... rest of config
}
```

Then run:

```bash
npx playwright test -c playwright.production.config.ts
```

### Option 3: Create Production-Specific Tests

Create tests that use full URLs:

```typescript
// e2e/production/smoke-test.spec.ts
test("production smoke test", async ({ page }) => {
  await page.goto("https://rtmjp.vercel.app/");
  // ... rest of test
});
```

### Option 4: Helper Function

Create a helper that constructs full URLs:

```typescript
// e2e/helpers/url.ts
export function getUrl(path: string): string {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
  return new URL(path, baseUrl).toString();
}

// In tests
await page.goto(getUrl("/"));
```

## Recommendation

The best approach is **Option 1** - modify the main Playwright config to accept an environment variable:

1. Update `playwright.config.ts` to use `process.env.PLAYWRIGHT_BASE_URL`
2. Add a npm script for production testing:
   ```json
   "test:e2e:production": "PLAYWRIGHT_BASE_URL=https://rtmjp.vercel.app playwright test"
   ```
3. This allows the same tests to work for both local and production environments

## Additional Findings

1. **404 Error**: There's a console error for a failed resource load (likely the service worker or PWA manifest)
2. **No Authentication**: The site doesn't require any authentication for viewing
3. **Data Loading**: The site successfully loads data from Supabase in production
4. **Performance**: Initial page load and hydration complete within 3 seconds

## Next Steps

1. Update Playwright configuration to support environment variable for baseURL
2. Add production test script to package.json
3. Document the production testing process
4. Consider adding specific production smoke tests that verify critical functionality
