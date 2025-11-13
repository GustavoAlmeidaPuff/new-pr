import { PeriodizationSummaryCard } from "../../features/dashboard/components/PeriodizationSummaryCard";
import { QuickStatsGrid } from "../../features/dashboard/components/QuickStatsGrid";
import { VolumeTrendCard } from "../../features/dashboard/components/VolumeTrendCard";
import { useDashboardData } from "../../features/dashboard/hooks/useDashboardData";

export function HomePage() {
  const { data, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        Carregando métricas...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-text-muted">Acompanhe sua evolução</p>
        <h1 className="text-3xl font-semibold text-white">New PR</h1>
      </header>

      <PeriodizationSummaryCard periodization={data.periodization} />

      <VolumeTrendCard data={data.volumeSeries} />

      <QuickStatsGrid stats={data.quickStats} />
    </section>
  );
}

