"use client";

import { useMemo } from "react";
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
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      displayDate: format(new Date(point.date), "MMM d"),
      isLatest: index === data.length - 1,
    }));
  }, [data]);

  const minRating = Math.min(...data.map(d => d.rating)) - 2;
  const maxRating = Math.max(...data.map(d => d.rating)) + 2;

  if (data.length < 2) {
    return (
      <div className="bg-muted text-muted-foreground flex h-48 items-center justify-center rounded">
        Not enough data to show rating progression
      </div>
    );
  }

  const CustomDot = (props: {
    cx: number;
    cy: number;
    payload: { isLatest?: boolean };
  }) => {
    const { cx, cy, payload } = props;

    if (payload.isLatest) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="hsl(var(--primary))" />
          <circle cx={cx} cy={cy} r={3} fill="white" />
        </g>
      );
    }

    return <circle cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" />;
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { date: string; rating: number; change: number };
    }>;
  }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background rounded border p-2 shadow-lg">
          <p className="text-sm font-medium">
            {format(new Date(data.date), "PPP")}
          </p>
          <p className="text-sm">
            Rating:{" "}
            <span className="font-mono font-bold">
              {data.rating.toFixed(1)}
            </span>
          </p>
          {data.change !== 0 && (
            <p className="text-sm">
              Change:
              <span
                className={`ml-1 font-mono ${data.change > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {data.change > 0 ? "+" : ""}
                {data.change.toFixed(1)}
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            domain={[minRating, maxRating]}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={CustomDot as any}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
