"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Flame, Heart, MessageCircle, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createChatRequest, remainingToday } from "@/lib/chatRequests";
import { getSession } from "@/lib/session";
import { hasLiked, likeProfile, listLikes } from "@/lib/likes";
import { createMatch, listMatches, threadIdForProfile, type Match } from "@/lib/matches";
import { getCountryOptions } from "@/lib/countries";

type Profile = {
  id: string;
  name: string;
  age: number;
  distanceLabel: string;
  tags: string[];
  imageSrc: string;
  online?: boolean;
};

const STORIES = [
  { id: "s0", name: "Active now", active: true },
  { id: "s1", name: "Rose" },
  { id: "s2", name: "Olivia" },
  { id: "s3", name: "Isabella" },
  { id: "s4", name: "Williams" },
] as const;

const PROFILES: Profile[] = [
  {
    id: "p1",
    name: "Isabella",
    age: 27,
    distanceLabel: "3 km away",
    tags: ["Sports", "Photograph", "Music"],
    imageSrc: "/landing/profile-1.jpg",
    online: true,
  },
  {
    id: "p2",
    name: "Savannah",
    age: 24,
    distanceLabel: "8 km away",
    tags: ["Wellness", "Movies", "Talks"],
    imageSrc: "/landing/profile-2.jpg",
    online: true,
  },
  {
    id: "p3",
    name: "Olivia",
    age: 29,
    distanceLabel: "Nearby",
    tags: ["Yoga", "Travel", "Coffee"],
    imageSrc: "/landing/profile-3.jpg",
    online: false,
  },
  {
    id: "p4",
    name: "Rose",
    age: 26,
    distanceLabel: "12 km away",
    tags: ["Art", "Nature", "Gym"],
    imageSrc: "/landing/profile-1.jpg",
    online: true,
  },
];

// Demo-only: pretend these people have already liked the current user, so mutual matches can happen.
const LIKED_YOU_PROFILE_IDS = new Set<string>(["p2", "p4"]);

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const CA_PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
];

const AU_STATES = [
  "Australian Capital Territory",
  "New South Wales",
  "Northern Territory",
  "Queensland",
  "South Australia",
  "Tasmania",
  "Victoria",
  "Western Australia",
];

function StoryAvatar({ name, active }: { name: string; active?: boolean }) {
  const hue = (name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 17) % 360;
  return (
    <div
      className={`relative h-12 w-12 rounded-full p-[2px] ${
        active ? "bg-gradient-to-br from-rose-500 via-amber-400 to-sky-500" : "bg-white/10"
      }`}
      aria-hidden="true"
    >
      <div
        className="h-full w-full rounded-full border border-white/10"
        style={{
          background: `radial-gradient(18px 18px at 30% 30%, hsla(${hue} 90% 70% / 0.65), transparent 65%), linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))`,
        }}
      />
      {active ? (
        <span className="absolute -right-0.5 bottom-0 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-black" />
      ) : null}
    </div>
  );
}

function ProfileCard({
  p,
  priority,
  liked,
  matched,
  onLike,
  onMessage,
}: {
  p: Profile;
  priority?: boolean;
  liked: boolean;
  matched: boolean;
  onLike: () => void;
  onMessage: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/30">
      <div className="relative aspect-[3/4] w-full">
        <Link
          href={`/app/profile/${p.id}`}
          aria-label={`Open ${p.name}'s profile`}
          className="absolute inset-0 z-0"
        >
          <Image src={p.imageSrc} alt="" fill className="object-cover" sizes="50vw" priority={priority} />
        </Link>
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute left-3 top-3 z-20 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-semibold text-white/85 backdrop-blur">
          {p.distanceLabel}
        </div>
        <div className="absolute right-3 top-3 z-30 flex items-center gap-2">
          <button
            type="button"
            aria-label="Like"
            onClick={onLike}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white/90 backdrop-blur transition hover:bg-white/15"
          >
            <Heart className={`h-5 w-5 ${liked || matched ? "fill-rose-500 text-rose-500" : "text-white/90"}`} />
          </button>
          {matched ? (
            <Link
              href={`/app/messages/${threadIdForProfile(p.id)}`}
              aria-label="Message"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white/90 backdrop-blur transition hover:bg-white/15"
            >
              <MessageCircle className="h-5 w-5" />
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Message"
              onClick={onMessage}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white/90 backdrop-blur transition hover:bg-white/15"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 z-20">
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-white">
              {p.name} {p.age}
            </p>
            <span className={`h-2 w-2 rounded-full ${p.online ? "bg-emerald-400" : "bg-white/25"}`} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SwipeCard({
  p,
  liked,
  matched,
  onPass,
  onHot,
  onMessage,
}: {
  p: Profile;
  liked: boolean;
  matched: boolean;
  onPass: () => void;
  onHot: () => void;
  onMessage: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/40">
      <div className="relative aspect-[3/4] w-full">
        <Link
          href={`/app/profile/${p.id}`}
          aria-label={`Open ${p.name}'s profile`}
          className="absolute inset-0 z-0"
        >
          <Image src={p.imageSrc} alt="" fill className="object-cover" sizes="100vw" priority />
        </Link>
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        {matched || liked ? (
          <div className="absolute left-4 top-4 z-20">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur ${
                matched
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-200"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${matched ? "bg-emerald-400" : "bg-rose-500"}`} />
              {matched ? "Matched" : "Liked"}
            </span>
          </div>
        ) : null}

        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <div className="rounded-[26px] border border-white/10 bg-black/40 p-4 backdrop-blur">
            <p className="text-2xl font-extrabold text-white">
              {p.name}, {p.age}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/75">
              <div className="inline-flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${p.online ? "bg-emerald-400" : "bg-white/25"}`} />
                {p.online ? "Active" : "Offline"}
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/25" />
                {p.distanceLabel}
              </div>
            </div>
            <p className="mt-3 text-sm text-white/70">
              {p.name} loves traveling, good coffee, and meaningful conversations. She enjoys discovering new place.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {p.tags.slice(0, 3).map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={onPass}
                aria-label="Pass"
                className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={onHot}
                aria-label="Hot"
                disabled={liked || matched}
                className={`grid h-14 w-14 place-items-center rounded-full text-white shadow-[0_16px_45px_rgba(244,63,94,0.25)] transition ${
                  liked || matched
                    ? "bg-white/10 text-white/55 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-rose-500 to-amber-400 hover:brightness-105"
                }`}
              >
                <Flame className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={onMessage}
                aria-label="Message"
                className={`grid h-12 w-12 place-items-center rounded-full border border-white/10 transition ${
                  matched
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgeRange({
  min,
  max,
  minLimit,
  maxLimit,
  onChangeMin,
  onChangeMax,
}: {
  min: number;
  max: number;
  minLimit: number;
  maxLimit: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  const span = Math.max(1, maxLimit - minLimit);
  const minPct = ((min - minLimit) / span) * 100;
  const maxPct = ((max - minLimit) / span) * 100;
  return (
    <div className="relative mt-3">
      <div className="h-2 w-full rounded-full bg-white/10" />
      <div
        className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
        style={{ left: `${minPct}%`, width: `${Math.max(0, maxPct - minPct)}%` }}
      />
      <input
        type="range"
        min={minLimit}
        max={maxLimit}
        value={min}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChangeMin(Math.min(v, max));
        }}
        className="range-thumb absolute left-0 top-0 h-2 w-full appearance-none bg-transparent"
        style={{ zIndex: min > maxLimit - 5 ? 6 : 5 }}
        aria-label="Minimum age"
      />
      <input
        type="range"
        min={minLimit}
        max={maxLimit}
        value={max}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChangeMax(Math.max(v, min));
        }}
        className="range-thumb absolute left-0 top-0 h-2 w-full appearance-none bg-transparent"
        style={{ zIndex: 7 }}
        aria-label="Maximum age"
      />
      <style jsx>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
          cursor: pointer;
          pointer-events: auto;
        }
        .range-thumb::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
          cursor: pointer;
          pointer-events: auto;
        }
        .range-thumb::-webkit-slider-runnable-track {
          height: 8px;
          background: transparent;
        }
        .range-thumb::-moz-range-track {
          height: 8px;
          background: transparent;
        }
      `}</style>
    </div>
  );
}

export default function AppHome() {
  const router = useRouter();
  const [tab, setTab] = useState<"forYou" | "local" | "global">("forYou");
  const [mode, setMode] = useState<"grid" | "swipe">("grid");
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState<null | { profile: Profile; threadId: string }>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestProfile, setRequestProfile] = useState<Profile | null>(null);
  const [requestNote, setRequestNote] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const session = useMemo(() => (typeof window === "undefined" ? null : getSession()), []);
  const userId = session?.userId ?? "demo_user";
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const load = () => {
      setLikedIds(listLikes(userId));
      setMatches(listMatches(userId));
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, [userId]);

  const [genderPref, setGenderPref] = useState<Array<"men" | "women" | "nonBinary">>(["women"]);
  const [orientation, setOrientation] = useState<
    "straight" | "gay" | "lesbian" | "bisexual"
  >("straight");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(40);
  const [radiusKm, setRadiusKm] = useState(100);
  const [verification, setVerification] = useState<"any" | "verified" | "unverified">("any");
  const [sunSign, setSunSign] = useState<
    | "Aries"
    | "Taurus"
    | "Gemini"
    | "Cancer"
    | "Leo"
    | "Virgo"
    | "Libra"
    | "Scorpio"
    | "Sagittarius"
    | "Capricorn"
    | "Aquarius"
    | "Pisces"
    | "Any"
  >("Any");
  const [countryCode, setCountryCode] = useState<string>("US");
  const [region, setRegion] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  const countries = useMemo(() => getCountryOptions(), []);

  const countryName = useMemo(() => {
    const map = new Map(countries.map((c) => [c.code, c.name]));
    return (code: string) => map.get(code) ?? code;
  }, [countries]);

  const activeProfiles =
    tab === "local"
      ? PROFILES.slice().reverse()
      : tab === "global"
        ? [...PROFILES, ...PROFILES].map((p, idx) => ({
            ...p,
            id: `${p.id}-g${idx}`,
            distanceLabel: "Global",
          }))
        : PROFILES;

  const current = activeProfiles[swipeIndex % activeProfiles.length];
  const matchedIds = useMemo(() => new Set(matches.map((m) => m.profileId)), [matches]);
  const currentLiked = likedIds.includes(current.id);
  const currentMatched = matchedIds.has(current.id);

  const openChatRequest = (p: Profile) => {
    setRequestProfile(p);
    setRequestOpen(true);
    setRequestNote("");
    setRequestError(null);
    setRequestSent(false);
  };

  const handleLike = (p: Profile) => {
    if (matchedIds.has(p.id)) return;
    if (hasLiked(userId, p.id)) return;
    const res = likeProfile(userId, p.id);
    if (!res.ok) return;
    setLikedIds(listLikes(userId));
    // Mutual match: other person already liked you (demo stub).
    if (LIKED_YOU_PROFILE_IDS.has(p.id)) {
      const m = createMatch({ userId, profileId: p.id, name: p.name, imageSrc: p.imageSrc });
      if (m.ok) {
        setMatches(listMatches(userId));
        setMatchOpen({ profile: p, threadId: m.match.threadId });
      }
    }
  };

  return (
    <div className="w-full">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_30%_20%,rgba(255,255,255,0.08),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(760px_560px_at_20%_80%,rgba(56,189,248,0.08),transparent_60%)]" />
      </div>

      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Location</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="truncate text-base font-semibold text-white/90">United States</p>
            <span className="text-white/50">▾</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode((m) => (m === "grid" ? "swipe" : "grid"))}
            aria-label={mode === "grid" ? "Switch to swipe view" : "Switch to grid view"}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
              mode === "swipe" ? "border-white/20 bg-white text-black" : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
            }`}
          >
            <Flame className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Filters"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <div className="h-11 w-11 overflow-hidden rounded-full border border-white/10 bg-white/5" />
        </div>
      </header>

      {mode === "grid" ? (
        <>
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-1">
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => {
                  setTab("forYou");
                  setSwipeIndex(0);
                }}
                className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                  tab === "forYou" ? "bg-white text-black" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                For You
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("local");
                  setSwipeIndex(0);
                }}
                className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                  tab === "local" ? "bg-white text-black" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                Local
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("global");
                  setSwipeIndex(0);
                }}
                className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                  tab === "global" ? "bg-white text-black" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                Global
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {STORIES.map((s) => (
                <div key={s.id} className="flex w-[68px] shrink-0 flex-col items-center gap-2">
                  <StoryAvatar name={s.name} active={"active" in s ? s.active : false} />
                  <p className="w-full truncate text-center text-xs text-white/70">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {mode === "grid" ? (
        <section className="mt-4 grid grid-cols-2 gap-4">
          {activeProfiles.map((p, idx) => (
            <ProfileCard
              key={p.id}
              p={p}
              priority={idx < 4}
              liked={likedIds.includes(p.id)}
              matched={matchedIds.has(p.id)}
              onLike={() => handleLike(p)}
              onMessage={() => openChatRequest(p)}
            />
          ))}
        </section>
      ) : (
        <section className="mt-4">
          <SwipeCard
            p={current}
            liked={currentLiked}
            matched={currentMatched}
            onPass={() => setSwipeIndex((i) => i + 1)}
            onHot={() => {
              handleLike(current);
              setSwipeIndex((i) => i + 1);
            }}
            onMessage={() => {
              if (currentMatched) {
                router.push(`/app/messages/${threadIdForProfile(current.id)}`);
                return;
              }
              openChatRequest(current);
            }}
          />
        </section>
      )}

      {requestOpen && requestProfile ? (
        <div className="fixed inset-0 z-[65]">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70"
            onClick={() => setRequestOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[26px] border border-white/10 bg-black/85 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white/90">Request chat</p>
              <button
                type="button"
                onClick={() => setRequestOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-sm text-white/70">
              Send a request to{" "}
              <span className="text-white/90 font-semibold">{requestProfile.name}</span>. If accepted, messaging opens.
            </p>

            <textarea
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value.slice(0, 300))}
              placeholder="Write a short note (optional, 300 chars max)…"
              className="mt-4 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/90 placeholder:text-white/35 outline-none focus:border-white/20"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-white/45">
              <span>{requestNote.length}/300</span>
              <span>
                {(() => {
                  const s = getSession();
                  if (!s) return "—";
                  return `${remainingToday(s.userId)}/20 left today`;
                })()}
              </span>
            </div>

            {requestError ? <p className="mt-2 text-sm text-rose-200">{requestError}</p> : null}
            {requestSent ? <p className="mt-2 text-sm text-emerald-200">Request sent.</p> : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRequestOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = getSession();
                  if (!s) {
                    setRequestError("You must be logged in.");
                    return;
                  }
                  const res = createChatRequest({
                    fromUserId: s.userId,
                    toProfileId: requestProfile.id,
                    toName: requestProfile.name,
                    note: requestNote,
                  });
                  if (!res.ok) {
                    setRequestError(res.error);
                    return;
                  }
                  setRequestError(null);
                  setRequestSent(true);
                  setRequestNote("");
                }}
                className="rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(244,63,94,0.25)] transition hover:brightness-105"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {matchOpen ? (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/80" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-rose-500/15 blur-3xl" />
            <div className="absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-sky-500/12 blur-3xl" />
          </div>
          <div className="relative flex min-h-[100svh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-black/60 p-6 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Aligned</p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setMatchOpen(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">It’s a match</h2>
              <p className="mt-2 text-sm text-white/70">
                You and <span className="font-semibold text-white/90">{matchOpen.profile.name}</span> liked each other.
              </p>

              <div className="mt-6 flex items-center justify-center">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/10">
                  <Image src={matchOpen.profile.imageSrc} alt="" fill className="object-cover" sizes="112px" priority />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMatchOpen(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                >
                  Keep browsing
                </button>
                <Link
                  href={`/app/messages/${matchOpen.threadId}`}
                  onClick={() => setMatchOpen(null)}
                  className="grid place-items-center rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(244,63,94,0.25)] transition hover:brightness-105"
                >
                  Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_30%_20%,rgba(255,255,255,0.08),transparent_65%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(700px_520px_at_80%_40%,rgba(244,63,94,0.10),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(760px_560px_at_20%_80%,rgba(56,189,248,0.08),transparent_60%)]" />
          </div>

          <header className="relative flex items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-4 py-4 backdrop-blur">
            <p className="text-lg font-bold tracking-tight text-white">Filters</p>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <main className="relative h-[calc(100svh-72px-88px)] overflow-y-auto px-4 py-5">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Discovery</p>
              <div className="mt-3 rounded-3xl border border-white/10 bg-black/30 p-1">
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      ["forYou", "For You"],
                      ["local", "Local"],
                      ["global", "Global"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setTab(key);
                        setSwipeIndex(0);
                      }}
                      className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                        tab === key ? "bg-white text-black" : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Gender Preference</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(
                  [
                    ["men", "Men"],
                    ["women", "Women"],
                    ["nonBinary", "Non-binary"],
                  ] as const
                ).map(([key, label]) => {
                  const on = genderPref.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setGenderPref((prev) => (on ? prev.filter((x) => x !== key) : [...prev, key]));
                      }}
                      className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                        on ? "bg-white text-black" : "border border-white/10 bg-black/30 text-white/80 hover:bg-black/40"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-white/45">Select one or more.</p>
            </section>

            <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Sexual Orientation</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(
                  [
                    ["straight", "Straight"],
                    ["gay", "Gay"],
                    ["lesbian", "Lesbian"],
                    ["bisexual", "Bi sexual"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOrientation(key)}
                    className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                      orientation === key
                        ? "bg-white text-black"
                        : "border border-white/10 bg-black/30 text-white/80 hover:bg-black/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Age Range</p>
              <div className="mt-3 flex items-center justify-between text-sm font-semibold text-white/85">
                <span>{ageMin}</span>
                <span className="text-white/50">to</span>
                <span>{ageMax}</span>
              </div>
              <AgeRange
                min={ageMin}
                max={ageMax}
                minLimit={18}
                maxLimit={100}
                onChangeMin={(v) => setAgeMin(v)}
                onChangeMax={(v) => setAgeMax(v)}
              />
              <p className="mt-3 text-xs text-white/45">18 to 100.</p>
            </section>

            <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Radius</p>
              <div className="mt-3 flex items-center justify-between text-sm font-semibold text-white/85">
                <span>0 km</span>
                <span>{radiusKm} km</span>
                <span>500 km</span>
              </div>
              <input
                className="mt-3 w-full"
                type="range"
                min={0}
                max={500}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
              />
              <p className="mt-3 text-xs text-white/45">Up to 500 km.</p>
            </section>

            <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Verification</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(
                  [
                    ["any", "Any"],
                    ["verified", "Verified"],
                    ["unverified", "Unverified"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setVerification(key)}
                    className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                      verification === key
                        ? "bg-white text-black"
                        : "border border-white/10 bg-black/30 text-white/80 hover:bg-black/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Sun Sign</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(
                  [
                    "Any",
                    "Aries",
                    "Taurus",
                    "Gemini",
                    "Cancer",
                    "Leo",
                    "Virgo",
                    "Libra",
                    "Scorpio",
                    "Sagittarius",
                    "Capricorn",
                    "Aquarius",
                    "Pisces",
                  ] as const
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSunSign(s)}
                    className={`rounded-3xl px-3 py-2 text-sm font-semibold transition ${
                      sunSign === s
                        ? "bg-white text-black"
                        : "border border-white/10 bg-black/30 text-white/80 hover:bg-black/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Location</p>
              <p className="mt-3 text-xs text-white/60">Top countries</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(
                  [
                    { code: "US", label: "USA" },
                    { code: "AU", label: "Australia" },
                    { code: "CA", label: "Canada" },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCountryCode(c.code);
                      setCountryQuery("");
                      setCountryOpen(false);
                      setRegion("");
                    }}
                    className={`rounded-3xl px-3 py-2 text-sm font-semibold transition ${
                      countryCode === c.code
                        ? "bg-white text-black"
                        : "border border-white/10 bg-black/30 text-white/80 hover:bg-black/40"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid gap-2">
                <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">
                    Country
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={countryQuery || countryName(countryCode)}
                      onChange={(e) => {
                        setCountryQuery(e.target.value);
                        setCountryOpen(true);
                      }}
                      onFocus={() => setCountryOpen(true)}
                      placeholder="Type a country…"
                      className="w-full bg-transparent text-sm text-white/85 placeholder:text-white/35 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCountryOpen((v) => !v)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 hover:bg-white/10 transition"
                    >
                      {countryOpen ? "Hide" : "Pick"}
                    </button>
                  </div>

                  {countryOpen ? (
                    <div className="mt-3 max-h-52 overflow-y-auto rounded-2xl border border-white/10 bg-black/60">
                      {countries
                        .filter((c) => {
                          const q = countryQuery.trim().toLowerCase();
                          if (!q) return true;
                          return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
                        })
                        .slice(0, 80)
                        .map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountryCode(c.code);
                              setCountryQuery("");
                              setCountryOpen(false);
                              setRegion("");
                            }}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                              c.code === countryCode ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"
                            }`}
                          >
                            <span className="truncate">{c.name}</span>
                            <span className="ml-3 shrink-0 text-xs font-semibold text-white/45">{c.code}</span>
                          </button>
                        ))}
                      <div className="px-3 py-2 text-xs text-white/35">
                        Type to search. Showing up to 80 results.
                      </div>
                    </div>
                  ) : null}
                </div>
                {countryCode === "US" || countryCode === "CA" || countryCode === "AU" ? (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                    <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">
                      {countryCode === "US" ? "State" : countryCode === "CA" ? "Province" : "State / Territory"}
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="mt-2 w-full bg-transparent text-sm text-white/85 outline-none"
                    >
                      <option value="">Select…</option>
                      {(countryCode === "US"
                        ? US_STATES
                        : countryCode === "CA"
                          ? CA_PROVINCES
                          : AU_STATES
                      ).map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                    <label className="text-xs font-semibold uppercase tracking-[0.25em] text-white/55">
                      Region
                    </label>
                    <input
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="State / province / region"
                      className="mt-2 w-full bg-transparent text-sm text-white/85 placeholder:text-white/35 outline-none"
                    />
                  </div>
                )}
              </div>
            </section>

            <div className="h-10" />
          </main>

          <footer className="relative border-t border-white/10 bg-black/60 px-4 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setGenderPref(["women"]);
                  setOrientation("straight");
                  setAgeMin(18);
                  setAgeMax(40);
                  setRadiusKm(100);
                  setVerification("any");
                  setSunSign("Any");
                  setCountryCode("US");
                  setRegion("");
                  setCountryQuery("");
                  setCountryOpen(false);
                }}
                className="flex-1 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-1 rounded-3xl bg-gradient-to-r from-rose-500 to-amber-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(244,63,94,0.25)] transition hover:brightness-105"
              >
                Apply
              </button>
            </div>
          </footer>
        </div>
      ) : null}
    </div>
  );
}
