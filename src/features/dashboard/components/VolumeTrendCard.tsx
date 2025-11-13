import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardVolumePoint } from "..";

type VolumeTrendCardProps = {
  data: DashboardVolumePoint[];
};

const formatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function VolumeTrendCard({ data }: VolumeTrendCardProps) {
  return (
    <article className="space-y-5 rounded-3xl border border-border bg-background-card p-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-metric-volume">Volume total (kg)</p>
          <h2 className="text-xl font-semibold text-white">Aumento semanal</h2>
        </div>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7B5CFF" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#7B5CFF" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1E2B3E" strokeDasharray="4 6" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9FB5CA", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              tickFormatter={(value) => formatter.format(value as number)}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9FB5CA", fontSize: 12 }}
              dx={-8}
            />
            <Tooltip
              cursor={{ strokeDasharray: "4 2", stroke: "#0F2836" }}
              contentStyle={{
                backgroundColor: "#0E1621",
                borderRadius: 16,
                border: "1px solid #1E2B3E",
                color: "#E5F4FF",
              }}
              formatter={(value) => [`${formatter.format(Number(value))} kg`, "Volume"]}
            />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#7B5CFF"
                strokeWidth={3}
                dot={{ r: 4, fill: "#7B5CFF", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#7B5CFF" }}
              />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

