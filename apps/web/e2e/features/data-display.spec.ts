import { test, expect } from "@playwright/test";

test.describe("Data Display Requirements", () => {
  test.describe("Leaderboard Mini Charts", () => {
    test("should display accumulated ratings over time, not deltas", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Expand a player card with multiple games
      const playerCard = page.locator('[data-testid*="player-card"]').first();
      await playerCard.click();
      await page.waitForTimeout(500); // Wait for expansion animation

      // Check that mini chart is visible
      const miniChart = page.locator('[data-testid="mini-rating-chart"]');
      await expect(miniChart).toBeVisible();

      // Hover over chart dots to verify they show accumulated ratings
      const dots = await page.locator(".recharts-dot").all();
      expect(dots.length).toBeGreaterThanOrEqual(2);

      // Verify tooltip shows rating values, not deltas
      if (dots.length > 0) {
        await dots[0].hover();
        await page.waitForTimeout(200);
        const tooltip = page.locator(".recharts-tooltip-wrapper");
        const tooltipText = await tooltip.textContent();

        // Should show a rating value (like "42.1"), not a delta (like "+1.2")
        expect(tooltipText).toMatch(/\d+\.\d+/);
        expect(tooltipText).not.toMatch(/[+-]\d+\.\d+/);
      }
    });
  });

  test.describe("Player Profile Charts", () => {
    test("should render rating chart for players with sufficient games", async ({
      page,
    }) => {
      // Navigate to leaderboard first
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Find a player with many games and click on them
      const playerWithGames = page.locator("text=/\d{2,} games?/").first();
      const playerName = await playerWithGames
        .locator("..")
        .locator("h3")
        .textContent();
      await playerWithGames.locator("../..").click();
      await page.waitForTimeout(500);

      // Click "View Full Profile"
      await page.click('text="View Full Profile"');
      await page.waitForLoadState("networkidle");

      // Verify we're on the player profile page
      expect(page.url()).toContain("/player/");

      // Check that the rating chart is rendered
      const ratingChart = page.locator('[data-testid="rating-chart"]');
      await expect(ratingChart).toBeVisible();

      // Verify it's showing a chart, not "Need more games" message
      const needMoreGames = page.locator('text="Need more games for chart"');
      await expect(needMoreGames).not.toBeVisible();

      // Verify chart has actual data points
      const chartDots = await page.locator(".recharts-dot").count();
      expect(chartDots).toBeGreaterThanOrEqual(2);
    });

    test("should show 'Need more games' message for players with < 2 games", async ({
      page,
    }) => {
      // Navigate to leaderboard
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Find a player with 1 game if exists
      const playerWith1Game = page.locator("text=/1 game[^s]/").first();
      const hasPlayerWith1Game = await playerWith1Game.isVisible();

      if (hasPlayerWith1Game) {
        await playerWith1Game.locator("../..").click();
        await page.waitForTimeout(500);
        await page.click('text="View Full Profile"');
        await page.waitForLoadState("networkidle");

        // Should show "Need more games" message
        const needMoreGames = page.locator('text="Need more games for chart"');
        await expect(needMoreGames).toBeVisible();
      }
    });
  });

  test.describe("Game History Display", () => {
    test("should display only final table scores and rating changes", async ({
      page,
    }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Get the first game card
      const gameCard = page.locator('[data-testid="game-card"]').first();
      await expect(gameCard).toBeVisible();

      // Get all player results in the game
      const playerResults = gameCard.locator('[data-testid="player-result"]');
      const resultsCount = await playerResults.count();
      expect(resultsCount).toBe(4); // Should have 4 players

      // Check each player result
      for (let i = 0; i < resultsCount; i++) {
        const result = playerResults.nth(i);
        const resultText = await result.textContent();

        // Should contain final score with "pts" (e.g., "42,700 pts")
        expect(resultText).toMatch(/\d{1,3}(,\d{3})* pts/);

        // Should NOT contain score adjustments (e.g., "+15,000 pts")
        expect(resultText).not.toMatch(/→.*[+-]\d{1,3}(,\d{3})* pts/);

        // Should contain rating change (e.g., "↑0.8" or "↓1.2" or "—")
        expect(resultText).toMatch(/[↑↓—]\d*\.?\d*/);
      }
    });

    test("should not display uma/oka adjustments", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Get all game cards
      const gameCards = await page.locator('[data-testid="game-card"]').all();

      // Check at least the first 3 games
      for (let i = 0; i < Math.min(3, gameCards.length); i++) {
        const gameText = await gameCards[i].textContent();

        // Should NOT contain large score adjustments typical of uma/oka
        expect(gameText).not.toMatch(/[+-]1[0-9],000 pts/); // e.g., +15,000
        expect(gameText).not.toMatch(/[+-]2[0-9],000 pts/); // e.g., -28,000
        expect(gameText).not.toMatch(/[+-]3[0-9],000 pts/); // e.g., +35,000
      }
    });
  });

  test.describe("Data Validation and Error Handling", () => {
    test("should not display NaN values", async ({ page }) => {
      // Check leaderboard
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      let pageContent = await page.content();
      expect(pageContent).not.toContain("NaN");

      // Check game history
      await page.goto("/games");
      await page.waitForLoadState("networkidle");
      pageContent = await page.content();
      expect(pageContent).not.toContain("NaN");

      // Check a player profile
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const firstPlayer = page.locator('[data-testid*="player-card"]').first();
      await firstPlayer.click();
      await page.waitForTimeout(500);
      await page.click('text="View Full Profile"');
      await page.waitForLoadState("networkidle");
      pageContent = await page.content();
      expect(pageContent).not.toContain("NaN");
    });

    test("should display '--' for invalid or missing numeric values", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Expand a player card
      const playerCard = page.locator('[data-testid*="player-card"]').first();
      await playerCard.click();
      await page.waitForTimeout(500);

      // Check for proper fallback display
      const avgPlacement = page.locator('[data-testid="avg-placement-value"]');
      const avgText = await avgPlacement.textContent();

      // Should either be a valid number or "--"
      expect(avgText).toMatch(/^(\d+\.\d+|—|--|N\/A)$/);
    });
  });
});
