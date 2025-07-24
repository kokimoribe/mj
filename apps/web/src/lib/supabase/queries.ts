import { createClient } from "./client";
import type { GameSeat, CachedPlayerRating, CachedGameResult } from "./types";
import { config } from "@/config";

// Core types for the application
export interface Player {
  id: string;
  name: string;
  rating: number;
  mu: number;
  sigma: number;
  gamesPlayed: number;
  lastPlayed: string;
  rating7DayDelta?: number | null;
  ratingHistory?: number[];
  rank?: number;
  averagePlacement?: number;
  recentGames?: Array<{
    gameId: string;
    date: string;
    rating: number;
  }>;
}

export interface LeaderboardData {
  players: Player[];
  totalGames: number;
  lastUpdated: string;
  seasonName: string;
}

export async function fetchLeaderboardData(): Promise<LeaderboardData> {
  const supabase = createClient();

  const currentSeasonConfigHash = config.season.hash;

  // Fetch player ratings from cached table
  const { data: ratingsData, error: ratingsError } = await supabase
    .from("cached_player_ratings")
    .select("*")
    .eq("config_hash", currentSeasonConfigHash)
    .order("display_rating", { ascending: false });

  if (ratingsError) {
    throw new Error(`Failed to fetch leaderboard: ${ratingsError.message}`);
  }

  // Get player names separately
  const playerIds = ratingsData?.map(r => r.player_id) || [];
  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("id, display_name")
    .in("id", playerIds);

  if (playersError) {
    throw new Error(`Failed to fetch player names: ${playersError.message}`);
  }

  // Create a map for quick lookup
  const playerMap = new Map(
    playersData?.map(p => [p.id, p.display_name]) || []
  );

  const players = ratingsData;

  // Get recent game history for 7-day delta calculation
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // First get games from the last 7 days
  const { data: recentGames, error: recentGamesError } = await supabase
    .from("games")
    .select("id, finished_at")
    .eq("status", "finished")
    .gte("finished_at", sevenDaysAgo.toISOString())
    .order("finished_at", { ascending: true });

  if (recentGamesError) {
    console.error("Failed to fetch recent games:", recentGamesError);
  }

  // Then get cached results for these games
  const recentGameIds = recentGames?.map(g => g.id) || [];
  interface RecentGameHistoryResult extends CachedGameResult {
    games: { finished_at: string };
    mu_before?: number;
    sigma_before?: number;
    mu_after?: number;
    sigma_after?: number;
  }
  let recentGameHistory: RecentGameHistoryResult[] = [];

  if (recentGameIds.length > 0) {
    const { data: cachedResults, error: cachedError } = await supabase
      .from("cached_game_results")
      .select("*")
      .eq("config_hash", currentSeasonConfigHash)
      .in("game_id", recentGameIds);

    if (!cachedError && cachedResults) {
      // Add finished_at from games to each result
      recentGameHistory = cachedResults
        .map(result => {
          const game = recentGames?.find(g => g.id === result.game_id);
          return {
            ...result,
            games: { finished_at: game?.finished_at || "" },
          };
        })
        .sort(
          (a, b) =>
            new Date(a.games.finished_at).getTime() -
            new Date(b.games.finished_at).getTime()
        );
    }
  }

  // Calculate 7-day deltas
  const playerDeltas: Record<
    string,
    { oldestRating: number; hasGamesInPeriod: boolean }
  > = {};
  recentGameHistory?.forEach(game => {
    // Store the oldest game's rating_before as the baseline
    if (!playerDeltas[game.player_id]) {
      // Calculate display rating from mu and sigma if available, otherwise use rating_before
      const oldestRating =
        game.mu_before && game.sigma_before
          ? game.mu_before - 3 * game.sigma_before
          : game.rating_before;
      playerDeltas[game.player_id] = {
        oldestRating,
        hasGamesInPeriod: true,
      };
    }
  });

  // Get last 10 games per player for mini charts
  // First get all games for these players
  const { data: playerGameSeats } = await supabase
    .from("game_seats")
    .select("game_id, player_id")
    .in("player_id", playerIds);

  const playerGameIds = [
    ...new Set(playerGameSeats?.map(s => s.game_id) || []),
  ];

  // Get the games to get their dates
  const { data: playerGames } = await supabase
    .from("games")
    .select("id, finished_at")
    .in("id", playerGameIds)
    .order("finished_at", { ascending: false });

  // Get cached results for these games
  interface PlayerRecentGame extends CachedGameResult {
    game_id: string;
    games?: { finished_at: string };
    mu_after?: number;
    sigma_after?: number;
  }
  let playerRecentGames: PlayerRecentGame[] = [];
  if (playerGameIds.length > 0) {
    const { data: cachedResults } = await supabase
      .from("cached_game_results")
      .select("*")
      .eq("config_hash", currentSeasonConfigHash)
      .in("game_id", playerGameIds)
      .in("player_id", playerIds);

    if (cachedResults) {
      playerRecentGames = cachedResults.map(result => {
        const game = playerGames?.find(g => g.id === result.game_id);
        return {
          ...result,
          games: { finished_at: game?.finished_at || "" },
        };
      });
    }
  }

  // Group recent games by player
  const recentGamesByPlayer: Record<
    string,
    Array<{ gameId: string; date: string; rating: number }>
  > = {};
  playerRecentGames?.forEach(game => {
    if (!recentGamesByPlayer[game.player_id]) {
      recentGamesByPlayer[game.player_id] = [];
    }
    // Keep only last 10 games per player
    if (recentGamesByPlayer[game.player_id].length < 10) {
      recentGamesByPlayer[game.player_id].push({
        gameId: game.game_id,
        date: game.games?.finished_at || "",
        rating:
          game.mu_after && game.sigma_after
            ? game.mu_after - 3 * game.sigma_after
            : game.rating_after,
      });
    }
  });

  // REQUIREMENT: Average Placement Calculation
  // Calculate average placement for each player from ALL their game results
  const playerAveragePlacements: Record<string, number> = {};
  
  // We need ALL games for placement calculation, not just recent ones
  // Get all cached results for ALL players' games
  const allPlayerPlacements: Record<string, number[]> = {};
  
  if (playerGameIds.length > 0) {
    const { data: allCachedResults } = await supabase
      .from("cached_game_results")
      .select("player_id, placement")
      .eq("config_hash", currentSeasonConfigHash)
      .in("player_id", playerIds);
    
    if (allCachedResults) {
      allCachedResults.forEach(result => {
        if (!allPlayerPlacements[result.player_id]) {
          allPlayerPlacements[result.player_id] = [];
        }
        allPlayerPlacements[result.player_id].push(result.placement);
      });
    }
  }
  
  // Calculate averages
  Object.entries(allPlayerPlacements).forEach(([playerId, placements]) => {
    if (placements.length > 0) {
      const sum = placements.reduce((acc, p) => acc + p, 0);
      playerAveragePlacements[playerId] = sum / placements.length;
    }
  });

  // Transform data to match interface
  const transformedPlayers: Player[] = (
    (players as CachedPlayerRating[]) || []
  ).map(p => {
    const currentRating = p.mu - 3 * p.sigma;
    const delta = playerDeltas[p.player_id];

    // Calculate 7-day delta
    let rating7DayDelta: number | null = null;
    if (delta?.hasGamesInPeriod) {
      rating7DayDelta = currentRating - delta.oldestRating;
    }

    return {
      id: p.player_id,
      name: playerMap.get(p.player_id) || "Unknown",
      rating: currentRating,
      mu: p.mu,
      sigma: p.sigma,
      gamesPlayed: p.games_played,
      lastPlayed: p.last_game_date || "",
      rating7DayDelta,
      ratingHistory: [], // Column doesn't exist in current schema
      recentGames: recentGamesByPlayer[p.player_id]?.reverse() || [], // Reverse to get chronological order
      averagePlacement: playerAveragePlacements[p.player_id] || undefined,
    };
  });

  // Get season metadata
  // REQUIREMENT: Total Games Calculation
  // The total games count MUST represent unique games played, not the sum of individual player games
  // Use the maximum games played by any single player
  const totalGames = Math.max(...transformedPlayers.map(p => p.gamesPlayed));
  const lastUpdated = players?.[0]?.materialized_at || new Date().toISOString();

  const seasonName = config.season.name;

  return {
    players: transformedPlayers,
    totalGames,
    lastUpdated,
    seasonName,
  };
}

export async function fetchPlayerProfile(playerId: string): Promise<Player> {
  const supabase = createClient();
  const currentSeasonConfigHash = config.season.hash;

  const { data, error } = await supabase
    .from("cached_player_ratings")
    .select("*")
    .eq("player_id", playerId)
    .eq("config_hash", currentSeasonConfigHash)
    .single();

  if (error) {
    throw new Error(`Failed to fetch player profile: ${error.message}`);
  }

  // Get player name
  const { data: playerData } = await supabase
    .from("players")
    .select("display_name")
    .eq("id", playerId)
    .single();

  // Get last 10 games for mini chart
  // First get the player's game IDs
  const { data: playerGameSeats } = await supabase
    .from("game_seats")
    .select("game_id")
    .eq("player_id", playerId)
    .limit(10);

  const gameIds = playerGameSeats?.map(s => s.game_id) || [];

  // Get game dates
  const { data: games } = await supabase
    .from("games")
    .select("id, finished_at")
    .in("id", gameIds)
    .order("finished_at", { ascending: false })
    .limit(10);

  // Get cached results
  interface RecentGameWithDetails extends CachedGameResult {
    game_id: string;
    games?: { finished_at: string };
    mu_after?: number;
    sigma_after?: number;
  }
  let recentGames: RecentGameWithDetails[] = [];
  if (gameIds.length > 0) {
    const { data: cachedResults } = await supabase
      .from("cached_game_results")
      .select("*")
      .eq("config_hash", currentSeasonConfigHash)
      .eq("player_id", playerId)
      .in("game_id", gameIds);

    if (cachedResults && games) {
      recentGames = cachedResults
        .map(result => {
          const game = games.find(g => g.id === result.game_id);
          return {
            ...result,
            games: { finished_at: game?.finished_at || "" },
          };
        })
        .sort(
          (a, b) =>
            new Date(b.games.finished_at).getTime() -
            new Date(a.games.finished_at).getTime()
        )
        .slice(0, 10);
    }
  }

  const formattedRecentGames =
    recentGames
      ?.map(game => ({
        gameId: game.game_id,
        date: game.games?.finished_at || "",
        rating:
          game.mu_after && game.sigma_after
            ? game.mu_after - 3 * game.sigma_after
            : game.rating_after,
      }))
      .reverse() || [];

  return {
    id: data.player_id,
    name: playerData?.display_name || "Unknown",
    rating: data.display_rating,
    mu: data.mu,
    sigma: data.sigma,
    gamesPlayed: data.games_played,
    lastPlayed: data.last_game_date || "",
    rating7DayDelta: null, // Not needed for profile view
    ratingHistory: data.rating_history || [],
    recentGames: formattedRecentGames,
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
  const currentSeasonConfigHash = config.season.hash;
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
      )
    `,
      { count: "exact" }
    )
    .eq("status", "finished")
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

  if (!games || games.length === 0) {
    return {
      games: [],
      totalGames: 0,
      hasMore: false,
      showingAll: false,
    };
  }

  // Get cached game results for these games
  const gameIds = games.map(g => g.id);
  const { data: cachedResults, error: resultsError } = await supabase
    .from("cached_game_results")
    .select("*")
    .eq("config_hash", currentSeasonConfigHash)
    .in("game_id", gameIds);

  if (resultsError) {
    throw new Error(`Failed to fetch game results: ${resultsError.message}`);
  }

  // Create a map of game results by game_id
  const resultsByGame: Record<string, CachedGameResult[]> = {};
  cachedResults?.forEach(result => {
    if (!resultsByGame[result.game_id]) {
      resultsByGame[result.game_id] = [];
    }
    resultsByGame[result.game_id].push(result);
  });

  // Transform the data to match our interface
  const transformedGames: Game[] = (games || []).map(game => {
    const gameResults = resultsByGame[game.id] || [];

    // Map results to our format
    const formattedResults: GameResult[] = gameResults
      .map(result => {
        const seat = game.game_seats.find(
          (seat: GameSeat) => seat.player_id === result.player_id
        );
        return {
          playerId: result.player_id,
          playerName:
            (Array.isArray(seat?.players)
              ? seat?.players[0]?.name
              : (seat?.players as { name: string } | undefined)?.name) ||
            "Unknown",
          placement: result.placement,
          rawScore: seat?.final_score || 0,
          scoreAdjustment: result.score_delta || 0,
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
      results: formattedResults,
    };
  });

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
  const currentSeasonConfigHash = config.season.hash;

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
