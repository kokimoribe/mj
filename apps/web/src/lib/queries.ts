import { useQuery } from "@tanstack/react-query";
import { hash } from "ohash";
import type { RatingConfiguration } from "@/stores/configStore";
import {
  fetchLeaderboardData,
  fetchPlayerProfile,
  fetchGameHistory,
  fetchAllPlayers,
  fetchPlayerGameCounts,
  type GameHistoryData,
} from "./supabase/queries";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://mj-skill-rating.vercel.app";
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === "true"; // Feature flag for Supabase

export interface Player {
  id: string;
  name: string;
  rating: number;
  mu: number;
  sigma: number;
  games: number;
  lastGameDate: string;
  totalPlusMinus: number;
  averagePlusMinus: number;
  bestGame: number;
  worstGame: number;
  ratingChange?: number; // Rating change since last game
  ratingHistory?: number[]; // Array of historical ratings for sparkline
}

export interface LeaderboardData {
  players: Player[];
  totalGames: number;
  lastUpdated: string;
  seasonName: string;
}

export interface GameResult {
  id: string;
  date: string;
  players: Array<{
    name: string;
    placement: number;
    score: number;
    plusMinus: number;
    ratingDelta: number;
  }>;
}

// Leaderboard queries
export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<LeaderboardData> => {
      if (USE_SUPABASE) {
        return fetchLeaderboardData();
      }
      const response = await fetch(`${API_BASE_URL}/leaderboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    networkMode: "offlineFirst",
  });
}

// Player profile queries
export function usePlayerProfile(playerId: string) {
  return useQuery({
    queryKey: ["player", playerId],
    queryFn: async (): Promise<Player> => {
      if (USE_SUPABASE) {
        return fetchPlayerProfile(playerId);
      }
      const response = await fetch(`${API_BASE_URL}/players/${playerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch player profile");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!playerId,
  });
}

// Player game history
export function usePlayerGames(playerId: string, limit: number = 5) {
  return useQuery({
    queryKey: ["player-games", playerId, limit],
    queryFn: async () => {
      const url = `${API_BASE_URL}/players/${playerId}/games?limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch player games");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!playerId,
  });
}

// Game history queries
export function useGameHistory(playerId?: string, offset = 0, limit = 10) {
  return useQuery({
    queryKey: ["games", playerId, offset, limit],
    queryFn: async (): Promise<GameHistoryData> => {
      if (USE_SUPABASE) {
        return fetchGameHistory({ playerId, offset, limit });
      }

      // Fallback to API endpoint
      const url = new URL(`${API_BASE_URL}/games`);
      if (limit) {
        url.searchParams.set("limit", limit.toString());
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch game history");
      }
      const data = await response.json();

      // Transform to match GameHistoryData interface
      return {
        games: data.games || [],
        totalGames: data.totalGames || 0,
        hasMore: false,
        showingAll: false,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Query for all players (for filter dropdown)
export function useAllPlayers() {
  return useQuery({
    queryKey: ["players", "all"],
    queryFn: async () => {
      if (USE_SUPABASE) {
        return fetchAllPlayers();
      }

      // Fallback - extract unique players from leaderboard
      const leaderboard = await fetchLeaderboardData();
      return leaderboard.players.map(p => ({ id: p.id, name: p.name }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });
}

// Query for player game counts
export function usePlayerGameCounts() {
  return useQuery({
    queryKey: ["players", "gameCounts"],
    queryFn: async () => {
      if (USE_SUPABASE) {
        return fetchPlayerGameCounts();
      }

      // Fallback - use data from leaderboard
      const leaderboard = await fetchLeaderboardData();
      const counts: Record<string, number> = {};
      leaderboard.players.forEach(p => {
        counts[p.id] = p.games;
      });
      return counts;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Configuration-based rating queries
export function createConfigHash(config: RatingConfiguration): string {
  return hash(config).substring(0, 12); // 12-char hash for readability
}

export function useConfigurationResults(config: RatingConfiguration) {
  const configHash = createConfigHash(config);

  return useQuery({
    queryKey: ["config-results", configHash],
    queryFn: async (): Promise<LeaderboardData> => {
      const response = await fetch(`${API_BASE_URL}/ratings/configuration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config_hash: configHash,
          configuration: config,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate configuration results");
      }
      return response.json();
    },
    staleTime: Infinity, // Configuration results never stale (hash-based)
    gcTime: 24 * 60 * 60 * 1000, // Keep for 24 hours
    enabled: !!config,
  });
}

// Statistics queries
export function useSeasonStats() {
  return useQuery({
    queryKey: ["season-stats"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/stats/season`);
      if (!response.ok) {
        throw new Error("Failed to fetch season statistics");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
