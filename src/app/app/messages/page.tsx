"use client";

import Link from "next/link";
import { Bell, CheckCheck, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listChatRequests, type ChatRequest } from "@/lib/chatRequests";
import { listMatches, type Match } from "@/lib/matches";
import { getSession } from "@/lib/session";

type Thread = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unreadCount?: number;
  verified?: boolean;
  read?: boolean;
};

const STORIES = [
  { id: "s0", name: "My Status", active: true },
  { id: "s1", name: "Rose" },
  { id: "s2", name: "Olivia" },
  { id: "s3", name: "Isabella" },
  { id: "s4", name: "Williams" },
] as const;

const THREADS: Thread[] = [
  { id: "t1", name: "Devon Lane", preview: "Hey! Nice to meet", time: "12:27 PM", unreadCount: 2, verified: true },
  { id: "t2", name: "Kristin Watson", preview: "What's up? How are You?", time: "12:27 PM", verified: true, read: true },
  { id: "t3", name: "Albert Flores", preview: "Love your vibe, Let's talk", time: "12:27 PM", verified: true, read: true },
  { id: "t4", name: "Floyd Miles", preview: "Hey! Where from?", time: "12:27 PM", unreadCount: 2, read: false },
  { id: "t5", name: "Courtney Henry", preview: "Talk later, Okay?", time: "12:27 PM", read: false },
];

function Avatar({
  seed,
  ring,
  statusDot,
}: {
  seed: string;
  ring?: boolean;
  statusDot?: boolean;
}) {
  const hue = (seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 17) % 360;
  return (
    <div
      className={`relative h-12 w-12 rounded-full p-[2px] ${
        ring ? "bg-gradient-to-br from-rose-500 via-amber-400 to-sky-500" : "bg-white/10"
      }`}
      aria-hidden="true"
    >
      <div
        className="h-full w-full rounded-full border border-white/10"
        style={{
          background: `radial-gradient(18px 18px at 30% 30%, hsla(${hue} 90% 70% / 0.65), transparent 65%), linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))`,
        }}
      />
      {statusDot ? (
        <span className="absolute -right-0.5 bottom-0 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-black" />
      ) : null}
    </div>
  );
}

export default function MessagesPage() {
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const session = useMemo(() => (typeof window === "undefined" ? null : getSession()), []);

  useEffect(() => {
    const load = () => {
      setRequests(listChatRequests());
      const s = getSession();
      if (!s) return;
      setMatches(listMatches(s.userId));
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const pendingOutgoing = useMemo(() => {
    if (!session) return [];
    return requests.filter((r) => r.fromUserId === session.userId && r.status === "pending");
  }, [requests, session]);

  return (
    <div className="w-full">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_30%_20%,rgba(255,255,255,0.08),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_520px_at_80%_40%,rgba(244,63,94,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(760px_560px_at_20%_80%,rgba(56,189,248,0.08),transparent_60%)]" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
          <Search className="h-4 w-4 text-white/55" />
          <input
            placeholder="Search"
            className="h-8 w-full bg-transparent text-sm text-white/90 placeholder:text-white/40 outline-none"
          />
        </div>
        <button
          type="button"
          aria-label="Filters"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STORIES.map((s) => (
            <div key={s.id} className="flex w-[68px] shrink-0 flex-col items-center gap-2">
              <Avatar seed={s.name} ring statusDot={s.id === "s0"} />
              <p className="w-full truncate text-center text-xs text-white/70">{s.name}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="mt-4 text-sm font-semibold text-white/80">Conversations</h2>
      <div className="mt-3 overflow-hidden rounded-3xl bg-black/10">
        {pendingOutgoing.length ? (
          <div>
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">Requests</p>
            </div>
            {pendingOutgoing.map((r, idx) => (
              <div key={r.id}>
                <div className="flex w-full items-center gap-3 px-4 py-3">
                  <Avatar seed={r.toName} ring={false} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-white/90">{r.toName}</p>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
                        Pending
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-white/60">
                      {r.note ? r.note : "Chat request sent."}
                    </p>
                  </div>
                </div>
                {idx < pendingOutgoing.length - 1 ? <div className="mx-4 h-px bg-white/10" /> : null}
              </div>
            ))}
            <div className="mx-4 h-px bg-white/10" />
          </div>
        ) : null}

        {matches.length ? (
          <div>
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">Matches</p>
            </div>
            {matches.map((m, idx) => (
              <div key={m.id}>
                <Link
                  href={`/app/messages/${m.threadId}`}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                >
                  <Avatar seed={m.name} ring={false} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-white/90">{m.name}</p>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
                        Matched
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-white/60">Say hi.</p>
                  </div>
                </Link>
                {idx < matches.length - 1 ? <div className="mx-4 h-px bg-white/10" /> : null}
              </div>
            ))}
            <div className="mx-4 h-px bg-white/10" />
          </div>
        ) : null}

        {THREADS.map((t, idx) => (
          <div key={t.id}>
            <Link
              href={`/app/messages/${t.id}`}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
            >
              <Avatar seed={t.name} ring={false} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white/90">{t.name}</p>
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${t.verified ? "bg-rose-500" : "bg-transparent"}`}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="shrink-0 text-xs text-white/55">{t.time}</p>
                </div>
                <p className="mt-1 truncate text-xs text-white/60">{t.preview}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end justify-center gap-1">
                {t.unreadCount ? (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-xs font-bold text-white">
                    {t.unreadCount}
                  </span>
                ) : t.read ? (
                  <CheckCheck className="h-4 w-4 text-white/35" aria-label="Read" />
                ) : (
                  <span className="h-4 w-4" aria-hidden="true" />
                )}
              </div>
            </Link>
            {idx < THREADS.length - 1 ? <div className="mx-4 h-px bg-white/10" /> : null}
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-white/45">
        Placeholder UI only. Later: mutual match or accepted chat request unlocks messaging.
      </p>
    </div>
  );
}
