import { test, expect } from "@playwright/test";

test.describe("Player Profile Data Rendering Check", () => {
  test("verify player profile renders chart data correctly", async ({
    page,
  }) => {
    // Navigate to a player profile page (using a known player)
    await page.goto("http://localhost:3000/player/joseph");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit to collect any errors
    await page.waitForTimeout(2000);

    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log("Console errors found:", consoleErrors);
    }

    // Check if "Need more games for chart" message is visible
    const needMoreGamesMessage = await page
      .locator('text="Need more games for chart"')
      .isVisible();
    console.log("Shows 'Need more games for chart':", needMoreGamesMessage);

    // Check if chart is rendered
    const chartContainer = await page
      .locator('[data-testid="rating-chart"], .recharts-responsive-container')
      .isVisible();
    console.log("Chart container visible:", chartContainer);

    // Count data points in the chart
    const dataPoints = await page
      .locator('.recharts-dot, circle[class*="recharts"]')
      .count();
    console.log("Number of chart data points:", dataPoints);

    // Check for rating history data
    const hasRatingData =
      (await page.locator("text=/\\d+\\.\\d+/").count()) > 0;
    console.log("Has rating data visible:", hasRatingData);

    // Check performance stats section
    const performanceStats = await page
      .locator('text="Performance Stats"')
      .isVisible();
    console.log("Performance stats section visible:", performanceStats);

    // Check if average placement is shown
    const avgPlacement = await page
      .locator("text=/Average Placement: \\d+\\.\\d+/")
      .isVisible();
    console.log("Average placement visible:", avgPlacement);

    // Check recent games section
    const recentGames = await page.locator('text="Recent Games"').isVisible();
    console.log("Recent games section visible:", recentGames);

    // Count game entries
    const gameEntries = await page
      .locator('[data-testid="game-entry"], [class*="game-entry"]')
      .count();
    console.log("Number of game entries:", gameEntries);

    // Check for API errors
    const apiErrors = consoleErrors.filter(
      error =>
        error.includes("PGRST") ||
        error.includes("failed to parse") ||
        error.includes("column")
    );

    if (apiErrors.length > 0) {
      console.log("API errors found:", apiErrors);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: "player-profile-debug.png", fullPage: true });

    // Assertions
    expect(
      needMoreGamesMessage,
      "Should not show 'Need more games' for players with many games"
    ).toBe(false);
    expect(
      chartContainer || dataPoints > 0,
      "Chart should be visible with data points"
    ).toBe(true);
    expect(apiErrors.length, "No API errors should occur").toBe(0);
  });

  test("check player profile data fetching", async ({ page }) => {
    // Monitor network requests
    const apiCalls: { url: string; status: number; error?: string }[] = [];

    page.on("response", async response => {
      const url = response.url();
      if (url.includes("supabase") || url.includes("/api/")) {
        const status = response.status();
        let error: string | undefined;

        if (status >= 400) {
          try {
            const body = await response.text();
            error = body;
          } catch {
            error = "Could not read error body";
          }
        }

        apiCalls.push({ url, status, error });
      }
    });

    // Navigate to player profile
    await page.goto("http://localhost:3000/player/joseph");
    await page.waitForLoadState("networkidle");

    // Log all API calls
    console.log("API calls made:");
    apiCalls.forEach((call, index) => {
      console.log(
        `${index + 1}. ${call.url.split("?")[0]} - Status: ${call.status}`
      );
      if (call.error) {
        console.log(`   Error: ${call.error.substring(0, 200)}`);
      }
    });

    // Check for failed API calls
    const failedCalls = apiCalls.filter(call => call.status >= 400);

    if (failedCalls.length > 0) {
      console.log("\nFailed API calls:");
      failedCalls.forEach(call => {
        console.log(`- ${call.url}`);
        console.log(`  Error: ${call.error}`);
      });
    }

    // Check if key data endpoints were called
    const hasPlayerRatingCall = apiCalls.some(
      call => call.url.includes("cached_player_ratings") && call.status === 200
    );
    const hasGamesCall = apiCalls.some(
      call =>
        (call.url.includes("games") || call.url.includes("game_seats")) &&
        call.status === 200
    );

    console.log("\nKey endpoints called:");
    console.log("Player ratings endpoint:", hasPlayerRatingCall);
    console.log("Games endpoint:", hasGamesCall);

    // Assertions
    expect(failedCalls.length, "No API calls should fail").toBe(0);
    expect(
      hasPlayerRatingCall || hasGamesCall,
      "Should fetch player data"
    ).toBe(true);
  });
});
