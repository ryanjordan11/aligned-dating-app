"use client";

import { isoDateLocal, lsGetJson, lsSetJson } from "@/lib/localStore";

export type ChatRequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export type ChatRequest = {
  id: string;
  fromUserId: string;
  toProfileId: string;
  toName: string;
  note: string;
  createdAt: number;
  status: ChatRequestStatus;
};

const KEY = "aligned_chat_requests_v0";
const DAILY_LIMIT = 20;

type Store = {
  requests: ChatRequest[];
};

function readStore(): Store {
  return lsGetJson<Store>(KEY, { requests: [] });
}

function writeStore(s: Store) {
  lsSetJson(KEY, s);
}

export function listChatRequests(): ChatRequest[] {
  return readStore().requests;
}

export function countSentToday(fromUserId: string): number {
  const today = isoDateLocal();
  return readStore().requests.filter((r) => {
    if (r.fromUserId !== fromUserId) return false;
    if (r.status === "cancelled") return false;
    return isoDateLocal(new Date(r.createdAt)) === today;
  }).length;
}

export function remainingToday(fromUserId: string): number {
  return Math.max(0, DAILY_LIMIT - countSentToday(fromUserId));
}

export function createChatRequest(input: {
  fromUserId: string;
  toProfileId: string;
  toName: string;
  note: string;
}): { ok: true; request: ChatRequest } | { ok: false; error: string } {
  const note = input.note.trim();
  if (note.length > 300) return { ok: false, error: "Note must be 300 characters or less." };
  if (remainingToday(input.fromUserId) <= 0) {
    return { ok: false, error: "Daily chat request limit reached (20/day)." };
  }

  const s = readStore();
  const existing = s.requests.find(
    (r) => r.fromUserId === input.fromUserId && r.toProfileId === input.toProfileId && r.status !== "cancelled",
  );
  if (existing?.status === "pending") return { ok: false, error: "Request already sent." };
  if (existing?.status === "declined") return { ok: false, error: "Request declined." };
  if (existing?.status === "accepted") return { ok: false, error: "Already connected." };
  const request: ChatRequest = {
    id: crypto.randomUUID(),
    fromUserId: input.fromUserId,
    toProfileId: input.toProfileId,
    toName: input.toName,
    note,
    createdAt: Date.now(),
    status: "pending",
  };
  s.requests.unshift(request);
  writeStore(s);
  return { ok: true, request };
}

// No "cancel/withdraw request" in v1. Once sent, the other person decides.
