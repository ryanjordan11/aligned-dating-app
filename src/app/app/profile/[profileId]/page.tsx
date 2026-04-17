"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, MoreVertical, Settings, Shield, Headphones, Zap, X } from "lucide-react";
import { getSession } from "@/lib/session";
import { getProfileDraft } from "@/lib/profileDraft";
import { markYouViewed } from "@/lib/activity";
import { getVerificationDraft } from "@/lib/verification";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../../../convex/_generated/api";

type Profile = {
  id: string;
  name: string;
  age: number;
  distanceLabel: string;
  bio: string;
  gender: string;
  relationshipGoal: string;
  sunSign: string;
  mbti: string;
  hasChildren: string;
  wantsChildren: string;
  everMarried: string;
  currentlyMarried: string;
  vaccinationStatus: string;
  verificationStatus: "none" | "pending" | "approved";
  tags: string[];
  practices: string[];
  morningRitual: string;
  manifesting: string;
  reflection: string;
  imageSrc: string;
  bannerSrc: string;
  online?: boolean;
  verified?: boolean;
  pictures: string[];
  videos: string[]; // thumbnails for now
};

const PROFILES: Record<string, Profile> = {
  p1: {
    id: "p1",
    name: "Isabella",
    age: 27,
    distanceLabel: "3 km away from near you",
    bio: "Isabella loves traveling, good coffee, and meaningful conversations. She enjoys discovering new place.",
    gender: "woman",
    relationshipGoal: "long_term",
    sunSign: "Libra",
    mbti: "ENFJ",
    hasChildren: "no",
    wantsChildren: "unsure",
    everMarried: "no",
    currentlyMarried: "no",
    vaccinationStatus: "vaccinated",
    verificationStatus: "approved",
    tags: ["Friendly", "Meet", "Love"],
    practices: ["Meditation", "Yoga", "Nature"],
    morningRitual: "Coffee, journaling, and a silent walk before the day starts.",
    manifesting: "Aligned love and a calmer pace of life.",
    reflection: "Growing by staying consistent with what matters.",
    imageSrc: "/landing/profile-1.jpg",
    bannerSrc: "/landing/profile-3.jpg",
    online: true,
    verified: true,
    pictures: ["/landing/profile-1.jpg", "/landing/profile-2.jpg", "/landing/profile-3.jpg", "/landing/profile-1.jpg"],
    videos: ["/landing/profile-3.jpg", "/landing/profile-2.jpg"],
  },
  p2: {
    id: "p2",
    name: "Savannah",
    age: 24,
    distanceLabel: "8 km away from near you",
    bio: "I enjoy meaningful chats, and exploring new places. Creative, friendly, and always curious.",
    gender: "woman",
    relationshipGoal: "just_looking",
    sunSign: "Gemini",
    mbti: "INFP",
    hasChildren: "no",
    wantsChildren: "yes",
    everMarried: "no",
    currentlyMarried: "no",
    vaccinationStatus: "prefer_not_to_say",
    verificationStatus: "approved",
    tags: ["Wellness", "Movies", "Talks"],
    practices: ["Breathwork", "Tarot", "Sound Healing"],
    morningRitual: "Stretching, tea, and a few minutes of silence.",
    manifesting: "A grounded partnership with shared intention.",
    reflection: "Slowing down has been the biggest shift.",
    imageSrc: "/landing/profile-2.jpg",
    bannerSrc: "/landing/profile-1.jpg",
    online: true,
    verified: true,
    pictures: ["/landing/profile-2.jpg", "/landing/profile-1.jpg", "/landing/profile-3.jpg", "/landing/profile-2.jpg"],
    videos: ["/landing/profile-1.jpg"],
  },
  p3: {
    id: "p3",
    name: "Olivia",
    age: 29,
    distanceLabel: "Nearby",
    bio: "Energy first. Intention always. Looking for someone aligned.",
    gender: "woman",
    relationshipGoal: "long_term",
    sunSign: "Scorpio",
    mbti: "INTJ",
    hasChildren: "yes",
    wantsChildren: "no",
    everMarried: "yes",
    currentlyMarried: "no",
    vaccinationStatus: "vax_free",
    verificationStatus: "none",
    tags: ["Yoga", "Travel", "Coffee"],
    practices: ["Astrology", "Reiki", "Soul Prompts"],
    morningRitual: "Sunlight, breathwork, and a quick gratitude check-in.",
    manifesting: "Deep connection with someone emotionally available.",
    reflection: "Protecting my energy is part of the work.",
    imageSrc: "/landing/profile-3.jpg",
    bannerSrc: "/landing/profile-2.jpg",
    online: false,
    verified: false,
    pictures: ["/landing/profile-3.jpg", "/landing/profile-2.jpg", "/landing/profile-1.jpg"],
    videos: [],
  },
};

type MediaTab = "all" | "picture" | "videos";

function ageFromBirthDate(birthDate?: string): number | null {
  if (!birthDate) return null;
  const [yearStr, monthStr, dayStr] = birthDate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return null;
  const today = new Date();
  let age = today.getFullYear() - year;
  const beforeBirthday =
    today.getMonth() + 1 < month || ((today.getMonth() + 1 === month) && today.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age;
}

function formatSignal(value: string): string {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ProfilePage() {
  const params = useParams<{ profileId: string }>();
  const router = useRouter();
  const profileId = params.profileId;
  const session = profileId === "me" ? getSession() : null;
  const draft = session ? getProfileDraft(session.userId) : null;
  const verification = session ? getVerificationDraft(session.userId) : null;
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const convexMe = useQuery(api.profiles.me, profileId === "me" && isAuthenticated ? {} : "skip");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    if (profileId === "me") return;
    const s = getSession();
    if (!s) return;
    markYouViewed(s.userId, profileId);
  }, [profileId]);
  const p = (() => {
    if (profileId === "me") {
      const s = session;
      const birthDate = convexMe?.birthDate ?? draft?.birthDate;
      const draftAge = ageFromBirthDate(birthDate);
      const name = convexMe?.name?.trim() || draft?.name?.trim() || s?.name || "You";
      const city = convexMe?.currentCity || draft?.currentCity || "";
      return {
        id: "me",
        name,
        age: draftAge ?? 27,
        distanceLabel:
          city || draft?.currentCountryCode
            ? [city, draft?.currentCountryCode].filter(Boolean).join(", ")
            : "Your profile",
        bio: draft?.bio?.trim() || "This is your profile (stub). Later: edit, verification, media upload, intentions.",
        gender: convexMe?.gender || draft?.gender || "female",
        relationshipGoal: draft?.relationshipGoal || "",
        sunSign: draft?.sunSign || "",
        mbti: draft?.mbti || "",
        hasChildren: draft?.hasChildren === "" ? "" : draft?.hasChildren ? "yes" : "no",
        wantsChildren: draft?.wantsChildren || "",
        everMarried: draft?.everMarried === "" ? "" : draft?.everMarried ? "yes" : "no",
        currentlyMarried: draft?.currentlyMarried === "" ? "" : draft?.currentlyMarried ? "yes" : "no",
        vaccinationStatus: draft?.vaccinationStatus || "",
        verificationStatus: verification?.status ?? "none",
        tags: ["Aligned", "Real", "Intentional"],
        practices: draft?.practices ?? [],
        morningRitual: draft?.morningRitual?.trim() || "",
        manifesting: draft?.manifesting?.trim() || "",
        reflection: draft?.reflection?.trim() || "",
        imageSrc: convexMe?.primaryPhotoUrl || draft?.photoUrls[0] || "/landing/profile-1.jpg",
        bannerSrc: draft?.backgroundPhotoUrl || "/landing/profile-3.jpg",
        online: true,
        verified: verification?.status === "approved",
        pictures: draft?.photoUrls.length ? draft.photoUrls : ["/landing/profile-1.jpg", "/landing/profile-2.jpg", "/landing/profile-3.jpg"],
        videos: [],
      } satisfies Profile;
    }
    return PROFILES[profileId] ?? PROFILES.p1;
  })();
  const [tab, setTab] = useState<MediaTab>("all");
  const signalPills = [
    p.relationshipGoal,
    p.practices[0],
    p.sunSign || p.mbti,
  ]
    .filter((value): value is string => Boolean(value))
    .map(formatSignal)
    .slice(0, 3);
  const verificationLabel =
    p.verificationStatus === "approved"
      ? "Verified"
      : p.verificationStatus === "pending"
        ? "Pending"
        : "Unverified";

  const items =
    tab === "picture"
      ? p.pictures.map((src) => ({ kind: "picture" as const, src }))
      : tab === "videos"
        ? p.videos.map((src) => ({ kind: "video" as const, src }))
        : [...p.pictures.map((src) => ({ kind: "picture" as const, src })), ...p.videos.map((src) => ({ kind: "video" as const, src }))];
  const showComingSoon = tab === "videos";

  return (
    <div className="w-full">
      <section className="relative min-h-[100svh] overflow-hidden bg-black md:mx-auto md:max-w-md md:rounded-[32px] md:border md:border-white/10">
        <div className="relative h-48 w-full">
          <Image src={p.bannerSrc} alt="" fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/85" />

          <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-4">
          <Link
            href="/app"
            aria-label="Back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-white/90 backdrop-blur transition hover:bg-black/55"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p className="truncate px-2 text-sm font-semibold text-white/90">{p.name}</p>
          <button
            type="button"
            aria-label="More"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-white/90 backdrop-blur transition hover:bg-black/55"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          </header>
        </div>

        <div className="relative px-4">
          <div className="-mt-14 flex w-full justify-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-[3px] border-white/15 bg-black shadow-[0_18px_70px_rgba(0,0,0,0.6)]">
              <Image src={p.imageSrc} alt="" fill className="object-cover" sizes="112px" />
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2">
              <p className="text-xl font-extrabold text-white">{p.name}</p>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  p.verificationStatus === "approved"
                    ? "bg-sky-400 text-black"
                    : p.verificationStatus === "pending"
                      ? "bg-amber-300 text-black"
                      : "bg-white/10 text-white/70"
                }`}
              >
                {verificationLabel}
              </span>
            </div>

            <div className="mt-2 inline-flex items-center gap-2 text-xs text-white/70">
              <span className={`h-2 w-2 rounded-full ${p.online ? "bg-emerald-400" : "bg-white/25"}`} />
              {p.online ? "Online" : "Offline"}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/70">{p.bio}</p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            {profileId === "me" ? (
              <>
                <Link
                  href="/app/profile/edit"
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  Edit profile
                </Link>
                {p.verificationStatus !== "approved" ? (
                  <Link
                    href="/app/verify"
                    className="rounded-full border border-white/10 bg-white/5 px-8 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    Verify now
                  </Link>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                aria-label="Message"
                className="rounded-full border border-white/10 bg-white/5 px-8 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              >
                Message
              </button>
            )}
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-3 gap-2 rounded-full border border-white/10 bg-black/25 p-1">
              <button
                type="button"
                onClick={() => setTab("all")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === "all" ? "bg-white text-black" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTab("picture")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === "picture" ? "bg-white text-black" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                Picture
              </button>
              <button
                type="button"
                onClick={() => setTab("videos")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === "videos" ? "bg-white text-black" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                Video
              </button>
            </div>

            {showComingSoon ? (
              <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm text-white/60">
                Coming soon
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
              {items.length ? (
                items.map((it, idx) => (
                  <div
                    key={`${it.kind}-${it.src}-${idx}`}
                    className="relative aspect-square overflow-hidden rounded-[22px] border border-white/10 bg-black/40"
                  >
                    <Image src={it.src} alt="" fill className="object-cover" sizes="50vw" />
                    {it.kind === "video" ? (
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/45 text-white/90 backdrop-blur">
                          ▶
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm text-white/60">
                  No media yet.
                </div>
              )}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {signalPills.length ? signalPills.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80"
              >
                {t}
              </span>
            )) : null}
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Identity</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/45">Gender</p>
                    <p className="mt-1 text-white/85">{p.gender || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-white/45">Location</p>
                    <p className="mt-1 text-white/85">{p.distanceLabel}</p>
                  </div>
                  <div>
                    <p className="text-white/45">Verification</p>
                    <p className="mt-1 text-white/85">{verificationLabel}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Intentions</p>
                <p className="mt-2 text-sm text-white/80">{p.relationshipGoal || "Not set"}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Astrology</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/45">Sun sign</p>
                    <p className="mt-1 text-white/85">{p.sunSign || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-white/45">MBTI</p>
                    <p className="mt-1 text-white/85">{p.mbti || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Lifestyle</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/45">Has children</p>
                    <p className="mt-1 text-white/85">{p.hasChildren || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-white/45">Wants children</p>
                    <p className="mt-1 text-white/85">{p.wantsChildren || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-white/45">Ever married</p>
                    <p className="mt-1 text-white/85">{p.everMarried || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-white/45">Currently married</p>
                    <p className="mt-1 text-white/85">{p.currentlyMarried || "Not set"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/45">Vaccination status</p>
                    <p className="mt-1 text-white/85">{p.vaccinationStatus || "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Practices & rituals</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.practices.length ? (
                  p.practices.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white/80"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-white/50">No practices added yet.</span>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">My morning ritual looks like...</p>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {p.morningRitual || "No morning ritual added yet."}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">What I&apos;m manifesting right now...</p>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {p.manifesting || "No manifestation note added yet."}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Reflection</p>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  {p.reflection || "No reflection added yet."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Distance</p>
              <p className="mt-2 text-sm text-white/80">{p.distanceLabel}</p>
            </div>
          </div>

          <div className="h-10" />
        </div>
      </section>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border border-white/10 bg-black/95 p-4 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Menu</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              <Link
                href="/app/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/90 transition hover:bg-white/10"
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm font-medium">Account Settings</span>
              </Link>
              <Link
                href="/app/settings/preferences"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/90 transition hover:bg-white/10"
              >
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Preferences</span>
              </Link>
              <Link
                href="/app/settings/privacy"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/90 transition hover:bg-white/10"
              >
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Privacy & Safety</span>
              </Link>
              <Link
                href="/app/settings/support"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/90 transition hover:bg-white/10"
              >
                <Headphones className="h-5 w-5" />
                <span className="text-sm font-medium">Help / Support</span>
              </Link>
              <Link
                href="/app/settings/upgrade"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-white/90 transition hover:bg-white/10"
              >
                <Zap className="h-5 w-5" />
                <span className="text-sm font-medium">Upgrade</span>
              </Link>
              <div className="my-2 border-t border-white/10" />
              <button
                type="button"
                disabled={loggingOut}
                onClick={async () => {
                  setLoggingOut(true);
                  try {
                    await signOut();
                    router.push("/auth");
                  } catch (err) {
                    console.error("Logout failed:", err);
                    setLoggingOut(false);
                  }
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">{loggingOut ? "Logging out..." : "Log out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
