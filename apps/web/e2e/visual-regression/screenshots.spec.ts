import { test } from "@playwright/test";
import { takeScreenshot, navigateTo } from "../utils/test-helpers";

test.describe("Visual Regression: Full Application Screenshots", () => {
  test.beforeEach(async () => {
    // Use production data for testing
  });

  // Simplified for hobby project - only test primary viewport (mobile)
  const viewports = [
    { name: "mobile", width: 375, height: 812 }, // iPhone 12/13 size
  ];

  for (const viewport of viewports) {
    test.describe(`${viewport.name} viewport (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport });

      test("captures home/leaderboard view", async ({ page }) => {
        await navigateTo(page, "/");
        await takeScreenshot(
          page,
          `visual/${viewport.name}/01-home-leaderboard`
        );

        // Expand a card for additional screenshot
        const firstCard = page.locator('[data-testid^="player-card-"]').first();
        if (await firstCard.isVisible()) {
          await firstCard.click();
          await page.waitForTimeout(300); // Wait for animation
          await takeScreenshot(
            page,
            `visual/${viewport.name}/02-home-card-expanded`
          );
        }
      });

      test("captures game history view", async ({ page }) => {
        await navigateTo(page, "/games");
        await takeScreenshot(page, `visual/${viewport.name}/03-game-history`);
      });

      test("captures stats view", async ({ page }) => {
        await navigateTo(page, "/stats");
        await takeScreenshot(page, `visual/${viewport.name}/04-stats`);
      });

      test("captures playground/config view", async ({ page }) => {
        await navigateTo(page, "/playground");
        await takeScreenshot(page, `visual/${viewport.name}/05-playground`);

        // Interact with sliders if visible
        const slider = page.locator('[role="slider"]').first();
        if (await slider.isVisible({ timeout: 1000 }).catch(() => false)) {
          // Move slider to middle position
          const box = await slider.boundingBox();
          if (box) {
            await page.mouse.click(
              box.x + box.width / 2,
              box.y + box.height / 2
            );
            await takeScreenshot(
              page,
              `visual/${viewport.name}/06-playground-adjusted`
            );
          }
        }
      });

      test("captures player profile view", async ({ page }) => {
        await navigateTo(page, "/player/test-player-1");
        await takeScreenshot(page, `visual/${viewport.name}/07-player-profile`);
      });

      test("captures dark mode", async ({ page }) => {
        await navigateTo(page, "/");

        // Toggle dark mode
        const themeToggle = page.locator('[data-testid="theme-toggle"]');
        if (await themeToggle.isVisible({ timeout: 1000 }).catch(() => false)) {
          await themeToggle.click();
          await page.waitForTimeout(300); // Wait for theme transition

          // Capture dark mode screenshots
          await takeScreenshot(
            page,
            `visual/${viewport.name}/08-dark-mode-home`
          );

          // Navigate to other pages in dark mode
          await navigateTo(page, "/games");
          await takeScreenshot(
            page,
            `visual/${viewport.name}/09-dark-mode-games`
          );

          await navigateTo(page, "/stats");
          await takeScreenshot(
            page,
            `visual/${viewport.name}/10-dark-mode-stats`
          );
        }
      });

      test("captures error states", async ({ page }) => {
        // Test 404 page
        await page.goto("/non-existent-page");
        await takeScreenshot(page, `visual/${viewport.name}/11-error-404`);

        // Test API error state (remove mocks for this test)
        await page.route("**/api/leaderboard", route => {
          route.fulfill({
            status: 500,
            body: "Internal Server Error",
          });
        });

        await navigateTo(page, "/");
        await takeScreenshot(page, `visual/${viewport.name}/12-error-api`);
      });

      test("captures loading states", async ({ page }) => {
        // Don't use mocks to capture real loading states
        await page.goto("/");

        // Try to capture skeleton loaders
        const skeleton = page.locator(".skeleton").first();
        if (await skeleton.isVisible({ timeout: 500 }).catch(() => false)) {
          await takeScreenshot(
            page,
            `visual/${viewport.name}/13-loading-skeleton`
          );
        }
      });

      test("captures interactive states", async ({ page }) => {
        await navigateTo(page, "/");

        // Hover states
        const firstCard = page.locator('[data-testid^="player-card-"]').first();
        if (await firstCard.isVisible()) {
          await firstCard.hover();
          await takeScreenshot(page, `visual/${viewport.name}/14-hover-state`);
        }

        // Focus states
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await takeScreenshot(page, `visual/${viewport.name}/15-focus-state`);

        // Active/pressed state
        if (await firstCard.isVisible()) {
          await firstCard.hover();
          await page.mouse.down();
          await takeScreenshot(page, `visual/${viewport.name}/16-active-state`);
          await page.mouse.up();
        }
      });
    });
  }

  // Removed special scenarios for hobby project simplicity
});
