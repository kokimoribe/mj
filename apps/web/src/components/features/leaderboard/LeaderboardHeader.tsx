import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Info } from "lucide-react"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

interface LeaderboardHeaderProps {
  seasonName: string
  totalGames: number
  totalPlayers: number
  lastUpdated: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function LeaderboardHeader({
  seasonName,
  totalGames,
  totalPlayers,
  lastUpdated,
  onRefresh,
  isRefreshing = false
}: LeaderboardHeaderProps) {
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Updated just now'
    if (diffHours === 1) return 'Updated 1h ago'
    return `Updated ${diffHours}h ago`
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              🏆 {seasonName} Leaderboard
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <span>📊</span>
              <span>{totalGames} games</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>👥</span>
              <span>{totalPlayers} players</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>⏰</span>
              <span>{formatLastUpdated(lastUpdated)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>💡 Tap players for detailed rating info</strong>
          <br />
          <span className="text-sm">📊 Ratings: Conservative estimate (μ-2σ) • Activity: 🟢 Active (&lt;10 days) 🟡 Idle (10-28 days) 🔴 Inactive (&gt;28 days)</span>
        </AlertDescription>
      </Alert>
    </div>
  )
}