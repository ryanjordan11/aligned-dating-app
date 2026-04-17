"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-[100svh] bg-black text-white">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/10 bg-black/90 px-4 py-4 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-white">Settings</h1>
      </header>
      {children}
    </div>
  );
}
