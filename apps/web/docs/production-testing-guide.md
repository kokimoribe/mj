# Production Testing Guide

This guide explains how to run E2E tests against the production Vercel deployment.

## Quick Start

Run all E2E tests against production:

```bash
npm run test:e2e:production
```

Run specific test files:

```bash
npm run test:e2e:production -- e2e/features/league-standings.spec.ts
```

Run with UI mode for debugging:

```bash
PLAYWRIGHT_BASE_URL=https://rtmjp.vercel.app npm run test:e2e:ui
```

## Configuration

The E2E tests are configured to support both local and production testing through the `PLAYWRIGHT_BASE_URL` environment variable:

- **Local Development** (default): `http://localhost:3000`
- **Production**: `https://rtmjp.vercel.app`

The configuration is set in `playwright.config.ts`:

```typescript
baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
```

## Available Scripts

- `npm run test:e2e` - Run tests against local development server
- `npm run test:e2e:production` - Run tests against production
- `npm run test:stories` - Run user story tests locally
- `npm run test:e2e:headed` - Run tests with visible browser (local)

## Production Test Considerations

1. **Network Latency**: Production tests may take longer due to network latency
2. **Rate Limiting**: Be mindful of API rate limits when running many tests
3. **Data Consistency**: Production data may change between test runs
4. **No Test Isolation**: Tests run against real production data

## Debugging Production Issues

If tests fail in production but pass locally:

1. Check network connectivity:

   ```bash
   curl -I https://rtmjp.vercel.app
   ```

2. Run tests in headed mode to see what's happening:

   ```bash
   PLAYWRIGHT_BASE_URL=https://rtmjp.vercel.app npx playwright test --headed
   ```

3. Use the Playwright trace viewer:
   ```bash
   PLAYWRIGHT_BASE_URL=https://rtmjp.vercel.app npx playwright test --trace on
   npx playwright show-trace
   ```

## Alternative: Production-Specific Config

You can also use the production-specific config file:

```bash
npx playwright test -c playwright.production.config.ts
```

Note: This config doesn't set a baseURL, so tests must use full URLs.

## Best Practices

1. **Don't run destructive tests** against production
2. **Use read-only tests** for production verification
3. **Run production tests sparingly** to avoid unnecessary load
4. **Monitor test failures** as they may indicate production issues
5. **Keep test data expectations flexible** as production data changes

## Common Issues

### Timeout Errors

- Increase timeout: `--timeout=60000`
- Check if the site is accessible
- Verify no authentication is blocking tests

### Element Not Found

- Production may have different data than local
- Use more flexible selectors
- Add appropriate wait conditions

### Service Worker Issues

- Clear browser cache if PWA causes issues
- Use incognito mode for clean state
