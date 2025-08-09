"use client";

import { useState } from "react";
import { Info, X, Loader2 } from "lucide-react";
import { useConfigStore } from "@/stores/configStore";
import { cn } from "@/lib/utils";

interface ConfigurationIndicatorProps {
  className?: string;
}

export function ConfigurationIndicator({
  className,
}: ConfigurationIndicatorProps) {
  const { activeConfig, materializationStatus } = useConfigStore();
  const [showDetails, setShowDetails] = useState(false);
  const [dismissedMaterialization, setDismissedMaterialization] = useState<
    string | null
  >(null);

  if (!activeConfig) return null;

  const currentMaterializationStatus = materializationStatus[activeConfig.hash];
  const isCalculating =
    currentMaterializationStatus?.isLoading &&
    dismissedMaterialization !== activeConfig.hash;

  return (
    <>
      {/* Configuration Name Indicator */}
      <div
        className={cn("flex items-center gap-2 text-sm", className)}
        data-testid="config-indicator"
      >
        <span className="text-muted-foreground">Viewing:</span>
        <span className="font-medium">{activeConfig.name}</span>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="hover:bg-accent rounded-md p-1 transition-colors"
          aria-label="Configuration info"
        >
          <Info className="h-3 w-3" />
        </button>
      </div>

      {/* Configuration Details Tooltip */}
      {showDetails && (
        <div className="bg-popover absolute z-50 mt-2 max-w-sm rounded-lg border p-4 shadow-lg">
          <h4 className="mb-2 font-semibold">{activeConfig.name}</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Type:</span>{" "}
              {activeConfig.isOfficial ? "Official" : "Custom"}
            </div>
            <div>
              <span className="font-medium">Time Range:</span>{" "}
              {activeConfig.data.timeRange.startDate || "All time"} -{" "}
              {activeConfig.data.timeRange.endDate || "All time"}
            </div>
            <div>
              <span className="font-medium">Rating:</span> μ=
              {activeConfig.data.rating.initialMu}, σ=
              {activeConfig.data.rating.initialSigma}
            </div>
            <div>
              <span className="font-medium">Uma:</span>{" "}
              {activeConfig.data.scoring.uma.join(", ")}
            </div>
            <div>
              <span className="font-medium">Min Games:</span>{" "}
              {activeConfig.data.qualification.minGames}
            </div>
          </div>
          <button
            onClick={() => setShowDetails(false)}
            className="text-muted-foreground hover:text-foreground mt-3 text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* Materialization Loading Indicator */}
      {isCalculating && (
        <div className="bg-card animate-in slide-in-from-bottom-2 fixed right-4 bottom-4 flex items-center gap-3 rounded-lg border p-3 shadow-lg">
          <Loader2 className="text-primary h-4 w-4 animate-spin" />
          <span className="text-sm">Calculating ratings...</span>
          <button
            onClick={() => setDismissedMaterialization(activeConfig.hash)}
            className="hover:bg-accent rounded-md p-1 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </>
  );
}
