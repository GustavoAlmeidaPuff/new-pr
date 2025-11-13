import { useCallback, useMemo, useRef, useState } from "react";

import { Share2 } from "lucide-react";
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
import { toPng } from "html-to-image";

import type { ExerciseSummary } from "..";
import { formatWeight } from "../utils/formatWeight";
import { useAuth } from "../../../contexts/AuthContext";

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
  const { user } = useAuth();
  const chartRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isPreparingShare, setIsPreparingShare] = useState(false);
  const userName = useMemo(() => user?.displayName?.trim() || "Atleta New PR", [user?.displayName]);

  const renderTrendChart = ({ animate = true }: { animate?: boolean } = {}) => {
    const shouldAnimate = animate && !isPreparingShare;

    return (
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
          isAnimationActive={shouldAnimate}
          animationDuration={shouldAnimate ? 800 : 0}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
  };

  const handleShareChart = useCallback(async () => {
    if (!chartRef.current) {
      return;
    }

    try {
      setIsPreparingShare(true);
      setIsSharing(true);

      const node = chartRef.current;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 250));

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: window.devicePixelRatio || 1,
        filter: (domNode) => {
          if (!(domNode instanceof HTMLElement)) {
            return true;
          }

          return domNode.dataset.shareExclude !== "true";
        },
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const sanitizedName = exercise.name.toLowerCase().replace(/\s+/g, "-");
      const fileName = `evolucao-${sanitizedName || "exercicio"}.png`;
      const file = new File([blob], fileName, { type: blob.type || "image/png" });

      const navigatorWithShare = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };

      if (
        navigatorWithShare.share &&
        navigatorWithShare.canShare &&
        navigatorWithShare.canShare({ files: [file] })
      ) {
        await navigatorWithShare.share({
          title: `Evolução de carga - ${exercise.name}`,
          text: `Essa foi a evolução de ${userName} no exercício ${exercise.name}.`,
          files: [file],
        });
        return;
      }

      if (navigatorWithShare.share) {
        await navigatorWithShare.share({
          title: `Evolução de carga - ${exercise.name}`,
          text: `Veja minha evolução no ${exercise.name}!`,
          url: dataUrl,
        });
        return;
      }

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      link.rel = "noopener";
      link.target = "_blank";
      document.body.append(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Não foi possível compartilhar o gráfico.", error);
    } finally {
      setIsPreparingShare(false);
      setIsSharing(false);
    }
  }, [exercise.name, userName]);

  return (
    <div className="space-y-5">
      <article className="space-y-5 rounded-3xl border border-border bg-background-card p-5">
        <header className="flex items-start justify-between gap-4">
          <div>
          <p className="text-xs font-medium uppercase tracking-wide text-metric-load">Evolução de carga</p>
          <h2 className="text-xl font-semibold text-white">{exercise.name}</h2>
          </div>
          <button
            type="button"
            onClick={handleShareChart}
            disabled={isSharing}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-white transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Compartilhar gráfico de evolução"
            title="Compartilhar gráfico"
            data-share-exclude="true"
          >
            <Share2 className="h-5 w-5" aria-hidden />
          </button>
        </header>
        <div
          ref={chartRef}
          className="relative w-full"
          style={{
            minHeight: isPreparingShare ? "22rem" : "16rem",
            height: isPreparingShare ? "auto" : "16rem",
          }}
        >
          <div
            className="h-64 w-full transition-opacity duration-100"
            style={{ opacity: isPreparingShare ? 0 : 1 }}
            data-share-exclude={isPreparingShare ? "true" : "false"}
          >
            {renderTrendChart()}
          </div>

          {isPreparingShare ? (
            <div className="absolute inset-0 flex h-full w-full flex-col justify-start rounded-2xl border border-border/60 bg-[#0B131D] p-5 text-white shadow-inner shadow-black/30">
              <p className="text-sm font-medium text-white/90">
                Essa foi a evolução de{" "}
                <span className="font-semibold text-white">{userName}</span> no exercício{" "}
                <span className="font-semibold text-white">{exercise.name}</span>.
              </p>
              <div className="mt-4 flex-1">
                <div className="h-full w-full">{renderTrendChart({ animate: false })}</div>
              </div>
              <p className="mt-6 text-center text-xs font-semibold uppercase tracking-wide text-white/60">
                Use o New PR para ter os seus recordes pessoais na palma da sua mão
              </p>
            </div>
          ) : null}
        </div>
      </article>
      <article className="space-y-5 rounded-3xl border border-border bg-background-card p-5">
        <header>
          <p className="text-xs font-medium uppercase tracking-wide text-metric-volume">Volume total</p>
          <h2 className="text-xl font-semibold text-white">{exercise.name}</h2>
        </header>
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
      </article>
    </div>
  );
}

