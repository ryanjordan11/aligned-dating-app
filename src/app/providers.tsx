"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Initializes i18next for react-i18next hooks used by landing components.
import "@/i18n";
import { clearSession, getSession, setSession } from "@/lib/session";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Check .env.local.");
}
const convex = new ConvexReactClient(convexUrl);

function SyncSessionUser() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const upsertFromIdentity = useMutation(api.users.upsertFromIdentity);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      clearSession();
      return;
    }

    let canceled = false;
    void upsertFromIdentity()
      .then((convexUser) => {
        if (canceled || !convexUser) return;

        const existing = getSession();
        const next = {
          userId: convexUser.tokenIdentifier,
          email: convexUser.email,
          name: convexUser.name,
          username: convexUser.username,
          role: convexUser.role,
          onboardedAt: convexUser.onboardedAt,
        };

        const unchanged =
          existing &&
          existing.userId === next.userId &&
          existing.email === next.email &&
          existing.name === next.name &&
          existing.username === next.username &&
          existing.role === next.role &&
          existing.onboardedAt === next.onboardedAt;

        if (!unchanged) setSession(next);
      })
      .catch(() => {
        // keep current session unchanged on transient auth sync failures
      });

    return () => {
      canceled = true;
    };
  }, [isAuthenticated, isLoading, upsertFromIdentity]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      <SyncSessionUser />
      {children}
    </ConvexAuthProvider>
  );
}
