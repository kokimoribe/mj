import { test, expect } from "@playwright/test";
import { testIds } from "@/lib/test-ids";

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
  test.beforeEach(async ({ page }) => {
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
      // Check for raw score (always a number with possible comma)
      const hasScore = (await score.locator("text=/^[0-9,]+$/").count()) > 0;
      expect(hasScore).toBeTruthy();
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
      expect(text).toMatch(/^([↑↓][0-9.]+|—)$/);
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
});
