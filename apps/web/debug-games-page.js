const { chromium } = require("playwright");

(async () => {
  console.log("Starting games page debug...\n");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on("console", msg => {
    console.log(`[Console ${msg.type()}]: ${msg.text()}`);
  });

  // Log page errors
  page.on("pageerror", error => {
    console.error("[Page Error]:", error.message);
  });

  // Log failed requests
  page.on("requestfailed", request => {
    console.error(
      "[Request Failed]:",
      request.url(),
      request.failure()?.errorText
    );
  });

  try {
    console.log("1. Navigating to http://localhost:3000/games...");
    const response = await page.goto("http://localhost:3000/games", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    console.log(`   Response status: ${response?.status()}\n`);

    // Take screenshot
    console.log("2. Taking screenshot...");
    await page.screenshot({
      path: "debug-games-page.png",
      fullPage: true,
    });
    console.log("   Screenshot saved as debug-games-page.png\n");

    // Check for loading states
    console.log("3. Checking for loading indicators...");
    const loadingIndicators = await page.$$(
      '[data-testid*="loading"], .loading, .spinner, [class*="loading"], [class*="spinner"]'
    );
    console.log(`   Found ${loadingIndicators.length} loading indicators\n`);

    // Check for game history view
    console.log("4. Checking for game-history-view...");
    const gameHistoryView = await page.$('[data-testid="game-history-view"]');
    console.log(`   game-history-view found: ${gameHistoryView !== null}\n`);

    // Check for any visible text content
    console.log("5. Checking visible text content...");
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("   Visible text on page:");
    console.log("   ---");
    console.log(
      bodyText
        .split("\n")
        .map(line => `   ${line}`)
        .join("\n")
    );
    console.log("   ---\n");

    // Get page HTML structure (simplified)
    console.log("6. Page HTML structure:");
    const htmlStructure = await page.evaluate(() => {
      function getStructure(element, depth = 0) {
        if (depth > 5) return "";

        const indent = "  ".repeat(depth);
        let result = `${indent}<${element.tagName.toLowerCase()}`;

        // Add important attributes
        if (element.id) result += ` id="${element.id}"`;
        if (element.className) result += ` class="${element.className}"`;
        if (element.getAttribute("data-testid")) {
          result += ` data-testid="${element.getAttribute("data-testid")}"`;
        }
        result += ">\n";

        // Add text content if it's a leaf node
        if (element.children.length === 0 && element.textContent?.trim()) {
          result += `${indent}  ${element.textContent.trim()}\n`;
        }

        // Recursively process children
        for (const child of element.children) {
          result += getStructure(child, depth + 1);
        }

        result += `${indent}</${element.tagName.toLowerCase()}>\n`;
        return result;
      }

      return getStructure(document.body);
    });
    console.log(htmlStructure);

    // Check for specific game components
    console.log("\n7. Checking for game-related components...");
    const components = [
      "game-history-view",
      "game-list",
      "game-item",
      "games-container",
      "games-page",
    ];

    for (const component of components) {
      const found = await page.$(`[data-testid="${component}"]`);
      console.log(
        `   [data-testid="${component}"]: ${found ? "FOUND" : "NOT FOUND"}`
      );
    }

    // Check for error messages
    console.log("\n8. Checking for error messages...");
    const errorElements = await page.$$(
      '[class*="error"], [data-testid*="error"], .alert-error'
    );
    console.log(`   Found ${errorElements.length} error elements`);

    if (errorElements.length > 0) {
      for (const errorEl of errorElements) {
        const text = await errorEl.textContent();
        console.log(`   Error: ${text}`);
      }
    }

    // Wait a bit to see if anything loads
    console.log("\n9. Waiting 5 seconds to see if content loads...");
    await page.waitForTimeout(5000);

    // Check again for game history view
    const gameHistoryViewAfterWait = await page.$(
      '[data-testid="game-history-view"]'
    );
    console.log(
      `   game-history-view after wait: ${gameHistoryViewAfterWait !== null}`
    );

    // Final screenshot
    await page.screenshot({
      path: "debug-games-page-after-wait.png",
      fullPage: true,
    });
    console.log(
      "   Final screenshot saved as debug-games-page-after-wait.png\n"
    );
  } catch (error) {
    console.error("Debug script error:", error);
  } finally {
    console.log("Debug complete. Browser will remain open for 10 seconds...");
    await page.waitForTimeout(10000);
    await browser.close();
  }
})();
