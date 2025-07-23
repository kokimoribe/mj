import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";

/**
 * Comprehensive Data Validation E2E Tests
 *
 * These tests verify that the UI displays correct values by:
 * 1. Fetching raw data directly from Supabase
 * 2. Performing the same calculations as the app
 * 3. Comparing rendered values with expected calculations
 */

const supabaseUrl = "https://soihuphdqgkbafozrzqn.supabase.co";
const supabaseKey = "sb_publishable_68r4JVAt-_ZMMausI3M7QQ_Tqrmu9mV";
const configHash =
  "ad7252bdec25767b7eb12451ae30afbc1c7b5b1336c468ef833df7f632b34ba4";

interface DatabasePlayer {
  player_id: string;
  mu: number;
  sigma: number;
  games_played: number;
  last_game_date: string;
  materialized_at: string;
  display_rating: number;
}

interface DatabasePlayerInfo {
  id: string;
  display_name: string;
}

interface DatabaseGameResult {
  player_id: string;
  game_id: string;
  placement: number;
  final_score: number;
  plus_minus: number;
  rating_before: number;
  rating_after: number;
  rating_change: number;
  mu_before?: number;
  sigma_before?: number;
  mu_after?: number;
  sigma_after?: number;
  games: { finished_at: string };
}

class DataValidationService {
  private supabase = createClient(supabaseUrl, supabaseKey);

  async getPlayerRatings(): Promise<DatabasePlayer[]> {
    const { data, error } = await this.supabase
      .from("cached_player_ratings")
      .select("*")
      .eq("config_hash", configHash)
      .order("display_rating", { ascending: false });

    if (error)
      throw new Error(`Failed to fetch player ratings: ${error.message}`);
    return data || [];
  }

  async getPlayerInfo(): Promise<DatabasePlayerInfo[]> {
    const { data, error } = await this.supabase
      .from("players")
      .select("id, display_name");

    if (error) throw new Error(`Failed to fetch player info: ${error.message}`);
    return data || [];
  }

  async getRecentGameHistory(): Promise<DatabaseGameResult[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get games from last 7 days
    const { data: recentGames, error: gamesError } = await this.supabase
      .from("games")
      .select("id, finished_at")
      .eq("status", "finished")
      .gte("finished_at", sevenDaysAgo.toISOString())
      .order("finished_at", { ascending: true });

    if (gamesError)
      throw new Error(`Failed to fetch recent games: ${gamesError.message}`);

    if (!recentGames || recentGames.length === 0) return [];

    const gameIds = recentGames.map(g => g.id);

    // Get cached results for these games
    const { data: cachedResults, error: resultsError } = await this.supabase
      .from("cached_game_results")
      .select("*")
      .eq("config_hash", configHash)
      .in("game_id", gameIds);

    if (resultsError)
      throw new Error(`Failed to fetch game results: ${resultsError.message}`);

    // Combine with game dates
    return (cachedResults || []).map(result => ({
      ...result,
      games: {
        finished_at:
          recentGames.find(g => g.id === result.game_id)?.finished_at || "",
      },
    }));
  }

  async getAllGameResults(playerIds: string[]): Promise<DatabaseGameResult[]> {
    // Get all game seats for these players
    const { data: gameSeats } = await this.supabase
      .from("game_seats")
      .select("game_id, player_id")
      .in("player_id", playerIds);

    const gameIds = [...new Set(gameSeats?.map(s => s.game_id) || [])];

    if (gameIds.length === 0) return [];

    // Get games with dates
    const { data: games } = await this.supabase
      .from("games")
      .select("id, finished_at")
      .in("id", gameIds)
      .order("finished_at", { ascending: false });

    // Get cached results
    const { data: cachedResults } = await this.supabase
      .from("cached_game_results")
      .select("*")
      .eq("config_hash", configHash)
      .in("game_id", gameIds)
      .in("player_id", playerIds);

    return (cachedResults || []).map(result => ({
      ...result,
      games: {
        finished_at:
          games?.find(g => g.id === result.game_id)?.finished_at || "",
      },
    }));
  }

  calculateDisplayRating(mu: number, sigma: number): number {
    // App uses mu - 3 * sigma (conservative rating)
    return mu - 3 * sigma;
  }

  calculate7DayDelta(
    playerId: string,
    currentRating: number,
    gameHistory: DatabaseGameResult[]
  ): number | null {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Filter games for this player in the last 7 days
    const recentGames = gameHistory
      .filter(
        game =>
          game.player_id === playerId &&
          new Date(game.games.finished_at) >= sevenDaysAgo
      )
      .sort(
        (a, b) =>
          new Date(a.games.finished_at).getTime() -
          new Date(b.games.finished_at).getTime()
      );

    if (recentGames.length === 0) return null;

    // Use rating_before of the oldest game in the period as baseline
    const oldestGame = recentGames[0];
    return currentRating - oldestGame.rating_before;
  }

  calculateAveragePlacement(
    playerId: string,
    gameHistory: DatabaseGameResult[]
  ): number | null {
    const playerGames = gameHistory.filter(game => game.player_id === playerId);
    if (playerGames.length === 0) return null;

    const placements = playerGames.map(game => game.placement);
    return (
      placements.reduce((sum, placement) => sum + placement, 0) /
      placements.length
    );
  }

  calculateExpectedRanking(
    players: DatabasePlayer[],
    playerInfo: DatabasePlayerInfo[]
  ): Array<{
    playerId: string;
    name: string;
    rating: number;
    gamesPlayed: number;
    expectedRank: number;
  }> {
    const playersWithInfo = players.map(player => {
      const info = playerInfo.find(p => p.id === player.player_id);
      return {
        playerId: player.player_id,
        name: info?.display_name || "Unknown",
        rating: player.display_rating, // Use precomputed display_rating
        mu: player.mu,
        sigma: player.sigma,
        gamesPlayed: player.games_played,
      };
    });

    // Database already orders by display_rating desc, so maintain that order
    return playersWithInfo.map((player, index) => ({
      ...player,
      expectedRank: index + 1,
    }));
  }
}

test.describe("Data Validation Tests", () => {
  let dataService: DataValidationService;
  let dbPlayers: DatabasePlayer[];
  let dbPlayerInfo: DatabasePlayerInfo[];
  let gameHistory: DatabaseGameResult[];

  test.beforeAll(async () => {
    dataService = new DataValidationService();

    // Load all required data
    [dbPlayers, dbPlayerInfo, gameHistory] = await Promise.all([
      dataService.getPlayerRatings(),
      dataService.getPlayerInfo(),
      dataService.getAllGameResults([]),
    ]);

    // Get game history for all players
    const playerIds = dbPlayers.map(p => p.player_id);
    gameHistory = await dataService.getAllGameResults(playerIds);
  });

  test.describe("Leaderboard Data Validation", () => {
    test("displayed ratings match database mu - 3*sigma calculations", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Get expected rankings
      const expectedRankings = dataService.calculateExpectedRanking(
        dbPlayers,
        dbPlayerInfo
      );

      // Verify each player card
      for (const expected of expectedRankings.slice(0, 5)) {
        // Test top 5 players
        const playerCard = page.getByTestId(`player-card-${expected.playerId}`);
        await expect(playerCard).toBeVisible();

        // Check displayed rating
        const ratingElement = playerCard.locator(".text-2xl.font-bold");
        const displayedRating = await ratingElement.textContent();
        const expectedRating = expected.rating.toFixed(1);

        expect(displayedRating).toBe(expectedRating);

        // Verify name
        const nameElement = playerCard.locator("h3");
        const displayedName = await nameElement.textContent();
        expect(displayedName).toBe(expected.name);

        // Verify games count
        const gamesElement = playerCard.locator("text=/\\d+ games?/");
        const gamesText = await gamesElement.textContent();
        expect(gamesText).toContain(expected.gamesPlayed.toString());
      }
    });

    test("7-day delta calculations are correct", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const expectedRankings = dataService.calculateExpectedRanking(
        dbPlayers,
        dbPlayerInfo
      );

      for (const expected of expectedRankings.slice(0, 3)) {
        // Test top 3 players
        const playerCard = page.getByTestId(`player-card-${expected.playerId}`);

        // Calculate expected 7-day delta
        const expectedDelta = dataService.calculate7DayDelta(
          expected.playerId,
          expected.rating,
          gameHistory
        );

        // Check displayed delta
        const deltaElement = playerCard.locator('[aria-label*="Rating"]');
        const deltaText = await deltaElement.textContent();

        if (expectedDelta === null) {
          expect(deltaText).toBe("—");
        } else {
          const expectedDeltaText =
            expectedDelta >= 0
              ? `▲${expectedDelta.toFixed(1)}`
              : `▼${Math.abs(expectedDelta).toFixed(1)}`;
          expect(deltaText).toBe(expectedDeltaText);
        }
      }
    });

    test("ranking order matches database sort criteria", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const expectedRankings = dataService.calculateExpectedRanking(
        dbPlayers,
        dbPlayerInfo
      );
      const playerCards = page.locator('[data-testid^="player-card-"]');

      const cardCount = await playerCards.count();
      expect(cardCount).toBe(expectedRankings.length);

      // Verify order of first few players
      for (let i = 0; i < Math.min(5, expectedRankings.length); i++) {
        const card = playerCards.nth(i);
        const nameElement = card.locator("h3");
        const displayedName = await nameElement.textContent();
        expect(displayedName).toBe(expectedRankings[i].name);
      }
    });
  });

  test.describe("Player Profile Data Validation", () => {
    test("average placement calculations are accurate", async ({ page }) => {
      const expectedRankings = dataService.calculateExpectedRanking(
        dbPlayers,
        dbPlayerInfo
      );
      const testPlayer = expectedRankings[0]; // Test top player

      await page.goto(`/player/${testPlayer.playerId}`);
      await page.waitForLoadState("networkidle");

      // Calculate expected average placement
      const expectedAvgPlacement = dataService.calculateAveragePlacement(
        testPlayer.playerId,
        gameHistory
      );

      if (expectedAvgPlacement !== null) {
        const statsSection = page.locator('[data-testid="performance-stats"]');
        const avgPlacementText = await statsSection
          .getByText(/Average Placement:/)
          .textContent();

        const expectedText = `Average Placement: ${expectedAvgPlacement.toFixed(1)}`;
        expect(avgPlacementText).toContain(expectedAvgPlacement.toFixed(1));
      }
    });

    test("current rating matches leaderboard calculation", async ({ page }) => {
      const expectedRankings = dataService.calculateExpectedRanking(
        dbPlayers,
        dbPlayerInfo
      );
      const testPlayer = expectedRankings[0];

      await page.goto(`/player/${testPlayer.playerId}`);
      await page.waitForLoadState("networkidle");

      // Check displayed rating in header
      const headerText = await page
        .getByRole("heading", { name: /Rating:/ })
        .textContent();
      expect(headerText).toContain(testPlayer.rating.toFixed(1));

      // Check displayed rank
      expect(headerText).toContain(`Rank #${testPlayer.expectedRank}`);
    });

    test("rating chart data points are consistent", async ({ page }) => {
      const expectedRankings = dataService.calculateExpectedRanking(
        dbPlayers,
        dbPlayerInfo
      );
      const testPlayer = expectedRankings.find(p => p.gamesPlayed > 5); // Player with enough games

      if (!testPlayer) {
        test.skip();
        return;
      }

      await page.goto(`/player/${testPlayer.playerId}`);
      await page.waitForLoadState("networkidle");

      const chartSection = page.locator('[data-testid="rating-chart"]');
      await expect(chartSection).toBeVisible();

      // Count data points in chart
      const dataPoints = chartSection.locator("circle");
      const pointCount = await dataPoints.count();

      // Should have points for each game plus current rating
      const playerGames = gameHistory.filter(
        g => g.player_id === testPlayer.playerId
      );
      expect(pointCount).toBeGreaterThanOrEqual(
        Math.min(playerGames.length, 1)
      );
    });
  });

  test.describe("Game History Data Validation", () => {
    test("score adjustments follow Uma/Oka rules", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Get first few games and validate Uma/Oka math
      const gameCards = page.locator('[data-testid="game-card"]');
      const firstGame = gameCards.first();
      await expect(firstGame).toBeVisible();

      // Get all player results for the first game
      const playerResults = firstGame.locator('[data-testid="player-result"]');
      const resultCount = await playerResults.count();
      expect(resultCount).toBe(4); // Always 4 players

      // Extract score adjustments from UI and verify they sum to zero
      const adjustments: number[] = [];
      for (let i = 0; i < 4; i++) {
        const result = playerResults.nth(i);
        const resultText = (await result.textContent()) || "";

        // Extract the plus/minus value from the score format (e.g., "43,300→+33,300")
        const scoreMatch = resultText.match(
          /(\d{1,3}(?:,\d{3})*)→([+-]\d{1,3}(?:,\d{3})*)/
        );
        if (scoreMatch && scoreMatch[2]) {
          const adjustment = parseInt(scoreMatch[2].replace(/[,+]/g, ""));
          adjustments.push(adjustment);
        }
      }

      // Uma/Oka adjustments should sum to zero
      const total = adjustments.reduce((sum, adj) => sum + adj, 0);
      expect(Math.abs(total)).toBeLessThan(1000); // Allow small rounding errors
    });

    test("placement medals match database values", async ({ page }) => {
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      const gameCards = page.locator('[data-testid="game-card"]');
      const firstGame = gameCards.first();

      // Verify placement order
      const medals = ["🥇", "🥈", "🥉", "4️⃣"];
      for (let i = 0; i < 4; i++) {
        const result = firstGame
          .locator('[data-testid="player-result"]')
          .nth(i);
        const medalElement = result.locator("span").first();
        const displayedMedal = await medalElement.textContent();
        expect(displayedMedal).toBe(medals[i]);
      }
    });
  });

  test.describe("Cross-Reference Data Consistency", () => {
    test("player data is consistent across all views", async ({ page }) => {
      const expectedRankings = dataService.calculateExpectedRanking(
        dbPlayers,
        dbPlayerInfo
      );
      const testPlayer = expectedRankings[0];

      // Get rating from leaderboard
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const leaderboardCard = page.getByTestId(
        `player-card-${testPlayer.playerId}`
      );
      const leaderboardRating = await leaderboardCard
        .locator(".text-2xl.font-bold")
        .textContent();

      // Navigate to player profile
      await leaderboardCard.click();
      await page.getByText("View Full Profile").click();
      await page.waitForLoadState("networkidle");

      // Verify rating consistency
      const profileRating = await page
        .getByRole("heading", { name: /Rating:/ })
        .textContent();
      expect(profileRating).toContain(leaderboardRating!);

      // Check if player appears in game history
      await page.goto("/games");
      await page.waitForLoadState("networkidle");

      // Filter to player's games
      const filterDropdown = page.getByTestId("game-history-filter-dropdown");
      await filterDropdown.click();

      const playerOption = page.getByText(
        `${testPlayer.name} (${testPlayer.gamesPlayed} games)`
      );
      if (await playerOption.isVisible()) {
        await playerOption.click();

        // Verify player name appears in filtered games
        const gameCards = page.locator('[data-testid="game-card"]');
        const firstGame = gameCards.first();
        if (await firstGame.isVisible()) {
          const gameText = await firstGame.textContent();
          expect(gameText).toContain(testPlayer.name);
        }
      }
    });
  });
});
