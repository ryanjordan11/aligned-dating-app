"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mic, Phone, Plus, Send, Video } from "lucide-react";
import { useMemo } from "react";
import { findMatchByThreadId } from "@/lib/matches";
import { getSession } from "@/lib/session";
import { useMounted } from "@/lib/useMounted";

type ChatMessage = {
  id: string;
  side: "in" | "out";
  text?: string;
  time?: string;
  attachment?: { kind: "image"; src: string; alt: string };
};

const THREAD_META: Record<string, { name: string; online: boolean }> = {
  t1: { name: "Devon Lane", online: true },
  t2: { name: "Kristin Watson", online: true },
  t3: { name: "Albert Flores", online: false },
  t4: { name: "Floyd Miles", online: true },
  t5: { name: "Courtney Henry", online: false },
};

const DEMO: Record<string, ChatMessage[]> = {
  t2: [
    { id: "m1", side: "out", text: "Hey there 👋 How’s your day going now?" },
    { id: "m2", side: "in", text: "Pretty good so far. Just finished work now 😌", time: "12:31 PM" },
    { id: "m3", side: "out", text: "That sounds nice. Any plans for tonight?" },
    {
      id: "m4",
      side: "in",
      attachment: { kind: "image", src: "/landing/profile-2.jpg", alt: "Photo attachment" },
    },
  ],
};

function Bubble({
  side,
  children,
}: {
  side: "in" | "out";
  children: React.ReactNode;
}) {
  const isOut = side === "out";
  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-snug ${
          isOut
            ? "bg-white/10 text-white/90"
            : "bg-black/35 text-white/80 border border-white/10"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ThreadPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId;
  const mounted = useMounted();
  const match = useMemo(() => {
    if (!mounted) return null;
    const s = getSession();
    if (!s) return null;
    return findMatchByThreadId(s.userId, threadId);
  }, [mounted, threadId]);

  const meta = useMemo(() => {
    const base = THREAD_META[threadId] ?? { name: "Savannah", online: true };
    return match ? { ...base, name: match.name } : base;
  }, [match, threadId]);
  const msgs = DEMO[threadId] ?? DEMO.t2;

  return (
    <div className="w-full">
      <section className="relative min-h-[100svh] overflow-hidden bg-gradient-to-b from-white/5 to-black/40 md:mx-auto md:max-w-md md:rounded-[32px] md:border md:border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-16 top-16 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="absolute -right-20 bottom-16 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_55%)]" />
        </div>

        <header className="relative sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-black/35 px-4 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <Link
              href="/app/messages"
              aria-label="Back"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/90">{meta.name}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
                <span className={`h-2 w-2 rounded-full ${meta.online ? "bg-emerald-400" : "bg-white/25"}`} />
                {meta.online ? "Online" : "Offline"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Call"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
            >
              <Phone className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Video"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
            >
              <Video className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto px-4 py-4">
          <div className="grid gap-3 pb-28">
            {msgs.map((m) => {
              if (m.attachment?.kind === "image") {
                return (
                  <div key={m.id} className="flex justify-start">
                    <div className="rounded-[28px] border border-white/10 bg-black/35 p-2">
                      <div className="relative h-44 w-44 overflow-hidden rounded-[22px]">
                        <Image
                          src={m.attachment.src}
                          alt={m.attachment.alt}
                          fill
                          className="object-cover"
                          sizes="176px"
                          priority={false}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className="grid gap-2">
                  <Bubble side={m.side}>{m.text}</Bubble>
                  {m.time ? (
                    <div className={`text-xs text-white/50 ${m.side === "out" ? "text-right" : "text-left"}`}>
                      {m.time}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </main>

        <footer className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 px-4 py-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Add"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="flex h-11 flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4">
              <span className="text-xs text-white/40">Type your messages...</span>
            </div>
            <button
              type="button"
              aria-label="Send"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 text-white shadow-[0_16px_45px_rgba(244,63,94,0.25)] transition hover:brightness-105"
            >
              <Send className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Voice"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </footer>
      </section>

      <p className="mt-4 text-xs text-white/45">
        Placeholder thread UI. Later: mutual match or accepted chat request unlocks this thread.
      </p>
    </div>
  );
}
