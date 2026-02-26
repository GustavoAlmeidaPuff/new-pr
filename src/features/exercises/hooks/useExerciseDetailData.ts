import { useEffect, useState } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { getActivePeriodization } from "../../../services/periodizations.service";
import { getExerciseById, type ExerciseRecord } from "../../../services/exercises.service";
import { getPRsForExerciseInPeriodization, calculatePRTrend } from "../../../services/prs.service";
import type { ExerciseSummary, ExercisePR } from "..";

type UseExerciseDetailDataParams = {
  exerciseId?: string;
};

export function useExerciseDetailData({ exerciseId }: UseExerciseDetailDataParams) {
  const { user } = useAuth();
  const [exercise, setExercise] = useState<ExerciseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    if (!user || !exerciseId) {
      setLoading(false);
      return;
    }

    const loadExerciseData = async () => {
      try {
        setLoading(true);

        const exerciseData = await getExerciseById<ExerciseRecord>(user.uid, exerciseId);

        if (!exerciseData) {
          throw new Error("Exercício não encontrado");
        }

        const activePeriodization = await getActivePeriodization(user.uid);
        const allPRs = activePeriodization
          ? await getPRsForExerciseInPeriodization(user.uid, exerciseId, activePeriodization.id)
          : [];
        
        // Garante que o campo isBaseline seja tratado corretamente
        // PRs antigos sem o campo são considerados válidos (não baseline)
        const normalizedPRs = allPRs.map(pr => ({
          ...pr,
          isBaseline: pr.isBaseline === true, // Garante boolean explícito
        }));
        
        // Separa PRs baseline e válidos
        const baselinePRs = normalizedPRs.filter(pr => pr.isBaseline === true);
        const validPRs = normalizedPRs.filter(pr => pr.isBaseline !== true);
        
        // Para exibição no histórico, mostra TODOS os PRs (baseline e válidos)
        // Ordena por data (mais recente primeiro) para garantir ordem correta
        const sortedPRs = [...normalizedPRs].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Mais recente primeiro
        });
        
        // Para exibição no histórico, mostra todos os PRs (baseline e válidos)
        // mas marca os baseline de forma diferente
        const historyWithTrends: ExercisePR[] = sortedPRs.map((pr, index) => {
          // Para calcular tendência, só compara com PRs válidos
          const validIndex = validPRs.findIndex(vpr => vpr.id === pr.id);
          const previousValidPr = validIndex > 0 ? validPRs[validIndex - 1] : null;
          const trend = previousValidPr && !pr.isBaseline
            ? calculatePRTrend(pr.volume, previousValidPr.volume)
            : "steady";
          return {
            id: pr.id,
            weight: pr.weight,
            reps: pr.reps,
            volume: pr.volume,
            date: pr.date,
            periodization: pr.periodizationName || "Sem periodização",
            trend: pr.isBaseline ? undefined : trend,
            isBaseline: pr.isBaseline,
          };
        });

        // Prepara série de tendência com TODOS os PRs (baseline e válidos)
        // Na página do exercício, queremos ver a evolução completa incluindo baseline
        // Ordena por data (mais antigo primeiro) para o gráfico
        const trendSeries = sortedPRs
          .slice()
          .reverse() // Inverte para ter do mais antigo ao mais recente
          .slice(0, 20) // Limita aos últimos 20 registros para performance
          .map((pr) => ({
            id: pr.id,
            date: pr.date,
            weight: pr.weight,
            reps: pr.reps,
            volume: pr.volume,
          }));

        // Gera insights apenas com base em PRs válidos
        const insights: string[] = [];
        
        // Adiciona informação sobre baseline se houver
        if (baselinePRs.length > 0) {
          if (validPRs.length === 0) {
            insights.push(`Os primeiros registros dos exercícios são para ter uma métrica inicial, por isso não serão contados como métrica da semana. Continue registrando para estabelecer sua base!`);
          } else {
            insights.push(`Os primeiros registros dos exercícios são para ter uma métrica inicial, por isso não são contados como métrica da semana.`);
          }
        }
        
        if (validPRs.length >= 2) {
          const lastPr = validPRs[0];
          const previousPr = validPRs[1];
          const volumeIncrease = ((lastPr.volume - previousPr.volume) / previousPr.volume) * 100;

          if (volumeIncrease > 0) {
            insights.push("Você está em uma tendência positiva! Mantenha o ritmo.");
            if (volumeIncrease > 10) {
              insights.push(`Seu progresso de carga está ${volumeIncrease.toFixed(0)}% acima do último registro.`);
            }
          } else if (volumeIncrease < 0) {
            insights.push("Você teve uma queda no volume. Considere revisar sua recuperação.");
          } else {
            insights.push("Você manteve o volume. Considere aumentar a carga ou repetições.");
          }
        }

        if (validPRs.length >= 3) {
          const recentPrs = validPRs.slice(0, 3);
          const allIncreasing = recentPrs.every((pr, index) => {
            if (index === recentPrs.length - 1) return true;
            return pr.volume > recentPrs[index + 1].volume;
          });

          if (allIncreasing) {
            insights.push("Você está em uma sequência de evolução consistente!");
          }
        }

        if (insights.length === 0) {
          if (baselinePRs.length > 0) {
            insights.push("Continue registrando seus PRs para estabelecer sua métrica inicial!");
          } else {
            insights.push("Continue registrando seus PRs para obter insights personalizados!");
          }
        }

        // Usa o último PR válido, ou o último baseline se não houver válidos
        const latestPr = validPRs[0] || normalizedPRs[0];

        setExercise({
          id: exerciseId,
          name: exerciseData.name,
          muscles: exerciseData.muscles || [exerciseData.muscleGroup],
          weightType: exerciseData.weightType,
          currentPr: {
            weight: latestPr?.weight ?? 0,
            reps: latestPr?.reps ?? 0,
            volume: latestPr?.volume ?? 0,
            date: latestPr?.date ?? new Date().toISOString().split("T")[0],
            periodization: latestPr?.periodizationName ?? "Sem periodização",
          },
          insights,
          trendSeries,
          history: historyWithTrends,
        });

        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados do exercício:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    loadExerciseData();
  }, [user, exerciseId, refreshTrigger]);

  return {
    exercise,
    loading,
    error,
    refresh,
  };
}

