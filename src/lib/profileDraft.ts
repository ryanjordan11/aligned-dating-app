"use client";

import { lsGetJson, lsSetJson } from "@/lib/localStore";

export type ProfileDraft = {
  name: string;
  gender: "male" | "female" | "non-binary";
  birthDate: string;
  bio: string;
  relationshipGoal: "friends" | "marriage" | "long_term" | "short_term" | "just_looking" | "";
  sunSign: string;
  mbti: string;
  hasChildren: boolean | "";
  wantsChildren: "yes" | "no" | "unsure" | "";
  everMarried: boolean | "";
  currentlyMarried: boolean | "";
  vaccinationStatus: "vax_free" | "vaccinated" | "prefer_not_to_say" | "";
  practices: string[];
  morningRitual: string;
  manifesting: string;
  reflection: string;
  backgroundPhotoUrl: string;
  currentCity: string;
  currentCountryCode: string;
  photoUrls: string[];
  preferences: {
    gender: "any" | "male" | "female" | "non-binary";
    minAge: number;
    maxAge: number;
    radius: number;
  };
  updatedAt: number;
};

const KEY = "aligned_profile_drafts_v0";

type Store = {
  byUserId: Record<string, ProfileDraft>;
};

function readStore(): Store {
  return lsGetJson<Store>(KEY, { byUserId: {} });
}

function writeStore(s: Store) {
  lsSetJson(KEY, s);
}

export function defaultProfileDraft(): ProfileDraft {
  return {
    name: "",
    gender: "female",
    birthDate: "",
    bio: "",
    relationshipGoal: "",
    sunSign: "",
    mbti: "",
    hasChildren: "",
    wantsChildren: "",
    everMarried: "",
    currentlyMarried: "",
    vaccinationStatus: "",
    practices: [],
    morningRitual: "",
    manifesting: "",
    reflection: "",
    backgroundPhotoUrl: "",
    currentCity: "",
    currentCountryCode: "",
    photoUrls: [],
    preferences: {
      gender: "any",
      minAge: 18,
      maxAge: 100,
      radius: 500,
    },
    updatedAt: Date.now(),
  };
}

export function getProfileDraft(userId: string): ProfileDraft {
  return readStore().byUserId[userId] ?? defaultProfileDraft();
}

export function saveProfileDraft(userId: string, draft: ProfileDraft): ProfileDraft {
  const s = readStore();
  const next: ProfileDraft = {
    ...draft,
    updatedAt: Date.now(),
  };
  s.byUserId[userId] = next;
  writeStore(s);
  return next;
}
