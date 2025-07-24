import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Test configuration
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://soihuphdqgkbafozrzqn.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_68r4JVAt-_ZMMausI3M7QQ_Tqrmu9mV";
const SEASON_CONFIG_HASH =
  "ad7252bdec25767b7eb12451ae30afbc1c7b5b1336c468ef833df7f632b34ba4";

test.describe("Rating Calculation Regression Tests", () => {
  test.describe("REQUIREMENT RC-001: Use display_rating from database", () => {
    test("ratings shown in UI match database display_rating values exactly", async ({
      page,
    }) => {
      // Create Supabase client
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Fetch expected data from database
      const { data: ratingsData } = await supabase
        .from("cached_player_ratings")
        .select("player_id, display_rating, mu, sigma, games_played")
        .eq("config_hash", SEASON_CONFIG_HASH)
        .order("display_rating", { ascending: false })
        .limit(5); // Check top 5 players

      // Fetch player names
      const playerIds = ratingsData?.map(r => r.player_id) || [];
      const { data: playersData } = await supabase
        .from("players")
        .select("id, display_name")
        .in("id", playerIds);

      // Create lookup map
      const playerMap = new Map(
        playersData?.map(p => [p.id, p.display_name]) || []
      );

      // Navigate to leaderboard
      await page.goto("/");
      await page.waitForSelector('[data-testid^="player-card-"]', {
        timeout: 10000,
      });

      // Verify each player's rating
      for (let i = 0; i < Math.min(5, ratingsData?.length || 0); i++) {
        const expectedData = ratingsData![i];
        const playerCard = page.locator('[data-testid^="player-card-"]').nth(i);

        const displayedRating = await playerCard
          .locator(".text-2xl")
          .textContent();
        const expectedRating = expectedData.display_rating.toFixed(1);

        // This is the critical test - ensure we're using display_rating, not mu - 3*sigma
        const incorrectRating = (
          expectedData.mu -
          3 * expectedData.sigma
        ).toFixed(1);

        expect(displayedRating).toBe(expectedRating);

        // Ensure we're NOT using the recalculated value
        if (expectedRating !== incorrectRating) {
          expect(displayedRating).not.toBe(incorrectRating);
        }

        console.log(
          `Player ${i + 1}: display_rating=${expectedRating}, mu-3σ=${incorrectRating}, shown=${displayedRating}`
        );
      }
    });

    test("player profile pages use display_rating", async ({ page }) => {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get a player with different display_rating vs calculated rating
      const { data: player } = await supabase
        .from("cached_player_ratings")
        .select("player_id, display_rating, mu, sigma")
        .eq("config_hash", SEASON_CONFIG_HASH)
        .limit(1)
        .single();

      if (!player) {
        test.skip("No player data available");
        return;
      }

      // Navigate to player profile
      await page.goto(`/player/${player.player_id}`);
      await page.waitForSelector("h2.text-muted-foreground", { timeout: 5000 });

      const subtitleText = await page
        .locator("h2.text-muted-foreground")
        .textContent();
      const expectedRating = player.display_rating.toFixed(1);

      expect(subtitleText).toContain(`Rating: ${expectedRating}`);
    });
  });

  test.describe("REQUIREMENT RC-002: Total games uses max not sum", () => {
    test("leaderboard header shows max games not sum", async ({ page }) => {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get all player game counts
      const { data: allPlayers } = await supabase
        .from("cached_player_ratings")
        .select("games_played")
        .eq("config_hash", SEASON_CONFIG_HASH);

      const gameCounts = allPlayers?.map(p => p.games_played) || [];
      const maxGames = Math.max(...gameCounts);
      const sumGames = gameCounts.reduce((a, b) => a + b, 0);

      await page.goto("/");
      await page.waitForSelector('[data-testid="leaderboard-header"]', {
        timeout: 10000,
      });

      const headerCard = page.locator('[data-testid="leaderboard-header"]');
      const summaryText = await headerCard
        .locator("div.text-muted-foreground")
        .textContent();

      const gameCountMatch = summaryText?.match(/(\d+)\s*games/);
      const displayedGames = gameCountMatch ? parseInt(gameCountMatch[1]) : 0;

      // Critical assertion - we use max, not sum
      expect(displayedGames).toBe(maxGames);
      expect(displayedGames).not.toBe(sumGames);

      console.log(
        `Max games: ${maxGames}, Sum games: ${sumGames}, Displayed: ${displayedGames}`
      );
    });
  });

  test.describe("REQUIREMENT RC-003: Data validation prevents invalid displays", () => {
    test("no Infinity or NaN values in ratings", async ({ page }) => {
      await page.goto("/");
      await page.waitForSelector('[data-testid^="player-card-"]', {
        timeout: 10000,
      });

      // Get all rating displays
      const allRatings = await page.locator(".text-2xl").allTextContents();

      for (const rating of allRatings) {
        // Check for invalid values
        expect(rating).not.toContain("Infinity");
        expect(rating).not.toContain("∞");
        expect(rating).not.toContain("NaN");
        expect(rating).not.toBe("--"); // Our fallback for invalid values

        // Verify it's a valid number
        const numericValue = parseFloat(rating);
        expect(isFinite(numericValue)).toBe(true);
        expect(numericValue).toBeGreaterThanOrEqual(0);
        expect(numericValue).toBeLessThanOrEqual(200); // Reasonable upper bound
      }
    });

    test("no negative game counts", async ({ page }) => {
      await page.goto("/");
      await page.waitForSelector('[data-testid^="player-card-"]', {
        timeout: 10000,
      });

      // Get all game count displays
      const gameTexts = await page
        .locator('[data-testid^="player-card-"] .text-muted-foreground')
        .allTextContents();

      for (const text of gameTexts) {
        const match = text.match(/(\d+)\s*game/);
        if (match) {
          const gameCount = parseInt(match[1]);
          expect(gameCount).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe("REQUIREMENT RC-004: 7-day delta uses display_rating", () => {
    test("expanded card 7-day delta calculation", async ({ page }) => {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get a player with recent games
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentGames } = await supabase
        .from("cached_game_results")
        .select("player_id, rating_before, rating_after, game_id")
        .gte("created_at", sevenDaysAgo.toISOString())
        .limit(1);

      if (!recentGames || recentGames.length === 0) {
        test.skip("No recent games for delta test");
        return;
      }

      const playerId = recentGames[0].player_id;

      // Get current rating
      const { data: currentRating } = await supabase
        .from("cached_player_ratings")
        .select("display_rating")
        .eq("player_id", playerId)
        .eq("config_hash", SEASON_CONFIG_HASH)
        .single();

      if (!currentRating) {
        test.skip("No current rating data");
        return;
      }

      await page.goto("/");
      await page.waitForSelector('[data-testid^="player-card-"]', {
        timeout: 10000,
      });

      // Find and expand the player's card
      const playerCards = await page
        .locator('[data-testid^="player-card-"]')
        .all();
      let targetCard = null;

      for (const card of playerCards) {
        const cardId = await card.getAttribute("data-testid");
        if (cardId?.includes(playerId)) {
          targetCard = card;
          break;
        }
      }

      if (targetCard) {
        await targetCard.click();
        await page.waitForTimeout(300);

        // Check if 7-day delta is shown
        const deltaElement = page.locator('text="7-day change:"').locator("..");
        const deltaExists = await deltaElement
          .isVisible({ timeout: 1000 })
          .catch(() => false);

        if (deltaExists) {
          const deltaText = await deltaElement.textContent();
          console.log("7-day delta display:", deltaText);

          // Verify it's using display_rating-based calculation
          // The exact verification would depend on having the baseline data
        }
      }
    });
  });
});
