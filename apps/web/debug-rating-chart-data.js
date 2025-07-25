// Debug why rating chart shows "Need more games" for players with 87 games
const { chromium } = require("playwright");

async function debugRatingChartData() {
  console.log("🔍 Debugging rating chart data issues...\n");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const playerId = "e0f959ee-eb77-57de-b3af-acdecf679e70";
    console.log(`Testing player: ${playerId}`);

    // Navigate to player profile
    await page.goto(`https://mj-web-psi.vercel.app/player/${playerId}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    // Get game count from header
    const playerInfo = await page.evaluate(() => {
      const header = document.querySelector("h2");
      return header ? header.textContent : "Header not found";
    });
    console.log(`Player header: ${playerInfo}`);

    // Check rating chart content
    const chartContent = await page
      .locator('[data-testid="rating-chart"]')
      .textContent();
    console.log(`Rating chart shows: "${chartContent}"`);

    // Intercept API calls to see what data is returned
    const apiCalls = [];
    page.on("response", response => {
      if (
        response.url().includes("/api/") ||
        response.url().includes("supabase")
      ) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    // Refresh to capture API calls
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    console.log("\nAPI calls made:");
    apiCalls.forEach(call => {
      console.log(`  ${call.method} ${call.url} - ${call.status}`);
    });

    // Try to get the actual data from the page's JavaScript context
    const ratingData = await page.evaluate(playerId => {
      // Try to access React DevTools or any exposed data
      const reactFiber =
        document.querySelector('[data-testid="rating-chart"]')
          ?._reactInternalFiber ||
        document.querySelector('[data-testid="rating-chart"]')?._reactInternals;

      if (reactFiber) {
        // Walk up the fiber tree to find the component with data
        let current = reactFiber;
        while (current) {
          if (current.memoizedProps?.data) {
            return {
              source: "React fiber",
              dataPoints: current.memoizedProps.data.length,
              sampleData: current.memoizedProps.data.slice(0, 3),
            };
          }
          current = current.return;
        }
      }

      // Alternative: check if window has any exposed data
      if (window.__NEXT_DATA__) {
        return {
          source: "Next.js data",
          hasData: !!window.__NEXT_DATA__.props,
          pageProps: Object.keys(window.__NEXT_DATA__.props || {}),
        };
      }

      return { source: "none", message: "No data found" };
    }, playerId);

    console.log("\nRating data analysis:", ratingData);

    // Check network tab for actual API response
    const networkData = await page.evaluate(() => {
      // Check if there are any fetch requests we can inspect
      const performanceTiming = performance.getEntriesByType("navigation");
      const resourceTiming = performance.getEntriesByType("resource");

      return {
        navigation: performanceTiming.length,
        resources: resourceTiming
          .filter(r => r.name.includes("api") || r.name.includes("supabase"))
          .map(r => ({
            name: r.name,
            duration: r.duration,
            size: r.transferSize,
          })),
      };
    });

    console.log("\nNetwork performance data:", networkData);

    // Test direct API call to see raw data
    console.log("\n🌐 Testing direct API calls...");

    // Try the player API endpoint
    try {
      const playerResponse = await page.evaluate(async playerId => {
        const response = await fetch(`/api/players/${playerId}`);
        if (response.ok) {
          const data = await response.json();
          return {
            status: "success",
            gamesPlayed: data.gamesPlayed || "unknown",
            hasRatingHistory: !!data.ratingHistory,
            ratingHistoryLength: data.ratingHistory?.length || 0,
          };
        }
        return { status: "error", error: response.statusText };
      }, playerId);

      console.log("Player API response:", playerResponse);
    } catch (error) {
      console.log("Player API error:", error.message);
    }

    // Try the games API endpoint
    try {
      const gamesResponse = await page.evaluate(async playerId => {
        const response = await fetch(
          `/api/games?playerId=${playerId}&limit=100`
        );
        if (response.ok) {
          const data = await response.json();
          return {
            status: "success",
            totalGames: data.games?.length || 0,
            hasValidRatings:
              data.games?.some(g =>
                g.results?.some(
                  r =>
                    r.playerId === playerId &&
                    isFinite(r.ratingAfter) &&
                    !isNaN(r.ratingAfter)
                )
              ) || false,
            sampleResults:
              data.games?.slice(0, 2).map(g => ({
                gameId: g.id,
                date: g.date,
                playerResult: g.results?.find(r => r.playerId === playerId),
              })) || [],
          };
        }
        return { status: "error", error: response.statusText };
      }, playerId);

      console.log("Games API response:", gamesResponse);
    } catch (error) {
      console.log("Games API error:", error.message);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

debugRatingChartData().catch(console.error);
