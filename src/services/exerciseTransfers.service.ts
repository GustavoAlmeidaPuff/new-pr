import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  orderBy,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

import { getActiveFirestore } from "../config/firebase";
import { importExercises, listAllExercises } from "./exercises.service";

const TRANSFERS_COLLECTION = "exerciseTransfers";

export type TransferExercise = {
  name: string;
  muscleGroup: string;
  muscles?: string[];
  notes?: string;
  weightType?: "total" | "per-side";
};

export type ExerciseTransferStatus = "pending" | "accepted" | "declined";

export type ExerciseTransfer = {
  id: string;
  fromUid: string;
  fromEmail: string | null;
  fromName: string | null;
  toEmail: string;
  exercises: TransferExercise[];
  status: ExerciseTransferStatus;
  createdAt?: unknown;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Cria uma transferência do banco de exercícios atual para outro usuário (identificado por e-mail).
 * O destinatário aceita pela própria conta nas configurações.
 */
export async function createExerciseTransfer(params: {
  fromUid: string;
  fromEmail: string | null;
  fromName: string | null;
  toEmail: string;
}): Promise<{ transferId: string; count: number }> {
  const toEmail = normalizeEmail(params.toEmail);
  if (!toEmail) {
    throw new Error("E-mail do destinatário é obrigatório.");
  }
  if (params.fromEmail && normalizeEmail(params.fromEmail) === toEmail) {
    throw new Error("Você não pode transferir os exercícios para a sua própria conta.");
  }

  const exercises = await listAllExercises(params.fromUid);
  const payload: TransferExercise[] = exercises.map((ex) => ({
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    muscles: ex.muscles,
    notes: ex.notes,
    weightType: ex.weightType,
  }));

  if (payload.length === 0) {
    throw new Error("Você ainda não tem exercícios cadastrados para compartilhar.");
  }

  const ref = await addDoc(collection(getActiveFirestore(), TRANSFERS_COLLECTION), {
    fromUid: params.fromUid,
    fromEmail: params.fromEmail,
    fromName: params.fromName,
    toEmail,
    exercises: payload,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return { transferId: ref.id, count: payload.length };
}

/**
 * Lista transferências pendentes endereçadas ao e-mail informado.
 */
export async function listIncomingExerciseTransfers(email: string): Promise<ExerciseTransfer[]> {
  const normalized = normalizeEmail(email);
  if (!normalized) return [];

  const q = query(
    collection(getActiveFirestore(), TRANSFERS_COLLECTION),
    where("toEmail", "==", normalized),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      fromUid: data.fromUid,
      fromEmail: data.fromEmail ?? null,
      fromName: data.fromName ?? null,
      toEmail: data.toEmail,
      exercises: (data.exercises ?? []) as TransferExercise[],
      status: data.status as ExerciseTransferStatus,
      createdAt: data.createdAt,
    } satisfies ExerciseTransfer;
  });
}

/**
 * Lista transferências enviadas pelo usuário atual (independente do status).
 */
export async function listOutgoingExerciseTransfers(uid: string): Promise<ExerciseTransfer[]> {
  const q = query(
    collection(getActiveFirestore(), TRANSFERS_COLLECTION),
    where("fromUid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      fromUid: data.fromUid,
      fromEmail: data.fromEmail ?? null,
      fromName: data.fromName ?? null,
      toEmail: data.toEmail,
      exercises: (data.exercises ?? []) as TransferExercise[],
      status: data.status as ExerciseTransferStatus,
      createdAt: data.createdAt,
    } satisfies ExerciseTransfer;
  });
}

/**
 * Aceita uma transferência: mescla os exercícios no banco do destinatário e marca como accepted.
 */
export async function acceptExerciseTransfer(
  transferId: string,
  recipientUid: string
): Promise<{ imported: number; skipped: number }> {
  const ref = doc(getActiveFirestore(), TRANSFERS_COLLECTION, transferId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("Transferência não encontrada.");
  }
  const data = snap.data();
  if (data.status !== "pending") {
    throw new Error("Esta transferência já foi processada.");
  }

  const result = await importExercises(recipientUid, (data.exercises ?? []) as TransferExercise[]);

  await updateDoc(ref, {
    status: "accepted",
    acceptedAt: serverTimestamp(),
    acceptedBy: recipientUid,
  });

  return result;
}

/**
 * Recusa uma transferência pendente.
 */
export async function declineExerciseTransfer(transferId: string): Promise<void> {
  const ref = doc(getActiveFirestore(), TRANSFERS_COLLECTION, transferId);
  await updateDoc(ref, {
    status: "declined",
    declinedAt: serverTimestamp(),
  });
}

/**
 * Remove uma transferência (apenas o remetente pode cancelar antes do aceite).
 */
export async function deleteExerciseTransfer(transferId: string): Promise<void> {
  const ref = doc(getActiveFirestore(), TRANSFERS_COLLECTION, transferId);
  await deleteDoc(ref);
}
