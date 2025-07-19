'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Users, 
  Settings,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface TournamentSettings {
  name: string
  date: string
  time: string
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss'
  playerCount: number
  selectedPlayers: string[]
  gameLength: 'half' | 'full'
  scoringRules: 'standard' | 'custom'
}

const TOURNAMENT_FORMATS = [
  {
    id: 'single-elimination',
    name: 'Single Elimination',
    description: 'Lose once and you\'re out',
    icon: '🏆'
  },
  {
    id: 'double-elimination',
    name: 'Double Elimination', 
    description: 'Get a second chance in losers bracket',
    icon: '🥈'
  },
  {
    id: 'round-robin',
    name: 'Round Robin',
    description: 'Everyone plays everyone',
    icon: '🔄'
  },
  {
    id: 'swiss',
    name: 'Swiss System',
    description: 'Paired by performance, no elimination',
    icon: '🇨🇭'
  }
]

const AVAILABLE_PLAYERS = [
  'Joseph', 'Josh', 'Mikey', 'Hyun', 'Naoki', 
  'James', 'Tony', 'Kevin', 'Albert', 'Koki',
  'Nick', 'Steve'
]

export function TournamentCreationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [settings, setSettings] = useState<TournamentSettings>({
    name: '',
    date: '',
    time: '',
    format: 'single-elimination',
    playerCount: 8,
    selectedPlayers: [],
    gameLength: 'half',
    scoringRules: 'standard'
  })

  const steps = [
    { number: 1, name: 'Basic Info', icon: Trophy },
    { number: 2, name: 'Format', icon: Settings },
    { number: 3, name: 'Players', icon: Users },
    { number: 4, name: 'Review', icon: Check }
  ]

  const updateSettings = (updates: Partial<TournamentSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!settings.name && !!settings.date && !!settings.time
      case 2:
        return !!settings.format
      case 3:
        return settings.selectedPlayers.length === settings.playerCount
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please complete all required fields')
      return
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    toast.success('Tournament created successfully!')
    router.push('/tournaments')
  }

  const getRequiredPlayerCount = () => {
    switch (settings.format) {
      case 'single-elimination':
      case 'double-elimination':
        // Powers of 2 for elimination brackets
        return [4, 8, 16, 32]
      case 'round-robin':
        // Any number 4 or more
        return [4, 5, 6, 7, 8, 9, 10, 11, 12]
      case 'swiss':
        // Even numbers preferred
        return [4, 6, 8, 10, 12, 14, 16]
      default:
        return [8]
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = step.number === currentStep
          const isCompleted = step.number < currentStep
          
          return (
            <div key={step.number} className="flex items-center flex-1">
              <button
                onClick={() => isCompleted && setCurrentStep(step.number)}
                disabled={!isCompleted}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg transition-colors",
                  isActive && "text-primary",
                  isCompleted && "text-primary cursor-pointer hover:bg-muted",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "border-muted-foreground"
                )}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className="hidden sm:inline font-medium">{step.name}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2",
                  isCompleted ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Tournament Details'}
            {currentStep === 2 && 'Choose Format'}
            {currentStep === 3 && 'Select Players'}
            {currentStep === 4 && 'Review & Create'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Set up the basic information for your tournament'}
            {currentStep === 2 && 'Select the tournament format that works best'}
            {currentStep === 3 && 'Choose who will participate'}
            {currentStep === 4 && 'Review your settings and create the tournament'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tournament Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Winter Championship 2025"
                  value={settings.name}
                  onChange={(e) => updateSettings({ name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={settings.date}
                    onChange={(e) => updateSettings({ date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={settings.time}
                    onChange={(e) => updateSettings({ time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Game Length</Label>
                <RadioGroup 
                  value={settings.gameLength}
                  onValueChange={(value) => updateSettings({ gameLength: value as 'half' | 'full' })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="half" id="half" />
                    <Label htmlFor="half">Half Games (East + South)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full">Full Games (All 4 rounds)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 2: Format */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid gap-3">
                {TOURNAMENT_FORMATS.map(format => (
                  <button
                    key={format.id}
                    onClick={() => updateSettings({ format: format.id as TournamentSettings['format'] })}
                    className={cn(
                      "text-left p-4 rounded-lg border transition-colors",
                      settings.format === format.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{format.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{format.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format.description}
                        </div>
                      </div>
                      {settings.format === format.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Number of Players</Label>
                <div className="flex gap-2 flex-wrap">
                  {getRequiredPlayerCount().map(count => (
                    <Button
                      key={count}
                      variant={settings.playerCount === count ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ playerCount: count, selectedPlayers: [] })}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Players */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Selected: {settings.selectedPlayers.length} / {settings.playerCount}
                </span>
                {settings.selectedPlayers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateSettings({ selectedPlayers: [] })}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_PLAYERS.map(player => {
                  const isSelected = settings.selectedPlayers.includes(player)
                  const isDisabled = !isSelected && settings.selectedPlayers.length >= settings.playerCount
                  
                  return (
                    <Button
                      key={player}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      disabled={isDisabled}
                      onClick={() => {
                        if (isSelected) {
                          updateSettings({
                            selectedPlayers: settings.selectedPlayers.filter(p => p !== player)
                          })
                        } else {
                          updateSettings({
                            selectedPlayers: [...settings.selectedPlayers, player]
                          })
                        }
                      }}
                      className={cn(
                        "justify-start",
                        isDisabled && "opacity-50"
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4 mr-1" />}
                      {player}
                    </Button>
                  )
                })}
              </div>

              {settings.selectedPlayers.length !== settings.playerCount && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Please select exactly {settings.playerCount} players
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Tournament Details</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Name:</dt>
                      <dd className="font-medium">{settings.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Date:</dt>
                      <dd className="font-medium">
                        {new Date(settings.date).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Time:</dt>
                      <dd className="font-medium">{settings.time}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Format:</dt>
                      <dd className="font-medium">
                        {TOURNAMENT_FORMATS.find(f => f.id === settings.format)?.name}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Game Length:</dt>
                      <dd className="font-medium">
                        {settings.gameLength === 'half' ? 'Half Games' : 'Full Games'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-medium mb-2">
                    Participants ({settings.selectedPlayers.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {settings.selectedPlayers.map(player => (
                      <Badge key={player} variant="secondary">
                        {player}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Ready to create your tournament!</p>
                    <p className="text-muted-foreground">
                      Players will be notified and the bracket will be generated automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        
        {currentStep < 4 ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            <Trophy className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        )}
      </div>
    </div>
  )
}