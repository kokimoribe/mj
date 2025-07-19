'use client'

import { useSeasonStats } from '@/lib/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity,
  Target,
  Award
} from 'lucide-react'

export function StatsView() {
  const { data: stats, isLoading, error } = useSeasonStats()

  if (isLoading) {
    return <StatsSkeleton />
  }

  if (error || !stats) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load season statistics
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Games"
          value={stats.totalGames}
          icon={<Activity className="h-4 w-4" />}
          description="This season"
        />
        <StatCard
          title="Active Players"
          value={stats.totalPlayers}
          icon={<Users className="h-4 w-4" />}
          description="Participating"
        />
        <StatCard
          title="Avg Games/Player"
          value={stats.averageGamesPerPlayer}
          icon={<Target className="h-4 w-4" />}
          description="Per player"
        />
        <StatCard
          title="Avg Rating"
          value={stats.averageRating.toFixed(1)}
          icon={<BarChart3 className="h-4 w-4" />}
          description="League average"
        />
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Rating Distribution
          </CardTitle>
          <CardDescription>
            Current season rating spread
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Highest Rating</span>
              <span className="font-medium text-green-600">
                {stats.highestRating.toFixed(2)}
              </span>
            </div>
            <Progress 
              value={(stats.highestRating / 50) * 100} 
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Rating</span>
              <span className="font-medium">
                {stats.averageRating.toFixed(2)}
              </span>
            </div>
            <Progress 
              value={(stats.averageRating / 50) * 100} 
              className="h-2"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Lowest Rating</span>
              <span className="font-medium text-red-600">
                {stats.lowestRating.toFixed(2)}
              </span>
            </div>
            <Progress 
              value={(stats.lowestRating / 50) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notable Players */}
      <div className="grid md:grid-cols-3 gap-4">
        {stats.mostActivePlayer && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Most Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{stats.mostActivePlayer.name}</p>
              <p className="text-sm text-muted-foreground">
                {stats.mostActivePlayer.games} games played
              </p>
            </CardContent>
          </Card>
        )}

        {stats.biggestWinner && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Biggest Winner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{stats.biggestWinner.name}</p>
              <p className="text-sm text-green-600 font-medium">
                +{stats.biggestWinner.plusMinus.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}

        {stats.biggestLoser && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Biggest Loser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{stats.biggestLoser.name}</p>
              <p className="text-sm text-red-600 font-medium">
                {stats.biggestLoser.plusMinus.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Season Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Season Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Points Exchanged</p>
              <p className="text-2xl font-bold">
                {Math.abs(stats.totalPlusMinus).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Rating Spread</p>
              <p className="text-2xl font-bold">
                {(stats.highestRating - stats.lowestRating).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  description: string
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}