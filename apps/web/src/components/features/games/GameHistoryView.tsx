'use client'

import { useState } from 'react'
import { useGameHistory } from '@/lib/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import { History, Calendar, Users, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function GameHistoryView() {
  const router = useRouter()
  const [limit, setLimit] = useState(20)
  const { data, isLoading, error } = useGameHistory(limit)

  if (isLoading) {
    return <GameHistorySkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load game history
        </AlertDescription>
      </Alert>
    )
  }

  const games = data?.games || []

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No games recorded yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Games
            </CardTitle>
            <Button 
              onClick={() => router.push('/games/new')}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Game
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {games.length} most recent games
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLimit(limit + 20)}
              disabled={games.length < limit}
            >
              Load More
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game List */}
      <div className="space-y-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}

interface GameCardProps {
  game: {
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
}

function GameCard({ game }: GameCardProps) {
  const getPlacementBadge = (placement: number) => {
    switch (placement) {
      case 1: return { text: '1st', color: 'bg-yellow-500 text-white' }
      case 2: return { text: '2nd', color: 'bg-gray-400 text-white' }
      case 3: return { text: '3rd', color: 'bg-orange-600 text-white' }
      case 4: return { text: '4th', color: 'bg-red-600 text-white' }
      default: return { text: placement.toString(), color: 'bg-muted text-muted-foreground' }
    }
  }


  return (
    <Card>
      <CardContent className="p-4">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(game.date), 'MMM d, yyyy')}</span>
            <span className="text-xs">
              ({formatDistanceToNow(new Date(game.date), { addSuffix: true })})
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {game.players.length}P
          </Badge>
        </div>

        {/* Player Results */}
        <div className="space-y-2">
          {game.players.map((player) => (
            <div 
              key={`${game.id}-${player.name}`}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs font-bold min-w-[40px] justify-center border-0", getPlacementBadge(player.placement).color)}>
                  {getPlacementBadge(player.placement).text}
                </Badge>
                <span className="font-medium">{player.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {player.score.toLocaleString()}
                </span>
                <Badge 
                  variant={player.plusMinus >= 0 ? "default" : "destructive"}
                  className="text-xs min-w-[60px] justify-center"
                >
                  {player.plusMinus >= 0 ? '+' : ''}{player.plusMinus.toLocaleString()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function GameHistorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  )
}