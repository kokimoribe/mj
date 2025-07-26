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
    return validData.map((point, index) => ({
      ...point,
      displayDate: format(new Date(point.date), "MMM d"),
      isLatest: index === validData.length - 1,
    }));
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
  }) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return <></>; // Return empty fragment instead of null

    // All points green (#10b981) as per spec
    const greenColor = "#10b981";

    if (payload?.isLatest) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill={greenColor} />
          <circle cx={cx} cy={cy} r={3} fill="white" />
        </g>
      );
    }

    return <circle cx={cx} cy={cy} r={4} fill={greenColor} />;
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
    <div className="h-48 w-full" data-testid="rating-chart">
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
