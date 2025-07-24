import { test, expect } from "@playwright/test";

test.describe("Production Data Rendering Issue Verification", () => {
  test("verify production site renders data without errors", async ({
    page,
  }) => {
    // Navigate to production site
    await page.goto("https://mj-web-psi.vercel.app/");

    // Wait for network to settle
    await page.waitForLoadState("networkidle");

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Check for specific errors
    page.on("pageerror", error => {
      consoleErrors.push(error.message);
    });

    // Wait a bit to collect any errors
    await page.waitForTimeout(2000);

    // Check if service worker error exists
    const hasServiceWorkerError = consoleErrors.some(
      error =>
        error.includes("_ref is not defined") ||
        error.includes("sw.js") ||
        error.includes("workbox")
    );

    // Check if database error exists
    const hasDatabaseError = consoleErrors.some(
      error =>
        error.includes("players_2.name") ||
        error.includes("column") ||
        error.includes("42703")
    );

    // Log all errors for debugging
    if (consoleErrors.length > 0) {
      console.log("Console errors found:", consoleErrors);
    }

    // Check if player data is rendered
    const playerCards = await page
      .locator('[data-testid="player-card"], .player-card, [class*="player"]')
      .count();
    console.log("Number of player cards found:", playerCards);

    // Check if leaderboard title is present
    const leaderboardTitle = await page
      .locator('h1:has-text("Leaderboard"), h2:has-text("Leaderboard")')
      .isVisible();
    console.log("Leaderboard title visible:", leaderboardTitle);

    // Check if any data containers exist
    const dataContainers = await page
      .locator('[class*="grid"], [class*="flex"], table')
      .count();
    console.log("Number of data containers found:", dataContainers);

    // Assertions
    expect(hasServiceWorkerError, "Service worker error should not occur").toBe(
      false
    );
    expect(hasDatabaseError, "Database error should not occur").toBe(false);
    expect(playerCards, "Player cards should be rendered").toBeGreaterThan(0);
    expect(leaderboardTitle, "Leaderboard title should be visible").toBe(true);
  });

  test("verify local development site renders data correctly", async ({
    page,
  }) => {
    // Navigate to local development site
    await page.goto("http://localhost:3000/");

    // Wait for network to settle
    await page.waitForLoadState("networkidle");

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit to collect any errors
    await page.waitForTimeout(2000);

    // Check if player data is rendered
    const playerCards = await page
      .locator('[data-testid="player-card"], .player-card, [class*="player"]')
      .count();
    console.log("Number of player cards found (local):", playerCards);

    // Log any errors for debugging
    if (consoleErrors.length > 0) {
      console.log("Console errors found (local):", consoleErrors);
    }

    // Assertions
    expect(
      playerCards,
      "Player cards should be rendered on local"
    ).toBeGreaterThan(0);
    expect(
      consoleErrors.length,
      "No console errors should occur on local"
    ).toBe(0);
  });

  test("compare production and local data rendering", async ({ browser }) => {
    // Create two contexts for parallel testing
    const productionContext = await browser.newContext();
    const localContext = await browser.newContext();

    const productionPage = await productionContext.newPage();
    const localPage = await localContext.newPage();

    // Navigate to both sites
    await Promise.all([
      productionPage.goto("https://mj-web-psi.vercel.app/"),
      localPage.goto("http://localhost:3000/"),
    ]);

    // Wait for both to load
    await Promise.all([
      productionPage.waitForLoadState("networkidle"),
      localPage.waitForLoadState("networkidle"),
    ]);

    // Count player cards on both
    const [productionCards, localCards] = await Promise.all([
      productionPage
        .locator('[data-testid="player-card"], .player-card, [class*="player"]')
        .count(),
      localPage
        .locator('[data-testid="player-card"], .player-card, [class*="player"]')
        .count(),
    ]);

    console.log("Production player cards:", productionCards);
    console.log("Local player cards:", localCards);

    // Check for specific elements
    const [productionHasData, localHasData] = await Promise.all([
      productionPage
        .locator('[class*="rating"], [class*="score"], [class*="points"]')
        .count(),
      localPage
        .locator('[class*="rating"], [class*="score"], [class*="points"]')
        .count(),
    ]);

    console.log("Production has rating data:", productionHasData > 0);
    console.log("Local has rating data:", localHasData > 0);

    // Clean up
    await productionContext.close();
    await localContext.close();

    // Assertions
    expect(
      productionCards,
      "Production should render same number of cards as local"
    ).toBe(localCards);
    expect(
      productionHasData,
      "Production should have rating data"
    ).toBeGreaterThan(0);
  });
});
