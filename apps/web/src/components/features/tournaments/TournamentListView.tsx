'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Plus,
  Users,
  Calendar,
  ChevronRight,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react'

interface Tournament {
  id: string
  name: string
  date: Date
  format: string
  playerCount: number
  status: 'upcoming' | 'live' | 'completed'
  winner?: string
  currentRound?: number
  totalRounds?: number
}

// Mock data
const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Winter Championship 2025',
    date: new Date(2025, 0, 25),
    format: 'Single Elimination',
    playerCount: 8,
    status: 'upcoming'
  },
  {
    id: '2',
    name: 'January Showdown',
    date: new Date(2025, 0, 19),
    format: 'Swiss System',
    playerCount: 12,
    status: 'live',
    currentRound: 3,
    totalRounds: 5
  },
  {
    id: '3',
    name: 'New Year Classic',
    date: new Date(2025, 0, 2),
    format: 'Round Robin',
    playerCount: 6,
    status: 'completed',
    winner: 'Joseph'
  }
]

export function TournamentListView() {
  const router = useRouter()

  const getStatusBadge = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        )
      case 'live':
        return (
          <Badge variant="destructive">
            <Zap className="w-3 h-3 mr-1" />
            Live
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
    }
  }

  const formatDate = (date: Date) => {
    const isThisYear = date.getFullYear() === new Date().getFullYear()
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(isThisYear ? {} : { year: 'numeric' })
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tournaments</h1>
          <p className="text-muted-foreground">Organize and track competitive events</p>
        </div>
        <Button onClick={() => router.push('/tournaments/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Tournament
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {mockTournaments.map(tournament => (
            <Card key={tournament.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                    <CardDescription className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(tournament.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tournament.playerCount} players
                      </span>
                      <span>{tournament.format}</span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(tournament.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    {tournament.status === 'live' && tournament.currentRound && (
                      <p className="text-sm">
                        Round {tournament.currentRound} of {tournament.totalRounds}
                      </p>
                    )}
                    {tournament.status === 'completed' && tournament.winner && (
                      <p className="text-sm flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        Winner: <span className="font-medium">{tournament.winner}</span>
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="ghost">
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {mockTournaments
            .filter(t => t.status === 'upcoming')
            .map(tournament => (
              <Card key={tournament.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      <CardDescription className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(tournament.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {tournament.playerCount} players
                        </span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(tournament.status)}
                  </div>
                </CardHeader>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          {mockTournaments
            .filter(t => t.status === 'live')
            .map(tournament => (
              <Card key={tournament.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      <CardDescription>
                        Round {tournament.currentRound} of {tournament.totalRounds}
                      </CardDescription>
                    </div>
                    {getStatusBadge(tournament.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Live Bracket
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {mockTournaments
            .filter(t => t.status === 'completed')
            .map(tournament => (
              <Card key={tournament.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{tournament.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        Winner: <span className="font-medium">{tournament.winner}</span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(tournament.status)}
                  </div>
                </CardHeader>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tournaments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockTournaments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Now</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {mockTournaments.filter(t => t.status === 'live').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {mockTournaments.filter(t => t.status === 'upcoming').length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}