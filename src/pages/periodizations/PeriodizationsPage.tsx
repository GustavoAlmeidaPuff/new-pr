import { useMemo } from "react";

import { CreatePeriodizationCard } from "../../features/periodizations/components/CreatePeriodizationCard";
import { PeriodizationCard } from "../../features/periodizations/components/PeriodizationCard";
import { usePeriodizationsData } from "../../features/periodizations/hooks/usePeriodizationsData";

export function PeriodizationsPage() {
  const { periodizations, loading } = usePeriodizationsData();

  const [active, completed] = useMemo(() => {
    const actives = periodizations.filter((item) => item.status === "active");
    const history = periodizations.filter((item) => item.status !== "active");
    return [actives, history];
  }, [periodizations]);

  const handleCreatePeriodization = () => {
    // TODO: abrir modal para cadastro de uma nova periodização.
    console.info("Criar periodização acionado");
  };

  const handleActivate = (id: string) => {
    // TODO: implementar ativação via Firestore.
    console.info("Ativar periodização", id);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
        Carregando periodizações...
      </div>
    );
  }

  return (
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
  );
}

