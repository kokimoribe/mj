import { useQuery } from "@tanstack/react-query";
import {
  fetchLeaderboardData,
  fetchPlayerProfile,
  fetchGameHistory,
  fetchAllPlayers,
  fetchPlayerGameCounts,
} from "./supabase/queries";
import { config } from "@/config";

// Re-export types from supabase queries for consistency
export type {
  Player,
  LeaderboardData,
  Game,
  GameResult,
  GameHistoryData,
} from "./supabase/queries";

// Leaderboard queries - now using Supabase exclusively
export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboardData,
    staleTime: config.query.staleTime,
    gcTime: config.query.gcTime,
    retry: config.query.retryAttempts,
    networkMode: "offlineFirst",
  });
}

// Player profile queries
export function usePlayerProfile(playerId: string) {
  return useQuery({
    queryKey: ["player", playerId],
    queryFn: () => fetchPlayerProfile(playerId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!playerId,
  });
}

// Game history queries
export function useGameHistory(playerId?: string, offset = 0, limit = 10) {
  return useQuery({
    queryKey: ["games", playerId, offset, limit],
    queryFn: () => fetchGameHistory({ playerId, offset, limit }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Query for all players (for filter dropdown)
export function useAllPlayers() {
  return useQuery({
    queryKey: ["players", "all"],
    queryFn: fetchAllPlayers,
    staleTime: 10 * 60 * 1000, // 10 minutes for less frequently changing data
    gcTime: config.query.gcTime,
  });
}

// Query for player game counts
export function usePlayerGameCounts() {
  return useQuery({
    queryKey: ["players", "gameCounts"],
    queryFn: fetchPlayerGameCounts,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Query for specific player's games
export function usePlayerGames(playerId: string, limit = 10) {
  return useQuery({
    queryKey: ["player", playerId, "games", limit],
    queryFn: async () => {
      const data = await fetchGameHistory({ playerId, offset: 0, limit });
      return data.games
        .map(game => {
          const playerResult = game.results.find(r => r.playerId === playerId);
          if (!playerResult) return null;

          return {
            id: game.id,
            date: game.date,
            placement: playerResult.placement,
            score: playerResult.rawScore,
            ratingBefore: playerResult.ratingBefore,
            ratingAfter: playerResult.ratingAfter,
            ratingChange: playerResult.ratingChange,
            opponents: game.results
              .filter(r => r.playerId !== playerId)
              .map(r => ({
                name: r.playerName,
                placement: r.placement,
                score: r.rawScore,
              })),
          };
          // Note: scoreAdjustment (uma/oka) intentionally excluded from frontend
        })
        .filter((game): game is NonNullable<typeof game> => game !== null);
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
