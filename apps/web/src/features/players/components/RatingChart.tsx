"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { safeFormatNumber } from "@/lib/utils/data-validation";

interface RatingDataPoint {
  date: string;
  rating: number;
  gameId: string;
  change: number;
}

interface RatingChartProps {
  data: RatingDataPoint[];
}

export function RatingChart({ data }: RatingChartProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(
    null
  );
  const [isTouchActive, setIsTouchActive] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

  // Detect touch device on client side only (avoid hydration mismatch)
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Handle auto-dismiss when tooltip becomes active on touch devices
  useEffect(() => {
    if (activeTooltipIndex !== null && isTouchDevice && !isTouchActive) {
      // Clear any existing timeout
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }

      // Dismiss tooltip at 1200ms to sync with hand history fade-out (300ms duration)
      // Hand history: 200ms fade-in + 1000ms visible + 300ms fade-out = 1500ms total
      // Tooltip: shows until 1200ms, then fades for 300ms, completes at 1500ms
      tooltipTimeoutRef.current = setTimeout(() => {
        setActiveTooltipIndex(null);
      }, 1200);
    }

    // If touch is held, cancel the timer
    if (isTouchActive && tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [activeTooltipIndex, isTouchDevice, isTouchActive]);

  // Filter out invalid data points
  const validData = useMemo(() => {
    return data.filter(
      d =>
        isFinite(d.rating) &&
        !isNaN(d.rating) &&
        d.date &&
        !isNaN(new Date(d.date).getTime())
    );
  }, [data]);

  const chartData = useMemo(() => {
    // Group games by date to handle multiple games per day
    const gamesByDate = new Map<string, typeof validData>();

    validData.forEach(point => {
      const dateKey = format(new Date(point.date), "yyyy-MM-dd");
      if (!gamesByDate.has(dateKey)) {
        gamesByDate.set(dateKey, []);
      }
      gamesByDate.get(dateKey)!.push(point);
    });

    // Create chart data with unique keys for multiple games on same day
    return validData.map((point, index) => {
      const dateKey = format(new Date(point.date), "yyyy-MM-dd");
      const gamesOnSameDay = gamesByDate.get(dateKey) || [];
      const gameIndexOnDay = gamesOnSameDay.findIndex(
        g => g.gameId === point.gameId
      );

      return {
        ...point,
        dataIndex: index,
        displayDate: format(new Date(point.date), "MMM d"),
        // Add time suffix for multiple games on same day
        chartKey:
          gamesOnSameDay.length > 1
            ? `${format(new Date(point.date), "MMM d")} (${gameIndexOnDay + 1}/${gamesOnSameDay.length})`
            : format(new Date(point.date), "MMM d"),
        isLatest: index === validData.length - 1,
        gamesOnSameDay: gamesOnSameDay.length,
        gameIndexOnDay: gameIndexOnDay + 1,
      };
    });
  }, [validData]);

  const ratings = validData.map(d => d.rating);
  const minRating = ratings.length > 0 ? Math.min(...ratings) - 2 : 0;
  const maxRating = ratings.length > 0 ? Math.max(...ratings) + 2 : 100;

  if (validData.length < 2) {
    return (
      <div className="h-48 w-full" data-testid="rating-chart">
        <div className="bg-muted text-muted-foreground flex h-full items-center justify-center rounded">
          Need more games for chart
        </div>
      </div>
    );
  }

  const CustomDot = (props: {
    cx?: number;
    cy?: number;
    payload?: { isLatest?: boolean };
    index?: number;
  }) => {
    const { cx, cy, payload, index } = props;
    if (!cx || !cy) return <></>; // Return empty fragment instead of null

    // All points green (#10b981) as per spec
    const greenColor = "#10b981";

    if (payload?.isLatest) {
      return (
        <g key={`dot-${index}`}>
          <circle cx={cx} cy={cy} r={6} fill={greenColor} />
          <circle cx={cx} cy={cy} r={3} fill="white" />
        </g>
      );
    }

    return (
      <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill={greenColor} />
    );
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        date: string;
        rating: number;
        change: number;
        dataIndex?: number;
        gamesOnSameDay?: number;
        gameIndexOnDay?: number;
      };
    }>;
  }) => {
    // On touch devices, only show if activeTooltipIndex matches
    // On desktop, show normally when active
    const dataIndex = payload?.[0]?.payload?.dataIndex;
    const shouldShow =
      active &&
      payload &&
      payload[0] &&
      (!isTouchDevice || (isTouchDevice && activeTooltipIndex === dataIndex));

    if (shouldShow) {
      const data = payload[0].payload;
      return (
        <div className="bg-background rounded border p-2 shadow-lg transition-opacity duration-[300ms]">
          <p className="text-sm font-medium">
            {format(new Date(data.date), "PPP")}
          </p>
          {data.gamesOnSameDay && data.gamesOnSameDay > 1 && (
            <p className="text-muted-foreground text-xs">
              Game {data.gameIndexOnDay} of {data.gamesOnSameDay} on this day
            </p>
          )}
          <p className="text-sm">
            Rating:{" "}
            <span className="font-mono font-bold">
              {safeFormatNumber(data.rating, 1)}
            </span>
          </p>
          {data.change !== 0 && isFinite(data.change) && (
            <p className="text-sm">
              Change:
              <span
                className={`ml-1 font-mono ${data.change > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {data.change > 0 ? "+" : ""}
                {safeFormatNumber(data.change, 1)}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="h-48 w-full select-none"
      data-testid="rating-chart"
      style={{
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        userSelect: "none",
        touchAction: "manipulation",
      }}
      onTouchStart={() => {
        if (isTouchDevice) {
          setIsTouchActive(true);
        }
      }}
      onTouchEnd={() => {
        if (isTouchDevice) {
          setIsTouchActive(false);
        }
      }}
      onTouchCancel={() => {
        if (isTouchDevice) {
          setIsTouchActive(false);
        }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          onClick={e => {
            // On touch devices, set the active tooltip index
            if (e && e.activeTooltipIndex !== undefined && isTouchDevice) {
              setActiveTooltipIndex(e.activeTooltipIndex);
            }
          }}
          onMouseMove={e => {
            // On desktop, track active index for tooltip
            if (!isTouchDevice && e && e.activeTooltipIndex !== undefined) {
              setActiveTooltipIndex(e.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => {
            // On desktop, clear tooltip when mouse leaves
            if (!isTouchDevice) {
              setActiveTooltipIndex(null);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="chartKey"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minRating, maxRating]}
            tick={{ fontSize: 12 }}
            tickFormatter={value => value.toFixed(1)}
            className="text-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#10b981"
            strokeWidth={2}
            dot={CustomDot}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
