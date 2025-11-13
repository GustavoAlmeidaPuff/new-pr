import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";

import { useAuth } from "../../../contexts/AuthContext";
import { firestore } from "../../../config/firebase";
import { getLastPRForExercise, calculatePRTrend } from "../../../services/prs.service";
import type { WorkoutExercisePreview } from "..";

type UseWorkoutDetailDataParams = {
  workoutId?: string;
};

export function useWorkoutDetailData({ workoutId }: UseWorkoutDetailDataParams) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<WorkoutExercisePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        const workoutExercisesQuery = query(
          collection(firestore, workoutExercisesPath),
          where("workoutId", "==", workoutId)
        );

        const workoutExercisesSnap = await getDocs(workoutExercisesQuery);

        if (workoutExercisesSnap.empty) {
          setExercises([]);
          setLoading(false);
          return;
        }

        // Para cada exercício, busca seus dados e último PR
        const exercisesPromises = workoutExercisesSnap.docs.map(async (workoutExerciseDoc) => {
          const workoutExerciseData = workoutExerciseDoc.data();
          const exerciseId = workoutExerciseData.exerciseId;

          // Busca dados do exercício
          const exercisesPath = `users/${user.uid}/exercises`;
          const exerciseRef = doc(firestore, exercisesPath, exerciseId);
          const exerciseSnap = await getDoc(exerciseRef);

          if (!exerciseSnap.exists()) {
            return null;
          }

          const exerciseData = exerciseSnap.data();

          // Busca o último PR
          const lastPr = await getLastPRForExercise(user.uid, exerciseId);

          return {
            id: exerciseId,
            name: exerciseData.name,
            muscleGroup: exerciseData.muscleGroup,
            lastPr: lastPr
              ? {
                  weight: lastPr.weight,
                  reps: lastPr.reps,
                  date: lastPr.date,
                  trend: "steady" as const,
                }
              : undefined,
          };
        });

        const exercisesData = await Promise.all(exercisesPromises);
        const filteredExercises = exercisesData.filter(
          (ex): ex is WorkoutExercisePreview => ex !== null
        );

        setExercises(filteredExercises);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar exercícios do treino:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    loadWorkoutExercises();
  }, [user, workoutId]);

  return {
    exercises,
    loading,
    error,
  };
}

