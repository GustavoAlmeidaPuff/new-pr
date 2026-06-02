import type { Auth, User } from "firebase/auth";

import { primaryAuth, secondaryAuth } from "../config/firebase";

export type AccountSlot = 0 | 1;

export const MAX_ACCOUNT_SLOTS = 2;

export type AccountSummary = {
  slot: AccountSlot;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

const ACTIVE_SLOT_KEY = "newpr:active-account-slot";

export function getAuthForSlot(slot: AccountSlot): Auth {
  return slot === 0 ? primaryAuth : secondaryAuth;
}

export function getStoredActiveSlot(): AccountSlot {
  return localStorage.getItem(ACTIVE_SLOT_KEY) === "1" ? 1 : 0;
}

export function setStoredActiveSlot(slot: AccountSlot) {
  localStorage.setItem(ACTIVE_SLOT_KEY, String(slot));
}

export function toAccountSummary(slot: AccountSlot, user: User): AccountSummary {
  return {
    slot,
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export function getFirstEmptySlot(users: readonly [User | null, User | null]): AccountSlot | null {
  if (!users[0]) return 0;
  if (!users[1]) return 1;
  return null;
}

export function getAccountLabel(account: AccountSummary): string {
  return account.displayName ?? account.email ?? "Conta";
}

export function getAccountInitial(account: AccountSummary): string {
  const source = account.displayName ?? account.email ?? "?";
  return source[0]?.toUpperCase() ?? "?";
}
