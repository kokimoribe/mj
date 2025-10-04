/**
 * Game Repository
 *
 * Handles all database operations related to games and game seats.
 */

import { BaseRepository } from "./base.repository";
import {
  Game,
  GameSeat,
  GameWithSeats,
  GameWithPlayers,
  UUID,
} from "@/core/domain/types";

export class GameRepository extends BaseRepository {
  constructor() {
    super("games");
  }

  /**
   * Creates a new game
   */
  async createGame(gameData: Partial<Game>): Promise<Game> {
    const game = {
      ...gameData,
      started_at: new Date().toISOString(),
      status: gameData.status || "ongoing",
      table_type: gameData.table_type || "manual",
      location: gameData.location || "River Terrace Mahjong Parlor",
    };

    return this.executeQuery(
      this.supabase
        .from("games")
        .insert(game)
        .select()
        .single() as unknown as Promise<{ data: Game | null; error: any }>,
      "createGame"
    );
  }

  /**
   * Creates a game seat
   */
  async createGameSeat(
    seatData: Omit<GameSeat, "placement" | "plus_minus">
  ): Promise<GameSeat> {
    return this.executeQuery(
      this.supabase
        .from("game_seats")
        .insert(seatData)
        .select()
        .single() as unknown as Promise<{ data: GameSeat | null; error: any }>,
      "createGameSeat"
    );
  }

  /**
   * Updates a game seat's score
   */
  async updateGameSeatScore(
    gameId: UUID,
    playerId: UUID,
    score: number
  ): Promise<GameSeat> {
    return this.executeQuery(
      this.supabase
        .from("game_seats")
        .update({ final_score: score })
        .eq("game_id", gameId)
        .eq("player_id", playerId)
        .select()
        .single() as unknown as Promise<{ data: GameSeat | null; error: any }>,
      "updateGameSeatScore"
    );
  }

  /**
   * Updates a game's status
   */
  async updateGameStatus(gameId: UUID, status: Game["status"]): Promise<Game> {
    const updates: Partial<Game> = { status };

    if (status === "finished") {
      updates.finished_at = new Date().toISOString();
    }

    return this.executeQuery(
      this.supabase
        .from("games")
        .update(updates)
        .eq("id", gameId)
        .select()
        .single() as unknown as Promise<{ data: Game | null; error: any }>,
      "updateGameStatus"
    );
  }

  /**
   * Gets a game with its seats
   */
  async getGameWithSeats(gameId: UUID): Promise<GameWithSeats> {
    const game = await this.executeQuery(
      this.supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single() as unknown as Promise<{ data: Game | null; error: any }>,
      "getGame"
    );

    const seats = await this.executeQuery(
      this.supabase
        .from("game_seats")
        .select("*")
        .eq("game_id", gameId) as unknown as Promise<{
        data: GameSeat[] | null;
        error: any;
      }>,
      "getGameSeats"
    );

    return {
      ...game,
      game_seats: seats,
    };
  }

  /**
   * Gets a game with its players
   */
  async getGameWithPlayers(gameId: UUID): Promise<GameWithPlayers | null> {
    const result = await this.executeQueryNullable(
      this.supabase
        .from("games")
        .select(
          `
          *,
          game_seats (
            *,
            player:players (*)
          )
        `
        )
        .eq("id", gameId)
        .single() as unknown as Promise<{
        data: GameWithPlayers | null;
        error: any;
      }>,
      "getGameWithPlayers"
    );

    return result as GameWithPlayers | null;
  }

  /**
   * Gets all games with filters
   */
  async getGames(filters?: {
    status?: Game["status"];
    playerId?: UUID;
    limit?: number;
    offset?: number;
  }): Promise<GameWithPlayers[]> {
    let query = this.supabase
      .from("games")
      .select(
        `
        *,
        game_seats (
          *,
          player:players (*)
        )
      `
      )
      .order("started_at", { ascending: false });

    if (filters) {
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.playerId) {
        query = query.eq("game_seats.player_id", filters.playerId);
      }

      query = this.buildFilterQuery(query, {
        limit: filters.limit,
        offset: filters.offset,
      });
    }

    const result = await this.executeQuery(
      query as unknown as Promise<{
        data: GameWithPlayers[] | null;
        error: any;
      }>,
      "getGames"
    );
    return result as GameWithPlayers[];
  }

  /**
   * Gets games for a specific player
   */
  async getPlayerGames(
    playerId: UUID,
    limit?: number
  ): Promise<GameWithPlayers[]> {
    const query = this.supabase
      .from("games")
      .select(
        `
        *,
        game_seats!inner (
          *,
          player:players (*)
        )
      `
      )
      .eq("game_seats.player_id", playerId)
      .order("started_at", { ascending: false });

    const limitedQuery = limit ? query.limit(limit) : query;

    const result = await this.executeQuery(
      limitedQuery as unknown as Promise<{
        data: GameWithPlayers[] | null;
        error: any;
      }>,
      "getPlayerGames"
    );
    return result as GameWithPlayers[];
  }

  /**
   * Gets game statistics
   */
  async getGameStatistics(): Promise<{
    totalGames: number;
    gamesInProgress: number;
    gamesCompleted: number;
    gamesCancelled: number;
    averageGameDuration: number;
    mostActiveLocation: string;
  }> {
    // Get game counts by status
    const { data: statusCounts } = await this.supabase
      .from("games")
      .select("status")
      .then(({ data }) => ({
        data: data?.reduce(
          (acc, game) => {
            acc[game.status] = (acc[game.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      }));

    // Get average game duration for finished games
    const { data: finishedGames } = await this.supabase
      .from("games")
      .select("started_at, finished_at")
      .eq("status", "finished")
      .not("finished_at", "is", null);

    let averageDuration = 0;
    if (finishedGames && finishedGames.length > 0) {
      const totalDuration = finishedGames.reduce((sum, game) => {
        const start = new Date(game.started_at).getTime();
        const end = new Date(game.finished_at!).getTime();
        return sum + (end - start);
      }, 0);
      averageDuration = totalDuration / finishedGames.length;
    }

    // Get most active location
    const { data: locations } = await this.supabase
      .from("games")
      .select("location")
      .then(({ data }) => ({
        data: data?.reduce(
          (acc, game) => {
            acc[game.location] = (acc[game.location] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      }));

    const mostActiveLocation = locations
      ? Object.entries(locations).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "Unknown"
      : "Unknown";

    return {
      totalGames: Object.values(statusCounts || {}).reduce(
        (sum, count) => sum + count,
        0
      ),
      gamesInProgress: statusCounts?.ongoing || 0,
      gamesCompleted: statusCounts?.finished || 0,
      gamesCancelled: statusCounts?.cancelled || 0,
      averageGameDuration: averageDuration,
      mostActiveLocation,
    };
  }
}
