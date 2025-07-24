import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://mj-web-psi.vercel.app";

test.describe("Verify Production Issues", () => {
  test("check leaderboard total games display", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("networkidle");

    // Wait for leaderboard to load
    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });

    // Check if header exists and find total games
    const headerCard = await page.locator('[data-testid="leaderboard-header"]');
    const headerExists = await headerCard
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (headerExists) {
      const summaryDiv = headerCard.locator("div.text-muted-foreground");
      const summaryText = await summaryDiv.textContent();
      console.log("Production header summary:", summaryText);

      // Extract game count
      const gameCountMatch = summaryText?.match(/(\d+)\s*games/);
      if (gameCountMatch) {
        const gameCount = parseInt(gameCountMatch[1]);
        console.log("Production game count:", gameCount);

        // Check if it's showing a reasonable number (should be 94 based on our data)
        expect(gameCount).toBeGreaterThan(0);
        expect(gameCount).toBeLessThan(500); // Sanity check
      }
    } else {
      console.log("Header card not found on production");
    }

    // Check player ratings
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    const firstPlayerName = await firstCard
      .locator(".font-medium")
      .textContent();
    const firstPlayerRating = await firstCard
      .locator(".text-2xl")
      .textContent();
    const firstPlayerGames = await firstCard
      .locator(".text-muted-foreground")
      .first()
      .textContent();

    console.log("First player on production:", {
      name: firstPlayerName,
      rating: firstPlayerRating,
      games: firstPlayerGames,
    });

    // Check for any infinity or NaN values
    const allRatings = await page.locator(".text-2xl").allTextContents();
    console.log("All visible ratings:", allRatings);

    // Check for problematic values
    const hasInfinity = allRatings.some(
      r => r.includes("Infinity") || r.includes("∞")
    );
    const hasNaN = allRatings.some(r => r.includes("NaN") || r === "--");

    if (hasInfinity) {
      console.error("Found Infinity in ratings!");
    }
    if (hasNaN) {
      console.error("Found NaN or placeholder in ratings!");
    }

    expect(hasInfinity).toBe(false);
    expect(hasNaN).toBe(false);
  });

  test("check rating calculation method", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("networkidle");

    // Expand first player card to see detailed stats
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    // Check if we can see mu/sigma values (if exposed in expanded view)
    const expandedContent = await firstCard.textContent();
    console.log("Expanded card content:", expandedContent);

    // Navigate to a player profile to see more details
    const firstPlayerName = await firstCard
      .locator(".font-medium")
      .textContent();
    const profileButton = firstCard.locator('button:has-text("View Profile")');
    const hasProfileButton = await profileButton
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (hasProfileButton) {
      await profileButton.click();
      await page.waitForLoadState("networkidle");

      // Check profile page for rating display
      const profileRating = await page
        .locator("h2.text-muted-foreground")
        .textContent();
      console.log("Profile page subtitle:", profileRating);
    }
  });

  test("compare local dev vs production", async ({ page }) => {
    // First check local dev (if running)
    const localUrl = "http://localhost:3000";
    let localData = null;

    try {
      await page.goto(localUrl);
      await page.waitForSelector('[data-testid^="player-card-"]', {
        timeout: 5000,
      });

      const headerCard = await page.locator(
        '[data-testid="leaderboard-header"]'
      );
      const summaryText = await headerCard
        .locator("div.text-muted-foreground")
        .textContent();
      const firstPlayerRating = await page
        .locator('[data-testid^="player-card-"]')
        .first()
        .locator(".text-2xl")
        .textContent();

      localData = {
        summaryText,
        firstPlayerRating,
      };
      console.log("Local dev data:", localData);
    } catch (error) {
      console.log("Local dev not running, skipping comparison");
    }

    // Now check production
    await page.goto(PRODUCTION_URL);
    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });

    const prodHeaderCard = await page.locator(
      '[data-testid="leaderboard-header"]'
    );
    const prodSummaryText = await prodHeaderCard
      .locator("div.text-muted-foreground")
      .textContent();
    const prodFirstPlayerRating = await page
      .locator('[data-testid^="player-card-"]')
      .first()
      .locator(".text-2xl")
      .textContent();

    const prodData = {
      summaryText: prodSummaryText,
      firstPlayerRating: prodFirstPlayerRating,
    };
    console.log("Production data:", prodData);

    if (localData) {
      console.log("Comparison:");
      console.log("- Local summary:", localData.summaryText);
      console.log("- Prod summary:", prodData.summaryText);
      console.log("- Local first rating:", localData.firstPlayerRating);
      console.log("- Prod first rating:", prodData.firstPlayerRating);
    }
  });
});
