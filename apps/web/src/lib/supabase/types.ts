// Type definitions for Supabase database responses

export interface CachedGameResult {
  config_hash: string;
  player_id: string;
  game_id: string;
  placement: number;
  raw_score: number;
  score_delta: number;
  mu_before: number;
  sigma_before: number;
  mu_after: number;
  sigma_after: number;
  player_name?: string;
  date?: string;
}

export interface GameSeat {
  seat: number;
  player_id: string;
  final_score: number;
  players:
    | {
        id: string;
        display_name: string;
      }
    | Array<{
        id: string;
        display_name: string;
      }>;
}

export interface GameWithResults {
  id: string;
  finished_at: string;
  game_seats: GameSeat[];
  cached_game_results: CachedGameResult[];
}

export interface CachedPlayerRating {
  player_id: string;
  players: Array<{
    id: string;
    name: string;
  }>;
  rating: number;
  display_rating: number;
  mu: number;
  sigma: number;
  games_played: number;
  last_game_date: string | null;
  rating_change: number | null;
  rating_history: number[] | null;
  materialized_at: string;
}

// Type for joined game data in cached_game_player_results queries
export interface CachedGamePlayerResultWithGame {
  player_id: string;
  game_id: string;
  games: {
    finished_at: string;
  };
  mu_after: number;
  sigma_after: number;
  mu_before: number;
  sigma_before: number;
}

export interface PlayerWithRatings {
  id: string;
  name: string;
  cached_player_ratings: Array<{
    rating: number;
    mu: number;
    sigma: number;
    games_played: number;
    last_game_date: string | null;
    rating_history: number[] | null;
  }>;
}

export interface CachedGamePlayerResult {
  game_id: string;
  games: {
    id: string;
    finished_at: string;
  };
  placement: number;
  raw_score: number;
  score_delta: number;
  mu_before: number;
  sigma_before: number;
  mu_after: number;
  sigma_after: number;
}
