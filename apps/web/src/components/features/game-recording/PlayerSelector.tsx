"use client";

import { useState, useMemo } from "react";
import { Check, X, Users, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, sanitizePlayerName } from "@/lib/utils";

export interface Player {
  id: string;
  display_name: string;
}

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayers: string[];
  onSelectionChange: (playerIds: string[]) => void;
  maxPlayers?: number;
  isLoading?: boolean;
  onPlayerCreated?: (player: Player) => void;
}

export function PlayerSelector({
  players,
  selectedPlayers,
  onSelectionChange,
  maxPlayers = 4,
  isLoading = false,
  onPlayerCreated,
}: PlayerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;
    const query = searchQuery.toLowerCase();
    return players.filter(p => p.display_name.toLowerCase().includes(query));
  }, [players, searchQuery]);

  // Compute sanitized name for display (with fallback to trimmed input)
  const sanitizedDisplayName = useMemo(() => {
    if (!searchQuery.trim()) return "";
    try {
      return sanitizePlayerName(searchQuery);
    } catch {
      return searchQuery.trim();
    }
  }, [searchQuery]);

  // Check if search query doesn't match any existing players
  const canCreateNewPlayer = useMemo(() => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase().trim();
    // Check if any player matches exactly (case-insensitive)
    return !players.some(p => p.display_name.toLowerCase().trim() === query);
  }, [searchQuery, players]);

  const handleCreatePlayer = async () => {
    if (!searchQuery.trim() || !canCreateNewPlayer) return;
    if (selectedPlayers.length >= maxPlayers) return;

    setIsCreatingPlayer(true);
    setCreateError(null);

    try {
      // Sanitize the name with comprehensive validation
      const sanitizedName = sanitizePlayerName(searchQuery);

      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: sanitizedName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create player");
      }

      const newPlayer = await response.json();

      // Clear search query
      setSearchQuery("");

      // Add the new player to selection
      if (selectedPlayers.length < maxPlayers) {
        onSelectionChange([...selectedPlayers, newPlayer.id]);
      }

      // Notify parent component about the new player
      if (onPlayerCreated) {
        onPlayerCreated(newPlayer);
      }
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create player"
      );
    } finally {
      setIsCreatingPlayer(false);
    }
  };

  const togglePlayer = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      onSelectionChange(selectedPlayers.filter(id => id !== playerId));
    } else if (selectedPlayers.length < maxPlayers) {
      onSelectionChange([...selectedPlayers, playerId]);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.display_name || "Unknown";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse">Loading players...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Players Display */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Selected Players ({selectedPlayers.length}/{maxPlayers})
            </CardTitle>
            {selectedPlayers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-muted-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedPlayers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Select {maxPlayers} players to start the game
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedPlayers.map(playerId => (
                <Badge
                  key={playerId}
                  variant="secondary"
                  className="items-center gap-1.5 py-1.5 pr-1.5 pl-3"
                >
                  <span>{getPlayerName(playerId)}</span>
                  <button
                    onClick={() => togglePlayer(playerId)}
                    className="hover:bg-muted rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {filteredPlayers.map(player => {
          const isSelected = selectedPlayers.includes(player.id);
          const isDisabled =
            !isSelected && selectedPlayers.length >= maxPlayers;

          return (
            <button
              key={player.id}
              onClick={() => togglePlayer(player.id)}
              disabled={isDisabled}
              className={cn(
                "relative flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-all",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
                isDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              <span className="font-medium">{player.display_name}</span>
              {isSelected && (
                <div className="bg-primary text-primary-foreground ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && searchQuery.trim() && (
        <div className="space-y-2">
          <p className="text-muted-foreground py-2 text-center text-sm">
            No players found matching &quot;{searchQuery}&quot;
          </p>
          {canCreateNewPlayer && (
            <div className="space-y-2">
              <Button
                onClick={handleCreatePlayer}
                disabled={
                  isCreatingPlayer || selectedPlayers.length >= maxPlayers
                }
                className="w-full"
                variant="outline"
              >
                {isCreatingPlayer ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create new player: &quot;{sanitizedDisplayName}&quot;
                  </>
                )}
              </Button>
              {createError && (
                <p className="text-destructive text-center text-sm">
                  {createError}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
