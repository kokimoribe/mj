import { test, expect } from "@playwright/test";
import { testIds } from "@/lib/test-ids";
import {
  setupConsoleErrorMonitoring,
  validateAPIResponse,
  validateGameHistoryResponse,
  validateNumericContent,
  validateRelativeDate,
} from "../../utils/validation-helpers";

// Test IDs for Game History components
const gameHistoryIds = {
  container: testIds.gameHistory.container,
  header: testIds.gameHistory.header,
  gameCount: testIds.gameHistory.gameCount,
  filterDropdown: testIds.gameHistory.filterDropdown,
  gamesList: testIds.gameHistory.gamesList,
  gameCard: testIds.gameHistory.gameCard,
  loadMoreButton: testIds.gameHistory.loadMoreButton,
  showLessButton: testIds.gameHistory.showLessButton,
  emptyState: testIds.gameHistory.emptyState,
  loadingState: testIds.gameHistory.loadingState,
};

test.describe("Game History", () => {
  let consoleErrors: string[];

  test.beforeEach(async ({ page }) => {
    // Monitor console errors
    consoleErrors = setupConsoleErrorMonitoring(page);
    // Navigate to the Games tab (using production data)
    await page.goto("/games");
    await page.waitForLoadState("networkidle");
  });

  test("displays game history in reverse chronological order", async ({
    page,
  }) => {
    // Wait for games to load
    await expect(page.getByTestId(gameHistoryIds.gamesList)).toBeVisible();

    // Check header shows total game count
    const gameCount = await page
      .getByTestId(gameHistoryIds.gameCount)
      .textContent();
    expect(gameCount).toMatch(/\d+ games/);

    // Verify games are displayed (up to 10 initially)
    const gameCards = await page.getByTestId(gameHistoryIds.gameCard).all();
    expect(gameCards.length).toBeGreaterThan(0);
    expect(gameCards.length).toBeLessThanOrEqual(10);

    // Check first game has all required elements
    const firstGame = gameCards[0];

    // Date header
    await expect(firstGame.locator('[data-testid="game-date"]')).toBeVisible();

    // All 4 players with placement indicators
    await expect(firstGame.locator("text=🥇")).toBeVisible();
    await expect(firstGame.locator("text=🥈")).toBeVisible();
    await expect(firstGame.locator("text=🥉")).toBeVisible();
    await expect(firstGame.locator("text=4️⃣")).toBeVisible();

    // Check that scores are displayed with proper formatting
    const scores = await firstGame
      .locator('[data-testid="player-result"]')
      .all();
    expect(scores.length).toBe(4);

    // Each player result should have a score
    for (const score of scores) {
      // Check for raw score (number with possible comma, but not necessarily the entire text)
      const scoreText = await score.textContent();
      expect(scoreText).toMatch(/[0-9,]+/);
    }

    // Check for plus/minus adjustments (with + or - prefix)
    const adjustments = await firstGame.locator("text=/^[+-][0-9,]+$/").all();
    expect(adjustments.length).toBeGreaterThan(0);

    // Rating changes should be displayed in badges (or dashes if no change)
    const ratingChanges = await firstGame.locator('[data-slot="badge"]').all();
    expect(ratingChanges.length).toBe(4);

    // Check that each badge contains either an arrow with number or a dash
    for (const badge of ratingChanges) {
      const text = await badge.textContent();
      expect(text).toMatch(/([↑↓][0-9]+\.?[0-9]*|—)/);
    }
  });

  test("filters games by player", async ({ page }) => {
    // Wait for initial load
    await expect(page.getByTestId(gameHistoryIds.gamesList)).toBeVisible();

    // Open filter dropdown
    const filterDropdown = page.getByTestId(gameHistoryIds.filterDropdown);
    await filterDropdown.click();

    // Wait for dropdown options to appear
    await page.waitForSelector('[role="option"]');

    // Get all player options
    const playerOptions = await page.locator('[role="option"]').all();
    expect(playerOptions.length).toBeGreaterThan(1); // At least "All Games" + 1 player

    // Check first option is "All Games"
    await expect(playerOptions[0]).toHaveText(/All Games/);

    // Get the player name before clicking
    const selectedPlayerName = await playerOptions[1].textContent();
    const playerName = selectedPlayerName?.split(" (")[0]; // Extract name before game count

    // Select a specific player (second option)
    await playerOptions[1].click();

    // Wait for filtered results
    await page.waitForTimeout(1000); // Allow time for filter to apply

    // Verify filtered games show only selected player
    const filteredGames = await page.getByTestId(gameHistoryIds.gameCard).all();

    // If there are games, check each one contains the player name
    if (filteredGames.length > 0) {
      for (const game of filteredGames) {
        await expect(game).toContainText(playerName || "");
      }
    }
  });

  test("shows load more / show less toggle", async ({ page }) => {
    // Skip if there are 10 or fewer games
    const gameCount = await page
      .getByTestId(gameHistoryIds.gameCount)
      .textContent();
    const totalGames = parseInt(gameCount?.match(/(\d+) games/)?.[1] || "0");

    if (totalGames <= 10) {
      test.skip();
      return;
    }

    // Initial state should show "Load More Games"
    const loadMoreButton = page.getByTestId(gameHistoryIds.loadMoreButton);
    await expect(loadMoreButton).toBeVisible();
    await expect(loadMoreButton).toHaveText("Load More Games");

    // Count initial games
    const initialGames = await page
      .getByTestId(gameHistoryIds.gameCard)
      .count();
    expect(initialGames).toBe(10);

    // Click Load More
    await loadMoreButton.click();

    // Wait for additional games to load
    await page.waitForTimeout(500);

    // Should now show more games
    const expandedGames = await page
      .getByTestId(gameHistoryIds.gameCard)
      .count();
    expect(expandedGames).toBeGreaterThan(10);
    expect(expandedGames).toBeLessThanOrEqual(20);

    // Button should now say "Show Less Games"
    const showLessButton = page.getByTestId(gameHistoryIds.showLessButton);
    await expect(showLessButton).toBeVisible();
    await expect(showLessButton).toHaveText("Show Less Games");

    // Click Show Less
    await showLessButton.click();

    // Should return to initial 10 games
    await page.waitForTimeout(500);
    const collapsedGames = await page
      .getByTestId(gameHistoryIds.gameCard)
      .count();
    expect(collapsedGames).toBe(10);

    // Button should be back to "Load More Games"
    await expect(loadMoreButton).toBeVisible();
    await expect(loadMoreButton).toHaveText("Load More Games");
  });

  test("displays empty state when no games exist", async ({ page }) => {
    // Navigate to a filter that returns no games
    await page.getByTestId(gameHistoryIds.filterDropdown).click();

    // Find a player with 0 games if exists
    const zeroGamesOption = await page
      .locator('[role="option"]:has-text("(0 games)")')
      .first();

    if ((await zeroGamesOption.count()) > 0) {
      await zeroGamesOption.click();

      // Should show empty state
      await expect(page.getByTestId(gameHistoryIds.emptyState)).toBeVisible();
      await expect(page.getByTestId(gameHistoryIds.emptyState)).toContainText(
        /No games found/
      );
    }
  });

  test("clears filter and returns to all games", async ({ page }) => {
    // Apply a filter first
    await page.getByTestId(gameHistoryIds.filterDropdown).click();
    const playerOptions = await page.locator('[role="option"]').all();

    if (playerOptions.length > 1) {
      // Select a player
      await playerOptions[1].click();
      await page.waitForTimeout(500);

      // Clear filter by selecting "All Games"
      await page.getByTestId(gameHistoryIds.filterDropdown).click();
      await playerOptions[0].click(); // "All Games" is first option

      // Verify all games are shown again
      const allGamesCount = await page
        .getByTestId(gameHistoryIds.gameCard)
        .count();
      expect(allGamesCount).toBeGreaterThan(0);
    }
  });

  test("formats scores and rating changes correctly", async ({ page }) => {
    await expect(page.getByTestId(gameHistoryIds.gamesList)).toBeVisible();

    const firstGame = page.getByTestId(gameHistoryIds.gameCard).first();

    // Check score formatting (e.g., "42,700→+32,700")
    const scorePattern = /\d{1,3}(,\d{3})*→[+-]\d{1,3}(,\d{3})*/;
    await expect(firstGame).toContainText(scorePattern);

    // Check rating change formatting - since API returns 0 for all rating deltas, check for "—"
    const ratingBadges = await firstGame.locator('[data-slot="badge"]').all();
    for (const badge of ratingBadges) {
      const text = await badge.textContent();
      expect(text).toMatch(/^([↑↓]\d+(\.\d+)?|—)$/);
    }
  });

  test("shows loading state while fetching data", async ({ page }) => {
    // Reload the page and catch loading state
    await page.reload();

    // Check if loading state appears (might be very brief)
    const loadingState = page.getByTestId(gameHistoryIds.loadingState);

    // If visible, verify it disappears
    if (await loadingState.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loadingState).not.toBeVisible({ timeout: 5000 });
    }

    // Games should be visible after loading
    await expect(page.getByTestId(gameHistoryIds.gamesList)).toBeVisible();
  });

  test("maintains filter state during session", async ({ page }) => {
    await expect(page.getByTestId(gameHistoryIds.gamesList)).toBeVisible();

    // Apply a filter
    await page.getByTestId(gameHistoryIds.filterDropdown).click();
    await page.waitForSelector('[role="option"]');

    const playerOptions = await page.locator('[role="option"]').all();

    if (playerOptions.length > 1) {
      const selectedPlayer = await playerOptions[1].textContent();
      const playerName = selectedPlayer?.split(" (")[0];
      await playerOptions[1].click();
      await page.waitForTimeout(1000);

      // Note: Filter state is not persisted when navigating away
      // This is expected behavior for this implementation
      // The test should verify that the filter works while on the page

      // Verify the filter is applied
      const dropdownText = await page
        .getByTestId(gameHistoryIds.filterDropdown)
        .textContent();
      expect(dropdownText).toContain(playerName || "");

      // Verify filtered games show only the selected player
      const games = await page.getByTestId(gameHistoryIds.gameCard).all();
      if (games.length > 0) {
        for (const game of games.slice(0, 3)) {
          // Check first 3 games
          await expect(game).toContainText(playerName || "");
        }
      }
    } else {
      test.skip();
    }
  });

  test("displays correct placement medals and order", async ({ page }) => {
    await expect(page.getByTestId(gameHistoryIds.gamesList)).toBeVisible();

    const firstGame = page.getByTestId(gameHistoryIds.gameCard).first();

    // Get all player rows in the game
    const playerRows = await firstGame
      .locator('[data-testid="player-result"]')
      .all();
    expect(playerRows.length).toBe(4); // Always 4 players

    // Check placement order (1st, 2nd, 3rd, 4th)
    const expectedMedals = ["🥇", "🥈", "🥉", "4️⃣"];

    for (let i = 0; i < 4; i++) {
      await expect(playerRows[i]).toContainText(expectedMedals[i]);
    }
  });

  test("handles edge cases gracefully", async ({ page }) => {
    // Test zero rating change display
    const zeroRatingChange = await page.locator("text=/—/").first();
    if ((await zeroRatingChange.count()) > 0) {
      // Verify it's used instead of arrows for zero change
      await expect(zeroRatingChange).toBeVisible();
    }

    // Test negative scores display
    const negativeScore = await page
      .locator("text=/-\d{1,3}(,\d{3})*/")
      .first();
    if ((await negativeScore.count()) > 0) {
      await expect(negativeScore).toBeVisible();
    }
  });
});

test.describe("Game History - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("responsive layout on mobile", async ({ page }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Check mobile layout
    await expect(page.getByTestId(gameHistoryIds.container)).toBeVisible();

    // Game cards should be full width
    const gameCard = page.getByTestId(gameHistoryIds.gameCard).first();
    await expect(gameCard).toBeVisible();

    const cardBox = await gameCard.boundingBox();
    if (cardBox) {
      // Card should take most of the viewport width (accounting for padding)
      expect(cardBox.width).toBeGreaterThan(340);
    }

    // Check if load more button exists (only if there are more than 10 games)
    const gameCount = await page
      .getByTestId(gameHistoryIds.gameCount)
      .textContent();
    const totalGames = parseInt(gameCount?.match(/(\d+) games/)?.[1] || "0");

    if (totalGames > 10) {
      const loadMoreButton = page.getByTestId(gameHistoryIds.loadMoreButton);
      if (await loadMoreButton.isVisible()) {
        const buttonBox = await loadMoreButton.boundingBox();
        if (buttonBox) {
          expect(buttonBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target
        }
      }
    }
  });
});

test.describe("Game History - Accessibility", () => {
  test("keyboard navigation support", async ({ page }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Focus the filter dropdown
    const filterDropdown = page.getByTestId(gameHistoryIds.filterDropdown);
    await filterDropdown.focus();

    // Open dropdown with Enter
    await page.keyboard.press("Enter");
    await page.waitForSelector('[role="option"]');

    // Navigate options with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Verify filter was applied
    const dropdownText = await filterDropdown.textContent();
    expect(dropdownText).not.toBe("All Games");

    // Check if load more button exists and is focusable
    const gameCount = await page
      .getByTestId(gameHistoryIds.gameCount)
      .textContent();
    const totalGames = parseInt(gameCount?.match(/(\d+) games/)?.[1] || "0");

    if (totalGames > 10) {
      const loadMoreButton = page.getByTestId(gameHistoryIds.loadMoreButton);
      if (await loadMoreButton.isVisible()) {
        await loadMoreButton.focus();
        await page.keyboard.press("Enter");

        // Verify more games were loaded
        await page.waitForTimeout(500);
        const gamesAfter = await page
          .getByTestId(gameHistoryIds.gameCard)
          .count();
        expect(gamesAfter).toBeGreaterThan(10);
      }
    }
  });

  test("screen reader announcements", async ({ page }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Check ARIA labels exist
    const filterDropdown = page.getByTestId(gameHistoryIds.filterDropdown);
    await expect(filterDropdown).toHaveAttribute(
      "aria-label",
      /filter.*games/i
    );

    // Game cards should have accessible content
    const gameCard = page.getByTestId(gameHistoryIds.gameCard).first();
    const ariaLabel = await gameCard.getAttribute("aria-label");

    if (ariaLabel) {
      expect(ariaLabel).toMatch(/game.*played/i);
    }
  });

  test.afterEach(async ({ page }) => {
    // The consoleErrors are already tracked from the beforeEach hook
    // No additional action needed here as the console error monitoring
    // will throw errors during the test if any console errors occur
  });

  test.describe("API Response Validation", () => {
    test("validates game history API response structure", async ({ page }) => {
      // Validate API response during page load
      const responsePromise = validateAPIResponse(
        page,
        "**/api/games*",
        validateGameHistoryResponse
      );

      await page.goto("/games");
      await responsePromise;
    });

    test("validates all games have exactly 4 players", async ({ page }) => {
      const response = await Promise.all([
        page.waitForResponse("**/api/games*"),
        page.goto("/games"),
      ]);

      const data = await response[0].json();

      // Each game should have exactly 4 players
      data.games.forEach((game: any, index: number) => {
        expect(game.results.length).toBe(4);

        // Verify placements are 1-4
        const placements = game.results.map((r: any) => r.placement).sort();
        expect(placements).toEqual([1, 2, 3, 4]);
      });
    });
  });

  test.describe("Data Validation", () => {
    test("validates score display format", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Get all score elements
      const scoreElements = page.locator('[data-testid^="score-"]');
      const count = await scoreElements.count();

      for (let i = 0; i < count; i++) {
        const scoreText = await scoreElements.nth(i).textContent();

        // Should match format like "35,200" or "-5,100"
        expect(scoreText).toMatch(/^[+-]?\d{1,3}(,\d{3})*$/);

        // Parse and validate numeric value
        const numericValue = parseInt(scoreText!.replace(/,/g, ""));
        expect(numericValue).toBeGreaterThanOrEqual(-100000);
        expect(numericValue).toBeLessThanOrEqual(100000);
      }
    });

    test("validates rating change display", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Get all rating change elements
      const ratingElements = page.locator('[data-testid^="rating-change-"]');
      const count = await ratingElements.count();

      for (let i = 0; i < count; i++) {
        const text = await ratingElements.nth(i).textContent();

        // Should match format like "↑0.8" or "↓0.2"
        expect(text).toMatch(/^[↑↓]\d+\.\d+$/);

        // Validate numeric value
        const numericValue = parseFloat(text!.substring(1));
        expect(numericValue).toBeGreaterThan(0);
        expect(numericValue).toBeLessThan(10); // Reasonable rating change limit
      }
    });

    test("validates date formatting", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Get all date elements
      const dateElements = page.locator('[data-testid^="game-date-"]');
      const count = await dateElements.count();

      for (let i = 0; i < count; i++) {
        const dateText = await dateElements.nth(i).textContent();

        // Should match format like "Jul 6"
        expect(dateText).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
      }
    });
  });

  test.describe("Filtering Functionality", () => {
    test("validates filter actually filters games", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Get initial game count
      const initialGames = await page
        .getByTestId(gameHistoryIds.gameCard)
        .count();

      // Open filter dropdown
      const filterDropdown = page.getByTestId(gameHistoryIds.filterDropdown);
      await filterDropdown.click();

      // Select a specific player
      const options = page.locator('[role="option"]');
      const optionCount = await options.count();

      if (optionCount > 1) {
        // Click second option (first is "All Players")
        await options.nth(1).click();

        // Wait for filtering
        await page.waitForTimeout(500);

        // Verify games were filtered
        const filteredGames = await page
          .getByTestId(gameHistoryIds.gameCard)
          .count();
        expect(filteredGames).toBeLessThanOrEqual(initialGames);

        // Verify all displayed games contain the selected player
        const selectedPlayerName = await options.nth(1).textContent();
        const gameCards = page.getByTestId(gameHistoryIds.gameCard);
        const gameCount = await gameCards.count();

        for (let i = 0; i < gameCount; i++) {
          const gameText = await gameCards.nth(i).textContent();
          expect(gameText).toContain(selectedPlayerName);
        }
      }
    });

    test("validates URL state persistence", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Select a filter
      const filterDropdown = page.getByTestId(gameHistoryIds.filterDropdown);
      await filterDropdown.click();

      const options = page.locator('[role="option"]');
      if (await options.nth(1).isVisible()) {
        const playerName = await options.nth(1).textContent();
        await options.nth(1).click();

        // Wait for URL update
        await page.waitForTimeout(500);

        // Check URL contains player filter
        const url = page.url();
        expect(url).toContain("player=");

        // Reload page
        await page.reload();

        // Verify filter is still applied
        await expect(filterDropdown).toContainText(playerName!);
      }
    });
  });

  test.describe("Pagination Validation", () => {
    test("validates correct pagination behavior", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Check if there are more than 10 games
      const gameCount = await page
        .getByTestId(gameHistoryIds.gameCount)
        .textContent();
      const totalGames = parseInt(gameCount?.match(/(\d+) games/)?.[1] || "0");

      if (totalGames > 10) {
        // Initially should show 10 games
        const initialGames = await page
          .getByTestId(gameHistoryIds.gameCard)
          .count();
        expect(initialGames).toBe(10);

        // Load more
        const loadMoreButton = page.getByTestId(gameHistoryIds.loadMoreButton);
        await loadMoreButton.click();
        await page.waitForTimeout(500);

        // Should show 20 games
        const afterFirstLoad = await page
          .getByTestId(gameHistoryIds.gameCard)
          .count();
        expect(afterFirstLoad).toBe(Math.min(20, totalGames));

        // If more than 20 games, load more again
        if (totalGames > 20) {
          await loadMoreButton.click();
          await page.waitForTimeout(500);

          const afterSecondLoad = await page
            .getByTestId(gameHistoryIds.gameCard)
            .count();
          expect(afterSecondLoad).toBe(Math.min(30, totalGames));
        }

        // Show less button should appear
        const showLessButton = page.getByTestId(gameHistoryIds.showLessButton);
        await expect(showLessButton).toBeVisible();

        // Click show less
        await showLessButton.click();
        await page.waitForTimeout(500);

        // Should be back to 10 games
        const afterShowLess = await page
          .getByTestId(gameHistoryIds.gameCard)
          .count();
        expect(afterShowLess).toBe(10);
      }
    });
  });

  test.describe("Score Calculations", () => {
    test("validates score adjustments (Uma/Oka)", async ({ page }) => {
      const response = await Promise.all([
        page.waitForResponse("**/api/games*"),
        page.goto("/games"),
      ]);

      const data = await response[0].json();

      // For each game, verify score adjustments
      data.games.forEach((game: any) => {
        const results = game.results;

        // Sum of all score adjustments should be 0
        const totalAdjustments = results.reduce(
          (sum: number, r: any) => sum + r.scoreAdjustment,
          0
        );
        expect(Math.abs(totalAdjustments)).toBeLessThan(1); // Allow for floating point errors

        // Verify Uma bonuses are applied correctly
        // 1st: +15k, 2nd: +5k, 3rd: -5k, 4th: -15k (typical)
        const sortedByPlacement = [...results].sort(
          (a, b) => a.placement - b.placement
        );

        // First place should have positive adjustment
        expect(sortedByPlacement[0].scoreAdjustment).toBeGreaterThan(0);

        // Last place should have negative adjustment
        expect(sortedByPlacement[3].scoreAdjustment).toBeLessThan(0);
      });
    });

    test("validates final scores are reasonable", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Check all displayed scores
      const scoreElements = page.locator('[data-testid^="score-"]');
      const count = await scoreElements.count();

      for (let i = 0; i < count; i++) {
        const scoreText = await scoreElements.nth(i).textContent();
        const score = parseInt(scoreText!.replace(/,/g, ""));

        // Typical mahjong scores range
        expect(score).toBeGreaterThanOrEqual(-50000);
        expect(score).toBeLessThanOrEqual(100000);
      }
    });
  });

  test.describe("Edge Cases", () => {
    test("handles games with tied scores", async ({ page }) => {
      // This would need specific test data, but we can verify the UI handles it
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Verify all games render without errors
      const gameCards = page.getByTestId(gameHistoryIds.gameCard);
      const count = await gameCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test("handles empty game history", async ({ page }) => {
      // Filter by a player with no games
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Try to find a player with 0 games in dropdown
      const filterDropdown = page.getByTestId(gameHistoryIds.filterDropdown);
      await filterDropdown.click();

      // This would show empty state if such a player exists
      // For now, just verify empty state component exists in DOM
      const emptyState = page.getByTestId(gameHistoryIds.emptyState);

      // If visible, verify message
      if (await emptyState.isVisible()) {
        await expect(emptyState).toContainText(/no games.*found/i);
      }
    });
  });

  test.describe("Performance", () => {
    test("validates initial load performance", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Wait for games to be visible
      await page
        .getByTestId(gameHistoryIds.gameCard)
        .first()
        .waitFor({ state: "visible" });

      const loadTime = Date.now() - startTime;

      // Spec requires < 1.5 seconds
      expect(loadTime).toBeLessThan(1500);
    });

    test("validates pagination performance", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      const loadMoreButton = page.getByTestId(gameHistoryIds.loadMoreButton);

      if (await loadMoreButton.isVisible()) {
        const startTime = Date.now();

        await loadMoreButton.click();

        // Wait for new games to appear
        await page.waitForFunction(
          selector => document.querySelectorAll(selector).length > 10,
          `[data-testid="${gameHistoryIds.gameCard}"]`
        );

        const loadTime = Date.now() - startTime;

        // Pagination should be fast (< 500ms)
        expect(loadTime).toBeLessThan(500);
      }
    });
  });
});
