import { test, expect } from "@playwright/test";

/**
 * Comprehensive specification-based tests for bug fixes
 * These tests encode the requirements from bug-fix-requirements.md
 * and MUST pass before any deployment
 */

test.describe("Bug Fix Specifications - Comprehensive", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector('[data-testid="leaderboard-view"]', {
      timeout: 10000,
    });
  });

  test.describe("Spec 1: Game Count Calculation", () => {
    test("MUST show maximum player games, NOT sum", async ({ page }) => {
      // Get leaderboard data
      const header = page.locator('[data-testid="leaderboard-header"]');
      const headerText = await header.textContent();
      const totalGamesMatch = headerText?.match(/(\d+)\s*games/);
      const displayedTotal = totalGamesMatch ? parseInt(totalGamesMatch[1]) : 0;

      // Calculate expected values
      const playerCards = page.locator('[data-testid*="player-card"]');
      const playerCount = await playerCards.count();

      let maxGames = 0;
      let sumGames = 0;
      const playerGames: number[] = [];

      for (let i = 0; i < playerCount; i++) {
        const cardText = await playerCards.nth(i).textContent();
        const gamesMatch = cardText?.match(/(\d+)\s*game/);
        if (gamesMatch) {
          const games = parseInt(gamesMatch[1]);
          playerGames.push(games);
          maxGames = Math.max(maxGames, games);
          sumGames += games;
        }
      }

      console.log(`Game Count Debug:`);
      console.log(`- Displayed: ${displayedTotal}`);
      console.log(`- Max (correct): ${maxGames}`);
      console.log(`- Sum (incorrect): ${sumGames}`);
      console.log(`- Player games: [${playerGames.join(", ")}]`);

      // REQUIREMENT: Total must equal max, not sum
      expect(displayedTotal).toBe(maxGames);
      expect(displayedTotal).not.toBe(sumGames);

      // Sanity checks
      expect(displayedTotal).not.toBe(404); // Known bug value
      expect(displayedTotal).toBeGreaterThan(50);
      expect(displayedTotal).toBeLessThan(150);
    });
  });

  test.describe("Spec 2: Chart Line Visibility", () => {
    test("mini charts MUST show green lines with 2px width", async ({
      page,
    }) => {
      // Find a player with games and expand
      const playerCards = page.locator('[data-testid*="player-card"]');

      // Find player with most games for best chart
      let maxGamesIndex = 0;
      let maxGames = 0;

      for (let i = 0; i < (await playerCards.count()); i++) {
        const cardText = await playerCards.nth(i).textContent();
        const gamesMatch = cardText?.match(/(\d+)\s*game/);
        if (gamesMatch) {
          const games = parseInt(gamesMatch[1]);
          if (games > maxGames) {
            maxGames = games;
            maxGamesIndex = i;
          }
        }
      }

      const targetCard = playerCards.nth(maxGamesIndex);
      await targetCard.click();
      await page.waitForTimeout(500);

      // Check mini chart
      const miniChart = page.locator('[data-testid="mini-rating-chart"]');
      await expect(miniChart).toBeVisible();

      // Look for line elements
      const lines = miniChart.locator("path[stroke]");
      const lineCount = await lines.count();

      expect(lineCount).toBeGreaterThan(0);

      // Check ALL lines
      for (let i = 0; i < lineCount; i++) {
        const line = lines.nth(i);
        const stroke = await line.getAttribute("stroke");
        const strokeWidth = await line.getAttribute("stroke-width");

        console.log(`Line ${i}: stroke="${stroke}", width="${strokeWidth}"`);

        // Skip axis lines
        if (stroke === "#e5e7eb" || stroke === "currentColor") continue;

        // REQUIREMENT: Data lines must be green with 2px width
        if (stroke !== "#e5e7eb") {
          expect(stroke).toBe("#10b981");
          expect(strokeWidth).toBe("2");

          // REQUIREMENT: Must NOT be transparent
          expect(stroke).not.toBe("transparent");
          expect(strokeWidth).not.toBe("0");
        }
      }
    });

    test("player profile chart MUST show visible lines", async ({ page }) => {
      // Navigate to player profile
      const firstCard = page.locator('[data-testid*="player-card"]').first();
      await firstCard.click();

      const profileLink = page.locator('text="View Full Profile"');
      await profileLink.click();
      await page.waitForURL("**/player/**");

      const ratingChart = page.locator('[data-testid="rating-chart"]');

      if (await ratingChart.isVisible()) {
        const chartText = await ratingChart.textContent();

        // Only check if chart is rendered (not "Need more games")
        if (!chartText?.includes("Need more games")) {
          const lines = ratingChart.locator("path[stroke]");

          // Find data line (not axis lines)
          const lineCount = await lines.count();
          for (let i = 0; i < lineCount; i++) {
            const line = lines.nth(i);
            const stroke = await line.getAttribute("stroke");

            // Skip axis lines
            if (stroke === "#e5e7eb" || stroke === "currentColor") continue;

            const strokeWidth = await line.getAttribute("stroke-width");

            // REQUIREMENT: Same as mini chart
            expect(stroke).toBe("#10b981");
            expect(strokeWidth).toBe("2");
          }
        }
      }
    });
  });

  test.describe("Spec 3: Desktop Navigation Visibility", () => {
    test("navigation MUST be visible on ALL screen sizes", async ({ page }) => {
      const nav = page.locator('nav[aria-label="Main navigation"]');

      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(nav).toBeVisible();

      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(nav).toBeVisible();

      // Test desktop
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(nav).toBeVisible();

      // Test large desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(nav).toBeVisible();

      // REQUIREMENT: No responsive hiding classes
      const className = await nav.getAttribute("class");
      console.log(`Nav classes: ${className}`);

      expect(className).not.toContain("md:hidden");
      expect(className).not.toContain("lg:hidden");
      expect(className).not.toContain("xl:hidden");
      expect(className).not.toContain("hidden");

      // REQUIREMENT: Exact class match
      expect(className).toBe(
        "bg-background fixed right-0 bottom-0 left-0 z-50 border-t"
      );

      // Verify navigation functionality
      const gamesLink = nav.locator('text="Games"');
      await expect(gamesLink).toBeVisible();
      await gamesLink.click();
      await expect(page).toHaveURL("/games");
    });
  });

  test.describe("Spec 4: Average Placement Display", () => {
    test("MUST show calculated average for players with games", async ({
      page,
    }) => {
      const playerCards = page.locator('[data-testid*="player-card"]');
      let testedPlayers = 0;

      // Test multiple players
      for (let i = 0; i < Math.min(3, await playerCards.count()); i++) {
        const card = playerCards.nth(i);
        const cardText = await card.textContent();

        // Only test players with games
        if (cardText?.match(/[1-9]\d*\s*game/)) {
          await card.click();
          await page.waitForTimeout(300);

          // Look for average placement
          const avgText = page.locator('text="Avg Placement:"');

          await expect(avgText).toBeVisible();

          const container = avgText.locator("..");
          const text = await container.textContent();

          console.log(`Player ${i} avg placement text: "${text}"`);

          // REQUIREMENT: Must show numeric value (1.0-4.0) or "—"
          const hasNumericValue = /[1-4]\.\d/.test(text || "");
          const hasDash = text?.includes("—");

          expect(hasNumericValue || hasDash).toBeTruthy();

          if (hasNumericValue) {
            const match = text?.match(/([1-4]\.\d)/);
            if (match) {
              const value = parseFloat(match[1]);
              expect(value).toBeGreaterThanOrEqual(1.0);
              expect(value).toBeLessThanOrEqual(4.0);
              testedPlayers++;
            }
          }

          await card.click(); // Collapse
        }
      }

      // Ensure we tested at least one player
      expect(testedPlayers).toBeGreaterThan(0);
    });
  });

  test.describe("Spec 5: PWA Notification Dismissal", () => {
    test("notification MUST have working dismiss button", async ({ page }) => {
      const notification = page.locator('text="PWA Status"');

      if (await notification.isVisible()) {
        // REQUIREMENT: Must have dismiss button
        const dismissButton = page.locator(
          'button[aria-label="Dismiss notification"]'
        );
        await expect(dismissButton).toBeVisible();

        // Check button structure
        const buttonClass = await dismissButton.getAttribute("class");
        expect(buttonClass).toContain("absolute");
        expect(buttonClass).toContain("top-2");
        expect(buttonClass).toContain("right-2");

        // REQUIREMENT: Clicking must hide notification
        await dismissButton.click();
        await expect(notification).not.toBeVisible();

        // Verify it stays hidden
        await page.waitForTimeout(1000);
        await expect(notification).not.toBeVisible();
      }
    });
  });

  test.describe("Games Tab Functionality", () => {
    test("games tab MUST be accessible and functional", async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1200, height: 800 });

      const nav = page.locator('nav[aria-label="Main navigation"]');
      const gamesLink = nav.locator('text="Games"');

      // REQUIREMENT: Games link must be visible
      await expect(gamesLink).toBeVisible();

      // Navigate to games
      await gamesLink.click();
      await expect(page).toHaveURL("/games");

      // Wait for content
      await page.waitForTimeout(2000);

      // REQUIREMENT: Must not show error
      const errorMessage = page.locator('text="Failed to load game history"');
      await expect(errorMessage).not.toBeVisible();

      // REQUIREMENT: Should show games or appropriate message
      const hasGames =
        (await page.locator('[data-testid*="game-"]').count()) > 0;
      const hasNoGamesMessage = await page
        .locator('text="No games found"')
        .isVisible();

      expect(hasGames || hasNoGamesMessage).toBeTruthy();
    });
  });
});
