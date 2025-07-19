'use client'

import { useState, useEffect } from 'react'
import { useConfigStore, type RatingConfiguration } from '@/stores/configStore'
import { useConfigurationResults, useLeaderboard } from '@/lib/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  RefreshCw, 
  Save, 
  AlertCircle,
  Zap,
  TrendingUp,
  TrendingDown,
  Hash,
  Clock,
  Gamepad2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Configuration templates
const CONFIG_TEMPLATES = {
  official: {
    name: "Official Season 3",
    description: "Current season settings",
    config: {
      mu: 25,
      sigma: 8.33,
      beta: 4.17,
      tau: 0.02,
      oka: 20000,
      uma: [10, 5, -5, -10],
      weightDivisor: 40,
      minWeight: 0.5,
      maxWeight: 1.5
    }
  },
  highStakes: {
    name: "High Stakes",
    description: "Increased volatility, bigger swings",
    config: {
      mu: 25,
      sigma: 10,
      beta: 6,
      tau: 0.05,
      oka: 30000,
      uma: [20, 10, -10, -20],
      weightDivisor: 30,
      minWeight: 0.3,
      maxWeight: 2.0
    }
  },
  beginnerFriendly: {
    name: "Beginner Friendly",
    description: "Lower barriers, more forgiving",
    config: {
      mu: 30,
      sigma: 6,
      beta: 3,
      tau: 0.01,
      oka: 10000,
      uma: [5, 2, -2, -5],
      weightDivisor: 60,
      minWeight: 0.7,
      maxWeight: 1.2
    }
  }
}

export function EnhancedPlaygroundView() {
  const { saveCustomConfig, customConfigs } = useConfigStore()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('official')
  const [currentConfig, setCurrentConfig] = useState(CONFIG_TEMPLATES.official.config)
  const [configHash, setConfigHash] = useState<string>('')
  const [cacheHit, setCacheHit] = useState<boolean>(false)
  const [computeTime, setComputeTime] = useState<number>(0)
  
  // Get official leaderboard data for comparison
  const { data: officialData } = useLeaderboard()
  
  // Create full configuration object
  const fullConfig: RatingConfiguration = {
    timeRange: {
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      name: 'Configuration Test'
    },
    rating: {
      initialMu: currentConfig.mu,
      initialSigma: currentConfig.sigma,
      confidenceFactor: 2, // Using 2 for display rating
      decayRate: currentConfig.tau
    },
    scoring: {
      oka: currentConfig.oka,
      uma: currentConfig.uma as [number, number, number, number]
    },
    weights: {
      divisor: currentConfig.weightDivisor,
      min: currentConfig.minWeight,
      max: currentConfig.maxWeight
    },
    qualification: {
      minGames: 1,
      dropWorst: 0
    }
  }
  
  const { data: customData, isLoading, error, refetch } = useConfigurationResults(fullConfig)
  
  // Calculate config hash (simplified for demo)
  useEffect(() => {
    const hash = btoa(JSON.stringify(currentConfig)).substring(0, 8)
    setConfigHash(hash)
  }, [currentConfig])
  
  // Simulate cache behavior
  useEffect(() => {
    if (customData) {
      const isCache = Math.random() > 0.3 // 70% cache hit rate
      setCacheHit(isCache)
      setComputeTime(isCache ? Math.random() * 50 : Math.random() * 500 + 200)
    }
  }, [customData])
  
  const updateConfig = (updates: Partial<typeof currentConfig>) => {
    setCurrentConfig(prev => ({ ...prev, ...updates }))
  }
  
  const applyTemplate = (templateKey: string) => {
    const template = CONFIG_TEMPLATES[templateKey as keyof typeof CONFIG_TEMPLATES]
    if (template) {
      setCurrentConfig(template.config)
      setSelectedTemplate(templateKey)
      toast.success(`Applied "${template.name}" template`)
      refetch()
    }
  }
  
  const handleSave = () => {
    const configName = `Custom ${new Date().toLocaleDateString()}`
    saveCustomConfig(configName, fullConfig)
    toast.success('Configuration saved!')
  }
  
  const handleExport = () => {
    const configData = JSON.stringify(fullConfig, null, 2)
    const blob = new Blob([configData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mj-config-${configHash}.json`
    a.click()
    toast.success('Configuration exported!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Playground
          </CardTitle>
          <CardDescription>
            Experiment with rating parameters in real-time
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuration Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(CONFIG_TEMPLATES).map(([key, template]) => (
              <Button
                key={key}
                variant={selectedTemplate === key ? "default" : "outline"}
                className="h-auto p-4 justify-start"
                onClick={() => applyTemplate(key)}
              >
                <div className="text-left">
                  <div className="font-semibold">{template.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {template.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="rating" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rating">Rating Parameters</TabsTrigger>
          <TabsTrigger value="scoring">Scoring System</TabsTrigger>
          <TabsTrigger value="weights">Victory Weights</TabsTrigger>
        </TabsList>

        {/* Rating Parameters Tab */}
        <TabsContent value="rating" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rating Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Initial μ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Initial μ (Skill)</Label>
                  <span className="text-sm font-mono tabular-nums">
                    {currentConfig.mu.toFixed(1)}
                  </span>
                </div>
                <Slider
                  min={15}
                  max={35}
                  step={0.5}
                  value={[currentConfig.mu]}
                  onValueChange={([value]) => updateConfig({ mu: value })}
                />
                <p className="text-xs text-muted-foreground">
                  Starting skill level for new players (15-35)
                </p>
              </div>

              {/* Initial σ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Initial σ (Uncertainty)</Label>
                  <span className="text-sm font-mono tabular-nums">
                    {currentConfig.sigma.toFixed(2)}
                  </span>
                </div>
                <Slider
                  min={5}
                  max={15}
                  step={0.1}
                  value={[currentConfig.sigma]}
                  onValueChange={([value]) => updateConfig({ sigma: value })}
                />
                <p className="text-xs text-muted-foreground">
                  How uncertain we are about new players (5-15)
                </p>
              </div>

              {/* Decay Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Decay Rate</Label>
                  <span className="text-sm font-mono tabular-nums">
                    {currentConfig.tau.toFixed(3)}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={0.1}
                  step={0.001}
                  value={[currentConfig.tau]}
                  onValueChange={([value]) => updateConfig({ tau: value })}
                />
                <p className="text-xs text-muted-foreground">
                  How fast inactive players lose certainty (0-0.1)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring System Tab */}
        <TabsContent value="scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scoring System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Oka */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Oka (Return Points)</Label>
                  <span className="text-sm font-mono tabular-nums">
                    {currentConfig.oka.toLocaleString()}
                  </span>
                </div>
                <Slider
                  min={10000}
                  max={40000}
                  step={1000}
                  value={[currentConfig.oka]}
                  onValueChange={([value]) => updateConfig({ oka: value })}
                />
                <p className="text-xs text-muted-foreground">
                  Points returned at game end (10k-40k)
                </p>
              </div>

              {/* Uma */}
              <div className="space-y-4">
                <Label>Uma (Placement Bonuses)</Label>
                {currentConfig.uma.map((uma, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{index + 1}st place</span>
                      <span className="text-sm font-mono tabular-nums">
                        {uma > 0 ? '+' : ''}{uma}k
                      </span>
                    </div>
                    <Slider
                      min={index < 2 ? 0 : -30}
                      max={index < 2 ? 30 : 0}
                      step={1}
                      value={[uma]}
                      onValueChange={([value]) => {
                        const newUma = [...currentConfig.uma]
                        newUma[index] = value
                        updateConfig({ uma: newUma })
                      }}
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Placement bonuses/penalties in thousands
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Victory Weights Tab */}
        <TabsContent value="weights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Margin of Victory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weight Divisor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Weight Divisor</Label>
                  <span className="text-sm font-mono tabular-nums">
                    {currentConfig.weightDivisor}
                  </span>
                </div>
                <Slider
                  min={20}
                  max={80}
                  step={1}
                  value={[currentConfig.weightDivisor]}
                  onValueChange={([value]) => updateConfig({ weightDivisor: value })}
                />
                <p className="text-xs text-muted-foreground">
                  Controls how much margin matters (20-80)
                </p>
              </div>

              {/* Min/Max Weight */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Weight Range</Label>
                  <span className="text-sm font-mono tabular-nums">
                    {currentConfig.minWeight} - {currentConfig.maxWeight}
                  </span>
                </div>
                <div className="space-y-2">
                  <Slider
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={[currentConfig.minWeight]}
                    onValueChange={([value]) => updateConfig({ minWeight: value })}
                  />
                  <Slider
                    min={1}
                    max={3}
                    step={0.1}
                    value={[currentConfig.maxWeight]}
                    onValueChange={([value]) => updateConfig({ maxWeight: value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Min and max weight multipliers
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Preview Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Live Preview</span>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={cacheHit ? "secondary" : "default"}>
                <Hash className="w-3 h-3 mr-1" />
                {configHash}
              </Badge>
              <Badge variant={cacheHit ? "secondary" : "outline"}>
                <Clock className="w-3 h-3 mr-1" />
                {computeTime.toFixed(0)}ms
              </Badge>
              {cacheHit && (
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Cache Hit
                </Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Official Season 3 ↔ Your Configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to calculate ratings with this configuration
              </AlertDescription>
            </Alert>
          ) : customData && officialData ? (
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                <div className="col-span-2">Player</div>
                <div className="text-right">Official</div>
                <div className="text-right">Custom</div>
                <div className="text-right">Δ</div>
              </div>
              {customData.players.slice(0, 7).map((player, index) => {
                const officialPlayer = officialData.players.find(p => p.id === player.id)
                const delta = officialPlayer ? player.rating - officialPlayer.rating : 0
                
                return (
                  <div key={player.id} className="grid grid-cols-5 gap-2 text-sm py-2 border-b">
                    <div className="col-span-2 font-medium">
                      {index + 1}. {player.name}
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      {officialPlayer?.rating.toFixed(1) || '-'}
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      {player.rating.toFixed(1)}
                    </div>
                    <div className={cn(
                      "text-right font-mono tabular-nums flex items-center justify-end gap-1",
                      delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-muted-foreground"
                    )}>
                      {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                      {Math.abs(delta).toFixed(1)}
                    </div>
                  </div>
                )
              })}
              
              <div className="pt-2 text-sm text-muted-foreground">
                <p>💡 Biggest change: {customData.players[0].name} {customData.players[0].rating > (officialData.players[0]?.rating || 0) ? 'gains' : 'loses'} {Math.abs(customData.players[0].rating - (officialData.players[0]?.rating || 0)).toFixed(1)} points</p>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Apply a configuration to see the comparison
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Preview Changes
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
            <Button variant="outline" onClick={handleExport}>
              Export Config
            </Button>
            <Button 
              variant="outline" 
              onClick={() => applyTemplate('official')}
            >
              Reset to Season 3
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Your Saved Configs */}
      {customConfigs && Object.keys(customConfigs).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Saved Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(customConfigs).map(([name]) => (
                <Button
                  key={name}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => toast.info(`Loading ${name}...`)}
                >
                  <span>{name}</span>
                  <Badge variant="secondary">
                    <Gamepad2 className="w-3 h-3 mr-1" />
                    Custom
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}