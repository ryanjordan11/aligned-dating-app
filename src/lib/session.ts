"use client";

export type AlignedSession = {
  userId: string;
  email?: string;
  name?: string;
  username?: string;
  role?: "user" | "support" | "moderator" | "admin" | "superadmin";
  createdAt: number;
  onboardedAt?: number;
};

const KEY = "aligned_session_v0";

export function getSession(): AlignedSession | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AlignedSession;
    if (!parsed?.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(partial?: Partial<AlignedSession>): AlignedSession {
  const session: AlignedSession = {
    userId: partial?.userId ?? crypto.randomUUID(),
    email: partial?.email,
    name: partial?.name ?? "Ryan Jordan",
    username: partial?.username ?? "alignedryan",
    role: partial?.role ?? "user",
    createdAt: Date.now(),
    onboardedAt: partial?.onboardedAt,
  };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function updateSession(partial: Partial<AlignedSession>): AlignedSession | null {
  const cur = getSession();
  if (!cur) return null;
  const next: AlignedSession = {
    ...cur,
    ...partial,
    userId: cur.userId,
    createdAt: cur.createdAt,
  };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearSession() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function hasCompletedOnboarding(): boolean {
  const session = getSession();
  return Boolean(session?.onboardedAt);
}

export function completeOnboarding(): AlignedSession | null {
  return updateSession({ onboardedAt: Date.now() });
}
