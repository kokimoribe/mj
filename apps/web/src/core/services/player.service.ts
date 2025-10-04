/**
 * Player Service
 *
 * Business logic for player-related operations.
 * Handles player profiles, statistics, and game history.
 */

import { BaseService } from "./base.service";
import { createClient } from "@/lib/supabase/server";

export interface PlayerProfile {
  id: string;
  display_name: string;
  created_at: string;
  rating?: number;
  games_played?: number;
  average_position?: number;
  win_rate?: number;
}

export interface PlayerGame {
  id: string;
  created_at: string;
  player_id: string;
  position: number;
  score: number;
  rating_before?: number;
  rating_after?: number;
  rating_delta?: number;
}

export class PlayerService extends BaseService {
  constructor() {
    super("PlayerService");
  }

  /**
   * Get player profile with statistics
   */
  async getPlayerProfile(playerId: string): Promise<PlayerProfile | null> {
    try {
      const supabase = await createClient();

      // Get player basic info
      const { data: player, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .single();

      if (error || !player) {
        console.error("Failed to fetch player profile", error);
        return null;
      }

      // Get player statistics from cached data
      const { data: stats } = await supabase
        .from("cached_player_ratings")
        .select("rating, games_played, average_position, win_rate")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        ...player,
        ...(stats || {}),
      };
    } catch (error) {
      console.error("Error in getPlayerProfile", error);
      return null;
    }
  }

  /**
   * Get player's game history
   */
  async getPlayerGames(
    playerId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PlayerGame[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("game_seats")
        .select(
          `
          *,
          games (
            id,
            created_at,
            season
          )
        `
        )
        .eq("player_id", playerId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Failed to fetch player games", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getPlayerGames", error);
      return [];
    }
  }

  /**
   * Search players by name
   */
  async searchPlayers(query: string): Promise<PlayerProfile[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("players")
        .select("*")
        .ilike("display_name", `%${query}%`)
        .limit(10);

      if (error) {
        console.error("Failed to search players", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in searchPlayers", error);
      return [];
    }
  }

  /**
   * Get player rankings for a specific time period
   */
  async getPlayerRankings(
    startDate?: string,
    endDate?: string,
    minGames: number = 5
  ): Promise<PlayerProfile[]> {
    try {
      const supabase = await createClient();

      let query = supabase
        .from("cached_player_ratings")
        .select(
          `
          *,
          players (
            id,
            display_name
          )
        `
        )
        .gte("games_played", minGames)
        .order("rating", { ascending: false });

      // Apply date filters if provided
      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch player rankings", error);
        return [];
      }

      return (
        data?.map(item => ({
          id: item.player_id,
          display_name: item.players?.display_name || "Unknown",
          created_at: item.created_at,
          rating: item.rating,
          games_played: item.games_played,
          average_position: item.average_position,
          win_rate: item.win_rate,
        })) || []
      );
    } catch (error) {
      console.error("Error in getPlayerRankings", error);
      return [];
    }
  }
}

// Export singleton instance
export const playerService = new PlayerService();
