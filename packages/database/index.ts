import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export types for database tables
export interface Player {
  id: string
  name: string
  created_at: string
}

export interface Season {
  id: string
  name: string
  start_date: string
  end_date?: string
  is_active: boolean
}

export interface Game {
  id: string
  season_id: string
  game_date: string
  final_scores: number[]
  player_ids: string[]
  created_at: string
}

export interface PlayerRating {
  player_id: string
  season_id: string
  mu: number
  sigma: number
  display_rating: number
  games_played: number
  last_game_date?: string
  updated_at: string
}

export interface PlayerStats {
  player_id: string
  season_id: string
  placement_counts: number[] // [1st, 2nd, 3rd, 4th]
  total_plus_minus: number
  updated_at: string
}
