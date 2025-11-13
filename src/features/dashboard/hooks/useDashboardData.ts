import { useEffect, useState } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { getActivePeriodization, calculatePeriodizationProgress } from "../../../services/periodizations.service";
import { getPRsForPeriodization } from "../../../services/prs.service";
import type { DashboardSummary, DashboardVolumePoint } from "..";

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary>({
    periodization: null,
    volumeSeries: [],
    quickStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Busca a periodização ativa
        const activePeriodization = await getActivePeriodization(user.uid);
        
        if (!activePeriodization) {
          setData({
            periodization: null,
            volumeSeries: [],
            quickStats: [],
          });
          setLoading(false);
          return;
        }

        // Busca os PRs da periodização ativa
        const prs = await getPRsForPeriodization(user.uid, activePeriodization.id);

        // Calcula estatísticas
        const startDate = new Date(activePeriodization.startDate);
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // Calcula volume por semana
        const volumeSeries: DashboardVolumePoint[] = [];
        const weeklyVolumes = new Map<number, number>();

        prs.forEach((pr) => {
          const prDate = new Date(pr.date);
          const weekNumber = Math.floor((prDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
          const currentVolume = weeklyVolumes.get(weekNumber) || 0;
          weeklyVolumes.set(weekNumber, currentVolume + pr.volume);
        });

        const weeks = Math.ceil(daysPassed / 7);
        for (let i = 0; i < Math.min(weeks, 6); i++) {
          volumeSeries.push({
            label: `Sem ${i + 1}`,
            volume: weeklyVolumes.get(i) || 0,
          });
        }

        // Calcula mudança de volume
        const lastWeekVolume = volumeSeries[volumeSeries.length - 1]?.volume || 0;
        const previousWeekVolume = volumeSeries[volumeSeries.length - 2]?.volume || 0;
        const volumeChangePercent = previousWeekVolume > 0
          ? Math.round(((lastWeekVolume - previousWeekVolume) / previousWeekVolume) * 100)
          : 0;

        // Calcula volume médio
        const totalVolume = prs.reduce((sum, pr) => sum + pr.volume, 0);
        const avgVolume = prs.length > 0 ? Math.round(totalVolume / prs.length) : 0;

        setData({
          periodization: {
            id: activePeriodization.id,
            name: activePeriodization.name,
            status: activePeriodization.status,
            startDate: activePeriodization.startDate,
            durationDays: activePeriodization.durationDays,
            progressPercent: calculatePeriodizationProgress(
              activePeriodization.startDate,
              activePeriodization.durationDays
            ),
            stats: {
              days: daysPassed,
              newPrs: prs.length,
              volumeChangePercent,
            },
          },
          volumeSeries,
          quickStats: [
            { label: "PRs este mês", value: prs.length.toString() },
            { label: "Volume médio (kg)", value: avgVolume.toLocaleString("pt-BR") },
          ],
        });

        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  return {
    data,
    loading,
    error,
  };
}

