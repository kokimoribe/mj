'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  ChevronRight, 
  ArrowRight,
  Shuffle,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Mock player data (would come from API)
const AVAILABLE_PLAYERS = [
  { id: '1', name: 'Joseph' },
  { id: '2', name: 'Josh' },
  { id: '3', name: 'Mikey' },
  { id: '4', name: 'Hyun' },
  { id: '5', name: 'Koki' },
  { id: '6', name: 'Rayshone' },
  { id: '7', name: 'Jackie' },
]

const SEATS = ['East', 'South', 'West', 'North'] as const
type Seat = typeof SEATS[number]

interface SeatAssignment {
  seat: Seat
  playerId: string | null
  playerName: string | null
}

export function GameCreationFlow() {
  const router = useRouter()
  const [step, setStep] = useState<'players' | 'seats' | 'confirm'>('players')
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [seatAssignments, setSeatAssignments] = useState<SeatAssignment[]>([
    { seat: 'East', playerId: null, playerName: null },
    { seat: 'South', playerId: null, playerName: null },
    { seat: 'West', playerId: null, playerName: null },
    { seat: 'North', playerId: null, playerName: null },
  ])
  const [isCreating, setIsCreating] = useState(false)

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId)
      }
      if (prev.length < 4) {
        return [...prev, playerId]
      }
      return prev
    })
  }

  const randomizeSeatings = () => {
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5)
    const newAssignments = SEATS.map((seat, index) => {
      const playerId = shuffled[index]
      const player = AVAILABLE_PLAYERS.find(p => p.id === playerId)
      return {
        seat,
        playerId,
        playerName: player?.name || null
      }
    })
    setSeatAssignments(newAssignments)
    toast.success('Seats randomized!')
  }

  const swapSeats = (fromIndex: number, toIndex: number) => {
    const newAssignments = [...seatAssignments]
    const temp = newAssignments[fromIndex]
    newAssignments[fromIndex] = newAssignments[toIndex]
    newAssignments[toIndex] = temp
    setSeatAssignments(newAssignments)
  }

  const createGame = async () => {
    setIsCreating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In real implementation, this would create the game and navigate to it
    toast.success('Game created successfully!')
    router.push('/games/live/new-game-id')
  }

  const canProceed = step === 'players' ? selectedPlayers.length === 4 : true

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2">
        <Badge 
          variant={step === 'players' ? 'default' : 'secondary'}
          className="h-8 w-8 p-0 flex items-center justify-center rounded-full"
        >
          1
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Badge 
          variant={step === 'seats' ? 'default' : step === 'confirm' ? 'secondary' : 'outline'}
          className="h-8 w-8 p-0 flex items-center justify-center rounded-full"
        >
          2
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Badge 
          variant={step === 'confirm' ? 'default' : 'outline'}
          className="h-8 w-8 p-0 flex items-center justify-center rounded-full"
        >
          3
        </Badge>
      </div>

      {/* Step 1: Select Players */}
      {step === 'players' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Players
            </CardTitle>
            <CardDescription>
              Choose exactly 4 players for this game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_PLAYERS.map(player => {
                const isSelected = selectedPlayers.includes(player.id)
                const isDisabled = !isSelected && selectedPlayers.length >= 4
                
                return (
                  <Button
                    key={player.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      "h-16 justify-start",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !isDisabled && togglePlayer(player.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg">{player.name}</span>
                      {isSelected && <CheckCircle className="h-4 w-4" />}
                    </div>
                  </Button>
                )
              })}
            </div>

            {selectedPlayers.length < 4 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Select {4 - selectedPlayers.length} more player{selectedPlayers.length === 3 ? '' : 's'}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              className="w-full" 
              disabled={!canProceed}
              onClick={() => {
                randomizeSeatings()
                setStep('seats')
              }}
            >
              Continue to Seat Assignment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Assign Seats */}
      {step === 'seats' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Seat Assignment
            </CardTitle>
            <CardDescription>
              Drag to rearrange or randomize again
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {seatAssignments.map((assignment, index) => (
                <div 
                  key={assignment.seat}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-20">
                      {assignment.seat}
                    </Badge>
                    <span className="font-medium text-lg">
                      {assignment.playerName}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => swapSeats(index, index - 1)}
                      >
                        ↑
                      </Button>
                    )}
                    {index < 3 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => swapSeats(index, index + 1)}
                      >
                        ↓
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={randomizeSeatings}
                className="flex-1"
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Randomize Again
              </Button>
              <Button 
                onClick={() => setStep('confirm')}
                className="flex-1"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm & Create */}
      {step === 'confirm' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Confirm Game Setup
            </CardTitle>
            <CardDescription>
              Review and create the game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Game Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>Host House</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Seat Assignments</h4>
                <div className="space-y-1 text-sm">
                  {seatAssignments.map(assignment => (
                    <div key={assignment.seat} className="flex justify-between">
                      <span className="text-muted-foreground">{assignment.seat}</span>
                      <span className="font-medium">{assignment.playerName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setStep('seats')}
                disabled={isCreating}
              >
                Back
              </Button>
              <Button 
                onClick={createGame}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Game...
                  </>
                ) : (
                  <>
                    Create Game
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}