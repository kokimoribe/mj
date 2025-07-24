import { test, expect } from "@playwright/test";

test.describe("PWA Service Worker Verification", () => {
  test("service worker registers successfully without errors", async ({
    page,
  }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to the app
    await page.goto("/");

    // Wait for service worker to register
    await page.waitForTimeout(3000);

    // Check for service worker registration
    const hasServiceWorker = await page.evaluate(() => {
      return "serviceWorker" in navigator;
    });
    expect(hasServiceWorker).toBe(true);

    // Check if service worker is registered
    const swRegistration = await page.evaluate(async () => {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return {
          count: registrations.length,
          scopes: registrations.map(r => r.scope),
          active: registrations.some(r => r.active !== null),
        };
      }
      return null;
    });

    console.log("Service Worker Registration:", swRegistration);

    // Verify no critical errors
    const criticalErrors = consoleErrors.filter(
      error =>
        error.includes("_ref is not defined") ||
        error.includes("Uncaught") ||
        error.includes("ReferenceError")
    );

    if (criticalErrors.length > 0) {
      console.error("Critical errors found:", criticalErrors);
    }

    expect(criticalErrors).toHaveLength(0);

    // Verify service worker is registered
    expect(swRegistration).not.toBeNull();
    if (swRegistration) {
      expect(swRegistration.count).toBeGreaterThan(0);
      expect(swRegistration.active).toBe(true);
    }
  });

  test("PWA manifest is accessible", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest).toBeDefined();
    expect(manifest.name).toBe("Riichi Tracker");
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test("PWA icons are accessible", async ({ page }) => {
    const icons = [
      "/icon-192x192.png",
      "/icon-512x512.png",
      "/apple-touch-icon.png",
    ];

    for (const icon of icons) {
      const response = await page.goto(icon);
      expect(response?.status()).toBe(200);
      expect(response?.headers()["content-type"]).toContain("image/png");
    }
  });

  test("app loads correctly with service worker", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check that the app loads correctly
    await page.waitForSelector('[data-testid="leaderboard-header"]', {
      timeout: 10000,
    });

    // Verify header content
    const headerCard = page.locator('[data-testid="leaderboard-header"]');
    const summaryText = await headerCard
      .locator("div.text-muted-foreground")
      .textContent();

    // Should show actual data, not "0 games"
    expect(summaryText).toContain("games");
    expect(summaryText).not.toContain("0 games");

    // Check that player cards load
    const playerCards = await page
      .locator('[data-testid^="player-card-"]')
      .count();
    expect(playerCards).toBeGreaterThan(0);
  });
});
