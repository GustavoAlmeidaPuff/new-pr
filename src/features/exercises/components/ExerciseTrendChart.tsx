import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";

import type { ExerciseSummary } from "..";
import { formatWeight } from "../utils/formatWeight";

type ExerciseTrendChartProps = {
  exercise: ExerciseSummary;
};

type ExerciseTrendTooltipProps = TooltipContentProps<number, string | number> & {
  weightType?: ExerciseSummary["weightType"];
  history: ExerciseSummary["history"];
};

type ExerciseVolumeTooltipProps = TooltipContentProps<number, string | number>;

const volumeFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

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
      <p style={{ margin: "8px 0 0", color: "#35D0FF", fontWeight: 600 }}>
        Carga:{" "}
        <span style={{ color: "#E5F4FF", fontWeight: 500 }}>
          {formatWeight(Number(dataPoint?.weight ?? 0), weightType)}
        </span>
      </p>
      <p style={{ margin: "4px 0 0", color: "#2CD889", fontWeight: 600 }}>
        Repetições:{" "}
        <span style={{ color: "#E5F4FF", fontWeight: 500 }}>
          {reps != null ? reps : "-"}
        </span>
      </p>
    </div>
  );
}

function ExerciseVolumeTooltip({ active, payload, label }: ExerciseVolumeTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const dataPoint = payload[0]?.payload as {
    volume: number;
  };

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
      <p style={{ margin: "8px 0 0", color: "#7B5CFF", fontWeight: 600 }}>
        Volume:{" "}
        <span style={{ color: "#E5F4FF", fontWeight: 500 }}>
          {volumeFormatter.format(Number(dataPoint?.volume ?? 0))} kg·rep
        </span>
      </p>
    </div>
  );
}

export function ExerciseTrendChart({ exercise }: ExerciseTrendChartProps) {
  return (
    <article className="space-y-5 rounded-3xl border border-border bg-background-card p-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-metric-load">Evolução de carga</p>
        <h2 className="text-xl font-semibold text-white">{exercise.name}</h2>
      </header>
      <div className="space-y-8">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={exercise.trendSeries}>
              <defs>
                <linearGradient id="exerciseWeightGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#35D0FF" stopOpacity={0.65} />
                  <stop offset="100%" stopColor="#35D0FF" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#1E2B3E" strokeDasharray="4 6" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                }
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9FB5CA", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                tickFormatter={(value) =>
                  formatWeight(Number(value), exercise.weightType, { includeSideLabel: false })
                }
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9FB5CA", fontSize: 12 }}
                dx={-8}
              />
              <Tooltip
                cursor={{ stroke: "#24354A" }}
                content={(props: TooltipContentProps<number, string | number>) => (
                  <ExerciseTrendTooltip
                    active={props.active}
                    payload={props.payload}
                    label={props.label}
                    coordinate={props.coordinate}
                    accessibilityLayer={props.accessibilityLayer}
                    activeIndex={props.activeIndex}
                    weightType={exercise.weightType}
                    history={exercise.history}
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#35D0FF"
                strokeWidth={2}
                fill="url(#exerciseWeightGradient)"
                activeDot={{ r: 5, fill: "#35D0FF" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-metric-volume">Volume total</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={exercise.trendSeries}>
                <defs>
                  <linearGradient id="exerciseVolumeGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7B5CFF" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#7B5CFF" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E2B3E" strokeDasharray="4 6" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                  }
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9FB5CA", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  tickFormatter={(value) => volumeFormatter.format(Number(value))}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9FB5CA", fontSize: 12 }}
                  dx={-8}
                />
                <Tooltip
                  cursor={{ stroke: "#24354A" }}
                  content={(props: TooltipContentProps<number, string | number>) => (
                    <ExerciseVolumeTooltip
                      active={props.active}
                      payload={props.payload}
                      label={props.label}
                      coordinate={props.coordinate}
                      accessibilityLayer={props.accessibilityLayer}
                      activeIndex={props.activeIndex}
                    />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#7B5CFF"
                  strokeWidth={2}
                  fill="url(#exerciseVolumeGradient)"
                  activeDot={{ r: 5, fill: "#7B5CFF" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </article>
  );
}

