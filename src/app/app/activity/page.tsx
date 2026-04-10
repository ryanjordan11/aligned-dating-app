"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, Heart, MessageCircle, Users } from "lucide-react";
import { getSession } from "@/lib/session";
import { listLikes } from "@/lib/likes";
import { listMatches, type Match } from "@/lib/matches";
import { listViewedYou, listYouViewed, markViewedYou } from "@/lib/activity";
import { useMounted } from "@/lib/useMounted";

const DEMO_USERS = [
  { id: "p1", name: "Isabella", imageSrc: "/landing/profile-1.jpg" },
  { id: "p2", name: "Savannah", imageSrc: "/landing/profile-2.jpg" },
  { id: "p3", name: "Olivia", imageSrc: "/landing/profile-3.jpg" },
  { id: "p4", name: "Rose", imageSrc: "/landing/profile-1.jpg" },
];

function UserRow({
  href,
  name,
  imageSrc,
  subtitle,
}: {
  href?: string;
  name: string;
  imageSrc: string;
  subtitle: string;
}) {
  const inner = (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/5">
        <Image src={imageSrc} alt="" fill className="object-cover" sizes="48px" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-white/50">{subtitle}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
        {inner}
      </Link>
    );
  }

  return <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-4">{inner}</div>;
}

export default function ActivityPage() {
  const session = getSession();
  const userId = session?.userId ?? "";
  const mounted = useMounted();

  useEffect(() => {
    if (!userId) return;
    if (listViewedYou(userId).length) return;
    DEMO_USERS.forEach((user) => {
      markViewedYou(userId, user.id);
    });
  }, [userId]);

  if (!mounted) return null;

  const likedIds = userId ? listLikes(userId) : [];
  const matches: Match[] = userId ? listMatches(userId) : [];
  const viewedYou = userId ? listViewedYou(userId) : [];
  const youViewed = userId ? listYouViewed(userId) : [];
  const likesYou = DEMO_USERS.filter((user) => user.id === "p2" || user.id === "p4");

  return (
    <div className="min-h-[100svh] bg-black text-white">
      <div className="mx-auto w-full max-w-2xl px-4 pb-6">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/85 py-4 backdrop-blur">
          <Link
            href="/app"
            aria-label="Back"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold">Activity</h1>
          <div className="h-11 w-11" />
        </header>

        <main className="space-y-6 pt-4">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-white/70" />
              <h2 className="text-sm font-semibold">Your matches</h2>
            </div>
            <div className="space-y-3">
              {matches.length ? (
                matches.map((match) => (
                  <UserRow
                    key={match.id}
                    href={`/app/messages/${match.threadId}`}
                    name={match.name}
                    imageSrc={match.imageSrc}
                    subtitle="Tap to open chat"
                  />
                ))
              ) : (
                <p className="text-sm text-white/50">No matches yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-white/70" />
              <h2 className="text-sm font-semibold">Who viewed you</h2>
            </div>
            <div className="space-y-3">
              {viewedYou.length ? (
                viewedYou.map((id) => {
                  const user = DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0];
                  return (
                    <UserRow
                      key={id}
                      href={`/app/profile/${id}`}
                      name={user.name}
                      imageSrc={user.imageSrc}
                      subtitle="Viewed your profile"
                    />
                  );
                })
              ) : (
                <p className="text-sm text-white/50">No one has viewed you yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-white/70" />
              <h2 className="text-sm font-semibold">Who you viewed</h2>
            </div>
            <div className="space-y-3">
              {youViewed.length ? (
                youViewed.map((id) => {
                  const user = DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0];
                  return (
                    <UserRow
                      key={id}
                      href={`/app/profile/${id}`}
                      name={user.name}
                      imageSrc={user.imageSrc}
                      subtitle="You opened this profile"
                    />
                  );
                })
              ) : (
                <p className="text-sm text-white/50">You have not viewed anyone yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-white/70" />
              <h2 className="text-sm font-semibold">Who liked you</h2>
            </div>
            <div className="space-y-3">
              {likesYou.length ? (
                likesYou.map((user) => (
                  <UserRow
                    key={user.id}
                    href={`/app/profile/${user.id}`}
                    name={user.name}
                    imageSrc={user.imageSrc}
                    subtitle="Liked your profile"
                  />
                ))
              ) : (
                <p className="text-sm text-white/50">No likes yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-white/70" />
              <h2 className="text-sm font-semibold">Who you liked</h2>
            </div>
            <div className="space-y-3">
              {likedIds.length ? (
                likedIds.map((id) => {
                  const user = DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0];
                  return (
                    <UserRow
                      key={id}
                      href={`/app/profile/${id}`}
                      name={user.name}
                      imageSrc={user.imageSrc}
                      subtitle="You liked this profile"
                    />
                  );
                })
              ) : (
                <p className="text-sm text-white/50">No likes saved yet.</p>
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
