import { test, expect } from "@playwright/test";

test.describe("Comprehensive Data Validation", () => {
  test("validate leaderboard data values and UI elements", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Dismiss PWA notification if present
    const dismissButton = page.locator(
      'button[aria-label="Dismiss notification"]'
    );
    const notificationExists = await dismissButton
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    if (notificationExists) {
      await dismissButton.click();
      await page.waitForTimeout(300);
    }

    // Wait for leaderboard to load
    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });

    // Verify season summary shows correct data
    const seasonSummaryElements = await page
      .locator("p.text-muted-foreground")
      .all();
    let gameCount = 0;
    for (const element of seasonSummaryElements) {
      const text = await element.textContent();
      const gameCountMatch = text?.match(/(\d+)\s*games/);
      if (gameCountMatch) {
        gameCount = parseInt(gameCountMatch[1]);
        console.log("Game count:", gameCount);
        break;
      }
    }
    expect(gameCount).toBeGreaterThan(50);
    expect(gameCount).toBeLessThan(200);

    // Verify players are shown
    const playerCards = await page
      .locator('[data-testid^="player-card-"]')
      .count();
    expect(playerCards).toBeGreaterThan(5);
    console.log("Number of players:", playerCards);

    // Check rating values are reasonable
    const firstPlayerRating = await page
      .locator('[data-testid^="player-card-"]')
      .first()
      .locator(".text-2xl")
      .textContent();
    const rating = parseFloat(firstPlayerRating || "0");
    console.log("First player rating:", rating);
    expect(rating).toBeGreaterThan(-10);
    expect(rating).toBeLessThan(100);

    // Verify delta values are shown
    const deltaElements = await page
      .locator(
        '[class*="text-green"], [class*="text-red"], [class*="text-muted"]'
      )
      .filter({ hasText: /[▲▼—]/ });
    const deltaCount = await deltaElements.count();
    console.log("Delta elements found:", deltaCount);
    expect(deltaCount).toBeGreaterThan(0);
  });

  test("validate expanded player card shows all required data", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click first player to expand
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300); // Wait for animation

    // Check 7-day change is shown
    const sevenDayChange = await page
      .locator('text="7-day change:"')
      .locator("..");
    const sevenDayVisible = await sevenDayChange.isVisible();
    console.log("7-day change visible:", sevenDayVisible);
    expect(sevenDayVisible).toBe(true);

    // Check average placement is shown with value
    const avgPlacementElement = await page
      .locator('text="Avg Placement:"')
      .locator("..");
    const avgPlacementVisible = await avgPlacementElement.isVisible();
    const avgPlacementText = await avgPlacementElement.textContent();
    console.log("Avg placement visible:", avgPlacementVisible);
    console.log("Avg placement text:", avgPlacementText);
    expect(avgPlacementVisible).toBe(true);
    expect(avgPlacementText).toMatch(/Avg Placement:\s*\d+\.?\d*/);

    // Check last played is shown
    const lastPlayed = await page.locator('text="Last Played:"').locator("..");
    expect(await lastPlayed.isVisible()).toBe(true);

    // Check chart is visible
    const chartContainer = await page
      .locator(".recharts-responsive-container")
      .first();
    expect(await chartContainer.isVisible()).toBe(true);

    // Check for line elements in chart
    const lineElements = await page.locator(".recharts-line").count();
    console.log("Line elements in expanded card chart:", lineElements);
    expect(lineElements).toBeGreaterThan(0);
  });

  test("validate player profile page data and charts", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Get first player and navigate to profile
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    const playerName = await firstCard.locator(".font-medium").textContent();
    await firstCard.click();
    await page.waitForTimeout(300);

    // Click View Full Profile
    await page.click("text=View Full Profile");
    await page.waitForURL("**/player/**", { timeout: 10000 });

    // Verify we're on the profile page
    expect(page.url()).toContain("/player/");

    // Check header shows correct data
    await page.waitForSelector("h1.text-2xl.font-bold", { timeout: 5000 });
    const headerName = await page
      .locator("h1.text-2xl.font-bold")
      .textContent();
    expect(headerName).toBe(playerName);

    // Check rank, rating, and games are shown in the subtitle
    const subtitleElement = await page
      .locator("h2.text-muted-foreground")
      .first();
    const subtitleText = await subtitleElement.textContent();
    expect(subtitleText).toMatch(/Rank #\d+/);
    expect(subtitleText).toMatch(/Rating: \d+\.\d+/);
    expect(subtitleText).toMatch(/\d+ games/);

    // Check rating chart is rendered
    const chartContainer = await page
      .locator(".recharts-responsive-container")
      .first();
    expect(await chartContainer.isVisible()).toBe(true);

    // Check for line elements in rating progression chart
    const lineElements = await page.locator(".recharts-line").count();
    console.log("Line elements in profile chart:", lineElements);
    expect(lineElements).toBeGreaterThan(0);

    // Check line has stroke
    const lineElement = await page.locator(".recharts-line").first();
    const stroke = await lineElement.getAttribute("stroke");
    console.log("Line stroke:", stroke);
    expect(stroke).toBe("#10b981");

    // Check performance stats section
    const perfStats = await page
      .locator("text=Performance Stats")
      .locator("..");
    expect(await perfStats.isVisible()).toBe(true);

    // Check average placement in performance stats
    const avgPlacement = await page
      .locator('text="Average Placement:"')
      .locator("..");
    const avgText = await avgPlacement.textContent();
    console.log("Profile avg placement:", avgText);
    expect(avgText).toMatch(/Average Placement:\s*\d+\.?\d*/);

    // Check recent games section
    const recentGames = await page.locator("text=Recent Games");
    expect(await recentGames.isVisible()).toBe(true);
  });

  test("validate game history page data and functionality", async ({
    page,
  }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Wait for page to load and check we're on games page
    await page.waitForTimeout(1000);

    // Verify URL changed to games
    expect(page.url()).toContain("/games");

    // Check season info
    const seasonInfo = await page
      .locator(".text-muted-foreground")
      .first()
      .textContent();
    console.log("Game history season info:", seasonInfo);
    expect(seasonInfo).toMatch(/Season \d+.*\d+ games/);

    // Check games are loaded
    const gameCards = await page
      .locator('[class*="border"][class*="rounded"]')
      .filter({ has: page.locator("text=/📅/") });
    const gameCount = await gameCards.count();
    console.log("Game cards displayed:", gameCount);
    expect(gameCount).toBeGreaterThan(0);
    expect(gameCount).toBeLessThanOrEqual(10); // Initial load shows 10

    // Check game card structure
    const firstGame = gameCards.first();

    // Check date format
    const dateElement = await firstGame.locator('text="📅"').locator("..");
    const dateText = await dateElement.textContent();
    console.log("Game date:", dateText);
    expect(dateText).toMatch(/📅.*\d{4}/);

    // Check player results are shown with correct format
    const playerResults = await firstGame.locator(
      '[class*="flex"][class*="items-center"][class*="gap-2"]'
    );
    const resultCount = await playerResults.count();
    expect(resultCount).toBe(4); // Should show 4 players

    // Check placement indicators
    const placements = ["🥇", "🥈", "🥉", "4️⃣"];
    for (const placement of placements) {
      const element = await firstGame.locator(`text=${placement}`);
      expect(await element.isVisible()).toBe(true);
    }

    // Check scores are formatted correctly
    const scoreElements = await firstGame.locator('text="→"');
    const scoreCount = await scoreElements.count();
    expect(scoreCount).toBe(4); // Each player has a score

    // Check rating changes are shown
    const ratingChanges = await firstGame
      .locator('[class*="text-green"], [class*="text-red"]')
      .filter({ hasText: /[▲▼]/ });
    const ratingChangeCount = await ratingChanges.count();
    console.log("Rating changes shown:", ratingChangeCount);
    expect(ratingChangeCount).toBeGreaterThan(0);

    // Test Load More functionality
    const loadMoreButton = await page.locator('button:has-text("Load More")');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(500);

      // Check more games are shown
      const newGameCount = await gameCards.count();
      console.log("Games after load more:", newGameCount);
      expect(newGameCount).toBeGreaterThan(gameCount);

      // Check Show Less button appears
      const showLessButton = await page.locator('button:has-text("Show Less")');
      expect(await showLessButton.isVisible()).toBe(true);
    }
  });

  test("validate navigation works correctly on desktop", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check bottom navigation is visible - look for any nav element
    const bottomNav = await page
      .locator('[data-testid="nav-bottom"], nav')
      .last();
    expect(await bottomNav.isVisible()).toBe(true);

    // Check all navigation items
    const navItems = [
      { text: "Home", href: "/" }, // Changed from Leaderboard to Home
      { text: "Players", href: "/players" },
      { text: "Games", href: "/games" },
      { text: "Stats", href: "/stats" },
    ];

    // Check navigation links exist
    const homeLink = await bottomNav.locator('a[href="/"]');
    expect(await homeLink.isVisible()).toBe(true);

    const gamesLink = await bottomNav.locator('a[href="/games"]');
    expect(await gamesLink.isVisible()).toBe(true);

    // Test navigation to Games tab
    await bottomNav.locator('a[href="/games"]').click();
    await page.waitForURL("**/games", { timeout: 5000 });
    expect(page.url()).toContain("/games");

    // Verify Games page loads without errors
    const errorMessage = await page.locator("text=Failed to load").isVisible();
    expect(errorMessage).toBe(false);

    // Navigate back to leaderboard
    await bottomNav.locator('a[href="/"]').click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/$|\/\?/); // Root or root with query params
  });

  test("validate PWA installation and features", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for PWA manifest
    const manifestLink = await page.locator('link[rel="manifest"]');
    expect(await manifestLink.count()).toBe(1);

    // Check for theme color
    const themeColor = await page.locator('meta[name="theme-color"]');
    expect(await themeColor.count()).toBe(1);

    // Check for apple touch icon
    const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]');
    expect(await appleTouchIcon.count()).toBeGreaterThan(0);

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]');
    const viewportContent = await viewport.getAttribute("content");
    expect(viewportContent).toContain("width=device-width");

    // Check if service worker is registered (may not be in dev)
    const hasServiceWorker = await page.evaluate(() => {
      return "serviceWorker" in navigator;
    });
    console.log("Service worker support:", hasServiceWorker);

    // Check for any PWA notification
    const pwaNotification = await page
      .locator('[class*="notification"], [class*="banner"]')
      .filter({ hasText: /install|add to home/i });
    const notificationVisible = await pwaNotification
      .isVisible()
      .catch(() => false);
    console.log("PWA notification visible:", notificationVisible);

    if (notificationVisible) {
      // Check for dismiss button
      const dismissButton = await pwaNotification.locator("button").first();
      if (await dismissButton.isVisible()) {
        await dismissButton.click();
        await page.waitForTimeout(300);
        // Verify notification is dismissed
        expect(await pwaNotification.isVisible()).toBe(false);
      }
    }
  });
});
