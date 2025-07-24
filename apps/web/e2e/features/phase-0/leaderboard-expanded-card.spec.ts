import { test, expect } from "@playwright/test";

test.describe("Leaderboard Expanded Card Requirements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Dismiss PWA notification if present
    const dismissButton = page.locator(
      'button[aria-label="Dismiss notification"]'
    );
    const notificationExists = await dismissButton
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    if (notificationExists) {
      await dismissButton.click();
      await page.waitForTimeout(300);
    }
  });

  test("displays average placement value in expanded card", async ({
    page,
  }) => {
    // Wait for leaderboard to load
    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });

    // Find and click first player card
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300); // Wait for expansion animation

    // Check that average placement shows both label and value
    const avgPlacementElement = await page
      .locator('text="Avg Placement:"')
      .locator("..");
    const avgPlacementText = await avgPlacementElement.textContent();

    // Must show a numeric value, not just the label
    expect(avgPlacementText).toMatch(/Avg Placement:\s*\d+\.?\d*/);
    expect(avgPlacementText).not.toBe("Avg Placement:");

    // Value should be between 1.0 and 4.0 for 4-player mahjong
    const match = avgPlacementText?.match(/Avg Placement:\s*(\d+\.?\d*)/);
    if (match) {
      const value = parseFloat(match[1]);
      expect(value).toBeGreaterThanOrEqual(1.0);
      expect(value).toBeLessThanOrEqual(4.0);
    }
  });

  test("displays 7-day change with value in expanded card", async ({
    page,
  }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    // Check that 7-day change shows both label and value
    const sevenDayElement = await page
      .locator('text="7-day change:"')
      .locator("..");
    const sevenDayText = await sevenDayElement.textContent();

    // Should show either a change with value or "--" for no data
    expect(sevenDayText).toMatch(/7-day change:\s*([▲▼]\d+\.?\d*|—|--)/);

    // If showing a change, verify format
    if (sevenDayText?.includes("▲") || sevenDayText?.includes("▼")) {
      expect(sevenDayText).toMatch(
        /7-day change:\s*[▲▼]\d+\.?\d*\s*\(from \d+\.?\d*\)/
      );
    }
  });

  test("displays mini chart for recent performance", async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    // Check for chart container
    const chartContainer = page
      .locator('.recharts-responsive-container, [class*="chart"]')
      .first();
    const isChartVisible = await chartContainer.isVisible();

    // If player has enough games, chart should be visible
    if (isChartVisible) {
      // Check for chart elements
      const lineElements = await page.locator(".recharts-line").count();
      expect(lineElements).toBeGreaterThan(0);

      // Check for data points
      const dots = await page.locator(".recharts-dot").count();
      expect(dots).toBeGreaterThan(0);
    } else {
      // If no chart, should show appropriate message
      const noDataMessage = page
        .locator('text="Need more games"')
        .or(page.locator('text="Insufficient data"'));
      expect(await noDataMessage.isVisible()).toBe(true);
    }
  });

  test("handles edge cases gracefully", async ({ page }) => {
    // Test handling of invalid data by checking all expanded cards
    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });
    const playerCards = await page
      .locator('[data-testid^="player-card-"]')
      .all();

    for (let i = 0; i < Math.min(3, playerCards.length); i++) {
      await playerCards[i].click();
      await page.waitForTimeout(300);

      // Check no infinity or NaN values are displayed
      const expandedContent = await playerCards[i].textContent();
      expect(expandedContent).not.toContain("Infinity");
      expect(expandedContent).not.toContain("NaN");
      expect(expandedContent).not.toContain("-Infinity");

      // Check placement value is valid or shows fallback
      const avgPlacement = await page
        .locator('text="Avg Placement:"')
        .locator("..");
      const avgText = await avgPlacement.textContent();
      if (avgText && !avgText.includes("--")) {
        const match = avgText.match(/(\d+\.?\d*)/);
        if (match) {
          const value = parseFloat(match[1]);
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThan(5);
        }
      }

      // Collapse card
      await playerCards[i].click();
      await page.waitForTimeout(300);
    }
  });

  test("shows last played information", async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    // Check that last played is shown
    const lastPlayedElement = await page
      .locator('text="Last Played:"')
      .locator("..");
    expect(await lastPlayedElement.isVisible()).toBe(true);

    const lastPlayedText = await lastPlayedElement.textContent();
    // Should show relative time or "--"
    expect(lastPlayedText).toMatch(
      /Last Played:\s*(\d+\s*(hours?|days?|weeks?)\s*ago|Just now|--)/
    );
  });

  test("view full profile link works", async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    const playerName = await firstCard.locator(".font-medium").textContent();

    await firstCard.click();
    await page.waitForTimeout(300);

    // Click view full profile
    const profileLink = page.locator("text=View Full Profile");
    expect(await profileLink.isVisible()).toBe(true);

    await profileLink.click();

    // Wait for navigation to player profile
    await page.waitForURL("**/player/**", { timeout: 10000 });

    // Should navigate to player profile
    expect(page.url()).toContain("/player/");

    // Profile should show same player name
    await page.waitForSelector("h1.text-2xl.font-bold", { timeout: 5000 });
    const profileName = await page
      .locator("h1.text-2xl.font-bold")
      .textContent();
    expect(profileName).toBe(playerName);
  });
});
