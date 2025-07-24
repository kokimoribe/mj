import { test, expect } from "@playwright/test";

/**
 * Comprehensive verification test for all reported bugs
 * This test verifies the actual state of all issues in both local and production
 */

const environments = [
  { name: "Production", url: "https://mj-web-psi.vercel.app" },
  { name: "Local", url: "http://localhost:3000" },
];

environments.forEach(env => {
  test.describe(`${env.name} - Comprehensive Bug Verification`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(env.url);
      await page.waitForSelector('[data-testid="leaderboard-view"]', {
        timeout: 15000,
      });
    });

    test("Complete verification of all 9 reported issues", async ({ page }) => {
      const results = {
        environment: env.name,
        timestamp: new Date().toISOString(),
        issues: {} as Record<string, any>,
      };

      // Issue 1: Game Count
      const header = page.locator('[data-testid="leaderboard-header"]');
      const headerText = await header.textContent();
      const gameCountMatch = headerText?.match(/(\d+)\s*games/i);
      const gameCount = gameCountMatch ? parseInt(gameCountMatch[1]) : 0;

      // Calculate expected count
      const playerCards = page.locator('[data-testid*="player-card"]');
      const playerCount = await playerCards.count();
      let maxGames = 0;
      let sumGames = 0;

      for (let i = 0; i < playerCount; i++) {
        const cardText = await playerCards.nth(i).textContent();
        const gamesMatch = cardText?.match(/(\d+)\s*game/);
        if (gamesMatch) {
          const games = parseInt(gamesMatch[1]);
          maxGames = Math.max(maxGames, games);
          sumGames += games;
        }
      }

      results.issues["game_count"] = {
        displayed: gameCount,
        expected_max: maxGames,
        actual_sum: sumGames,
        is_correct: gameCount === maxGames,
        bug_present: gameCount === sumGames && gameCount !== maxGames,
      };

      // Issue 2 & 4: Chart Lines
      const firstCard = playerCards.first();
      await firstCard.click();
      await page.waitForTimeout(500);

      const miniChart = page.locator('[data-testid="mini-rating-chart"]');
      let chartLineInfo = { visible: false, stroke: "none", strokeWidth: "0" };

      if (await miniChart.isVisible()) {
        const lines = miniChart.locator("path[stroke]");
        if ((await lines.count()) > 0) {
          const firstLine = lines.first();
          chartLineInfo = {
            visible: true,
            stroke: (await firstLine.getAttribute("stroke")) || "none",
            strokeWidth: (await firstLine.getAttribute("stroke-width")) || "0",
          };
        }
      }

      results.issues["chart_lines"] = {
        ...chartLineInfo,
        is_correct:
          chartLineInfo.stroke === "#10b981" &&
          chartLineInfo.strokeWidth === "2",
        bug_present:
          chartLineInfo.stroke === "transparent" ||
          chartLineInfo.strokeWidth === "0",
      };

      // Issue 3 & 5: Average Placement
      const avgPlacementVisible = await page
        .locator('text="Avg Placement"')
        .isVisible();
      let avgPlacementValue = null;

      if (avgPlacementVisible) {
        const container = page.locator('text="Avg Placement"').locator("..");
        const text = await container.textContent();
        const valueMatch = text?.match(/([1-4]\.\d)/);
        avgPlacementValue = valueMatch
          ? valueMatch[1]
          : text?.includes("—")
            ? "—"
            : null;
      }

      results.issues["average_placement"] = {
        visible: avgPlacementVisible,
        value: avgPlacementValue,
        is_correct:
          avgPlacementVisible &&
          avgPlacementValue !== "—" &&
          avgPlacementValue !== null,
        bug_present: !avgPlacementVisible || avgPlacementValue === "—",
      };

      // Close expanded card
      await firstCard.click();

      // Issue 6 & 8: Games Tab
      const gamesNav = page
        .locator('nav[aria-label="Main navigation"]')
        .locator('text="Games"');
      const gamesNavVisible = await gamesNav.isVisible();

      if (gamesNavVisible) {
        await gamesNav.click();
        await page.waitForURL("**/games");

        // Check if games load
        await page.waitForTimeout(2000);
        const errorMessage = await page
          .locator('text="Failed to load game history"')
          .isVisible();
        const hasGames =
          (await page.locator('[data-testid*="game-"]').count()) > 0;

        results.issues["games_tab"] = {
          navigation_visible: gamesNavVisible,
          error_shown: errorMessage,
          games_loaded: hasGames,
          is_correct: gamesNavVisible && !errorMessage && hasGames,
          bug_present: !gamesNavVisible || errorMessage || !hasGames,
        };
      } else {
        results.issues["games_tab"] = {
          navigation_visible: false,
          error_shown: null,
          games_loaded: null,
          is_correct: false,
          bug_present: true,
        };
      }

      // Go back to leaderboard
      await page.goto(env.url);
      await page.waitForSelector('[data-testid="leaderboard-view"]');

      // Issue 7: Desktop Navigation
      await page.setViewportSize({ width: 1200, height: 800 });
      const nav = page.locator('nav[aria-label="Main navigation"]');
      const navVisible = await nav.isVisible();
      const navClasses = await nav.getAttribute("class");

      results.issues["desktop_navigation"] = {
        visible: navVisible,
        classes: navClasses,
        has_md_hidden: navClasses?.includes("md:hidden"),
        is_correct: navVisible && !navClasses?.includes("md:hidden"),
        bug_present: !navVisible || navClasses?.includes("md:hidden"),
      };

      // Issue 9: PWA Notification
      const pwaNotification = page.locator('text="PWA Status"');
      const pwaVisible = await pwaNotification.isVisible();
      let hasDismissButton = false;

      if (pwaVisible) {
        const dismissButton = page.locator(
          'button[aria-label="Dismiss notification"]'
        );
        hasDismissButton = (await dismissButton.count()) > 0;
      }

      results.issues["pwa_notification"] = {
        visible: pwaVisible,
        has_dismiss_button: hasDismissButton,
        is_correct: !pwaVisible || hasDismissButton,
        bug_present: pwaVisible && !hasDismissButton,
      };

      // Summary
      const bugCount = Object.values(results.issues).filter(
        (issue: any) => issue.bug_present
      ).length;
      const fixedCount = Object.values(results.issues).filter(
        (issue: any) => issue.is_correct && !issue.bug_present
      ).length;

      console.log(`\n${env.name} Results:`);
      console.log("=".repeat(50));
      console.log(JSON.stringify(results, null, 2));
      console.log(`\nBugs Present: ${bugCount}/9`);
      console.log(`Fixed: ${fixedCount}/9`);
      console.log("=".repeat(50));

      // Store results for analysis
      await page.evaluate(r => {
        (window as any).testResults = r;
      }, results);
    });
  });
});
