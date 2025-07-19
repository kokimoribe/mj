'use client'

import { usePlayerProfile } from '@/lib/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, TrendingUp, Activity, Trophy, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface PlayerProfileViewProps {
  playerId: string
}

export function PlayerProfileView({ playerId }: PlayerProfileViewProps) {
  const router = useRouter()
  const { data: player, isLoading, error } = usePlayerProfile(playerId)

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

  const winRate = 0.35 // Placeholder - will be calculated from game history
  const avgPlacement = 2.4 // Placeholder
  const consistency = 0.72 // Placeholder - sigma-based

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Player Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{player.name}</CardTitle>
              <CardDescription>
                Last played {formatDistanceToNow(new Date(player.lastGameDate), { addSuffix: true })}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              #{player.rating.toFixed(2)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Games Played</p>
              <p className="text-2xl font-bold">{player.games}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">{(winRate * 100).toFixed(1)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg Placement</p>
              <p className="text-2xl font-bold">{avgPlacement.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Consistency</p>
              <p className="text-2xl font-bold">{(consistency * 100).toFixed(0)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Rating Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Skill (μ)</span>
                  <span className="font-medium">{player.mu.toFixed(2)}</span>
                </div>
                <Progress value={(player.mu / 50) * 100} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uncertainty (σ)</span>
                  <span className="font-medium">{player.sigma.toFixed(2)}</span>
                </div>
                <Progress value={100 - (player.sigma / 10) * 100} />
              </div>
              <p className="text-xs text-muted-foreground">
                Lower uncertainty means more consistent performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Score Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average +/-</span>
                  <span className={`font-medium ${player.averagePlusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {player.averagePlusMinus >= 0 ? '+' : ''}{player.averagePlusMinus.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total +/-</span>
                  <span className={`font-medium ${player.totalPlusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {player.totalPlusMinus >= 0 ? '+' : ''}{player.totalPlusMinus.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Rating trend chart coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Personal Records
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Best Game</span>
                <span className="font-medium text-green-600">
                  +{player.bestGame || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Worst Game</span>
                <span className="font-medium text-red-600">
                  {player.worstGame || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Longest Win Streak</span>
                <span className="font-medium">N/A</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PlayerProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}