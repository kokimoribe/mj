import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TYPES MATCHING PHASE 0 SCHEMA
// ============================================================================

export type RiichiSeat = 'east' | 'south' | 'west' | 'north';
export type GameStatus = 'scheduled' | 'ongoing' | 'finished' | 'cancelled';

// Source Tables (Critical Data)
export interface Player {
  id: string;
  display_name: string;
  auth_user_id?: string;
  email?: string;
  phone?: string;
  timezone: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  started_at: string;
  finished_at?: string;
  status: GameStatus;
  scheduled_at?: string;
  table_type: 'automatic' | 'manual';
  location: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GameSeat {
  game_id: string;
  seat: RiichiSeat;
  player_id: string;
  final_score?: number; // Raw final score (e.g., 48100)
}

// Configuration System
export interface RatingConfiguration {
  config_hash: string;
  config_data: {
    timeRange: {
      startDate: string; // "2024-01-01"
      endDate: string; // "2024-03-31"
      name: string; // "Winter 2024"
    };
    rating: {
      initialMu: number; // 25.0
      initialSigma: number; // 8.33
      confidenceFactor: number; // 2.0
      decayRate: number; // 0.02
    };
    scoring: {
      oka: number; // 20000
      uma: [number, number, number, number]; // [10000, 5000, -5000, -10000]
    };
    weights: {
      divisor: number; // 40
      min: number; // 0.5
      max: number; // 1.5
    };
    qualification: {
      minGames: number; // 8
      dropWorst: number; // 2
    };
  };
  name?: string;
  description?: string;
  is_official: boolean;
  created_by?: string;
  created_at: string;
  last_used_at: string;
}

// Derived Tables (Computed Cache)
export interface CachedPlayerRating {
  config_hash: string;
  player_id: string;
  games_start_date: string;
  games_end_date: string;
  
  // OpenSkill parameters
  mu: number;
  sigma: number;
  display_rating: number;
  
  // Game statistics
  games_played: number;
  total_plus_minus: number;
  best_game_plus?: number;
  worst_game_minus?: number;
  
  // Streak tracking
  longest_first_streak: number;
  longest_fourth_free_streak: number;
  
  // Performance statistics
  tsumo_rate?: number;
  ron_rate?: number;
  riichi_rate?: number;
  deal_in_rate?: number;
  
  // Cache metadata
  computed_at: string;
  source_data_hash: string;
  last_game_date?: string;
  last_decay_applied?: string;
}

export interface CachedGameResult {
  config_hash: string;
  game_id: string;
  player_id: string;
  seat: RiichiSeat;
  
  // Computed by Python function
  final_score: number;
  placement: number; // 1-4
  plus_minus: number; // oka/uma applied
  rating_weight?: number;
  
  // Rating changes
  mu_before?: number;
  sigma_before?: number;
  mu_after?: number;
  sigma_after?: number;
  
  computed_at: string;
}

// Views
export interface CurrentLeaderboard {
  display_name: string;
  display_rating?: number;
  games_played?: number;
  min_games_qualify?: number;
  qualified?: boolean;
  total_plus_minus?: number;
  avg_plus_minus?: number;
  tsumo_rate?: number;
  ron_rate?: number;
  riichi_rate?: number;
  deal_in_rate?: number;
  longest_first_streak?: number;
  longest_fourth_free_streak?: number;
  last_game_date?: string;
  activity_status?: 'active' | 'declining' | 'inactive';
  config_hash?: string;
  computed_at?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export async function getOfficialConfigurations() {
  return supabase
    .from('rating_configurations')
    .select('*')
    .eq('is_official', true)
    .order('created_at', { ascending: false });
}

export async function getCurrentLeaderboard(configHash?: string) {
  let query = supabase.from('current_leaderboard').select('*');
  
  if (configHash) {
    query = query.eq('config_hash', configHash);
  }
  
  return query.order('display_rating', { ascending: false });
}

export async function getPlayerGames(playerId: string) {
  return supabase
    .from('game_seats')
    .select(`
      *,
      games!inner(*)
    `)
    .eq('player_id', playerId)
    .order('games.started_at', { ascending: false });
}
