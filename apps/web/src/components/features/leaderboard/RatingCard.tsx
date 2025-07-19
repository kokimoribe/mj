import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityIndicator } from "./ActivityIndicator"
import type { Player } from "@/lib/queries"

interface RatingCardProps {
  player: Player
  rank: number
  onTap?: () => void
}

export function RatingCard({ player, rank, onTap }: RatingCardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈' 
      case 3: return '🥉'
      default: return rank.toString()
    }
  }

  const formatRatingDelta = (delta: number) => {
    if (delta > 0) return `+${delta.toFixed(1)}`
    return delta.toFixed(1)
  }

  // Calculate rating delta (mock for now - will be from API)
  const ratingDelta = Math.random() * 4 - 2 // -2 to +2 range

  return (
    <Card 
      className="cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted"
      onClick={onTap}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Rank indicator */}
            <div className="flex h-8 w-8 items-center justify-center text-sm font-semibold">
              {rank <= 3 ? (
                <span className="text-lg">{getRankIcon(rank)}</span>
              ) : (
                <Badge variant="outline">{rank}</Badge>
              )}
            </div>

            {/* Player info */}
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-semibold">{player.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {player.games} games
                </p>
              </div>
              
              {/* Activity indicator */}
              <ActivityIndicator 
                lastGameDate={player.lastGameDate} 
                className="ml-2"
              />
            </div>
          </div>

          {/* Rating display */}
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold font-mono">
                {player.rating.toFixed(1)}
              </span>
              <Badge 
                variant={ratingDelta >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {formatRatingDelta(ratingDelta)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              conservative rating
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}