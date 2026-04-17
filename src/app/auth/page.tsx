"use client";

import LandingHeader from "@/components/LandingHeader";
import LandingFooter from "@/components/LandingFooter";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const modeFromUrl = (() => {
    const raw = searchParams.get("mode");
    return raw === "signup" ? "signup" : raw === "login" ? "login" : null;
  })();
  const mode: "login" | "signup" = modeFromUrl ?? "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postAuthRedirect, setPostAuthRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    if (busy) return;
    router.replace(postAuthRedirect ?? "/app");
  }, [busy, isAuthenticated, isLoading, postAuthRedirect, router]);

  const setModeAndUrl = (next: "login" | "signup") => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("mode", next);
    router.replace(`/auth?${nextParams.toString()}`);
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const target = mode === "signup" ? "/app/onboarding" : "/app";
      setPostAuthRedirect(target);
      await signIn("password", {
        flow: mode === "signup" ? "signUp" : "signIn",
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Authentication failed";
      setError(msg === "InvalidSecret" ? "Wrong email or password" : msg);
    } finally {
      setBusy(false);
    }
  };

  const submitGoogle = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      setPostAuthRedirect("/app/onboarding");
      const result = await signIn("google");
      if (result.redirect) window.location.href = result.redirect.toString();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Auth</h1>
      <p className="mt-4 text-sm text-white/70">
        Sign in with email/password or continue with Google.
      </p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-1">
          <button
            type="button"
            onClick={() => setModeAndUrl("login")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === "login" ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setModeAndUrl("signup")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === "signup" ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            Create account
          </button>
        </div>

        <form className="mt-5 grid gap-3" onSubmit={submitPassword}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(244,63,94,0.25)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        <div className="my-5 h-px bg-white/10" />

        <button
          type="button"
          onClick={submitGoogle}
          disabled={busy}
          className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue with Google
        </button>

        {error ? <p className="mt-4 text-sm text-rose-200">{error}</p> : null}
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Auth setup</p>
        <ul className="mt-4 space-y-2 text-sm text-white/80">
          <li>Email + password enabled</li>
          <li>Google sign-in enabled when Google env vars are set in Convex</li>
          <li>Password reset not configured</li>
        </ul>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <LandingHeader rightLinkTo="/" rightLabel="Home" />
      <Suspense fallback={<div className="mx-auto w-full max-w-xl px-6 py-16"><div className="h-96 animate-pulse rounded-3xl bg-white/5" /></div>}>
        <AuthForm />
      </Suspense>
      <LandingFooter />
    </div>
  );
}
