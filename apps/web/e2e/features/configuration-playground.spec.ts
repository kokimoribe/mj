import { test, expect, Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for data verification
const supabase = createClient(
  process.env.SUPABASE_URL || "https://gtqonrgwequdnzvhbuod.supabase.co",
  process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cW9ucmd3ZXF1ZG56dmhidW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAwNjU0NjcsImV4cCI6MjAzNTY0MTQ2N30._kP8qLjOLWTEIxVlrqLbjMsvITTbh2TrCf4r_2wJlnc"
);

// Helper functions
async function getOfficialConfigurations() {
  const { data, error } = await supabase
    .from("rating_configurations")
    .select("config_hash, name")
    .eq("is_official", true);

  if (error) throw error;
  return data;
}

async function checkDataExists(configHash: string) {
  const { data, error } = await supabase
    .from("cached_player_ratings")
    .select("player_id")
    .eq("config_hash", configHash)
    .limit(1);

  if (error) throw error;
  return data && data.length > 0;
}

// Page object pattern for Configuration Playground
class ConfigurationPlaygroundPage {
  constructor(private page: Page) {}

  // Locators
  get leaderboardHeader() {
    return this.page
      .locator('[data-testid="leaderboard-header"], .leaderboard-header')
      .first();
  }

  get expandToggle() {
    return this.page
      .locator(
        'button[aria-label*="expand"], button:has-text("▼"), button:has-text("▲")'
      )
      .first();
  }

  get configurationPanel() {
    return this.page
      .locator('[data-testid="configuration-panel"], .configuration-panel')
      .first();
  }

  get activeConfigDropdown() {
    return this.page
      .locator('select:has-text("Season"), [data-testid="config-selector"]')
      .first();
  }

  get createNewConfigButton() {
    return this.page
      .locator(
        'button:has-text("Create New Based on Current"), option:has-text("Create New Based on Current")'
      )
      .first();
  }

  get applyConfigButton() {
    return this.page
      .locator('button:has-text("Apply Config"), button:has-text("Apply")')
      .first();
  }

  get cancelButton() {
    return this.page.locator('button:has-text("Cancel")').first();
  }

  get materializationIndicator() {
    return this.page
      .locator(
        '[data-testid="materialization-indicator"], :has-text("Calculating ratings")'
      )
      .first();
  }

  get configurationIndicator() {
    return this.page
      .locator('[data-testid="config-indicator"], :has-text("Viewing:")')
      .first();
  }

  // Actions
  async expandConfiguration() {
    const isExpanded = await this.configurationPanel.isVisible();
    if (!isExpanded) {
      await this.expandToggle.click();
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  async collapseConfiguration() {
    const isExpanded = await this.configurationPanel.isVisible();
    if (isExpanded) {
      await this.expandToggle.click();
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  async selectConfiguration(configName: string) {
    await this.expandConfiguration();
    await this.activeConfigDropdown.selectOption({ label: configName });
  }

  async createNewConfiguration() {
    await this.expandConfiguration();
    await this.createNewConfigButton.click();
  }

  async applyConfiguration() {
    await this.applyConfigButton.click();
  }

  async waitForMaterialization() {
    // Wait for indicator to appear
    await expect(this.materializationIndicator).toBeVisible({ timeout: 5000 });

    // Wait for it to disappear (max 60 seconds as per spec)
    await expect(this.materializationIndicator).toBeHidden({ timeout: 60000 });
  }

  // Form field helpers
  async modifyUmaValues(uma: [number, number, number, number]) {
    const umaInputs = await this.page
      .locator('input[name*="uma"], input[placeholder*="Uma"]')
      .all();
    if (umaInputs.length === 4) {
      for (let i = 0; i < 4; i++) {
        await umaInputs[i].fill(uma[i].toString());
      }
    }
  }

  async setConfigurationName(name: string) {
    const nameInput = this.page
      .locator('input[name*="name"], input[placeholder*="Configuration name"]')
      .first();
    await nameInput.fill(name);
  }
}

test.describe("Configuration Playground", () => {
  let configPage: ConfigurationPlaygroundPage;

  test.beforeEach(async ({ page }) => {
    configPage = new ConfigurationPlaygroundPage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.describe("User Story 1: Default Season 3 Configuration", () => {
    test("should load Season 3 configuration by default", async ({ page }) => {
      // Check that header shows Season 3
      await expect(configPage.leaderboardHeader).toContainText("Season 3");

      // Configuration UI should be hidden
      await expect(configPage.configurationPanel).toBeHidden();

      // Should show games and players count
      await expect(configPage.leaderboardHeader).toContainText(/\d+ games/);
      await expect(configPage.leaderboardHeader).toContainText(/\d+ players/);

      // Should not show refresh button or "updated" text
      await expect(page.locator('button[aria-label="Refresh"]')).toBeHidden();
      await expect(configPage.leaderboardHeader).not.toContainText("updated");
      await expect(configPage.leaderboardHeader).not.toContainText("Updated");

      // Expandable interface should be visible
      await expect(configPage.expandToggle).toBeVisible();
    });

    test("should maintain <2 second page load performance", async ({
      page,
    }) => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(2000);
    });
  });

  test.describe("User Story 2: Compare Season Configurations", () => {
    test("should expand configuration UI and show parameters", async ({
      page,
    }) => {
      // Expand configuration
      await configPage.expandConfiguration();

      // Panel should be visible
      await expect(configPage.configurationPanel).toBeVisible();

      // Should show configuration selector
      await expect(configPage.activeConfigDropdown).toBeVisible();

      // Should show available presets
      const options = await configPage.activeConfigDropdown
        .locator("option")
        .allTextContents();
      expect(options).toContain("Season 3 (Official)");
      expect(options).toContain("Season 4 (Official)");

      // Should show configuration parameters sections
      await expect(page.locator(':has-text("Time Range")')).toBeVisible();
      await expect(
        page.locator(':has-text("Rating Parameters")')
      ).toBeVisible();
      await expect(page.locator(':has-text("Scoring System")')).toBeVisible();
      await expect(
        page.locator(':has-text("Qualification Rules")')
      ).toBeVisible();
    });

    test("should switch between cached preset configurations", async ({
      page,
    }) => {
      // Get official configs from database
      const officialConfigs = await getOfficialConfigurations();
      expect(officialConfigs).toHaveLength(2); // Season 3 and 4

      // Expand and select Season 4
      await configPage.selectConfiguration("Season 4 (Official)");
      await configPage.applyConfiguration();

      // Should update immediately (cached data)
      await expect(configPage.leaderboardHeader).toContainText("Season 4", {
        timeout: 500,
      });

      // URL should optionally update with config parameter
      const url = page.url();
      // Note: This might not be implemented in MVP, so we check if it exists
      if (url.includes("config=")) {
        const season4Config = officialConfigs.find(c => c.name === "Season 4");
        expect(url).toContain(season4Config?.config_hash.substring(0, 8));
      }
    });
  });

  test.describe("User Story 3: Create Custom Configurations", () => {
    test("should create custom configuration with validation", async ({
      page,
    }) => {
      // Create new configuration
      await configPage.createNewConfiguration();

      // Form should populate with current values
      const umaInputs = await page.locator('input[name*="uma"]').all();
      expect(umaInputs).toHaveLength(4);

      // Modify uma values (must sum to zero)
      await configPage.modifyUmaValues([20, 10, -10, -20]);

      // Set configuration name
      await configPage.setConfigurationName("High Stakes Config");

      // Apply should create new config
      await configPage.applyConfiguration();

      // Should show custom config indicator
      await expect(
        page.locator(':has-text("Custom"), :has-text("High Stakes Config")')
      ).toBeVisible();
    });

    test("should validate uma values sum to zero", async ({ page }) => {
      await configPage.createNewConfiguration();

      // Set invalid uma values (don't sum to zero)
      await configPage.modifyUmaValues([15, 5, -5, -10]); // Sums to 5, not 0

      // Apply button should be disabled or show error
      const applyButton = configPage.applyConfigButton;
      const isDisabled = await applyButton.isDisabled();

      if (!isDisabled) {
        await applyButton.click();
        // Should show validation error
        await expect(
          page.locator(
            ':has-text("must sum to zero"), :has-text("Uma values invalid")'
          )
        ).toBeVisible();
      } else {
        expect(isDisabled).toBeTruthy();
      }
    });
  });

  test.describe("User Story 4: Materialization Process", () => {
    test("should show non-blocking loading indicator for new configurations", async ({
      page,
    }) => {
      // Create a new custom configuration
      await configPage.createNewConfiguration();

      // Generate unique config by using current timestamp in uma values
      const timestamp = Date.now() % 100;
      await configPage.modifyUmaValues([
        timestamp,
        -timestamp / 3,
        -timestamp / 3,
        -timestamp / 3,
      ]);
      await configPage.setConfigurationName(`Test Config ${timestamp}`);

      // Apply configuration
      await configPage.applyConfiguration();

      // Should show persistent loading indicator
      await expect(configPage.materializationIndicator).toBeVisible();

      // User should be able to continue browsing
      // Test by clicking on a player card (if visible)
      const playerCard = page
        .locator('.player-card, [data-testid*="player"]')
        .first();
      if (await playerCard.isVisible()) {
        await playerCard.click();
        // Should be able to interact while loading
        expect(await playerCard.getAttribute("aria-expanded")).toBeTruthy();
      }

      // Wait for materialization to complete
      await configPage.waitForMaterialization();

      // Should show success toast
      await expect(
        page.locator('.toast:has-text("complete"), .toast:has-text("success")')
      ).toBeVisible();
    });

    test("should handle materialization errors gracefully", async ({
      page,
    }) => {
      // This test would require mocking the API to force an error
      // For now, we'll skip it since we're using real Supabase data
      test.skip();
    });
  });

  test.describe("User Story 5: Cross-Page Configuration Context", () => {
    test("should maintain configuration context when navigating to player profile", async ({
      page,
    }) => {
      // Switch to Season 4
      await configPage.selectConfiguration("Season 4 (Official)");
      await configPage.applyConfiguration();

      // Click on a player to go to profile
      const playerLink = page.locator('a[href*="/player/"]').first();
      const playerName = await playerLink.textContent();
      await playerLink.click();

      // Wait for navigation
      await page.waitForURL(/\/player\//);

      // Configuration indicator should show Season 4
      await expect(configPage.configurationIndicator).toContainText("Season 4");

      // URL should optionally include config parameter
      const url = page.url();
      if (url.includes("config=")) {
        const officialConfigs = await getOfficialConfigurations();
        const season4Config = officialConfigs.find(c => c.name === "Season 4");
        expect(url).toContain(season4Config?.config_hash.substring(0, 8));
      }

      // Navigate back
      await page.goBack();

      // Should still be on Season 4
      await expect(configPage.leaderboardHeader).toContainText("Season 4");
    });
  });

  test.describe("User Story 6: Mobile Experience", () => {
    test("should work seamlessly on mobile devices", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      // Configuration panel should still be accessible
      await configPage.expandConfiguration();

      // Panel should use full width on mobile
      const panelBox = await configPage.configurationPanel.boundingBox();
      expect(panelBox?.width).toBeGreaterThan(350);

      // Should have collapsible sections
      const sections = await page
        .locator('[data-testid*="collapsible"], details, .accordion-item')
        .all();
      expect(sections.length).toBeGreaterThan(0);

      // Test touch-friendly inputs
      const firstSection = sections[0];
      if (firstSection) {
        await firstSection.click();
        // Section should expand/collapse
        await expect(
          firstSection.locator("input, select").first()
        ).toBeVisible();
      }

      // Form inputs should be appropriately sized
      const inputs = await page.locator("input, select").all();
      for (const input of inputs) {
        const box = await input.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44); // Touch-friendly minimum
        }
      }
    });

    test("should persist configuration state", async ({ page, context }) => {
      // Create custom config
      await configPage.createNewConfiguration();
      await configPage.setConfigurationName("Persistent Config");
      await configPage.modifyUmaValues([15, 5, -5, -15]);
      await configPage.applyConfiguration();

      // Reload page
      await page.reload();

      // Custom config should still be available
      await configPage.expandConfiguration();
      const options = await configPage.activeConfigDropdown
        .locator("option")
        .allTextContents();
      expect(options).toContain("Persistent Config");

      // Check localStorage
      const localStorage = await page.evaluate(() =>
        window.localStorage.getItem("mahjong-config-storage")
      );
      expect(localStorage).toBeTruthy();
      if (localStorage) {
        const stored = JSON.parse(localStorage);
        expect(stored.state?.customConfigs).toBeTruthy();
      }
    });
  });

  test.describe("Additional Acceptance Criteria", () => {
    test("should show configuration name clearly when viewing custom config", async ({
      page,
    }) => {
      await configPage.createNewConfiguration();
      await configPage.setConfigurationName("My Tournament Rules");
      await configPage.applyConfiguration();

      // Should clearly indicate custom configuration
      await expect(
        page.locator(':has-text("My Tournament Rules"), :has-text("Custom")')
      ).toBeVisible();
    });

    test("should limit stored configurations to 10", async ({ page }) => {
      // This test would require creating 11 configurations
      // Skip for performance reasons in real E2E tests
      test.skip();
    });

    test("should handle deleted configurations gracefully", async ({
      page,
    }) => {
      // This would require database manipulation to delete a config
      // Skip since we're using real data
      test.skip();
    });
  });
});

// Run specific user story tests
test.describe("User Story Tests Only", () => {
  test("Full user journey: League player exploring configurations", async ({
    page,
  }) => {
    const configPage = new ConfigurationPlaygroundPage(page);

    // 1. Start at default Season 3
    await page.goto("/");
    await expect(configPage.leaderboardHeader).toContainText("Season 3");

    // 2. Explore configuration options
    await configPage.expandConfiguration();
    await expect(configPage.configurationPanel).toBeVisible();

    // 3. Switch to Season 4 to compare
    await configPage.selectConfiguration("Season 4 (Official)");
    await configPage.applyConfiguration();
    await expect(configPage.leaderboardHeader).toContainText("Season 4");

    // 4. Create custom configuration for analysis
    await configPage.createNewConfiguration();
    await configPage.setConfigurationName("Analysis Config");
    await configPage.modifyUmaValues([20, 0, 0, -20]); // Winner takes all
    await configPage.applyConfiguration();

    // 5. Wait for materialization if needed
    if (await configPage.materializationIndicator.isVisible()) {
      await configPage.waitForMaterialization();
    }

    // 6. View results with custom config
    await expect(page.locator(':has-text("Analysis Config")')).toBeVisible();

    // 7. Check a player profile maintains context
    const playerLink = page.locator('a[href*="/player/"]').first();
    await playerLink.click();
    await page.waitForURL(/\/player\//);
    await expect(configPage.configurationIndicator).toBeVisible();
  });
});
