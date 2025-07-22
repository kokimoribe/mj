import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle } from "lucide-react";
import { TEST_IDS } from "@/lib/test-ids";

interface LeaderboardHeaderProps {
  seasonName: string;
  totalGames: number;
  totalPlayers: number;
  lastUpdated: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  "data-testid"?: string;
}

export function LeaderboardHeader({
  seasonName,
  totalGames,
  totalPlayers,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  "data-testid": dataTestId,
}: LeaderboardHeaderProps) {
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours === 1) return "1h ago";
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const isStaleData = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    return diffHours > 24;
  };

  return (
    <div className="space-y-3">
      {isStaleData(lastUpdated) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Data is more than 24 hours old. Refresh to get the latest updates.
          </AlertDescription>
        </Alert>
      )}
      <Card data-testid={dataTestId || TEST_IDS.LEADERBOARD_HEADER}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">
              🏆 {seasonName} Leaderboard
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRefresh}
              disabled={isRefreshing}
              data-testid={TEST_IDS.REFRESH_BUTTON}
              aria-label="Refresh leaderboard"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <span>{totalGames} games</span>
            <span>•</span>
            <span>{totalPlayers} players</span>
            <span>•</span>
            <span>Updated {formatLastUpdated(lastUpdated)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
