"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { NewLostLinkRecord } from "@/features/backlinks/service";

interface NewLostLinksChartProps {
  data: NewLostLinkRecord[];
}

export function NewLostLinksChart({ data }: NewLostLinksChartProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Link Velocity (Last 14 Days)
        </h3>
        <p className="text-xs text-neutral-500">
          Daily new backlinks discovered vs lost or removed inbound hyperlinks.
        </p>
      </div>

      <div className="h-72 w-full pt-2">
        {data.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-neutral-500">
            No link velocity data available. Click Refresh above with a valid DataForSEO key to
            fetch live trend data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888" }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#888888" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(23, 23, 23, 0.95)",
                  borderColor: "#333",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar dataKey="newLinks" name="New Links" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lostLinks" name="Lost Links" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
