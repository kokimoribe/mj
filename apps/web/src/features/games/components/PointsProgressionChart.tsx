"use client";

import { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { type Seat } from "@/lib/mahjong";

interface ChartDataPoint {
  hand: number;
  east: number;
  south: number;
  west: number;
  north: number;
}

interface PointsProgressionChartProps {
  data: ChartDataPoint[];
  playerNames: Record<Seat, string>;
  onHandClick?: (handNumber: number) => void;
}

// Seat colors matching the live game page
const SEAT_COLORS: Record<Seat, string> = {
  east: "#ef4444", // red
  south: "#22c55e", // green
  west: "#3b82f6", // blue
  north: "#a855f7", // purple
};

export function PointsProgressionChart({
  data,
  playerNames,
  onHandClick,
}: PointsProgressionChartProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeTooltipLabel, setActiveTooltipLabel] = useState<number | null>(
    null
  );
  const [hasInteracted, setHasInteracted] = useState(false);

  // Detect touch device on client side only (avoid hydration mismatch)
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Calculate Y-axis domain based on data
  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 50000];

    let min = Infinity;
    let max = -Infinity;

    for (const point of data) {
      for (const seat of ["east", "south", "west", "north"] as const) {
        if (point[seat] < min) min = point[seat];
        if (point[seat] > max) max = point[seat];
      }
    }

    // Add some padding
    const padding = (max - min) * 0.1;
    return [
      Math.floor((min - padding) / 1000) * 1000,
      Math.ceil((max + padding) / 1000) * 1000,
    ];
  }, [data]);

  if (data.length < 2) {
    return (
      <div className="h-64 w-full" data-testid="points-chart">
        <div className="bg-muted text-muted-foreground flex h-full items-center justify-center rounded">
          Need more hands for chart
        </div>
      </div>
    );
  }

  const DynamicLegend = () => {
    // Find the data for the active hand
    const activeData =
      activeTooltipLabel !== null
        ? data.find(d => d.hand === activeTooltipLabel)
        : null;
    const previousData =
      activeTooltipLabel !== null && activeTooltipLabel > 0
        ? data.find(d => d.hand === activeTooltipLabel - 1)
        : null;

    // Determine which seats to show and in what order
    const seats = ["east", "south", "west", "north"] as const;
    const sortedSeats = activeData
      ? [...seats].sort((a, b) => activeData[b] - activeData[a])
      : seats;

    return (
      <div className="mt-2 select-none">
        {/* Player info - always visible, enhanced when active */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {sortedSeats.map(seat => {
            const score = activeData ? activeData[seat] : null;
            const delta =
              previousData && score !== null ? score - previousData[seat] : 0;
            const showDelta = previousData !== null && score !== null;

            // Determine color for delta
            let deltaColor = "text-muted-foreground"; // gray for ±0
            if (delta > 0) {
              deltaColor = "text-green-600";
            } else if (delta < 0) {
              deltaColor = "text-red-600";
            }

            return (
              <div
                key={seat}
                className="flex items-center gap-2 text-sm transition-all duration-300"
              >
                {/* Color dot */}
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: SEAT_COLORS[seat] }}
                />

                {/* Player name */}
                <span className="font-medium">{playerNames[seat]}</span>

                {/* Score (only when active) */}
                {score !== null && (
                  <div className="animate-in fade-in flex items-center gap-1.5 duration-300">
                    <span className="text-sm">{score.toLocaleString()}</span>
                    {showDelta && (
                      <span className={`text-xs ${deltaColor}`}>
                        ({delta > 0 ? "+" : delta === 0 ? "±" : ""}
                        {delta.toLocaleString()})
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full" data-testid="points-chart">
      <div
        className="h-64 select-none [&_svg]:outline-none [&_svg]:focus:outline-none"
        style={{
          WebkitTapHighlightColor: "transparent",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          userSelect: "none",
          touchAction: "manipulation",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            onClick={e => {
              if (e && e.activeLabel !== undefined) {
                // Mark as interacted
                setHasInteracted(true);
                // On touch devices, set the active tooltip label
                if (isTouchDevice) {
                  setActiveTooltipLabel(Number(e.activeLabel));
                }
                if (onHandClick) {
                  onHandClick(Number(e.activeLabel));
                }
              }
            }}
            onMouseMove={e => {
              // On desktop, track active label for tooltip
              if (!isTouchDevice && e && e.activeLabel !== undefined) {
                setHasInteracted(true);
                setActiveTooltipLabel(Number(e.activeLabel));
              }
            }}
            onMouseLeave={() => {
              // On desktop, clear tooltip when mouse leaves
              if (!isTouchDevice) {
                setActiveTooltipLabel(null);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="hand"
              tick={{ fontSize: 12 }}
              tickFormatter={value => (value === 0 ? "Start" : String(value))}
              className="text-muted-foreground"
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 12 }}
              tickFormatter={value =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
              }
              className="text-muted-foreground"
              width={30}
            />
            {activeTooltipLabel !== null && (
              <ReferenceLine
                x={activeTooltipLabel}
                stroke="#eab308"
                strokeWidth={3}
                strokeOpacity={0.8}
              />
            )}
            <Line
              type="linear"
              dataKey="east"
              stroke={SEAT_COLORS.east}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="linear"
              dataKey="south"
              stroke={SEAT_COLORS.south}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="linear"
              dataKey="west"
              stroke={SEAT_COLORS.west}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="linear"
              dataKey="north"
              stroke={SEAT_COLORS.north}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <DynamicLegend />
      <p
        className={`text-muted-foreground mt-0.5 text-center text-xs transition-all duration-500 ease-out ${
          hasInteracted ? "mt-0 max-h-0 opacity-0" : "max-h-10 opacity-100"
        }`}
      >
        {onHandClick
          ? "Tap on a point to jump to that hand in the history below"
          : "Tap on the points in the line graph to see score details"}
      </p>
    </div>
  );
}
