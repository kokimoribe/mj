const { chromium } = require("playwright");

(async () => {
  console.log("Starting Supabase query debug...\n");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging with more detail
  page.on("console", async msg => {
    const args = await Promise.all(
      msg.args().map(arg => arg.jsonValue().catch(() => arg.toString()))
    );
    console.log(`[Console ${msg.type()}]:`, ...args);
  });

  // Log page errors
  page.on("pageerror", error => {
    console.error("[Page Error]:", error.message);
    console.error(error.stack);
  });

  // Log network requests
  page.on("request", request => {
    if (request.url().includes("supabase")) {
      console.log(`[Supabase Request]: ${request.method()} ${request.url()}`);
    }
  });

  // Log network responses
  page.on("response", response => {
    if (response.url().includes("supabase")) {
      console.log(
        `[Supabase Response]: ${response.status()} ${response.url()}`
      );
    }
  });

  // Log failed requests
  page.on("requestfailed", request => {
    if (request.url().includes("supabase")) {
      console.error(
        "[Supabase Request Failed]:",
        request.url(),
        request.failure()?.errorText
      );
    }
  });

  try {
    // Add some debug logging to the page
    await page.addInitScript(() => {
      // Override fetch to log Supabase requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const [url, options] = args;
        if (typeof url === "string" && url.includes("supabase")) {
          console.log("Supabase fetch:", url, options);
        }
        try {
          const response = await originalFetch(...args);
          if (typeof url === "string" && url.includes("supabase")) {
            const clonedResponse = response.clone();
            try {
              const data = await clonedResponse.json();
              console.log("Supabase response:", response.status, data);
            } catch (e) {
              console.log("Supabase response (non-JSON):", response.status);
            }
          }
          return response;
        } catch (error) {
          console.error("Fetch error:", error);
          throw error;
        }
      };

      // Log React Query state changes
      if (window.__REACT_QUERY_DEVTOOLS_GLOBAL_STORE__) {
        console.log("React Query DevTools found");
      }
    });

    console.log("1. Navigating to http://localhost:3000/games...");
    await page.goto("http://localhost:3000/games", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait a bit for queries to execute
    console.log("\n2. Waiting for queries to execute...");
    await page.waitForTimeout(3000);

    // Check React Query state
    console.log("\n3. Checking React Query state...");
    const queryState = await page.evaluate(() => {
      // Try to access React Query state
      const queryClient = window.__REACT_QUERY_STATE__;
      if (queryClient) {
        return "React Query state found";
      }

      // Check for any global React Query references
      const globals = Object.keys(window).filter(key => key.includes("QUERY"));
      return { globals };
    });
    console.log("Query state:", queryState);

    // Check for loading indicators
    console.log("\n4. Checking page state...");
    const pageState = await page.evaluate(() => {
      const gameHistoryView = document.querySelector(
        '[data-testid="game-history-view"]'
      );
      const skeletons = document.querySelectorAll('[data-testid="skeleton"]');
      const errorAlerts = document.querySelectorAll(".alert-destructive");

      return {
        hasGameHistoryView: !!gameHistoryView,
        skeletonCount: skeletons.length,
        hasErrors: errorAlerts.length > 0,
        bodyText: document.body.innerText.substring(0, 500),
      };
    });
    console.log("Page state:", JSON.stringify(pageState, null, 2));

    // Take screenshot
    await page.screenshot({
      path: "debug-supabase-query.png",
      fullPage: true,
    });
    console.log("\nScreenshot saved as debug-supabase-query.png");

    // Wait a bit more to see if anything changes
    console.log("\n5. Waiting 5 more seconds...");
    await page.waitForTimeout(5000);

    // Final check
    const finalState = await page.evaluate(() => {
      const gameHistoryView = document.querySelector(
        '[data-testid="game-history-view"]'
      );
      return !!gameHistoryView;
    });
    console.log("Final state - game history view present:", finalState);
  } catch (error) {
    console.error("Debug script error:", error);
  } finally {
    console.log("\nDebug complete. Browser will remain open for 10 seconds...");
    await page.waitForTimeout(10000);
    await browser.close();
  }
})();
