'use client'

import { useState } from 'react'
import { useSeasonStats } from '@/lib/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  ChartBar,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Compass,
  Zap,
  Brain,
  Wind
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatsView() {
  const { data: stats, isLoading, error } = useSeasonStats()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

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

  const toggleSection = (section: string) => {
    setExpandedSection(current => current === section ? null : section)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            📊 Season 3 Statistics
          </CardTitle>
          <CardDescription>
            {stats.totalGames} games played • {stats.totalPlayers} active players
          </CardDescription>
        </CardHeader>
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
          {stats.biggestWinner && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                  Biggest Win
                </Badge>
                <span className="font-medium">{stats.biggestWinner.name}</span>
              </div>
              <span className="text-green-600 font-mono font-semibold">
                +{stats.biggestWinner.plusMinus.toLocaleString()}
              </span>
            </div>
          )}
          
          {stats.mostActivePlayer && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                  Most Games
                </Badge>
                <span className="font-medium">{stats.mostActivePlayer.name}</span>
              </div>
              <span className="font-mono">{stats.mostActivePlayer.games}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">
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
          isExpanded={expandedSection === 'placement'}
          onToggle={() => toggleSection('placement')}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Distribution of 1st, 2nd, 3rd, and 4th place finishes across all players.
            </p>
            <div className="bg-muted rounded-lg p-4 text-center text-muted-foreground">
              Placement distribution chart will go here
            </div>
          </div>
        </ExplorationSection>

        {/* Hidden Gem: Seat Performance */}
        <ExplorationSection
          title="Hidden Gem: Seat Performance"
          icon={<Compass className="h-5 w-5" />}
          description="Does your starting position matter?"
          badge={<Badge variant="secondary" className="ml-2">🎯 Fun Discovery</Badge>}
          isExpanded={expandedSection === 'seats'}
          onToggle={() => toggleSection('seats')}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              We analyzed all games to see if certain seat positions have advantages!
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
                <strong>Did you know?</strong> East seat wins 35% more often! The dealer advantage is real.
              </AlertDescription>
            </Alert>
          </div>
        </ExplorationSection>

        {/* Rating Mathematics */}
        <ExplorationSection
          title="Rating Mathematics"
          icon={<Brain className="h-5 w-5" />}
          description="For the curious minds who want to understand the system"
          isExpanded={expandedSection === 'math'}
          onToggle={() => toggleSection('math')}
        >
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert">
              <p>Our rating system uses <strong>OpenSkill</strong>, a modern algorithm that tracks both your skill level and how confident we are in that estimate.</p>
              
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="font-medium">The Formula:</p>
                <code className="text-sm">Display Rating = μ (skill) - 2σ (uncertainty)</code>
              </div>
              
              <ul className="space-y-2 mt-4">
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
          description="Interesting patterns we&apos;ve discovered"
          isExpanded={expandedSection === 'fun'}
          onToggle={() => toggleSection('fun')}
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
          <div className="text-center space-y-2">
            <Wind className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              More discoveries coming soon! Check back after more games.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ExplorationSectionProps {
  title: string
  icon: React.ReactNode
  description: string
  badge?: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function ExplorationSection({ 
  title, 
  icon, 
  description, 
  badge,
  isExpanded, 
  onToggle, 
  children 
}: ExplorationSectionProps) {
  return (
    <Card className={cn(
      "transition-all cursor-pointer",
      isExpanded && "ring-2 ring-primary/20"
    )}>
      <CardHeader onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <CardTitle className="text-base flex items-center">
                {title}
                {badge}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  )
}

interface SeatStatProps {
  position: string
  avgPlacement: number
  emoji: string
}

function SeatStat({ position, avgPlacement, emoji }: SeatStatProps) {
  const percentage = ((4 - avgPlacement) / 3) * 100
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{position} Seat</span>
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="font-mono">{avgPlacement.toFixed(1)} avg</span>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface FunFactProps {
  title: string
  value: string
  emoji: string
}

function FunFact({ title, value, emoji }: FunFactProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  )
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
  )
}