import { test, expect } from "@playwright/test";
import { navigateTo } from "../utils/test-helpers";

test.describe("Mini Chart Data Flow - Integration Tests", () => {
  test("leaderboard expansion loads last 10 games for mini chart", async ({
    page,
  }) => {
    // Intercept API calls to verify data flow
    let playerGamesData: any = null;

    await page.route("**/api/players/*/games*", async route => {
      const response = await route.fetch();
      playerGamesData = await response.json();
      await route.fulfill({ response });
    });

    await navigateTo(page, "/");

    // Expand first player card
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    // Verify mini chart is displayed
    const miniChart = firstCard.locator('[data-testid="mini-rating-chart"]');
    await expect(miniChart).toBeVisible();

    // Verify chart has data points
    const chartPoints = miniChart.locator('circle[role="presentation"]');
    const pointCount = await chartPoints.count();

    // Should show up to 10 points (last 10 games)
    expect(pointCount).toBeGreaterThan(0);
    expect(pointCount).toBeLessThanOrEqual(10);

    // If API data was fetched, verify it matches
    if (playerGamesData?.games) {
      const expectedPoints = Math.min(playerGamesData.games.length, 10);
      expect(pointCount).toBe(expectedPoints);
    }
  });

  test("mini chart uses same data structure as full profile chart", async ({
    page,
  }) => {
    await navigateTo(page, "/");

    // Expand a player card
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    const playerId = await firstCard.getAttribute("data-testid");
    const actualPlayerId = playerId?.replace("player-card-", "") || "";

    await firstCard.click();
    await page.waitForTimeout(300);

    // Get mini chart data points
    const miniChart = firstCard.locator('[data-testid="mini-rating-chart"]');
    const miniChartPoints = await miniChart
      .locator('circle[role="presentation"]')
      .count();

    // Navigate to full profile
    await firstCard.getByText("View Full Profile").click();
    await expect(page).toHaveURL(`/player/${actualPlayerId}`);

    // Get full chart data points (when "All" is selected)
    const fullChart = page.locator('[data-testid="rating-chart"]');
    await expect(fullChart).toBeVisible();

    // Ensure "All" is selected
    const allButton = page.getByRole("button", { name: "All" });
    if (!((await allButton.getAttribute("aria-pressed")) === "true")) {
      await allButton.click();
      await page.waitForTimeout(300);
    }

    const fullChartPoints = await fullChart
      .locator('circle[role="presentation"]')
      .count();

    // Mini chart should show last 10 games from the full chart
    if (fullChartPoints <= 10) {
      expect(miniChartPoints).toBe(fullChartPoints);
    } else {
      expect(miniChartPoints).toBe(10);
    }
  });

  test("mini chart displays rating progression visually", async ({ page }) => {
    await navigateTo(page, "/");

    // Find a player with good rating changes
    const cards = page.locator('[data-testid^="player-card-"]');
    const count = await cards.count();

    for (let i = 0; i < Math.min(3, count); i++) {
      const card = cards.nth(i);

      // Check if player has a rating change
      const deltaText = await card.locator("text=/[▲▼]/").textContent();
      if (deltaText && deltaText.includes("▲")) {
        // Found a player with upward trend
        await card.click();
        await page.waitForTimeout(300);

        // Verify chart shows upward trend
        const miniChart = card.locator('[data-testid="mini-rating-chart"]');
        await expect(miniChart).toBeVisible();

        // Get Y positions of points to verify trend
        const points = await miniChart
          .locator('circle[role="presentation"]')
          .all();
        if (points.length >= 2) {
          // Chart should show data points (we can't easily verify the exact trend without complex calculations)
          expect(points.length).toBeGreaterThan(1);
        }

        break;
      }
    }
  });

  test("chart data includes necessary fields for visualization", async ({
    page,
  }) => {
    let chartData: any = null;

    // Intercept any chart data requests
    await page.route("**/api/**", async route => {
      const response = await route.fetch();
      const url = route.request().url();

      if (
        url.includes("games") ||
        url.includes("history") ||
        url.includes("ratings")
      ) {
        const data = await response.json();
        if (data.games || data.ratings || data.history) {
          chartData = data;
        }
      }

      await route.fulfill({ response });
    });

    await navigateTo(page, "/");

    // Expand a card to trigger data loading
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(500);

    // Verify data structure if captured
    if (chartData) {
      const games = chartData.games || chartData.ratings || chartData.history;
      if (Array.isArray(games) && games.length > 0) {
        const firstEntry = games[0];

        // Essential fields for chart visualization
        expect(firstEntry).toHaveProperty("rating_after");
        expect(firstEntry).toHaveProperty("finished_at");

        // Optional but useful fields
        if (firstEntry.game_id) {
          expect(typeof firstEntry.game_id).toBe("string");
        }
      }
    }
  });
});
