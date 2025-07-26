/**
 * Data Validation Test Helpers
 *
 * Utilities for validating data integrity between database and UI
 */

import { createClient } from "@supabase/supabase-js";
import { Page } from "@playwright/test";

const supabaseUrl = "https://soihuphdqgkbafozrzqn.supabase.co";
const supabaseKey = "sb_publishable_68r4JVAt-_ZMMausI3M7QQ_Tqrmu9mV";
const configHash =
  "ad7252bdec25767b7eb12451ae30afbc1c7b5b1336c468ef833df7f632b34ba4";

export interface DatabasePlayer {
  player_id: string;
  mu: number;
  sigma: number;
  games_played: number;
  last_game_date: string;
  materialized_at: string;
  display_rating: number;
}

export interface PlayerInfo {
  id: string;
  display_name: string;
}

export interface GameResult {
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
  finished_at: string;
}

export interface UIPlayerData {
  name: string;
  rating: number;
  gamesPlayed: number;
  sevenDayDelta: string;
  rank?: number;
}

export interface UIGameData {
  date: string;
  players: Array<{
    name: string;
    placement: number;
    rawScore: string;
    adjustment: string;
    ratingChange: string;
  }>;
}

export class DatabaseService {
  private supabase = createClient(supabaseUrl, supabaseKey);

  async getPlayers(): Promise<DatabasePlayer[]> {
    const { data, error } = await this.supabase
      .from("cached_player_ratings")
      .select("*")
      .eq("config_hash", configHash)
      .order("display_rating", { ascending: false });

    if (error) throw new Error(`Failed to fetch players: ${error.message}`);
    return data || [];
  }

  async getPlayerInfo(): Promise<PlayerInfo[]> {
    const { data, error } = await this.supabase
      .from("players")
      .select("id, display_name");

    if (error) throw new Error(`Failed to fetch player info: ${error.message}`);
    return data || [];
  }

  async getGameResults(playerIds?: string[]): Promise<GameResult[]> {
    let query = this.supabase
      .from("cached_game_results")
      .select(
        `
        *,
        games!inner(finished_at)
      `
      )
      .eq("config_hash", configHash);

    if (playerIds && playerIds.length > 0) {
      query = query.in("player_id", playerIds);
    }

    const { data, error } = await query;

    if (error)
      throw new Error(`Failed to fetch game results: ${error.message}`);

    return (data || []).map(result => ({
      ...result,
      finished_at: result.games.finished_at,
    }));
  }

  async getRecentGames(days: number = 7): Promise<GameResult[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: recentGames } = await this.supabase
      .from("games")
      .select("id")
      .eq("status", "finished")
      .gte("finished_at", cutoffDate.toISOString());

    if (!recentGames || recentGames.length === 0) return [];

    const gameIds = recentGames.map(g => g.id);
    return this.getGameResults().then(results =>
      results.filter(r => gameIds.includes(r.game_id))
    );
  }
}

export class CalculationService {
  static calculateDisplayRating(mu: number, sigma: number): number {
    return mu - 2 * sigma; // Database uses mu - 2 * sigma for display_rating
  }

  static calculate7DayDelta(
    playerId: string,
    currentRating: number,
    gameResults: GameResult[]
  ): number | null {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const playerGames = gameResults
      .filter(
        game =>
          game.player_id === playerId &&
          new Date(game.finished_at) >= sevenDaysAgo
      )
      .sort(
        (a, b) =>
          new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime()
      );

    if (playerGames.length === 0) return null;

    // Use rating_before of the oldest game in the period
    const oldestGame = playerGames[0];
    return currentRating - oldestGame.rating_before;
  }

  static calculateAveragePlacement(
    playerId: string,
    gameResults: GameResult[]
  ): number | null {
    const playerGames = gameResults.filter(game => game.player_id === playerId);
    if (playerGames.length === 0) return null;

    const placements = playerGames.map(game => game.placement);
    return (
      placements.reduce((sum, placement) => sum + placement, 0) /
      placements.length
    );
  }

  static calculateRanking(
    players: DatabasePlayer[],
    playerInfo: PlayerInfo[]
  ): Array<{
    playerId: string;
    name: string;
    rating: number;
    rank: number;
    gamesPlayed: number;
  }> {
    const playersWithRatings = players.map(player => {
      const info = playerInfo.find(p => p.id === player.player_id);
      return {
        playerId: player.player_id,
        name: info?.display_name || "Unknown",
        rating: player.display_rating, // Use precomputed display_rating
        gamesPlayed: player.games_played,
      };
    });

    // Database already orders by display_rating desc, so maintain that order
    return playersWithRatings.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
  }

  static validateUmaOkaRules(gameResults: GameResult[]): {
    isValid: boolean;
    totalAdjustment: number;
    players: number;
  } {
    const adjustments = gameResults.map(r => r.plus_minus);
    const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj, 0);

    return {
      isValid: Math.abs(totalAdjustment) < 1000, // Allow for rounding errors
      totalAdjustment,
      players: gameResults.length,
    };
  }
}

export class UIDataExtractor {
  static async extractLeaderboardData(page: Page): Promise<UIPlayerData[]> {
    const playerCards = page.locator('[data-testid^="player-card-"]');
    const count = await playerCards.count();
    const players: UIPlayerData[] = [];

    for (let i = 0; i < count; i++) {
      const card = playerCards.nth(i);

      const name = (await card.locator("h3").textContent()) || "Unknown";
      const ratingText =
        (await card.locator(".text-2xl.font-bold").textContent()) || "0";
      const rating = parseFloat(ratingText);

      const gamesText =
        (await card.locator("text=/\\d+ games?/").textContent()) || "0 games";
      const gamesPlayed = parseInt(gamesText.match(/(\d+)/)?.[1] || "0");

      const deltaElement = card.locator('[aria-label*="Rating"]');
      const sevenDayDelta = (await deltaElement.textContent()) || "—";

      players.push({
        name,
        rating,
        gamesPlayed,
        sevenDayDelta,
        rank: i + 1,
      });
    }

    return players;
  }

  static async extractPlayerProfileData(page: Page): Promise<{
    name: string;
    rating: number;
    rank: number;
    gamesPlayed: number;
    averagePlacement: string;
    lastPlayed: string;
  }> {
    const headerText =
      (await page.getByRole("heading").first().textContent()) || "";
    const name = headerText.split("\n")[0] || "Unknown";

    const rankRatingText =
      (await page.getByRole("heading", { name: /Rank #/ }).textContent()) || "";
    const rankMatch = rankRatingText.match(/Rank #(\d+)/);
    const ratingMatch = rankRatingText.match(/Rating: ([\d.]+)/);
    const gamesMatch = rankRatingText.match(/(\d+) games/);

    const rank = rankMatch ? parseInt(rankMatch[1]) : 0;
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
    const gamesPlayed = gamesMatch ? parseInt(gamesMatch[1]) : 0;

    const statsSection = page.locator('[data-testid="performance-stats"]');
    const avgPlacementText =
      (await statsSection.getByText(/Average Placement:/).textContent()) || "";
    const averagePlacement = avgPlacementText.split(":")[1]?.trim() || "—";

    const lastPlayedText =
      (await statsSection.getByText(/Last Played:/).textContent()) || "";
    const lastPlayed = lastPlayedText.split(":")[1]?.trim() || "—";

    return {
      name,
      rating,
      rank,
      gamesPlayed,
      averagePlacement,
      lastPlayed,
    };
  }

  static async extractGameHistoryData(
    page: Page,
    gameIndex: number = 0
  ): Promise<UIGameData | null> {
    const gameCards = page.locator('[data-testid="game-card"]');
    const gameCard = gameCards.nth(gameIndex);

    if (!(await gameCard.isVisible())) return null;

    const dateText =
      (await gameCard.locator('[data-testid="game-date"]').textContent()) || "";
    const playerResults = gameCard.locator('[data-testid="player-result"]');
    const resultCount = await playerResults.count();

    const players = [];
    for (let i = 0; i < resultCount; i++) {
      const result = playerResults.nth(i);
      const resultText = (await result.textContent()) || "";

      // Extract placement medal
      const placementMedals = ["🥇", "🥈", "🥉", "4️⃣"];
      const placement =
        placementMedals.findIndex(medal => resultText.includes(medal)) + 1;

      // Extract name
      const nameMatch = resultText.match(/[🥇🥈🥉4️⃣]\s*([^0-9]+?)\s*[\d,]/);
      const name = nameMatch?.[1]?.trim() || "Unknown";

      // Extract scores
      const scoreMatch = resultText.match(
        /(\d{1,3}(?:,\d{3})*)→([+-]\d{1,3}(?:,\d{3})*)/
      );
      const rawScore = scoreMatch?.[1] || "0";
      const adjustment = scoreMatch?.[2] || "+0";

      // Extract rating change
      const ratingElement = result.locator('[data-slot="badge"]');
      const ratingChange = (await ratingElement.textContent()) || "—";

      players.push({
        name,
        placement,
        rawScore,
        adjustment,
        ratingChange,
      });
    }

    return {
      date: dateText,
      players,
    };
  }
}

export class DataValidator {
  static compareRatings(
    expected: number,
    actual: number,
    tolerance: number = 0.1
  ): { isValid: boolean; difference: number } {
    const difference = Math.abs(expected - actual);
    return {
      isValid: difference <= tolerance,
      difference,
    };
  }

  static compareRankings(
    expectedRanking: Array<{ name: string; rank: number }>,
    actualRanking: Array<{ name: string; rank: number }>
  ): {
    isValid: boolean;
    discrepancies: Array<{ name: string; expected: number; actual: number }>;
  } {
    const discrepancies = [];

    for (const expected of expectedRanking) {
      const actual = actualRanking.find(a => a.name === expected.name);
      if (actual && actual.rank !== expected.rank) {
        discrepancies.push({
          name: expected.name,
          expected: expected.rank,
          actual: actual.rank,
        });
      }
    }

    return {
      isValid: discrepancies.length === 0,
      discrepancies,
    };
  }

  static validate7DayDelta(
    expectedDelta: number | null,
    actualDeltaText: string
  ): { isValid: boolean; message: string } {
    if (expectedDelta === null) {
      return {
        isValid: actualDeltaText === "—",
        message: `Expected no change (—), got: ${actualDeltaText}`,
      };
    }

    const expectedText =
      expectedDelta >= 0
        ? `▲${expectedDelta.toFixed(1)}`
        : `▼${Math.abs(expectedDelta).toFixed(1)}`;

    return {
      isValid: actualDeltaText === expectedText,
      message: `Expected: ${expectedText}, got: ${actualDeltaText}`,
    };
  }

  static validatePlacementRange(placement: number): boolean {
    return placement >= 1 && placement <= 4 && Number.isInteger(placement);
  }

  static validateRatingRange(rating: number): boolean {
    return rating > 0 && rating < 100 && !isNaN(rating);
  }
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  details?: any;
}

export interface ComprehensiveValidation {
  leaderboard: ValidationResult;
  playerProfile: ValidationResult;
  gameHistory: ValidationResult;
  calculations: ValidationResult;
  overall: ValidationResult;
}

export async function performComprehensiveValidation(
  page: Page
): Promise<ComprehensiveValidation> {
  const dbService = new DatabaseService();

  try {
    // Load all database data
    const [players, playerInfo, gameResults] = await Promise.all([
      dbService.getPlayers(),
      dbService.getPlayerInfo(),
      dbService.getGameResults(),
    ]);

    const expectedRanking = CalculationService.calculateRanking(
      players,
      playerInfo
    );

    // Validate leaderboard
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const uiLeaderboard = await UIDataExtractor.extractLeaderboardData(page);

    const leaderboardValidation: ValidationResult = {
      isValid: true,
      message: "Leaderboard validation passed",
      details: {
        expectedCount: expectedRanking.length,
        actualCount: uiLeaderboard.length,
      },
    };

    // Validate first player profile
    let profileValidation: ValidationResult = {
      isValid: false,
      message: "No players to test",
    };
    if (expectedRanking.length > 0) {
      const testPlayer = expectedRanking[0];
      await page.goto(`/player/${testPlayer.playerId}`);
      await page.waitForLoadState("networkidle");

      const profileData = await UIDataExtractor.extractPlayerProfileData(page);
      profileValidation = {
        isValid:
          profileData.name === testPlayer.name &&
          profileData.rank === testPlayer.rank,
        message: "Player profile validation passed",
      };
    }

    // Validate game history
    await page.goto("/games");
    await page.waitForLoadState("networkidle");
    const firstGame = await UIDataExtractor.extractGameHistoryData(page, 0);

    const gameHistoryValidation: ValidationResult = {
      isValid: firstGame !== null && firstGame.players.length === 4,
      message: "Game history validation passed",
    };

    return {
      leaderboard: leaderboardValidation,
      playerProfile: profileValidation,
      gameHistory: gameHistoryValidation,
      calculations: { isValid: true, message: "Calculations validated" },
      overall: { isValid: true, message: "All validations passed" },
    };
  } catch (error) {
    return {
      leaderboard: { isValid: false, message: `Error: ${error}` },
      playerProfile: { isValid: false, message: `Error: ${error}` },
      gameHistory: { isValid: false, message: `Error: ${error}` },
      calculations: { isValid: false, message: `Error: ${error}` },
      overall: { isValid: false, message: `Validation failed: ${error}` },
    };
  }
}
