import { useEffect, useState } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { getActivePeriodization, calculatePeriodizationProgress } from "../../../services/periodizations.service";
import { getPRsForPeriodization } from "../../../services/prs.service";
import { getExerciseById, type ExerciseRecord } from "../../../services/exercises.service";
import type {
  DashboardSummary,
  DashboardVolumePoint,
  DashboardWeeklySnapshot,
  DashboardWeeklyStreak,
  DashboardPRHistoryItem,
} from "..";

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary>({
    periodization: null,
    volumeSeries: [],
    weeklyStreak: null,
    quickStats: [],
    prHistory: [],
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
            weeklyStreak: null,
            quickStats: [],
            prHistory: [],
          });
          setLoading(false);
          return;
        }

        // Busca os PRs da periodização ativa
        const prs = await getPRsForPeriodization(user.uid, activePeriodization.id);

        const normalizedPrs = prs
          .map((pr) => {
            const weight = Number.isFinite(pr.weight) ? pr.weight : Number(pr.weight) || 0;
            const reps = Number.isFinite(pr.reps) ? pr.reps : Number(pr.reps) || 0;
            const inferredVolume = weight * reps;
            const rawVolume = Number(pr.volume);
            const volume = Number.isFinite(rawVolume) ? rawVolume : inferredVolume;
            const date = pr.date ?? activePeriodization.startDate;

            return {
              ...pr,
              weight,
              reps,
              volume,
              date,
            };
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Calcula estatísticas
        const startDate = new Date(activePeriodization.startDate);
        const now = new Date();
        const startTime = startDate.getTime();
        const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        const dayInMs = 24 * 60 * 60 * 1000;
        const totalWeeks = Math.max(1, Math.floor((now.getTime() - startTime) / weekInMs) + 1);

        // Calcula volume por semana
        const weeklyTotals = new Map<
          number,
          {
            volume: number;
            prsCount: number;
          }
        >();

        normalizedPrs.forEach((pr) => {
          const prDate = new Date(pr.date);
          const weekNumber = Math.max(
            0,
            Math.floor((prDate.getTime() - startTime) / weekInMs),
          );
          const currentTotals = weeklyTotals.get(weekNumber) ?? { volume: 0, prsCount: 0 };
          weeklyTotals.set(weekNumber, {
            volume: currentTotals.volume + pr.volume,
            prsCount: currentTotals.prsCount + 1,
          });
        });

        const weeklySnapshots: DashboardWeeklySnapshot[] = Array.from({ length: totalWeeks }).map(
          (_, index) => {
            const weekStartDate = new Date(startTime + index * weekInMs);
            const weekEndDate = new Date(
              Math.min(weekStartDate.getTime() + 6 * dayInMs, now.getTime()),
            );
            const totals = weeklyTotals.get(index) ?? { volume: 0, prsCount: 0 };

            return {
              index,
              label: `Sem ${index + 1}`,
              weekStart: weekStartDate.toISOString(),
              weekEnd: weekEndDate.toISOString(),
              volume: totals.volume,
              prsCount: totals.prsCount,
            };
          },
        );

        const recentSnapshots = weeklySnapshots.slice(-8);
        const volumeSeries: DashboardVolumePoint[] = recentSnapshots.map((snapshot) => ({
          label: snapshot.label,
          volume: snapshot.volume,
          weekStart: snapshot.weekStart,
          weekEnd: snapshot.weekEnd,
        }));

        // Calcula mudança de volume
        const lastWeekVolume = volumeSeries[volumeSeries.length - 1]?.volume || 0;
        const previousWeekVolume = volumeSeries[volumeSeries.length - 2]?.volume || 0;
        const volumeChangePercent = previousWeekVolume > 0
          ? Math.round(((lastWeekVolume - previousWeekVolume) / previousWeekVolume) * 100)
          : 0;

        // Calcula volume médio
        const prsThisMonth = normalizedPrs.filter((pr) => {
          const prDate = new Date(pr.date);
          return prDate.getMonth() === now.getMonth() && prDate.getFullYear() === now.getFullYear();
        }).length;

        const totalVolume = normalizedPrs.reduce((sum, pr) => sum + pr.volume, 0);
        const avgVolume = normalizedPrs.length > 0
          ? Math.round(totalVolume / normalizedPrs.length)
          : 0;
        // Calcula streaks
        let longestPrStreak = 0;
        let rollingStreak = 0;
        weeklySnapshots.forEach((snapshot) => {
          if (snapshot.prsCount > 0) {
            rollingStreak += 1;
            longestPrStreak = Math.max(longestPrStreak, rollingStreak);
          } else {
            rollingStreak = 0;
          }
        });

        let currentPrStreak = 0;
        for (let i = weeklySnapshots.length - 1; i >= 0; i -= 1) {
          if (weeklySnapshots[i].prsCount > 0) {
            currentPrStreak += 1;
          } else {
            break;
          }
        }

        let currentLoadIncreaseStreak = 0;
        if (weeklySnapshots.length > 0) {
          const lastWeek = weeklySnapshots[weeklySnapshots.length - 1];
          if (lastWeek.volume > 0) {
            currentLoadIncreaseStreak = 1;
            for (let i = weeklySnapshots.length - 1; i > 0; i -= 1) {
              const currentWeek = weeklySnapshots[i];
              const previousWeek = weeklySnapshots[i - 1];

              if (previousWeek.volume <= 0) {
                break;
              }

              if (currentWeek.volume > previousWeek.volume) {
                currentLoadIncreaseStreak += 1;
              } else {
                break;
              }
            }
          }
        }

        const weeklyStreak: DashboardWeeklyStreak = {
          currentPrStreak,
          longestPrStreak,
          currentLoadIncreaseStreak,
          weeks: weeklySnapshots,
        };

        // Mapeia nomes dos exercícios
        const exerciseIds = Array.from(new Set(normalizedPrs.map((pr) => pr.exerciseId)));
        const exerciseNameMap = new Map<string, string>();
        if (exerciseIds.length > 0) {
          const exercises = await Promise.all(
            exerciseIds.map((exerciseId) =>
              getExerciseById<ExerciseRecord>(user.uid, exerciseId),
            ),
          );

          exercises.forEach((exercise) => {
            if (exercise) {
              exerciseNameMap.set(exercise.id, exercise.name);
            }
          });
        }

        const prHistory: DashboardPRHistoryItem[] = normalizedPrs.map((pr) => ({
          id: pr.id,
          exerciseId: pr.exerciseId,
          exerciseName: pr.exerciseName
            || exerciseNameMap.get(pr.exerciseId)
            || "Exercício sem nome",
          weight: pr.weight,
          reps: pr.reps,
          volume: pr.volume,
          date: pr.date,
          notes: pr.notes,
        }));

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
              newPrs: normalizedPrs.length,
              volumeChangePercent,
            },
          },
          volumeSeries,
          weeklyStreak,
          quickStats: [
            { label: "PRs este mês", value: prsThisMonth.toString() },
            { label: "Volume médio (kg)", value: avgVolume.toLocaleString("pt-BR") },
            { label: "Streak de PRs", value: `${currentPrStreak} sem.` },
          ],
          prHistory,
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

