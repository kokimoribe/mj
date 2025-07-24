import { test, expect } from "@playwright/test";

test.describe("Production Issue Verification", () => {
  const PRODUCTION_URL = "https://mj-web-psi.vercel.app";

  test("verify all reported production issues", async ({ page }) => {
    console.log("=== PRODUCTION ISSUE VERIFICATION ===\n");

    // Track all console errors
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Check main leaderboard page
    console.log("1. Checking leaderboard page...");
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("networkidle");

    // Check if player data is rendered
    const playerCards = await page
      .locator('[data-testid*="player"], [class*="player"]')
      .count();
    console.log(`   - Player cards found: ${playerCards}`);

    // Check rating progression on leaderboard
    const miniCharts = await page
      .locator('.recharts-line, svg[class*="chart"]')
      .count();
    console.log(`   - Mini charts found: ${miniCharts}`);

    // Check for delta values
    const deltaValues = await page.locator("text=/[▲▼]\\d+\\.\\d+/").all();
    console.log(`   - Delta values found: ${deltaValues.length}`);

    // Check for any positive deltas with downward charts
    for (const delta of deltaValues) {
      const text = await delta.textContent();
      if (text?.includes("▲")) {
        console.log(`   - Found positive delta: ${text}`);
        // TODO: Check if corresponding chart shows downward trend
      }
    }

    // 2. Check player profile pages
    console.log("\n2. Checking player profile pages...");

    // Navigate to a player profile
    const firstPlayer = page
      .locator('[data-testid*="player"], [class*="player"]')
      .first();
    const playerName = await firstPlayer.textContent();
    console.log(`   - Navigating to first player: ${playerName}`);

    await firstPlayer.click();
    await page.waitForLoadState("networkidle");

    // Check if we're on a player profile page
    const profileUrl = page.url();
    console.log(`   - Profile URL: ${profileUrl}`);

    // Check for "Need more games" message
    const needMoreGames = await page
      .locator('text="Need more games for chart"')
      .isVisible();
    console.log(`   - Shows "Need more games": ${needMoreGames}`);

    // Check for rating chart
    const ratingChart = await page
      .locator('.recharts-responsive-container, [data-testid="rating-chart"]')
      .isVisible();
    console.log(`   - Rating chart visible: ${ratingChart}`);

    // Check performance stats
    const avgPlacement = await page
      .locator("text=/Average Placement:/")
      .isVisible();
    console.log(`   - Average placement visible: ${avgPlacement}`);

    // Check recent games
    const recentGamesSection = await page
      .locator('text="Recent Games"')
      .isVisible();
    console.log(`   - Recent games section visible: ${recentGamesSection}`);

    const gameEntries = await page
      .locator(
        '[class*="border"][class*="rounded"]:has(text=/\\d+(st|nd|rd|th)/)'
      )
      .count();
    console.log(`   - Game entries found: ${gameEntries}`);

    // 3. Check game history page
    console.log("\n3. Checking game history page...");
    await page.goto(`${PRODUCTION_URL}/games`);
    await page.waitForLoadState("networkidle");

    // Check for NaN values
    const nanValues = await page.locator("text=/NaN/").count();
    console.log(`   - NaN values found: ${nanValues}`);

    // Check for 0 pt deltas
    const zeroDeltas = await page.locator("text=/[+-]0 pts/").count();
    console.log(`   - Zero point deltas found: ${zeroDeltas}`);

    // Check for actual game data
    const gameCards = await page
      .locator('[class*="border"][class*="rounded"]:has(text=/📅/)')
      .count();
    console.log(`   - Game cards found: ${gameCards}`);

    // 4. Console errors summary
    console.log("\n4. Console errors found:");
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log("   - No console errors");
    }

    // Take screenshots for evidence
    await page.screenshot({
      path: "production-leaderboard.png",
      fullPage: true,
    });
    await page.goto(`${PRODUCTION_URL}/player/joseph`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: "production-player-profile.png",
      fullPage: true,
    });
    await page.goto(`${PRODUCTION_URL}/games`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: "production-game-history.png",
      fullPage: true,
    });

    console.log("\n=== VERIFICATION COMPLETE ===");
  });

  test("check API responses directly", async ({ page }) => {
    console.log("\n=== API RESPONSE VERIFICATION ===\n");

    const apiResponses: any[] = [];

    page.on("response", async response => {
      const url = response.url();
      if (url.includes("supabase.co")) {
        const status = response.status();
        const urlPath = new URL(url).pathname;

        try {
          const data = await response.json();
          apiResponses.push({
            path: urlPath,
            status,
            dataLength: Array.isArray(data) ? data.length : "object",
            sample: Array.isArray(data) ? data[0] : data,
          });
        } catch {
          apiResponses.push({
            path: urlPath,
            status,
            error: "Could not parse response",
          });
        }
      }
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("networkidle");

    console.log("API calls made:");
    apiResponses.forEach((resp, i) => {
      console.log(`\n${i + 1}. ${resp.path}`);
      console.log(`   Status: ${resp.status}`);
      console.log(`   Data: ${resp.dataLength} items`);
      if (resp.sample) {
        console.log(
          `   Sample:`,
          JSON.stringify(resp.sample, null, 2).substring(0, 200)
        );
      }
    });
  });
});
