import { test, expect } from "@playwright/test";

test.describe("Verify Specific Production Issues", () => {
  test("check leaderboard mini charts show accumulated ratings", async ({
    page,
  }) => {
    // Navigate to production leaderboard
    await page.goto("https://mj-web-psi.vercel.app/");
    await page.waitForLoadState("networkidle");

    // Expand first player card
    const firstPlayer = page
      .locator('[data-testid*="player"], [class*="player"]')
      .first();
    await firstPlayer.click();

    // Wait for expansion
    await page.waitForTimeout(500);

    // Check if mini chart is visible
    const miniChart = await page
      .locator(
        '[data-testid="mini-rating-chart"], .recharts-responsive-container'
      )
      .isVisible();
    console.log("Mini chart visible:", miniChart);

    // Get chart data by checking tooltips
    if (miniChart) {
      const dots = await page.locator(".recharts-dot").all();
      console.log("Number of data points:", dots.length);

      // Hover over each dot to get values
      for (let i = 0; i < Math.min(3, dots.length); i++) {
        await dots[i].hover();
        await page.waitForTimeout(200);
        const tooltip = await page
          .locator(".recharts-tooltip-wrapper")
          .textContent();
        console.log(`Data point ${i + 1}:`, tooltip);
      }
    }

    // Take screenshot for verification
    await page.screenshot({
      path: "leaderboard-mini-chart.png",
      fullPage: true,
    });
  });

  test("check player profile chart rendering", async ({ page }) => {
    // Navigate directly to a player profile with many games
    await page.goto(
      "https://mj-web-psi.vercel.app/player/e0f959ee-eb77-57de-b3af-acdecf679e70"
    );
    await page.waitForLoadState("networkidle");

    // Check for "need more games" message
    const needMoreGames = await page
      .locator('text="Need more games for chart"')
      .isVisible();
    console.log("Shows 'Need more games for chart':", needMoreGames);

    // Check if chart is rendered
    const chartContainer = await page
      .locator('[data-testid="rating-chart"], .recharts-responsive-container')
      .isVisible();
    console.log("Chart container visible:", chartContainer);

    // Get games count from header
    const gamesText = await page.locator("text=/\\d+ games/").textContent();
    console.log("Games count:", gamesText);

    // Check recent games section
    const recentGamesSection = await page
      .locator('text="Recent Games"')
      .isVisible();
    console.log("Recent games section visible:", recentGamesSection);

    // Get first few game entries to check the pts display
    const gameEntries = await page
      .locator(
        '[data-testid*="game-entry"], [class*="border"][class*="rounded"]:has(text=/\\d+(st|nd|rd|th)/)'
      )
      .all();
    console.log("Number of game entries:", gameEntries.length);

    for (let i = 0; i < Math.min(3, gameEntries.length); i++) {
      const gameText = await gameEntries[i].textContent();
      console.log(`Game ${i + 1}:`, gameText);

      // Check for specific patterns
      if (gameText?.includes("pts")) {
        const ptsMatch = gameText.match(/([+-]?\d+(?:,\d+)*)\s*pts/);
        console.log("  Points display:", ptsMatch?.[0]);
      }
      if (gameText?.includes("NaN")) {
        console.log("  ⚠️ Contains NaN!");
      }
    }

    // Take screenshot
    await page.screenshot({ path: "player-profile-issue.png", fullPage: true });
  });

  test("check game history page score displays", async ({ page }) => {
    // Navigate to game history
    await page.goto("https://mj-web-psi.vercel.app/games");
    await page.waitForLoadState("networkidle");

    // Get first few game cards
    const gameCards = await page
      .locator(
        '[data-testid*="game-card"], [class*="border"][class*="rounded"]:has(text=/📅/)'
      )
      .all();
    console.log("Number of game cards:", gameCards.length);

    for (let i = 0; i < Math.min(2, gameCards.length); i++) {
      console.log(`\nGame ${i + 1}:`);
      const gameText = await gameCards[i].textContent();

      // Extract score adjustments
      const scoreAdjustments = gameText?.match(/([+-]\d+(?:,\d+)*)\s*pts/g);
      if (scoreAdjustments) {
        console.log("  Score adjustments found:", scoreAdjustments);
      }

      // Extract rating changes
      const ratingChanges = gameText?.match(/[↑↓]\d+\.\d+/g);
      if (ratingChanges) {
        console.log("  Rating changes found:", ratingChanges);
      }

      // Check for NaN
      if (gameText?.includes("NaN")) {
        console.log("  ⚠️ Contains NaN!");
      }
    }

    await page.screenshot({ path: "game-history-scores.png", fullPage: true });
  });
});
