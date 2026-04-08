"use client";

import LandingHeader from "@/components/LandingHeader";
import LandingFooter from "@/components/LandingFooter";
import { setSession } from "@/lib/session";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-black text-white">
      <LandingHeader rightLinkTo="/" rightLabel="Home" />
      <main className="mx-auto w-full max-w-xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Auth</h1>
        <p className="mt-4 text-sm text-white/70">
          Temporary login only. Backend auth comes later.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setSession({ role: "user" });
              router.push("/app/onboarding");
            }}
            className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => {
              setSession({ role: "user" });
              router.push("/app/onboarding");
            }}
            className="rounded-3xl bg-gradient-to-r from-rose-500 to-amber-400 px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(244,63,94,0.25)] transition hover:brightness-105"
          >
            Create account
          </button>
        </div>
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Coming next</p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>Email + password</li>
            <li>Google sign-in + account linking</li>
            <li>Password reset (behind email toggle)</li>
          </ul>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
