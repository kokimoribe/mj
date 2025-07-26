// Diagnose rating chart and game history display issues
const { chromium } = require("playwright");

async function diagnoseRatingIssues() {
  console.log("🔍 Diagnosing rating display issues...\n");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log("📊 1. TESTING LEADERBOARD RATING CHARTS...");
    await page.goto("https://rtmjp.vercel.app/", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    // Click on first player card to expand
    const firstPlayerCard = page
      .locator('[data-testid^="player-card-"]')
      .first();
    await firstPlayerCard.click();
    await page.waitForTimeout(2000);

    // Take screenshot of expanded card
    await page.screenshot({
      path: "leaderboard-expanded-card-rating-chart.png",
    });

    // Look for chart data
    const chartElements = await page
      .locator(".recharts-line, .recharts-area, svg")
      .all();
    console.log(`   Found ${chartElements.length} chart elements`);

    // Check if chart shows accumulated ratings or deltas
    const chartData = await page.evaluate(() => {
      const chartContainer = document.querySelector(
        ".recharts-responsive-container"
      );
      if (chartContainer) {
        // Try to extract data points if visible
        const dataPoints = Array.from(
          document.querySelectorAll(".recharts-dot")
        ).map(dot => ({
          value: dot.getAttribute("payload") || dot.textContent,
          position: { x: dot.getAttribute("cx"), y: dot.getAttribute("cy") },
        }));
        return {
          hasChart: true,
          dataPoints: dataPoints.length,
          containerText: chartContainer.textContent,
        };
      }
      return { hasChart: false };
    });

    console.log(`   Chart analysis:`, chartData);

    console.log("\n👤 2. TESTING PLAYER PROFILE PAGE...");
    const playerId = "e0f959ee-eb77-57de-b3af-acdecf679e70";
    await page.goto(`https://rtmjp.vercel.app/player/${playerId}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: "player-profile-rating-chart-issue.png" });

    // Check for "need more games" message
    const needMoreGamesVisible = await page
      .locator("text=/need more games/i")
      .isVisible();
    console.log(
      `   "Need more games" message visible: ${needMoreGamesVisible}`
    );

    // Check game count
    const gameCountText = await page.locator("text=/ games/").textContent();
    console.log(`   Game count text: ${gameCountText}`);

    // Look for chart elements
    const profileChartElements = await page
      .locator('.recharts-responsive-container, [class*="chart"]')
      .all();
    console.log(`   Chart elements found: ${profileChartElements.length}`);

    // Check rating progression section
    const ratingSection = await page
      .locator('text="Rating Progression"')
      .isVisible();
    console.log(`   Rating Progression section visible: ${ratingSection}`);

    console.log("\n🎮 3. TESTING GAME HISTORY DISPLAY...");
    await page.goto("https://rtmjp.vercel.app/games", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: "game-history-uma-oka-issue.png" });

    // Get first few game cards
    const gameCards = await page
      .locator('[data-testid="game-history-game-card"]')
      .all();
    console.log(`   Found ${gameCards.length} game cards`);

    if (gameCards.length > 0) {
      const firstGameText = await gameCards[0].textContent();
      console.log(`   First game text: ${firstGameText}`);

      // Check for uma/oka values
      const hasLargeNumbers = firstGameText.match(/[+-]?\d{1,2},?\d{3}\s*pts/g);
      if (hasLargeNumbers) {
        console.log(
          `   ❌ ISSUE: Found large point values (uma/oka): ${hasLargeNumbers}`
        );
      }

      // Check for NaN values
      const hasNaN = firstGameText.includes("NaN");
      console.log(`   Contains NaN: ${hasNaN ? "❌ YES" : "✅ NO"}`);

      // Check for rating deltas (should have these)
      const ratingDeltas = firstGameText.match(/[↑↓±][0-9.]+/g);
      console.log(
        `   Rating deltas found: ${ratingDeltas ? ratingDeltas : "NONE - ❌ ISSUE"}`
      );

      // Check each player result in the first game
      const playerResults = await page
        .locator('[data-testid="game-history-game-card"]')
        .first()
        .locator('[data-testid="player-result"]')
        .all();

      for (let i = 0; i < Math.min(playerResults.length, 4); i++) {
        const resultText = await playerResults[i].textContent();
        console.log(`   Player ${i + 1} result: ${resultText}`);
      }
    }

    console.log("\n🔍 4. CHECKING SPECIFIC PLAYER GAMES...");
    await page.goto(`https://rtmjp.vercel.app/player/${playerId}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    // Look for recent games section
    const recentGamesVisible = await page
      .locator('text="Recent Games"')
      .isVisible();
    console.log(`   Recent Games section visible: ${recentGamesVisible}`);

    if (recentGamesVisible) {
      const recentGamesText = await page
        .locator('text="Recent Games"')
        .locator("..")
        .textContent();
      console.log(
        `   Recent games content: ${recentGamesText.substring(0, 200)}...`
      );

      // Check for large point values in recent games
      const hasLargeNumbersInProfile = recentGamesText.match(
        /[+-]?\d{1,2},?\d{3}\s*pts/g
      );
      if (hasLargeNumbersInProfile) {
        console.log(
          `   ❌ ISSUE: Found large point values in profile: ${hasLargeNumbersInProfile}`
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

diagnoseRatingIssues().catch(console.error);
