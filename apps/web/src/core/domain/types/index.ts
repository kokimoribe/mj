/**
 * Core Domain Types
 *
 * This file contains all the core types used throughout the application.
 * These types represent the domain model and should be used consistently
 * across all layers of the application.
 */

// ============================================================================
// Base Types
// ============================================================================

export type UUID = string;
export type ISODateString = string;
export type Timestamp = number;

// ============================================================================
// Player Domain
// ============================================================================

export interface Player {
  id: UUID;
  display_name: string;
  auth_user_id?: UUID;
  email?: string;
  phone?: string;
  timezone: string;
  notification_preferences: NotificationPreferences;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
}

export interface PlayerRating {
  player_id: UUID;
  configuration_hash: string;
  mu: number;
  sigma: number;
  games_played: number;
  wins: number;
  average_placement: number;
  average_plus_minus: number;
  last_game_date: ISODateString;
  last_updated: ISODateString;
}

export interface PlayerWithRating extends Player {
  rating?: PlayerRating;
}

// ============================================================================
// Game Domain
// ============================================================================

export type GameStatus = "scheduled" | "ongoing" | "finished" | "cancelled";
export type TableType = "automatic" | "manual";
export type RiichiSeat = "east" | "south" | "west" | "north";

export interface Game {
  id: UUID;
  started_at: ISODateString;
  finished_at?: ISODateString;
  status: GameStatus;
  scheduled_at?: ISODateString;
  table_type: TableType;
  location: string;
  notes?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface GameSeat {
  game_id: UUID;
  seat: RiichiSeat;
  player_id: UUID;
  final_score?: number;
  placement?: number;
  plus_minus?: number;
}

export interface GameWithSeats extends Game {
  game_seats: GameSeat[];
}

export interface GameWithPlayers extends Game {
  game_seats: (GameSeat & {
    player: Player;
  })[];
}

// ============================================================================
// Hand Recording Domain
// ============================================================================

export type HandStatus = "incomplete" | "ready" | "confirmed";
export type HandActionType =
  | "tsumo"
  | "ron"
  | "draw"
  | "riichi"
  | "penalty"
  | "bonus";

export interface Hand {
  id: UUID;
  game_id: UUID;
  round_number: number;
  round_wind: RiichiSeat;
  hand_number: number;
  status: HandStatus;
  honba_sticks: number;
  riichi_sticks: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface HandAction {
  id: UUID;
  hand_id: UUID;
  player_id: UUID;
  action_type: HandActionType;
  action_order: number;
  points_delta?: number;
  riichi_stick_delta: number;
  created_at: ISODateString;
}

export interface HandWithActions extends Hand {
  hand_actions: HandAction[];
}

// ============================================================================
// Rating Configuration Domain
// ============================================================================

export type RatingSystem = "openskill";

export interface RatingConfiguration {
  hash: string;
  display_name: string;
  description?: string;
  rating_system: RatingSystem;
  parameters: RatingParameters;
  uma_mode: "fixed" | "floating";
  uma_values?: number[];
  placement_mode: "rank" | "score";
  entry_fee?: number;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface RatingParameters {
  mu?: number;
  sigma?: number;
  beta?: number;
  tau?: number;
  epsilon?: number;
  [key: string]: any;
}

// ============================================================================
// Leaderboard Domain
// ============================================================================

export interface LeaderboardEntry {
  player: Player;
  rating: PlayerRating;
  rank: number;
  rating_value: number;
  confidence_interval: [number, number];
  recent_games: GameResult[];
}

export interface GameResult {
  game_id: UUID;
  played_at: ISODateString;
  placement: number;
  score: number;
  plus_minus: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiMeta {
  timestamp: ISODateString;
  version: string;
  [key: string]: any;
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateGameRequest {
  player_ids: UUID[];
  location?: string;
  notes?: string;
}

export interface UpdateScoresRequest {
  scores: {
    player_id: UUID;
    score: number;
  }[];
}

export interface CreateHandRequest {
  round_number: number;
  round_wind: RiichiSeat;
  hand_number: number;
  honba_sticks?: number;
  riichi_sticks?: number;
}

export interface UpdateHandRequest {
  status?: HandStatus;
  actions?: Omit<HandAction, "id" | "hand_id" | "created_at">[];
}

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
