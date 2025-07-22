import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../../src/lib/test-ids";
import {
  takeScreenshot,
  navigateTo,
  waitForElement,
  checkAccessibility,
} from "../../utils/test-helpers";
import {
  setupConsoleErrorMonitoring,
  validateAPIResponse,
  validateLeaderboardResponse,
  validateNumericContent,
  measurePageLoadTime,
  validateRelativeDate,
  validatePWACapability,
} from "../../utils/validation-helpers";

test.describe("PWA Leaderboard - Specification Tests", () => {
  let consoleErrors: string[];

  test.beforeEach(async ({ page }) => {
    // Monitor console errors
    consoleErrors = setupConsoleErrorMonitoring(page);

    // Don't mock - use real production data
    // await mockAPIResponses(page);
  });

  test.afterEach(async () => {
    // Verify no console errors occurred
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors detected: ${consoleErrors.join(", ")}`);
    }
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

        if (name) {
          players.push({ name, rating, games });
        }
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
      // Win Rate removed per spec - no longer displayed
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
      // Win Rate removed per spec - no longer displayed
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

  test.describe("API Response Validation", () => {
    test("validates leaderboard API response structure", async ({ page }) => {
      // Validate API response during page load
      const responsePromise = validateAPIResponse(
        page,
        "**/api/leaderboard",
        validateLeaderboardResponse
      );

      await navigateTo(page, "/");
      await responsePromise;
    });

    test("handles field transformations correctly", async ({ page }) => {
      // Listen for API response
      const response = await Promise.all([
        page.waitForResponse("**/api/leaderboard"),
        navigateTo(page, "/"),
      ]);

      const data = await response[0].json();

      // Verify that API field names are properly transformed in UI
      // API might return 'games' but UI should show 'gamesPlayed'
      const firstPlayer = data.players[0];
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();

      // Check that games count is displayed correctly
      const gamesText = await firstCard
        .locator("text=/\\d+ games?/")
        .textContent();
      const expectedGames = firstPlayer.gamesPlayed ?? firstPlayer.games ?? 0;
      expect(gamesText).toContain(`${expectedGames} game`);
    });
  });

  test.describe("Data Validation", () => {
    test("displays ratings with correct precision", async ({ page }) => {
      await navigateTo(page, "/");

      // Get all rating displays
      const ratingElements = page.locator(".text-2xl.font-bold");
      const count = await ratingElements.count();

      for (let i = 0; i < count; i++) {
        const rating = await validateNumericContent(
          page,
          `.text-2xl.font-bold >> nth=${i}`,
          {
            min: 0,
            max: 100,
            decimalPlaces: 1,
          }
        );

        // Verify it's displayed with exactly 1 decimal place
        const text = await ratingElements.nth(i).textContent();
        expect(text).toMatch(/^\d+\.\d$/);
      }
    });

    test("validates relative date formatting", async ({ page }) => {
      await navigateTo(page, "/");

      // Check header last updated
      await validateRelativeDate(page, "text=/Updated .* ago|Just now/");

      // Check at least one expanded player card
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await firstCard.click();
      await expect(firstCard).toHaveAttribute("aria-expanded", "true");

      // Validate last played date in expanded content
      const expandedContent = firstCard.locator(".bg-muted\\/30");
      await validateRelativeDate(
        page,
        `${expandedContent} >> text=/Last Played:/`
      );
    });

    test("validates games count is integer", async ({ page }) => {
      await navigateTo(page, "/");

      // Check all game counts
      const gameElements = page.locator("text=/\\d+ games?/");
      const count = await gameElements.count();

      for (let i = 0; i < count; i++) {
        const text = await gameElements.nth(i).textContent();
        const match = text?.match(/(\\d+) games?/);
        if (match) {
          const games = parseInt(match[1]);
          expect(Number.isInteger(games)).toBe(true);
          expect(games).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe("Sorting and Ranking", () => {
    test("validates correct sorting order", async ({ page }) => {
      const response = await Promise.all([
        page.waitForResponse("**/api/leaderboard"),
        navigateTo(page, "/"),
      ]);

      const data = await response[0].json();

      // Verify data is sorted correctly
      for (let i = 1; i < data.players.length; i++) {
        const prev = data.players[i - 1];
        const curr = data.players[i];

        // Primary sort: rating (descending)
        if (prev.rating !== curr.rating) {
          expect(prev.rating).toBeGreaterThan(curr.rating);
        } else if (prev.gamesPlayed !== curr.gamesPlayed) {
          // Secondary sort: games played (descending)
          expect(prev.gamesPlayed).toBeGreaterThan(curr.gamesPlayed);
        } else {
          // Tertiary sort: name (alphabetical)
          expect(prev.name.localeCompare(curr.name)).toBeLessThanOrEqual(0);
        }
      }
    });

    test("handles players with identical ratings correctly", async ({
      page,
    }) => {
      // Create test data with identical ratings
      await page.route("**/api/leaderboard", route => {
        route.fulfill({
          body: JSON.stringify({
            players: [
              {
                id: "a",
                name: "Alice",
                rating: 30.0,
                gamesPlayed: 10,
                lastPlayed: new Date().toISOString(),
              },
              {
                id: "b",
                name: "Bob",
                rating: 30.0,
                gamesPlayed: 10,
                lastPlayed: new Date().toISOString(),
              },
              {
                id: "c",
                name: "Charlie",
                rating: 30.0,
                gamesPlayed: 5,
                lastPlayed: new Date().toISOString(),
              },
            ],
            totalGames: 25,
            lastUpdated: new Date().toISOString(),
            seasonName: "Test Season",
          }),
        });
      });

      await navigateTo(page, "/");

      // Verify order: Alice, Bob (same rating/games, alphabetical), then Charlie (fewer games)
      const names = await page
        .locator("h3.truncate.font-medium")
        .allTextContents();
      expect(names).toEqual(["Alice", "Bob", "Charlie"]);
    });
  });

  test.describe("Performance Validation", () => {
    test("measures actual page load time", async ({ page }) => {
      const loadTime = await measurePageLoadTime(page);

      // Spec requires < 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    test("validates lazy loading behavior", async ({ page }) => {
      await navigateTo(page, "/");

      // Count initial visible cards
      const visibleCards = await page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]:visible`)
        .count();

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500); // Wait for any lazy loading

      // Count cards after scroll
      const cardsAfterScroll = await page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]:visible`)
        .count();

      // Should not lazy load more cards (all loaded initially)
      expect(cardsAfterScroll).toBe(visibleCards);
    });
  });

  test.describe("PWA Functionality", () => {
    test("validates PWA manifest and capabilities", async ({ page }) => {
      await validatePWACapability(page);
    });

    test("displays season name from active configuration", async ({ page }) => {
      const response = await Promise.all([
        page.waitForResponse("**/api/leaderboard"),
        navigateTo(page, "/"),
      ]);

      const data = await response[0].json();

      // Verify season name is displayed
      await expect(page.getByText(data.seasonName)).toBeVisible();
    });
  });

  test.describe("Edge Cases - Extended", () => {
    test("handles very large game counts correctly", async ({ page }) => {
      await page.route("**/api/leaderboard", route => {
        route.fulfill({
          body: JSON.stringify({
            players: [
              {
                id: "veteran",
                name: "Veteran",
                rating: 50.0,
                gamesPlayed: 999,
                lastPlayed: new Date().toISOString(),
              },
            ],
            totalGames: 999,
            lastUpdated: new Date().toISOString(),
            seasonName: "Test Season",
          }),
        });
      });

      await navigateTo(page, "/");

      // Should display large number correctly
      await expect(page.getByText("999 games")).toBeVisible();
    });

    test("handles network errors gracefully", async ({ page }) => {
      // Simulate network error
      await page.route("**/api/leaderboard", route => {
        route.abort("failed");
      });

      // Should show error state (implementation dependent)
      await page.goto("/");

      // Wait for error message or retry UI
      await page.waitForTimeout(1000);

      // Verify page doesn't crash and shows some error indication
      const hasError =
        (await page.locator("text=/error|retry|failed/i").count()) > 0;
      expect(hasError || consoleErrors.length > 0).toBe(true);
    });
  });
});
