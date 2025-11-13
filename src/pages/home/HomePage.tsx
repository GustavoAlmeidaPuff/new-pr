import { Skeleton } from "../../components/loading";
import letreiroImg from "../../assets/letreiro.png";
import { PeriodizationSummaryCard } from "../../features/dashboard/components/PeriodizationSummaryCard";
import { VolumeTrendCard } from "../../features/dashboard/components/VolumeTrendCard";
import { WeeklyStreakCard } from "../../features/dashboard/components/WeeklyStreakCard";
import { PRHistoryTimeline } from "../../features/dashboard/components/PRHistoryTimeline";
import { useDashboardData } from "../../features/dashboard/hooks/useDashboardData";

export function HomePage() {
  const { data, loading } = useDashboardData();

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Skeleton className="h-12 w-40 rounded-3xl" />
          <Skeleton className="h-4 w-48 rounded-full" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-56 rounded-3xl" />
        </div>

      </section>
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

      <WeeklyStreakCard streak={data.weeklyStreak} />

      <PRHistoryTimeline items={data.prHistory} />
    </section>
  );
}

