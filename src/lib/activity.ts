"use client";

import { lsGetJson, lsSetJson } from "@/lib/localStore";

export type ActivityStore = {
  viewedYouByUserId: Record<string, string[]>;
  youViewedByUserId: Record<string, string[]>;
};

const KEY = "aligned_activity_v0";

function readStore(): ActivityStore {
  return lsGetJson<ActivityStore>(KEY, { viewedYouByUserId: {}, youViewedByUserId: {} });
}

function writeStore(s: ActivityStore) {
  lsSetJson(KEY, s);
}

export function listViewedYou(userId: string): string[] {
  return readStore().viewedYouByUserId[userId] ?? [];
}

export function listYouViewed(userId: string): string[] {
  return readStore().youViewedByUserId[userId] ?? [];
}

export function markViewedYou(userId: string, profileId: string) {
  const s = readStore();
  const cur = s.viewedYouByUserId[userId] ?? [];
  if (cur.includes(profileId)) return;
  s.viewedYouByUserId[userId] = [profileId, ...cur];
  writeStore(s);
}

export function markYouViewed(userId: string, profileId: string) {
  const s = readStore();
  const cur = s.youViewedByUserId[userId] ?? [];
  if (cur.includes(profileId)) return;
  s.youViewedByUserId[userId] = [profileId, ...cur];
  writeStore(s);
}
