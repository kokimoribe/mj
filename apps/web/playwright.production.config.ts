import { defineConfig, devices } from "@playwright/test";

/**
 * Production-specific Playwright configuration
 * For testing against deployed Vercel app without local dev server
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once for production flakiness
  workers: process.env.CI ? 1 : 2, // Limit concurrency for production
  reporter: [["html"], ["list"]],

  use: {
    // NO baseURL - we'll use full URLs in tests
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Production-specific settings
    actionTimeout: 15000, // Longer timeouts for production
    navigationTimeout: 30000,

    // Add user agent to avoid bot detection
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },

  projects: [
    {
      name: "production-chrome",
      use: {
        ...devices["Desktop Chrome"],
        // Additional production settings
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "production-mobile",
      use: {
        ...devices["iPhone 12"],
      },
    },
  ],

  // NO webServer configuration - we're testing against deployed app
});
