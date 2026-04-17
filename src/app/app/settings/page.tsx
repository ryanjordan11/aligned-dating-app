"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";

const MENU_ITEMS = [
  { label: "Account Settings", href: "/app/settings/account", description: "Email, password, login methods" },
  { label: "Preferences", href: "/app/settings/preferences", description: "Discovery and discovery filters" },
  { label: "Privacy & Safety", href: "/app/settings/privacy", description: "Visibility and messaging settings" },
  { label: "Help / Support", href: "/app/settings/support", description: "FAQs and contact support" },
  { label: "Upgrade", href: "/app/settings/upgrade", description: "Premium features" },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-[100svh] bg-black text-white">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/10 bg-black/90 px-4 py-4 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push("/app")}
          aria-label="Back"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-white">Settings</h1>
      </header>

      <main className="p-4">
        <div className="space-y-3">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-0.5 text-xs text-white/50">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
