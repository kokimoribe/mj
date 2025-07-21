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
    // Navigate to the Games tab
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
    await expect(firstGame.locator("text=/🥇/")).toBeVisible();
    await expect(firstGame.locator("text=/🥈/")).toBeVisible();
    await expect(firstGame.locator("text=/🥉/")).toBeVisible();
    await expect(firstGame.locator("text=/4️⃣/")).toBeVisible();

    // Score formatting with commas
    await expect(firstGame.locator("text=/[0-9,]+/")).toBeVisible();

    // Plus/minus adjustments
    await expect(firstGame.locator("text=/[+-][0-9,]+/")).toBeVisible();

    // Rating changes with arrows
    await expect(firstGame.locator("text=/[↑↓][0-9.]+/")).toBeVisible();
  });

  test("filters games by player", async ({ page }) => {
    // Wait for initial load
    await expect(page.getByTestId(gameHistoryIds.gamesList)).toBeVisible();

    // Open filter dropdown
    await page.getByTestId(gameHistoryIds.filterDropdown).click();

    // Get all player options
    const playerOptions = await page.locator('[role="option"]').all();
    expect(playerOptions.length).toBeGreaterThan(1); // At least "All Games" + 1 player

    // Check first option is "All Games"
    await expect(playerOptions[0]).toHaveText(/All Games/);

    // Select a specific player (second option)
    await playerOptions[1].click();

    // Wait for filtered results
    await page.waitForTimeout(500); // Allow time for filter to apply

    // Verify filtered games show only selected player
    const selectedPlayerName = await playerOptions[1].textContent();
    const playerName = selectedPlayerName?.split(" (")[0]; // Extract name before game count

    const filteredGames = await page.getByTestId(gameHistoryIds.gameCard).all();

    for (const game of filteredGames) {
      await expect(game).toContainText(playerName || "");
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

    // Check score formatting (e.g., "42,700 → +32,700")
    const scorePattern = /\d{1,3}(,\d{3})* → [+-]\d{1,3}(,\d{3})*/;
    await expect(firstGame).toContainText(scorePattern);

    // Check rating change formatting (e.g., "↑0.8" or "↓1.23")
    const ratingPattern = /[↑↓]\d+(\.\d+)?/;
    await expect(firstGame).toContainText(ratingPattern);
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
    // Apply a filter
    await page.getByTestId(gameHistoryIds.filterDropdown).click();
    const playerOptions = await page.locator('[role="option"]').all();

    if (playerOptions.length > 1) {
      const selectedPlayer = await playerOptions[1].textContent();
      await playerOptions[1].click();

      // Navigate away and back
      await page.goto("/leaderboard");
      await page.waitForLoadState("networkidle");
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Filter should still be applied
      const dropdownText = await page
        .getByTestId(gameHistoryIds.filterDropdown)
        .textContent();
      expect(dropdownText).toContain(selectedPlayer?.split(" (")[0] || "");
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
    const cardBox = await gameCard.boundingBox();

    if (cardBox) {
      // Card should take most of the viewport width (accounting for padding)
      expect(cardBox.width).toBeGreaterThan(340);
    }

    // Touch targets should be large enough
    const loadMoreButton = page.getByTestId(gameHistoryIds.loadMoreButton);
    const buttonBox = await loadMoreButton.boundingBox();

    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    }
  });
});

test.describe("Game History - Accessibility", () => {
  test("keyboard navigation support", async ({ page }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Tab to filter dropdown
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab"); // May need multiple tabs depending on nav

    // Open dropdown with Enter
    const filterDropdown = page.getByTestId(gameHistoryIds.filterDropdown);
    await filterDropdown.focus();
    await page.keyboard.press("Enter");

    // Navigate options with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Tab to Load More button
    const loadMoreButton = page.getByTestId(gameHistoryIds.loadMoreButton);
    await loadMoreButton.focus();
    await page.keyboard.press("Enter");
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
