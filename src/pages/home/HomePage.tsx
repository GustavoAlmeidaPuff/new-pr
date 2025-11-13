import { PeriodizationSummaryCard } from "../../features/dashboard/components/PeriodizationSummaryCard";
import { QuickStatsGrid } from "../../features/dashboard/components/QuickStatsGrid";
import { VolumeTrendCard } from "../../features/dashboard/components/VolumeTrendCard";
import { useDashboardData } from "../../features/dashboard/hooks/useDashboardData";
import letreiroImg from "../../assets/letreiro.png";

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
      <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <img 
          src={letreiroImg} 
          alt="New PR" 
          className="h-10 w-auto object-contain"
        />
        <p className="text-sm text-text-muted">Acompanhe sua evolução</p>
      </header>

      <PeriodizationSummaryCard periodization={data.periodization} />

      <VolumeTrendCard data={data.volumeSeries} />

      <QuickStatsGrid stats={data.quickStats} />
    </section>
  );
}

