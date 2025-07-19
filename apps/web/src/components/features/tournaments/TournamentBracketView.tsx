'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy,
  Zap,
  Crown,
  ChevronRight,
  Edit,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Match {
  id: string
  round: number
  position: number
  player1?: string
  player2?: string
  score1?: number
  score2?: number
  winner?: string
  status: 'pending' | 'live' | 'completed'
}

interface Tournament {
  id: string
  name: string
  format: string
  status: 'upcoming' | 'live' | 'completed'
  currentRound: number
  totalRounds: number
  players: string[]
  matches: Match[]
}

// Mock tournament data
const mockTournament: Tournament = {
  id: '1',
  name: 'Winter Championship 2025',
  format: 'Single Elimination',
  status: 'live',
  currentRound: 2,
  totalRounds: 3,
  players: ['Joseph', 'Josh', 'Mikey', 'Hyun', 'Naoki', 'James', 'Tony', 'Kevin'],
  matches: [
    // Round 1
    { id: '1', round: 1, position: 1, player1: 'Joseph', player2: 'Josh', winner: 'Joseph', score1: 45000, score2: 25000, status: 'completed' },
    { id: '2', round: 1, position: 2, player1: 'Mikey', player2: 'Hyun', winner: 'Mikey', score1: 38000, score2: 32000, status: 'completed' },
    { id: '3', round: 1, position: 3, player1: 'Naoki', player2: 'James', winner: 'Naoki', score1: 42000, score2: 28000, status: 'completed' },
    { id: '4', round: 1, position: 4, player1: 'Tony', player2: 'Kevin', winner: 'Kevin', score1: 22000, score2: 48000, status: 'completed' },
    // Round 2
    { id: '5', round: 2, position: 1, player1: 'Joseph', player2: 'Mikey', status: 'live' },
    { id: '6', round: 2, position: 2, player1: 'Naoki', player2: 'Kevin', status: 'pending' },
    // Round 3 (Finals)
    { id: '7', round: 3, position: 1, status: 'pending' }
  ]
}

export function TournamentBracketView({ tournamentId: _tournamentId }: { tournamentId: string }) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const tournament = mockTournament

  const getMatchesByRound = (round: number) => {
    return tournament.matches.filter(m => m.round === round)
  }

  const getRoundName = (round: number) => {
    if (round === tournament.totalRounds) return 'Finals'
    if (round === tournament.totalRounds - 1) return 'Semifinals'
    if (round === tournament.totalRounds - 2) return 'Quarterfinals'
    return `Round ${round}`
  }

  const renderMatch = (match: Match) => {
    const isLive = match.status === 'live'
    const isCompleted = match.status === 'completed'
    
    return (
      <Card 
        key={match.id}
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isLive && "ring-2 ring-green-500",
          selectedMatch?.id === match.id && "ring-2 ring-primary"
        )}
        onClick={() => setSelectedMatch(match)}
      >
        <CardContent className="p-4">
          {/* Match Status */}
          {isLive && (
            <div className="flex items-center gap-1 text-green-600 text-xs mb-2">
              <Zap className="w-3 h-3" />
              <span className="font-medium">LIVE</span>
            </div>
          )}

          {/* Players */}
          <div className="space-y-2">
            {/* Player 1 */}
            <div className={cn(
              "flex items-center justify-between p-2 rounded",
              match.winner === match.player1 && "bg-primary/10"
            )}>
              <div className="flex items-center gap-2">
                {match.winner === match.player1 && (
                  <Trophy className="w-4 h-4 text-primary" />
                )}
                <span className={cn(
                  "font-medium",
                  !match.player1 && "text-muted-foreground"
                )}>
                  {match.player1 || 'TBD'}
                </span>
              </div>
              {isCompleted && match.score1 && (
                <span className="font-mono text-sm">
                  {match.score1.toLocaleString()}
                </span>
              )}
            </div>

            {/* VS Divider */}
            <div className="text-center text-xs text-muted-foreground">
              VS
            </div>

            {/* Player 2 */}
            <div className={cn(
              "flex items-center justify-between p-2 rounded",
              match.winner === match.player2 && "bg-primary/10"
            )}>
              <div className="flex items-center gap-2">
                {match.winner === match.player2 && (
                  <Trophy className="w-4 h-4 text-primary" />
                )}
                <span className={cn(
                  "font-medium",
                  !match.player2 && "text-muted-foreground"
                )}>
                  {match.player2 || 'TBD'}
                </span>
              </div>
              {isCompleted && match.score2 && (
                <span className="font-mono text-sm">
                  {match.score2.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{tournament.name}</CardTitle>
              <CardDescription className="flex items-center gap-3 mt-1">
                <span>{tournament.format}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {tournament.players.length} players
                </span>
                <span>•</span>
                <span>Round {tournament.currentRound} of {tournament.totalRounds}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {tournament.status === 'live' && (
                <Badge variant="destructive">
                  <Zap className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Manage
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="bracket" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bracket">Bracket</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="matches">All Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="bracket">
          {/* Bracket Visualization */}
          <div className="overflow-x-auto">
            <div className="flex gap-8 min-w-max p-4">
              {Array.from({ length: tournament.totalRounds }, (_, i) => i + 1).map(round => (
                <div key={round} className="flex-1 min-w-[250px]">
                  <h3 className="font-medium text-center mb-4">
                    {getRoundName(round)}
                  </h3>
                  <div className="space-y-4">
                    {getMatchesByRound(round).map(match => renderMatch(match))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Match Details */}
          {selectedMatch && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Match Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {getRoundName(selectedMatch.round)}
                      </p>
                      <p className="font-medium">
                        {selectedMatch.player1} vs {selectedMatch.player2}
                      </p>
                    </div>
                    {selectedMatch.status === 'pending' && (
                      <Button size="sm">
                        Start Match
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                    {selectedMatch.status === 'live' && (
                      <Button size="sm" variant="destructive">
                        View Live
                        <Zap className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>

                  {selectedMatch.status === 'completed' && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Final Score</span>
                        <Badge variant="outline">
                          <Trophy className="w-3 h-3 mr-1" />
                          {selectedMatch.winner}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>{selectedMatch.player1}</span>
                          <span className="font-mono">
                            {selectedMatch.score1?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{selectedMatch.player2}</span>
                          <span className="font-mono">
                            {selectedMatch.score2?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tournament.players.map((player, index) => {
                  const isEliminated = tournament.matches.some(
                    m => m.status === 'completed' && 
                    (m.player1 === player || m.player2 === player) && 
                    m.winner !== player
                  )
                  const isChampion = tournament.status === 'completed' && 
                    tournament.matches[tournament.matches.length - 1].winner === player

                  return (
                    <div 
                      key={player}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        isEliminated && "opacity-50",
                        isChampion && "bg-primary/10 border-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="font-medium">{player}</span>
                        {isChampion && <Crown className="w-4 h-4 text-yellow-500" />}
                      </div>
                      {isEliminated && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Eliminated
                        </Badge>
                      )}
                      {!isEliminated && !isChampion && (
                        <Badge variant="secondary">
                          Active
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <div className="space-y-4">
            {Array.from({ length: tournament.totalRounds }, (_, i) => i + 1).map(round => (
              <Card key={round}>
                <CardHeader>
                  <CardTitle className="text-lg">{getRoundName(round)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getMatchesByRound(round).map(match => (
                      <div 
                        key={match.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">
                            {match.player1 || 'TBD'} vs {match.player2 || 'TBD'}
                          </p>
                          {match.status === 'completed' && (
                            <p className="text-sm text-muted-foreground">
                              Winner: {match.winner} ({match.score1?.toLocaleString()} - {match.score2?.toLocaleString()})
                            </p>
                          )}
                        </div>
                        <div>
                          {match.status === 'live' && (
                            <Badge variant="destructive">Live</Badge>
                          )}
                          {match.status === 'completed' && (
                            <Badge variant="outline">Completed</Badge>
                          )}
                          {match.status === 'pending' && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}