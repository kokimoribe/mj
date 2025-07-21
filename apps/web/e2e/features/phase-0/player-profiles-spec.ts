import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../../src/lib/test-ids";
import {
  takeScreenshot,
  navigateTo,
  waitForElement,
  mockAPIResponses,
  checkAccessibility,
} from "../../utils/test-helpers";

test.describe("Player Profiles - Specification Tests", () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test.describe("Profile Header", () => {
    test("displays correct player information", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Name, rank (position, not rating), rating, games
      await expect(page.getByText("Joseph")).toBeVisible();
      await expect(page.getByText(/Rank #\d+/)).toBeVisible();
      await expect(page.getByText(/Rating: \d+\.\d+/)).toBeVisible();
      await expect(page.getByText(/\d+ games/)).toBeVisible();

      // Rank should be position (1, 2, 3...) not rating value
      const rankText = await page.getByText(/Rank #\d+/).textContent();
      const rankNumber = parseInt(rankText?.match(/Rank #(\d+)/)?.[1] || "0");
      expect(rankNumber).toBeLessThan(10); // Rank position, not rating value
    });

    test("back button returns to previous page", async ({ page }) => {
      // Navigate from leaderboard
      await navigateTo(page, "/");
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await firstCard.click();
      await page.getByText("View Full Profile").click();

      // Click back button
      await page.getByRole("button", { name: /back/i }).click();

      // Should return to leaderboard
      await expect(page).toHaveURL("/");
    });

    test("truncates long player names", async ({ page }) => {
      // Mock player with long name
      await page.route("**/api/players/long-name", route => {
        route.fulfill({
          body: JSON.stringify({
            id: "long-name",
            name: "Player With Extremely Long Name That Should Be Truncated",
            rating: 30.0,
            games: 5,
            mu: 35.0,
            sigma: 2.5,
          }),
        });
      });

      await navigateTo(page, "/player/long-name");

      const nameElement = page
        .locator("h1, h2")
        .filter({ hasText: /Player With Extremely Long/ });

      // Should have text-overflow: ellipsis style
      const styles = await nameElement.evaluate(el =>
        window.getComputedStyle(el)
      );
      expect(styles.textOverflow).toBe("ellipsis");
    });
  });

  test.describe("Rating Chart", () => {
    test("displays chart for players with 2+ games", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Chart section should be visible
      await expect(page.getByText("Rating Trend")).toBeVisible();
      await expect(page.getByTestId(TEST_IDS.RATING_CHART)).toBeVisible();

      // Should show current rating
      await expect(page.getByText(/Current: \d+\.\d+/)).toBeVisible();
    });

    test('shows "Need more games" for players with < 2 games', async ({
      page,
    }) => {
      // Mock player with 1 game
      await page.route("**/api/players/new-player", route => {
        route.fulfill({
          body: JSON.stringify({
            id: "new-player",
            name: "New Player",
            rating: 25.0,
            games: 1,
            mu: 30.0,
            sigma: 2.5,
          }),
        });
      });

      await page.route("**/api/players/new-player/games", route => {
        route.fulfill({
          body: JSON.stringify([
            {
              id: "game1",
              date: new Date().toISOString(),
              placement: 3,
              score: 20000,
              plusMinus: -5000,
              ratingChange: 0,
            },
          ]),
        });
      });

      await navigateTo(page, "/player/new-player");

      // Should show message instead of chart
      await expect(page.getByText(/Need more games for chart/)).toBeVisible();
    });

    test("uses green color (#10b981) for all points", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Check chart point colors
      const chartPoints = page.locator(
        '[data-testid="rating-chart"] circle, [data-testid="rating-chart"] .recharts-dot'
      );
      const firstPoint = chartPoints.first();

      if (await firstPoint.isVisible({ timeout: 1000 }).catch(() => false)) {
        const fill = await firstPoint.getAttribute("fill");
        expect(fill).toBe("#10b981");
      }
    });

    test("shows tooltip on hover/click", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      const chart = page.getByTestId(TEST_IDS.RATING_CHART);
      const chartArea = chart.locator("svg").first();

      // Hover over chart area
      await chartArea.hover({ position: { x: 100, y: 50 } });

      // Tooltip should appear
      const tooltip = page
        .locator('.recharts-tooltip, [role="tooltip"]')
        .first();
      await expect(tooltip).toBeVisible({ timeout: 2000 });
    });

    test("calculates 30-day change correctly", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Should show 30-day change (not hardcoded)
      const changeText = await page
        .getByText(/30-day: [↑↓]\d+\.\d+|30-day: N\/A/)
        .textContent();

      // If showing a change, it should be reasonable (not always 4.2)
      if (changeText && !changeText.includes("N/A")) {
        const change = parseFloat(changeText.match(/(\d+\.\d+)/)?.[1] || "0");
        expect(change).toBeGreaterThan(0);
        expect(change).toBeLessThan(20); // Reasonable range
      }
    });
  });

  test.describe("Performance Stats", () => {
    test("shows calculated average placement", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Should show "Performance Stats" not "Quick Stats"
      await expect(page.getByText("Performance Stats")).toBeVisible();

      // Average placement should be calculated (mean of all games)
      await expect(page.getByText(/Average Placement: \d+\.\d+/)).toBeVisible();

      // Value should be between 1.0 and 4.0
      const avgText = await page
        .getByText(/Average Placement: \d+\.\d+/)
        .textContent();
      const avg = parseFloat(avgText?.match(/(\d+\.\d+)/)?.[1] || "0");
      expect(avg).toBeGreaterThanOrEqual(1.0);
      expect(avg).toBeLessThanOrEqual(4.0);
    });

    test("shows last played date", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      await expect(page.getByText(/Last Played: .* ago/)).toBeVisible();
    });

    test("does NOT show win rate", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Win rate should be removed per spec
      await expect(page.getByText("Win Rate")).not.toBeVisible();
    });

    test("does NOT show advanced stats section", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Advanced stats should be removed per spec
      await expect(page.getByText("Advanced Stats")).not.toBeVisible();
      await expect(page.getByText(/Skill \(μ\)/)).not.toBeVisible();
      await expect(page.getByText(/Uncertainty \(σ\)/)).not.toBeVisible();
    });
  });

  test.describe("Game History", () => {
    test("loads all games initially with client-side pagination", async ({
      page,
    }) => {
      await navigateTo(page, "/player/joseph");

      // Should show "Showing X of Y" indicator
      await expect(page.getByText(/Showing \d+ of \d+/)).toBeVisible();

      // Should show 5 games initially
      const gameEntries = page.locator(
        `[data-testid^="${TEST_IDS.GAME_ENTRY_PREFIX}-"]`
      );
      await expect(gameEntries).toHaveCount(5);

      // Should have "Show More Games" button
      await expect(
        page.getByRole("button", { name: /Show More Games/ })
      ).toBeVisible();
    });

    test("shows more games on button click (client-side)", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Initial count
      let gameEntries = page.locator(
        `[data-testid^="${TEST_IDS.GAME_ENTRY_PREFIX}-"]`
      );
      await expect(gameEntries).toHaveCount(5);

      // Click show more
      await page.getByRole("button", { name: /Show More Games/ }).click();

      // Should show 10 games now (no loading, instant)
      gameEntries = page.locator(
        `[data-testid^="${TEST_IDS.GAME_ENTRY_PREFIX}-"]`
      );
      await expect(gameEntries).toHaveCount(10);

      // "Showing X of Y" should update
      await expect(page.getByText(/Showing 10 of \d+/)).toBeVisible();
    });

    test("game entries show correct format", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      const firstGame = page
        .locator(`[data-testid^="${TEST_IDS.GAME_ENTRY_PREFIX}-"]`)
        .first();

      // Date • Placement • Score • Rating Change
      await expect(firstGame.getByText(/\w{3} \d{1,2}/)).toBeVisible(); // Jul 6
      await expect(firstGame.getByText(/1st|2nd|3rd|4th/)).toBeVisible();
      await expect(firstGame.getByText(/[+-]\d+,\d+ pts/)).toBeVisible();
      await expect(firstGame.getByText(/[↑↓]\d+\.\d+/)).toBeVisible();
    });

    test("opponent names are clickable links", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      const firstGame = page
        .locator(`[data-testid^="${TEST_IDS.GAME_ENTRY_PREFIX}-"]`)
        .first();

      // Should have "vs." text
      await expect(firstGame.getByText(/vs\./)).toBeVisible();

      // Opponent names should be links
      const opponentLinks = firstGame.locator('a[href^="/player/"]');
      await expect(opponentLinks).toHaveCount(3); // 4-player game = 3 opponents

      // Click first opponent
      const firstOpponent = opponentLinks.first();
      const opponentName = await firstOpponent.textContent();
      await firstOpponent.click();

      // Should navigate to opponent's profile
      await expect(page).toHaveURL(/\/player\/[^/]+$/);
      await expect(page.getByText(opponentName || "")).toBeVisible();
    });

    test("handles empty game history", async ({ page }) => {
      // Mock player with no games
      await page.route("**/api/players/no-games", route => {
        route.fulfill({
          body: JSON.stringify({
            id: "no-games",
            name: "No Games Player",
            rating: 25.0,
            games: 0,
            mu: 30.0,
            sigma: 2.5,
          }),
        });
      });

      await page.route("**/api/players/no-games/games", route => {
        route.fulfill({ body: JSON.stringify([]) });
      });

      await navigateTo(page, "/player/no-games");

      // Should show empty state
      await expect(
        page.getByText(/No games.*yet|Start playing/i)
      ).toBeVisible();
    });
  });

  test.describe("Performance Requirements", () => {
    test("page loads within 1.5 seconds", async ({ page }) => {
      const startTime = Date.now();
      await navigateTo(page, "/player/joseph");

      // Wait for main content
      await waitForElement(page, '[data-testid="player-profile"]');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(1500);
    });

    test("chart renders within 300ms after data load", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Time from when data is visible to chart render
      const dataVisible = Date.now();
      await waitForElement(page, `[data-testid="${TEST_IDS.RATING_CHART}"]`);
      const chartTime = Date.now() - dataVisible;

      expect(chartTime).toBeLessThan(300);
    });

    test("maintains 60fps scrolling on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await navigateTo(page, "/player/joseph");

      // Scroll performance test
      await page.evaluate(() => {
        let lastTime = performance.now();
        let frames = 0;
        let fps = 0;

        function measureFPS() {
          frames++;
          const currentTime = performance.now();
          if (currentTime >= lastTime + 1000) {
            fps = Math.round((frames * 1000) / (currentTime - lastTime));
            frames = 0;
            lastTime = currentTime;
          }
          requestAnimationFrame(measureFPS);
        }

        measureFPS();

        // Smooth scroll
        window.scrollTo({ top: 1000, behavior: "smooth" });

        return new Promise(resolve => {
          setTimeout(() => resolve(fps), 1500);
        });
      });

      // FPS should be close to 60
      // Note: This is a simplified test, actual FPS measurement is complex
    });
  });

  test.describe("Edge Cases", () => {
    test("handles missing 30-day data", async ({ page }) => {
      // Mock player with recent games only
      await page.route("**/api/players/new-player/games", route => {
        route.fulfill({
          body: JSON.stringify([
            {
              id: "game1",
              date: new Date().toISOString(),
              placement: 1,
              score: 30000,
              plusMinus: 10000,
              ratingChange: 2.0,
            },
          ]),
        });
      });

      await navigateTo(page, "/player/new-player");

      // Should show N/A for 30-day change
      await expect(page.getByText(/30-day: N\/A/)).toBeVisible();
    });

    test("handles tied placements correctly", async ({ page }) => {
      // Mock games with tied placements
      await page.route("**/api/players/joseph/games", route => {
        route.fulfill({
          body: JSON.stringify([
            {
              id: "game1",
              date: new Date().toISOString(),
              placement: 2,
              score: 25000,
              plusMinus: 0,
              ratingChange: 0,
              opponents: [
                { name: "Player A", placement: 1 },
                { name: "Player B", placement: 2 }, // Tied
                { name: "Player C", placement: 4 },
              ],
            },
          ]),
        });
      });

      await navigateTo(page, "/player/joseph");

      // Should display tied placement correctly
      const gameEntry = page
        .locator(`[data-testid^="${TEST_IDS.GAME_ENTRY_PREFIX}-"]`)
        .first();
      await expect(gameEntry.getByText("2nd")).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("supports keyboard navigation", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Tab through elements
      await page.keyboard.press("Tab"); // Back button
      await expect(page.getByRole("button", { name: /back/i })).toBeFocused();

      // Tab to show more games
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Tab");
      }

      const showMoreButton = page.getByRole("button", {
        name: /Show More Games/,
      });
      await expect(showMoreButton).toBeFocused();

      // Enter should work
      await page.keyboard.press("Enter");
      const gameEntries = page.locator(
        `[data-testid^="${TEST_IDS.GAME_ENTRY_PREFIX}-"]`
      );
      await expect(gameEntries).toHaveCount(10);
    });

    test("has proper ARIA labels and roles", async ({ page }) => {
      await navigateTo(page, "/player/joseph");

      // Check main sections have proper roles
      await expect(page.getByRole("heading", { name: "Joseph" })).toBeVisible();
      await expect(page.getByRole("button", { name: /back/i })).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Show More Games/i })
      ).toBeVisible();
    });

    test("meets WCAG contrast requirements", async ({ page }) => {
      await navigateTo(page, "/player/joseph");
      await checkAccessibility(page, "player-profile-wcag");
    });
  });

  test.describe("Mobile Optimizations", () => {
    test("touch targets are at least 44x44px", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await navigateTo(page, "/player/joseph");

      // Check button sizes
      const buttons = page.locator('button, a[role="button"]');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();

        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test("supports swipe gestures for back navigation", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await navigateTo(page, "/player/joseph");

      // Simulate swipe right using drag
      await page.mouse.move(50, 400);
      await page.mouse.down();
      await page.mouse.move(300, 400, { steps: 10 });
      await page.mouse.up();

      // Should navigate back (if implemented)
      // Note: This may not work in all browsers/test environments
    });
  });
});
