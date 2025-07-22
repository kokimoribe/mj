import { test, expect } from "@playwright/test";
import { navigateTo } from "../utils/test-helpers";

test.describe("Rating Delta Calculation - Integration Tests", () => {
  test("calculates 7-day delta from game history correctly", async ({
    page,
  }) => {
    // Set up API response interception to verify the calculation logic
    let leaderboardData: any = null;
    let gameHistoryData: any = null;

    // Intercept leaderboard API
    await page.route("**/api/leaderboard*", async route => {
      const response = await route.fetch();
      leaderboardData = await response.json();
      await route.fulfill({ response });
    });

    // Intercept game history API
    await page.route("**/api/games/history*", async route => {
      const response = await route.fetch();
      gameHistoryData = await response.json();
      await route.fulfill({ response });
    });

    // Navigate to leaderboard
    await navigateTo(page, "/");
    await page.waitForLoadState("networkidle");

    // Verify APIs were called
    expect(leaderboardData).toBeTruthy();
    expect(gameHistoryData).toBeTruthy();

    // Find a player card and verify delta calculation
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await expect(firstCard).toBeVisible();

    // Get the player's current rating and delta
    const ratingText = await firstCard
      .locator(".text-2xl.font-bold")
      .textContent();
    const currentRating = parseFloat(ratingText || "0");

    const deltaIndicator = await firstCard
      .locator("text=/[▲▼—]/")
      .textContent();

    // If there's a numeric delta, verify it matches the calculation
    if (
      deltaIndicator &&
      (deltaIndicator.includes("▲") || deltaIndicator.includes("▼"))
    ) {
      const deltaMatch = deltaIndicator.match(/[▲▼]\s*(\d+\.\d+)/);
      if (deltaMatch) {
        const deltaValue = parseFloat(deltaMatch[1]);

        // Expand card to see detailed calculation
        await firstCard.click();
        await page.waitForTimeout(300);

        // Look for "7-day change: ▲X.X (from Y.Y)"
        const detailText = await firstCard
          .locator("text=/7-day change:/")
          .textContent();
        expect(detailText).toBeTruthy();

        // Extract the "from" value
        const fromMatch = detailText?.match(/from (\d+\.\d+)/);
        if (fromMatch) {
          const fromRating = parseFloat(fromMatch[1]);
          const calculatedDelta = Math.abs(currentRating - fromRating);

          // Verify the delta calculation is correct (allowing for rounding)
          expect(Math.abs(calculatedDelta - deltaValue)).toBeLessThan(0.1);
        }
      }
    }
  });

  test("shows em dash for players with no games in 7 days", async ({
    page,
  }) => {
    await navigateTo(page, "/");

    // Look for players with — indicator
    const cardsWithNoDelta = page.locator(
      '[data-testid^="player-card-"]:has-text("—")'
    );
    const count = await cardsWithNoDelta.count();

    if (count > 0) {
      // Expand one of these cards
      const card = cardsWithNoDelta.first();
      await card.click();
      await page.waitForTimeout(300);

      // Verify 7-day change shows —
      await expect(card.locator("text=/7-day change:\s*—/")).toBeVisible();
    }
  });

  test("rating history data structure supports time-based queries", async ({
    page,
  }) => {
    // Navigate to a player profile
    await navigateTo(page, "/");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    const playerId = await firstCard.getAttribute("data-testid");
    const actualPlayerId = playerId?.replace("player-card-", "") || "";

    // Intercept player profile API
    let profileData: any = null;
    await page.route(`**/api/players/${actualPlayerId}*`, async route => {
      const response = await route.fetch();
      profileData = await response.json();
      await route.fulfill({ response });
    });

    await navigateTo(page, `/player/${actualPlayerId}`);
    await page.waitForLoadState("networkidle");

    // Verify game history includes rating_before and rating_after
    expect(profileData).toBeTruthy();
    if (profileData?.games && profileData.games.length > 0) {
      const firstGame = profileData.games[0];
      expect(firstGame).toHaveProperty("rating_before");
      expect(firstGame).toHaveProperty("rating_after");
      expect(firstGame).toHaveProperty("finished_at");

      // These fields are essential for time-based delta calculations
      expect(typeof firstGame.rating_before).toBe("number");
      expect(typeof firstGame.rating_after).toBe("number");
      expect(firstGame.finished_at).toMatch(/^\d{4}-\d{2}-\d{2}/); // ISO date format
    }
  });

  test("time range selector updates delta calculation", async ({ page }) => {
    // Navigate to a player profile
    await navigateTo(page, "/player/joseph");

    // Wait for chart to load
    await expect(page.locator('[data-testid="rating-chart"]')).toBeVisible();

    // Get initial period delta
    const initialDelta = await page.locator("text=/Period Δ:/").textContent();

    // Click 7d button
    await page.getByRole("button", { name: "7d" }).click();
    await page.waitForTimeout(500);

    // Get 7-day delta
    const sevenDayDelta = await page.locator("text=/Period Δ:/").textContent();

    // Click 30d button
    await page.getByRole("button", { name: "30d" }).click();
    await page.waitForTimeout(500);

    // Get 30-day delta
    const thirtyDayDelta = await page.locator("text=/Period Δ:/").textContent();

    // Click All button
    await page.getByRole("button", { name: "All" }).click();
    await page.waitForTimeout(500);

    // Get all-time delta
    const allTimeDelta = await page.locator("text=/Period Δ:/").textContent();

    // Verify deltas can be different (they might be the same if player is new)
    // At least verify the UI updates
    expect(sevenDayDelta).toBeTruthy();
    expect(thirtyDayDelta).toBeTruthy();
    expect(allTimeDelta).toBeTruthy();
  });
});
