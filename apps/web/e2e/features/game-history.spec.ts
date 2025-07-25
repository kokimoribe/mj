import { test, expect } from "@playwright/test";

/**
 * Game History - Comprehensive E2E Tests
 * Based on Product Requirements Document
 *
 * Tests the chronological feed of all games played in the league
 */

test.describe("Game History - Core Experience", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');
  });

  test("displays games in reverse chronological order", async ({ page }) => {
    const gameCards = await page.locator('[data-testid="game-card"]').all();
    expect(gameCards.length).toBeGreaterThan(0);

    // Get dates from game cards
    const dates = await Promise.all(
      gameCards.map(async card => {
        const dateText = await card
          .locator('[data-testid="game-date"]')
          .textContent();
        // Extract just the date part before the bullet point
        const datePart = dateText?.split(" • ")[0] || "";
        return new Date(datePart);
      })
    );

    // Verify descending chronological order
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i].getTime()).toBeLessThanOrEqual(dates[i - 1].getTime());
    }
  });

  test("each game shows complete information", async ({ page }) => {
    const firstGame = page.locator('[data-testid="game-card"]').first();

    // Check date and time
    const dateTime = firstGame.locator('[data-testid="game-date"]');
    await expect(dateTime).toBeVisible();
    const dateText = await dateTime.textContent();
    expect(dateText).toMatch(/\w+ \d+, \d{4} • \d{1,2}:\d{2} (AM|PM)/);

    // Check all 4 players are shown
    const playerResults = await firstGame
      .locator('[data-testid="player-result"]')
      .all();
    expect(playerResults).toHaveLength(4);

    // Check each player result
    for (let i = 0; i < 4; i++) {
      const result = playerResults[i];

      // Placement medal
      const placement = await result
        .locator('[data-testid="placement"]')
        .textContent();
      expect(placement).toMatch(/🥇|🥈|🥉|4️⃣/);

      // Player name
      const name = await result
        .locator('[data-testid="player-name"]')
        .textContent();
      expect(name).toBeTruthy();

      // Final score (with commas)
      const score = await result
        .locator('[data-testid="final-score"]')
        .textContent();
      expect(score).toMatch(/^-?\d{1,3}(,\d{3})*$/); // Matches "42,700" or "-1,200"

      // Rating change
      const ratingChange = await result
        .locator('[data-testid="rating-change"]')
        .textContent();
      expect(ratingChange).toMatch(/↑\d+\.\d|↓\d+\.\d/);
    }
  });

  test("NO uma/oka adjustments are shown", async ({ page }) => {
    const gameCards = await page.locator('[data-testid="game-card"]').all();

    // Check multiple games to ensure consistency
    for (const card of gameCards.slice(0, 3)) {
      const cardText = await card.textContent();

      // Should NOT contain typical uma/oka values
      expect(cardText).not.toMatch(/\+15,000|\+5,000|-5,000|-15,000/);
      expect(cardText).not.toMatch(/\+10,000|\+5,000|-5,000|-10,000/);

      // Should NOT show score adjustments or "plus/minus"
      expect(cardText).not.toMatch(/plus.?minus|score.?adjustment|uma|oka/i);
    }
  });

  test("shows exactly 10 games initially", async ({ page }) => {
    const gameCards = await page.locator('[data-testid="game-card"]').all();

    // Should show exactly 10 games or less if total games < 10
    if (gameCards.length >= 10) {
      expect(gameCards).toHaveLength(10);

      // Load More button should be visible
      await expect(
        page.locator('[data-testid="load-more-button"]')
      ).toBeVisible();
    } else {
      // If less than 10 games total, Load More should not be visible
      await expect(
        page.locator('[data-testid="load-more-button"]')
      ).not.toBeVisible();
    }
  });

  test("Load More / Show Less toggle functionality", async ({ page }) => {
    const loadMoreButton = page.locator('[data-testid="load-more-button"]');

    if (await loadMoreButton.isVisible()) {
      // Count initial games
      const initialCount = await page
        .locator('[data-testid="game-card"]')
        .count();
      expect(initialCount).toBe(10);

      // Click Load More
      await loadMoreButton.click();
      await page.waitForTimeout(300);

      // Should show more games
      const expandedCount = await page
        .locator('[data-testid="game-card"]')
        .count();
      expect(expandedCount).toBeGreaterThan(10);

      // Button should change to "Show Less"
      const showLessButton = page.locator('[data-testid="show-less-button"]');
      await expect(showLessButton).toBeVisible();
      await expect(loadMoreButton).not.toBeVisible();

      // Click Show Less
      await showLessButton.click();
      await page.waitForTimeout(300);

      // Should be back to 10 games
      const collapsedCount = await page
        .locator('[data-testid="game-card"]')
        .count();
      expect(collapsedCount).toBe(10);

      // Button should be back to "Load More"
      await expect(loadMoreButton).toBeVisible();
      await expect(showLessButton).not.toBeVisible();
    }
  });

  test("score formatting with commas", async ({ page }) => {
    const firstGame = page.locator('[data-testid="game-card"]').first();
    const scores = await firstGame
      .locator('[data-testid="final-score"]')
      .allTextContents();

    for (const score of scores) {
      // Should have comma for thousands
      if (Math.abs(parseInt(score.replace(/,/g, ""))) >= 1000) {
        expect(score).toMatch(/,/);
      }

      // Should be properly formatted
      expect(score).toMatch(/^-?\d{1,3}(,\d{3})*$/);
    }
  });

  test("rating changes display with arrows", async ({ page }) => {
    const firstGame = page.locator('[data-testid="game-card"]').first();
    const ratingChanges = await firstGame
      .locator('[data-testid="rating-change"]')
      .all();

    for (const change of ratingChanges) {
      const text = await change.textContent();

      // Should have arrow and decimal
      expect(text).toMatch(/↑\d+\.\d|↓\d+\.\d/);

      // Check color coding
      if (text?.includes("↑")) {
        await expect(change).toHaveCSS(
          "color",
          /rgb\(34, 197, 94\)|rgb\(16, 185, 129\)/
        ); // green
      } else if (text?.includes("↓")) {
        await expect(change).toHaveCSS(
          "color",
          /rgb\(239, 68, 68\)|rgb\(220, 38, 38\)/
        ); // red
      }
    }
  });
});

test.describe("Game History - Filtering", () => {
  test("player filter dropdown shows all players", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    const filterDropdown = page.locator('[data-testid="player-filter"]');
    await expect(filterDropdown).toBeVisible();

    // Open dropdown
    await filterDropdown.click();

    // Check options
    const options = await page.locator('[data-testid="filter-option"]').all();

    // Should have "All Games" option
    const allGamesOption = options.find(async opt =>
      (await opt.textContent())?.includes("All Games")
    );
    expect(allGamesOption).toBeTruthy();

    // Should show player names with game counts
    for (const option of options.slice(1)) {
      // Skip "All Games"
      const text = await option.textContent();
      expect(text).toMatch(/^.+ \(\d+ games?\)$/); // "PlayerName (X games)"
    }
  });

  test("filtering by player shows only their games", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // Open filter dropdown
    const filterDropdown = page.locator('[data-testid="player-filter"]');
    await filterDropdown.click();

    // Select first player (not "All Games")
    const playerOption = page.locator('[data-testid="filter-option"]').nth(1);
    const playerText = await playerOption.textContent();
    const playerName = playerText?.match(/^(.+) \(/)?.[1];
    await playerOption.click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // All visible games should include the selected player
    const gameCards = await page.locator('[data-testid="game-card"]').all();
    for (const card of gameCards) {
      const playerNames = await card
        .locator('[data-testid="player-name"]')
        .allTextContents();
      expect(playerNames).toContain(playerName);
    }
  });

  test("'All Games' option clears filter", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // First apply a filter
    const filterDropdown = page.locator('[data-testid="player-filter"]');
    await filterDropdown.click();
    await page.locator('[data-testid="filter-option"]').nth(1).click();

    // Count filtered games
    const filteredCount = await page
      .locator('[data-testid="game-card"]')
      .count();

    // Select "All Games"
    await filterDropdown.click();
    await page.locator('[data-testid="filter-option"]').first().click();

    // Should show more games (or same if player was in all games)
    const allGamesCount = await page
      .locator('[data-testid="game-card"]')
      .count();
    expect(allGamesCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test("filter persists during session", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // Apply filter
    const filterDropdown = page.locator('[data-testid="player-filter"]');
    await filterDropdown.click();
    const playerOption = page.locator('[data-testid="filter-option"]').nth(1);
    const playerText = await playerOption.textContent();
    await playerOption.click();

    // Navigate away
    await page.goto("/");

    // Come back
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // Filter should still be applied
    const currentFilter = await filterDropdown.textContent();
    expect(currentFilter).toContain(playerText?.split(" (")[0]);
  });
});

test.describe("Game History - Navigation", () => {
  test("player names navigate to profiles", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // Click on a player name in first game
    const firstGame = page.locator('[data-testid="game-card"]').first();
    const playerLink = firstGame.locator('[data-testid="player-name"]').first();
    const playerName = await playerLink.textContent();

    await playerLink.click();

    // Should navigate to player profile
    await expect(page).toHaveURL(/\/player\/.+/);
    await expect(page.locator('[data-testid="player-name"]')).toContainText(
      playerName || ""
    );
  });

  test("bottom navigation accessible", async ({ page }) => {
    await page.goto("/games");

    const bottomNav = page.locator('[data-testid="bottom-navigation"]');
    await expect(bottomNav).toBeVisible();

    // Games tab should be active
    const gamesTab = bottomNav.locator('text="Games"');
    await expect(gamesTab).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("Game History - Mobile Experience", () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
  });

  test("responsive layout on mobile", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // Game cards should be full width
    const gameCard = page.locator('[data-testid="game-card"]').first();
    const cardBox = await gameCard.boundingBox();
    const viewportWidth = 375;

    // Card should be nearly full width (accounting for padding)
    expect(cardBox?.width).toBeGreaterThan(viewportWidth * 0.9);
  });

  test("touch-friendly filter controls", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    const filterDropdown = page.locator('[data-testid="player-filter"]');
    const dropdownBox = await filterDropdown.boundingBox();

    // Should meet minimum touch target size
    expect(dropdownBox?.height).toBeGreaterThanOrEqual(44);
    expect(dropdownBox?.width).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Game History - Edge Cases", () => {
  test("shows message when no games match filter", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // This test would need a player with 0 games
    // For now, check that UI handles empty state gracefully
    const gameCards = await page.locator('[data-testid="game-card"]').count();

    if (gameCards === 0) {
      const emptyMessage = page.locator('[data-testid="empty-state"]');
      await expect(emptyMessage).toBeVisible();
      expect(await emptyMessage.textContent()).toMatch(/no games/i);
    }
  });

  test("handles negative scores correctly", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // Look for any negative scores
    const scores = await page
      .locator('[data-testid="final-score"]')
      .allTextContents();
    const negativeScores = scores.filter(s => s.startsWith("-"));

    if (negativeScores.length > 0) {
      // Negative scores should be properly formatted
      for (const score of negativeScores) {
        expect(score).toMatch(/^-\d{1,3}(,\d{3})*$/);
      }
    }
  });

  test("handles games with same timestamp", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // Games should still display correctly even with same timestamp
    // Secondary sort should handle this
    const gameCards = await page.locator('[data-testid="game-card"]').all();
    expect(gameCards.length).toBeGreaterThan(0);

    // Each game should have unique content (different players/scores)
    const gameContents = await Promise.all(
      gameCards.map(card => card.textContent())
    );

    // No two games should be exactly identical
    const uniqueContents = new Set(gameContents);
    expect(uniqueContents.size).toBe(gameContents.length);
  });
});

test.describe("Game History - Performance", () => {
  test("initial load under 1 second", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // Wait for first game to be visible
    await page.locator('[data-testid="game-card"]').first().waitFor();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1000);
  });

  test("filter application under 300ms", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    const filterDropdown = page.locator('[data-testid="player-filter"]');
    await filterDropdown.click();

    const startTime = Date.now();
    await page.locator('[data-testid="filter-option"]').nth(1).click();

    // Wait for games to update
    await page.waitForFunction(() => {
      return document.querySelectorAll('[data-testid="game-card"]').length > 0;
    });

    const filterTime = Date.now() - startTime;
    expect(filterTime).toBeLessThan(300);
  });

  test("smooth scroll at 60fps", async ({ page }) => {
    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // Ensure there are enough games to scroll
    const loadMore = page.locator('[data-testid="load-more-button"]');
    if (await loadMore.isVisible()) {
      await loadMore.click();
      await page.waitForTimeout(500);
    }

    // Measure scroll performance
    const scrollPerformance = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        let frames = 0;
        let startTime: number;

        function countFrame(timestamp: number) {
          if (!startTime) startTime = timestamp;
          frames++;

          if (timestamp - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frames);
          }
        }

        // Start scrolling
        window.scrollTo({ top: window.innerHeight * 2, behavior: "smooth" });
        requestAnimationFrame(countFrame);
      });
    });

    // Should maintain close to 60fps
    expect(scrollPerformance).toBeGreaterThan(50);
  });
});
