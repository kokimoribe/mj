'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityIndicator } from "./ActivityIndicator"
import { useRouter } from 'next/navigation'
import type { Player } from "@/lib/queries"

interface RatingCardProps {
  player: Player
  rank: number
  onTap?: () => void
}

export function RatingCard({ player, rank, onTap }: RatingCardProps) {
  const router = useRouter()
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '1'
      case 2: return '2' 
      case 3: return '3'
      default: return rank.toString()
    }
  }


  const handleClick = () => {
    router.push(`/player/${player.id}`)
    onTap?.()
  }

  return (
    <Card 
      className="cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Rank indicator */}
            <div className="flex h-10 w-10 items-center justify-center">
              {rank === 1 && (
                <Badge className="h-10 w-10 rounded-full bg-yellow-500 text-white border-0 text-lg font-bold">
                  1
                </Badge>
              )}
              {rank === 2 && (
                <Badge className="h-10 w-10 rounded-full bg-gray-400 text-white border-0 text-lg font-bold">
                  2
                </Badge>
              )}
              {rank === 3 && (
                <Badge className="h-10 w-10 rounded-full bg-orange-600 text-white border-0 text-lg font-bold">
                  3
                </Badge>
              )}
              {rank > 3 && (
                <Badge variant="outline" className="h-10 w-10 rounded-full text-base">
                  {rank}
                </Badge>
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
            <div className="flex flex-col items-end">
              <span className="text-xl font-bold font-mono tabular-nums">
                {player.rating.toFixed(1)}
              </span>
              {/* Plus/Minus display */}
              <Badge 
                variant={player.averagePlusMinus >= 0 ? "default" : "destructive"}
                className="text-xs mt-1"
              >
                {player.averagePlusMinus >= 0 ? '+' : ''}{player.averagePlusMinus.toFixed(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}