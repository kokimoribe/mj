'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { Trophy, TrendingUp, TrendingDown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerGame {
  id: string
  date: string
  placement: number
  score: number
  plusMinus: number
  ratingBefore: number
  ratingAfter: number
  ratingChange: number
  opponents: Array<{
    name: string
    placement: number
    score: number
  }>
}

interface PlayerGamesListProps {
  playerId: string
  initialGames: PlayerGame[]
}

export function PlayerGamesList({ playerId, initialGames }: PlayerGamesListProps) {
  const [games, setGames] = useState(initialGames)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialGames.length >= 5)

  const loadMore = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://mj-skill-rating.vercel.app'}/players/${playerId}/games?limit=10&offset=${games.length}`
      )
      if (response.ok) {
        const newGames = await response.json()
        setGames([...games, ...newGames])
        setHasMore(newGames.length >= 10)
      }
    } catch (error) {
      console.error('Failed to load more games:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPlacementEmoji = (placement: number) => {
    switch (placement) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '4️⃣'
    }
  }

  const getPlacementText = (placement: number) => {
    switch (placement) {
      case 1: return '1st Place'
      case 2: return '2nd Place'
      case 3: return '3rd Place'
      default: return '4th Place'
    }
  }

  if (games.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No games played yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {games.map((game) => (
        <Card key={game.id} data-testid={`player-game-${game.id}`}>
          <CardContent className="p-4">
            <div className="space-y-2">
              {/* Date and Placement */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(game.date), 'MMM d, yyyy • h:mm a')}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getPlacementEmoji(game.placement)}</span>
                    <span className="font-medium">{getPlacementText(game.placement)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-mono text-sm">
                    {game.ratingBefore.toFixed(1)} → {game.ratingAfter.toFixed(1)}
                  </p>
                  <p className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    game.ratingChange >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {game.ratingChange >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {game.ratingChange >= 0 ? '↑' : '↓'}{Math.abs(game.ratingChange).toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Score Information */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                  <p className="font-mono">{game.score.toLocaleString()} pts</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plus/Minus</p>
                  <p className={cn(
                    "font-mono font-semibold",
                    game.plusMinus >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {game.plusMinus >= 0 ? '+' : ''}{game.plusMinus.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Opponents */}
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">
                  <Users className="h-3 w-3 inline mr-1" />
                  vs. {game.opponents.map(o => o.name).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={loadMore}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Load More Games'}
        </Button>
      )}
    </div>
  )
}

export function PlayerGamesListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  )
}