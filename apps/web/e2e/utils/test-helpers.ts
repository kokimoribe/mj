import { Page, expect } from "@playwright/test";
import path from "path";
import fs from "fs/promises";

/**
 * Wait for data to load and animations to complete
 */
export async function waitForDataLoad(page: Page) {
  // Wait for network idle (no requests for 500ms)
  await page.waitForLoadState("networkidle");
  // Wait a bit more for animations
  await page.waitForTimeout(500);
}

/**
 * Take a screenshot with consistent settings
 */
export async function takeScreenshot(page: Page, name: string) {
  // Ensure screenshots directory exists
  const screenshotDir = path.join(process.cwd(), "e2e/screenshots");
  const subDir = path.dirname(path.join(screenshotDir, name));
  await fs.mkdir(subDir, { recursive: true });

  // Wait for everything to load
  await waitForDataLoad(page);

  // Take the screenshot
  await page.screenshot({
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true,
    animations: "disabled", // Disable animations for consistent screenshots
  });
}

/**
 * Navigate to a page and wait for it to load
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await waitForDataLoad(page);
}

/**
 * Check if an element is visible and stable
 */
export async function waitForElement(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.waitFor({ state: "visible" });
  // Wait for element to stop moving (animations complete)
  await page.waitForTimeout(100);
  return element;
}

/**
 * Mock API responses for consistent testing
 */
export async function mockAPIResponses(page: Page) {
  // Mock games data for game history (handle both /api/games and direct /games)
  await page.route("**/games**", async route => {
    const mockGames = {
      games: Array.from({ length: 15 }, (_, i) => ({
        id: `game-${i + 1}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        seasonId: "season_3_2024",
        results: [
          {
            playerId: "player-1",
            playerName: "Joseph",
            placement: ((i % 4) + 1) as 1 | 2 | 3 | 4,
            rawScore: 42700 - i * 1000,
            scoreAdjustment: 32700 - i * 1000,
            ratingBefore: 25.0 + i * 0.5,
            ratingAfter: 25.8 + i * 0.5,
            ratingChange: 0.8,
          },
          {
            playerId: "player-2",
            playerName: "Alice",
            placement: (((i + 1) % 4) + 1) as 1 | 2 | 3 | 4,
            rawScore: 31100 - i * 1000,
            scoreAdjustment: 16100 - i * 1000,
            ratingBefore: 24.0 + i * 0.3,
            ratingAfter: 24.4 + i * 0.3,
            ratingChange: 0.4,
          },
          {
            playerId: "player-3",
            playerName: "Mikey",
            placement: (((i + 2) % 4) + 1) as 1 | 2 | 3 | 4,
            rawScore: 14400 - i * 500,
            scoreAdjustment: -20600 - i * 500,
            ratingBefore: 23.0 + i * 0.2,
            ratingAfter: 22.7 + i * 0.2,
            ratingChange: -0.3,
          },
          {
            playerId: "player-4",
            playerName: "Frank",
            placement: (((i + 3) % 4) + 1) as 1 | 2 | 3 | 4,
            rawScore: 11800 - i * 500,
            scoreAdjustment: -28200 - i * 500,
            ratingBefore: 22.0 + i * 0.1,
            ratingAfter: 21.5 + i * 0.1,
            ratingChange: -0.5,
          },
        ],
      })),
      totalGames: 24,
      hasMore: true,
      showingAll: false,
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockGames),
    });
  });

  // Mock all players for dropdown
  await page.route("**/players*", async route => {
    const url = route.request().url();

    // Skip if it's a specific player or games request
    if (url.match(/players\/[^/]+/) || url.includes("/games")) {
      return;
    }

    // Mock all players for the dropdown
    const mockPlayers = [
      { id: "player-1", name: "Joseph" },
      { id: "player-2", name: "Alice" },
      { id: "player-3", name: "Mikey" },
      { id: "player-4", name: "Frank" },
      { id: "player-5", name: "Sarah" },
      { id: "player-6", name: "Alex" },
    ];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockPlayers),
    });
  });

  // Mock leaderboard data
  await page.route("**/leaderboard", async route => {
    const mockData = {
      seasonName: "Test Season",
      totalGames: 100,
      totalPlayers: 3,
      lastUpdated: new Date().toISOString(),
      players: [
        {
          id: "test-player-1",
          name: "Test Player 1",
          rating: 1500,
          games: 20,
          lastGameDate: new Date().toISOString(),
          totalPlusMinus: 500,
          averagePlusMinus: 25,
          ratingChange: 5.2,
        },
        {
          id: "test-player-2",
          name: "Test Player 2",
          rating: 1450,
          games: 18,
          lastGameDate: new Date().toISOString(),
          totalPlusMinus: 200,
          averagePlusMinus: 11.1,
          ratingChange: -2.3,
        },
        {
          id: "test-player-3",
          name: "Test Player 3",
          rating: 1400,
          games: 15,
          lastGameDate: new Date().toISOString(),
          totalPlusMinus: -100,
          averagePlusMinus: -6.7,
          ratingChange: 1.1,
        },
      ],
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockData),
    });
  });

  // Mock player games data (handles both /api and full URL patterns)
  await page.route("**/players/*/games*", async route => {
    const mockGames = Array.from({ length: 10 }, (_, i) => ({
      id: `game-${i + 1}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      placement: ((i % 4) + 1) as 1 | 2 | 3 | 4,
      score: 25000 - i * 1000 + Math.floor(Math.random() * 5000),
      plusMinus: i % 2 === 0 ? 1000 - i * 100 : -500 - i * 50,
      ratingBefore: 25.0 + (9 - i) * 0.5,
      ratingAfter: 25.0 + (10 - i) * 0.5,
      ratingChange: 0.5,
      opponents: [
        {
          name: "Mikey",
          id: "mikey",
          placement: (((i + 1) % 4) + 1) as 1 | 2 | 3 | 4,
          score: 24000,
        },
        {
          name: "Sarah",
          id: "sarah",
          placement: (((i + 2) % 4) + 1) as 1 | 2 | 3 | 4,
          score: 23000,
        },
        {
          name: "Alex",
          id: "alex",
          placement: (((i + 3) % 4) + 1) as 1 | 2 | 3 | 4,
          score: 22000,
        },
      ],
    }));

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockGames),
    });
  });

  // Mock player profile data (must come after games route)
  await page.route("**/players/*", async route => {
    const url = route.request().url();
    const parts = url.split("/");
    const playerId = parts[parts.length - 1];

    // Skip if it's a games request - handled above
    if (url.includes("/games")) {
      return;
    }

    // Player profile data
    const mockPlayer = {
      id: playerId,
      name: playerId.charAt(0).toUpperCase() + playerId.slice(1),
      rating: 25.0 + Math.random() * 10,
      mu: 25,
      sigma: 8.33,
      games: 20,
      lastGameDate: new Date().toISOString(),
      totalPlusMinus: 500,
      averagePlusMinus: 25,
      bestGame: 100,
      worstGame: -50,
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockPlayer),
    });
  });
}

/**
 * Check accessibility of the current page
 */
export async function checkAccessibility(page: Page, name: string) {
  // This is a basic check - for real accessibility testing, use @axe-core/playwright
  const results = await page.evaluate(() => {
    const issues: string[] = [];

    // Check for missing alt text on images
    const images = document.querySelectorAll("img");
    images.forEach(img => {
      if (!img.alt) {
        issues.push(`Image missing alt text: ${img.src}`);
      }
    });

    // Check for missing labels on form controls
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach(input => {
      const id = input.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (!label && !input.getAttribute("aria-label")) {
          issues.push(`Input missing label: ${id}`);
        }
      }
    });

    // Check for proper heading hierarchy
    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    );
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1]);
      if (level > lastLevel + 1) {
        issues.push(
          `Heading hierarchy skip: ${heading.tagName} after h${lastLevel}`
        );
      }
      lastLevel = level;
    });

    return issues;
  });

  if (results.length > 0) {
    console.warn(`Accessibility issues in ${name}:`, results);
  }
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation(page: Page, elements: string[]) {
  // Start from the top of the page
  await page.keyboard.press("Tab");

  for (const selector of elements) {
    // Check if the expected element has focus
    const focusedElement = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-testid")
    );
    const element = page.locator(selector);
    const testId = await element.getAttribute("data-testid");

    expect(focusedElement).toBe(testId);

    // Move to next element
    await page.keyboard.press("Tab");
  }
}

/**
 * Measure performance metrics
 */
export async function measurePerformance(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    return {
      // Time to first byte
      ttfb: navigation.responseStart - navigation.requestStart,
      // DOM Content Loaded
      domContentLoaded:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      // Load complete
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    };
  });

  return metrics;
}
