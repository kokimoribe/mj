'use client'

import { useState } from 'react'
import { usePlayerProfile } from '@/lib/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  ChartLine,
  Calculator,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface PlayerProfileViewProps {
  playerId: string
}

export function PlayerProfileView({ playerId }: PlayerProfileViewProps) {
  const router = useRouter()
  const { data: player, isLoading, error } = usePlayerProfile(playerId)
  const [showAdvancedStats, setShowAdvancedStats] = useState(false)

  if (isLoading) {
    return <PlayerProfileSkeleton />
  }

  if (error || !player) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load player profile
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Mock calculations (would come from API)
  const winRate = 35
  const avgPlacement = 2.4
  const recentTrend = player.ratingChange || 4.2
  const seasonChange = 8.1

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        size="sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Player Header - Simplified */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{player.name}</CardTitle>
              <CardDescription>
                Rank #{player.rating.toFixed(1)} • {player.games} games
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Rating Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="h-5 w-5" />
            Rating Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple trend visualization placeholder */}
            <div className="h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">
              Rating chart will go here
            </div>
            
            {/* Trend stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">30-day change</p>
                <p className={cn(
                  "text-lg font-semibold flex items-center gap-1",
                  recentTrend >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {recentTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(recentTrend).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Season total</p>
                <p className={cn(
                  "text-lg font-semibold flex items-center gap-1",
                  seasonChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {seasonChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(seasonChange).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-xl font-semibold">{winRate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Placement</p>
              <p className="text-xl font-semibold">{avgPlacement.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Played</p>
              <p className="text-sm font-medium">
                {formatDistanceToNow(new Date(player.lastGameDate), { addSuffix: true })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Game</p>
              <p className="text-xl font-semibold text-green-600">
                +{player.bestGame || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Placeholder for recent games */}
            <div className="text-sm text-muted-foreground">
              Recent games will be displayed here
            </div>
            <Button variant="outline" className="w-full">
              View All Games →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Stats - Collapsed by default */}
      <Card>
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setShowAdvancedStats(!showAdvancedStats)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Advanced Stats
            </div>
            {showAdvancedStats ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CardTitle>
          <CardDescription>
            For those curious about the rating mathematics
          </CardDescription>
        </CardHeader>
        {showAdvancedStats && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Skill (μ)</p>
                <p className="text-lg font-mono">{player.mu.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Your estimated skill level</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Uncertainty (σ)</p>
                <p className="text-lg font-mono">{player.sigma.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Lower = more consistent</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">How Your Rating Works</p>
              <p className="text-sm text-muted-foreground">
                Your display rating ({player.rating.toFixed(1)}) = μ ({player.mu.toFixed(1)}) - 2σ ({(2 * player.sigma).toFixed(1)})
              </p>
              <p className="text-sm text-muted-foreground">
                This conservative estimate ensures we&apos;re confident in your skill level.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Season Performance</p>
              <div className="flex items-center justify-between text-sm">
                <span>Total Points</span>
                <span className={cn(
                  "font-medium",
                  player.totalPlusMinus >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {player.totalPlusMinus >= 0 ? '+' : ''}{player.totalPlusMinus.toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Average per Game</span>
                <span className={cn(
                  "font-medium",
                  player.averagePlusMinus >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {player.averagePlusMinus >= 0 ? '+' : ''}{player.averagePlusMinus.toFixed(0)} pts
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function PlayerProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}