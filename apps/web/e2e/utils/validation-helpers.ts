import { Page } from "@playwright/test";

/**
 * Monitor console for errors during test execution
 * @param page Playwright page object
 * @returns Array of console errors that occurred
 */
export function setupConsoleErrorMonitoring(page: Page): string[] {
  const consoleErrors: string[] = [];

  page.on("console", msg => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", error => {
    consoleErrors.push(error.message);
  });

  return consoleErrors;
}

/**
 * Validate API response structure matches expected shape
 */
export async function validateAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  validator: (data: any) => void
): Promise<void> {
  const response = await page.waitForResponse(urlPattern);
  const data = await response.json();
  validator(data);
}

/**
 * Validate leaderboard API response structure
 */
export function validateLeaderboardResponse(data: any): void {
  // Validate top-level structure
  if (!data.players || !Array.isArray(data.players)) {
    throw new Error("Leaderboard response missing players array");
  }
  if (typeof data.totalGames !== "number") {
    throw new Error("Leaderboard response missing totalGames number");
  }
  if (!data.lastUpdated || typeof data.lastUpdated !== "string") {
    throw new Error("Leaderboard response missing lastUpdated string");
  }
  if (!data.seasonName || typeof data.seasonName !== "string") {
    throw new Error("Leaderboard response missing seasonName string");
  }

  // Validate each player
  data.players.forEach((player: any, index: number) => {
    if (!player.id || typeof player.id !== "string") {
      throw new Error(`Player ${index} missing id`);
    }
    if (!player.name || typeof player.name !== "string") {
      throw new Error(`Player ${index} missing name`);
    }
    if (typeof player.rating !== "number") {
      throw new Error(`Player ${index} missing rating number`);
    }
    if (
      typeof player.gamesPlayed !== "number" ||
      !Number.isInteger(player.gamesPlayed)
    ) {
      throw new Error(`Player ${index} missing gamesPlayed integer`);
    }
    if (!player.lastPlayed || typeof player.lastPlayed !== "string") {
      throw new Error(`Player ${index} missing lastPlayed string`);
    }
    // Validate date is parseable
    const date = new Date(player.lastPlayed);
    if (isNaN(date.getTime())) {
      throw new Error(
        `Player ${index} has invalid lastPlayed date: ${player.lastPlayed}`
      );
    }
  });
}

/**
 * Validate player profile API response structure
 */
export function validatePlayerProfileResponse(data: any): void {
  if (!data.id || typeof data.id !== "string") {
    throw new Error("Player profile missing id");
  }
  if (!data.name || typeof data.name !== "string") {
    throw new Error("Player profile missing name");
  }
  if (typeof data.rating !== "number") {
    throw new Error("Player profile missing rating number");
  }
  if (
    typeof data.gamesPlayed !== "number" ||
    !Number.isInteger(data.gamesPlayed)
  ) {
    throw new Error("Player profile missing gamesPlayed integer");
  }
  if (!data.lastPlayed || typeof data.lastPlayed !== "string") {
    throw new Error("Player profile missing lastPlayed string");
  }
  // Validate date is parseable
  const date = new Date(data.lastPlayed);
  if (isNaN(date.getTime())) {
    throw new Error(
      `Player profile has invalid lastPlayed date: ${data.lastPlayed}`
    );
  }
}

/**
 * Validate game history API response structure
 */
export function validateGameHistoryResponse(data: any): void {
  if (!data.games || !Array.isArray(data.games)) {
    throw new Error("Game history response missing games array");
  }

  data.games.forEach((game: any, index: number) => {
    if (!game.id || typeof game.id !== "string") {
      throw new Error(`Game ${index} missing id`);
    }
    if (!game.date || typeof game.date !== "string") {
      throw new Error(`Game ${index} missing date`);
    }
    // Validate date is parseable
    const date = new Date(game.date);
    if (isNaN(date.getTime())) {
      throw new Error(`Game ${index} has invalid date: ${game.date}`);
    }

    if (!game.results || !Array.isArray(game.results)) {
      throw new Error(`Game ${index} missing results array`);
    }

    // Validate exactly 4 players
    if (game.results.length !== 4) {
      throw new Error(
        `Game ${index} has ${game.results.length} players, expected 4`
      );
    }

    // Validate each result
    const placements = new Set<number>();
    game.results.forEach((result: any, playerIndex: number) => {
      if (!result.playerId || typeof result.playerId !== "string") {
        throw new Error(`Game ${index} player ${playerIndex} missing playerId`);
      }
      if (!result.playerName || typeof result.playerName !== "string") {
        throw new Error(
          `Game ${index} player ${playerIndex} missing playerName`
        );
      }
      if (
        typeof result.placement !== "number" ||
        result.placement < 1 ||
        result.placement > 4
      ) {
        throw new Error(
          `Game ${index} player ${playerIndex} has invalid placement: ${result.placement}`
        );
      }
      placements.add(result.placement);
      if (typeof result.rawScore !== "number") {
        throw new Error(
          `Game ${index} player ${playerIndex} missing rawScore number`
        );
      }
      if (typeof result.scoreAdjustment !== "number") {
        throw new Error(
          `Game ${index} player ${playerIndex} missing scoreAdjustment number`
        );
      }
    });

    // Validate all placements 1-4 are present
    if (placements.size !== 4) {
      throw new Error(`Game ${index} has duplicate placements`);
    }
  });
}

/**
 * Wait for and validate that an element contains valid numeric data
 */
export async function validateNumericContent(
  page: Page,
  selector: string,
  options?: {
    min?: number;
    max?: number;
    isInteger?: boolean;
    decimalPlaces?: number;
  }
): Promise<number> {
  const element = page.locator(selector);
  const text = await element.textContent();

  if (!text) {
    throw new Error(`Element ${selector} has no text content`);
  }

  // Extract numeric value from text (handles formats like "46.3" or "↑4.2")
  const match = text.match(/[-+]?\d*\.?\d+/);
  if (!match) {
    throw new Error(`Element ${selector} contains no numeric value: "${text}"`);
  }

  const value = parseFloat(match[0]);

  if (isNaN(value)) {
    throw new Error(
      `Element ${selector} contains invalid number: "${match[0]}"`
    );
  }

  if (options?.isInteger && !Number.isInteger(value)) {
    throw new Error(`Element ${selector} expected integer but got: ${value}`);
  }

  if (options?.min !== undefined && value < options.min) {
    throw new Error(
      `Element ${selector} value ${value} is below minimum ${options.min}`
    );
  }

  if (options?.max !== undefined && value > options.max) {
    throw new Error(
      `Element ${selector} value ${value} is above maximum ${options.max}`
    );
  }

  if (options?.decimalPlaces !== undefined) {
    const parts = value.toString().split(".");
    const actualDecimals = parts[1]?.length || 0;
    if (actualDecimals > options.decimalPlaces) {
      throw new Error(
        `Element ${selector} has ${actualDecimals} decimal places, expected max ${options.decimalPlaces}`
      );
    }
  }

  return value;
}

/**
 * Measure actual page load performance
 */
export async function measurePageLoadTime(page: Page): Promise<number> {
  const startTime = Date.now();

  // Wait for the page to be fully loaded
  await page.waitForLoadState("networkidle");

  // Also wait for any lazy-loaded content
  const loadTime = Date.now() - startTime;

  return loadTime;
}

/**
 * Validate that dates are displayed in a relative format
 */
export async function validateRelativeDate(
  page: Page,
  selector: string
): Promise<void> {
  const element = page.locator(selector);
  const text = await element.textContent();

  if (!text) {
    throw new Error(`Element ${selector} has no text content`);
  }

  // Should match patterns like "3 days ago", "Just now", "Today", "N/A"
  const validPatterns = [
    /\d+ (second|minute|hour|day|week|month|year)s? ago/,
    /Just now/,
    /Today/,
    /Yesterday/,
    /N\/A/,
  ];

  const isValid = validPatterns.some(pattern => pattern.test(text));

  if (!isValid) {
    throw new Error(
      `Element ${selector} does not contain valid relative date: "${text}"`
    );
  }
}

/**
 * Validate chart is rendering with data points
 */
export async function validateChartRendering(
  page: Page,
  chartSelector: string,
  minDataPoints: number = 2
): Promise<void> {
  const chart = page.locator(chartSelector);
  await chart.waitFor({ state: "visible" });

  // Check for SVG element
  const svg = chart.locator("svg").first();
  await svg.waitFor({ state: "visible" });

  // Check for data points (circles)
  const dataPoints = chart.locator("circle");
  const count = await dataPoints.count();

  if (count < minDataPoints) {
    throw new Error(
      `Chart ${chartSelector} has ${count} data points, expected at least ${minDataPoints}`
    );
  }

  // Validate axes are present
  const xAxis = chart.locator(".recharts-xAxis");
  const yAxis = chart.locator(".recharts-yAxis");

  await xAxis.waitFor({ state: "visible" });
  await yAxis.waitFor({ state: "visible" });
}

/**
 * Validate PWA installation capability
 */
export async function validatePWACapability(page: Page): Promise<void> {
  // Check for manifest
  const manifestResponse = await page.goto("/manifest.json");
  if (!manifestResponse || !manifestResponse.ok()) {
    throw new Error("PWA manifest not found or not accessible");
  }

  const manifest = await manifestResponse.json();

  // Validate required manifest fields
  if (!manifest.name || !manifest.short_name) {
    throw new Error("PWA manifest missing required name fields");
  }

  if (
    !manifest.icons ||
    !Array.isArray(manifest.icons) ||
    manifest.icons.length === 0
  ) {
    throw new Error("PWA manifest missing icons");
  }

  if (!manifest.start_url) {
    throw new Error("PWA manifest missing start_url");
  }

  if (
    !manifest.display ||
    !["standalone", "fullscreen", "minimal-ui"].includes(manifest.display)
  ) {
    throw new Error("PWA manifest has invalid display mode");
  }

  // Check for service worker
  const hasServiceWorker = await page.evaluate(() => {
    return "serviceWorker" in navigator;
  });

  if (!hasServiceWorker) {
    throw new Error("Service worker not supported in this browser");
  }
}
