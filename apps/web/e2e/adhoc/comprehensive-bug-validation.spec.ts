import { test, expect } from "@playwright/test";

test.describe("Comprehensive Bug Validation", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("http://localhost:3000");

    // Wait for the leaderboard to load
    await page.waitForSelector('[data-testid="leaderboard-view"]', {
      timeout: 10000,
    });
  });

  test("Issue 1: Season 3 leaderboard shows incorrect game count (should be ~100, not 404)", async ({
    page,
  }) => {
    // Check the season summary for game count
    const seasonSummary = page.locator('[data-testid="season-summary"]');
    await expect(seasonSummary).toBeVisible();

    // Look for the game count in the summary
    const gameCountText = await seasonSummary.textContent();
    console.log("Season summary text:", gameCountText);

    // Extract the number of games from the text
    const gameCountMatch = gameCountText?.match(/(\d+)\s*games/i);
    if (gameCountMatch) {
      const gameCount = parseInt(gameCountMatch[1]);
      console.log("Detected game count:", gameCount);

      // Should be around 100 games (like legacy_logs.csv), not 404
      expect(gameCount).toBeLessThan(150); // Allow some buffer, but 404 is clearly wrong
      expect(gameCount).toBeGreaterThan(50); // Should have substantial games
    } else {
      throw new Error("Could not find game count in season summary");
    }
  });

  test("Issue 2: Recent performance chart shows only dots, no line graph", async ({
    page,
  }) => {
    // Find the first player card and expand it
    const firstPlayerCard = page.locator('[data-testid="player-card"]').first();
    await firstPlayerCard.click();

    // Wait for the expanded card
    const expandedCard = page.locator('[data-testid="expanded-player-card"]');
    await expect(expandedCard).toBeVisible();

    // Look for the recent performance chart area
    const chartContainer = expandedCard.locator(
      '[data-testid="recent-performance-chart"], .recharts-wrapper, [class*="chart"]'
    );
    await expect(chartContainer).toBeVisible();

    // Check for line elements (should exist for line chart)
    const lineElements = chartContainer.locator(
      "path[stroke], .recharts-line, line"
    );
    const dotElements = chartContainer.locator("circle, .recharts-dot");

    const lineCount = await lineElements.count();
    const dotCount = await dotElements.count();

    console.log("Line elements found:", lineCount);
    console.log("Dot elements found:", dotCount);

    // For a line chart, we should have both lines and dots
    // If we only have dots, it's a scatter plot not a line chart
    if (dotCount > 0) {
      expect(lineCount).toBeGreaterThan(0); // Should have connecting lines
    }
  });

  test("Issue 3: Avg Placement not showing value in expanded leaderboard card", async ({
    page,
  }) => {
    // Find and expand a player card that should have games
    const playerCard = page.locator('[data-testid="player-card"]').first();
    await playerCard.click();

    const expandedCard = page.locator('[data-testid="expanded-player-card"]');
    await expect(expandedCard).toBeVisible();

    // Look for average placement section
    const avgPlacementElement = expandedCard.locator(
      '[data-testid="avg-placement"], :text("Avg Placement"), :text("Average Placement")'
    );
    await expect(avgPlacementElement).toBeVisible();

    // Check if there's a numeric value next to it
    const avgPlacementText = await avgPlacementElement.textContent();
    console.log("Avg Placement text:", avgPlacementText);

    // Should contain a decimal number like "2.1" or "1.8"
    const hasNumericValue = /\d+\.\d+/.test(avgPlacementText || "");
    expect(hasNumericValue).toBeTruthy();
  });

  test("Issue 4: Rating progression chart not rendering on player profile page", async ({
    page,
  }) => {
    // Navigate to a player profile
    const firstPlayerCard = page.locator('[data-testid="player-card"]').first();
    await firstPlayerCard.click();

    // Click "View Full Profile" link
    const viewProfileLink = page.locator('text="View Full Profile"');
    await viewProfileLink.click();

    // Wait for profile page to load
    await page.waitForSelector('[data-testid="player-profile"]', {
      timeout: 10000,
    });

    // Look for the rating chart container
    const ratingChart = page.locator(
      '[data-testid="rating-chart"], [data-testid="rating-progression-chart"], .recharts-wrapper'
    );

    // Check if chart is visible or if error message is shown
    const chartVisible = await ratingChart.isVisible();
    const errorMessage = page.locator(
      'text="need more games for chart", text="Need more games"'
    );
    const errorVisible = await errorMessage.isVisible();

    console.log("Rating chart visible:", chartVisible);
    console.log("Error message visible:", errorVisible);

    if (errorVisible) {
      // Check console for 400 Bad Request errors
      const logs: string[] = [];
      page.on("console", msg => {
        if (msg.type() === "error") {
          logs.push(msg.text());
        }
      });

      // Wait a bit to capture any console errors
      await page.waitForTimeout(2000);

      const has400Error = logs.some(
        log => log.includes("400") || log.includes("Bad Request")
      );
      if (has400Error) {
        console.log("Console errors found:", logs);
        throw new Error(
          '400 Bad Request error found in console while chart shows "need more games" message'
        );
      }
    } else {
      // Chart should be visible
      expect(chartVisible).toBeTruthy();
    }
  });

  test("Issue 5: No avg placement value in Player profile Performance stats", async ({
    page,
  }) => {
    // Navigate to player profile
    const firstPlayerCard = page.locator('[data-testid="player-card"]').first();
    await firstPlayerCard.click();

    const viewProfileLink = page.locator('text="View Full Profile"');
    await viewProfileLink.click();

    await page.waitForSelector('[data-testid="player-profile"]', {
      timeout: 10000,
    });

    // Look for Performance stats section
    const performanceStats = page.locator(
      '[data-testid="performance-stats"], text="Performance Stats"'
    );
    await expect(performanceStats).toBeVisible();

    // Look for average placement in this section
    const avgPlacementInStats = page.locator(
      '[data-testid="performance-stats"] [data-testid="avg-placement"], [data-testid="performance-stats"] :text("Average Placement")'
    );
    await expect(avgPlacementInStats).toBeVisible();

    const avgPlacementText = await avgPlacementInStats.textContent();
    console.log("Performance stats avg placement:", avgPlacementText);

    // Should show a numeric value
    const hasNumericValue = /\d+\.\d+/.test(avgPlacementText || "");
    expect(hasNumericValue).toBeTruthy();
  });

  test("Issue 6: Recent games section shows no games in Player profile", async ({
    page,
  }) => {
    // Navigate to player profile
    const firstPlayerCard = page.locator('[data-testid="player-card"]').first();
    await firstPlayerCard.click();

    const viewProfileLink = page.locator('text="View Full Profile"');
    await viewProfileLink.click();

    await page.waitForSelector('[data-testid="player-profile"]', {
      timeout: 10000,
    });

    // Look for Recent games section
    const recentGamesSection = page.locator(
      '[data-testid="recent-games"], text="Recent Games"'
    );
    await expect(recentGamesSection).toBeVisible();

    // Should have game entries
    const gameEntries = page.locator(
      '[data-testid="game-entry"], [data-testid="recent-games"] .game-entry'
    );
    const gameCount = await gameEntries.count();

    console.log("Recent games count:", gameCount);
    expect(gameCount).toBeGreaterThan(0);
  });

  test("Issue 7: Games tab navigation not visible on desktop", async ({
    page,
  }) => {
    // Look for the bottom navigation
    const bottomNav = page.locator(
      '[data-testid="bottom-nav"], [data-testid="bottom-navigation"]'
    );
    await expect(bottomNav).toBeVisible();

    // Look for Games tab
    const gamesTab = bottomNav.locator(
      'text="Games", [data-testid="games-tab"]'
    );
    await expect(gamesTab).toBeVisible();

    // Verify it's clickable/accessible
    const isEnabled = await gamesTab.isEnabled();
    expect(isEnabled).toBeTruthy();
  });

  test('Issue 8: Games tab shows "Failed to load game history"', async ({
    page,
  }) => {
    // Navigate to Games tab
    const gamesTab = page.locator(
      '[data-testid="bottom-nav"] text="Games", [data-testid="games-tab"]'
    );
    await gamesTab.click();

    // Wait for games page to load
    await page.waitForSelector(
      '[data-testid="game-history-view"], [data-testid="games-page"]',
      { timeout: 10000 }
    );

    // Check for error message
    const errorMessage = page.locator('text="Failed to load game history"');
    const errorVisible = await errorMessage.isVisible();

    if (errorVisible) {
      throw new Error('Games tab shows "Failed to load game history" error');
    }

    // Should show games instead
    const gameCards = page.locator('[data-testid="game-card"], .game-card');
    const gameCount = await gameCards.count();

    console.log("Games found in history:", gameCount);
    expect(gameCount).toBeGreaterThan(0);
  });

  test("Issue 9: PWA status notification does not dismiss", async ({
    page,
  }) => {
    // Look for PWA status notification
    const pwaNotification = page.locator(
      '[data-testid="pwa-status"], [data-testid="install-prompt"], text="PWA status", text="Install", text="Add to Home Screen"'
    );

    const notificationVisible = await pwaNotification.isVisible();

    if (notificationVisible) {
      console.log("PWA notification found");

      // Look for dismiss button or close button
      const dismissButton = pwaNotification.locator(
        'button:has-text("×"), button:has-text("Close"), button:has-text("Dismiss"), [data-testid="dismiss-button"]'
      );
      const dismissButtonExists = (await dismissButton.count()) > 0;

      if (!dismissButtonExists) {
        throw new Error(
          "PWA status notification is visible but has no dismiss button"
        );
      }

      // Try to dismiss it
      await dismissButton.click();

      // Verify it disappears
      await expect(pwaNotification).toBeHidden();
    } else {
      console.log("No PWA notification found");
    }
  });

  test("Additional: Check for console errors during normal usage", async ({
    page,
  }) => {
    const errors: string[] = [];

    page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Navigate through the app
    await page.click('[data-testid="player-card"]');
    await page.click('text="View Full Profile"');
    await page.click('text="Games"');

    // Wait for any async operations
    await page.waitForTimeout(3000);

    console.log("Console errors found:", errors);

    // Check for critical errors (400, 500, network failures)
    const criticalErrors = errors.filter(
      error =>
        error.includes("400") ||
        error.includes("500") ||
        error.includes("Failed to fetch") ||
        error.includes("Network Error")
    );

    if (criticalErrors.length > 0) {
      throw new Error(
        `Critical console errors found: ${criticalErrors.join(", ")}`
      );
    }
  });
});
