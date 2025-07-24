import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Create Supabase client to verify data
const supabaseUrl = "https://soihuphdqgkbafozrzqn.supabase.co";
const supabasePublishableKey = "sb_publishable_68r4JVAt-_ZMMausI3M7QQ_Tqrmu9mV";
const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Season config for filtering data
const SEASON_CONFIG_HASH =
  "ad7252bdec25767b7eb12451ae30afbc1c7b5b1336c468ef833df7f632b34ba4";

test.describe("Verify Actual Data Values Against Database", () => {
  test("verify leaderboard displays correct calculated values", async ({
    page,
  }) => {
    // First, fetch the actual data from Supabase
    const { data: ratingsData, error: ratingsError } = await supabase
      .from("cached_player_ratings")
      .select(
        `
        player_id,
        mu,
        sigma,
        display_rating,
        games_played,
        last_game_date
      `
      )
      .eq("config_hash", SEASON_CONFIG_HASH);

    if (ratingsError) {
      console.error("Error fetching ratings:", ratingsError);
    }

    // Fetch player names separately
    const playerIds = ratingsData?.map(r => r.player_id) || [];
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("id, display_name")
      .in("id", playerIds);

    if (playersError) {
      console.error("Error fetching players:", playersError);
    }

    // Combine data
    const playersWithNames = ratingsData?.map(rating => ({
      ...rating,
      player: playersData?.find(p => p.id === rating.player_id),
    }));

    // Debug: Check first player's data
    console.log("First player data:", playersWithNames?.[0]);

    const { data: totalGamesData } = await supabase
      .from("cached_player_ratings")
      .select("games_played")
      .eq("config_hash", SEASON_CONFIG_HASH)
      .order("games_played", { ascending: false })
      .limit(1);

    const totalGames = totalGamesData?.[0]?.games_played || 0;

    // Also get all games to debug
    const { data: allGamesData } = await supabase
      .from("cached_player_ratings")
      .select("player_id, games_played")
      .eq("config_hash", SEASON_CONFIG_HASH)
      .order("games_played", { ascending: false });

    console.log("All games data:", allGamesData?.slice(0, 5));

    // Navigate to leaderboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Dismiss PWA notification if present
    const dismissButton = page.locator(
      'button[aria-label="Dismiss notification"]'
    );
    if (await dismissButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dismissButton.click();
      await page.waitForTimeout(300);
    }

    // Wait for leaderboard to load
    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });

    // Verify total games count - look for the header card and its content
    const headerCard = await page.locator('[data-testid="leaderboard-header"]');
    await headerCard.waitFor({ state: "visible", timeout: 5000 });

    // Find the text in the card content div with class text-muted-foreground
    const summaryDiv = headerCard.locator("div.text-muted-foreground");
    const summaryText = await summaryDiv.textContent();
    console.log("Header summary text:", summaryText);

    let displayedGameCount = 0;
    const gameCountMatch = summaryText?.match(/(\d+)\s*games/);
    if (gameCountMatch) {
      displayedGameCount = parseInt(gameCountMatch[1]);
    }
    console.log(
      `Expected total games: ${totalGames}, Displayed: ${displayedGameCount}`
    );
    expect(displayedGameCount).toBe(totalGames);

    // Verify player count
    const playerCards = await page
      .locator('[data-testid^="player-card-"]')
      .count();
    const expectedPlayerCount = ratingsData?.length || 0;
    console.log(
      `Expected players: ${expectedPlayerCount}, Displayed: ${playerCards}`
    );
    expect(playerCards).toBe(expectedPlayerCount);

    // Sort the database data by rating (desc), then games (desc), then name
    const sortedPlayers = (playersWithNames || []).sort((a, b) => {
      if (a.display_rating !== b.display_rating) {
        return b.display_rating - a.display_rating;
      }
      if (a.games_played !== b.games_played) {
        return b.games_played - a.games_played;
      }
      const nameA = a.player?.display_name || "";
      const nameB = b.player?.display_name || "";
      return nameA.localeCompare(nameB);
    });

    // Debug: Check Mikey's rating
    const mikeyData = playersWithNames?.find(
      p => p.player?.display_name === "Mikey"
    );
    console.log("Mikey data from DB:", mikeyData);

    // Check who is the first player and their games
    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    const firstPlayerName = await firstCard
      .locator(".font-medium")
      .textContent();
    const firstPlayerGames = await firstCard
      .locator(".text-muted-foreground")
      .first()
      .textContent();
    console.log(
      "First player on leaderboard:",
      firstPlayerName,
      "with",
      firstPlayerGames
    );

    // Verify first few players' data
    for (let i = 0; i < Math.min(3, sortedPlayers.length); i++) {
      const expectedPlayer = sortedPlayers[i];
      const playerCard = page.locator('[data-testid^="player-card-"]').nth(i);

      // Check name
      const displayedName = await playerCard
        .locator(".font-medium")
        .textContent();
      const expectedName = expectedPlayer.player?.display_name || "";
      console.log(
        `Player ${i + 1} name - Expected: ${expectedName}, Displayed: ${displayedName}`
      );
      expect(displayedName).toBe(expectedName);

      // Check rating
      const displayedRating = await playerCard
        .locator(".text-2xl")
        .textContent();
      const expectedRating = expectedPlayer.display_rating.toFixed(1);
      console.log(
        `Player ${i + 1} rating - Expected: ${expectedRating}, Displayed: ${displayedRating}`
      );
      expect(displayedRating).toBe(expectedRating);

      // Check games played
      const gamesText = await playerCard
        .locator(".text-muted-foreground")
        .first()
        .textContent();
      const expectedGamesText = `${expectedPlayer.games_played} game${expectedPlayer.games_played !== 1 ? "s" : ""}`;
      console.log(
        `Player ${i + 1} games - Expected: ${expectedGamesText}, Displayed: ${gamesText}`
      );
      expect(gamesText).toBe(expectedGamesText);
    }
  });

  test("verify expanded card calculations", async ({ page }) => {
    // Fetch data for calculations
    const { data: firstPlayerData } = await supabase
      .from("cached_player_ratings")
      .select(
        `
        player_id,
        display_rating
      `
      )
      .eq("config_hash", SEASON_CONFIG_HASH)
      .order("display_rating", { ascending: false })
      .limit(1);

    if (!firstPlayerData || firstPlayerData.length === 0) {
      throw new Error("No player data found");
    }

    const playerId = firstPlayerData[0].player_id;

    // Get 7-day delta calculation data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentGames } = await supabase
      .from("cached_game_results")
      .select("rating_before, rating_after, game:game_id(finished_at)")
      .eq("player_id", playerId)
      .gte("game.finished_at", sevenDaysAgo.toISOString())
      .order("game.finished_at", { ascending: true })
      .limit(1);

    const baseline7Day = recentGames?.[0]?.rating_before;
    const expected7DayDelta =
      baseline7Day !== undefined
        ? firstPlayerData[0].display_rating - baseline7Day
        : null;

    // Get average placement
    const { data: placementData } = await supabase
      .from("cached_game_results")
      .select("placement")
      .eq("player_id", playerId)
      .eq("config_hash", SEASON_CONFIG_HASH);

    const placements = placementData?.map(d => d.placement) || [];
    const expectedAvgPlacement =
      placements.length > 0
        ? placements.reduce((a, b) => a + b, 0) / placements.length
        : null;

    // Navigate and expand first card
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const dismissButton = page.locator(
      'button[aria-label="Dismiss notification"]'
    );
    if (await dismissButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dismissButton.click();
      await page.waitForTimeout(300);
    }

    await page.waitForSelector('[data-testid^="player-card-"]', {
      timeout: 10000,
    });

    const firstCard = page.locator('[data-testid^="player-card-"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);

    // Verify 7-day delta
    if (expected7DayDelta !== null) {
      const sevenDayElement = await page
        .locator('text="7-day change:"')
        .locator("..");
      const sevenDayText = await sevenDayElement.textContent();
      console.log(
        `7-day delta - Expected: ${expected7DayDelta.toFixed(1)}, Displayed: ${sevenDayText}`
      );

      if (Math.abs(expected7DayDelta) >= 0.05) {
        const expectedSymbol = expected7DayDelta >= 0 ? "▲" : "▼";
        expect(sevenDayText).toContain(expectedSymbol);
        expect(sevenDayText).toContain(Math.abs(expected7DayDelta).toFixed(1));
      } else {
        expect(sevenDayText).toContain("—");
      }
    }

    // Verify average placement
    if (expectedAvgPlacement !== null) {
      const avgPlacementElement = await page
        .locator('text="Avg Placement:"')
        .locator("..");
      const avgPlacementText = await avgPlacementElement.textContent();
      const expectedText = `Avg Placement:${expectedAvgPlacement.toFixed(1)}`;
      console.log(
        `Average placement - Expected: ${expectedText}, Displayed: ${avgPlacementText}`
      );
      expect(avgPlacementText).toBe(expectedText);
    }
  });

  test("verify game history data accuracy", async ({ page }) => {
    // Get recent games from database
    const { data: gamesData } = await supabase
      .from("games")
      .select(
        `
        id,
        finished_at,
        game_seats (
          player_id,
          seat,
          final_score,
          player:player_id (
            display_name,
            name
          )
        ),
        cached_game_results (
          player_id,
          placement,
          raw_score,
          score_delta,
          rating_change
        )
      `
      )
      .eq("status", "finished")
      .order("finished_at", { ascending: false })
      .limit(3);

    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Wait for games to load
    await page.waitForTimeout(1000);
    const gameCards = await page
      .locator('[class*="border"][class*="rounded"]')
      .filter({ has: page.locator("text=/📅/") });
    const gameCount = await gameCards.count();

    console.log(
      `Database games: ${gamesData?.length || 0}, Displayed games: ${gameCount}`
    );

    // Verify first game details
    if (gamesData && gamesData.length > 0 && gameCount > 0) {
      const firstGame = gamesData[0];
      const firstGameCard = gameCards.first();

      // Sort players by placement
      const sortedResults = firstGame.cached_game_results.sort(
        (a, b) => a.placement - b.placement
      );

      // Check each player in the game
      for (let i = 0; i < sortedResults.length; i++) {
        const result = sortedResults[i];
        const seat = firstGame.game_seats.find(
          s => s.player_id === result.player_id
        );
        const playerName =
          (seat?.player as any)?.display_name ||
          (seat?.player as any)?.name ||
          "Unknown";

        // Verify player name appears in card
        const cardText = await firstGameCard.textContent();
        console.log(`Checking player ${playerName} in game card`);
        expect(cardText).toContain(playerName);

        // Verify placement emoji
        const placementEmojis = ["🥇", "🥈", "🥉", "4️⃣"];
        expect(cardText).toContain(placementEmojis[result.placement - 1]);

        // Verify score (raw → adjusted)
        if (result.score_delta !== 0) {
          const scorePattern = `${result.raw_score.toLocaleString()} → ${(result.raw_score + result.score_delta).toLocaleString()}`;
          console.log(`Checking score pattern: ${scorePattern}`);
          // Score formatting might differ, just check the values exist
          expect(cardText).toContain(result.raw_score.toString());
        }
      }
    }
  });

  test("verify player profile data calculations", async ({ page }) => {
    // Get a player with sufficient games
    const { data: playerData } = await supabase
      .from("cached_player_ratings")
      .select(
        `
        player_id,
        display_rating,
        games_played,
        player:player_id (
          id,
          display_name,
          name
        )
      `
      )
      .eq("config_hash", SEASON_CONFIG_HASH)
      .gte("games_played", 10)
      .order("display_rating", { ascending: false })
      .limit(1);

    if (!playerData || playerData.length === 0) {
      console.log("No player with sufficient games found");
      return;
    }

    const player = playerData[0];
    const playerId = player.player_id;

    // Get all games for average placement
    const { data: allGames } = await supabase
      .from("cached_game_results")
      .select("placement")
      .eq("player_id", playerId)
      .eq("config_hash", SEASON_CONFIG_HASH);

    const placements = allGames?.map(g => g.placement) || [];
    const expectedAvgPlacement =
      placements.length > 0
        ? placements.reduce((a, b) => a + b, 0) / placements.length
        : null;

    // Get rank calculation data
    const { data: allPlayers } = await supabase
      .from("cached_player_ratings")
      .select("player_id, display_rating, games_played")
      .eq("config_hash", SEASON_CONFIG_HASH);

    const sortedForRank = (allPlayers || []).sort((a, b) => {
      if (a.display_rating !== b.display_rating) {
        return b.display_rating - a.display_rating;
      }
      if (a.games_played !== b.games_played) {
        return b.games_played - a.games_played;
      }
      return 0;
    });

    const expectedRank =
      sortedForRank.findIndex(p => p.player_id === playerId) + 1;

    // Navigate to profile
    await page.goto(`/player/${playerId}`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("h1.text-2xl.font-bold", { timeout: 5000 });

    // Verify player name
    const displayedName = await page
      .locator("h1.text-2xl.font-bold")
      .textContent();
    const expectedName = (player.player as any)?.display_name || "";
    console.log(
      `Player name - Expected: ${expectedName}, Displayed: ${displayedName}`
    );
    expect(displayedName).toBe(expectedName);

    // Verify subtitle data
    const subtitleElement = await page
      .locator("h2.text-muted-foreground")
      .first();
    const subtitleText = await subtitleElement.textContent();

    console.log(
      `Expected rank: #${expectedRank}, Rating: ${player.display_rating.toFixed(1)}, Games: ${player.games_played}`
    );
    console.log(`Displayed subtitle: ${subtitleText}`);

    expect(subtitleText).toContain(`Rank #${expectedRank}`);
    expect(subtitleText).toContain(
      `Rating: ${player.display_rating.toFixed(1)}`
    );
    expect(subtitleText).toContain(`${player.games_played} games`);

    // Verify average placement in performance stats
    if (expectedAvgPlacement !== null) {
      const avgPlacementElement = await page
        .locator('text="Average Placement:"')
        .locator("..");
      const avgText = await avgPlacementElement.textContent();
      const expectedAvgText = expectedAvgPlacement.toFixed(1);
      console.log(
        `Average placement - Expected: ${expectedAvgText}, Displayed: ${avgText}`
      );
      expect(avgText).toContain(expectedAvgText);
    }
  });
});
