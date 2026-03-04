import { useEffect, useState } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { getExerciseById } from "../../../services/exercises.service";
import {
  getWorkoutById,
  getWorkoutExerciseIds,
  type WorkoutRecord,
} from "../../../services/workouts.service";

export type TreinoExerciseItem = {
  workoutExerciseId: string;
  exerciseId: string;
  name: string;
  order: number;
};

type UseTreinoDetailDataReturn = {
  workout: WorkoutRecord | null;
  exercises: TreinoExerciseItem[];
  loading: boolean;
  refresh: () => void;
};

export function useTreinoDetailData(workoutId: string | undefined): UseTreinoDetailDataReturn {
  const { user } = useAuth();
  const [workout, setWorkout] = useState<WorkoutRecord | null>(null);
  const [exercises, setExercises] = useState<TreinoExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => setRefreshTrigger((n) => n + 1);

  useEffect(() => {
    if (!user || !workoutId) {
      setWorkout(null);
      setExercises([]);
      setLoading(false);
      return;
    }

    const currentUser = user;
    const currentWorkoutId = workoutId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [workoutData, weList] = await Promise.all([
          getWorkoutById(currentUser.uid, currentWorkoutId),
          getWorkoutExerciseIds(currentUser.uid, currentWorkoutId),
        ]);

        if (cancelled) return;
        setWorkout(workoutData);

        const withNames = await Promise.all(
          weList.map(async (we) => {
            const ex = await getExerciseById(currentUser.uid, we.exerciseId);
            return {
              workoutExerciseId: we.id,
              exerciseId: we.exerciseId,
              name: ex?.name ?? "Exercício",
              order: we.order,
            };
          })
        );
        if (cancelled) return;
        setExercises(withNames);
      } catch (e) {
        if (!cancelled) {
          setWorkout(null);
          setExercises([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, workoutId, refreshTrigger]);

  return { workout, exercises, loading, refresh };
}
