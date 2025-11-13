import {
  DocumentReference,
  collection,
  doc,
  query,
  serverTimestamp,
  writeBatch,
  limit,
  where,
} from "firebase/firestore";

import { getCollectionData, getDocumentData } from "../cache/firestoreCache";
import { firestore } from "../config/firebase";
import type { Periodization } from "../features/periodizations/types";

/**
 * Retorna o caminho da coleção de periodizações do usuário
 */
function getPeriodizationsPath(userId: string): string {
  return `users/${userId}/periodizations`;
}

export type CreatePeriodizationInput = {
  userId: string;
  name: string;
  startDate: string;
  durationDays: number;
};

export type UpdatePeriodizationInput = {
  name?: string;
  durationDays?: number;
  status?: "active" | "completed" | "upcoming";
};

/**
 * Cria uma nova periodização e desativa todas as outras
 */
export async function createPeriodization(input: CreatePeriodizationInput): Promise<string> {
  const batch = writeBatch(firestore);
  const periodizationsPath = getPeriodizationsPath(input.userId);

  // Desativa todas as periodizações ativas do usuário
  const activePeriodizations = await getCollectionData<{ ref: DocumentReference }>(
    `periodizations:${input.userId}:active`,
    {
      queryFactory: () =>
        query(collection(firestore, periodizationsPath), where("status", "==", "active")),
      map: (docSnap) => ({
        ref: docSnap.ref,
      }),
    },
  );

  activePeriodizations.forEach(({ ref }) => {
    batch.update(ref, {
      status: "completed",
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  // Cria a nova periodização
  const newPeriodizationRef = doc(collection(firestore, periodizationsPath));
  batch.set(newPeriodizationRef, {
    name: input.name,
    startDate: input.startDate,
    durationDays: input.durationDays,
    status: "active",
    prs: 0,
    progressPercent: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return newPeriodizationRef.id;
}

/**
 * Ativa uma periodização existente e desativa todas as outras
 */
export async function activatePeriodization(
  userId: string,
  periodizationId: string
): Promise<void> {
  const batch = writeBatch(firestore);
  const periodizationsPath = getPeriodizationsPath(userId);

  // Desativa todas as periodizações ativas do usuário
  const activePeriodizations = await getCollectionData<{ ref: DocumentReference }>(
    `periodizations:${userId}:active`,
    {
      queryFactory: () =>
        query(collection(firestore, periodizationsPath), where("status", "==", "active")),
      map: (docSnap) => ({
        ref: docSnap.ref,
      }),
    },
  );

  activePeriodizations.forEach(({ ref }) => {
    batch.update(ref, {
      status: "completed",
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  // Ativa a periodização selecionada
  const periodizationRef = doc(firestore, periodizationsPath, periodizationId);
  batch.update(periodizationRef, {
    status: "active",
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Busca a periodização ativa do usuário
 */
export async function getActivePeriodization(
  userId: string
): Promise<Periodization | null> {
  const periodizationsPath = getPeriodizationsPath(userId);
  const q = query(
    collection(firestore, periodizationsPath),
    where("status", "==", "active"),
    limit(1)
  );

  const results = await getCollectionData<Periodization>(
    `periodizations:${userId}:active:single`,
    {
      queryFactory: () => q,
      map: (docSnap) =>
        ({
          id: docSnap.id,
          ...docSnap.data(),
        }) as Periodization,
    },
  );

  return results[0] ?? null;
}

/**
 * Atualiza o contador de PRs de uma periodização
 */
export async function incrementPeriodizationPRs(
  userId: string,
  periodizationId: string
): Promise<void> {
  const periodizationsPath = getPeriodizationsPath(userId);
  const periodizationRef = doc(firestore, periodizationsPath, periodizationId);
  const batch = writeBatch(firestore);

  const currentPeriodization = await getDocumentData<Periodization | null>(
    `periodizations:${userId}:${periodizationId}`,
    {
      refFactory: () => periodizationRef,
      map: (docSnap) => {
        if (!docSnap || !docSnap.exists()) {
          return null;
        }
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Periodization;
      },
    },
  );

  if (!currentPeriodization) {
    return;
  }

  const currentPrs = currentPeriodization.prs || 0;

  batch.update(periodizationRef, {
    prs: currentPrs + 1,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Calcula o progresso de uma periodização
 */
export function calculatePeriodizationProgress(
  startDate: string,
  durationDays: number
): number {
  const start = new Date(startDate);
  const now = new Date();
  const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(100, Math.max(0, (daysPassed / durationDays) * 100));
  return Math.round(progress);
}

