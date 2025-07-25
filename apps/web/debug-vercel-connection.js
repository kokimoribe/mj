// Comprehensive debugging script for Vercel deployment testing
const { chromium } = require("playwright");

async function debugVercelConnection() {
  console.log("🔍 Starting comprehensive Vercel deployment debugging...\n");

  const browser = await chromium.launch({
    headless: false, // Show browser for visual debugging
    slowMo: 1000, // Slow down for observation
    args: [
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-dev-shm-usage",
      "--no-sandbox",
    ],
  });

  const context = await browser.newContext({
    // Use a realistic user agent
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    // Disable timeout for debugging
    timeout: 0,
  });

  const page = await context.newPage();

  // Comprehensive event logging
  page.on("console", msg =>
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`)
  );
  page.on("pageerror", error => console.error(`[PAGE ERROR] ${error}`));
  page.on("requestfailed", request =>
    console.error(
      `[REQUEST FAILED] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`
    )
  );
  page.on("response", response => {
    const status = response.status();
    const url = response.url();
    console.log(`[RESPONSE] ${status} ${url}`);
    if (status >= 400) {
      console.error(`[HTTP ERROR] ${status} ${url}`);
    }
  });

  try {
    console.log("📡 Step 1: Testing basic navigation...");
    const startTime = Date.now();

    const response = await page.goto("https://mj-web-psi.vercel.app/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const loadTime = Date.now() - startTime;
    console.log(`✅ Page loaded in ${loadTime}ms`);
    console.log(`📊 Response status: ${response.status()}`);

    // Check if we can see the page content
    console.log("\n🔍 Step 2: Analyzing page content...");
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Wait for React to be ready
    console.log("\n⚛️ Step 3: Waiting for React hydration...");
    try {
      await page.waitForFunction(
        () => {
          return window.__NEXT_DATA__ !== undefined;
        },
        { timeout: 10000 }
      );
      console.log("✅ Next.js data available");
    } catch (e) {
      console.log("⚠️ Next.js data not found");
    }

    // Check for loading states
    console.log("\n🔄 Step 4: Checking loading states...");
    const loadingVisible = await page.locator('text="Loading"').isVisible();
    console.log(`Loading indicator visible: ${loadingVisible}`);

    if (loadingVisible) {
      console.log("Waiting for loading to complete...");
      await page.waitForSelector('text="Loading"', {
        state: "hidden",
        timeout: 30000,
      });
      console.log("✅ Loading completed");
    }

    // Test specific elements that were failing
    console.log("\n🎯 Step 5: Testing specific selectors...");

    const selectors = [
      '[data-testid="leaderboard-header"]',
      '[data-testid*="player-card"]',
      'text="Riichi Mahjong League"',
      ".font-bold",
    ];

    for (const selector of selectors) {
      try {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 5000 });
        console.log(
          `${selector}: ${isVisible ? "✅ VISIBLE" : "❌ NOT VISIBLE"}`
        );

        if (isVisible) {
          const text = await element.textContent();
          console.log(`  Content: ${text?.substring(0, 50)}...`);
        }
      } catch (e) {
        console.log(`${selector}: ❌ ERROR - ${e.message.substring(0, 50)}`);
      }
    }

    // Test navigation to games page
    console.log("\n🎮 Step 6: Testing games page navigation...");
    await page.goto("https://mj-web-psi.vercel.app/games", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    const gamePageTitle = await page.title();
    console.log(`Games page title: ${gamePageTitle}`);

    // Look for game content
    const gameSelectors = [
      '[data-testid="game-card"]',
      "text=/📅/",
      "text=/pts/",
      ".border",
    ];

    for (const selector of gameSelectors) {
      try {
        const elements = await page.locator(selector).all();
        console.log(`${selector}: Found ${elements.length} elements`);
      } catch (e) {
        console.log(`${selector}: ERROR - ${e.message}`);
      }
    }

    // Take screenshots for visual debugging
    console.log("\n📸 Step 7: Taking screenshots...");
    await page.screenshot({
      path: "debug-vercel-homepage.png",
      fullPage: true,
    });
    await page.screenshot({ path: "debug-vercel-games.png", fullPage: true });

    console.log("\n✅ Debugging completed successfully!");
  } catch (error) {
    console.error("\n❌ Debugging failed:", error);

    // Try to capture as much info as possible
    try {
      const url = page.url();
      const title = await page.title();
      console.log(`Current URL: ${url}`);
      console.log(`Current title: ${title}`);

      await page.screenshot({ path: "debug-vercel-error.png", fullPage: true });
    } catch (e) {
      console.error("Could not capture error state:", e);
    }
  } finally {
    await browser.close();
  }
}

// Run the debug script
debugVercelConnection().catch(console.error);
