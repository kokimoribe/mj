import { test, expect } from "@playwright/test";

test.describe("Player Profile Regression Tests", () => {
  test("player profile should render all data sections correctly", async ({
    page,
  }) => {
    // Enable console error tracking
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", error => {
      consoleErrors.push(error.message);
    });

    // Navigate to a player profile with known games
    await page.goto("http://localhost:3000/player/joseph");
    await page.waitForLoadState("networkidle");

    // 1. Check header information
    const playerName = await page
      .locator("h1, h2")
      .filter({ hasText: /Joseph/i })
      .isVisible();
    expect(playerName, "Player name should be visible").toBe(true);

    const rankInfo = await page.locator("text=/Rank #\\d+/").isVisible();
    expect(rankInfo, "Rank information should be visible").toBe(true);

    const ratingInfo = await page
      .locator("text=/Rating: \\d+\\.\\d+/")
      .isVisible();
    expect(ratingInfo, "Rating information should be visible").toBe(true);

    const gamesInfo = await page.locator("text=/\\d+ games/").isVisible();
    expect(gamesInfo, "Games played count should be visible").toBe(true);

    // 2. Check Rating Chart
    const chartSection = await page
      .locator('text="Rating Progression"')
      .isVisible();
    expect(chartSection, "Rating Progression section should be visible").toBe(
      true
    );

    // Check if "Need more games" message is NOT shown for players with many games
    const needMoreGames = await page
      .locator('text="Need more games for chart"')
      .isVisible();

    // Check if chart is rendered (either canvas or svg elements)
    const chartCanvas = await page
      .locator('.recharts-responsive-container, canvas, svg[class*="recharts"]')
      .isVisible();

    // One of these should be true
    expect(
      needMoreGames || chartCanvas,
      "Either chart or 'need more games' message should be visible"
    ).toBe(true);

    // If Joseph has many games, the chart should be visible
    const gamesText = await page.locator("text=/\\d+ games/").textContent();
    const gamesCount = parseInt(gamesText?.match(/\\d+/)?.[0] || "0");
    if (gamesCount >= 2) {
      expect(
        needMoreGames,
        `Should not show 'need more games' when player has ${gamesCount} games`
      ).toBe(false);
      expect(
        chartCanvas,
        "Chart should be visible for players with 2+ games"
      ).toBe(true);
    }

    // 3. Check Performance Stats
    const perfStatsSection = await page
      .locator('text="Performance Stats"')
      .isVisible();
    expect(
      perfStatsSection,
      "Performance Stats section should be visible"
    ).toBe(true);

    const avgPlacement = await page
      .locator("text=/Average Placement: \\d+\\.\\d+/")
      .isVisible();
    expect(avgPlacement, "Average placement should be visible").toBe(true);

    const lastPlayed = await page.locator("text=/Last Played: .+/").isVisible();
    expect(lastPlayed, "Last played date should be visible").toBe(true);

    // 4. Check Recent Games
    const recentGamesSection = await page
      .locator('text="Recent Games"')
      .isVisible();
    expect(recentGamesSection, "Recent Games section should be visible").toBe(
      true
    );

    // Count game entries
    const gameEntries = await page
      .locator(
        '[data-testid*="game-entry"], div:has(> text=/\\d{1,2}(st|nd|rd|th)/)'
      )
      .count();
    console.log("Number of game entries found:", gameEntries);
    expect(gameEntries, "Should have at least one game entry").toBeGreaterThan(
      0
    );

    // 5. Check for API errors
    const apiErrors = consoleErrors.filter(
      error =>
        error.includes("PGRST") ||
        error.includes("failed to parse") ||
        error.includes("column") ||
        error.includes("Failed to fetch")
    );

    if (apiErrors.length > 0) {
      console.log("API errors found:", apiErrors);
    }

    expect(apiErrors.length, "No API errors should occur").toBe(0);

    // Take screenshot for debugging
    await page.screenshot({ path: "player-profile-test.png", fullPage: true });
  });

  test("player profile API calls should succeed", async ({ page }) => {
    const apiResponses: { url: string; status: number; error?: any }[] = [];

    // Monitor API responses
    page.on("response", async response => {
      const url = response.url();
      if (url.includes("supabase.co") || url.includes("/api/")) {
        const status = response.status();
        let error = undefined;

        if (status >= 400) {
          try {
            error = await response.json();
          } catch {
            error = await response.text();
          }
        }

        apiResponses.push({ url, status, error });
      }
    });

    // Navigate to player profile
    await page.goto("http://localhost:3000/player/joseph");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // Wait for all API calls to complete

    // Check for failed API calls
    const failedCalls = apiResponses.filter(r => r.status >= 400);

    if (failedCalls.length > 0) {
      console.log("Failed API calls:");
      failedCalls.forEach(call => {
        console.log(`- ${call.url}`);
        console.log(`  Status: ${call.status}`);
        console.log(`  Error:`, call.error);
      });
    }

    // Specific checks for known issues
    const orderingError = failedCalls.find(
      call =>
        JSON.stringify(call.error).includes("failed to parse order") ||
        JSON.stringify(call.error).includes("games.finished_at")
    );

    expect(
      orderingError,
      "Should not have ordering syntax errors"
    ).toBeUndefined();

    const columnError = failedCalls.find(
      call =>
        JSON.stringify(call.error).includes("column") &&
        JSON.stringify(call.error).includes("does not exist")
    );

    expect(
      columnError,
      "Should not have column not found errors"
    ).toBeUndefined();

    // Overall check
    expect(failedCalls.length, "All API calls should succeed").toBe(0);
  });

  test("player profile chart should render with sufficient data", async ({
    page,
  }) => {
    // Navigate to player profile
    await page.goto("http://localhost:3000/player/joseph");
    await page.waitForLoadState("networkidle");

    // Wait for chart to potentially render
    await page.waitForTimeout(2000);

    // Debug: Log what's actually on the page
    const chartSection = page
      .locator(
        '[data-testid="rating-chart"], [aria-label*="chart"], .recharts-responsive-container'
      )
      .first();
    const isChartVisible = await chartSection.isVisible().catch(() => false);

    console.log("Chart visible:", isChartVisible);

    // Check for chart elements
    const chartElements = {
      container: await page.locator(".recharts-responsive-container").count(),
      svg: await page.locator("svg.recharts-surface").count(),
      line: await page.locator(".recharts-line").count(),
      dots: await page
        .locator('.recharts-dot, circle[class*="recharts"]')
        .count(),
    };

    console.log("Chart elements found:", chartElements);

    // Check for "need more games" message
    const needMoreGamesVisible = await page
      .locator('text="Need more games for chart"')
      .isVisible()
      .catch(() => false);
    console.log("'Need more games' message visible:", needMoreGamesVisible);

    // Get games count from header
    const gamesText = await page.locator("text=/\\d+ games/").textContent();
    const gamesCount = parseInt(gamesText?.match(/\\d+/)?.[0] || "0");
    console.log("Games count from header:", gamesCount);

    // Assertions based on games count
    if (gamesCount >= 2) {
      expect(
        needMoreGamesVisible,
        `Should not show 'need more games' with ${gamesCount} games`
      ).toBe(false);
      expect(
        chartElements.container > 0 || chartElements.svg > 0,
        "Chart container should be rendered"
      ).toBe(true);
    }

    // Take a screenshot for visual debugging
    await page.screenshot({
      path: "player-profile-chart-debug.png",
      fullPage: true,
    });
  });
});
