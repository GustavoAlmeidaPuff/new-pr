import {
  DocumentReference,
  collection,
  doc,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import { getCollectionData, getDocumentData } from "../cache/firestoreCache";
import { firestore } from "../config/firebase";

/**
 * Retorna o caminho da coleção de treinos do usuário
 */
function getWorkoutsPath(userId: string): string {
  return `users/${userId}/workouts`;
}

/**
 * Retorna o caminho da coleção de exercícios de treino do usuário
 */
function getWorkoutExercisesPath(userId: string): string {
  return `users/${userId}/workoutExercises`;
}

export type CreateWorkoutInput = {
  userId: string;
  name: string;
  description?: string;
};

export type UpdateWorkoutInput = {
  name?: string;
  description?: string;
};

export type AddExerciseToWorkoutInput = {
  userId: string;
  workoutId: string;
  exerciseId: string;
  order: number;
};

export type WorkoutRecord = {
  id: string;
  name: string;
  description?: string;
  exerciseCount?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};

/**
 * Cria um novo treino
 */
export async function createWorkout(input: CreateWorkoutInput): Promise<string> {
  console.log('[workouts.service] Creating workout', { input });
  const workoutsPath = getWorkoutsPath(input.userId);
  const newWorkoutRef = doc(collection(firestore, workoutsPath));
  const batch = writeBatch(firestore);

  const workoutData = {
    name: input.name,
    description: input.description || "",
    exerciseCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  console.log('[workouts.service] Workout data', { workoutId: newWorkoutRef.id, workoutData });

  batch.set(newWorkoutRef, workoutData);

  await batch.commit();
  console.log('[workouts.service] Workout created successfully', { workoutId: newWorkoutRef.id });
  return newWorkoutRef.id;
}

/**
 * Atualiza um treino existente
 */
export async function updateWorkout(
  userId: string,
  workoutId: string,
  input: UpdateWorkoutInput
): Promise<void> {
  const workoutsPath = getWorkoutsPath(userId);
  const workoutRef = doc(firestore, workoutsPath, workoutId);
  const batch = writeBatch(firestore);

  batch.update(workoutRef, {
    ...input,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Remove um treino e todos os exercícios associados
 */
export async function deleteWorkout(userId: string, workoutId: string): Promise<void> {
  const batch = writeBatch(firestore);
  const workoutExercisesPath = getWorkoutExercisesPath(userId);

  // Remove todos os exercícios associados
  const exercises = await getCollectionData<{ ref: DocumentReference }>(
    `workoutExercises:${userId}:${workoutId}`,
    {
      queryFactory: () =>
        query(collection(firestore, workoutExercisesPath), where("workoutId", "==", workoutId)),
      map: (docSnap) => ({
        ref: docSnap.ref,
      }),
    },
  );

  exercises.forEach(({ ref }) => {
    batch.delete(ref);
  });

  // Remove o treino
  const workoutsPath = getWorkoutsPath(userId);
  const workoutRef = doc(firestore, workoutsPath, workoutId);
  batch.delete(workoutRef);

  await batch.commit();
}

/**
 * Adiciona um exercício a um treino
 */
export async function addExerciseToWorkout(input: AddExerciseToWorkoutInput): Promise<string> {
  const batch = writeBatch(firestore);
  const workoutExercisesPath = getWorkoutExercisesPath(input.userId);

  // Adiciona o exercício ao treino
  const workoutExerciseRef = doc(collection(firestore, workoutExercisesPath));
  batch.set(workoutExerciseRef, {
    workoutId: input.workoutId,
    exerciseId: input.exerciseId,
    order: input.order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Atualiza o contador de exercícios do treino
  const workoutsPath = getWorkoutsPath(input.userId);
  const workoutRef = doc(firestore, workoutsPath, input.workoutId);
  const workoutData = await getDocumentData<{ exerciseCount?: number } | null>(
    `workout:${input.userId}:${input.workoutId}`,
    {
      refFactory: () => workoutRef,
      map: (snapshot) => {
        if (!snapshot || !snapshot.exists()) {
          return null;
        }
        return snapshot.data() as { exerciseCount?: number };
      },
    },
  );

  const currentCount = workoutData?.exerciseCount ?? 0;

  batch.update(workoutRef, {
    exerciseCount: currentCount + 1,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return workoutExerciseRef.id;
}

/**
 * Remove um exercício de um treino
 */
export async function removeExerciseFromWorkout(
  userId: string,
  workoutId: string,
  workoutExerciseId: string
): Promise<void> {
  const batch = writeBatch(firestore);
  const workoutExercisesPath = getWorkoutExercisesPath(userId);

  // Remove o exercício do treino
  const workoutExerciseRef = doc(firestore, workoutExercisesPath, workoutExerciseId);
  batch.delete(workoutExerciseRef);

  // Atualiza o contador de exercícios do treino
  const workoutsPath = getWorkoutsPath(userId);
  const workoutRef = doc(firestore, workoutsPath, workoutId);
  const workoutData = await getDocumentData<{ exerciseCount?: number } | null>(
    `workout:${userId}:${workoutId}`,
    {
      refFactory: () => workoutRef,
      map: (snapshot) => {
        if (!snapshot || !snapshot.exists()) {
          return null;
        }
        return snapshot.data() as { exerciseCount?: number };
      },
    },
  );

  const currentCount = workoutData?.exerciseCount ?? 0;

  batch.update(workoutRef, {
    exerciseCount: Math.max(0, currentCount - 1),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function getWorkoutById<T = WorkoutRecord>(
  userId: string,
  workoutId: string,
  map?: (data: WorkoutRecord) => T,
): Promise<T | null> {
  const workoutRef = doc(firestore, getWorkoutsPath(userId), workoutId);

  return getDocumentData<T | null>(`workout:${userId}:${workoutId}`, {
    refFactory: () => workoutRef,
    map: (snapshot) => {
      if (!snapshot || !snapshot.exists()) {
        return null;
      }

      const payload = {
        id: snapshot.id,
        ...snapshot.data(),
      } as WorkoutRecord;

      return map ? map(payload) : (payload as unknown as T);
    },
  });
}
