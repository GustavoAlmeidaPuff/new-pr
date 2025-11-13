import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

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

/**
 * Cria um novo treino
 */
export async function createWorkout(input: CreateWorkoutInput): Promise<string> {
  const workoutsPath = getWorkoutsPath(input.userId);
  const newWorkoutRef = doc(collection(firestore, workoutsPath));
  const batch = writeBatch(firestore);

  batch.set(newWorkoutRef, {
    name: input.name,
    description: input.description || "",
    exerciseCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
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
  const exercisesQuery = query(
    collection(firestore, workoutExercisesPath),
    where("workoutId", "==", workoutId)
  );

  const exercisesSnapshot = await getDocs(exercisesQuery);
  exercisesSnapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
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
  const workoutSnapshot = await getDocs(
    query(collection(firestore, workoutsPath), where("__name__", "==", input.workoutId))
  );

  if (!workoutSnapshot.empty) {
    const currentData = workoutSnapshot.docs[0].data();
    const currentCount = currentData.exerciseCount || 0;

    batch.update(workoutRef, {
      exerciseCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    });
  }

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
  const workoutSnapshot = await getDocs(
    query(collection(firestore, workoutsPath), where("__name__", "==", workoutId))
  );

  if (!workoutSnapshot.empty) {
    const currentData = workoutSnapshot.docs[0].data();
    const currentCount = currentData.exerciseCount || 0;

    batch.update(workoutRef, {
      exerciseCount: Math.max(0, currentCount - 1),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}
