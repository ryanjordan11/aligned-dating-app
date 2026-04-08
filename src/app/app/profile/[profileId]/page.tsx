"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  age: number;
  distanceLabel: string;
  bio: string;
  tags: string[];
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
    tags: ["Friendly", "Meet", "Love"],
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
    tags: ["Wellness", "Movies", "Talks"],
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
    tags: ["Yoga", "Travel", "Coffee"],
    imageSrc: "/landing/profile-3.jpg",
    bannerSrc: "/landing/profile-2.jpg",
    online: false,
    verified: false,
    pictures: ["/landing/profile-3.jpg", "/landing/profile-2.jpg", "/landing/profile-1.jpg"],
    videos: [],
  },
};

type MediaTab = "all" | "picture" | "videos";

export default function ProfilePage() {
  const params = useParams<{ profileId: string }>();
  const profileId = params.profileId;
  const p = PROFILES[profileId] ?? PROFILES.p1;
  const [tab, setTab] = useState<MediaTab>("all");

  const items =
    tab === "picture"
      ? p.pictures.map((src) => ({ kind: "picture" as const, src }))
      : tab === "videos"
        ? p.videos.map((src) => ({ kind: "video" as const, src }))
        : [...p.pictures.map((src) => ({ kind: "picture" as const, src })), ...p.videos.map((src) => ({ kind: "video" as const, src }))];

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
              {p.verified ? (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-400 text-[12px] font-black text-black">
                  ✓
                </span>
              ) : null}
            </div>

            <div className="mt-2 inline-flex items-center gap-2 text-xs text-white/70">
              <span className={`h-2 w-2 rounded-full ${p.online ? "bg-emerald-400" : "bg-white/25"}`} />
              {p.online ? "Online" : "Offline"}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/70">{p.bio}</p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Message"
              className="rounded-full border border-white/10 bg-white/5 px-8 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
            >
              Message
            </button>
            <button
              type="button"
              aria-label="Share"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {p.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/80"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-7 rounded-[28px] border border-white/10 bg-white/5 p-4">
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
                Videos
              </button>
            </div>

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
    </div>
  );
}
