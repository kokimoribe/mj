import { test, expect } from "@playwright/test";

test.describe("Rating Chart Validation", () => {
  test("rating chart should not have massive spikes or incorrect Y-axis values", async ({
    page,
  }) => {
    // Navigate to a player profile
    await page.goto("/player/e0f959ee-eb77-57de-b3af-acdecf679e70");
    await page.waitForLoadState("networkidle");

    // Wait for chart to be visible
    const chart = page.locator('[data-testid="rating-chart"]');
    await expect(chart).toBeVisible();

    // Get Y-axis values
    const yAxisValues = await page.evaluate(() => {
      const chart = document.querySelector(
        '[data-testid="rating-chart"] .recharts-wrapper'
      );
      if (!chart) return [];

      return Array.from(chart.querySelectorAll(".recharts-yAxis text"))
        .map(el => el.textContent)
        .filter(text => text && text.trim())
        .map(text => parseFloat(text || "0"));
    });

    console.log("Y-axis values:", yAxisValues);

    // Validate Y-axis values
    expect(yAxisValues.length).toBeGreaterThan(0);

    // Check that Y-axis values are reasonable rating values (typically 0-100)
    for (const value of yAxisValues) {
      expect(value).toBeGreaterThanOrEqual(-50); // Allow some negative ratings for beginners
      expect(value).toBeLessThanOrEqual(150); // Max reasonable rating
    }

    // Check that the range is reasonable (not spanning thousands)
    const minY = Math.min(...yAxisValues);
    const maxY = Math.max(...yAxisValues);
    const range = maxY - minY;

    expect(range).toBeLessThan(100); // Rating range should not be more than 100 points

    // Check for scientific notation (values like 3e8)
    const yAxisTexts = await page.evaluate(() => {
      const chart = document.querySelector(
        '[data-testid="rating-chart"] .recharts-wrapper'
      );
      if (!chart) return [];

      return Array.from(chart.querySelectorAll(".recharts-yAxis text"))
        .map(el => el.textContent)
        .filter(text => text && text.trim());
    });

    for (const text of yAxisTexts) {
      expect(text).not.toMatch(/[eE][+-]?\d+/); // No scientific notation
      expect(text).not.toMatch(/\d{6,}/); // No numbers with 6+ digits
    }
  });

  test("rating chart data should be consistent with displayed rating", async ({
    page,
  }) => {
    await page.goto("/player/e0f959ee-eb77-57de-b3af-acdecf679e70");
    await page.waitForLoadState("networkidle");

    // Get the displayed current rating
    const displayedRating = await page
      .locator('[data-testid="player-rating"]')
      .textContent();
    const currentRating = parseFloat(displayedRating || "0");

    console.log("Current displayed rating:", currentRating);

    // Hover over the last data point to check its value
    const dots = await page.locator(".recharts-dot").all();
    if (dots.length > 0) {
      const lastDot = dots[dots.length - 1];
      await lastDot.hover();
      await page.waitForTimeout(300);

      // Get tooltip value
      const tooltipText = await page.evaluate(() => {
        const tooltip = document.querySelector(".recharts-tooltip-wrapper");
        return tooltip ? tooltip.textContent : "";
      });

      console.log("Last point tooltip:", tooltipText);

      // Extract rating from tooltip
      const ratingMatch = tooltipText?.match(/Rating:\s*([\d.]+)/);
      if (ratingMatch) {
        const lastPointRating = parseFloat(ratingMatch[1]);

        // The last point should either be:
        // 1. Close to the current rating (within 5 points)
        // 2. OR it should be from an actual game (not the artificial "current" point)
        const difference = Math.abs(lastPointRating - currentRating);

        if (difference > 5) {
          // This might be the artificial spike issue
          console.warn(
            `Large difference between last point (${lastPointRating}) and current rating (${currentRating})`
          );

          // Check if this is causing Y-axis scaling issues
          const yAxisValues = await page.evaluate(() => {
            const chart = document.querySelector(
              '[data-testid="rating-chart"] .recharts-wrapper'
            );
            if (!chart) return [];

            return Array.from(chart.querySelectorAll(".recharts-yAxis text"))
              .map(el => el.textContent)
              .filter(text => text && text.trim())
              .map(text => parseFloat(text || "0"));
          });

          const maxY = Math.max(...yAxisValues);
          expect(maxY).toBeLessThan(lastPointRating + 10); // Y-axis shouldn't extend too far beyond data
        }
      }
    }
  });

  test("rating chart should show proper progression without artificial spikes", async ({
    page,
  }) => {
    // Monitor API responses to understand the data
    let gameResults: any[] = [];

    page.on("response", async response => {
      if (response.url().includes("cached_game_results")) {
        try {
          const data = await response.json();
          if (Array.isArray(data)) {
            gameResults = data;
          }
        } catch (e) {
          // Ignore
        }
      }
    });

    await page.goto("/player/e0f959ee-eb77-57de-b3af-acdecf679e70");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Get Y-axis range from chart first
    const yAxisValues = await page.evaluate(() => {
      const chart = document.querySelector(
        '[data-testid="rating-chart"] .recharts-wrapper'
      );
      if (!chart) return [];

      return Array.from(chart.querySelectorAll(".recharts-yAxis text"))
        .map(el => el.textContent)
        .filter(text => text && text.trim())
        .map(text => parseFloat(text || "0"));
    });

    if (yAxisValues.length > 0) {
      const chartMin = Math.min(...yAxisValues);
      const chartMax = Math.max(...yAxisValues);
      const chartRange = chartMax - chartMin;

      console.log(`Chart Y-axis range: ${chartMin} to ${chartMax}`);
      console.log(`Chart range span: ${chartRange}`);

      // The chart range should be reasonable (not too wide)
      expect(chartRange).toBeLessThan(100); // Rating range shouldn't span more than 100 points

      // Y-axis values should be reasonable rating values
      expect(chartMin).toBeGreaterThanOrEqual(-50); // Allow some negative ratings
      expect(chartMax).toBeLessThanOrEqual(150); // Max reasonable rating
    }

    // If we got game results, log them for debugging
    if (gameResults.length > 0) {
      const ratings = gameResults
        .filter(
          game => game.mu_after !== undefined && game.sigma_after !== undefined
        )
        .map(game => game.mu_after - 3 * game.sigma_after);

      if (ratings.length > 0) {
        const minRating = Math.min(...ratings);
        const maxRating = Math.max(...ratings);

        console.log(
          `Game ratings range: ${minRating.toFixed(1)} to ${maxRating.toFixed(1)}`
        );
      } else {
        console.log("No valid game ratings found in API response");
      }
    } else {
      console.log("No game results captured from API");
    }
  });
});
