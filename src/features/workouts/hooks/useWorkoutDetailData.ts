import { useCallback, useEffect, useState } from "react";
import { collection, query, where } from "firebase/firestore";

import { useAuth } from "../../../contexts/AuthContext";
import { firestore } from "../../../config/firebase";
import { getCollectionData } from "../../../cache/firestoreCache";
import { getExerciseById, type ExerciseRecord } from "../../../services/exercises.service";
import { getLastPRForExercise } from "../../../services/prs.service";
import type { WorkoutExercisePreview } from "..";

type UseWorkoutDetailDataParams = {
  workoutId?: string;
};

export type WorkoutExerciseWithId = WorkoutExercisePreview & {
  workoutExerciseId: string;
  order: number;
};

export function useWorkoutDetailData({ workoutId }: UseWorkoutDetailDataParams) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<WorkoutExerciseWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!user || !workoutId) {
      setLoading(false);
      return;
    }

    const loadWorkoutExercises = async () => {
      try {
        setLoading(true);

        // Busca os exercícios associados ao treino
        const workoutExercisesPath = `users/${user.uid}/workoutExercises`;
        const workoutExercises = await getCollectionData<{
          id: string;
          exerciseId: string;
          order?: number;
        }>(
          `workoutExercises:${user.uid}:${workoutId}`,
          {
            queryFactory: () =>
              query(
                collection(firestore, workoutExercisesPath),
                where("workoutId", "==", workoutId)
              ),
            map: (docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                exerciseId: data.exerciseId as string,
                order: data.order as number | undefined,
              };
            },
          }
        );

        if (workoutExercises.length === 0) {
          setExercises([]);
          setLoading(false);
          return;
        }

        // Para cada exercício, busca seus dados e último PR
        const exercisesPromises: Array<
          Promise<WorkoutExerciseWithId | null>
        > = workoutExercises.map(async (workoutExercise) => {
          const exerciseData = (await getExerciseById<ExerciseRecord>(
            user.uid,
            workoutExercise.exerciseId
          )) as ExerciseRecord | null;

          if (!exerciseData) {
            return null;
          }

          const lastPr = await getLastPRForExercise(user.uid, workoutExercise.exerciseId);

          return {
            id: workoutExercise.exerciseId,
            workoutExerciseId: workoutExercise.id,
            name: exerciseData.name,
            muscleGroup: exerciseData.muscleGroup,
            weightType: exerciseData.weightType,
            order: workoutExercise.order ?? Number.MAX_SAFE_INTEGER,
            lastPr: lastPr
              ? {
                  weight: lastPr.weight,
                  reps: lastPr.reps,
                  date: lastPr.date,
                  trend: lastPr.trend ?? "steady",
                }
              : undefined,
          };
        });

        const exercisesData = await Promise.all(exercisesPromises);
        const filteredExercises = exercisesData
          .filter((item): item is WorkoutExerciseWithId => item !== null)
          .sort((a, b) => a.order - b.order);

        setExercises(filteredExercises);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar exercícios do treino:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    loadWorkoutExercises();
  }, [user, workoutId, refreshTrigger]);

  return {
    exercises,
    loading,
    error,
    refresh,
  };
}

