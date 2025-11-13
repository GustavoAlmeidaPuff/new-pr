import { useMemo } from "react";

import type { Periodization } from "..";

export function usePeriodizationsData() {
  // TODO: substituir dados mock por integração real com Firestore.
  const periodizations = useMemo<Periodization[]>(
    () => [
      {
        id: "base-2024",
        name: "Base",
        status: "active",
        startDate: "2024-11-25",
        durationDays: 12,
        prs: 8,
        progressPercent: 20,
      },
      {
        id: "hipertrofia-2024",
        name: "Hipertrofia",
        status: "completed",
        startDate: "2024-10-01",
        durationDays: 56,
        completedAt: "2024-11-24",
        prs: 15,
        progressPercent: 100,
      },
      {
        id: "deload-2024",
        name: "Deload",
        status: "completed",
        startDate: "2024-08-20",
        durationDays: 14,
        completedAt: "2024-09-03",
        prs: 6,
        progressPercent: 100,
      },
    ],
    [],
  );

  return {
    periodizations,
    loading: false,
    error: null as Error | null,
  };
}

