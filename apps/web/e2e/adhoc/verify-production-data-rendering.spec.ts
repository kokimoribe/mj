import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://mj-web-psi.vercel.app";

test.describe("Production Site Data Rendering Issues", () => {
  test.use({ viewport: { width: 1200, height: 800 } }); // Desktop viewport

  test("verify data is rendered on production site", async ({ page }) => {
    console.log("Navigating to production site...");
    await page.goto(PRODUCTION_URL);

    // Wait for potential loading states
    await page.waitForTimeout(5000);

    // Check if the page loads without errors
    const pageTitle = await page.title();
    console.log("Page title:", pageTitle);

    // Check for any console errors
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Take screenshot for visual inspection
    await page.screenshot({
      path: "test-results/production-initial-state.png",
      fullPage: true,
    });

    // Check if leaderboard view is present
    const leaderboardView = page.locator('[data-testid="leaderboard-view"]');
    const hasLeaderboard = (await leaderboardView.count()) > 0;
    console.log("Has leaderboard view:", hasLeaderboard);

    // Check for loading skeleton
    const skeleton = page.locator('.skeleton, [class*="skeleton"]');
    const hasSkeletons = (await skeleton.count()) > 0;
    console.log("Has loading skeletons:", hasSkeletons);

    // Check for error alerts
    const errorAlert = page.locator('[role="alert"], .alert-destructive');
    const hasErrors = (await errorAlert.count()) > 0;
    if (hasErrors) {
      const errorText = await errorAlert.textContent();
      console.log("Error alert found:", errorText);
    }

    // Check for player cards (actual data)
    const playerCards = page.locator('[data-testid*="player-card"]');
    const cardCount = await playerCards.count();
    console.log("Player cards found:", cardCount);

    // Check leaderboard header for game count
    const leaderboardHeader = page.locator(
      '[data-testid="leaderboard-header"]'
    );
    if (await leaderboardHeader.isVisible()) {
      const headerText = await leaderboardHeader.textContent();
      console.log("Leaderboard header text:", headerText);
    }

    // Check for network failures
    const failedRequests: string[] = [];
    page.on("requestfailed", request => {
      failedRequests.push(
        `${request.method()} ${request.url()}: ${request.failure()?.errorText}`
      );
    });

    // Wait for network idle
    await page.waitForLoadState("networkidle");

    // Print console errors
    if (consoleErrors.length > 0) {
      console.log("Console errors found:");
      consoleErrors.forEach(err => console.log("  -", err));
    }

    // Print failed requests
    if (failedRequests.length > 0) {
      console.log("Failed network requests:");
      failedRequests.forEach(req => console.log("  -", req));
    }

    // Assertions
    expect(cardCount, "Should have player cards rendered").toBeGreaterThan(0);
    expect(hasErrors, "Should not have error alerts").toBe(false);
  });

  test("verify desktop navigation visibility", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("networkidle");

    // Check bottom navigation on desktop
    const bottomNav = page.locator('nav[aria-label="Main navigation"]');
    const navExists = (await bottomNav.count()) > 0;
    console.log("Navigation element exists:", navExists);

    if (navExists) {
      const isVisible = await bottomNav.isVisible();
      console.log("Navigation is visible on desktop:", isVisible);

      const navClasses = await bottomNav.getAttribute("class");
      console.log("Navigation classes:", navClasses);

      // Check if it has responsive classes that might hide it
      const hasHiddenClass =
        navClasses?.includes("md:hidden") || navClasses?.includes("lg:hidden");
      console.log("Has hidden class for desktop:", hasHiddenClass);

      // Check computed styles
      const navBox = await bottomNav.boundingBox();
      console.log("Navigation bounding box:", navBox);

      // Take screenshot of navigation area
      await page.screenshot({
        path: "test-results/production-desktop-navigation.png",
        fullPage: false,
      });
    }

    // Check for alternative navigation (e.g., header nav)
    const headerNav = page.locator(
      'header nav, nav:not([aria-label="Main navigation"])'
    );
    const hasHeaderNav = (await headerNav.count()) > 0;
    console.log("Has header/alternative navigation:", hasHeaderNav);
  });

  test("check Supabase connection and API calls", async ({ page }) => {
    // Monitor network requests
    const supabaseRequests: Array<{
      url: string;
      status: number;
      method: string;
    }> = [];

    page.on("response", response => {
      const url = response.url();
      if (url.includes("supabase")) {
        supabaseRequests.push({
          url,
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("networkidle");

    console.log("Supabase API calls made:");
    supabaseRequests.forEach(req => {
      console.log(`  - ${req.method} ${req.url} (Status: ${req.status})`);
    });

    // Check if any Supabase calls were made
    expect(
      supabaseRequests.length,
      "Should make Supabase API calls"
    ).toBeGreaterThan(0);

    // Check for successful responses
    const failedRequests = supabaseRequests.filter(req => req.status >= 400);
    if (failedRequests.length > 0) {
      console.log("Failed Supabase requests:");
      failedRequests.forEach(req =>
        console.log(`  - ${req.method} ${req.url} (Status: ${req.status})`)
      );
    }
  });

  test("compare with local development", async ({ page }) => {
    // First check local
    console.log("Checking local development site...");
    try {
      await page.goto("http://localhost:3000");
      await page.waitForTimeout(2000);

      const localPlayerCards = await page
        .locator('[data-testid*="player-card"]')
        .count();
      console.log("Local player cards:", localPlayerCards);

      await page.screenshot({
        path: "test-results/local-site-comparison.png",
        fullPage: true,
      });
    } catch (error) {
      console.log(
        "Local site not available:",
        error instanceof Error ? error.message : String(error)
      );
    }

    // Then check production
    console.log("Checking production site...");
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(5000);

    const prodPlayerCards = await page
      .locator('[data-testid*="player-card"]')
      .count();
    console.log("Production player cards:", prodPlayerCards);
  });
});
