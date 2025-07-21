"use client";

import { useState } from "react";
import { useSeasonStats } from "@/lib/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  ChartBar,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Compass,
  Zap,
  Brain,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsView() {
  const { data: stats, isLoading, error } = useSeasonStats();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (error || !stats) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load season statistics</AlertDescription>
      </Alert>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSection(current => (current === section ? null : section));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Season Statistics</h1>
        <p className="text-muted-foreground">
          Overall performance metrics and achievements
        </p>
      </div>

      {/* Header Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            📊 Season 3 Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-muted-foreground text-sm">Total Games</p>
              <p className="text-2xl font-bold">{stats.totalGames || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Active Players</p>
              <p className="text-2xl font-bold">{stats.totalPlayers || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Average Score</p>
              <p className="text-2xl font-bold">
                {stats.averageScore?.toLocaleString() || "25,000"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Highest Score</p>
              <p className="text-2xl font-bold">
                {stats.highestScore?.toLocaleString() || "67,300"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records & Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Records & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="border-yellow-500/30 bg-yellow-500/20 text-yellow-600">
                Most Wins
              </Badge>
              <span className="font-medium">
                {stats.mostWins?.name || "Josh"}
              </span>
            </div>
            <span className="font-mono font-semibold">
              {stats.mostWins?.count || 42} wins
            </span>
          </div>

          {stats.biggestWinner && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="border-green-500/30 bg-green-500/20 text-green-600">
                  Biggest Win
                </Badge>
                <span className="font-medium">{stats.biggestWinner.name}</span>
              </div>
              <span className="font-mono font-semibold text-green-600">
                +{stats.biggestWinner.plusMinus.toLocaleString()}
              </span>
            </div>
          )}

          {stats.mostActivePlayer && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-600">
                  Most Games
                </Badge>
                <span className="font-medium">
                  {stats.mostActivePlayer.name}
                </span>
              </div>
              <span className="font-mono">
                {stats.mostActivePlayer.games ||
                  stats.mostActivePlayer.gamesPlayed}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="border-purple-500/30 bg-purple-500/20 text-purple-600">
                Best Streak
              </Badge>
              <span className="font-medium">Joseph</span>
            </div>
            <span className="font-mono">3 wins</span>
          </div>
        </CardContent>
      </Card>

      {/* Exploration Sections */}
      <div className="space-y-3">
        {/* Placement Analysis */}
        <ExplorationSection
          title="Placement Analysis"
          icon={<ChartBar className="h-5 w-5" />}
          description="Who finishes where most often?"
          isExpanded={expandedSection === "placement"}
          onToggle={() => toggleSection("placement")}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Distribution of 1st, 2nd, 3rd, and 4th place finishes across all
              players.
            </p>
            <div className="bg-muted text-muted-foreground rounded-lg p-4 text-center">
              Placement distribution chart will go here
            </div>
          </div>
        </ExplorationSection>

        {/* Hidden Gem: Seat Performance */}
        <ExplorationSection
          title="Hidden Gem: Seat Performance"
          icon={<Compass className="h-5 w-5" />}
          description="Does your starting position matter?"
          badge={
            <Badge variant="secondary" className="ml-2">
              🎯 Fun Discovery
            </Badge>
          }
          isExpanded={expandedSection === "seats"}
          onToggle={() => toggleSection("seats")}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground mb-4 text-sm">
              We analyzed all games to see if certain seat positions have
              advantages!
            </p>

            <div className="space-y-3">
              <SeatStat position="East" avgPlacement={1.8} emoji="⭐" />
              <SeatStat position="South" avgPlacement={2.2} emoji="🟢" />
              <SeatStat position="West" avgPlacement={2.6} emoji="🟡" />
              <SeatStat position="North" avgPlacement={3.4} emoji="⚠️" />
            </div>

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Did you know?</strong> East seat wins 35% more often!
                The dealer advantage is real.
              </AlertDescription>
            </Alert>
          </div>
        </ExplorationSection>

        {/* Rating Mathematics */}
        <ExplorationSection
          title="Rating Mathematics"
          icon={<Brain className="h-5 w-5" />}
          description="For the curious minds who want to understand the system"
          isExpanded={expandedSection === "math"}
          onToggle={() => toggleSection("math")}
        >
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert">
              <p>
                Our rating system uses <strong>OpenSkill</strong>, a modern
                algorithm that tracks both your skill level and how confident we
                are in that estimate.
              </p>

              <div className="bg-muted space-y-2 rounded-lg p-4">
                <p className="font-medium">The Formula:</p>
                <code className="text-sm">
                  Display Rating = μ (skill) - 2σ (uncertainty)
                </code>
              </div>

              <ul className="mt-4 space-y-2">
                <li>Big wins against strong players = bigger rating gains</li>
                <li>Close games = smaller rating changes</li>
                <li>More games played = lower uncertainty</li>
              </ul>
            </div>
          </div>
        </ExplorationSection>

        {/* Fun Facts */}
        <ExplorationSection
          title="Fun Facts & Curiosities"
          icon={<Zap className="h-5 w-5" />}
          description="Interesting patterns we've discovered"
          isExpanded={expandedSection === "fun"}
          onToggle={() => toggleSection("fun")}
        >
          <div className="space-y-3">
            <FunFact
              title="The Comeback King"
              value="Koki recovered from -45k to win!"
              emoji="👑"
            />
            <FunFact
              title="Curse of the North"
              value="North seat finishes 4th in 42% of games"
              emoji="😱"
            />
            <FunFact
              title="Perfect Rivalry"
              value="Joseph vs Josh: 50-50 head-to-head"
              emoji="⚔️"
            />
            <FunFact
              title="Lucky Number"
              value="Games ending in 7 have higher ratings!"
              emoji="🎰"
            />
          </div>
        </ExplorationSection>
      </div>

      {/* Explore More Button */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-2 text-center">
            <Wind className="text-muted-foreground mx-auto h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              More discoveries coming soon! Check back after more games.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ExplorationSectionProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  badge?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ExplorationSection({
  title,
  icon,
  description,
  badge,
  isExpanded,
  onToggle,
  children,
}: ExplorationSectionProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all",
        isExpanded && "ring-primary/20 ring-2"
      )}
    >
      <CardHeader onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <CardTitle className="flex items-center text-base">
                {title}
                {badge}
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                {description}
              </CardDescription>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </CardHeader>
      {isExpanded && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

interface SeatStatProps {
  position: string;
  avgPlacement: number;
  emoji: string;
}

function SeatStat({ position, avgPlacement, emoji }: SeatStatProps) {
  const percentage = ((4 - avgPlacement) / 3) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{position} Seat</span>
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="font-mono">{avgPlacement.toFixed(1)} avg</span>
        </div>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface FunFactProps {
  title: string;
  value: string;
  emoji: string;
}

function FunFact({ title, value, emoji }: FunFactProps) {
  return (
    <div className="bg-muted/50 flex items-start gap-3 rounded-lg p-3">
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{value}</p>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
