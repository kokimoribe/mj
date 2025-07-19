'use client'

import { useLeaderboard } from '@/lib/queries'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { LeaderboardHeader } from './LeaderboardHeader'
import { RatingCard } from './RatingCard'
import { toast } from "sonner"
import { useEffect } from 'react'

export function LeaderboardView() {
  const { data, isLoading, error, refetch, isRefetching } = useLeaderboard()

  useEffect(() => {
    console.log('LeaderboardView State:', {
      isLoading,
      error: error?.message,
      hasData: !!data,
      data
    })
  }, [data, isLoading, error])

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.success("Leaderboard updated!")
    } catch {
      toast.error("Failed to refresh leaderboard")
    }
  }

  const handlePlayerTap = (playerId: string, playerName: string) => {
    // TODO: Navigate to player profile
    toast.info(`Opening profile for ${playerName}`)
  }

  if (isLoading) {
    return <LeaderboardSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load leaderboard: {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="w-full">
          Try Again
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <Alert>
        <AlertDescription>
          No leaderboard data available
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <LeaderboardHeader
        seasonName={data.seasonName}
        totalGames={data.totalGames}
        totalPlayers={data.players.length}
        lastUpdated={data.lastUpdated}
        onRefresh={handleRefresh}
        isRefreshing={isRefetching}
      />

      <div className="space-y-3">
        {data.players.map((player, index) => (
          <RatingCard
            key={player.id}
            player={player}
            rank={index + 1}
            onTap={() => handlePlayerTap(player.id, player.name)}
          />
        ))}
      </div>
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>

      {/* Cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}