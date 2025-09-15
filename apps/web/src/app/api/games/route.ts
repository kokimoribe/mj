/**
 * Games API Route - IMPROVED VERSION
 *
 * This is the refactored version using the service layer and consistent
 * error handling. This file demonstrates the improved structure but is
 * not yet active to avoid breaking the application.
 */

import { NextRequest } from "next/server";
import { GameService } from "@/core/services/game.service";
import {
  withApiHandler,
  validateRequestBody,
  getQueryParams,
} from "@/core/lib/api-handler";
import { CreateGameRequest } from "@/core/domain/types";
import { GAME_CONSTANTS, API_CONFIG } from "@/core/domain/constants";

// Initialize service once
const gameService = new GameService();

/**
 * POST /api/games - Create a new game
 *
 * Creates a new game with 4 players. The improved version:
 * - Uses service layer for business logic
 * - Has consistent error handling
 * - Returns structured responses
 * - Validates input properly
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  // Validate request body
  const body = await validateRequestBody<CreateGameRequest>(request, data => {
    // Custom validation logic
    if (!data.player_ids || !Array.isArray(data.player_ids)) {
      return null;
    }
    if (data.player_ids.length !== GAME_CONSTANTS.PLAYERS_PER_GAME) {
      return null;
    }
    return {
      player_ids: data.player_ids,
      location: data.location,
      notes: data.notes,
    };
  });

  // Use service to create game
  const result = await gameService.createGame(body);

  if (result.error) {
    return result; // Error is handled by withApiHandler
  }

  // Return success with proper status
  return {
    data: result.data,
    meta: {
      message: "Game created successfully",
    },
  };
});

/**
 * GET /api/games - Get games list
 *
 * Retrieves games with optional filters. The improved version:
 * - Supports query parameters for filtering
 * - Uses service layer for data retrieval
 * - Returns paginated results
 * - Has consistent response structure
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  // Extract and validate query parameters
  const params = getQueryParams(request, {
    status: "string",
    playerId: "string",
    limit: "number",
    offset: "number",
  });

  // Set defaults for pagination
  const filters = {
    status: params.status as any,
    playerId: params.playerId,
    limit: params.limit || API_CONFIG.DEFAULT_PAGE_SIZE,
    offset: params.offset || 0,
  };

  // Use service to get games
  const result = await gameService.getGames(filters);

  if (result.error) {
    return result; // Error is handled by withApiHandler
  }

  // Return success with metadata
  return {
    data: {
      games: result.data || [],
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: result.data?.length || 0,
      },
    },
    meta: {
      filters,
    },
  };
});
