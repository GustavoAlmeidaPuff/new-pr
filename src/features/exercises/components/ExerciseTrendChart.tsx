import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

import type { ExerciseSummary } from "..";
import { formatWeight } from "../utils/formatWeight";

type ExerciseTrendChartProps = {
  exercise: ExerciseSummary;
};

type ExerciseTrendTooltipProps = TooltipProps<number, string> & {
  weightType?: ExerciseSummary["weightType"];
  history: ExerciseSummary["history"];
};

function ExerciseTrendTooltip({
  active,
  payload,
  label,
  weightType,
  history,
}: ExerciseTrendTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const dataPoint = payload[0]?.payload as {
    id?: string;
    weight: number;
    reps?: number;
  };

  const repsFromPayload = dataPoint?.reps;
  const repsFromHistory = dataPoint?.id
    ? history.find((item) => item.id === dataPoint.id)?.reps
    : undefined;
  const reps = repsFromPayload ?? repsFromHistory;

  const parsedDate =
    typeof label === "string" || typeof label === "number"
      ? new Date(label).toLocaleDateString("pt-BR")
      : "";

  return (
    <div
      style={{
        backgroundColor: "#0E1621",
        borderRadius: 16,
        border: "1px solid #1E2B3E",
        color: "#E5F4FF",
        padding: "12px 16px",
        minWidth: 160,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>{parsedDate}</p>
      <p style={{ margin: "8px 0 0" }}>
        Carga: {formatWeight(Number(dataPoint?.weight ?? 0), weightType)}
      </p>
      <p style={{ margin: "4px 0 0" }}>Repetições: {reps != null ? reps : "-"}</p>
    </div>
  );
}

export function ExerciseTrendChart({ exercise }: ExerciseTrendChartProps) {
  return (
    <article className="space-y-5 rounded-3xl border border-border bg-background-card p-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Evolução de carga</p>
        <h2 className="text-xl font-semibold text-white">{exercise.name}</h2>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={exercise.trendSeries}>
            <defs>
              <linearGradient id="exerciseWeightGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#09C3F7" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#09C3F7" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1E2B3E" strokeDasharray="4 6" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9FB5CA", fontSize: 12 }}
              dy={8}
            />
            <YAxis
              tickFormatter={(value) => formatWeight(Number(value), exercise.weightType)}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9FB5CA", fontSize: 12 }}
              dx={-8}
            />
            <Tooltip
              cursor={{ stroke: "#24354A" }}
              content={(props) => (
                <ExerciseTrendTooltip
                  {...props}
                  weightType={exercise.weightType}
                  history={exercise.history}
                />
              )}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#09C3F7"
              strokeWidth={3}
              dot={{ r: 4, fill: "#09C3F7", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#09C3F7" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

