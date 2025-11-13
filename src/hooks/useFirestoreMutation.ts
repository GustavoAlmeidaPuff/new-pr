import { useCallback, useState } from "react";

import {
  FirestoreError,
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { firestore } from "../config/firebase";

type MutationStatus = "idle" | "loading" | "success" | "error";

type MutationOptions<T> = {
  path: string;
  data?: T;
  docId?: string;
  merge?: boolean;
};

export function useFirestoreMutation<T = unknown>() {
  const [status, setStatus] = useState<MutationStatus>("idle");
  const [error, setError] = useState<FirestoreError | null>(null);

  const createDocument = useCallback(
    async ({ path, data }: MutationOptions<T>) => {
      if (!data) {
        throw new Error("Dados são obrigatórios para criar documento");
      }

      setStatus("loading");
      setError(null);

      try {
        const ref = collection(firestore, path);
        const payload = {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(ref, payload);
        setStatus("success");
        return docRef;
      } catch (err) {
        setStatus("error");
        setError(err as FirestoreError);
        throw err;
      }
    },
    [],
  );

  const setDocument = useCallback(
    async ({ path, data, docId, merge = true }: MutationOptions<T>) => {
      if (!data || !docId) {
        throw new Error("Dados e docId são obrigatórios para setDocument");
      }

      setStatus("loading");
      setError(null);

      try {
        const ref = doc(firestore, path, docId);
        await setDoc(
          ref,
          {
            ...data,
            updatedAt: serverTimestamp(),
          },
          { merge },
        );
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err as FirestoreError);
        throw err;
      }
    },
    [],
  );

  const updateDocument = useCallback(
    async ({ path, data, docId }: MutationOptions<T>) => {
      if (!data || !docId) {
        throw new Error("Dados e docId são obrigatórios para updateDocument");
      }

      setStatus("loading");
      setError(null);

      try {
        const ref = doc(firestore, path, docId);
        await updateDoc(ref, {
          ...data,
          updatedAt: serverTimestamp(),
        });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err as FirestoreError);
        throw err;
      }
    },
    [],
  );

  const deleteDocumentById = useCallback(async ({ path, docId }: MutationOptions<T>) => {
    if (!docId) {
      throw new Error("docId é obrigatório para deleteDocument");
    }

    setStatus("loading");
    setError(null);

    try {
      const ref = doc(firestore, path, docId);
      await deleteDoc(ref);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err as FirestoreError);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    error,
    createDocument,
    setDocument,
    updateDocument,
    deleteDocument: deleteDocumentById,
    reset,
  };
}

