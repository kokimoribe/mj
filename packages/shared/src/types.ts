// Shared type definitions for API consistency
export interface Player {
  id: string;
  name: string;
  rating: number;
  games: number;
}

export interface LeaderboardData {
  season: string;
  players: Player[];
}

export interface GameResult {
  player_ids: string[];
  final_scores: number[];
  game_date: string;
}
