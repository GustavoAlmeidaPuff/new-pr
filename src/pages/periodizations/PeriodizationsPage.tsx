import { useMemo, useState } from "react";

import { Skeleton } from "../../components/loading";
import { CreatePeriodizationModal } from "../../components/modals/CreatePeriodizationModal";
import { useAuth } from "../../contexts/AuthContext";
import { PeriodizationCard } from "../../features/periodizations/components/PeriodizationCard";
import { CreatePeriodizationCard } from "../../features/periodizations/components/CreatePeriodizationCard";
import { usePeriodizationsData } from "../../features/periodizations/hooks/usePeriodizationsData";
import { activatePeriodization } from "../../services/periodizations.service";

export function PeriodizationsPage() {
  const { user } = useAuth();
  const { periodizations, loading } = usePeriodizationsData();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [active, completed] = useMemo(() => {
    const actives = periodizations.filter((item) => item.status === "active");
    const history = periodizations.filter((item) => item.status !== "active");
    return [actives, history];
  }, [periodizations]);

  const handleCreatePeriodization = () => {
    setIsCreateModalOpen(true);
  };

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

        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-3xl" />
          ))}
          <Skeleton className="h-48 rounded-3xl" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-32 rounded-full" />
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <header>
          <h1 className="text-3xl font-semibold text-white">Periodizações</h1>
          <p className="text-sm text-text-muted">
            Gerencie seus ciclos Base, Shock e Deload com facilidade.
          </p>
        </header>

        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {active.map((periodization) => (
              <PeriodizationCard
                key={periodization.id}
                periodization={periodization}
                onActivate={handleActivate}
              />
            ))}
            <CreatePeriodizationCard onClick={handleCreatePeriodization} />
          </div>

          {completed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                Histórico
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {completed.map((periodization) => (
                  <PeriodizationCard
                    key={periodization.id}
                    periodization={periodization}
                    onActivate={handleActivate}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <CreatePeriodizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}

