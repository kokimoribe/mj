# Playwright Integration Plan for Riichi Mahjong League

## Executive Summary

This document outlines a comprehensive plan to integrate Playwright E2E testing into the Riichi Mahjong League codebase, focusing on visual regression testing with screenshots for Phase 0 and Phase 0.5 features.

## Goals

1. **Automated E2E Testing**: Validate all Phase 0 and 0.5 features work correctly
2. **Visual Regression Testing**: Capture screenshots for UI validation and design iteration
3. **Developer Autonomy**: Enable autonomous UI improvements based on visual feedback
4. **CI/CD Integration**: Ensure tests run locally and in deployment pipeline

## Phase 1: Setup and Infrastructure (Day 1)

### 1.1 Install Playwright

```bash
cd apps/web
npm init playwright@latest
```

Configuration choices:

- TypeScript: Yes
- Test folder: `e2e`
- GitHub Actions: Yes
- Install browsers: Yes

### 1.2 Configure Playwright

Create `apps/web/playwright.config.ts`:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 1.3 Update .gitignore

Add to `.gitignore`:

```
# Playwright
/apps/web/test-results/
/apps/web/playwright-report/
/apps/web/playwright/.cache/
/apps/web/e2e/screenshots/
/apps/web/e2e/.screenshots-temp/
```

### 1.4 Add Test Scripts

Update `apps/web/package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:update-snapshots": "playwright test --update-snapshots"
  }
}
```

## Phase 2: Codebase Refactoring (Day 1-2)

### 2.1 Add Test IDs for Reliable Selectors

Create a constants file for test IDs:

```typescript
// apps/web/src/lib/test-ids.ts
export const TEST_IDS = {
  // Navigation
  NAV_HOME: "nav-home",
  NAV_GAMES: "nav-games",
  NAV_STATS: "nav-stats",
  NAV_PLAYGROUND: "nav-playground",

  // Leaderboard
  LEADERBOARD_VIEW: "leaderboard-view",
  LEADERBOARD_HEADER: "leaderboard-header",
  LEADERBOARD_REFRESH: "leaderboard-refresh",
  PLAYER_CARD: "player-card",
  PLAYER_CARD_EXPANDED: "player-card-expanded",

  // Player Profile
  PLAYER_PROFILE: "player-profile",
  PLAYER_STATS: "player-stats",
  PLAYER_GAMES: "player-games",
  RATING_CHART: "rating-chart",

  // Game History
  GAME_HISTORY_VIEW: "game-history-view",
  GAME_ENTRY: "game-entry",

  // Stats
  STATS_VIEW: "stats-view",
  STATS_CARD: "stats-card",
} as const;
```

### 2.2 Refactor Components for Testability

Add data-testid attributes to key components:

```typescript
// Example: LeaderboardView.tsx
<div data-testid={TEST_IDS.LEADERBOARD_VIEW}>
  <LeaderboardHeader data-testid={TEST_IDS.LEADERBOARD_HEADER} />
  {players.map(player => (
    <ExpandablePlayerCard
      key={player.id}
      data-testid={`${TEST_IDS.PLAYER_CARD}-${player.id}`}
      // ...
    />
  ))}
</div>
```

### 2.3 Create Test Utilities

```typescript
// apps/web/e2e/utils/test-helpers.ts
import { Page } from "@playwright/test";

export async function waitForDataLoad(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500); // Allow for animations
}

export async function takeScreenshot(page: Page, name: string) {
  await waitForDataLoad(page);
  await page.screenshot({
    path: `e2e/screenshots/${name}.png`,
    fullPage: true,
  });
}

export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await waitForDataLoad(page);
}
```

### 2.4 Mock Data Setup

Create mock data for consistent testing:

```typescript
// apps/web/e2e/fixtures/mock-data.ts
export const mockPlayers = [
  {
    id: "test-player-1",
    name: "Test Player 1",
    rating: 1500,
    games: 20,
    // ...
  },
  // ...
];
```

## Phase 3: Test Implementation (Day 2-3)

### 3.1 Phase 0 Feature Tests

#### Leaderboard Tests

```typescript
// apps/web/e2e/features/phase-0/leaderboard.spec.ts
import { test, expect } from "@playwright/test";
import { TEST_IDS } from "@/lib/test-ids";
import { takeScreenshot } from "../../utils/test-helpers";

test.describe("Phase 0: Leaderboard", () => {
  test("displays leaderboard with player rankings", async ({ page }) => {
    await page.goto("/");

    // Verify leaderboard loads
    await expect(page.getByTestId(TEST_IDS.LEADERBOARD_VIEW)).toBeVisible();

    // Take screenshot
    await takeScreenshot(page, "phase-0/leaderboard-default");

    // Verify player cards exist
    const playerCards = page.getByTestId(
      new RegExp(`${TEST_IDS.PLAYER_CARD}-`)
    );
    await expect(playerCards).toHaveCount(10); // Assuming 10 players
  });

  test("expands player card to show details", async ({ page }) => {
    await page.goto("/");

    // Click first player card
    const firstCard = page.getByTestId(`${TEST_IDS.PLAYER_CARD}-test-player-1`);
    await firstCard.click();

    // Verify expanded state
    await expect(firstCard).toHaveAttribute("aria-expanded", "true");

    // Take screenshot of expanded state
    await takeScreenshot(page, "phase-0/leaderboard-card-expanded");
  });

  test("navigates to player profile", async ({ page }) => {
    await page.goto("/");

    // Expand card and click profile button
    const firstCard = page.getByTestId(`${TEST_IDS.PLAYER_CARD}-test-player-1`);
    await firstCard.click();
    await page.getByText("View Full Profile").click();

    // Verify navigation
    await expect(page).toHaveURL(/\/player\/test-player-1/);
    await takeScreenshot(page, "phase-0/player-profile");
  });
});
```

#### Game History Tests

```typescript
// apps/web/e2e/features/phase-0/game-history.spec.ts
test.describe("Phase 0: Game History", () => {
  test("displays recent games", async ({ page }) => {
    await page.goto("/games");

    await expect(page.getByTestId(TEST_IDS.GAME_HISTORY_VIEW)).toBeVisible();
    await takeScreenshot(page, "phase-0/game-history");
  });
});
```

### 3.2 Phase 0.5 Feature Tests

#### Accessibility Tests

```typescript
// apps/web/e2e/features/phase-0-5/accessibility.spec.ts
test.describe("Phase 0.5: Accessibility", () => {
  test("keyboard navigation works on expandable cards", async ({ page }) => {
    await page.goto("/");

    // Tab to first card
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab"); // Skip nav

    // Expand with Enter
    await page.keyboard.press("Enter");

    // Verify expanded
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toHaveAttribute("aria-expanded", "true");

    await takeScreenshot(page, "phase-0-5/keyboard-navigation");
  });

  test("screen reader labels are present", async ({ page }) => {
    await page.goto("/");

    // Check navigation aria-labels
    const navItems = page.getByRole("navigation").getByRole("link");
    for (const item of await navItems.all()) {
      await expect(item).toHaveAttribute("aria-label", /.+/);
    }
  });
});
```

#### Performance Tests

```typescript
// apps/web/e2e/features/phase-0-5/performance.spec.ts
test.describe("Phase 0.5: Performance", () => {
  test("leaderboard renders without layout shift", async ({ page }) => {
    await page.goto("/");

    // Measure CLS
    const cls = await page.evaluate(() => {
      return new Promise(resolve => {
        let clsValue = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "layout-shift") {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ["layout-shift"] });

        setTimeout(() => resolve(clsValue), 3000);
      });
    });

    expect(cls).toBeLessThan(0.1); // Good CLS score
  });
});
```

### 3.3 Visual Regression Tests

```typescript
// apps/web/e2e/visual-regression/screenshots.spec.ts
test.describe("Visual Regression Screenshots", () => {
  const viewports = [
    { name: "desktop", width: 1920, height: 1080 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 375, height: 812 },
  ];

  for (const viewport of viewports) {
    test.describe(`${viewport.name} viewport`, () => {
      test.use({ viewport });

      test("captures all main views", async ({ page }) => {
        // Home/Leaderboard
        await page.goto("/");
        await takeScreenshot(page, `visual/${viewport.name}/home`);

        // Games
        await page.goto("/games");
        await takeScreenshot(page, `visual/${viewport.name}/games`);

        // Stats
        await page.goto("/stats");
        await takeScreenshot(page, `visual/${viewport.name}/stats`);
      });
    });
  }
});
```

## Phase 4: Screenshot Management (Day 3)

### 4.1 Screenshot Organization

```
apps/web/e2e/screenshots/
├── phase-0/
│   ├── leaderboard-default.png
│   ├── leaderboard-card-expanded.png
│   ├── player-profile.png
│   ├── game-history.png
│   └── stats-view.png
├── phase-0-5/
│   ├── keyboard-navigation.png
│   ├── focus-states.png
│   └── mobile-responsive.png
└── visual/
    ├── desktop/
    ├── tablet/
    └── mobile/
```

### 4.2 Screenshot Comparison Workflow

Create a helper script:

```typescript
// apps/web/e2e/utils/screenshot-compare.ts
import { Page } from "@playwright/test";

export async function compareScreenshots(page: Page, name: string) {
  const screenshot = await page.screenshot({ fullPage: true });

  // Save to temp folder
  await page.screenshot({
    path: `e2e/.screenshots-temp/${name}.png`,
    fullPage: true,
  });

  // Log for manual review
  console.log(`Screenshot saved: ${name}`);
}
```

### 4.3 Create Visual Review Tool

```typescript
// apps/web/scripts/review-screenshots.js
const fs = require("fs");
const path = require("path");

// Generate HTML page with all screenshots
function generateReviewPage() {
  const screenshotsDir = path.join(__dirname, "../e2e/screenshots");
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Screenshot Review</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .category { margin-bottom: 40px; }
        .screenshot { margin: 10px; display: inline-block; }
        img { max-width: 300px; border: 1px solid #ccc; }
      </style>
    </head>
    <body>
      <h1>UI Screenshot Review</h1>
      ${generateScreenshotHTML(screenshotsDir)}
    </body>
    </html>
  `;

  fs.writeFileSync(path.join(__dirname, "../screenshot-review.html"), html);
  console.log("Review page generated: screenshot-review.html");
}
```

## Phase 5: Integration and Documentation (Day 4)

### 5.1 Update Development Workflow

Create development guide:

```markdown
# E2E Testing Workflow

## Running Tests Locally

1. Start dev server: `npm run dev`
2. Run tests: `npm run test:e2e`
3. View screenshots: Open `screenshot-review.html`

## Updating UI

1. Make UI changes
2. Run tests: `npm run test:e2e`
3. Review new screenshots
4. Update snapshots if needed: `npm run test:e2e:update-snapshots`
```

### 5.2 CI/CD Integration

Add to GitHub Actions:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Implementation Timeline

### Day 1: Setup

- [ ] Install Playwright
- [ ] Configure for Next.js
- [ ] Set up folder structure
- [ ] Update .gitignore

### Day 2: Refactoring

- [ ] Add test IDs to components
- [ ] Create test utilities
- [ ] Set up mock data
- [ ] Refactor for testability

### Day 3: Test Writing

- [ ] Write Phase 0 tests
- [ ] Write Phase 0.5 tests
- [ ] Implement screenshot capture
- [ ] Create visual regression tests

### Day 4: Polish

- [ ] Document patterns
- [ ] Create review tools
- [ ] Set up CI/CD
- [ ] Team training

## Benefits

1. **Automated Validation**: All Phase 0/0.5 features tested automatically
2. **Visual Documentation**: Screenshots provide visual reference for UI state
3. **Design Iteration**: Easy to see UI changes and iterate
4. **Regression Prevention**: Catch visual and functional regressions
5. **Developer Confidence**: Make changes knowing tests will catch issues

## Next Steps

1. Get team buy-in on approach
2. Review and approve folder structure
3. Begin implementation with Phase 1
4. Iterate based on team feedback
