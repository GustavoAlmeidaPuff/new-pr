import { useMemo, useState } from "react";

import { CreatePeriodizationCard } from "../../features/periodizations/components/CreatePeriodizationCard";
import { PeriodizationCard } from "../../features/periodizations/components/PeriodizationCard";
import { usePeriodizationsData } from "../../features/periodizations/hooks/usePeriodizationsData";
import { CreatePeriodizationModal } from "../../components/modals/CreatePeriodizationModal";
import { activatePeriodization } from "../../services/periodizations.service";
import { useAuth } from "../../contexts/AuthContext";

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
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        Carregando periodizações...
      </div>
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

