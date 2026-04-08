"use client";

import { lsGetJson, lsSetJson } from "@/lib/localStore";

export type Gender = "male" | "female" | "non-binary";
export type Intention = "friends" | "long_term" | "marriage" | "short_term" | "just_looking";

export type AlignedProfile = {
  userId: string;
  name: string;
  username?: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  intention: Intention;
  location: {
    countryCode: string; // ISO-3166 alpha-2
    region?: string; // state/province/region
    city?: string;
  };
  photos: string[]; // stub: URLs or storage ids later
  completedAt?: number;
  updatedAt: number;
};

const KEY = "aligned_profiles_v0";

type Store = {
  byUserId: Record<string, AlignedProfile>;
};

function readStore(): Store {
  return lsGetJson<Store>(KEY, { byUserId: {} });
}

function writeStore(s: Store) {
  lsSetJson(KEY, s);
}

export function getProfile(userId: string): AlignedProfile | null {
  const s = readStore();
  return s.byUserId[userId] ?? null;
}

export function upsertProfile(p: AlignedProfile): void {
  const s = readStore();
  s.byUserId[p.userId] = p;
  writeStore(s);
}

export function hasCompletedProfile(userId: string): boolean {
  const p = getProfile(userId);
  return Boolean(p?.completedAt);
}

