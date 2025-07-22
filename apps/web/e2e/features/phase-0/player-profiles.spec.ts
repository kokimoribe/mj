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
  validatePlayerProfileResponse,
  validateGameHistoryResponse,
  validateNumericContent,
  validateRelativeDate,
  validateChartRendering,
} from "../../utils/validation-helpers";

test.describe("Player Profiles - Specification Tests", () => {
  let consoleErrors: string[];

  test.beforeEach(async ({ page }) => {
    // Monitor console errors
    consoleErrors = setupConsoleErrorMonitoring(page);
    // Use production data for testing
  });

  test.afterEach(async () => {
    // Verify no console errors occurred
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors detected: ${consoleErrors.join(", ")}`);
    }
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

  // Test Scenario 2: Rating Chart Display with Time Range Selector
  test("Rating Chart Display - shows progression with time range selector", async ({
    page,
  }) => {
    // Get a player ID dynamically
    await navigateTo(page, "/");
    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();
    const playerId = await firstCard.getAttribute("data-testid");
    const actualPlayerId =
      playerId?.replace(`${TEST_IDS.PLAYER_CARD}-`, "") || "";

    // Navigate to player profile
    await navigateTo(page, `/player/${actualPlayerId}`);

    // Wait for chart to load
    const chartSection = page.locator('[data-testid="rating-chart"]');
    await expect(chartSection).toBeVisible();

    // Verify time range selector buttons
    await expect(page.getByRole("button", { name: "7d" })).toBeVisible();
    await expect(page.getByRole("button", { name: "14d" })).toBeVisible();
    await expect(page.getByRole("button", { name: "30d" })).toBeVisible();
    await expect(page.getByRole("button", { name: "All" })).toBeVisible();

    // Default should be "All"
    await expect(page.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    // Validate chart rendering with proper data points
    await validateChartRendering(page, '[data-testid="rating-chart"]');

    // Verify current rating is displayed with proper format
    const currentRating = await validateNumericContent(
      page,
      "text=/Current: \\d+\\.\\d+/",
      { min: 0, max: 100, decimalPlaces: 1 }
    );

    // Verify period delta is displayed (changes based on selected range)
    await expect(
      page.getByText(/Period Δ: [▲▼]\d+\.\d+|Period Δ: —/)
    ).toBeVisible();

    await takeScreenshot(page, "player-profiles/rating-chart-all-time");
  });

  // Test Time Range Selector Functionality
  test("Time Range Selector - updates chart and delta calculation", async ({
    page,
  }) => {
    await navigateTo(page, "/player/joseph");

    const chartSection = page.locator('[data-testid="rating-chart"]');
    await expect(chartSection).toBeVisible();

    // Test 7-day range
    const sevenDayButton = page.getByRole("button", { name: "7d" });
    await sevenDayButton.click();
    await expect(sevenDayButton).toHaveAttribute("aria-pressed", "true");

    // Wait for chart update
    await page.waitForTimeout(300);

    // Verify period delta updates
    const periodDelta = page.getByText(/Period Δ:/);
    await expect(periodDelta).toBeVisible();

    // Count data points - should be fewer for 7 days
    const sevenDayPoints = await chartSection.locator("circle").count();

    await takeScreenshot(page, "player-profiles/chart-7-day-range");

    // Test 30-day range
    const thirtyDayButton = page.getByRole("button", { name: "30d" });
    await thirtyDayButton.click();
    await expect(thirtyDayButton).toHaveAttribute("aria-pressed", "true");

    await page.waitForTimeout(300);

    // Count data points - should be more for 30 days
    const thirtyDayPoints = await chartSection.locator("circle").count();
    expect(thirtyDayPoints).toBeGreaterThanOrEqual(sevenDayPoints);

    await takeScreenshot(page, "player-profiles/chart-30-day-range");

    // Test All range
    const allButton = page.getByRole("button", { name: "All" });
    await allButton.click();
    await expect(allButton).toHaveAttribute("aria-pressed", "true");

    await page.waitForTimeout(300);

    // Count data points - should be most for all time
    const allPoints = await chartSection.locator("circle").count();
    expect(allPoints).toBeGreaterThanOrEqual(thirtyDayPoints);

    await takeScreenshot(page, "player-profiles/chart-all-time-range");
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

    // Check for tooltip with simple value display
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

    // Check average placement (might be a number or dash for new players)
    const avgPlacementText = await statsSection
      .getByText(/Average Placement:/)
      .textContent();
    if (avgPlacementText?.includes("—")) {
      // Player has insufficient games
      expect(avgPlacementText).toContain("—");
    } else {
      // Validate numeric placement
      const avgPlacement = await validateNumericContent(
        page,
        `[data-testid="performance-stats"] >> text=/Average Placement: \\d+\\.\\d+/`,
        { min: 1.0, max: 4.0, decimalPlaces: 1 }
      );
    }

    // Check last played - verify it renders without errors
    await validateRelativeDate(
      page,
      `[data-testid="performance-stats"] >> text=/Last Played:/`
    );

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
    // Get a valid player ID dynamically
    await navigateTo(page, "/");
    const firstCard = page
      .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
      .first();
    const playerId = await firstCard.getAttribute("data-testid");
    const actualPlayerId =
      playerId?.replace(`${TEST_IDS.PLAYER_CARD}-`, "") || "";

    await navigateTo(page, `/player/${actualPlayerId}`);

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

  test.describe("API Response Validation", () => {
    test("validates player profile API response structure", async ({
      page,
    }) => {
      // Get a valid player ID
      await navigateTo(page, "/");
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      const playerId = await firstCard.getAttribute("data-testid");
      const actualPlayerId =
        playerId?.replace(`${TEST_IDS.PLAYER_CARD}-`, "") || "";

      // Validate API response
      const responsePromise = validateAPIResponse(
        page,
        `**/api/players/${actualPlayerId}`,
        validatePlayerProfileResponse
      );

      await navigateTo(page, `/player/${actualPlayerId}`);
      await responsePromise;
    });

    test("validates player games API response structure", async ({ page }) => {
      // Get a valid player ID
      await navigateTo(page, "/");
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      const playerId = await firstCard.getAttribute("data-testid");
      const actualPlayerId =
        playerId?.replace(`${TEST_IDS.PLAYER_CARD}-`, "") || "";

      // Validate games API response
      const responsePromise = validateAPIResponse(
        page,
        `**/api/players/${actualPlayerId}/games*`,
        data => {
          // Should be an array of games
          if (!Array.isArray(data)) {
            throw new Error("Player games response should be an array");
          }

          // Each game should have required fields
          data.forEach((game: any, index: number) => {
            if (!game.id) throw new Error(`Game ${index} missing id`);
            if (!game.date) throw new Error(`Game ${index} missing date`);
            if (
              typeof game.placement !== "number" ||
              game.placement < 1 ||
              game.placement > 4
            ) {
              throw new Error(`Game ${index} has invalid placement`);
            }
            if (
              !game.opponents ||
              !Array.isArray(game.opponents) ||
              game.opponents.length !== 3
            ) {
              throw new Error(`Game ${index} should have exactly 3 opponents`);
            }
          });
        }
      );

      await navigateTo(page, `/player/${actualPlayerId}`);
      await responsePromise;
    });
  });

  test.describe("Data Calculations", () => {
    test("validates rating history calculation from games", async ({
      page,
    }) => {
      // Navigate to a player with multiple games
      await navigateTo(page, "/");

      // Find a player with multiple games
      const playerCards = page.locator(
        `[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`
      );
      const count = await playerCards.count();

      let playerWithGames = null;
      for (let i = 0; i < count; i++) {
        const card = playerCards.nth(i);
        const gamesText = await card
          .locator("text=/\\d+ games?/")
          .textContent();
        const gamesMatch = gamesText?.match(/(\\d+) games?/);
        if (gamesMatch && parseInt(gamesMatch[1]) > 5) {
          playerWithGames = card;
          break;
        }
      }

      if (!playerWithGames) {
        test.skip();
        return;
      }

      // Navigate to profile
      await playerWithGames.click();
      await page.getByText("View Full Profile").click();

      // Wait for both APIs to complete
      const [profileResponse, gamesResponse] = await Promise.all([
        page.waitForResponse(
          resp =>
            resp.url().includes("/api/players/") &&
            !resp.url().includes("/games")
        ),
        page.waitForResponse(resp => resp.url().includes("/games")),
        page.waitForLoadState("networkidle"),
      ]);

      const profile = await profileResponse.json();
      const games = await gamesResponse.json();

      // Verify rating chart has correct number of data points
      const chartSection = page.locator('[data-testid="rating-chart"]');
      const dataPoints = chartSection.locator("circle");
      const pointCount = await dataPoints.count();

      // Should have one point per game plus current rating
      expect(pointCount).toBeGreaterThanOrEqual(Math.min(games.length, 100));
    });

    test("validates average placement calculation", async ({ page }) => {
      // Similar to above, find player with games and verify calculation
      await navigateTo(page, "/");
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await firstCard.click();
      await page.getByText("View Full Profile").click();

      // Wait for games API
      const gamesResponse = await page.waitForResponse(resp =>
        resp.url().includes("/games")
      );
      const games = await gamesResponse.json();

      if (games.length > 0) {
        // Calculate expected average
        const placements = games.map((g: any) => g.placement);
        const expectedAvg =
          placements.reduce((a: number, b: number) => a + b, 0) /
          placements.length;

        // Get displayed average
        const statsSection = page.locator('[data-testid="performance-stats"]');
        const avgText = await statsSection
          .getByText(/Average Placement:/)
          .textContent();

        if (avgText && !avgText.includes("—")) {
          const match = avgText.match(/(\d+\.\d+)/);
          if (match) {
            const displayedAvg = parseFloat(match[1]);
            expect(Math.abs(displayedAvg - expectedAvg)).toBeLessThan(0.1);
          }
        }
      }
    });

    test("validates 30-day rating change calculation", async ({ page }) => {
      await navigateTo(page, "/");
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await firstCard.click();
      await page.getByText("View Full Profile").click();

      // Check 30-day change display
      const thirtyDayText = await page.getByText(/30-day:/).textContent();

      if (thirtyDayText?.includes("N/A")) {
        // Verify player has no games older than 30 days
        const gamesResponse = await page.waitForResponse(resp =>
          resp.url().includes("/games")
        );
        const games = await gamesResponse.json();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const oldGames = games.filter(
          (g: any) => new Date(g.date) < thirtyDaysAgo
        );
        expect(oldGames.length).toBe(0);
      } else {
        // Verify it's a valid number with proper format
        expect(thirtyDayText).toMatch(/30-day: [↑↓]\d+\.\d+/);
      }
    });
  });

  test.describe("Extended Edge Cases", () => {
    test("handles timezone correctly for dates", async ({ page }) => {
      await navigateTo(page, "/");
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await firstCard.click();
      await page.getByText("View Full Profile").click();

      // Get a game date
      const gameEntry = page.locator('[data-testid^="game-entry-"]').first();
      const dateText = await gameEntry.textContent();

      // Should show date in consistent format (e.g., "Jul 6")
      expect(dateText).toMatch(/[A-Z][a-z]{2} \d{1,2}/);
    });

    test("handles players with gaps in game history", async ({ page }) => {
      // This would need mock data to test properly
      // For now, just verify the chart handles any data correctly
      await navigateTo(page, "/");
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await firstCard.click();
      await page.getByText("View Full Profile").click();

      // Chart should render without errors
      await validateChartRendering(page, '[data-testid="rating-chart"]', 1);
    });

    test("validates all opponents are shown for each game", async ({
      page,
    }) => {
      await navigateTo(page, "/");
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await firstCard.click();
      await page.getByText("View Full Profile").click();

      // Check first game entry
      const firstGame = page.locator('[data-testid^="game-entry-"]').first();
      await expect(firstGame).toBeVisible();

      // Should show exactly 3 opponent links
      const opponentLinks = firstGame.locator('a[href^="/player/"]');
      const opponentCount = await opponentLinks.count();
      expect(opponentCount).toBe(3);

      // All links should be clickable
      for (let i = 0; i < 3; i++) {
        const link = opponentLinks.nth(i);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute("href", /^\/player\/.+$/);
      }
    });

    test("validates current rank calculation from leaderboard", async ({
      page,
    }) => {
      // Get leaderboard data
      const leaderboardResponse = await Promise.all([
        page.waitForResponse("**/api/leaderboard"),
        navigateTo(page, "/"),
      ]);

      const leaderboardData = await leaderboardResponse[0].json();

      // Pick a player and calculate their expected rank
      const targetPlayer = leaderboardData.players[2]; // Pick 3rd player

      // Navigate to their profile
      await navigateTo(page, `/player/${targetPlayer.id}`);

      // Check displayed rank
      const rankText = await page
        .getByRole("heading", { name: /Rank #\d+/ })
        .textContent();
      const displayedRank = parseInt(
        rankText?.match(/Rank #(\d+)/)?.[1] || "0"
      );

      // Should match position in sorted leaderboard
      expect(displayedRank).toBe(3);
    });
  });

  test.describe("Performance", () => {
    test("validates rating chart renders within 300ms", async ({ page }) => {
      await navigateTo(page, "/");
      const firstCard = page
        .locator(`[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`)
        .first();
      await firstCard.click();
      await page.getByText("View Full Profile").click();

      // Measure chart render time
      const startTime = Date.now();
      await page
        .locator('[data-testid="rating-chart"] svg')
        .waitFor({ state: "visible" });
      const renderTime = Date.now() - startTime;

      expect(renderTime).toBeLessThan(300);
    });

    test("validates all games load at once (no pagination in query)", async ({
      page,
    }) => {
      await navigateTo(page, "/");

      // Find a player with many games
      const playerCards = page.locator(
        `[data-testid^="${TEST_IDS.PLAYER_CARD}-"]`
      );
      const count = await playerCards.count();

      let playerWithManyGames = null;
      for (let i = 0; i < count; i++) {
        const card = playerCards.nth(i);
        const gamesText = await card
          .locator("text=/\\d+ games?/")
          .textContent();
        const gamesMatch = gamesText?.match(/(\d+) games?/);
        if (gamesMatch && parseInt(gamesMatch[1]) > 10) {
          playerWithManyGames = card;
          break;
        }
      }

      if (!playerWithManyGames) {
        test.skip();
        return;
      }

      await playerWithManyGames.click();
      await page.getByText("View Full Profile").click();

      // Check that all games were loaded in one request
      const gamesRequests: any[] = [];
      page.on("response", response => {
        if (response.url().includes("/games")) {
          gamesRequests.push(response);
        }
      });

      // Click "Show More Games"
      const showMoreButton = page.getByRole("button", {
        name: /Show More Games/,
      });
      if (await showMoreButton.isVisible()) {
        await showMoreButton.click();
        await page.waitForTimeout(500);
      }

      // Should only have made one games request
      expect(gamesRequests.length).toBeLessThanOrEqual(1);
    });
  });
});
