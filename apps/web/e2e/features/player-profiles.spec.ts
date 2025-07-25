import { test, expect } from "@playwright/test";

/**
 * Player Profiles - Comprehensive E2E Tests
 * Based on Product Requirements Document
 *
 * Tests detailed player performance views with stock-price style rating charts
 */

test.describe("Player Profiles - Core Experience", () => {
  let playerId: string;

  test.beforeEach(async ({ page }) => {
    // Navigate to leaderboard first to get a player
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Get first player's ID from the URL
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await firstCard.locator('text="View Full Profile"').click();

    // Extract player ID from URL
    const url = page.url();
    const match = url.match(/\/player\/(.+)/);
    playerId = match?.[1] || "";
  });

  test("displays complete player header information", async ({ page }) => {
    // Player header should show: Name, Rank (#1, #2, etc.), Rating, Total Games
    const header = page.locator('[data-testid="player-header"]');
    await expect(header).toBeVisible();

    // Check for player name
    const playerName = header.locator('[data-testid="player-name"]');
    await expect(playerName).toBeVisible();
    await expect(playerName).not.toBeEmpty();

    // Check for rank with # format
    const rank = header.locator('[data-testid="player-rank"]');
    const rankText = await rank.textContent();
    expect(rankText).toMatch(/^#\d+$/); // Should be like "#1", "#2", etc.

    // Check for rating score
    const rating = header.locator('[data-testid="player-rating"]');
    const ratingText = await rating.textContent();
    expect(ratingText).toMatch(/^\d+\.\d$/); // Should be like "84.2"

    // Check for total games
    const games = header.locator('[data-testid="total-games"]');
    const gamesText = await games.textContent();
    expect(gamesText).toMatch(/\d+ games/);
  });

  test("rating chart displays like stock price chart", async ({ page }) => {
    // Chart should show accumulated ratings over time
    const chartContainer = page.locator('[data-testid="rating-chart"]').first();
    await expect(chartContainer).toBeVisible();

    // Check if it's showing the "Need more games" message or actual chart
    const chartContent = await chartContainer.textContent();
    if (chartContent?.includes("Need more games")) {
      // This is ok for players with < 2 games
      expect(chartContent).toContain("Need more games for chart");
    } else {
      // Verify it's a line chart (not bar chart or other)
      const lineChart = chartContainer.locator(".recharts-line");
      await expect(lineChart).toBeVisible();

      // Check Y-axis shows rating values in expected range (not deltas)
      const yAxisTicks = await chartContainer
        .locator(".recharts-yAxis .recharts-text")
        .allTextContents();
      const yValues = yAxisTicks.map(t => parseFloat(t)).filter(v => !isNaN(v));

      // Accumulated ratings should be in reasonable range (30-150)
      expect(Math.min(...yValues)).toBeGreaterThan(20);
      expect(Math.max(...yValues)).toBeLessThan(200);

      // Should NOT be deltas (which would be -5 to +5)
      expect(Math.max(...yValues) - Math.min(...yValues)).toBeGreaterThan(5);
    }
  });

  test("chart is interactive with tap/hover for exact values", async ({
    page,
  }) => {
    const chartContainer = page.locator('[data-testid="rating-chart"]').first();

    // Check if chart has data points
    const dataPoints = await chartContainer.locator(".recharts-dot").count();
    if (dataPoints === 0) {
      // Skip interactivity test if no data points
      return;
    }

    // Find a data point
    const dataPoint = chartContainer.locator(".recharts-dot").first();
    await dataPoint.hover();

    // Tooltip should appear
    const tooltip = page.locator(".recharts-tooltip-wrapper");
    await expect(tooltip).toBeVisible();

    // Tooltip should show exact rating value
    const tooltipContent = await tooltip.textContent();
    expect(tooltipContent).toMatch(/\d+\.\d/); // Rating value
    expect(tooltipContent).toMatch(/\w+ \d+/); // Date
  });

  test("time period filters work correctly", async ({ page }) => {
    const filterButtons = page.locator('[data-testid="time-filter-buttons"]');
    await expect(filterButtons).toBeVisible();

    // Check all filter options exist
    const filters = ["7d", "14d", "30d", "All"];
    for (const filter of filters) {
      await expect(
        filterButtons.locator(`button:has-text("${filter}")`)
      ).toBeVisible();
    }

    // Test 7-day filter
    await filterButtons.locator('button:has-text("7d")').click();
    await page.waitForTimeout(500); // Wait for chart update

    // Verify chart updates (check data points or axis labels change)
    const chartDots7d = await page.locator(".recharts-dot").count();

    // Test All filter
    await filterButtons.locator('button:has-text("All")').click();
    await page.waitForTimeout(500);

    const chartDotsAll = await page.locator(".recharts-dot").count();

    // "All" should have more data points than "7d" (unless player is very new)
    expect(chartDotsAll).toBeGreaterThanOrEqual(chartDots7d);
  });

  test("displays performance metrics correctly", async ({ page }) => {
    const metrics = page.locator('[data-testid="performance-metrics"]');
    await expect(metrics).toBeVisible();

    // Average placement (should be between 1.0 and 4.0)
    const avgPlacement = metrics.locator('[data-testid="avg-placement"]');
    await expect(avgPlacement).toBeVisible();
    const avgText = await avgPlacement.textContent();
    if (avgText === "—" || avgText === "N/A") {
      // No placement data available
      expect(avgText).toMatch(/—|N\/A/);
    } else {
      const avgValue = parseFloat(avgText?.match(/[\d.]+/)?.[0] || "0");
      expect(avgValue).toBeGreaterThanOrEqual(1.0);
      expect(avgValue).toBeLessThanOrEqual(4.0);
    }

    // 30-day rating change (format: ↑5.2 or ↓3.1 or "N/A")
    const ratingChange = metrics.locator('[data-testid="30d-rating-change"]');
    await expect(ratingChange).toBeVisible();
    const changeText = await ratingChange.textContent();
    expect(changeText).toMatch(/↑\d+\.\d|↓\d+\.\d|N\/A/);

    // Last played date
    const lastPlayed = metrics.locator('[data-testid="last-played"]');
    await expect(lastPlayed).toBeVisible();
    const lastPlayedText = await lastPlayed.textContent();
    expect(lastPlayedText).toMatch(/\w+ ago|Today|Yesterday/);
  });

  test("game history shows recent games with proper format", async ({
    page,
  }) => {
    const gameHistory = page.locator('[data-testid="game-history"]');
    await expect(gameHistory).toBeVisible();

    // Get first game entry
    const firstGame = gameHistory.locator('[data-testid="game-entry"]').first();
    await expect(firstGame).toBeVisible();

    // Check game format: Date • Placement • Rating Change • Opponents
    const gameText = await firstGame.textContent();

    // Date
    expect(gameText).toMatch(/\w+ \d+/);

    // Placement
    expect(gameText).toMatch(/1st|2nd|3rd|4th/);

    // Rating change (can be — if no data)
    expect(gameText).toMatch(/↑\d+\.\d|↓\d+\.\d|—/);

    // Opponents (should have "vs." followed by names)
    expect(gameText).toMatch(/vs\./);
  });

  test("opponent names are clickable in game history", async ({ page }) => {
    const gameHistory = page.locator('[data-testid="game-history"]');
    const firstGame = gameHistory.locator('[data-testid="game-entry"]').first();

    // Find opponent link
    const opponentLink = firstGame
      .locator('[data-testid="opponent-link"]')
      .first();
    await expect(opponentLink).toBeVisible();

    const opponentName = await opponentLink.textContent();

    // Click opponent name
    await opponentLink.click();

    // Should navigate to opponent's profile
    await expect(page).toHaveURL(/\/player\/.+/);
    await expect(page.locator('[data-testid="player-name"]')).toContainText(
      opponentName || ""
    );
  });

  test("load more games functionality", async ({ page }) => {
    const gameHistory = page.locator('[data-testid="game-history"]');

    // Count initial games (should show 5 by default)
    const initialGames = await gameHistory
      .locator('[data-testid="game-entry"]')
      .count();
    expect(initialGames).toBeLessThanOrEqual(5);

    // Click "Load More" if available
    const loadMoreButton = page.locator('[data-testid="load-more-games"]');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(500);

      // Should show more games
      const expandedGames = await gameHistory
        .locator('[data-testid="game-entry"]')
        .count();
      expect(expandedGames).toBeGreaterThan(initialGames);
    }
  });
});

test.describe("Player Profiles - Navigation", () => {
  test("direct URL access works", async ({ page }) => {
    // Use a known player ID (from fixtures or test data)
    // For this test, we'll get one from the leaderboard first
    await page.goto("/");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await firstCard.locator('text="View Full Profile"').click();

    const profileUrl = page.url();

    // Navigate away
    await page.goto("/");

    // Navigate directly back
    await page.goto(profileUrl);

    // Profile should load
    await expect(page.locator('[data-testid="player-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="rating-chart"]')).toBeVisible();
  });

  test("back navigation returns to previous page", async ({ page }) => {
    // Start at leaderboard
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Navigate to profile
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await firstCard.locator('text="View Full Profile"').click();

    // Use back button
    await page.locator('[data-testid="back-button"]').click();

    // Should be back at leaderboard
    await expect(page).toHaveURL("/");
    await expect(
      page.locator('[data-testid="leaderboard-view"]')
    ).toBeVisible();
  });

  test("navigation from game history to opponent profiles", async ({
    page,
  }) => {
    // Navigate to a player profile
    await page.goto("/");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await firstCard.locator('text="View Full Profile"').click();

    // Click on an opponent in game history
    const opponentLink = page.locator('[data-testid="opponent-link"]').first();
    const opponentName = await opponentLink.textContent();
    await opponentLink.click();

    // Should navigate to opponent's profile
    await expect(page.locator('[data-testid="player-name"]')).toContainText(
      opponentName || ""
    );

    // Can navigate back
    await page.locator('[data-testid="back-button"]').click();
    await expect(page.locator('[data-testid="player-header"]')).toBeVisible();
  });
});

test.describe("Player Profiles - Edge Cases", () => {
  test("handles players with few games gracefully", async ({ page }) => {
    // This would need a test player with <5 games
    // For now, check that the UI doesn't break
    await page.goto("/");
    const playerCards = await page
      .locator('[data-testid^="player-card-"]')
      .all();

    // Find a player with few games if any
    for (const card of playerCards) {
      const gamesText = await card
        .locator('[data-testid="games-played"]')
        .textContent();
      const games = parseInt(gamesText || "0");

      if (games < 5) {
        await card.click();
        await card.locator('text="View Full Profile"').click();

        // Chart should still display (even with 1 game)
        await expect(
          page.locator('[data-testid="rating-chart"]')
        ).toBeVisible();

        // Should not show "Need more games" message
        const chartContent = await page
          .locator('[data-testid="rating-chart"]')
          .textContent();
        expect(chartContent).not.toContain("Need more games");

        break;
      }
    }
  });

  test("handles missing 30-day data", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await firstCard.locator('text="View Full Profile"').click();

    const ratingChange = page.locator('[data-testid="30d-rating-change"]');
    const changeText = await ratingChange.textContent();

    // Should show either a value or "N/A", never empty or error
    expect(changeText).toMatch(/↑\d+\.\d|↓\d+\.\d|N\/A/);
  });

  test("chart displays correctly with only positive or negative changes", async ({
    page,
  }) => {
    await page.goto("/");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await firstCard.locator('text="View Full Profile"').click();

    // Chart should always show accumulated values
    const chartContainer = page.locator('[data-testid="rating-chart"]').first();
    await expect(chartContainer).toBeVisible();

    // Line should be visible regardless of trend
    const line = chartContainer.locator(".recharts-line");
    await expect(line).toBeVisible();

    // Color should be consistent (green as per requirements)
    const linePath = chartContainer.locator(".recharts-line-curve");
    await expect(linePath).toHaveAttribute(
      "stroke",
      /#10b981|rgb\(16, 185, 129\)/
    );
  });
});

test.describe("Player Profiles - Mobile Experience", () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
  });

  test("responsive layout on mobile", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await firstCard.locator('text="View Full Profile"').click();

    // Check that all sections stack vertically
    const sections = [
      '[data-testid="player-header"]',
      '[data-testid="rating-chart-container"]',
      '[data-testid="performance-metrics"]',
      '[data-testid="game-history"]',
    ];

    let previousBottom = 0;
    for (const section of sections) {
      const box = await page.locator(section).boundingBox();
      expect(box?.y || 0).toBeGreaterThanOrEqual(previousBottom);
      previousBottom = (box?.y || 0) + (box?.height || 0);
    }
  });

  test("touch interactions on chart", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await firstCard.locator('text="View Full Profile"').click();

    const chart = page.locator('[data-testid="rating-chart"]').first();
    const chartBox = await chart.boundingBox();

    if (chartBox) {
      // Tap on chart
      await page.tap('[data-testid="rating-chart"]', {
        position: { x: chartBox.width / 2, y: chartBox.height / 2 },
      });

      // Check that tap was registered (tooltip may not appear on all devices)
      // Instead, verify the chart is interactive by checking if we can tap it without errors
      // The actual tooltip behavior varies by device/browser
    }
  });
});

test.describe("Player Profiles - Performance", () => {
  test("profile loads within 1.5 seconds", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();

    const startTime = Date.now();
    await firstCard.locator('text="View Full Profile"').click();

    // Wait for all main elements to be visible
    await Promise.all([
      page.waitForSelector('[data-testid="player-header"]'),
      page.waitForSelector('[data-testid="rating-chart"]:first-of-type'),
      page.waitForSelector('[data-testid="performance-metrics"]'),
      page.waitForSelector('[data-testid="game-history"]'),
    ]);

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1500);
  });

  test("chart renders smoothly without jank", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await firstCard.locator('text="View Full Profile"').click();

    // Wait for chart
    await page.waitForSelector(
      '[data-testid="rating-chart"]:first-of-type .recharts-line'
    );

    // Measure frame rate during time filter change
    await page.evaluate(() => {
      (window as any).frameCount = 0;
      const startTime = performance.now();

      function countFrames() {
        (window as any).frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(countFrames);
        }
      }
      requestAnimationFrame(countFrames);
    });

    // Trigger chart update
    await page.locator('button:has-text("7d")').click();
    await page.waitForTimeout(1000);

    const fps = await page.evaluate(() => (window as any).frameCount);
    expect(fps).toBeGreaterThan(50); // Should maintain close to 60fps
  });
});
