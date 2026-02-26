import { Skeleton } from "../../components/loading";
import { useAuth } from "../../contexts/AuthContext";
import { PeriodizationCard } from "../../features/periodizations/components/PeriodizationCard";
import { usePeriodizationsData } from "../../features/periodizations/hooks/usePeriodizationsData";
import { activatePeriodization } from "../../services/periodizations.service";

export function PeriodizationsPage() {
  const { user } = useAuth();
  const { periodizations, loading } = usePeriodizationsData();

  const handleActivate = async (id: string) => {
    if (!user) return;
    try {
      await activatePeriodization(user.uid, id);
    } catch (error) {
      console.error("Erro ao ativar periodização:", error);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-48 rounded-full" />
          <Skeleton className="h-4 w-72 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-3xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-white">Periodizações</h1>
        <p className="text-sm text-text-muted">
          Escolha o ciclo atual. Os PRs ficam separados por periodização.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {periodizations.map((periodization) => (
          <PeriodizationCard
            key={periodization.id}
            periodization={periodization}
            onActivate={handleActivate}
          />
        ))}
      </div>
    </section>
  );
}

