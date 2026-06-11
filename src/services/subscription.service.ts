import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getDocumentData } from "../cache/firestoreCache";
import { getActiveFirestore } from "../config/firebase";

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "incomplete" | "trialing" | "unpaid" | null;

export type SubscriptionData = {
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  updatedAt?: unknown;
  createdAt?: unknown;
};

/**
 * Obtém os dados de assinatura do usuário
 */
export async function getSubscriptionData(
  userId: string
): Promise<SubscriptionData | null> {
  const subscriptionRef = doc(getActiveFirestore(), "users", userId, "subscription", "current");

  return getDocumentData<SubscriptionData | null>(
    `subscription:${userId}`,
    {
      refFactory: () => subscriptionRef,
      map: (snapshot) => {
        if (!snapshot || !snapshot.exists()) {
          return null;
        }

        const data = snapshot.data();
        return {
          status: data.status as SubscriptionStatus,
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          currentPeriodEnd: data.currentPeriodEnd?.toDate() || null,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
          updatedAt: data.updatedAt,
          createdAt: data.createdAt,
        };
      },
    }
  );
}

/**
 * Atualiza os dados de assinatura do usuário
 */
export async function updateSubscriptionData(
  userId: string,
  data: Partial<SubscriptionData>
): Promise<void> {
  const subscriptionRef = doc(getActiveFirestore(), "users", userId, "subscription", "current");
  const subscriptionData = await getDocumentData<SubscriptionData | null>(
    `subscription:${userId}`,
    {
      refFactory: () => subscriptionRef,
      map: (snapshot) => {
        if (!snapshot || !snapshot.exists()) {
          return null;
        }
        return snapshot.data() as SubscriptionData;
      },
    }
  );

  if (subscriptionData) {
    await updateDoc(subscriptionRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(subscriptionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Verifica se o usuário tem uma assinatura ativa
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getSubscriptionData(userId);
  
  if (!subscription || !subscription.status) {
    return false;
  }

  const activeStatuses: SubscriptionStatus[] = ["active", "trialing"];
  return activeStatuses.includes(subscription.status);
}
