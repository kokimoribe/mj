import { test, expect } from "@playwright/test";

const PRODUCTION_URL = "https://mj-web-psi.vercel.app";
const LOCAL_URL = "http://localhost:3000";

// Test both environments
const environments = [
  { name: "Production", url: PRODUCTION_URL },
  { name: "Local", url: LOCAL_URL },
];

environments.forEach(env => {
  test.describe(`${env.name} Environment - Bug Verification`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(env.url);
      await page.waitForSelector('[data-testid="leaderboard-view"]', {
        timeout: 15000,
      });
    });

    test.describe("Issue #1: Game Count Calculation", () => {
      test("should display correct total game count", async ({ page }) => {
        const leaderboardHeader = page.locator(
          '[data-testid="leaderboard-header"]'
        );
        await expect(leaderboardHeader).toBeVisible();

        const headerText = await leaderboardHeader.textContent();
        console.log(`${env.name} - Header text:`, headerText);

        const gameCountMatch = headerText?.match(/(\d+)\s*games/i);

        if (gameCountMatch) {
          const gameCount = parseInt(gameCountMatch[1]);
          console.log(`${env.name} - Game count: ${gameCount}`);

          // Check if it's the incorrect value (404)
          if (gameCount === 404) {
            throw new Error(
              `${env.name} still shows incorrect game count: 404`
            );
          }

          // Should be reasonable count
          expect(gameCount).toBeGreaterThan(50);
          expect(gameCount).toBeLessThan(150);
        }
      });
    });

    test.describe("Issue #2: Chart Line Visibility", () => {
      test("mini charts should show visible lines", async ({ page }) => {
        // Find a player with enough games
        const playerCards = page.locator('[data-testid*="player-card"]');
        const firstCard = playerCards.first();

        // Click to expand
        await firstCard.click();
        await page.waitForTimeout(500);

        // Look for mini chart
        const miniChart = page.locator('[data-testid="mini-rating-chart"]');

        if (await miniChart.isVisible()) {
          // Check for line elements
          const lines = miniChart.locator("path[stroke]");
          const lineCount = await lines.count();

          console.log(`${env.name} - Mini chart lines found: ${lineCount}`);

          if (lineCount > 0) {
            const firstLine = lines.first();
            const stroke = await firstLine.getAttribute("stroke");
            const strokeWidth = await firstLine.getAttribute("stroke-width");

            console.log(
              `${env.name} - Line stroke: ${stroke}, width: ${strokeWidth}`
            );

            // Check if line is transparent (bug)
            if (stroke === "transparent" || strokeWidth === "0") {
              throw new Error(`${env.name} still has transparent chart lines`);
            }
          }
        }
      });
    });

    test.describe("Issue #3: Average Placement", () => {
      test("should show average placement in expanded cards", async ({
        page,
      }) => {
        const firstCard = page.locator('[data-testid*="player-card"]').first();
        await firstCard.click();
        await page.waitForTimeout(500);

        // Look for average placement text
        const expandedContent = await page
          .locator('text="Avg Placement"')
          .count();

        if (expandedContent === 0) {
          console.log(
            `${env.name} - No "Avg Placement" text found in expanded card`
          );

          // Take screenshot for debugging
          await page.screenshot({
            path: `test-results/${env.name.toLowerCase()}-avg-placement-missing.png`,
          });
        } else {
          const avgPlacementElement = page
            .locator('text="Avg Placement"')
            .locator("..");
          const text = await avgPlacementElement.textContent();
          console.log(`${env.name} - Avg Placement text: ${text}`);

          // Check if it shows a value or just "—"
          const hasValue = /\d+\.\d+/.test(text || "");
          console.log(`${env.name} - Has numeric value: ${hasValue}`);
        }
      });
    });

    test.describe("Issue #7: Desktop Navigation", () => {
      test("bottom navigation visibility on desktop", async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1200, height: 800 });

        const bottomNav = page.locator('nav[aria-label="Main navigation"]');
        const isVisible = await bottomNav.isVisible();

        console.log(`${env.name} - Desktop nav visible: ${isVisible}`);

        if (!isVisible) {
          // Check if it has md:hidden class
          const className = await bottomNav.getAttribute("class");
          console.log(`${env.name} - Nav classes: ${className}`);

          if (className?.includes("md:hidden")) {
            throw new Error(
              `${env.name} still has md:hidden class on navigation`
            );
          }
        }

        // Take screenshot
        await page.screenshot({
          path: `test-results/${env.name.toLowerCase()}-desktop-nav.png`,
        });
      });
    });

    test.describe("Issue #9: PWA Notification", () => {
      test("PWA notification should have dismiss functionality", async ({
        page,
      }) => {
        const pwaNotification = page.locator('text="PWA Status"');

        if (await pwaNotification.isVisible()) {
          console.log(`${env.name} - PWA notification is visible`);

          // Look for dismiss button
          const dismissButton = page.locator(
            'button[aria-label="Dismiss notification"]'
          );
          const hasDismiss = (await dismissButton.count()) > 0;

          console.log(`${env.name} - Has dismiss button: ${hasDismiss}`);

          if (!hasDismiss) {
            // Take screenshot
            await page.screenshot({
              path: `test-results/${env.name.toLowerCase()}-pwa-no-dismiss.png`,
            });
            throw new Error(
              `${env.name} PWA notification has no dismiss button`
            );
          }
        }
      });
    });

    test("Take full page screenshot for inspection", async ({ page }) => {
      await page.screenshot({
        path: `test-results/${env.name.toLowerCase()}-full-page.png`,
        fullPage: true,
      });
    });
  });
});
