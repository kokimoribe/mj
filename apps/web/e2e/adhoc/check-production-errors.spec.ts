import { test, expect } from "@playwright/test";

test.describe("Production Error Check", () => {
  test("check for database and service worker errors", async ({ page }) => {
    const errors: string[] = [];

    // Capture console errors
    page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Capture page errors
    page.on("pageerror", error => {
      errors.push(error.message);
    });

    // Navigate to production
    await page.goto("https://mj-web-psi.vercel.app/", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    // Wait a moment for errors to appear
    await page.waitForTimeout(3000);

    // Log errors found
    console.log("Errors found:", errors);

    // Check for specific errors
    const hasPlayerNameError = errors.some(e => e.includes("players_2.name"));
    const hasServiceWorkerError = errors.some(e =>
      e.includes("_ref is not defined")
    );

    // Report findings
    if (hasPlayerNameError) {
      console.log("❌ Database error found: players_2.name column issue");
    }
    if (hasServiceWorkerError) {
      console.log("❌ Service worker error found: _ref is not defined");
    }

    // Check if any player data is visible
    const hasPlayerData =
      (await page.locator("text=/[0-9]+\\.[0-9]+/").count()) > 0;
    console.log("Has player rating data visible:", hasPlayerData);

    // Make assertions
    expect(hasPlayerNameError).toBe(false);
    expect(hasServiceWorkerError).toBe(false);
    expect(hasPlayerData).toBe(true);
  });
});
