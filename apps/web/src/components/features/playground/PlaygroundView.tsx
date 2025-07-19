'use client'

import { useState } from 'react'
import { useConfigStore, type RatingConfiguration } from '@/stores/configStore'
import { useConfigurationResults } from '@/lib/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Settings, RefreshCw, Save, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function PlaygroundView() {
  const { saveCustomConfig } = useConfigStore()
  const [isApplying, setIsApplying] = useState(false)
  const [currentConfig, setCurrentConfig] = useState({
    mu: 25,
    sigma: 8.33,
    beta: 4.17,
    tau: 0.25,
    draw_probability: 0.0
  })
  
  // Create default full configuration
  const defaultFullConfig: RatingConfiguration = {
    timeRange: {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      name: 'Playground Test'
    },
    rating: {
      initialMu: currentConfig.mu,
      initialSigma: currentConfig.sigma,
      confidenceFactor: 3,
      decayRate: currentConfig.tau
    },
    scoring: {
      oka: 30000,
      uma: [15, 5, -5, -15]
    },
    weights: {
      divisor: 1000,
      min: 0.2,
      max: 0.8
    },
    qualification: {
      minGames: 10,
      dropWorst: 0
    }
  }
  
  const { data, isLoading, error, refetch } = useConfigurationResults(
    isApplying ? defaultFullConfig : defaultFullConfig
  )
  
  const updateConfig = (updates: Partial<typeof currentConfig>) => {
    setCurrentConfig(prev => ({ ...prev, ...updates }))
  }

  const handleApply = async () => {
    setIsApplying(true)
    await refetch()
    toast.success('Configuration applied!')
  }

  const handleReset = () => {
    updateConfig({
      mu: 25,
      sigma: 8.33,
      beta: 4.17,
      tau: 0.25,
      draw_probability: 0.0
    })
    setIsApplying(false)
    toast.info('Configuration reset to defaults')
  }

  const handleSave = () => {
    const configName = 'Custom Config ' + new Date().toISOString()
    
    // Create a full RatingConfiguration object
    const fullConfig: RatingConfiguration = {
      timeRange: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        name: configName
      },
      rating: {
        initialMu: currentConfig.mu,
        initialSigma: currentConfig.sigma,
        confidenceFactor: 3,
        decayRate: currentConfig.tau
      },
      scoring: {
        oka: 30000,
        uma: [15, 5, -5, -15]
      },
      weights: {
        divisor: 1000,
        min: 0.2,
        max: 0.8
      },
      qualification: {
        minGames: 10,
        dropWorst: 0
      }
    }
    
    saveCustomConfig(configName, fullConfig)
    toast.success('Configuration saved!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rating Configuration Playground
          </CardTitle>
          <CardDescription>
            Experiment with different OpenSkill parameters to see how they affect ratings
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mu (Initial Skill) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="mu">Initial Skill (μ)</Label>
              <span className="text-sm font-mono">{currentConfig.mu.toFixed(2)}</span>
            </div>
            <Slider
              id="mu"
              min={0}
              max={50}
              step={0.5}
              value={[currentConfig.mu]}
              onValueChange={([value]) => updateConfig({ mu: value })}
            />
            <p className="text-xs text-muted-foreground">
              Starting skill level for new players
            </p>
          </div>

          {/* Sigma (Initial Uncertainty) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sigma">Initial Uncertainty (σ)</Label>
              <span className="text-sm font-mono">{currentConfig.sigma.toFixed(2)}</span>
            </div>
            <Slider
              id="sigma"
              min={1}
              max={15}
              step={0.1}
              value={[currentConfig.sigma]}
              onValueChange={([value]) => updateConfig({ sigma: value })}
            />
            <p className="text-xs text-muted-foreground">
              How uncertain we are about new player skill
            </p>
          </div>

          {/* Beta (Performance Variance) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="beta">Performance Variance (β)</Label>
              <span className="text-sm font-mono">{currentConfig.beta.toFixed(2)}</span>
            </div>
            <Slider
              id="beta"
              min={1}
              max={10}
              step={0.1}
              value={[currentConfig.beta]}
              onValueChange={([value]) => updateConfig({ beta: value })}
            />
            <p className="text-xs text-muted-foreground">
              Expected variance in player performance
            </p>
          </div>

          {/* Tau (Dynamic Factor) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tau">Dynamic Factor (τ)</Label>
              <span className="text-sm font-mono">{currentConfig.tau.toFixed(3)}</span>
            </div>
            <Slider
              id="tau"
              min={0}
              max={1}
              step={0.01}
              value={[currentConfig.tau]}
              onValueChange={([value]) => updateConfig({ tau: value })}
            />
            <p className="text-xs text-muted-foreground">
              How much ratings change over time
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Apply Configuration
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Preview */}
      {isApplying && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview Results</CardTitle>
            <CardDescription>
              How ratings would look with this configuration
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
            ) : data ? (
              <div className="space-y-3">
                {data.players.slice(0, 5).map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">{player.rating.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        μ={player.mu.toFixed(1)} σ={player.sigma.toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Showing top 5 players
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Understanding the Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Conservative Rating:</strong> μ - 3σ
            <p className="text-muted-foreground">
              The rating shown in leaderboards, represents a 99.7% confidence lower bound
            </p>
          </div>
          <div>
            <strong>Higher β:</strong> More volatile ratings, faster adaptation
            <p className="text-muted-foreground">
              Good for games with high luck factor
            </p>
          </div>
          <div>
            <strong>Higher τ:</strong> Ratings drift more over time
            <p className="text-muted-foreground">
              Helps inactive players&apos; uncertainty increase
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}