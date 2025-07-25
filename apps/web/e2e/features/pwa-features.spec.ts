import { test, expect } from "@playwright/test";

/**
 * Progressive Web App Features - Comprehensive E2E Tests
 * Based on Product Requirements Document
 *
 * Tests PWA installation prompts and offline capabilities
 */

test.describe("PWA Installation Features", () => {
  test.beforeEach(async ({ context }) => {
    // Clear any previous localStorage/cookies
    await context.clearCookies();
    await context.addInitScript(() => {
      localStorage.clear();
    });
  });

  test("installation prompt appears for new users", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Installation prompt should be visible
    const installPrompt = page.locator('[data-testid="pwa-install-prompt"]');
    await expect(installPrompt).toBeVisible({ timeout: 5000 });

    // Should show clear benefits
    const promptText = await installPrompt.textContent();
    expect(promptText).toMatch(/offline access|quick launch/i);

    // Should have install button
    const installButton = installPrompt.locator(
      '[data-testid="install-button"]'
    );
    await expect(installButton).toBeVisible();
    await expect(installButton).toContainText(/install/i);
  });

  test("installation prompt is dismissible", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    const installPrompt = page.locator('[data-testid="pwa-install-prompt"]');
    await expect(installPrompt).toBeVisible();

    // Should have dismiss button
    const dismissButton = installPrompt.locator(
      '[data-testid="dismiss-button"]'
    );
    await expect(dismissButton).toBeVisible();

    // Click dismiss
    await dismissButton.click();

    // Prompt should disappear
    await expect(installPrompt).not.toBeVisible();
  });

  test("dismissal preference is remembered", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Dismiss the prompt
    const installPrompt = page.locator('[data-testid="pwa-install-prompt"]');
    await installPrompt.locator('[data-testid="dismiss-button"]').click();

    // Verify localStorage was set
    const dismissalState = await page.evaluate(() => {
      return localStorage.getItem("pwa-install-dismissed");
    });
    expect(dismissalState).toBe("true");

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Prompt should not reappear
    await expect(installPrompt).not.toBeVisible();

    // Navigate to another page and back
    await page.goto("/games");
    await page.goto("/");

    // Still should not appear
    await expect(installPrompt).not.toBeVisible();
  });

  test("prompt hidden when already installed as PWA", async ({ browser }) => {
    // Create context that simulates PWA standalone mode
    const context = await browser.newContext();
    const page = await context.newPage();

    // Inject script to simulate standalone mode
    await page.addInitScript(() => {
      // Override matchMedia to simulate PWA
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = (query: string) => {
        if (query === "(display-mode: standalone)") {
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          } as MediaQueryList;
        }
        return originalMatchMedia(query);
      };
    });

    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Installation prompt should NOT appear
    const installPrompt = page.locator('[data-testid="pwa-install-prompt"]');
    await expect(installPrompt).not.toBeVisible();

    await context.close();
  });

  test("install button triggers browser install flow", async ({
    page,
    context,
  }) => {
    // Note: Actual PWA installation can't be fully tested in Playwright
    // This test verifies the button click handler works

    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    const installPrompt = page.locator('[data-testid="pwa-install-prompt"]');
    const installButton = installPrompt.locator(
      '[data-testid="install-button"]'
    );

    // Set up event listener to catch install event
    await page.evaluate(() => {
      (window as any).installEventFired = false;
      window.addEventListener("beforeinstallprompt", e => {
        e.preventDefault();
        (window as any).deferredPrompt = e;
        (window as any).installEventFired = true;
      });
    });

    // Click install button
    await installButton.click();

    // In a real browser with PWA support, this would trigger the install prompt
    // For testing, we just verify the button is clickable and doesn't cause errors

    // The prompt might disappear after clicking install
    // (depends on implementation)
  });
});

test.describe("PWA Offline Capabilities", () => {
  test("app works offline with cached data", async ({ page, context }) => {
    // First, load the app online to cache data
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Wait for initial data load
    await page.waitForTimeout(2000);

    // Capture some data for comparison
    const onlinePlayerCount = await page
      .locator('[data-testid^="player-card-"]')
      .count();
    const firstPlayerName = await page
      .locator('[data-testid="player-name"]')
      .first()
      .textContent();

    // Go offline
    await context.setOffline(true);

    // Reload the page
    await page.reload();

    // App should still load
    await expect(
      page.locator('[data-testid="leaderboard-view"]')
    ).toBeVisible();

    // Should show offline indicator
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible();
    expect(await offlineIndicator.textContent()).toMatch(/offline/i);

    // Cached data should be visible
    const offlinePlayerCount = await page
      .locator('[data-testid^="player-card-"]')
      .count();
    expect(offlinePlayerCount).toBe(onlinePlayerCount);

    // Same player data should be shown
    const offlineFirstPlayerName = await page
      .locator('[data-testid="player-name"]')
      .first()
      .textContent();
    expect(offlineFirstPlayerName).toBe(firstPlayerName);
  });

  test("navigation works offline", async ({ page, context }) => {
    // Load pages online first
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    await page.goto("/games");
    await page.waitForSelector('[data-testid="game-history-view"]');

    // Go to a player profile
    await page.goto("/");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await firstCard.locator('text="View Full Profile"').click();
    await page.waitForSelector('[data-testid="player-header"]');

    // Now go offline
    await context.setOffline(true);

    // Navigate back to home
    await page.goto("/");
    await expect(
      page.locator('[data-testid="leaderboard-view"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="offline-indicator"]')
    ).toBeVisible();

    // Navigate to games
    await page.goto("/games");
    await expect(
      page.locator('[data-testid="game-history-view"]')
    ).toBeVisible();

    // Bottom navigation should work
    const bottomNav = page.locator('[data-testid="bottom-navigation"]');
    await bottomNav.locator('text="Leaderboard"').click();
    await expect(page).toHaveURL("/");
  });

  test("automatic sync when connection returns", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Go offline
    await context.setOffline(true);
    await page.reload();

    // Verify offline mode
    await expect(
      page.locator('[data-testid="offline-indicator"]')
    ).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Wait for auto-sync (should happen within a few seconds)
    await page.waitForFunction(
      () => !document.querySelector('[data-testid="offline-indicator"]'),
      { timeout: 10000 }
    );

    // Should show updated timestamp
    const timestamp = await page
      .locator('[data-testid="last-updated"]')
      .textContent();
    expect(timestamp).toBeTruthy();
  });

  test("offline indicator styling and placement", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Go offline
    await context.setOffline(true);
    await page.reload();

    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    await expect(offlineIndicator).toBeVisible();

    // Should be prominently displayed but not blocking
    const box = await offlineIndicator.boundingBox();
    expect(box).toBeTruthy();

    // Should have appropriate styling (warning colors)
    const backgroundColor = await offlineIndicator.evaluate(
      el => window.getComputedStyle(el).backgroundColor
    );

    // Should be yellow/amber warning color
    expect(backgroundColor).toMatch(/rgb\(25[0-5], \d+, \d+\)/); // Yellowish
  });
});

test.describe("PWA Manifest and Meta Tags", () => {
  test("web app manifest is properly configured", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();

    // Check required manifest properties
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.background_color).toBeTruthy();
    expect(manifest.theme_color).toBeTruthy();

    // Check icons
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThan(0);

    // Should have at least 192x192 and 512x512 icons
    const sizes = manifest.icons.map((icon: any) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  test("iOS-specific meta tags are present", async ({ page }) => {
    await page.goto("/");

    // Check for iOS meta tags
    const appleMobileWebAppCapable = await page
      .locator('meta[name="apple-mobile-web-app-capable"]')
      .getAttribute("content");
    expect(appleMobileWebAppCapable).toBe("yes");

    const appleMobileWebAppStatus = await page
      .locator('meta[name="apple-mobile-web-app-status-bar-style"]')
      .getAttribute("content");
    expect(appleMobileWebAppStatus).toBeTruthy();

    // Check for apple touch icon
    const appleTouchIcon = await page
      .locator('link[rel="apple-touch-icon"]')
      .getAttribute("href");
    expect(appleTouchIcon).toBeTruthy();
  });

  test("viewport meta tag is mobile-optimized", async ({ page }) => {
    await page.goto("/");

    const viewport = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(viewport).toContain("width=device-width");
    expect(viewport).toContain("initial-scale=1");
  });
});

test.describe("PWA Performance", () => {
  test("service worker registers successfully", async ({ page }) => {
    await page.goto("/");

    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration().then(reg => !!reg);
    });

    expect(swRegistered).toBe(true);
  });

  test("critical resources are cached", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Get list of critical resources
    const resources = await page.evaluate(() => {
      return performance
        .getEntriesByType("resource")
        .filter(entry => {
          const url = entry.name;
          return (
            url.includes(".js") || url.includes(".css") || url.includes("/api/")
          );
        })
        .map(entry => entry.name);
    });

    // Go offline
    await context.setOffline(true);

    // Reload
    await page.reload();

    // Page should still load (from cache)
    await expect(
      page.locator('[data-testid="leaderboard-view"]')
    ).toBeVisible();

    // Critical resources should load from cache
    const cachedResources = await page.evaluate(() => {
      return performance
        .getEntriesByType("resource")
        .filter(entry => (entry as any).transferSize === 0)
        .map(entry => entry.name);
    });

    // Some resources should be served from cache
    expect(cachedResources.length).toBeGreaterThan(0);
  });
});

test.describe("PWA Mobile Experience", () => {
  test.use({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
  });

  test("installation prompt is mobile-optimized", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    const installPrompt = page.locator('[data-testid="pwa-install-prompt"]');

    if (await installPrompt.isVisible()) {
      // Should be appropriately sized for mobile
      const box = await installPrompt.boundingBox();
      expect(box?.width).toBeLessThan(360); // Should fit within mobile viewport

      // Buttons should be touch-friendly
      const installButton = installPrompt.locator(
        '[data-testid="install-button"]'
      );
      const buttonBox = await installButton.boundingBox();
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

      const dismissButton = installPrompt.locator(
        '[data-testid="dismiss-button"]'
      );
      const dismissBox = await dismissButton.boundingBox();
      expect(dismissBox?.height).toBeGreaterThanOrEqual(44);
      expect(dismissBox?.width).toBeGreaterThanOrEqual(44);
    }
  });

  test("app is usable in standalone mode", async ({ browser }) => {
    // Simulate standalone mode
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = (query: string) => {
        if (query === "(display-mode: standalone)") {
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          } as MediaQueryList;
        }
        return originalMatchMedia(query);
      };
    });

    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-view"]');

    // Should not show browser UI elements
    // Should not show install prompt
    await expect(
      page.locator('[data-testid="pwa-install-prompt"]')
    ).not.toBeVisible();

    // Navigation should work
    await page
      .locator('[data-testid="bottom-navigation"] text="Games"')
      .click();
    await expect(page).toHaveURL("/games");

    await context.close();
  });
});
