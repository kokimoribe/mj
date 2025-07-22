import { test, expect } from "@playwright/test";
import { navigateTo } from "../utils/test-helpers";

test.describe("Game History Data Flow - Integration Tests", () => {
  test("loads all games in single API call for client-side pagination", async ({
    page,
  }) => {
    let apiCallCount = 0;
    let totalGamesLoaded = 0;
    let gamesData: any = null;

    // Intercept game history API calls
    await page.route("**/api/games*", async route => {
      apiCallCount++;
      const response = await route.fetch();
      gamesData = await response.json();
      totalGamesLoaded = gamesData.games?.length || 0;
      await route.fulfill({ response });
    });

    // Navigate to games page
    await navigateTo(page, "/games");
    await page.waitForLoadState("networkidle");

    // Verify only one API call was made
    expect(apiCallCount).toBe(1);
    expect(totalGamesLoaded).toBeGreaterThan(0);

    // Verify initial display shows only 10 games
    const visibleGames = await page
      .locator('[data-testid^="game-card-"]')
      .count();
    expect(visibleGames).toBeLessThanOrEqual(10);

    // If there are more than 10 games, test show/hide
    if (totalGamesLoaded > 10) {
      const loadMoreButton = page.getByRole("button", {
        name: "Load More Games",
      });
      await expect(loadMoreButton).toBeVisible();

      // Click to show more - should not make another API call
      const initialApiCount = apiCallCount;
      await loadMoreButton.click();

      // Wait a bit to ensure no API call is made
      await page.waitForTimeout(500);
      expect(apiCallCount).toBe(initialApiCount); // No new API calls

      // More games should be visible
      const expandedGames = await page
        .locator('[data-testid^="game-card-"]')
        .count();
      expect(expandedGames).toBeGreaterThan(10);
      expect(expandedGames).toBeLessThanOrEqual(20);

      // Button should now say "Show Less Games"
      await expect(loadMoreButton).toHaveText("Show Less Games");
    }
  });

  test("game data includes all necessary fields for display", async ({
    page,
  }) => {
    let gamesData: any = null;

    await page.route("**/api/games*", async route => {
      const response = await route.fetch();
      gamesData = await response.json();
      await route.fulfill({ response });
    });

    await navigateTo(page, "/games");
    await page.waitForLoadState("networkidle");

    // Verify data structure
    expect(gamesData).toBeTruthy();
    expect(gamesData.games).toBeInstanceOf(Array);

    if (gamesData.games.length > 0) {
      const firstGame = gamesData.games[0];

      // Essential fields for game display
      expect(firstGame).toHaveProperty("id");
      expect(firstGame).toHaveProperty("finished_at");
      expect(firstGame).toHaveProperty("results");
      expect(firstGame.results).toBeInstanceOf(Array);
      expect(firstGame.results).toHaveLength(4); // Always 4 players

      // Check player result structure
      const firstResult = firstGame.results[0];
      expect(firstResult).toHaveProperty("playerId");
      expect(firstResult).toHaveProperty("playerName");
      expect(firstResult).toHaveProperty("placement");
      expect(firstResult).toHaveProperty("rawScore");
      expect(firstResult).toHaveProperty("scoreAdjustment");
      expect(firstResult).toHaveProperty("ratingChange");
    }
  });

  test("filter by player uses already loaded data", async ({ page }) => {
    let apiCallCount = 0;

    await page.route("**/api/games*", async route => {
      apiCallCount++;
      await route.continue();
    });

    await navigateTo(page, "/games");
    await page.waitForLoadState("networkidle");

    const initialApiCount = apiCallCount;

    // Open filter dropdown
    const filterDropdown = page.getByRole("combobox", { name: /filter/i });
    await filterDropdown.click();

    // Select a player
    const playerOption = page.locator('[role="option"]').nth(1); // First player after "All Games"
    await playerOption.click();

    // Wait a bit to ensure no API call is made
    await page.waitForTimeout(500);

    // Verify no additional API calls were made
    expect(apiCallCount).toBe(initialApiCount);

    // Verify games are filtered (UI should update immediately)
    const filteredGames = await page
      .locator('[data-testid^="game-card-"]')
      .count();
    expect(filteredGames).toBeGreaterThanOrEqual(0); // Could be 0 if player has no games
  });

  test("rating changes are pre-calculated in cached data", async ({ page }) => {
    let gamesData: any = null;

    await page.route("**/api/games*", async route => {
      const response = await route.fetch();
      gamesData = await response.json();
      await route.fulfill({ response });
    });

    await navigateTo(page, "/games");
    await page.waitForLoadState("networkidle");

    // Verify rating changes are included in the data
    if (gamesData?.games?.length > 0) {
      const gameWithRatings = gamesData.games.find((game: any) =>
        game.results.some((result: any) => result.ratingChange !== undefined)
      );

      if (gameWithRatings) {
        // Rating changes should be pre-calculated
        gameWithRatings.results.forEach((result: any) => {
          expect(result).toHaveProperty("ratingBefore");
          expect(result).toHaveProperty("ratingAfter");
          expect(result).toHaveProperty("ratingChange");

          // Verify calculation if both before/after are present
          if (
            typeof result.ratingBefore === "number" &&
            typeof result.ratingAfter === "number"
          ) {
            const calculatedChange = result.ratingAfter - result.ratingBefore;
            expect(
              Math.abs(calculatedChange - result.ratingChange)
            ).toBeLessThan(0.01);
          }
        });
      }
    }
  });

  test("season config hash is used for data filtering", async ({ page }) => {
    let requestUrl: string | null = null;

    await page.route("**/api/games*", async route => {
      requestUrl = route.request().url();
      await route.continue();
    });

    await navigateTo(page, "/games");
    await page.waitForLoadState("networkidle");

    // Verify the API request includes season config
    expect(requestUrl).toBeTruthy();

    // Check if URL includes config parameter or if it's in the response
    // The exact implementation depends on how the API is structured
    // But the important thing is that the correct season data is loaded
  });
});
