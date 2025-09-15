import { test, expect } from "@playwright/test";

test.describe("Production Rating Delta Verification", () => {
  test("verify rating deltas are consistent and accurate", async ({ page }) => {
    const PRODUCTION_URL = "https://rtmjp.vercel.app";

    // Navigate to production site
    await page.goto(PRODUCTION_URL, { waitUntil: "networkidle" });
    console.log("✅ Successfully accessed production at:", PRODUCTION_URL);

    // Take screenshot of leaderboard
    await page.screenshot({
      path: "production-verify-leaderboard.png",
      fullPage: true,
    });

    // Wait for and click on first player
    await page.waitForSelector('[data-testid="player-link"]', {
      timeout: 15000,
    });
    const firstPlayerName = await page
      .locator('[data-testid="player-link"]')
      .first()
      .textContent();
    console.log(`\n=== Checking player: ${firstPlayerName} ===`);

    await page.click('[data-testid="player-link"]:first-of-type');

    // Wait for player profile to load
    await page.waitForSelector('[data-testid="rating-chart"]', {
      timeout: 15000,
    });
    await page.waitForTimeout(2000); // Let chart fully render

    // Take screenshot of player profile
    await page.screenshot({
      path: "production-verify-player-profile.png",
      fullPage: true,
    });

    // 1. Get rating deltas from Recent Games
    console.log("\n=== Recent Games Rating Deltas ===");
    const gameEntries = await page.locator('[data-testid="game-entry"]').all();
    const recentGamesDeltas = [];

    for (let i = 0; i < Math.min(gameEntries.length, 5); i++) {
      const gameText = await gameEntries[i].textContent();
      console.log(`Game ${i + 1}: ${gameText}`);

      const deltaMatch = gameText?.match(/([↑↓])([\d.]+)/);
      if (deltaMatch) {
        const arrow = deltaMatch[1];
        const value = parseFloat(deltaMatch[2]);
        const delta = arrow === "↑" ? value : -value;
        recentGamesDeltas.push({ index: i, delta, text: gameText });
      }
    }

    // 2. Check Chart Tooltip Values
    console.log("\n=== Chart Tooltip Verification ===");
    const chartDots = await page.locator(".recharts-dot").all();
    console.log(`Found ${chartDots.length} data points in chart`);

    // Get the last few points to match with recent games
    const tooltipDeltas = [];
    const numToCheck = Math.min(5, chartDots.length);
    const startIdx = Math.max(0, chartDots.length - numToCheck);

    for (let i = startIdx; i < chartDots.length; i++) {
      await chartDots[i].hover({ force: true });
      await page.waitForTimeout(500);

      const tooltip = page.locator(".recharts-tooltip-wrapper").first();
      const isVisible = await tooltip.isVisible();

      if (isVisible) {
        const tooltipText = await tooltip.textContent();
        const ratingMatch = tooltipText?.match(/Rating:\s*([\d.]+)/);
        const changeMatch = tooltipText?.match(/Change:([+-]?[\d.]+)/);

        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
        const change = changeMatch ? parseFloat(changeMatch[1]) : null;

        console.log(
          `Point ${i - startIdx + 1}: Rating=${rating}, Change=${change}`
        );
        tooltipDeltas.push({ rating, change });

        // Take screenshot of tooltip
        await page.screenshot({
          path: `production-tooltip-${i - startIdx + 1}.png`,
          clip: { x: 0, y: 0, width: 1200, height: 600 },
        });
      }
    }

    // 3. Manual Calculation Verification
    console.log("\n=== Manual Delta Calculation ===");
    console.log(
      "Verifying that displayed change = current rating - previous rating"
    );

    for (let i = 1; i < tooltipDeltas.length; i++) {
      const prev = tooltipDeltas[i - 1];
      const curr = tooltipDeltas[i];

      if (prev.rating !== null && curr.rating !== null) {
        const calculatedDelta = curr.rating - prev.rating;
        const displayedDelta = curr.change || 0;
        const difference = Math.abs(calculatedDelta - displayedDelta);

        console.log(`\nGame ${i}:`);
        console.log(`  Previous rating: ${prev.rating.toFixed(1)}`);
        console.log(`  Current rating: ${curr.rating.toFixed(1)}`);
        console.log(`  Calculated delta: ${calculatedDelta.toFixed(1)}`);
        console.log(`  Displayed delta: ${displayedDelta.toFixed(1)}`);
        console.log(`  Difference: ${difference.toFixed(2)}`);
        console.log(
          `  Match: ${difference < 0.1 ? "✅ YES" : "❌ NO - MISMATCH!"}`
        );

        // Assert they match within tolerance
        expect(difference).toBeLessThan(0.1);
      }
    }

    // 4. Compare with Recent Games
    console.log("\n=== Comparing Chart vs Recent Games ===");
    // The most recent games should match the last points in the chart
    // Note: Chart is in chronological order, recent games are in reverse chronological

    const reversedTooltipDeltas = [...tooltipDeltas].reverse();
    for (
      let i = 0;
      i < Math.min(recentGamesDeltas.length, reversedTooltipDeltas.length);
      i++
    ) {
      const gamesDelta = recentGamesDeltas[i].delta;
      const chartDelta = reversedTooltipDeltas[i].change;

      console.log(`\nGame ${i + 1}:`);
      console.log(
        `  Recent Games shows: ${gamesDelta > 0 ? "↑" : "↓"}${Math.abs(gamesDelta).toFixed(1)}`
      );
      console.log(`  Chart tooltip shows: ${chartDelta?.toFixed(1) || "N/A"}`);

      if (chartDelta !== null) {
        const match = Math.abs(gamesDelta - chartDelta) < 0.1;
        console.log(`  Match: ${match ? "✅ YES" : "❌ NO - INCONSISTENCY!"}`);

        // Assert consistency
        expect(Math.abs(gamesDelta - chartDelta)).toBeLessThan(0.1);
      }
    }

    // 5. Check Game History Page
    console.log("\n=== Game History Page Check ===");
    await page.goto(`${PRODUCTION_URL}/games`);
    await page.waitForSelector('[data-testid="game-card"]', { timeout: 15000 });

    // Take screenshot
    await page.screenshot({
      path: "production-verify-game-history.png",
      fullPage: true,
    });

    // Summary
    console.log("\n=== VERIFICATION COMPLETE ===");
    console.log(
      "Check the console output above for any mismatches or inconsistencies."
    );
    console.log("Screenshots saved for manual inspection.");
  });
});
