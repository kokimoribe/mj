import { createClient } from "./client";
import type { Player, LeaderboardData } from "../queries";

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
  const transformedPlayers: Player[] = (players || []).map(p => ({
    id: p.player_id,
    name: p.players[0].name,
    rating: p.rating,
    mu: p.mu,
    sigma: p.sigma,
    games: p.games_played,
    lastGameDate: p.last_game_date,
    totalPlusMinus: 0, // TODO: Calculate from games if needed
    averagePlusMinus: 0, // TODO: Calculate from games if needed
    bestGame: 0, // TODO: Calculate from games if needed
    worstGame: 0, // TODO: Calculate from games if needed
    ratingChange: p.rating_change || 0,
    ratingHistory: p.rating_history || [],
  }));

  // Get season metadata
  const totalGames = transformedPlayers.reduce((sum, p) => sum + p.games, 0);
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
    games: data.games_played,
    lastGameDate: data.last_game_date,
    totalPlusMinus: 0, // TODO: Calculate from games
    averagePlusMinus: 0, // TODO: Calculate from games
    bestGame: 0, // TODO: Calculate from games
    worstGame: 0, // TODO: Calculate from games
    ratingChange: data.rating_change || 0,
    ratingHistory: data.rating_history || [],
  };
}
