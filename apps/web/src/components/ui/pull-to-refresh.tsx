"use client";

import React, { useState, useRef, useCallback, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({
  children,
  onRefresh,
  isRefreshing = false,
  threshold = 80,
  className = "",
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);

  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;

      // Only trigger if we're at the top of the container
      const container = containerRef.current;
      if (!container || container.scrollTop > 0) return;

      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (
        disabled ||
        isRefreshing ||
        !isPulling ||
        touchStartY.current === null
      )
        return;

      const container = containerRef.current;
      if (!container || container.scrollTop > 0) {
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - touchStartY.current);

      // Apply resistance after threshold
      const resistanceDistance =
        distance > threshold
          ? threshold + (distance - threshold) * 0.3
          : distance;

      setPullDistance(resistanceDistance);

      // Trigger haptic feedback when crossing threshold (if available)
      if (distance >= threshold && !isTriggered) {
        setIsTriggered(true);

        // Haptic feedback for supported devices
        if ("vibrate" in navigator) {
          navigator.vibrate(50);
        }
      } else if (distance < threshold && isTriggered) {
        setIsTriggered(false);
      }
    },
    [disabled, isRefreshing, isPulling, threshold, isTriggered]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) return;

    setIsPulling(false);
    touchStartY.current = null;

    if (pullDistance >= threshold) {
      // Trigger refresh
      try {
        await onRefresh();
      } catch (error) {
        console.error("Pull to refresh failed:", error);
      }
    }

    // Reset state
    setTimeout(() => {
      setPullDistance(0);
      setIsTriggered(false);
    }, 300);
  }, [disabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 20;
  const isActive = isTriggered || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? "none" : "transform 0.3s ease-out",
      }}
    >
      {/* Pull indicator */}
      <div
        className="bg-background/80 absolute top-0 right-0 left-0 z-10 flex items-center justify-center backdrop-blur-sm"
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          transform: `translateY(-${pullDistance}px)`,
          opacity: showIndicator ? pullProgress : 0,
          transition: isPulling ? "opacity 0.2s ease-out" : "all 0.3s ease-out",
        }}
      >
        <div className="flex flex-col items-center space-y-2">
          <div
            className={`border-primary/20 bg-background rounded-full border-2 p-3 shadow-lg ${
              isActive ? "border-primary bg-primary/10" : ""
            }`}
            style={{
              transform: `scale(${0.8 + pullProgress * 0.2})`,
              transition: "all 0.2s ease-out",
            }}
          >
            <RefreshCw
              className={`h-5 w-5 ${
                isActive ? "text-primary animate-spin" : "text-muted-foreground"
              }`}
              style={{
                transform: `rotate(${pullProgress * 180}deg)`,
                transition: isRefreshing ? "none" : "transform 0.2s ease-out",
              }}
            />
          </div>
          <div
            className={`text-xs font-medium ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {isRefreshing
              ? "Refreshing..."
              : isTriggered
                ? "Release to refresh"
                : "Pull to refresh"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ minHeight: "100%" }}>{children}</div>
    </div>
  );
}

// Hook for easier usage
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  return {
    onRefresh,
    PullToRefreshWrapper: PullToRefresh,
  };
}
