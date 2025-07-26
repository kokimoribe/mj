// Fixed diagnostic script for rating issues
const { chromium } = require("playwright");

async function diagnoseRatingIssues() {
  console.log("🔍 Diagnosing rating display issues...\n");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log("👤 TESTING PLAYER PROFILE PAGE...");
    const playerId = "e0f959ee-eb77-57de-b3af-acdecf679e70";
    await page.goto(`https://rtmjp.vercel.app/player/${playerId}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: "player-profile-rating-chart-issue-detailed.png",
    });

    // Check for "need more games" message
    const needMoreGamesVisible = await page
      .locator('[data-testid="rating-chart"]')
      .textContent();
    console.log(`   Rating chart content: "${needMoreGamesVisible}"`);

    // Get specific game count from header
    const playerHeader = await page
      .locator('[data-testid="player-header"]')
      .textContent();
    console.log(`   Player header: ${playerHeader}`);

    // Check for recent games section
    const recentGamesSection = await page
      .locator('text="Recent Games"')
      .locator("..")
      .textContent();
    console.log(
      `   Recent games section: ${recentGamesSection.substring(0, 300)}...`
    );

    // Look for game entries in recent games
    const gameEntries = await page
      .locator('[data-testid^="game-entry-"]')
      .all();
    console.log(`   Found ${gameEntries.length} game entries in recent games`);

    if (gameEntries.length > 0) {
      const firstGameEntry = await gameEntries[0].textContent();
      console.log(`   First game entry: ${firstGameEntry}`);

      // Check for large numbers (uma/oka)
      const largeNumbers = firstGameEntry.match(/[+-]?\d{1,2},?\d{3}\s*pts/g);
      if (largeNumbers) {
        console.log(
          `   ❌ ISSUE CONFIRMED: Uma/oka values shown: ${largeNumbers}`
        );
      }

      // Check for NaN
      if (firstGameEntry.includes("NaN")) {
        console.log(`   ❌ ISSUE CONFIRMED: NaN values found`);
      }

      // Check for rating deltas (should be present)
      const ratingDeltas = firstGameEntry.match(/[↑↓±][0-9.]+/g);
      console.log(`   Rating deltas: ${ratingDeltas || "MISSING - ❌ ISSUE"}`);
    }

    console.log("\n🎮 TESTING GAME HISTORY PAGE...");
    await page.goto("https://rtmjp.vercel.app/games", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: "game-history-detailed-issue.png" });

    // Get first game card details
    const firstGameCard = page
      .locator('[data-testid="game-history-game-card"]')
      .first();
    const gameCardText = await firstGameCard.textContent();
    console.log(`   First game card: ${gameCardText}`);

    // Check each player result
    const playerResults = await firstGameCard
      .locator('[data-testid="player-result"]')
      .all();
    console.log(`   Found ${playerResults.length} player results:`);

    for (let i = 0; i < playerResults.length; i++) {
      const resultText = await playerResults[i].textContent();
      console.log(`     Player ${i + 1}: ${resultText}`);

      // Check for uma/oka values
      const hasUmaOka = resultText.match(/[+-]?\d{1,2},?\d{3}\s*pts/);
      if (hasUmaOka) {
        console.log(`       ❌ ISSUE: Uma/oka value: ${hasUmaOka[0]}`);
      }

      // Check for missing rating delta
      const hasRatingDelta = resultText.match(/[↑↓±][0-9.]+/);
      if (!hasRatingDelta) {
        console.log(`       ❌ ISSUE: Missing rating delta`);
      }
    }

    console.log("\n📊 TESTING LEADERBOARD RATING CHARTS...");
    await page.goto("https://rtmjp.vercel.app/", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(2000);

    // Click first player to expand
    const firstPlayerCard = page
      .locator('[data-testid^="player-card-"]')
      .first();
    const playerName = await firstPlayerCard.locator("h3").textContent();
    console.log(`   Testing chart for player: ${playerName}`);

    await firstPlayerCard.click();
    await page.waitForTimeout(2000);

    // Take screenshot of expanded card
    await page.screenshot({ path: "leaderboard-chart-data-issue.png" });

    // Check if chart is showing deltas vs accumulated ratings
    const chartExists = await page
      .locator(".recharts-responsive-container")
      .isVisible();
    console.log(`   Chart container visible: ${chartExists}`);

    if (chartExists) {
      // Try to examine chart data through DOM inspection
      const chartData = await page.evaluate(() => {
        const dots = Array.from(document.querySelectorAll(".recharts-dot"));
        return dots
          .map(dot => {
            const payload = dot.getAttribute("payload");
            return payload ? JSON.parse(payload) : null;
          })
          .filter(Boolean);
      });

      console.log(
        `   Chart data points: ${JSON.stringify(chartData.slice(0, 3))}...`
      );

      // Check if values look like deltas (small numbers) or accumulated ratings (larger)
      if (chartData.length > 0) {
        const values = chartData.map(d => d.rating || d.value || 0);
        const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
        console.log(`   Average chart value: ${avgValue}`);

        if (avgValue < 10) {
          console.log(
            `   ❌ ISSUE CONFIRMED: Chart showing deltas (${avgValue}) instead of accumulated ratings (~80)`
          );
        } else {
          console.log(`   ✅ Chart appears to show accumulated ratings`);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

diagnoseRatingIssues().catch(console.error);
