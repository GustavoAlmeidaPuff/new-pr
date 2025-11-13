import { useEffect, useState } from "react";

import {
  FirestoreError,
  DocumentReference,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

import { firestore } from "../config/firebase";

type UseFirestoreDocumentOptions<T> = {
  path: string;
  listen?: boolean;
  map?: (doc: T) => T;
};

export function useFirestoreDocument<T>({
  path,
  listen = true,
  map,
}: UseFirestoreDocumentOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const ref: DocumentReference = doc(firestore, path);

    if (!listen) {
      getDoc(ref)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const payload = { id: snapshot.id, ...snapshot.data() } as T;
            setData(map ? map(payload) : payload);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setData(null);
        } else {
          const payload = { id: snapshot.id, ...snapshot.data() } as T;
          setData(map ? map(payload) : payload);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [listen, map, path]);

  return { data, loading, error };
}

