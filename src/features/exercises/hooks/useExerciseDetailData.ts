import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { useAuth } from "../../../contexts/AuthContext";
import { firestore } from "../../../config/firebase";
import { getPRsForExercise, calculatePRTrend } from "../../../services/prs.service";
import type { ExerciseSummary } from "..";

type UseExerciseDetailDataParams = {
  exerciseId?: string;
};

export function useExerciseDetailData({ exerciseId }: UseExerciseDetailDataParams) {
  const { user } = useAuth();
  const [exercise, setExercise] = useState<ExerciseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !exerciseId) {
      setLoading(false);
      return;
    }

    const loadExerciseData = async () => {
      try {
        setLoading(true);

        // Busca os dados do exercício
        const exercisesPath = `users/${user.uid}/exercises`;
        const exerciseRef = doc(firestore, exercisesPath, exerciseId);
        const exerciseSnap = await getDoc(exerciseRef);

        if (!exerciseSnap.exists()) {
          throw new Error("Exercício não encontrado");
        }

        const exerciseData = exerciseSnap.data();

        // Busca os PRs do exercício
        const prs = await getPRsForExercise(user.uid, exerciseId);

        // Calcula tendências
        const historyWithTrends = prs.map((pr, index) => {
          const previousPr = prs[index + 1];
          const trend = previousPr
            ? calculatePRTrend(pr.volume, previousPr.volume)
            : "steady";
          return { ...pr, trend };
        });

        // Prepara série de tendência (últimos 6 registros)
        const trendSeries = prs
          .slice(0, 6)
          .reverse()
          .map((pr) => ({
            date: pr.date,
            weight: pr.weight,
          }));

        // Gera insights
        const insights: string[] = [];
        if (prs.length >= 2) {
          const lastPr = prs[0];
          const previousPr = prs[1];
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

        if (prs.length >= 3) {
          const recentPrs = prs.slice(0, 3);
          const allIncreasing = recentPrs.every((pr, index) => {
            if (index === recentPrs.length - 1) return true;
            return pr.volume > recentPrs[index + 1].volume;
          });

          if (allIncreasing) {
            insights.push("Você está em uma sequência de evolução consistente!");
          }
        }

        if (insights.length === 0) {
          insights.push("Continue registrando seus PRs para obter insights personalizados!");
        }

        const currentPr = prs[0] || {
          weight: 0,
          reps: 0,
          volume: 0,
          date: new Date().toISOString().split("T")[0],
          periodization: "Sem periodização",
        };

        setExercise({
          id: exerciseId,
          name: exerciseData.name,
          muscles: exerciseData.muscles || [exerciseData.muscleGroup],
          currentPr: {
            weight: currentPr.weight,
            reps: currentPr.reps,
            volume: currentPr.volume,
            date: currentPr.date,
            periodization: currentPr.periodizationName || "Sem periodização",
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
  }, [user, exerciseId]);

  return {
    exercise,
    loading,
    error,
  };
}

