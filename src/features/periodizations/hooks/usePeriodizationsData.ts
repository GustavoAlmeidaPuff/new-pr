import { useMemo } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { useFirestoreCollection } from "../../../hooks/useFirestoreCollection";
import { calculatePeriodizationProgress } from "../../../services/periodizations.service";
import type { Periodization } from "..";

export function usePeriodizationsData() {
  const { user } = useAuth();

  // Memoiza os constraints para evitar recriar a subscription
  const constraints = useMemo(() => [], []);

  const { data, loading, error } = useFirestoreCollection<Periodization>({
    path: user ? `users/${user.uid}/periodizations` : "periodizations",
    constraints,
    orderByField: "createdAt",
    orderByDirection: "desc",
    map: (periodization) => ({
      ...periodization,
      progressPercent: calculatePeriodizationProgress(
        periodization.startDate,
        periodization.durationDays
      ),
    }),
  });

  return {
    periodizations: user ? data : [],
    loading,
    error,
  };
}

