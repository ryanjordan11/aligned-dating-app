"use client";

import { lsGetJson, lsSetJson } from "@/lib/localStore";

export type Match = {
  id: string;
  userId: string;
  profileId: string;
  threadId: string;
  name: string;
  imageSrc: string;
  createdAt: number;
};

const KEY = "aligned_matches_v0";

type Store = {
  matches: Match[];
};

function readStore(): Store {
  return lsGetJson<Store>(KEY, { matches: [] });
}

function writeStore(s: Store) {
  lsSetJson(KEY, s);
}

export function threadIdForProfile(profileId: string): string {
  return `m_${profileId}`;
}

export function listMatches(userId: string): Match[] {
  return readStore().matches.filter((m) => m.userId === userId);
}

export function findMatchByThreadId(userId: string, threadId: string): Match | null {
  return listMatches(userId).find((m) => m.threadId === threadId) ?? null;
}

export function hasMatch(userId: string, profileId: string): boolean {
  return listMatches(userId).some((m) => m.profileId === profileId);
}

export function createMatch(input: {
  userId: string;
  profileId: string;
  name: string;
  imageSrc: string;
}): { ok: true; match: Match } | { ok: false; error: string } {
  const s = readStore();
  const exists = s.matches.find((m) => m.userId === input.userId && m.profileId === input.profileId);
  if (exists) return { ok: false, error: "Already matched." };
  const match: Match = {
    id: crypto.randomUUID(),
    userId: input.userId,
    profileId: input.profileId,
    threadId: threadIdForProfile(input.profileId),
    name: input.name,
    imageSrc: input.imageSrc,
    createdAt: Date.now(),
  };
  s.matches.unshift(match);
  writeStore(s);
  return { ok: true, match };
}

