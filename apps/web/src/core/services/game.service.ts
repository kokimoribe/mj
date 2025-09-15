/**
 * Game Service
 *
 * Handles all game-related business logic including game creation,
 * score updates, and game history retrieval.
 */

import { BaseService } from "./base.service";
import { GameRepository } from "@/core/repositories/game.repository";
import {
  Game,
  GameWithSeats,
  GameWithPlayers,
  CreateGameRequest,
  UpdateScoresRequest,
  ApiResponse,
  UUID,
} from "@/core/domain/types";

export class GameService extends BaseService {
  private gameRepository: GameRepository;

  constructor() {
    super("GameService");
    this.gameRepository = new GameRepository();
  }

  /**
   * Creates a new game with the specified players
   */
  async createGame(
    request: CreateGameRequest
  ): Promise<ApiResponse<GameWithSeats>> {
    return this.handleServiceCall(async () => {
      // Validate request
      this.validateRequired(request, ["player_ids"]);

      if (request.player_ids.length !== 4) {
        throw new Error("A game must have exactly 4 players");
      }

      // Check for duplicate players
      const uniquePlayers = new Set(request.player_ids);
      if (uniquePlayers.size !== 4) {
        throw new Error("All players must be unique");
      }

      // Create the game
      const game = await this.gameRepository.createGame({
        status: "ongoing",
        location: request.location || "River Terrace Mahjong Parlor",
        notes: request.notes,
        table_type: "manual",
      });

      // Assign seats to players
      const seats = ["east", "south", "west", "north"] as const;
      const gameSeats = await Promise.all(
        request.player_ids.map((playerId, index) =>
          this.gameRepository.createGameSeat({
            game_id: game.id,
            player_id: playerId,
            seat: seats[index],
          })
        )
      );

      return {
        ...game,
        game_seats: gameSeats,
      };
    }, "createGame");
  }

  /**
   * Updates scores for a game
   */
  async updateGameScores(
    gameId: UUID,
    request: UpdateScoresRequest
  ): Promise<ApiResponse<GameWithSeats>> {
    return this.handleServiceCall(async () => {
      // Validate request
      this.validateRequired(request, ["scores"]);

      if (request.scores.length !== 4) {
        throw new Error("Must provide scores for all 4 players");
      }

      // Validate score total (should sum to 100,000 in standard riichi)
      const totalScore = request.scores.reduce((sum, s) => sum + s.score, 0);
      if (Math.abs(totalScore - 100000) > 4) {
        // Allow small rounding errors
        throw new Error(
          `Scores must sum to 100,000 (current sum: ${totalScore})`
        );
      }

      // Update each seat's score
      await Promise.all(
        request.scores.map(score =>
          this.gameRepository.updateGameSeatScore(
            gameId,
            score.player_id,
            score.score
          )
        )
      );

      // Mark game as finished
      await this.gameRepository.updateGameStatus(gameId, "finished");

      // Return updated game
      return await this.gameRepository.getGameWithSeats(gameId);
    }, "updateGameScores");
  }

  /**
   * Gets all games with optional filters
   */
  async getGames(filters?: {
    status?: Game["status"];
    playerId?: UUID;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<GameWithPlayers[]>> {
    return this.handleServiceCall(async () => {
      return await this.gameRepository.getGames(filters);
    }, "getGames");
  }

  /**
   * Gets a single game by ID
   */
  async getGame(gameId: UUID): Promise<ApiResponse<GameWithPlayers>> {
    return this.handleServiceCall(async () => {
      const game = await this.gameRepository.getGameWithPlayers(gameId);
      if (!game) {
        throw new Error("Game not found");
      }
      return game;
    }, "getGame");
  }

  /**
   * Gets games for a specific player
   */
  async getPlayerGames(
    playerId: UUID,
    limit?: number
  ): Promise<ApiResponse<GameWithPlayers[]>> {
    return this.handleServiceCall(async () => {
      return await this.gameRepository.getPlayerGames(playerId, limit);
    }, "getPlayerGames");
  }

  /**
   * Cancels a game
   */
  async cancelGame(gameId: UUID): Promise<ApiResponse<Game>> {
    return this.handleServiceCall(async () => {
      return await this.gameRepository.updateGameStatus(gameId, "cancelled");
    }, "cancelGame");
  }

  /**
   * Gets game statistics
   */
  async getGameStatistics(): Promise<
    ApiResponse<{
      totalGames: number;
      gamesInProgress: number;
      gamesCompleted: number;
      gamesCancelled: number;
      averageGameDuration: number;
      mostActiveLocation: string;
    }>
  > {
    return this.handleServiceCall(async () => {
      const stats = await this.gameRepository.getGameStatistics();
      return stats;
    }, "getGameStatistics");
  }
}
