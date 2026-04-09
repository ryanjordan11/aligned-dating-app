"use client";

import { lsGetJson, lsSetJson } from "@/lib/localStore";

export type VerificationStatus = "none" | "pending" | "approved";

export type VerificationDraft = {
  status: VerificationStatus;
  selfieUrl: string;
  prompt: string;
  updatedAt: number;
};

const KEY = "aligned_verification_v0";

type Store = {
  byUserId: Record<string, VerificationDraft>;
};

function readStore(): Store {
  return lsGetJson<Store>(KEY, { byUserId: {} });
}

function writeStore(store: Store) {
  lsSetJson(KEY, store);
}

export function getVerificationDraft(userId: string): VerificationDraft {
  return readStore().byUserId[userId] ?? { status: "none", selfieUrl: "", prompt: "", updatedAt: 0 };
}

export function saveVerificationDraft(userId: string, draft: VerificationDraft): VerificationDraft {
  const store = readStore();
  store.byUserId[userId] = {
    ...draft,
    updatedAt: Date.now(),
  };
  writeStore(store);
  return store.byUserId[userId];
}
