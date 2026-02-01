import { useQuery } from "@tanstack/react-query";
import { useConfigStore } from "@/stores/configStore";
import { config } from "@/config";
import {
  calculatePlayerStatistics,
  type PlayerGameForStats,
  type PlayerHandEventForStats,
  type PlayerStatisticsResult,
} from "@/features/players/playerStatistics";

export interface PlayerStatisticsResponse {
  configHash: string;
  seasonName?: string;
  hasHandData: boolean;
  games: PlayerGameForStats[];
  handEvents: PlayerHandEventForStats[];
}

export interface UsePlayerStatisticsResult {
  hasHandData: boolean;
  games: PlayerGameForStats[];
  stats: PlayerStatisticsResult;
}

async function fetchPlayerStatistics(params: {
  playerId: string;
  configHash: string;
}): Promise<PlayerStatisticsResponse> {
  const res = await fetch(
    `/api/players/${encodeURIComponent(params.playerId)}/hand-events?configHash=${encodeURIComponent(
      params.configHash
    )}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch player statistics: HTTP ${res.status}`);
  }
  return (await res.json()) as PlayerStatisticsResponse;
}

export function usePlayerStatistics(playerId: string) {
  const activeConfig = useConfigStore(state => state.activeConfig);
  const configHash = activeConfig?.hash || config.season.hash;

  return useQuery<UsePlayerStatisticsResult>({
    queryKey: ["player", playerId, "statistics", configHash],
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    queryFn: async () => {
      const data = await fetchPlayerStatistics({ playerId, configHash });
      const stats = calculatePlayerStatistics({
        games: data.games,
        handEvents: data.handEvents,
      });
      return { hasHandData: data.hasHandData, games: data.games, stats };
    },
  });
}
