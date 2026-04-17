"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession } from "@/lib/session";
import { useMounted } from "@/lib/useMounted";
import { Activity, Flame, Home, MessageCircle, Sparkles, User } from "lucide-react";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";

function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-white text-black" : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

type MobileNavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const MOBILE_NAV: MobileNavItem[] = [
  { href: "/app", label: "Home", Icon: Home },
  { href: "/app/messages", label: "Messages", Icon: MessageCircle },
  { href: "/app/vibes", label: "Vibes", Icon: Flame },
  { href: "/app/activity", label: "Activity", Icon: Activity },
  { href: "/app/community", label: "Community", Icon: Sparkles },
  { href: "/app/profile/me", label: "Profile", Icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const mounted = useMounted();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const appUser = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const { signOut } = useAuthActions();
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const isMessageThread = pathname.startsWith("/app/messages/") && pathname !== "/app/messages";
  const isProfileView = pathname.startsWith("/app/profile/");
  const isProfileMe = pathname === "/app/profile/me";
  const isOnboarding = pathname.startsWith("/app/onboarding");
  const isVerify = pathname.startsWith("/app/verify");
  const isFullScreen = isMessageThread || (isProfileView && !isProfileMe) || isOnboarding || isVerify;

  useEffect(() => {
    if (!mounted) return;
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }
    // `appUser` is undefined while the query is loading.
    if (appUser === undefined) return;
    if (!appUser?.onboardedAt && !isOnboarding) {
      router.replace("/app/onboarding");
    }
  }, [appUser, isAuthenticated, isLoading, isOnboarding, mounted, router]);

  if (!mounted || isLoading || (isAuthenticated && appUser === undefined)) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {!isOnboarding ? (
        <header className="sticky top-0 z-30 hidden border-b border-white/10 bg-black/50 backdrop-blur md:block">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-rose-500 to-amber-400" />
                Aligned
              </Link>
              <nav className="hidden items-center gap-2 md:flex" aria-label="App navigation">
                <NavItem href="/app" label="Home" />
                <NavItem href="/app/vibes" label="Vibes" />
                <NavItem href="/app/messages" label="Messages" />
                <NavItem href="/app/activity" label="Activity" />
                <NavItem href="/app/community" label="Community" />
                <NavItem href="/app/admin" label="Admin" />
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={loggingOut}
                onClick={async () => {
                  if (loggingOut) return;
                  setLoggingOut(true);
                  try {
                    await signOut();
                  } finally {
                    clearSession();
                    router.replace("/auth");
                    setLoggingOut(false);
                  }
                }}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Log out
              </button>
            </div>
          </div>
          <div className="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </header>
      ) : null}

      <div
        className={
          isFullScreen
            ? "mx-auto w-full max-w-none p-0"
            : "mx-auto w-full max-w-none px-4 py-6 pb-24 md:max-w-6xl md:px-5 md:pb-6"
        }
      >
        {children}
      </div>

      {!isFullScreen ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/70 backdrop-blur md:hidden"
          aria-label="Bottom navigation"
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3">
            {MOBILE_NAV.map((item) => {
              const active =
                pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-1 px-2"
                >
                  <item.Icon className={`h-5 w-5 ${active ? "text-white" : "text-white/55"}`} />
                  <span className={`text-[11px] font-semibold ${active ? "text-white" : "text-white/55"}`}>
                    {item.label}
                  </span>
                  <span
                    className={`mt-0.5 h-0.5 w-6 rounded-full ${active ? "bg-white/70" : "bg-transparent"}`}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
