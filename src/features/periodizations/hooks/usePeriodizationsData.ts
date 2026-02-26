import { useEffect, useMemo } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { useFirestoreCollection } from "../../../hooks/useFirestoreCollection";
import {
  calculatePeriodizationProgress,
  ensureDefaultPeriodizations,
  PERIODIZATION_IDS,
} from "../../../services/periodizations.service";
import type { Periodization } from "..";

export function usePeriodizationsData() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      ensureDefaultPeriodizations(user.uid);
    }
  }, [user]);

  const constraints = useMemo(() => [], []);

  const { data, loading, error } = useFirestoreCollection<Periodization>({
    path: user ? `users/${user.uid}/periodizations` : "users/__placeholder__/periodizations",
    constraints,
    orderByField: "name",
    orderByDirection: "asc",
    map: (periodization) => ({
      ...periodization,
      progressPercent: calculatePeriodizationProgress(
        periodization.startDate,
        periodization.durationDays
      ),
    }),
  });

  // Garante ordem fixa: Base, Shock, Deload (só exibe as 3)
  const periodizations = useMemo(() => {
    if (!user) return [];
    const byId = new Map(data.map((p) => [p.id, p]));
    return PERIODIZATION_IDS.map((id) => byId.get(id)).filter(
      (p): p is Periodization => p != null
    );
  }, [user, data]);

  return {
    periodizations,
    loading,
    error,
  };
}

