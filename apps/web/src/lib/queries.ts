import { useQuery } from '@tanstack/react-query'
import { hash } from 'ohash'
import type { RatingConfiguration } from '@/stores/configStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mj-skill-rating.vercel.app'
const USE_LOCAL_API = false // Use Python API for now

export interface Player {
  id: string
  name: string
  rating: number
  mu: number
  sigma: number
  games: number
  lastGameDate: string
  totalPlusMinus: number
  averagePlusMinus: number
  bestGame: number
  worstGame: number
  ratingChange?: number // Rating change since last game
}

export interface LeaderboardData {
  players: Player[]
  totalGames: number
  lastUpdated: string
  seasonName: string
}

export interface GameResult {
  id: string
  date: string
  players: Array<{
    name: string
    placement: number
    score: number
    plusMinus: number
    ratingDelta: number
  }>
}

// Leaderboard queries
export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async (): Promise<LeaderboardData> => {
      const response = await fetch(`${API_BASE_URL}/leaderboard`)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    networkMode: 'offlineFirst',
  })
}

// Player profile queries
export function usePlayerProfile(playerId: string) {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: async (): Promise<Player> => {
      const url = USE_LOCAL_API ? `/api/players/${playerId}` : `${API_BASE_URL}/players/${playerId}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch player profile')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!playerId,
  })
}

// Player game history
export function usePlayerGames(playerId: string, limit: number = 5) {
  return useQuery({
    queryKey: ['player-games', playerId, limit],
    queryFn: async () => {
      const url = USE_LOCAL_API 
        ? `/api/players/${playerId}/games?limit=${limit}`
        : `${API_BASE_URL}/players/${playerId}/games?limit=${limit}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch player games')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!playerId,
  })
}

// Game history queries
export function useGameHistory(limit?: number) {
  return useQuery({
    queryKey: ['games', limit],
    queryFn: async (): Promise<{ games: GameResult[] }> => {
      const url = new URL(`${API_BASE_URL}/games`)
      if (limit) {
        url.searchParams.set('limit', limit.toString())
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch game history')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// Configuration-based rating queries
export function createConfigHash(config: RatingConfiguration): string {
  return hash(config).substring(0, 12) // 12-char hash for readability
}

export function useConfigurationResults(config: RatingConfiguration) {
  const configHash = createConfigHash(config)
  
  return useQuery({
    queryKey: ['config-results', configHash],
    queryFn: async (): Promise<LeaderboardData> => {
      const response = await fetch(`${API_BASE_URL}/ratings/configuration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config_hash: configHash,
          configuration: config,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to calculate configuration results')
      }
      return response.json()
    },
    staleTime: Infinity, // Configuration results never stale (hash-based)
    gcTime: 24 * 60 * 60 * 1000, // Keep for 24 hours
    enabled: !!config,
  })
}

// Statistics queries
export function useSeasonStats() {
  return useQuery({
    queryKey: ['season-stats'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/stats/season`)
      if (!response.ok) {
        throw new Error('Failed to fetch season statistics')
      }
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}