// Debug script to check what values are being displayed in rating charts
const { chromium } = require("playwright");

async function debugChartValues() {
  console.log("🔍 Debugging rating chart values on production...\n");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Enable console logging
  page.on("console", msg => {
    if (msg.text().includes("Chart") || msg.text().includes("rating")) {
      console.log(`[Browser Console] ${msg.text()}`);
    }
  });

  try {
    // Test 1: Player Profile Chart
    console.log("📊 1. CHECKING PLAYER PROFILE RATING CHART...");
    const playerId = "e0f959ee-eb77-57de-b3af-acdecf679e70"; // Mikey with 87 games

    await page.goto(`https://mj-web-psi.vercel.app/player/${playerId}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    // Get player's current rating from header
    const headerText = await page.locator("h2").textContent();
    console.log(`Player info: ${headerText}`);
    const currentRatingMatch = headerText.match(/Rating:\s*([\d.]+)/);
    const currentRating = currentRatingMatch
      ? parseFloat(currentRatingMatch[1])
      : null;
    console.log(`Current rating from header: ${currentRating}`);

    // Check if chart is visible
    const chartVisible = await page
      .locator(".recharts-responsive-container")
      .isVisible();
    console.log(`Chart visible: ${chartVisible}`);

    if (chartVisible) {
      // Try to extract chart data points
      const chartData = await page.evaluate(() => {
        // Look for SVG dots (data points)
        const dots = Array.from(document.querySelectorAll(".recharts-dot"));
        console.log(`Found ${dots.length} chart dots`);

        // Try to get Y-axis values
        const yAxisTicks = Array.from(
          document.querySelectorAll(".recharts-yAxis .recharts-text")
        ).map(el => el.textContent);

        // Get the last dot's position to estimate its value
        let lastDotValue = null;
        if (dots.length > 0) {
          const lastDot = dots[dots.length - 1];
          const cy = parseFloat(lastDot.getAttribute("cy") || "0");
          const svgHeight = lastDot.closest("svg")?.getAttribute("height");
          console.log(`Last dot cy: ${cy}, SVG height: ${svgHeight}`);
        }

        return {
          dotCount: dots.length,
          yAxisValues: yAxisTicks,
          chartHeight: document.querySelector(".recharts-responsive-container")
            ?.clientHeight,
        };
      });

      console.log("Chart data:", chartData);

      // Check Y-axis range
      if (chartData.yAxisValues.length > 0) {
        const yValues = chartData.yAxisValues
          .map(v => parseFloat(v))
          .filter(v => !isNaN(v));
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        console.log(`Y-axis range: ${minY} to ${maxY}`);

        // Check if these look like accumulated ratings (50-100 range) or deltas (-5 to +5 range)
        if (maxY < 20) {
          console.log(
            "❌ ISSUE CONFIRMED: Y-axis values look like deltas, not accumulated ratings!"
          );
        } else {
          console.log("✅ Y-axis values appear to be accumulated ratings");
        }
      }
    }

    // Test 2: Leaderboard Mini Charts
    console.log("\n📊 2. CHECKING LEADERBOARD MINI CHARTS...");
    await page.goto("https://mj-web-psi.vercel.app/", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(2000);

    // Click on first player to expand
    const firstPlayerCard = page
      .locator('[data-testid^="player-card-"]')
      .first();
    const playerCardText = await firstPlayerCard.textContent();
    console.log(`First player card: ${playerCardText}`);

    // Extract player's current rating
    const ratingMatch = playerCardText.match(/(\d+\.?\d*)/);
    const playerRating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
    console.log(`Player's current rating: ${playerRating}`);

    await firstPlayerCard.click();
    await page.waitForTimeout(2000);

    // Check if mini chart appears
    const miniChartVisible = await page
      .locator(".recharts-responsive-container")
      .isVisible();
    console.log(`Mini chart visible: ${miniChartVisible}`);

    if (miniChartVisible) {
      // Similar analysis for mini chart
      const miniChartData = await page.evaluate(() => {
        const yAxisTicks = Array.from(
          document.querySelectorAll(".recharts-yAxis .recharts-text")
        ).map(el => el.textContent);

        return {
          yAxisValues: yAxisTicks,
        };
      });

      console.log("Mini chart Y-axis values:", miniChartData.yAxisValues);

      if (miniChartData.yAxisValues.length > 0) {
        const yValues = miniChartData.yAxisValues
          .map(v => parseFloat(v))
          .filter(v => !isNaN(v));
        const maxY = Math.max(...yValues);

        if (maxY < 20) {
          console.log(
            "❌ ISSUE CONFIRMED: Mini chart showing deltas, not accumulated ratings!"
          );
        }
      }
    }

    // Test 3: Game History Rating Deltas
    console.log("\n🎮 3. CHECKING GAME HISTORY RATING DELTAS...");
    await page.goto("https://mj-web-psi.vercel.app/games", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    // Get first few game cards
    const gameCards = await page
      .locator('[data-testid="game-history-game-card"]')
      .all();
    console.log(`Found ${gameCards.length} game cards`);

    for (let i = 0; i < Math.min(3, gameCards.length); i++) {
      const gameText = await gameCards[i].textContent();
      console.log(`\nGame ${i + 1}: ${gameText}`);

      // Check for rating deltas (should have ↑/↓ symbols)
      const hasRatingDelta = gameText.match(/[↑↓]\d+\.\d+/);
      if (!hasRatingDelta) {
        console.log("❌ ISSUE: No rating delta found in game card!");

        // Check each player result
        const playerResults = await gameCards[i]
          .locator('[data-testid="player-result"]')
          .all();
        for (let j = 0; j < playerResults.length; j++) {
          const resultText = await playerResults[j].textContent();
          console.log(`  Player ${j + 1}: ${resultText}`);
          if (!resultText.match(/[↑↓]\d+\.\d+/)) {
            console.log(`    ❌ Missing rating delta for player ${j + 1}`);
          }
        }
      } else {
        console.log("✅ Found rating delta:", hasRatingDelta[0]);
      }
    }

    // Take screenshots for visual inspection
    console.log("\n📸 Taking screenshots for inspection...");
    await page.goto(`https://mj-web-psi.vercel.app/player/${playerId}`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "debug-player-chart.png", fullPage: true });

    await page.goto("https://mj-web-psi.vercel.app/");
    await page.waitForTimeout(2000);
    await page.locator('[data-testid^="player-card-"]').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: "debug-leaderboard-chart.png",
      fullPage: true,
    });

    await page.goto("https://mj-web-psi.vercel.app/games");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "debug-game-history.png", fullPage: true });

    console.log("\n✅ Screenshots saved for inspection");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

debugChartValues().catch(console.error);
