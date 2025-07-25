// Diagnose the routing issue discovered in screenshots
const { chromium } = require("playwright");

async function diagnoseRoutingIssue() {
  console.log("🔍 Diagnosing routing and DOM structure issues...\n");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Test both routes
    const routes = [
      { url: "https://mj-web-psi.vercel.app/", name: "Homepage" },
      { url: "https://mj-web-psi.vercel.app/games", name: "Games Page" },
    ];

    for (const route of routes) {
      console.log(`\n📍 Testing ${route.name}: ${route.url}`);

      await page.goto(route.url, { waitUntil: "networkidle" });
      await page.waitForTimeout(3000);

      // Check page title and URL
      console.log(`   Final URL: ${page.url()}`);
      console.log(`   Page title: ${await page.title()}`);

      // Check what components are rendered
      const components = await page.evaluate(() => {
        const selectors = [
          "h1, h2, h3",
          "[data-testid]",
          ".border",
          "main > div",
          '[class*="card"]',
        ];

        const results = {};
        selectors.forEach(selector => {
          const elements = Array.from(document.querySelectorAll(selector));
          results[selector] = elements.map(el => ({
            tag: el.tagName,
            text: el.textContent?.substring(0, 50),
            classes: el.className,
            testId: el.getAttribute("data-testid"),
          }));
        });

        return results;
      });

      console.log(`   Headings found: ${components["h1, h2, h3"].length}`);
      components["h1, h2, h3"].forEach(h =>
        console.log(`     ${h.tag}: ${h.text}`)
      );

      console.log(
        `   data-testid elements: ${components["[data-testid]"].length}`
      );
      components["[data-testid]"].forEach(el =>
        console.log(`     ${el.testId}: ${el.text}`)
      );

      console.log(
        `   Border elements (game cards): ${components[".border"].length}`
      );

      // Check if this is actually the games page or homepage
      const pageContent = await page.textContent("body");
      const hasLeaderboard =
        pageContent.includes("Leaderboard") || pageContent.includes("Rankings");
      const hasGameHistory = pageContent.includes("Game History");

      console.log(`   Contains Leaderboard content: ${hasLeaderboard}`);
      console.log(`   Contains Game History content: ${hasGameHistory}`);

      // Check routing state
      const routingInfo = await page.evaluate(() => ({
        pathname: window.location.pathname,
        href: window.location.href,
        nextRouter: window.__NEXT_DATA__?.page || "unknown",
      }));

      console.log(`   Routing info:`, routingInfo);
    }

    // Check specific DOM structure for game cards
    console.log("\n🎯 Analyzing game card DOM structure...");
    await page.goto("https://mj-web-psi.vercel.app/games", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(3000);

    const gameCardStructure = await page.evaluate(() => {
      // Look for elements that look like game cards
      const borderElements = Array.from(document.querySelectorAll(".border"));
      const gameCards = borderElements.filter(
        el => el.textContent?.includes("pts") && el.textContent?.includes("📅")
      );

      if (gameCards.length > 0) {
        const firstCard = gameCards[0];
        return {
          totalCards: gameCards.length,
          firstCardHTML: firstCard.outerHTML.substring(0, 500),
          firstCardText: firstCard.textContent?.substring(0, 200),
          hasTestId: firstCard.hasAttribute("data-testid"),
          testIdValue: firstCard.getAttribute("data-testid"),
          parentClasses: firstCard.parentElement?.className,
          attributes: Array.from(firstCard.attributes).map(
            attr => `${attr.name}="${attr.value}"`
          ),
        };
      }

      return { totalCards: 0 };
    });

    console.log("Game card analysis:", gameCardStructure);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

diagnoseRoutingIssue().catch(console.error);
