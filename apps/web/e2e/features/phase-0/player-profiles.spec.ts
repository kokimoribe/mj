import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../../src/lib/test-ids";
import {
  takeScreenshot,
  navigateTo,
  waitForElement,
  checkAccessibility,
} from "../../utils/test-helpers";

test.describe("Player Profiles - Specification Tests", () => {
  test.beforeEach(async () => {
    // Use production data for testing
  });

  // Test Scenario 1: View Player Profile
  test("View Player Profile - navigate from leaderboard", async ({ page }) => {
    await navigateTo(page, "/");

    // Find and click on a player card
    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();
    await expect(firstCard).toBeVisible();

    // Click to expand
    await firstCard.click();
    await expect(firstCard).toHaveAttribute("aria-expanded", "true");

    // Click "View Full Profile"
    const profileButton = page.getByText("View Full Profile");
    await expect(profileButton).toBeVisible();
    await profileButton.click();

    // Verify navigation to profile page
    await expect(page).toHaveURL(/\/player\/[^/]+$/);

    // Verify all main sections are visible
    await expect(
      page.getByRole("heading", { name: /Rank #\d+.*Rating.*games/ })
    ).toBeVisible();
    await expect(page.getByText("Rating Progression")).toBeVisible();
    await expect(page.getByText("Performance Stats")).toBeVisible();
    await expect(
      page.getByText(/Recent Games.*Showing \d+ of \d+/)
    ).toBeVisible();

    await takeScreenshot(page, "player-profiles/view-from-leaderboard");
  });

  // Test Scenario 2: Rating Chart Display
  test("Rating Chart Display - shows progression over time", async ({
    page,
  }) => {
    await navigateTo(page, "/player/joseph");

    // Wait for chart to load
    const chartSection = page.locator('[data-testid="rating-chart"]');
    await expect(chartSection).toBeVisible();

    // Verify chart has rendered (look for SVG or canvas)
    const chart = chartSection.locator("svg").first();
    await expect(chart).toBeVisible();

    // Verify axes are labeled (use first() to avoid strict mode violation)
    await expect(
      chartSection
        .locator("text")
        .filter({ hasText: /Jun|Jul|Aug|Date/ })
        .first()
    ).toBeVisible();

    // Verify current rating is displayed
    await expect(page.getByText(/Current: \d+\.\d+/)).toBeVisible();

    // Verify 30-day change is displayed
    await expect(
      page.getByText(/30-day: [↑↓]\d+\.\d+|30-day: N\/A/)
    ).toBeVisible();

    await takeScreenshot(page, "player-profiles/rating-chart");
  });

  // Test Scenario 3: Chart Interaction
  test("Chart Interaction - tooltip on data points", async ({ page }) => {
    await navigateTo(page, "/player/joseph");

    const chartSection = page.locator('[data-testid="rating-chart"]');
    await expect(chartSection).toBeVisible();

    // Find a data point (circle element)
    const dataPoint = chartSection.locator("circle").first();
    await expect(dataPoint).toBeVisible();

    // Hover over data point
    await dataPoint.hover();

    // Check for tooltip
    await expect(
      page.locator('[role="tooltip"], .recharts-tooltip')
    ).toBeVisible({ timeout: 5000 });

    await takeScreenshot(page, "player-profiles/chart-tooltip");
  });

  // Test Scenario 4: Load Game History
  test("Load Game History - shows more games on click", async ({ page }) => {
    await navigateTo(page, "/player/joseph");

    // Verify initial games shown
    const gamesList = page.locator('[data-testid="games-list"]');
    await expect(gamesList).toBeVisible();

    // Count initial game entries
    const initialGames = await page
      .locator('[data-testid^="game-entry-"]')
      .count();
    expect(initialGames).toBe(5);

    // Check for "Show More Games" button
    const showMoreButton = page.getByRole("button", {
      name: /Show More Games/,
    });
    await expect(showMoreButton).toBeVisible();

    // Click to load more
    await showMoreButton.click();

    // Wait for loading to complete (there's a 300ms delay in the component)
    await page.waitForTimeout(400);

    // Verify more games are shown
    const expandedGames = await page
      .locator('[data-testid^="game-entry-"]')
      .count();
    expect(expandedGames).toBeGreaterThan(initialGames);

    await takeScreenshot(page, "player-profiles/expanded-games");
  });

  // Test Scenario 5: Navigate Back
  test("Navigate Back - returns to previous page", async ({ page }) => {
    // Navigate from leaderboard
    await navigateTo(page, "/");
    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();
    await firstCard.click();
    await page.getByText("View Full Profile").click();

    // Now on profile page
    await expect(page).toHaveURL(/\/player\//);

    // Click back button
    const backButton = page.getByRole("button", { name: /back/i });
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Should be back on leaderboard
    await expect(page).toHaveURL("/");

    await takeScreenshot(page, "player-profiles/navigate-back");
  });

  // Test Scenario 6: Empty State - New Player
  test("Empty State - player with less than 2 games", async ({ page }) => {
    // Find a player with only 1 game from production data
    await navigateTo(page, "/");

    // Get all player cards and find one with exactly 1 game
    const playerCards = page.locator(
      `[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`
    );
    const count = await playerCards.count();

    let playerWith1Game = null;
    for (let i = 0; i < count; i++) {
      const card = playerCards.nth(i);
      const gamesText = await card.locator("text=/\\d+ games?/").textContent();
      if (gamesText && gamesText.includes("1 game")) {
        playerWith1Game = card;
        break;
      }
    }

    if (!playerWith1Game) {
      // Skip test if no player with 1 game exists
      test.skip();
      return;
    }

    // Click to expand and navigate to profile
    await playerWith1Game.click();
    await page.getByText("View Full Profile").click();

    // Should show message for chart
    await expect(
      page.getByText(/Need more games for chart|Not enough data/)
    ).toBeVisible();

    await takeScreenshot(page, "player-profiles/new-player");
  });

  // Test Scenario 7: Performance Stats Calculation
  test("Performance Stats - shows correct values", async ({ page }) => {
    // Use the first player from leaderboard instead of hardcoded name
    await navigateTo(page, "/");
    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();
    await firstCard.click();
    await page.getByText("View Full Profile").click();

    const statsSection = page.locator('[data-testid="performance-stats"]');
    await expect(statsSection).toBeVisible();

    // Check average placement
    await expect(
      statsSection.getByText(/Average Placement: \d+\.\d+/)
    ).toBeVisible();

    // Check last played
    await expect(
      statsSection.getByText(/Last Played: .* ago|Last Played: Today/)
    ).toBeVisible();

    // No win rate should be shown
    await expect(statsSection.getByText(/Win Rate/)).not.toBeVisible();

    await takeScreenshot(page, "player-profiles/stats-section");
  });

  // Test Scenario 8: Opponent Display
  test("Opponent Display - shows clickable opponent names", async ({
    page,
  }) => {
    // Use the first player from leaderboard instead of hardcoded name
    await navigateTo(page, "/");
    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();
    await firstCard.click();
    await page.getByText("View Full Profile").click();

    // Find first game entry
    const firstGame = page.locator('[data-testid^="game-entry-"]').first();
    await expect(firstGame).toBeVisible();

    // Should show "vs." followed by opponent names
    await expect(firstGame.getByText(/vs\./)).toBeVisible();

    // Find opponent links (should be 3)
    const opponentLinks = firstGame.locator('a[href^="/player/"]');
    const opponentCount = await opponentLinks.count();
    expect(opponentCount).toBe(3);

    // Click on an opponent
    const firstOpponent = opponentLinks.first();
    const opponentName = await firstOpponent.textContent();
    await firstOpponent.click();

    // Should navigate to opponent's profile
    await expect(page).toHaveURL(/\/player\/[^/]+$/);
    await expect(
      page.getByRole("heading", { name: new RegExp(opponentName!) })
    ).toBeVisible();

    await takeScreenshot(page, "player-profiles/opponent-navigation");
  });

  // Test Scenario 9: Direct URL Navigation
  test("Direct URL Navigation - loads specific player", async ({ page }) => {
    // Get a valid player ID from the leaderboard first
    await navigateTo(page, "/");
    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();
    const playerId = await firstCard.getAttribute("data-testid");
    const actualPlayerId =
      playerId?.replace(`${TEST_IDS.PLAYER_CARD}-`, "") || "";

    // Navigate directly to that player's profile
    await navigateTo(page, `/player/${actualPlayerId}`);

    // Verify player profile loaded (don't check for specific name)
    await expect(page.getByRole("heading")).toBeVisible();
    await expect(page.getByText("Rating Progression")).toBeVisible();

    await takeScreenshot(page, "player-profiles/direct-url");
  });

  // Edge Case 1: Single Game
  test("Edge Case - Single Game player", async ({ page }) => {
    await page.route("**/players/single*", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "single",
          name: "Single Game Player",
          rating: 25.0,
          games: 1,
          ratingHistory: [25.0],
        }),
      });
    });

    await navigateTo(page, "/player/single");

    // Should show message instead of chart
    await expect(page.getByText(/Need more games for chart/)).toBeVisible();

    // Other sections should still work
    await expect(page.getByText("Performance Stats")).toBeVisible();
    await expect(page.getByText(/Recent Games/)).toBeVisible();
  });

  // Edge Case 2: No Games
  test("Edge Case - No Games player", async ({ page }) => {
    await page.route("**/players/nogames*", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "nogames",
          name: "No Games Player",
          rating: 25.0,
          games: 0,
          ratingHistory: [],
        }),
      });
    });

    await navigateTo(page, "/player/nogames");

    // Should show encouraging empty state
    await expect(page.getByText(/No games.*yet|Start playing/i)).toBeVisible();
  });

  // Edge Case 3: Long Name
  test("Edge Case - Long name truncation", async ({ page }) => {
    await page.route("**/players/longname*", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "longname",
          name: "Player With Extremely Long Name That Should Be Truncated",
          rating: 30.0,
          games: 10,
        }),
      });
    });

    await navigateTo(page, "/player/longname");

    // Name should be truncated with ellipsis
    const header = page.getByRole("heading").first();
    await expect(header).toBeVisible();

    // Check for text-overflow styles
    const headerBox = await header.boundingBox();
    expect(headerBox?.width).toBeLessThan(300); // Should not overflow container
  });

  // Edge Case 4: Missing 30-day Data
  test("Edge Case - No games in last 30 days", async ({ page }) => {
    await page.route("**/players/inactive*", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "inactive",
          name: "Inactive Player",
          rating: 28.0,
          games: 5,
          lastGameDate: new Date(
            Date.now() - 45 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      });
    });

    await navigateTo(page, "/player/inactive");

    // Should show N/A for 30-day change
    await expect(page.getByText(/30-day: N\/A/)).toBeVisible();
  });

  // Mobile Responsive Test
  test("Mobile Responsive - works on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 393, height: 852 });

    await navigateTo(page, "/player/joseph");

    // All sections should be visible
    await expect(page.getByText("Rating Progression")).toBeVisible();
    await expect(page.getByText("Performance Stats")).toBeVisible();
    await expect(page.getByText(/Recent Games/)).toBeVisible();

    // Touch targets should be large enough
    const showMoreButton = page.getByRole("button", {
      name: /Show More Games/,
    });
    const buttonBox = await showMoreButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

    await takeScreenshot(page, "player-profiles/mobile-view");
  });

  // Performance Test
  test("Performance - loads within 1.5 seconds", async ({ page }) => {
    const startTime = Date.now();

    await navigateTo(page, "/player/joseph");

    // Wait for main content
    await waitForElement(page, '[data-testid="rating-chart"]');
    await waitForElement(page, '[data-testid="performance-stats"]');
    await waitForElement(page, '[data-testid="games-list"]');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1500);
  });

  // Accessibility Test
  test("Accessibility - meets WCAG requirements", async ({ page }) => {
    await navigateTo(page, "/player/joseph");

    // Check overall accessibility
    await checkAccessibility(page, "player-profiles");

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Check focus indicators
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeTruthy();

    // Check back button exists and is accessible
    const backButton = page.getByRole("button", { name: /back/i });
    await expect(backButton).toBeVisible();
  });
});
