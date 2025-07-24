import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://soihuphdqgkbafozrzqn.supabase.co";
const supabaseKey = "sb_publishable_68r4JVAt-_ZMMausI3M7QQ_Tqrmu9mV";
const SEASON_CONFIG_HASH =
  "ad7252bdec25767b7eb12451ae30afbc1c7b5b1336c468ef833df7f632b34ba4";

test.describe("Final Validation - All Fixes Working", () => {
  test("comprehensive validation of all fixes", async ({ page }) => {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get expected data
    const { data: ratingsData } = await supabase
      .from("cached_player_ratings")
      .select("player_id, display_rating, mu, sigma, games_played")
      .eq("config_hash", SEASON_CONFIG_HASH)
      .order("display_rating", { ascending: false });

    const playerIds = ratingsData?.map(r => r.player_id) || [];
    const { data: playersData } = await supabase
      .from("players")
      .select("id, display_name")
      .in("id", playerIds);

    const playerMap = new Map(
      playersData?.map(p => [p.id, p.display_name]) || []
    );

    // Calculate expected values
    const maxGames = Math.max(
      ...(ratingsData?.map(r => r.games_played) || [0])
    );
    const playerCount = ratingsData?.length || 0;

    await page.goto("/");
    await page.waitForSelector('[data-testid="leaderboard-header"]', {
      timeout: 10000,
    });

    console.log("=== FINAL VALIDATION RESULTS ===");

    // 1. Check header displays correct total games (max, not sum)
    const headerCard = page.locator('[data-testid="leaderboard-header"]');
    const summaryText = await headerCard
      .locator("div.text-muted-foreground")
      .textContent();
    console.log("Header summary:", summaryText);

    const gameCountMatch = summaryText?.match(/(\d+)\s*games/);
    const displayedGames = gameCountMatch ? parseInt(gameCountMatch[1]) : 0;

    console.log(
      `✓ Total Games: Expected ${maxGames}, Displayed ${displayedGames}`
    );
    expect(displayedGames).toBe(maxGames);

    // 2. Check player count
    const playerCountMatch = summaryText?.match(/(\d+)\s*players/);
    const displayedPlayers = playerCountMatch
      ? parseInt(playerCountMatch[1])
      : 0;

    console.log(
      `✓ Player Count: Expected ${playerCount}, Displayed ${displayedPlayers}`
    );
    expect(displayedPlayers).toBe(playerCount);

    // 3. Check top 3 players use display_rating
    console.log("\n=== TOP 3 PLAYERS VALIDATION ===");
    for (let i = 0; i < Math.min(3, ratingsData?.length || 0); i++) {
      const expected = ratingsData![i];
      const playerCard = page.locator('[data-testid^="player-card-"]').nth(i);

      const name = await playerCard.locator(".font-medium").textContent();
      const rating = await playerCard.locator(".text-2xl").textContent();
      const games = await playerCard
        .locator(".text-muted-foreground")
        .first()
        .textContent();

      const expectedName = playerMap.get(expected.player_id) || "Unknown";
      const expectedRating = expected.display_rating.toFixed(1);
      const incorrectRating = (expected.mu - 3 * expected.sigma).toFixed(1);

      console.log(`\nPlayer ${i + 1}: ${expectedName}`);
      console.log(`  Name: ${name} (${name === expectedName ? "✓" : "✗"})`);
      console.log(
        `  Rating: ${rating} (Expected: ${expectedRating}, NOT ${incorrectRating}) ${rating === expectedRating ? "✓" : "✗"}`
      );
      console.log(
        `  Games: ${games} (Expected: ${expected.games_played} games) ${games === `${expected.games_played} games` ? "✓" : "✗"}`
      );

      expect(name).toBe(expectedName);
      expect(rating).toBe(expectedRating);
      expect(games).toBe(`${expected.games_played} games`);
    }

    // 4. Check for any invalid values
    console.log("\n=== DATA VALIDATION ===");
    const allRatings = await page.locator(".text-2xl").allTextContents();
    let hasInvalidValues = false;

    for (const rating of allRatings) {
      if (
        rating.includes("Infinity") ||
        rating.includes("NaN") ||
        rating === "--"
      ) {
        console.log(`✗ Found invalid rating: ${rating}`);
        hasInvalidValues = true;
      }
    }

    if (!hasInvalidValues) {
      console.log("✓ No invalid values (Infinity/NaN) found");
    }
    expect(hasInvalidValues).toBe(false);

    // 5. Test expanded card
    console.log("\n=== EXPANDED CARD TEST ===");
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    // Check if 7-day delta is visible
    const deltaElement = firstCard
      .locator('text="7-day change:"')
      .locator("..");
    const deltaVisible = await deltaElement
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (deltaVisible) {
      const deltaText = await deltaElement.textContent();
      console.log("✓ 7-day delta displayed:", deltaText);

      // Verify no invalid values in delta
      expect(deltaText).not.toContain("Infinity");
      expect(deltaText).not.toContain("NaN");
    }

    // Check average placement
    const avgElement = firstCard.locator('text="Avg Placement:"').locator("..");
    const avgVisible = await avgElement
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (avgVisible) {
      const avgText = await avgElement.textContent();
      console.log("✓ Average placement displayed:", avgText);

      // Extract number and validate
      const avgMatch = avgText?.match(/(\d+\.?\d*)/);
      if (avgMatch) {
        const avgValue = parseFloat(avgMatch[1]);
        expect(avgValue).toBeGreaterThanOrEqual(1);
        expect(avgValue).toBeLessThanOrEqual(4);
      }
    }

    console.log("\n=== ALL VALIDATIONS COMPLETE ===");
  });

  test("verify no regression on game history page", async ({ page }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Wait for games to load
    await page.waitForTimeout(2000);

    // Check if games are displayed
    const gameCards = page
      .locator('[class*="border"][class*="rounded"]')
      .filter({
        has: page.locator("text=/📅/"),
      });

    const gameCount = await gameCards.count();
    console.log(`Games displayed: ${gameCount}`);

    if (gameCount > 0) {
      // Check first game for valid data
      const firstGame = gameCards.first();
      const gameText = await firstGame.textContent();

      // Check for placement emojis
      const hasPlacementEmojis =
        gameText?.includes("🥇") ||
        gameText?.includes("🥈") ||
        gameText?.includes("🥉") ||
        gameText?.includes("4️⃣");

      console.log("✓ Game has placement emojis:", hasPlacementEmojis);
      expect(hasPlacementEmojis).toBe(true);

      // Check for invalid values
      expect(gameText).not.toContain("Infinity");
      expect(gameText).not.toContain("NaN");
    }
  });
});
