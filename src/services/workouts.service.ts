import {
  collection,
  doc,
  query,
  where,
  serverTimestamp,
  writeBatch,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { getDocumentData } from "../cache/firestoreCache";
import { firestore } from "../config/firebase";

function getWorkoutsPath(userId: string): string {
  return `users/${userId}/workouts`;
}

function getWorkoutExercisesPath(userId: string): string {
  return `users/${userId}/workoutExercises`;
}

export type WorkoutRecord = {
  id: string;
  name: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type WorkoutExerciseRecord = {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  createdAt?: unknown;
};

export type CreateWorkoutInput = {
  userId: string;
  name: string;
};

export async function createWorkout(input: CreateWorkoutInput): Promise<string> {
  const path = getWorkoutsPath(input.userId);
  const coll = collection(firestore, path);
  const ref = await addDoc(coll, {
    name: input.name.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getWorkoutById(
  userId: string,
  workoutId: string
): Promise<WorkoutRecord | null> {
  const path = getWorkoutsPath(userId);
  return getDocumentData<WorkoutRecord | null>(`workout:${userId}:${workoutId}`, {
    refFactory: () => doc(firestore, path, workoutId),
    map: (snapshot) => {
      if (!snapshot?.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as WorkoutRecord;
    },
  });
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: { name: string }
): Promise<void> {
  const path = getWorkoutsPath(userId);
  const ref = doc(firestore, path, workoutId);
  const batch = writeBatch(firestore);
  batch.update(ref, {
    name: data.name.trim(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function deleteWorkout(userId: string, workoutId: string): Promise<void> {
  const wePath = getWorkoutExercisesPath(userId);
  const weQuery = query(
    collection(firestore, wePath),
    where("workoutId", "==", workoutId)
  );
  const snapshot = await getDocs(weQuery);
  const batch = writeBatch(firestore);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  const wPath = getWorkoutsPath(userId);
  batch.delete(doc(firestore, wPath, workoutId));
  await batch.commit();
}

export async function addExerciseToWorkout(
  userId: string,
  workoutId: string,
  exerciseId: string
): Promise<void> {
  const wePath = getWorkoutExercisesPath(userId);
  const existing = query(
    collection(firestore, wePath),
    where("workoutId", "==", workoutId),
    where("exerciseId", "==", exerciseId)
  );
  const snap = await getDocs(existing);
  if (!snap.empty) return;

  const allInWorkout = await getDocs(
    query(
      collection(firestore, wePath),
      where("workoutId", "==", workoutId)
    )
  );
  const nextOrder = allInWorkout.size;

  await addDoc(collection(firestore, wePath), {
    workoutId,
    exerciseId,
    order: nextOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function removeExerciseFromWorkout(
  userId: string,
  workoutId: string,
  exerciseId: string
): Promise<void> {
  const wePath = getWorkoutExercisesPath(userId);
  const q = query(
    collection(firestore, wePath),
    where("workoutId", "==", workoutId),
    where("exerciseId", "==", exerciseId)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(firestore);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function getWorkoutExerciseIds(
  userId: string,
  workoutId: string
): Promise<Array<{ id: string; exerciseId: string; order: number }>> {
  const wePath = getWorkoutExercisesPath(userId);
  const q = query(
    collection(firestore, wePath),
    where("workoutId", "==", workoutId)
  );
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      exerciseId: data.exerciseId as string,
      order: (data.order as number) ?? 0,
    };
  });
  items.sort((a, b) => a.order - b.order);
  return items;
}

/** Retorna os IDs dos treinos que já contêm o exercício */
export async function getWorkoutIdsContainingExercise(
  userId: string,
  exerciseId: string
): Promise<string[]> {
  const wePath = getWorkoutExercisesPath(userId);
  const q = query(
    collection(firestore, wePath),
    where("exerciseId", "==", exerciseId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data().workoutId as string);
}
