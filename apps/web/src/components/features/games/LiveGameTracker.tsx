'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Trophy,
  Wind,
  Save,
  RotateCcw,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Player {
  id: string
  name: string
  seat: 'East' | 'South' | 'West' | 'North'
  score: number
  riichi: boolean
}

interface Hand {
  round: 'E' | 'S' | 'W' | 'N'
  number: number
  honba: number
  winner?: string
  loser?: string
  points: number
  type: 'tsumo' | 'ron' | 'draw'
  riichi: string[]
  timestamp: Date
}

const INITIAL_SCORE = 25000

export function LiveGameTracker({ gameId: _gameId }: { gameId: string }) {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Joseph', seat: 'East', score: INITIAL_SCORE, riichi: false },
    { id: '2', name: 'Josh', seat: 'South', score: INITIAL_SCORE, riichi: false },
    { id: '3', name: 'Mikey', seat: 'West', score: INITIAL_SCORE, riichi: false },
    { id: '4', name: 'Hyun', seat: 'North', score: INITIAL_SCORE, riichi: false },
  ])
  
  const [hands, setHands] = useState<Hand[]>([])
  const [currentRound, setCurrentRound] = useState<'E' | 'S' | 'W' | 'N'>('E')
  const [currentNumber, setCurrentNumber] = useState(1)
  const [currentHonba, setCurrentHonba] = useState(0)
  const [riichiSticks, setRiichiSticks] = useState(0)
  const [gameTimer, setGameTimer] = useState(0)
  
  // Hand entry state
  const [handType, setHandType] = useState<'tsumo' | 'ron' | 'draw'>('ron')
  const [winner, setWinner] = useState<string>('')
  const [loser, setLoser] = useState<string>('')
  const [handValue, setHandValue] = useState<string>('')
  const [selectedRiichi, setSelectedRiichi] = useState<string[]>([])
  
  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGameTimer(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  
  const getCurrentDealer = () => {
    const dealerIndex = (currentNumber - 1) % 4
    return players[dealerIndex]
  }
  
  const calculateScoreChanges = () => {
    if (!handValue || isNaN(parseInt(handValue))) return null
    
    const baseValue = parseInt(handValue)
    const honbaValue = currentHonba * 300
    const riichiValue = riichiSticks * 1000
    
    if (handType === 'tsumo') {
      const winnerPlayer = players.find(p => p.id === winner)
      if (!winnerPlayer) return null
      
      const winnerIsDealer = getCurrentDealer().id === winner
      const nonDealerPay = winnerIsDealer 
        ? Math.ceil((baseValue + honbaValue) / 3 / 100) * 100
        : Math.ceil((baseValue / 4 + honbaValue / 3) / 100) * 100
      const dealerPay = winnerIsDealer
        ? 0
        : Math.ceil((baseValue / 2 + honbaValue / 3) / 100) * 100
      
      return {
        winner: {
          id: winner,
          change: (winnerIsDealer ? nonDealerPay * 3 : nonDealerPay * 2 + dealerPay) + riichiValue
        },
        losers: players
          .filter(p => p.id !== winner)
          .map(p => ({
            id: p.id,
            change: -(getCurrentDealer().id === p.id ? dealerPay : nonDealerPay)
          }))
      }
    } else if (handType === 'ron') {
      const totalPay = baseValue + honbaValue + riichiValue
      
      return {
        winner: { id: winner, change: totalPay },
        losers: [{ id: loser, change: -totalPay }]
      }
    }
    
    return null
  }
  
  const submitHand = () => {
    const scoreChanges = calculateScoreChanges()
    if (!scoreChanges && handType !== 'draw') {
      toast.error('Please fill in all required fields')
      return
    }
    
    // Update scores
    if (scoreChanges) {
      setPlayers(prev => prev.map(player => {
        if (player.id === scoreChanges.winner.id) {
          return { ...player, score: player.score + scoreChanges.winner.change, riichi: false }
        }
        const loserChange = scoreChanges.losers.find(l => l.id === player.id)
        if (loserChange) {
          return { ...player, score: player.score + loserChange.change, riichi: false }
        }
        return player
      }))
    }
    
    // Record hand
    const newHand: Hand = {
      round: currentRound,
      number: currentNumber,
      honba: currentHonba,
      winner,
      loser,
      points: parseInt(handValue) || 0,
      type: handType,
      riichi: selectedRiichi,
      timestamp: new Date()
    }
    setHands(prev => [...prev, newHand])
    
    // Update round state
    if (handType === 'draw' || (winner && getCurrentDealer().id === winner)) {
      setCurrentHonba(prev => prev + 1)
    } else {
      // Advance to next hand
      if (currentNumber === 4) {
        const roundOrder: ('E' | 'S' | 'W' | 'N')[] = ['E', 'S', 'W', 'N']
        const currentIndex = roundOrder.indexOf(currentRound)
        if (currentIndex < 3) {
          setCurrentRound(roundOrder[currentIndex + 1])
          setCurrentNumber(1)
        } else {
          // Game would end here
          toast.success('Game complete!')
        }
      } else {
        setCurrentNumber(prev => prev + 1)
      }
      setCurrentHonba(0)
    }
    
    // Reset riichi sticks if someone won
    if (handType !== 'draw') {
      setRiichiSticks(0)
      setPlayers(prev => prev.map(p => ({ ...p, riichi: false })))
    }
    
    // Reset form
    setWinner('')
    setLoser('')
    setHandValue('')
    setSelectedRiichi([])
    
    toast.success('Hand recorded!')
  }
  
  const declareRiichi = (playerId: string) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        const newRiichi = !player.riichi
        if (newRiichi) {
          setRiichiSticks(prev => prev + 1)
          return { ...player, score: player.score - 1000, riichi: true }
        } else {
          setRiichiSticks(prev => Math.max(0, prev - 1))
          return { ...player, score: player.score + 1000, riichi: false }
        }
      }
      return player
    }))
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Game</CardTitle>
              <CardDescription>
                {currentRound}{currentNumber} • Honba: {currentHonba} • Riichi: {riichiSticks}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(gameTimer)}
              </Badge>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Score Display */}
      <div className="grid grid-cols-2 gap-3">
        {players.map((player) => {
          const isDealer = getCurrentDealer().id === player.id
          return (
            <Card 
              key={player.id} 
              className={cn(
                "relative",
                isDealer && "ring-2 ring-primary"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={isDealer ? "default" : "secondary"}>
                      {player.seat}
                    </Badge>
                    <span className="font-medium">{player.name}</span>
                    {player.riichi && (
                      <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                        R
                      </Badge>
                    )}
                  </div>
                  {isDealer && <Wind className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold font-mono tabular-nums">
                    {player.score.toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    variant={player.riichi ? "default" : "outline"}
                    onClick={() => declareRiichi(player.id)}
                  >
                    Riichi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Hand Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enter Hand Result</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={handType} onValueChange={(v) => setHandType(v as typeof handType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ron">Ron</TabsTrigger>
              <TabsTrigger value="tsumo">Tsumo</TabsTrigger>
              <TabsTrigger value="draw">Draw</TabsTrigger>
            </TabsList>

            <TabsContent value="ron" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Winner</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {players.map(player => (
                      <Button
                        key={player.id}
                        variant={winner === player.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWinner(player.id)}
                      >
                        {player.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Loser (Dealt In)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {players
                      .filter(p => p.id !== winner)
                      .map(player => (
                        <Button
                          key={player.id}
                          variant={loser === player.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLoser(player.id)}
                        >
                          {player.name}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hand Value</Label>
                <Input
                  type="number"
                  placeholder="e.g., 3900"
                  value={handValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHandValue(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="tsumo" className="space-y-4">
              <div className="space-y-2">
                <Label>Winner</Label>
                <div className="grid grid-cols-2 gap-2">
                  {players.map(player => (
                    <Button
                      key={player.id}
                      variant={winner === player.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWinner(player.id)}
                    >
                      {player.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hand Value (Non-dealer payment)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 1300"
                  value={handValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHandValue(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="draw" className="space-y-4">
              <div className="space-y-2">
                <Label>Players in Tenpai</Label>
                <div className="space-y-2">
                  {players.map(player => (
                    <div key={player.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={player.id}
                        checked={selectedRiichi.includes(player.id)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedRiichi(prev => [...prev, player.id])
                          } else {
                            setSelectedRiichi(prev => prev.filter(id => id !== player.id))
                          }
                        }}
                      />
                      <Label htmlFor={player.id}>{player.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-4">
            <Button onClick={submitHand} className="flex-1">
              <Trophy className="w-4 h-4 mr-2" />
              Record Hand
            </Button>
            <Button variant="outline" onClick={() => {
              setWinner('')
              setLoser('')
              setHandValue('')
              setSelectedRiichi([])
            }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Hands */}
      {hands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Hands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hands.slice(-3).reverse().map((hand, index) => {
                const winnerPlayer = players.find(p => p.id === hand.winner)
                const loserPlayer = players.find(p => p.id === hand.loser)
                
                return (
                  <div key={hands.length - index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                    <span className="text-muted-foreground">
                      {hand.round}{hand.number}-{hand.honba}
                    </span>
                    <span>
                      {hand.type === 'draw' ? (
                        'Draw'
                      ) : (
                        <>
                          {winnerPlayer?.name} {hand.type === 'tsumo' ? 'tsumo' : `← ${loserPlayer?.name}`}
                        </>
                      )}
                    </span>
                    <span className="font-mono">
                      {hand.points > 0 && `${hand.points.toLocaleString()}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}