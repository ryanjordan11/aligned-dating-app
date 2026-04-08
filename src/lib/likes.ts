"use client";

import { lsGetJson, lsSetJson } from "@/lib/localStore";

const KEY = "aligned_likes_v0";

type Store = {
  // `profileIds` the user has liked (no unlike in v1).
  byUserId: Record<string, string[]>;
};

function readStore(): Store {
  return lsGetJson<Store>(KEY, { byUserId: {} });
}

function writeStore(s: Store) {
  lsSetJson(KEY, s);
}

export function listLikes(userId: string): string[] {
  const s = readStore();
  return s.byUserId[userId] ?? [];
}

export function hasLiked(userId: string, profileId: string): boolean {
  return listLikes(userId).includes(profileId);
}

export function likeProfile(userId: string, profileId: string): { ok: true } | { ok: false; error: string } {
  const s = readStore();
  const cur = s.byUserId[userId] ?? [];
  if (cur.includes(profileId)) return { ok: false, error: "Already liked." };
  s.byUserId[userId] = [profileId, ...cur];
  writeStore(s);
  return { ok: true };
}

