import { createClient } from "./client";
import type { Player, LeaderboardData } from "../queries";
import type {
  CachedGameResult,
  GameSeat,
  GameWithResults,
  CachedPlayerRating,
} from "./types";

// Default season configuration hash (hardcoded for Season 3)
const DEFAULT_SEASON_CONFIG_HASH = "season_3_2024";

export async function fetchLeaderboardData(): Promise<LeaderboardData> {
  const supabase = createClient();

  // Get current season config hash from environment or use default
  const currentSeasonConfigHash =
    process.env.NEXT_PUBLIC_CURRENT_SEASON_CONFIG_HASH ||
    DEFAULT_SEASON_CONFIG_HASH;

  // Fetch player ratings from cached table
  const { data: players, error } = await supabase
    .from("cached_player_ratings")
    .select(
      `
      player_id,
      players!inner(id, name),
      rating,
      mu,
      sigma,
      games_played,
      last_game_date,
      rating_change,
      rating_history,
      materialized_at
    `
    )
    .eq("config_hash", currentSeasonConfigHash)
    .order("rating", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  // Transform data to match interface
  const transformedPlayers: Player[] = (
    (players as CachedPlayerRating[]) || []
  ).map(p => {
    return {
      id: p.player_id,
      name: p.players[0].name,
      rating: p.rating,
      mu: p.mu,
      sigma: p.sigma,
      gamesPlayed: p.games_played,
      lastPlayed: p.last_game_date || "",
      ratingChange: p.rating_change || 0,
      ratingHistory: p.rating_history || [],
    };
  });

  // Get season metadata
  const totalGames = transformedPlayers.reduce(
    (sum, p) => sum + p.gamesPlayed,
    0
  );
  const lastUpdated = players?.[0]?.materialized_at || new Date().toISOString();

  // Get season name from config or default
  const seasonName = process.env.NEXT_PUBLIC_CURRENT_SEASON_NAME || "Season 3";

  return {
    players: transformedPlayers,
    totalGames,
    lastUpdated,
    seasonName,
  };
}

export async function fetchPlayerProfile(playerId: string): Promise<Player> {
  const supabase = createClient();
  const currentSeasonConfigHash =
    process.env.NEXT_PUBLIC_CURRENT_SEASON_CONFIG_HASH ||
    DEFAULT_SEASON_CONFIG_HASH;

  const { data, error } = await supabase
    .from("cached_player_ratings")
    .select(
      `
      player_id,
      players!inner(id, name),
      rating,
      mu,
      sigma,
      games_played,
      last_game_date,
      rating_change,
      rating_history
    `
    )
    .eq("player_id", playerId)
    .eq("config_hash", currentSeasonConfigHash)
    .single();

  if (error) {
    throw new Error(`Failed to fetch player profile: ${error.message}`);
  }

  return {
    id: data.player_id,
    name: data.players[0].name,
    rating: data.rating,
    mu: data.mu,
    sigma: data.sigma,
    gamesPlayed: data.games_played,
    lastPlayed: data.last_game_date || "",
    ratingChange: data.rating_change || 0,
    ratingHistory: data.rating_history || [],
  };
}

// Game History Types
export interface GameResult {
  playerId: string;
  playerName: string;
  placement: number; // 1-4
  rawScore: number; // Final table score
  scoreAdjustment: number; // Plus/minus with uma/oka
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number;
}

export interface Game {
  id: string;
  date: string; // ISO 8601 format
  seasonId: string;
  results: GameResult[]; // Always 4 players
}

export interface GameHistoryData {
  games: Game[];
  totalGames: number;
  hasMore: boolean;
  showingAll: boolean;
}

export interface FilterOptions {
  playerId?: string; // undefined = all games
  offset?: number;
  limit?: number;
}

// Fetch all players for filter dropdown
export async function fetchAllPlayers() {
  const supabase = createClient();

  const { data: players, error } = await supabase
    .from("players")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch players: ${error.message}`);
  }

  return players || [];
}

// Fetch game history with optional player filter
export async function fetchGameHistory(
  options: FilterOptions = {}
): Promise<GameHistoryData> {
  const supabase = createClient();
  const currentSeasonConfigHash =
    process.env.NEXT_PUBLIC_CURRENT_SEASON_CONFIG_HASH ||
    DEFAULT_SEASON_CONFIG_HASH;
  const { playerId, offset = 0, limit = 10 } = options;

  let query = supabase
    .from("games")
    .select(
      `
      id,
      finished_at,
      game_seats!inner(
        seat,
        player_id,
        final_score,
        players!inner(
          id,
          name
        )
      ),
      cached_game_results!inner(
        player_id,
        placement,
        raw_score,
        score_delta,
        rating_before,
        rating_after,
        rating_change
      )
    `,
      { count: "exact" }
    )
    .eq("status", "finished")
    .eq("cached_game_results.config_hash", currentSeasonConfigHash)
    .order("finished_at", { ascending: false });

  // Apply player filter if specified
  if (playerId) {
    // First get game IDs for the player
    const { data: playerGames, error: playerError } = await supabase
      .from("game_seats")
      .select(
        `
        game_id,
        games!inner(
          id,
          finished_at,
          status
        )
      `
      )
      .eq("player_id", playerId)
      .eq("games.status", "finished")
      .order("games.finished_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (playerError) {
      throw new Error(`Failed to fetch player games: ${playerError.message}`);
    }

    const gameIds = playerGames?.map(g => g.game_id) || [];

    if (gameIds.length === 0) {
      return {
        games: [],
        totalGames: 0,
        hasMore: false,
        showingAll: false,
      };
    }

    query = query.in("id", gameIds);
  } else {
    query = query.range(offset, offset + limit - 1);
  }

  const { data: games, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch game history: ${error.message}`);
  }

  // Transform the data to match our interface
  const transformedGames: Game[] = ((games as GameWithResults[]) || []).map(
    game => {
      // Group results by game
      const gameResults: GameResult[] = game.cached_game_results
        .filter(
          (result: CachedGameResult) =>
            result.config_hash === currentSeasonConfigHash
        )
        .map((result: CachedGameResult) => {
          const seat = game.game_seats.find(
            (seat: GameSeat) => seat.player_id === result.player_id
          );
          return {
            playerId: result.player_id,
            playerName:
              (Array.isArray(seat?.players)
                ? seat?.players[0]?.name
                : seat?.players?.name) || "Unknown",
            placement: result.placement,
            rawScore: result.raw_score,
            scoreAdjustment: result.score_delta,
            ratingBefore: result.rating_before,
            ratingAfter: result.rating_after,
            ratingChange: result.rating_change,
          };
        })
        .sort((a: GameResult, b: GameResult) => a.placement - b.placement);

      return {
        id: game.id,
        date: game.finished_at,
        seasonId: currentSeasonConfigHash,
        results: gameResults,
      };
    }
  );

  return {
    games: transformedGames,
    totalGames: count || 0,
    hasMore: (count || 0) > offset + limit,
    showingAll: false,
  };
}

// Get game count for each player (for filter dropdown)
export async function fetchPlayerGameCounts() {
  const supabase = createClient();
  const currentSeasonConfigHash =
    process.env.NEXT_PUBLIC_CURRENT_SEASON_CONFIG_HASH ||
    DEFAULT_SEASON_CONFIG_HASH;

  const { data, error } = await supabase
    .from("cached_player_ratings")
    .select("player_id, games_played")
    .eq("config_hash", currentSeasonConfigHash);

  if (error) {
    throw new Error(`Failed to fetch player game counts: ${error.message}`);
  }

  const gameCounts: Record<string, number> = {};
  data?.forEach(item => {
    gameCounts[item.player_id] = item.games_played;
  });

  return gameCounts;
}
