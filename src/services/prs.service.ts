import {
  collection,
  doc,
  query,
  serverTimestamp,
  writeBatch,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

import { getCollectionData, getDocumentData } from "../cache/firestoreCache";
import { firestore } from "../config/firebase";
import { incrementPeriodizationPRs } from "./periodizations.service";

/**
 * Retorna o caminho da coleção de PRs do usuário
 */
function getPRsPath(userId: string): string {
  return `users/${userId}/prs`;
}

export type CreatePRInput = {
  userId: string;
  exerciseId: string;
  periodizationId: string;
  weight: number;
  reps: number;
  date: string;
  notes?: string;
};

export type PRWithExerciseInfo = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  periodizationId: string;
  periodizationName: string;
  weight: number;
  reps: number;
  volume: number;
  date: string;
  notes?: string;
  trend?: "up" | "down" | "steady";
  isBaseline?: boolean;
  createdAt: any;
};

/**
 * Número de PRs iniciais que são considerados baseline (métrica inicial)
 */
const BASELINE_PR_COUNT = 3;

/**
 * Cria um novo PR
 */
export async function createPR(input: CreatePRInput): Promise<string> {
  const prsPath = getPRsPath(input.userId);
  const newPRRef = doc(collection(firestore, prsPath));
  const batch = writeBatch(firestore);

  // Busca o exercício para saber o tipo de carga
  const exercisesPath = `users/${input.userId}/exercises`;
  const exerciseRef = doc(firestore, exercisesPath, input.exerciseId);
  const exerciseData = await getDocumentData<{ weightType?: "total" | "per-side" } | null>(
    `exercise:${input.userId}:${input.exerciseId}`,
    {
      refFactory: () => exerciseRef,
      map: (snapshot) => {
        if (!snapshot || !snapshot.exists()) {
          return null;
        }
        return snapshot.data() as { weightType?: "total" | "per-side" };
      },
    },
  );

  let volume = input.weight * input.reps;

  // Se for carga bilateral (per-side), multiplica por 2
  if (exerciseData?.weightType === "per-side") {
    volume = input.weight * 2 * input.reps; // peso de cada lado × 2 × reps
  }

  // Verifica quantos PRs já existem para este exercício (ordenados por data)
  const existingPRs = await getPRsForExercise(input.userId, input.exerciseId);
  // Conta apenas PRs que não são baseline (ou seja, PRs válidos)
  // PRs antigos sem o campo isBaseline são considerados válidos
  const validPRsCount = existingPRs.filter(pr => pr.isBaseline !== true).length;
  // Se ainda não temos PRs válidos suficientes, este é um baseline
  const isBaseline = validPRsCount < BASELINE_PR_COUNT;

  batch.set(newPRRef, {
    exerciseId: input.exerciseId,
    periodizationId: input.periodizationId,
    weight: input.weight,
    reps: input.reps,
    volume,
    date: input.date,
    notes: input.notes || "",
    isBaseline,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  // Incrementa o contador de PRs da periodização apenas se não for baseline
  if (!isBaseline) {
    await incrementPeriodizationPRs(input.userId, input.periodizationId);
  }

  return newPRRef.id;
}

/**
 * Busca o último PR de um exercício
 */
export async function getLastPRForExercise(
  userId: string,
  exerciseId: string
): Promise<PRWithExerciseInfo | null> {
  const prsPath = getPRsPath(userId);
  const q = query(
    collection(firestore, prsPath),
    where("exerciseId", "==", exerciseId),
    orderBy("date", "desc"),
    limit(1),
  );

  // Adiciona timestamp ao cache key para forçar atualização
  const results = await getCollectionData<PRWithExerciseInfo>(
    `prs:${userId}:exercise:${exerciseId}:last:${Date.now()}`,
    {
      queryFactory: () => q,
      map: (docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }) as PRWithExerciseInfo,
    },
  );

  return results[0] ?? null;
}

/**
 * Busca todos os PRs de um exercício
 */
export async function getPRsForExercise(
  userId: string,
  exerciseId: string
): Promise<PRWithExerciseInfo[]> {
  const prsPath = getPRsPath(userId);
  const q = query(
    collection(firestore, prsPath),
    where("exerciseId", "==", exerciseId),
    orderBy("date", "desc"),
  );

  // Adiciona timestamp ao cache key para forçar atualização
  return getCollectionData<PRWithExerciseInfo>(
    `prs:${userId}:exercise:${exerciseId}:all:${Date.now()}`,
    {
      queryFactory: () => q,
      map: (docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }) as PRWithExerciseInfo,
    },
  );
}

/**
 * Calcula a tendência de um PR comparado ao anterior
 */
export function calculatePRTrend(
  currentVolume: number,
  previousVolume: number | null
): "up" | "down" | "steady" {
  if (previousVolume === null) {
    return "steady";
  }

  if (currentVolume > previousVolume) {
    return "up";
  } else if (currentVolume < previousVolume) {
    return "down";
  } else {
    return "steady";
  }
}

/**
 * Busca PRs recentes do usuário
 */
export async function getRecentPRs(
  userId: string,
  limitCount: number = 10
): Promise<PRWithExerciseInfo[]> {
  const prsPath = getPRsPath(userId);
  const q = query(collection(firestore, prsPath), orderBy("date", "desc"), limit(limitCount));

  return getCollectionData<PRWithExerciseInfo>(
    `prs:${userId}:recent:${limitCount}`,
    {
      queryFactory: () => q,
      map: (docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }) as PRWithExerciseInfo,
    },
  );
}

/**
 * Busca PRs de uma periodização específica
 */
export async function getPRsForPeriodization(
  userId: string,
  periodizationId: string
): Promise<PRWithExerciseInfo[]> {
  const prsPath = getPRsPath(userId);
  const q = query(
    collection(firestore, prsPath),
    where("periodizationId", "==", periodizationId),
  );

  const results = await getCollectionData<PRWithExerciseInfo>(
    `prs:${userId}:periodization:${periodizationId}`,
    {
      queryFactory: () => q,
      map: (docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }) as PRWithExerciseInfo,
    },
  );

  return results.sort((a, b) => {
    const dateA = new Date(a.date ?? 0).getTime();
    const dateB = new Date(b.date ?? 0).getTime();
    return dateB - dateA;
  });
}
