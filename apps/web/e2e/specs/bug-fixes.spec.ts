import { test, expect } from "@playwright/test";

/**
 * Specification-based tests for bug fixes
 * These tests encode the requirements from bug-fix-requirements.md
 */

test.describe("Bug Fix Specifications", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector('[data-testid="leaderboard-view"]', {
      timeout: 10000,
    });
  });

  test.describe("Spec 1: Game Count Calculation", () => {
    test("total games must equal maximum player games, not sum", async ({
      page,
    }) => {
      // Get leaderboard data
      const header = page.locator('[data-testid="leaderboard-header"]');
      const headerText = await header.textContent();
      const totalGamesMatch = headerText?.match(/(\d+)\s*games/);
      const displayedTotal = totalGamesMatch ? parseInt(totalGamesMatch[1]) : 0;

      // Calculate what the total should be
      const playerCards = page.locator('[data-testid*="player-card"]');
      const playerCount = await playerCards.count();

      let maxGames = 0;
      let sumGames = 0;

      for (let i = 0; i < playerCount; i++) {
        const cardText = await playerCards.nth(i).textContent();
        const gamesMatch = cardText?.match(/(\d+)\s*game/);
        if (gamesMatch) {
          const games = parseInt(gamesMatch[1]);
          maxGames = Math.max(maxGames, games);
          sumGames += games;
        }
      }

      console.log(
        `Displayed: ${displayedTotal}, Max: ${maxGames}, Sum: ${sumGames}`
      );

      // REQUIREMENT: Total must equal max, not sum
      expect(displayedTotal).toBe(maxGames);
      expect(displayedTotal).not.toBe(sumGames);

      // Sanity check - should not be 404
      expect(displayedTotal).not.toBe(404);
    });
  });

  test.describe("Spec 2: Chart Line Visibility", () => {
    test("charts must show visible green lines connecting points", async ({
      page,
    }) => {
      // Find a player with games and expand
      const firstCard = page.locator('[data-testid*="player-card"]').first();
      await firstCard.click();
      await page.waitForTimeout(300);

      // Check mini chart
      const miniChart = page.locator('[data-testid="mini-rating-chart"]');

      if (await miniChart.isVisible()) {
        // Look for line elements
        const lines = miniChart.locator("path[stroke]");
        const lineCount = await lines.count();

        expect(lineCount).toBeGreaterThan(0);

        // Check line properties
        const firstLine = lines.first();
        const stroke = await firstLine.getAttribute("stroke");
        const strokeWidth = await firstLine.getAttribute("stroke-width");

        // REQUIREMENT: Lines must be green (#10b981) with 2px width
        expect(stroke).toBe("#10b981");
        expect(strokeWidth).toBe("2");

        // REQUIREMENT: Must NOT be transparent
        expect(stroke).not.toBe("transparent");
        expect(strokeWidth).not.toBe("0");
      }
    });

    test("player profile chart must show visible lines", async ({ page }) => {
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
          const firstLine = lines.first();

          if ((await firstLine.count()) > 0) {
            const stroke = await firstLine.getAttribute("stroke");
            const strokeWidth = await firstLine.getAttribute("stroke-width");

            // REQUIREMENT: Same as mini chart
            expect(stroke).toBe("#10b981");
            expect(strokeWidth).toBe("2");
          }
        }
      }
    });
  });

  test.describe("Spec 3: Desktop Navigation Visibility", () => {
    test("navigation must be visible on all screen sizes", async ({ page }) => {
      const nav = page.locator('nav[aria-label="Main navigation"]');

      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(nav).toBeVisible();

      // Test desktop
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(nav).toBeVisible();

      // REQUIREMENT: No responsive hiding classes
      const className = await nav.getAttribute("class");
      expect(className).not.toContain("md:hidden");
      expect(className).not.toContain("lg:hidden");
      expect(className).not.toContain("hidden");

      // Verify navigation works
      const gamesLink = nav.locator('text="Games"');
      await expect(gamesLink).toBeVisible();
      await gamesLink.click();
      await expect(page).toHaveURL("/games");
    });
  });

  test.describe("Spec 4: Average Placement Display", () => {
    test("must show calculated average for players with games", async ({
      page,
    }) => {
      const playerCards = page.locator('[data-testid*="player-card"]');
      let foundPlayerWithGames = false;

      // Find a player with games
      for (let i = 0; i < (await playerCards.count()); i++) {
        const card = playerCards.nth(i);
        const cardText = await card.textContent();

        if (cardText?.match(/[1-9]\d*\s*game/)) {
          await card.click();
          await page.waitForTimeout(300);

          // Look for average placement
          const avgText = page.locator('text="Avg Placement"');

          if (await avgText.isVisible()) {
            const container = avgText.locator("..");
            const text = await container.textContent();

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
              }
            }

            foundPlayerWithGames = true;
          }

          await card.click(); // Collapse
          break;
        }
      }

      if (!foundPlayerWithGames) {
        console.log("No players with games found for average placement test");
      }
    });
  });

  test.describe("Spec 5: PWA Notification Dismissal", () => {
    test("notification must have working dismiss button", async ({ page }) => {
      const notification = page.locator('text="PWA Status"');

      if (await notification.isVisible()) {
        // REQUIREMENT: Must have dismiss button
        const dismissButton = page.locator(
          'button[aria-label="Dismiss notification"]'
        );
        await expect(dismissButton).toBeVisible();

        // REQUIREMENT: Clicking must hide notification
        await dismissButton.click();
        await expect(notification).not.toBeVisible();

        // Verify it stays hidden
        await page.reload();
        // Note: Persistence across reload is not required per spec
      }
    });
  });
});
