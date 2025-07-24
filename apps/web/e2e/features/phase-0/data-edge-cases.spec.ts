import { test, expect } from "@playwright/test";

test.describe("Data Edge Cases and Invalid Values", () => {
  test("handles infinity and NaN values in leaderboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check main leaderboard doesn't show invalid values
    const leaderboardContent = await page.locator("main").textContent();
    expect(leaderboardContent).not.toContain("Infinity");
    expect(leaderboardContent).not.toContain("-Infinity");
    expect(leaderboardContent).not.toContain("NaN");

    // Check game count is not negative
    const seasonSummary = await page
      .locator(".text-muted-foreground")
      .first()
      .textContent();
    const gameCountMatch = seasonSummary?.match(/(\d+)\s*games/);
    if (gameCountMatch) {
      const gameCount = parseInt(gameCountMatch[1]);
      expect(gameCount).toBeGreaterThanOrEqual(0);
      expect(gameCount).not.toBe(Infinity);
    }

    // Check all visible ratings are valid numbers
    const ratingElements = await page
      .locator('[data-testid^="player-card-"] .text-2xl')
      .all();
    for (const element of ratingElements) {
      const ratingText = await element.textContent();
      const rating = parseFloat(ratingText || "0");

      // Rating should be a finite number
      expect(isFinite(rating)).toBe(true);
      expect(rating).toBeGreaterThan(-100); // Reasonable lower bound
      expect(rating).toBeLessThan(200); // Reasonable upper bound
    }
  });

  test("handles missing or invalid player names", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check all player names are valid
    const playerNames = await page
      .locator('[data-testid^="player-card-"] .font-medium')
      .all();
    for (const nameElement of playerNames) {
      const name = await nameElement.textContent();

      // Should have a non-empty name
      expect(name).toBeTruthy();
      expect(name?.length).toBeGreaterThan(0);

      // Should not show undefined, null, or placeholder
      expect(name).not.toBe("undefined");
      expect(name).not.toBe("null");
      expect(name).not.toContain("[object");
    }
  });

  test("handles invalid delta calculations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check all delta values
    const deltaElements = await page
      .locator(
        '[class*="text-green"], [class*="text-red"], [class*="text-muted"]'
      )
      .all();
    for (const element of deltaElements) {
      const deltaText = await element.textContent();

      if (deltaText && (deltaText.includes("▲") || deltaText.includes("▼"))) {
        // Extract numeric value
        const match = deltaText.match(/[▲▼](\d+\.?\d*)/);
        if (match) {
          const value = parseFloat(match[1]);
          expect(isFinite(value)).toBe(true);
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThan(100); // Reasonable delta upper bound
        }
      } else if (deltaText?.includes("—")) {
        // Valid no-change indicator
        expect(deltaText).toBe("—");
      }
    }
  });

  test("handles edge cases in player profile", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to first player profile
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);
    await page.click("text=View Full Profile");
    await page.waitForURL("**/player/**", { timeout: 10000 });

    // Check profile data validity
    const profileContent = await page.locator("main").textContent();
    expect(profileContent).not.toContain("Infinity");
    expect(profileContent).not.toContain("NaN");

    // Check rank is valid - look in subtitle
    const subtitleElement = await page
      .locator("h2.text-muted-foreground")
      .first();
    const subtitleText = await subtitleElement.textContent();
    const rankMatch = subtitleText?.match(/Rank #(\d+)/);
    if (rankMatch) {
      const rank = parseInt(rankMatch[1]);
      expect(rank).toBeGreaterThan(0);
      expect(rank).toBeLessThan(100); // Reasonable upper bound
    }

    // Check games played is valid
    const gamesElements = await page
      .locator('[class*="text-muted"]')
      .filter({ hasText: /\d+ games/ });
    const gamesText = await gamesElements.first().textContent();
    const gamesMatch = gamesText?.match(/(\d+) games/);
    if (gamesMatch) {
      const games = parseInt(gamesMatch[1]);
      expect(games).toBeGreaterThanOrEqual(0);
      expect(isFinite(games)).toBe(true);
    }
  });

  test("handles invalid chart data gracefully", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find a player and go to their profile
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);
    await page.click("text=View Full Profile");
    await page.waitForLoadState("networkidle");

    // Check if chart is present
    const chartContainer = page
      .locator(".recharts-responsive-container")
      .first();
    const isChartVisible = await chartContainer.isVisible();

    if (isChartVisible) {
      // If chart is shown, verify it has valid structure
      const chartSvg = await chartContainer.locator("svg");
      expect(await chartSvg.isVisible()).toBe(true);

      // Should not show error messages in chart area
      const chartText = await chartContainer.textContent();
      expect(chartText).not.toContain("Error");
      expect(chartText).not.toContain("Invalid");
    } else {
      // If no chart, should show appropriate message
      const messageElements = page
        .locator('text="Need more games"')
        .or(page.locator('text="Insufficient data"'))
        .or(page.locator('text="No data"'));
      expect(await messageElements.isVisible()).toBe(true);
    }
  });

  test("handles game history edge cases", async ({ page }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Check page loaded without errors
    const errorMessage = await page.locator("text=/error|failed/i").count();
    if (errorMessage === 0) {
      // Check game data validity
      const gameCards = await page
        .locator('[class*="border"][class*="rounded"]')
        .all();

      for (let i = 0; i < Math.min(3, gameCards.length); i++) {
        const cardText = await gameCards[i].textContent();

        // Should not contain invalid values
        expect(cardText).not.toContain("Infinity");
        expect(cardText).not.toContain("NaN");
        expect(cardText).not.toContain("undefined");

        // Check scores are formatted properly
        const scores = cardText?.match(/[+-]?\d{1,3}(,\d{3})*/g) || [];
        for (const score of scores) {
          // Remove commas and parse
          const numericScore = parseInt(score.replace(/,/g, ""));
          expect(isFinite(numericScore)).toBe(true);
        }
      }
    }
  });

  test("handles empty states appropriately", async ({ page }) => {
    // Test player filter that might return no results
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Try to find filter dropdown
    const filterDropdown = page.locator('select, [role="combobox"]').first();
    if (await filterDropdown.isVisible()) {
      // Get all options
      const options = await filterDropdown.locator("option").all();

      // Try to find a player with potentially no games
      for (const option of options.slice(-2)) {
        // Check last few players
        const value = await option.getAttribute("value");
        if (value && value !== "all") {
          await filterDropdown.selectOption(value);
          await page.waitForTimeout(500);

          // Check if empty state is shown properly
          const content = await page.locator("main").textContent();
          if (content?.includes("No games")) {
            // Should show a proper empty state message
            expect(content).toMatch(/no games|no results|empty/i);
            expect(content).not.toContain("Error");
            expect(content).not.toContain("Failed");
          }
          break;
        }
      }
    }
  });
});
