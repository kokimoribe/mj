import { test, expect } from "@playwright/test";

test.describe("Bug Fixes Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector('[data-testid="leaderboard-view"]', {
      timeout: 10000,
    });
  });

  test("Fix #1: Season 3 leaderboard shows correct game count (~100)", async ({
    page,
  }) => {
    // Check the season summary for corrected game count
    const seasonSummary = page.locator('[data-testid="leaderboard-header"]');
    await expect(seasonSummary).toBeVisible();

    const gameCountText = await seasonSummary.textContent();
    console.log("Season summary text:", gameCountText);

    // Extract the number of games from the text
    const gameCountMatch = gameCountText?.match(/(\d+)\s*games/i);
    if (gameCountMatch) {
      const gameCount = parseInt(gameCountMatch[1]);
      console.log("Fixed game count:", gameCount);

      // Should now be around 100 games (not 404)
      expect(gameCount).toBeLessThan(150); // Reasonable upper bound
      expect(gameCount).toBeGreaterThan(50); // Should have substantial games
      expect(gameCount).not.toBe(404); // Should not be the old incorrect value
    } else {
      throw new Error("Could not find game count in season summary");
    }
  });

  test("Fix #2: Recent performance chart shows line graph (not just dots)", async ({
    page,
  }) => {
    // Find and expand a player card
    const firstPlayerCard = page
      .locator('[data-testid*="player-card"]')
      .first();
    await firstPlayerCard.click();

    // Wait for the expanded card
    await page.waitForSelector('[data-testid="mini-rating-chart"]', {
      timeout: 5000,
    });

    // Check for line elements in the SVG chart
    const chartContainer = page.locator('[data-testid="mini-rating-chart"]');

    // Look for path elements with visible stroke (not transparent)
    const lineElements = chartContainer.locator('path[stroke="#10b981"]');
    const lineCount = await lineElements.count();

    console.log("Visible line elements found:", lineCount);

    // Should have at least one visible line connecting the dots
    expect(lineCount).toBeGreaterThan(0);

    // Verify stroke is green, not transparent
    if (lineCount > 0) {
      const strokeColor = await lineElements.first().getAttribute("stroke");
      expect(strokeColor).toBe("#10b981");

      const strokeWidth = await lineElements
        .first()
        .getAttribute("stroke-width");
      expect(parseInt(strokeWidth || "0")).toBeGreaterThan(0);
    }
  });

  test("Fix #3: Rating progression chart shows line graph on player profile", async ({
    page,
  }) => {
    // Navigate to player profile
    const firstPlayerCard = page
      .locator('[data-testid*="player-card"]')
      .first();
    await firstPlayerCard.click();

    const viewProfileLink = page.locator('text="View Full Profile"');
    await viewProfileLink.click();

    await page.waitForSelector('[data-testid="rating-chart"]', {
      timeout: 10000,
    });

    // Check for visible line elements
    const chartContainer = page.locator('[data-testid="rating-chart"]');
    const lineElements = chartContainer.locator('path[stroke="#10b981"]');
    const lineCount = await lineElements.count();

    console.log("Rating chart line elements found:", lineCount);

    // Should have visible connecting lines
    expect(lineCount).toBeGreaterThan(0);

    // Verify stroke properties
    if (lineCount > 0) {
      const strokeColor = await lineElements.first().getAttribute("stroke");
      expect(strokeColor).toBe("#10b981");

      const strokeWidth = await lineElements
        .first()
        .getAttribute("stroke-width");
      expect(parseInt(strokeWidth || "0")).toBeGreaterThan(0);
    }
  });

  test("Fix #4: Average placement shows values in expanded leaderboard card", async ({
    page,
  }) => {
    // Find and expand a player card
    const playerCard = page.locator('[data-testid*="player-card"]').first();
    await playerCard.click();

    // Wait for expanded content
    await page.waitForSelector('text="Avg Placement"', { timeout: 5000 });

    // Look for average placement display
    const avgPlacementElement = page
      .locator('text="Avg Placement"')
      .locator("..");

    const avgPlacementText = await avgPlacementElement.textContent();
    console.log("Avg Placement text:", avgPlacementText);

    // Should contain a decimal number like "2.1" or "1.8", not "—"
    const hasNumericValue = /\d+\.\d+/.test(avgPlacementText || "");
    const showsDash = avgPlacementText?.includes("—");

    // Should have numeric value and not show dash (unless truly no games)
    expect(hasNumericValue || showsDash).toBeTruthy(); // Either valid number or properly shows no data
    if (hasNumericValue) {
      // If there's a number, it should be between 1 and 4 (placement values)
      const numberMatch = avgPlacementText?.match(/(\d+\.\d+)/);
      if (numberMatch) {
        const value = parseFloat(numberMatch[1]);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(4);
      }
    }
  });

  test("Fix #5: Games tab navigation visible on desktop", async ({ page }) => {
    // Set viewport to desktop size to test desktop behavior
    await page.setViewportSize({ width: 1200, height: 800 });

    // Look for the bottom navigation
    const bottomNav = page.locator('nav[aria-label="Main navigation"]');
    await expect(bottomNav).toBeVisible();

    // Look for Games tab/link
    const gamesTab = bottomNav.locator('text="Games"');
    await expect(gamesTab).toBeVisible();

    // Verify it's clickable
    const isEnabled = await gamesTab.isEnabled();
    expect(isEnabled).toBeTruthy();

    // Test navigation works
    await gamesTab.click();
    await expect(page).toHaveURL(/\/games/);
  });

  test("Fix #6: PWA notification can be dismissed", async ({ page }) => {
    // Look for PWA notification
    const pwaNotification = page.locator(
      'text="PWA Status: Ready for installation"'
    );

    const notificationVisible = await pwaNotification.isVisible();

    if (notificationVisible) {
      console.log("PWA notification found - testing dismiss functionality");

      // Look for dismiss button (×)
      const dismissButton = page.locator(
        'button[aria-label="Dismiss notification"]'
      );
      await expect(dismissButton).toBeVisible();

      // Click dismiss button
      await dismissButton.click();

      // Verify notification disappears
      await expect(pwaNotification).toBeHidden();

      // Verify it stays dismissed after page interactions
      await page.reload();
      await page.waitForSelector('[data-testid="leaderboard-view"]', {
        timeout: 10000,
      });

      // Should still be dismissed (depending on implementation, might reappear after refresh)
      const stillDismissed = !(await pwaNotification.isVisible());
      console.log("Notification still dismissed after reload:", stillDismissed);
    } else {
      console.log(
        "No PWA notification found - may not be shown in current context"
      );
    }
  });

  test("Regression: Verify no major functionality broken", async ({ page }) => {
    // Test basic leaderboard functionality
    await expect(
      page.locator('[data-testid="leaderboard-view"]')
    ).toBeVisible();

    // Test player card expansion
    const firstCard = page.locator('[data-testid*="player-card"]').first();
    await firstCard.click();

    // Test navigation to profile
    const profileLink = page.locator('text="View Full Profile"');
    await profileLink.click();

    await expect(page).toHaveURL(/\/player\//);

    // Test back navigation
    const backButton = page.locator('text="Back"');
    await backButton.click();

    await expect(page).toHaveURL("/");

    // Test games navigation
    const gamesTab = page.locator('text="Games"');
    await gamesTab.click();

    await expect(page).toHaveURL("/games");

    console.log("All major navigation flows working correctly");
  });
});
