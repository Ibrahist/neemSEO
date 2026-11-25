"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RankHistoryRecord } from "@/features/rank-tracking/repository";

interface RankHistoryChartProps {
  keyword: string;
  data: RankHistoryRecord[];
}

export function RankHistoryChart({ keyword, data }: RankHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
        No ranking history recorded yet.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d.checkDate.slice(5), // MM-DD
    position: d.position ?? 100,
  }));

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Rank Movement: <span className="text-emerald-600 font-bold">&quot;{keyword}&quot;</span>
        </h3>
        <span className="text-xs text-neutral-500 font-mono">
          Latest: #{data[data.length - 1]?.position ?? "100+"}
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis
              reversed={true}
              domain={[1, 50]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-neutral-900 text-white text-xs px-2.5 py-1.5 rounded shadow">
                      <p className="font-medium">Date: {payload[0].payload.date}</p>
                      <p className="text-emerald-400 font-bold">Rank: #{payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="position"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10b981" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
