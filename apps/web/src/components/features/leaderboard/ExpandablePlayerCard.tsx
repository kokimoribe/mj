'use client'

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import type { Player } from "@/lib/queries"

interface ExpandablePlayerCardProps {
  player: Player
  rank: number
  isExpanded: boolean
  onToggle: () => void
  'data-testid'?: string
}

function ExpandablePlayerCardComponent({ player, isExpanded, onToggle, 'data-testid': dataTestId }: ExpandablePlayerCardProps) {
  const router = useRouter()

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/player/${player.id}`)
  }

  // Calculate rating change (this would come from the API in real implementation)
  const ratingChange = player.ratingChange || 0
  const isPositiveChange = ratingChange >= 0

  // Mock data for expanded view (would come from API)
  const winRate = 40 // percentage
  const avgPlacement = 2.1

  return (
    <Card 
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`${player.name} - Rank ${player.rating.toFixed(1)} - Click to ${isExpanded ? 'collapse' : 'expand'} details`}
      data-testid={dataTestId}
      className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:shadow-md active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isExpanded && "ring-2 ring-primary/20"
      )}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <CardContent className="p-0">
        {/* Main Row */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Player Name & Games */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{player.name}</h3>
              <p className="text-sm text-muted-foreground">
                {player.games} games
              </p>
            </div>

            {/* Rating & Change */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold font-mono tabular-nums">
                  {player.rating.toFixed(1)}
                </div>
                <div className={cn(
                  "flex items-center justify-end text-sm",
                  isPositiveChange ? "text-green-600" : "text-red-600"
                )}>
                  {isPositiveChange ? (
                    <>
                      <TrendingUp className="w-3 h-3 mr-1" aria-label="Rating increased" />
                      <span aria-label={`Rating increased by ${ratingChange.toFixed(1)} points`}>
                        ↑ {ratingChange.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 mr-1" aria-label="Rating decreased" />
                      <span aria-label={`Rating decreased by ${Math.abs(ratingChange).toFixed(1)} points`}>
                        ↓ {Math.abs(ratingChange).toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Expand Indicator */}
              <div className="ml-2" aria-hidden="true">
                {isExpanded ? 
                  <ChevronUp className="w-4 h-4 text-muted-foreground transition-transform" /> : 
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform hover:translate-y-0.5" />
                }
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t px-4 py-4 space-y-3 bg-muted/30">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Win Rate:</div>
                <div className="font-semibold">{winRate}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Placement:</div>
                <div className="font-semibold">{avgPlacement}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last Played:</div>
                <div className="font-semibold">
                  {player.lastGameDate ? new Date(player.lastGameDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Rating Trend Sparkline */}
            {player.ratingHistory && player.ratingHistory.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Rating Trend (Last 10 Games)</div>
                <div className="h-12 flex items-end gap-1">
                  {player.ratingHistory!.slice(-10).map((rating, i) => {
                    const minRating = Math.min(...player.ratingHistory!.slice(-10));
                    const maxRating = Math.max(...player.ratingHistory!.slice(-10));
                    const height = maxRating === minRating ? 50 : 
                      ((rating - minRating) / (maxRating - minRating)) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 rounded-t"
                        style={{ height: `${Math.max(height, 10)}%` }}
                        title={`Rating: ${rating.toFixed(1)}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleProfileClick}
            >
              View Full Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const ExpandablePlayerCard = React.memo(ExpandablePlayerCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.player.id === nextProps.player.id &&
    prevProps.player.rating === nextProps.player.rating &&
    prevProps.player.games === nextProps.player.games &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.rank === nextProps.rank
  )
})