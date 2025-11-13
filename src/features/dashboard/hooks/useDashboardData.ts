import { useMemo } from "react";

import type { DashboardSummary } from "..";

export function useDashboardData() {
  // TODO: substituir dados mock por consulta real ao Firestore.
  const data = useMemo<DashboardSummary>(
    () => ({
      periodization: {
        id: "base",
        name: "Base",
        status: "active",
        startDate: "2024-11-25",
        durationDays: 12,
        progressPercent: 20,
        stats: {
          days: 12,
          newPrs: 8,
          volumeChangePercent: 15,
        },
      },
      volumeSeries: [
        { label: "Sem 1", volume: 1200 },
        { label: "Sem 2", volume: 1350 },
        { label: "Sem 3", volume: 1400 },
        { label: "Sem 4", volume: 1500 },
        { label: "Sem 5", volume: 1650 },
        { label: "Sem 6", volume: 1700 },
      ],
      quickStats: [
        { label: "Treinos esta semana", value: "4" },
        { label: "Exercícios total", value: "23" },
        { label: "PRs este mês", value: "12" },
        { label: "Volume médio (kg)", value: "1.520" },
      ],
    }),
    [],
  );

  return {
    data,
    loading: false,
    error: null as Error | null,
  };
}

