"use client";

import { useMemo, memo, useState } from "react";
import {
  usePlayerProfile,
  usePlayerGames,
  useLeaderboard,
} from "@/lib/queries";
import { useConfigParams } from "@/hooks/useConfigParams";
import { usePlayerStatistics } from "@/hooks/usePlayerStatistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RatingChart } from "./RatingChart";
import { PlayerGamesList } from "./PlayerGamesList";
import {
  safeFormatNumber,
  validatePlayerData,
} from "@/lib/utils/data-validation";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";
import { AchievementIcon } from "@/components/achievements/AchievementIcon";
import { StatisticsNotAvailable } from "./StatisticsNotAvailable";
import { StatsCollapsibleSection } from "./StatsCollapsibleSection";

/** Tooltip copy for each performance stat */
const STAT_TOOLTIPS: Record<string, string> = {
  "Average Placement":
    "Average finishing position (1st–4th) across all games. Lower is better.",
  "Last Played": "Time since the player's most recent game.",
  "Total games": "Number of games played in the selected season or config.",
  "Average score":
    "Mean final score per game (starting score is typically 25,000).",
  "Busted games":
    "Percentage of games where the player finished with a negative score.",
  "Longest 1st-place streak":
    "Most consecutive games won (1st place) in a row.",
  "Comeback rate":
    "Percentage of games won (1st) where the player's running score was ever below 25,000.",
  "Perfect games (0 deal-ins)": "Number of games with zero deal-ins.",
  "Current streak":
    "Current run of consecutive 1st places (positive) or non-1st places (negative), from the most recent game.",
  "Longest losing streak": "Longest run of games without a 1st place.",
  "Score consistency (σ)":
    "Standard deviation of final scores. Lower means more consistent results.",
  "Highest final score":
    "Best single-game final score. Link goes to that game.",
  "Lowest final score":
    "Worst single-game final score. Link goes to that game.",
  "Comeback factor":
    "Among games where the player went negative, average points recovered from their lowest point to final score.",
  "1st": "Percentage of games finished in 1st place.",
  "2nd": "Percentage of games finished in 2nd place.",
  "3rd": "Percentage of games finished in 3rd place.",
  "4th": "Percentage of games finished in 4th place.",
  "Win rate": "Percentage of hands won (tsumo or ron).",
  "Tsumo rate":
    "Of all wins, the percentage that were tsumo (self-draw) vs ron.",
  "Deal-in rate":
    "Percentage of hands where the player dealt into an opponent's ron.",
  "Riichi rate": "Percentage of hands where the player declared riichi.",
  "Win w/ riichi":
    "Of all wins, the percentage where the player had declared riichi.",
  "Win w/o riichi":
    "Of all wins, the percentage where the player had not declared riichi.",
  "Win rate as dealer": "Win rate when the player was the dealer (oya).",
  "Win rate as non-dealer": "Win rate when the player was not the dealer.",
  "Longest hand win streak":
    "Longest run of consecutive hand wins within a single game.",
  "Avg han on wins": "Average han value on winning hands.",
  "Avg fu on wins": "Average fu value on winning hands.",
  "Highest han achieved":
    "Maximum han in a single winning hand. Link goes to that game.",
  "Riichi efficiency (win rate when riichi)":
    "Win rate on hands where the player declared riichi (did they win that hand?).",
  "Win rate when not riichi":
    "Win rate on hands where the player did not declare riichi.",
  "Riichi sticks per game":
    "Average number of riichi sticks collected per game (when winning).",
  "Dealer retention rate":
    "Percentage of dealer hands where the dealer won (and retained the seat).",
  "Avg points per tsumo": "Average points won per tsumo win.",
  "Avg points per ron": "Average points won per ron win.",
  "Deal-in rate (East round)": "Deal-in rate during the East round only.",
  "Deal-in rate (South round)": "Deal-in rate during the South round only.",
  "Win rate (East round)": "Win rate during the East round.",
  "Win rate (South round)": "Win rate during the South round.",
  "Avg win value": "Average points won per winning hand.",
  "Median win value": "Median points won per winning hand.",
  "Avg deal-in value": "Average points lost per deal-in.",
  "Median deal-in value": "Median points lost per deal-in.",
  "Biggest winning hand":
    "Highest single-hand point value won. Link goes to that game.",
  "Biggest losing hand":
    "Highest single-hand point value lost (deal-in). Link goes to that game.",
  "Lucky number (best seat)":
    "Seat (East/South/West/North) with the highest hand win rate for this player.",
  "Unlucky number (worst seat)":
    "Seat with the lowest hand win rate for this player.",
  "Clutch factor (S4 win rate)":
    "Win rate specifically in South 4 (last round of hanchan).",
  "Early game dominance": "Win rate in the first two hands of the game.",
  "Comeback specialist (East seat)":
    "Hand win rate when the player was in the East seat (dealer at game start).",
};

function StatWithTooltip({
  label,
  tooltipKey,
  testId,
  children,
}: {
  label: string;
  tooltipKey: string;
  testId?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const tooltip = STAT_TOOLTIPS[tooltipKey] ?? tooltipKey;
  return (
    <p
      className="inline-flex flex-wrap items-baseline gap-1 text-sm"
      data-testid={testId}
    >
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground -mb-0.5 inline-flex shrink-0 rounded p-0.5"
            aria-label={`Info about ${label}`}
            onClick={() => setOpen(prev => !prev)}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[280px] min-w-[180px] text-left whitespace-normal"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
      <span>{label}:</span> <span className="font-medium">{children}</span>
    </p>
  );
}

interface PlayerGame {
  id: string;
  date: string;
  placement: number;
  score: number;
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number | null;
  opponents: Array<{
    name: string;
    placement: number;
    score: number;
  }>;
  // Note: plusMinus (uma/oka) removed - it's an internal calculation detail
}

interface PlayerProfileViewProps {
  playerId: string;
}

export const PlayerProfileView = memo(function PlayerProfileView({
  playerId,
}: PlayerProfileViewProps) {
  const router = useRouter();
  useConfigParams(); // Read config from URL (handled by store)
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "14d" | "30d" | "all"
  >("7d");

  const { data: rawPlayer, isLoading, error } = usePlayerProfile(playerId);
  const player = rawPlayer ? validatePlayerData(rawPlayer) : null;
  const { data: gamesData, isLoading: gamesLoading } = usePlayerGames(
    playerId,
    100
  ); // Get all games for chart
  const { data: leaderboardData } = useLeaderboard();
  const {
    data: playerStatsData,
    isLoading: statsLoading,
    error: statsError,
  } = usePlayerStatistics(playerId);

  // Calculate player rank from leaderboard position
  const playerRank = useMemo(() => {
    if (!leaderboardData || !player) return null;

    // Sort players by rating (desc), then games (desc), then name (alphabetically)
    const sortedPlayers = [...leaderboardData.players].sort((a, b) => {
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      if (a.gamesPlayed !== b.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed;
      }
      return a.name.localeCompare(b.name);
    });

    const rankIndex = sortedPlayers.findIndex(p => p.id === player.id);
    return rankIndex >= 0 ? rankIndex + 1 : null;
  }, [leaderboardData, player]);

  // Use materialized rating history from database or build efficiently from games
  const { ratingHistory, periodDelta } = useMemo(() => {
    if (!gamesData || gamesData.length === 0 || !player) {
      return { ratingHistory: [], periodDelta: null };
    }

    // For now, always build from games since rating_history is not populated in database
    // TODO: When rating_history is populated, uncomment the code below
    /*
    if (
      player.ratingHistory &&
      Array.isArray(player.ratingHistory) &&
      player.ratingHistory.length > 0
    ) {
      // Use materialized history - convert to chart format
      const points = player.ratingHistory.map(
        (rating: number, index: number) => ({
          date: gamesData[index]?.date || new Date().toISOString(),
          rating,
          gameId: gamesData[index]?.id || `game-${index}`,
          change:
            index > 0 && player.ratingHistory
              ? rating - player.ratingHistory[index - 1]
              : 0,
        })
      );

      // Add current rating point
      points.push({
        date: new Date().toISOString(),
        rating: player.rating,
        gameId: "current",
        change: 0,
      });

      return { ratingHistory: points, periodDelta: null }; 
    }
    */

    // Fallback: build from games efficiently with data validation
    const chartPoints = gamesData
      .filter((game: PlayerGame) => {
        // Only include games with valid rating data
        return (
          game.ratingAfter !== null &&
          game.ratingAfter !== undefined &&
          isFinite(game.ratingAfter) &&
          !isNaN(game.ratingAfter) &&
          game.date
        );
      })
      .map((game: PlayerGame) => ({
        date: game.date,
        rating: game.ratingAfter,
        gameId: game.id,
        change:
          game.ratingChange !== null &&
          isFinite(game.ratingChange) &&
          !isNaN(game.ratingChange)
            ? game.ratingChange
            : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date ascending for chart

    // NOTE: We intentionally do not add the current rating as an artificial point
    // because it can cause misleading spikes when there's a gap between the last
    // game rating and the current rating (e.g., when only recent games are loaded).
    // The chart should only show actual game data points.

    // Uncomment below only if we're loading the FULL game history:
    // chartPoints.push({
    //   date: new Date().toISOString(),
    //   rating: player.rating,
    //   gameId: "current",
    //   change: 0,
    // });

    // Filter based on selected period and calculate delta
    let filteredHistory = chartPoints;
    let delta = null;

    if (selectedPeriod !== "all") {
      const cutoffDate = new Date();
      const days =
        selectedPeriod === "7d" ? 7 : selectedPeriod === "14d" ? 14 : 30;
      cutoffDate.setDate(cutoffDate.getDate() - days);

      filteredHistory = chartPoints.filter(
        point => new Date(point.date) >= cutoffDate
      );

      // Calculate delta for the period
      // Find the oldest game in the period to get the baseline rating
      const oldestGameInPeriod = gamesData.find(
        (game: PlayerGame) => new Date(game.date) >= cutoffDate
      );
      if (oldestGameInPeriod) {
        // Use rating_before of the oldest game as baseline
        delta = player.rating - oldestGameInPeriod.ratingBefore;
      }
    } else {
      // For "all", calculate delta from first game
      const firstGame = gamesData[0];
      if (firstGame) {
        // Use rating_before of the first game as baseline
        delta = player.rating - firstGame.ratingBefore;
      }
    }

    return { ratingHistory: filteredHistory, periodDelta: delta };
  }, [gamesData, player, selectedPeriod]);

  // Calculate statistics from game history
  const avgPlacement = useMemo(() => {
    if (!gamesData || gamesData.length === 0) return null;
    const placements = gamesData
      .map((g: PlayerGame) => g.placement)
      .filter((p: number) => p >= 1 && p <= 4);
    if (placements.length === 0) return null;
    const sum = placements.reduce((a: number, b: number) => a + b, 0);
    return sum / placements.length;
  }, [gamesData]);

  if (isLoading) {
    return <PlayerProfileSkeleton />;
  }

  if (error || !player) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>Failed to load player profile</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        size="sm"
        data-testid="back-button"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Player Header */}
      <div className="space-y-1" data-testid="player-header">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold" data-testid="player-name">
            {player.name}
          </h1>
          {player.achievements && player.achievements.length > 0 && (
            <div className="flex items-center gap-1">
              {player.achievements.map(achievement => (
                <AchievementIcon
                  key={
                    achievement.playerAchievementId ||
                    `${achievement.id}-${achievement.seasonName}`
                  }
                  achievement={achievement}
                  size="md"
                />
              ))}
            </div>
          )}
        </div>
        <h2 className="text-muted-foreground text-base">
          <span data-testid="player-rank">#{playerRank || "—"}</span> • Rating:{" "}
          <span data-testid="player-rating">
            {safeFormatNumber(player.rating, 1)}
          </span>{" "}
          • <span data-testid="total-games">{player.gamesPlayed} games</span>
        </h2>
      </div>

      {/* Rating Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            Rating Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Time range selector */}
            <div className="flex gap-1" data-testid="time-filter-buttons">
              <Button
                variant={selectedPeriod === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("7d")}
                aria-pressed={selectedPeriod === "7d"}
                className="flex-1"
                title="Last 7 days"
              >
                7 days
              </Button>
              <Button
                variant={selectedPeriod === "14d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("14d")}
                aria-pressed={selectedPeriod === "14d"}
                className="flex-1"
                title="Last 14 days"
              >
                14 days
              </Button>
              <Button
                variant={selectedPeriod === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("30d")}
                aria-pressed={selectedPeriod === "30d"}
                className="flex-1"
                title="Last 30 days"
              >
                30 days
              </Button>
              <Button
                variant={selectedPeriod === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("all")}
                aria-pressed={selectedPeriod === "all"}
                className="flex-1"
              >
                All
              </Button>
            </div>

            {/* Rating chart */}
            <div data-testid="rating-chart-container">
              {gamesLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <>
                  <RatingChart data={ratingHistory} />
                  {/* Date range indicator */}
                  {ratingHistory.length > 0 && (
                    <p className="text-muted-foreground mt-1 text-center text-xs">
                      {selectedPeriod === "all"
                        ? `Showing all ${ratingHistory.length} games`
                        : `Showing ${ratingHistory.length} games from the last ${
                            selectedPeriod === "7d"
                              ? "7 days"
                              : selectedPeriod === "14d"
                                ? "14 days"
                                : "30 days"
                          }`}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Trend stats */}
            <div className="flex justify-between text-sm">
              <div>Current: {safeFormatNumber(player.rating, 1)}</div>
              <div>
                Period Δ:{" "}
                {periodDelta !== null && isFinite(periodDelta) ? (
                  <>
                    {periodDelta >= 0 ? "↑" : "↓"}
                    {safeFormatNumber(Math.abs(periodDelta), 1)}
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card data-testid="performance-stats">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Performance Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="space-y-4" data-testid="performance-metrics">
              {statsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : statsError || !playerStatsData ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to load performance statistics
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-0">
                  <StatsCollapsibleSection
                    title="Game stats"
                    defaultOpen={true}
                    data-testid="stats-section-game"
                  >
                    <div className="space-y-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <StatWithTooltip
                          label="Average Placement"
                          tooltipKey="Average Placement"
                          testId="avg-placement"
                        >
                          {avgPlacement !== null && isFinite(avgPlacement)
                            ? safeFormatNumber(avgPlacement, 1)
                            : "—"}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Last Played"
                          tooltipKey="Last Played"
                          testId="last-played"
                        >
                          {player.lastPlayed
                            ? formatDistanceToNow(new Date(player.lastPlayed), {
                                addSuffix: true,
                              })
                            : "N/A"}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Total games"
                          tooltipKey="Total games"
                          testId="total-games-played"
                        >
                          {playerStatsData.stats.totals.gamesPlayed}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Average score"
                          tooltipKey="Average score"
                          testId="average-final-score"
                        >
                          {playerStatsData.stats.gameStats.averageFinalScore !==
                            null &&
                          isFinite(
                            playerStatsData.stats.gameStats.averageFinalScore
                          )
                            ? Math.round(
                                playerStatsData.stats.gameStats
                                  .averageFinalScore
                              ).toLocaleString()
                            : "—"}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Busted games"
                          tooltipKey="Busted games"
                          testId="busted-game-rate"
                        >
                          {playerStatsData.stats.gameStats.bustedGameRate !==
                            null &&
                          isFinite(
                            playerStatsData.stats.gameStats.bustedGameRate
                          )
                            ? `${safeFormatNumber(playerStatsData.stats.gameStats.bustedGameRate, 1)}%`
                            : "—"}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Longest 1st-place streak"
                          tooltipKey="Longest 1st-place streak"
                          testId="longest-game-win-streak"
                        >
                          {playerStatsData.stats.gameStats.longestGameWinStreak}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Comeback rate"
                          tooltipKey="Comeback rate"
                          testId="comeback-rate"
                        >
                          {playerStatsData.stats.gameStats.comebackRate !=
                            null &&
                          isFinite(playerStatsData.stats.gameStats.comebackRate)
                            ? `${safeFormatNumber(playerStatsData.stats.gameStats.comebackRate, 1)}%`
                            : "—"}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Perfect games (0 deal-ins)"
                          tooltipKey="Perfect games (0 deal-ins)"
                          testId="perfect-games"
                        >
                          {playerStatsData.stats.gameStats.perfectGames}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Current streak"
                          tooltipKey="Current streak"
                          testId="current-streak"
                        >
                          {playerStatsData.stats.gameStats.currentStreak > 0
                            ? `${playerStatsData.stats.gameStats.currentStreak} win(s)`
                            : playerStatsData.stats.gameStats.currentStreak < 0
                              ? `${Math.abs(playerStatsData.stats.gameStats.currentStreak)} non-win(s)`
                              : "—"}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Longest losing streak"
                          tooltipKey="Longest losing streak"
                          testId="longest-losing-streak"
                        >
                          {playerStatsData.stats.gameStats.longestLosingStreak}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Score consistency (σ)"
                          tooltipKey="Score consistency (σ)"
                          testId="score-consistency"
                        >
                          {playerStatsData.stats.gameStats.scoreConsistency !=
                            null &&
                          isFinite(
                            playerStatsData.stats.gameStats.scoreConsistency
                          )
                            ? Math.round(
                                playerStatsData.stats.gameStats.scoreConsistency
                              ).toLocaleString()
                            : "—"}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Highest final score"
                          tooltipKey="Highest final score"
                          testId="highest-final-score"
                        >
                          {playerStatsData.stats.gameStats.highestFinalScore ? (
                            <Link
                              className="hover:underline"
                              href={`/games/${playerStatsData.stats.gameStats.highestFinalScore.gameId}`}
                            >
                              {playerStatsData.stats.gameStats.highestFinalScore.score.toLocaleString()}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Lowest final score"
                          tooltipKey="Lowest final score"
                          testId="lowest-final-score"
                        >
                          {playerStatsData.stats.gameStats.lowestFinalScore ? (
                            <Link
                              className="hover:underline"
                              href={`/games/${playerStatsData.stats.gameStats.lowestFinalScore.gameId}`}
                            >
                              {playerStatsData.stats.gameStats.lowestFinalScore.score.toLocaleString()}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="Comeback factor"
                          tooltipKey="Comeback factor"
                          testId="comeback-factor"
                        >
                          {playerStatsData.stats.gameStats.comebackFactor !=
                            null &&
                          isFinite(
                            playerStatsData.stats.gameStats.comebackFactor
                          )
                            ? Math.round(
                                playerStatsData.stats.gameStats.comebackFactor
                              ).toLocaleString()
                            : "—"}
                        </StatWithTooltip>
                      </div>

                      <div
                        className="grid gap-2 sm:grid-cols-2"
                        data-testid="placement-rates"
                      >
                        <StatWithTooltip
                          label="1st"
                          tooltipKey="1st"
                          testId="placement-1st"
                        >
                          {playerStatsData.stats.gameStats.placementRates[
                            "1"
                          ] !== null
                            ? `${safeFormatNumber(playerStatsData.stats.gameStats.placementRates["1"]!, 1)}%`
                            : "—"}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="2nd"
                          tooltipKey="2nd"
                          testId="placement-2nd"
                        >
                          {playerStatsData.stats.gameStats.placementRates[
                            "2"
                          ] !== null
                            ? `${safeFormatNumber(playerStatsData.stats.gameStats.placementRates["2"]!, 1)}%`
                            : "—"}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="3rd"
                          tooltipKey="3rd"
                          testId="placement-3rd"
                        >
                          {playerStatsData.stats.gameStats.placementRates[
                            "3"
                          ] !== null
                            ? `${safeFormatNumber(playerStatsData.stats.gameStats.placementRates["3"]!, 1)}%`
                            : "—"}
                        </StatWithTooltip>
                        <StatWithTooltip
                          label="4th"
                          tooltipKey="4th"
                          testId="placement-4th"
                        >
                          {playerStatsData.stats.gameStats.placementRates[
                            "4"
                          ] !== null
                            ? `${safeFormatNumber(playerStatsData.stats.gameStats.placementRates["4"]!, 1)}%`
                            : "—"}
                        </StatWithTooltip>
                      </div>
                    </div>
                  </StatsCollapsibleSection>

                  {/* Hand-level stats (Season 5+ only) */}
                  {!playerStatsData.hasHandData ? (
                    <StatisticsNotAvailable />
                  ) : (
                    <>
                      <StatsCollapsibleSection
                        title="Hand stats"
                        defaultOpen={false}
                        data-testid="stats-section-hand"
                      >
                        <div
                          className="space-y-2"
                          data-testid="hand-level-stats"
                        >
                          <div className="grid gap-2 sm:grid-cols-2">
                            <StatWithTooltip
                              label="Win rate"
                              tooltipKey="Win rate"
                              testId="win-rate"
                            >
                              {playerStatsData.stats.handStats.winRate !== null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.winRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Tsumo rate"
                              tooltipKey="Tsumo rate"
                              testId="tsumo-rate"
                            >
                              {playerStatsData.stats.handStats.tsumoRate !==
                              null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.tsumoRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Deal-in rate"
                              tooltipKey="Deal-in rate"
                              testId="deal-in-rate"
                            >
                              {playerStatsData.stats.handStats.dealInRate !==
                              null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.dealInRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Riichi rate"
                              tooltipKey="Riichi rate"
                              testId="riichi-rate"
                            >
                              {playerStatsData.stats.handStats.riichiRate !==
                              null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.riichiRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Win w/ riichi"
                              tooltipKey="Win w/ riichi"
                              testId="win-with-riichi-rate"
                            >
                              {playerStatsData.stats.handStats
                                .winWithRiichiRate !== null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.winWithRiichiRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Win w/o riichi"
                              tooltipKey="Win w/o riichi"
                              testId="win-without-riichi-rate"
                            >
                              {playerStatsData.stats.handStats
                                .winWithoutRiichiRate !== null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.winWithoutRiichiRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Win rate as dealer"
                              tooltipKey="Win rate as dealer"
                              testId="dealer-win-rate"
                            >
                              {playerStatsData.stats.handStats.dealerWinRate !==
                              null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.dealerWinRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Win rate as non-dealer"
                              tooltipKey="Win rate as non-dealer"
                              testId="non-dealer-win-rate"
                            >
                              {playerStatsData.stats.handStats
                                .nonDealerWinRate !== null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.nonDealerWinRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Longest hand win streak"
                              tooltipKey="Longest hand win streak"
                              testId="longest-hand-win-streak"
                            >
                              {
                                playerStatsData.stats.handStats
                                  .longestHandWinStreakInSingleGame
                              }
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Avg han on wins"
                              tooltipKey="Avg han on wins"
                              testId="avg-han-on-wins"
                            >
                              {playerStatsData.stats.handStats
                                .averageHanOnWins != null &&
                              isFinite(
                                playerStatsData.stats.handStats.averageHanOnWins
                              )
                                ? safeFormatNumber(
                                    playerStatsData.stats.handStats
                                      .averageHanOnWins,
                                    1
                                  )
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Avg fu on wins"
                              tooltipKey="Avg fu on wins"
                              testId="avg-fu-on-wins"
                            >
                              {playerStatsData.stats.handStats
                                .averageFuOnWins != null &&
                              isFinite(
                                playerStatsData.stats.handStats.averageFuOnWins
                              )
                                ? Math.round(
                                    playerStatsData.stats.handStats
                                      .averageFuOnWins
                                  )
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Highest han achieved"
                              tooltipKey="Highest han achieved"
                              testId="highest-han-achieved"
                            >
                              {playerStatsData.stats.handStats
                                .highestHanAchieved ? (
                                <Link
                                  className="hover:underline"
                                  href={`/games/${playerStatsData.stats.handStats.highestHanAchieved.gameId}`}
                                >
                                  {
                                    playerStatsData.stats.handStats
                                      .highestHanAchieved.han
                                  }
                                </Link>
                              ) : (
                                "—"
                              )}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Riichi efficiency (win rate when riichi)"
                              tooltipKey="Riichi efficiency (win rate when riichi)"
                              testId="riichi-efficiency"
                            >
                              {playerStatsData.stats.handStats
                                .riichiEfficiencyWinRate != null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.riichiEfficiencyWinRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Win rate when not riichi"
                              tooltipKey="Win rate when not riichi"
                              testId="riichi-no-riichi-win-rate"
                            >
                              {playerStatsData.stats.handStats
                                .riichiEfficiencyNoRiichiWinRate != null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.riichiEfficiencyNoRiichiWinRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Riichi sticks per game"
                              tooltipKey="Riichi sticks per game"
                              testId="riichi-sticks-per-game"
                            >
                              {playerStatsData.stats.handStats
                                .riichiSticksCollectedPerGame != null &&
                              isFinite(
                                playerStatsData.stats.handStats
                                  .riichiSticksCollectedPerGame
                              )
                                ? safeFormatNumber(
                                    playerStatsData.stats.handStats
                                      .riichiSticksCollectedPerGame,
                                    1
                                  )
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Dealer retention rate"
                              tooltipKey="Dealer retention rate"
                              testId="dealer-retention-rate"
                            >
                              {playerStatsData.stats.handStats
                                .dealerRetentionRate != null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.dealerRetentionRate, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Avg points per tsumo"
                              tooltipKey="Avg points per tsumo"
                              testId="avg-pts-tsumo"
                            >
                              {playerStatsData.stats.handStats
                                .averagePointsPerTsumo != null
                                ? Math.round(
                                    playerStatsData.stats.handStats
                                      .averagePointsPerTsumo
                                  ).toLocaleString()
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Avg points per ron"
                              tooltipKey="Avg points per ron"
                              testId="avg-pts-ron"
                            >
                              {playerStatsData.stats.handStats
                                .averagePointsPerRon != null
                                ? Math.round(
                                    playerStatsData.stats.handStats
                                      .averagePointsPerRon
                                  ).toLocaleString()
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Deal-in rate (East round)"
                              tooltipKey="Deal-in rate (East round)"
                              testId="deal-in-rate-east"
                            >
                              {playerStatsData.stats.handStats
                                .dealInRateEastRound != null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.dealInRateEastRound, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Deal-in rate (South round)"
                              tooltipKey="Deal-in rate (South round)"
                              testId="deal-in-rate-south"
                            >
                              {playerStatsData.stats.handStats
                                .dealInRateSouthRound != null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.dealInRateSouthRound, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Win rate (East round)"
                              tooltipKey="Win rate (East round)"
                              testId="win-rate-east"
                            >
                              {playerStatsData.stats.handStats
                                .winRateEastRound != null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.winRateEastRound, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Win rate (South round)"
                              tooltipKey="Win rate (South round)"
                              testId="win-rate-south"
                            >
                              {playerStatsData.stats.handStats
                                .winRateSouthRound != null
                                ? `${safeFormatNumber(playerStatsData.stats.handStats.winRateSouthRound, 1)}%`
                                : "—"}
                            </StatWithTooltip>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            <StatWithTooltip
                              label="Avg win value"
                              tooltipKey="Avg win value"
                              testId="avg-win-value"
                            >
                              {playerStatsData.stats.handStats
                                .averageWinValue !== null
                                ? Math.round(
                                    playerStatsData.stats.handStats
                                      .averageWinValue
                                  ).toLocaleString()
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Median win value"
                              tooltipKey="Median win value"
                              testId="median-win-value"
                            >
                              {playerStatsData.stats.handStats
                                .medianWinValue !== null
                                ? Math.round(
                                    playerStatsData.stats.handStats
                                      .medianWinValue
                                  ).toLocaleString()
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Avg deal-in value"
                              tooltipKey="Avg deal-in value"
                              testId="avg-deal-in-value"
                            >
                              {playerStatsData.stats.handStats
                                .averageDealInValue !== null
                                ? Math.round(
                                    playerStatsData.stats.handStats
                                      .averageDealInValue
                                  ).toLocaleString()
                                : "—"}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Median deal-in value"
                              tooltipKey="Median deal-in value"
                              testId="median-deal-in-value"
                            >
                              {playerStatsData.stats.handStats
                                .medianDealInValue !== null
                                ? Math.round(
                                    playerStatsData.stats.handStats
                                      .medianDealInValue
                                  ).toLocaleString()
                                : "—"}
                            </StatWithTooltip>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            <StatWithTooltip
                              label="Biggest winning hand"
                              tooltipKey="Biggest winning hand"
                              testId="biggest-winning-hand"
                            >
                              {playerStatsData.stats.handStats
                                .biggestWinningHand ? (
                                <Link
                                  className="hover:underline"
                                  href={`/games/${playerStatsData.stats.handStats.biggestWinningHand.gameId}`}
                                >
                                  {playerStatsData.stats.handStats.biggestWinningHand.value.toLocaleString()}
                                </Link>
                              ) : (
                                "—"
                              )}
                            </StatWithTooltip>
                            <StatWithTooltip
                              label="Biggest losing hand"
                              tooltipKey="Biggest losing hand"
                              testId="biggest-losing-hand"
                            >
                              {playerStatsData.stats.handStats
                                .biggestLosingHand ? (
                                <Link
                                  className="hover:underline"
                                  href={`/games/${playerStatsData.stats.handStats.biggestLosingHand.gameId}`}
                                >
                                  {playerStatsData.stats.handStats.biggestLosingHand.value.toLocaleString()}
                                </Link>
                              ) : (
                                "—"
                              )}
                            </StatWithTooltip>
                          </div>
                        </div>
                      </StatsCollapsibleSection>

                      <StatsCollapsibleSection
                        title="Fun stats"
                        defaultOpen={false}
                        data-testid="stats-section-fun"
                      >
                        <div className="grid gap-2 sm:grid-cols-2">
                          <StatWithTooltip
                            label="Lucky number (best seat)"
                            tooltipKey="Lucky number (best seat)"
                            testId="lucky-number"
                          >
                            <span className="capitalize">
                              {playerStatsData.stats.handStats
                                .bestSeatByWinRate ?? "—"}
                            </span>
                          </StatWithTooltip>
                          <StatWithTooltip
                            label="Unlucky number (worst seat)"
                            tooltipKey="Unlucky number (worst seat)"
                            testId="unlucky-number"
                          >
                            <span className="capitalize">
                              {playerStatsData.stats.handStats
                                .worstSeatByWinRate ?? "—"}
                            </span>
                          </StatWithTooltip>
                          <StatWithTooltip
                            label="Clutch factor (S4 win rate)"
                            tooltipKey="Clutch factor (S4 win rate)"
                            testId="clutch-factor"
                          >
                            {playerStatsData.stats.handStats.clutchFactor !=
                            null
                              ? `${safeFormatNumber(playerStatsData.stats.handStats.clutchFactor, 1)}%`
                              : "—"}
                          </StatWithTooltip>
                          <StatWithTooltip
                            label="Early game dominance"
                            tooltipKey="Early game dominance"
                            testId="early-game-dominance"
                          >
                            {playerStatsData.stats.handStats
                              .earlyGameDominance != null
                              ? `${safeFormatNumber(playerStatsData.stats.handStats.earlyGameDominance, 1)}%`
                              : "—"}
                          </StatWithTooltip>
                          <StatWithTooltip
                            label="Comeback specialist (East seat)"
                            tooltipKey="Comeback specialist (East seat)"
                            testId="comeback-specialist"
                          >
                            {playerStatsData.stats.handStats
                              .comebackSpecialist != null
                              ? `${safeFormatNumber(playerStatsData.stats.handStats.comebackSpecialist, 1)}%`
                              : "—"}
                          </StatWithTooltip>
                        </div>
                      </StatsCollapsibleSection>
                    </>
                  )}
                </div>
              )}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Achievements */}
      {player.achievements && player.achievements.length > 0 && (
        <Card data-testid="achievements-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {player.achievements.map(achievement => (
                <AchievementBadge
                  key={
                    achievement.playerAchievementId ||
                    `${achievement.id}-${achievement.seasonName}`
                  }
                  achievement={achievement}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Games */}
      <Card data-testid="game-history">
        <CardHeader>
          <CardTitle>
            <span className="text-xl">🎮</span> Recent Games •{" "}
            <span className="text-muted-foreground text-sm font-normal">
              Showing{" "}
              {gamesData && gamesData.length > 0
                ? Math.min(5, gamesData.length)
                : 0}{" "}
              of {gamesData?.length || 0}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div data-testid="games-list">
            {gamesLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : gamesData && gamesData.length > 0 ? (
              <PlayerGamesList playerId={playerId} initialGames={gamesData} />
            ) : (
              <div className="text-muted-foreground py-4 text-center text-sm">
                No games played yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

function PlayerProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
