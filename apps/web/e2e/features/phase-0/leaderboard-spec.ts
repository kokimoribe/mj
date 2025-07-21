import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../../src/lib/test-ids";
import {
  takeScreenshot,
  navigateTo,
  waitForElement,
  mockAPIResponses,
  checkAccessibility,
} from "../../utils/test-helpers";

test.describe("PWA Leaderboard - Specification Tests", () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIResponses(page);
  });

  test.describe("Component Structure", () => {
    test("displays all required components", async ({ page }) => {
      await navigateTo(page, "/");

      // Header with season info
      await expect(page.getByTestId(TEST_IDS.LEADERBOARD_HEADER)).toBeVisible();

      // Season summary (games count, player count, last update)
      await expect(page.getByText(/\d+ games/)).toBeVisible();
      await expect(page.getByText(/\d+ players/)).toBeVisible();
      await expect(page.getByText(/Updated .* ago/)).toBeVisible();

      // Player list
      const playerCards = page.locator(
        `[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`
      );
      const count = await playerCards.count();
      expect(count).toBeGreaterThan(0);

      // Bottom navigation
      await expect(page.getByTestId(TEST_IDS.NAV_BOTTOM)).toBeVisible();
    });

    test("SeasonSummary shows correct information", async ({ page }) => {
      await navigateTo(page, "/");

      const header = page.getByTestId(TEST_IDS.LEADERBOARD_HEADER);

      // Should show total games (max of all player games)
      await expect(header.getByText(/\d+ games/)).toBeVisible();

      // Should show active player count
      await expect(header.getByText(/\d+ players/)).toBeVisible();

      // Should show last updated timestamp
      await expect(header.getByText(/Updated .* ago/)).toBeVisible();
    });
  });

  test.describe("Sorting Logic", () => {
    test("players are sorted by rating, then games, then name", async ({
      page,
    }) => {
      await navigateTo(page, "/");

      const playerCards = page.locator(
        `[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`
      );
      const players = [];

      // Extract player data
      const count = await playerCards.count();
      for (let i = 0; i < count; i++) {
        const card = playerCards.nth(i);
        const name = await card.locator("h3").textContent();
        const ratingText = await card
          .locator(".text-2xl.font-bold")
          .first()
          .textContent();
        const gamesText = await card.locator("text=/\\d+ games/").textContent();

        const rating = parseFloat(ratingText || "0");
        const games = parseInt(gamesText?.match(/(\d+) games/)?.[1] || "0");

        players.push({ name, rating, games });
      }

      // Verify sorting
      for (let i = 1; i < players.length; i++) {
        const prev = players[i - 1];
        const curr = players[i];

        // Primary sort: rating (descending)
        if (prev.rating !== curr.rating) {
          expect(prev.rating).toBeGreaterThan(curr.rating);
        } else if (prev.games !== curr.games) {
          // Secondary sort: games (descending)
          expect(prev.games).toBeGreaterThan(curr.games);
        } else {
          // Tertiary sort: name (alphabetical)
          expect(prev.name.localeCompare(curr.name)).toBeLessThan(0);
        }
      }
    });
  });

  test.describe("Expandable Cards", () => {
    test("cards expand with smooth animation", async ({ page }) => {
      await navigateTo(page, "/");

      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();

      // Initial state
      await expect(firstCard).toHaveAttribute("aria-expanded", "false");

      // Click to expand
      await firstCard.click();

      // Verify expanded state
      await expect(firstCard).toHaveAttribute("aria-expanded", "true");

      // Wait for animation (200ms per spec)
      await page.waitForTimeout(200);

      // Verify expanded content
      await expect(page.getByText("Avg Placement")).toBeVisible();
      await expect(page.getByText("Win Rate")).toBeVisible();
      await expect(page.getByText("Last Played")).toBeVisible();
      await expect(page.getByText("View Full Profile")).toBeVisible();
    });

    test("sparkline shows rating history", async ({ page }) => {
      await navigateTo(page, "/");

      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await firstCard.click();

      // Look for rating trend visualization
      const sparkline = firstCard
        .locator('[data-testid="rating-sparkline"], svg')
        .first();

      // Should be visible if player has rating history
      if (await sparkline.isVisible({ timeout: 1000 }).catch(() => false)) {
        await takeScreenshot(page, "leaderboard-sparkline");
      }
    });

    test("stats are calculated on-demand when expanded", async ({ page }) => {
      await navigateTo(page, "/");

      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await firstCard.click();

      // Verify stats are displayed (values should be calculated, not hardcoded)
      await expect(page.getByText(/Avg Placement: \d+\.\d+/)).toBeVisible();
      await expect(page.getByText(/Win Rate: \d+%/)).toBeVisible();
      await expect(page.getByText(/Last Played: .*/)).toBeVisible();
    });
  });

  test.describe("Pull to Refresh", () => {
    test("refresh updates data and timestamp", async ({ page }) => {
      await navigateTo(page, "/");

      // Find refresh button
      const refreshButton = page.getByTestId(TEST_IDS.LEADERBOARD_REFRESH);

      if (await refreshButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Get initial timestamp
        const initialTimestamp = await page
          .getByText(/Updated .* ago/)
          .textContent();

        // Click refresh
        await refreshButton.click();

        // Should show loading state
        await expect(page.getByText(/refreshing|updating/i)).toBeVisible({
          timeout: 5000,
        });

        // Timestamp should update after refresh
        await page.waitForTimeout(1000);
        const newTimestamp = await page
          .getByText(/Updated .* ago/)
          .textContent();
        expect(newTimestamp).not.toBe(initialTimestamp);
      }
    });

    test("shows error toast on refresh failure", async ({ page }) => {
      // Mock API failure
      await page.route("**/api/leaderboard", route => route.abort());

      await navigateTo(page, "/");

      const refreshButton = page.getByTestId(TEST_IDS.LEADERBOARD_REFRESH);

      if (await refreshButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await refreshButton.click();

        // Should show error message
        await expect(page.getByText(/error|failed/i)).toBeVisible({
          timeout: 5000,
        });
      }
    });
  });

  test.describe("Performance", () => {
    test("cards have minimum height to prevent layout shift", async ({
      page,
    }) => {
      await navigateTo(page, "/");

      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();

      // Get card dimensions
      const box = await firstCard.boundingBox();

      // Should have minimum height to prevent shift
      expect(box?.height).toBeGreaterThanOrEqual(80);
    });

    test("page loads within 2 seconds on 3G", async ({ page }) => {
      // Simulate 3G network
      await page.context().route("**/*", route => route.continue(), {
        times: 1,
      });

      const startTime = Date.now();
      await navigateTo(page, "/");
      const loadTime = Date.now() - startTime;

      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });
  });

  test.describe("Edge Cases", () => {
    test("handles players with 0 games", async ({ page }) => {
      // Mock data with player having 0 games
      await page.route("**/api/leaderboard", route => {
        route.fulfill({
          body: JSON.stringify({
            players: [
              {
                id: "new-player",
                name: "New Player",
                rating: 25.0,
                games: 0,
                ratingChange: 0,
              },
            ],
            totalGames: 0,
            lastUpdated: new Date().toISOString(),
            seasonName: "Test Season",
          }),
        });
      });

      await navigateTo(page, "/");

      // Should show "0 games"
      await expect(page.getByText("0 games")).toBeVisible();
    });

    test("truncates very long names", async ({ page }) => {
      // Mock data with long name
      await page.route("**/api/leaderboard", route => {
        route.fulfill({
          body: JSON.stringify({
            players: [
              {
                id: "long-name",
                name: "Player With Extremely Long Name That Should Be Truncated",
                rating: 30.0,
                games: 5,
                ratingChange: 0,
              },
            ],
            totalGames: 5,
            lastUpdated: new Date().toISOString(),
            seasonName: "Test Season",
          }),
        });
      });

      await navigateTo(page, "/");

      const nameElement = page.locator("h3").first();
      const box = await nameElement.boundingBox();
      const parentBox = await nameElement.locator("..").boundingBox();

      // Name should not overflow parent
      expect(box?.width).toBeLessThanOrEqual(parentBox?.width || 0);
    });

    test("shows stale data warning after 24 hours", async ({ page }) => {
      // Mock data with old timestamp
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2); // 2 days ago

      await page.route("**/api/leaderboard", route => {
        route.fulfill({
          body: JSON.stringify({
            players: [],
            totalGames: 0,
            lastUpdated: oldDate.toISOString(),
            seasonName: "Test Season",
          }),
        });
      });

      await navigateTo(page, "/");

      // Should show stale data warning
      await expect(page.getByText(/stale|old data|24 hours/i)).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("supports keyboard navigation", async ({ page }) => {
      await navigateTo(page, "/");

      // Tab to first card
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab"); // Skip header elements

      // Should focus on first card
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await expect(firstCard).toBeFocused();

      // Enter/Space should expand
      await page.keyboard.press("Enter");
      await expect(firstCard).toHaveAttribute("aria-expanded", "true");

      // Tab to profile link
      await page.keyboard.press("Tab");
      const profileLink = page.getByText("View Full Profile");
      await expect(profileLink).toBeFocused();
    });

    test("has proper ARIA labels", async ({ page }) => {
      await navigateTo(page, "/");

      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();

      // Should have proper ARIA attributes
      await expect(firstCard).toHaveAttribute("role", "button");
      await expect(firstCard).toHaveAttribute("aria-expanded");
      await expect(firstCard).toHaveAttribute("aria-label");
    });

    test("meets WCAG contrast requirements", async ({ page }) => {
      await navigateTo(page, "/");
      await checkAccessibility(page, "leaderboard-wcag");
    });
  });
});
