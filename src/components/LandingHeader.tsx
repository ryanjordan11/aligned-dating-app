"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Globe } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type LandingHeaderProps = {
  onLogin?: () => void;
  rightLinkTo?: string;
  rightLabel?: string;
};

const navLinks: { key: "about" | "blog" | "safety" | "support"; to: string }[] = [
  { key: "about", to: "/about" },
  { key: "blog", to: "/blog" },
  { key: "safety", to: "/safety" },
  { key: "support", to: "/support" },
];

const languageOptions: { code: string; label: string; enabled: boolean }[] = [
  { code: "en", label: "English", enabled: true },
  { code: "es", label: "Spanish", enabled: true },
  { code: "fr", label: "French", enabled: false },
  { code: "pt", label: "Portuguese", enabled: false },
  { code: "de", label: "German", enabled: false },
  { code: "it", label: "Italian", enabled: false },
  { code: "hi", label: "Hindi", enabled: false },
  { code: "ar", label: "Arabic", enabled: false },
  { code: "ja", label: "Japanese", enabled: false },
  { code: "ko", label: "Korean", enabled: false },
  { code: "zh-Hans", label: "Chinese (Simplified)", enabled: false },
];

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const LandingHeader = ({ onLogin, rightLinkTo = "/", rightLabel }: LandingHeaderProps) => {
  const { i18n, t } = useTranslation();
  const resolvedRightLabel = rightLabel ?? t("common.home");
  const [langOpen, setLangOpen] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const langButtonRef = useRef<HTMLButtonElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem("aligned_lang", i18n.language);
    } catch {
      // ignore
    }
    try {
      document.documentElement.lang = i18n.language;
    } catch {
      // ignore
    }
  }, [i18n.language]);

  useEffect(() => {
    if (!langOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (langMenuRef.current?.contains(target)) return;
      if (langButtonRef.current?.contains(target)) return;
      setLangOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as never);
    };
  }, [langOpen]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const activeLangLabel = languageOptions.find((l) => l.code === i18n.language)?.label ?? "English";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/35 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-rose-500 to-amber-400" />
            Aligned
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/85 md:flex">
            {navLinks.map((item) => (
              <Link key={item.to} href={item.to} className="group relative text-white/80 hover:text-white transition">
                <span>{t(`common.${item.key}`)}</span>
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-rose-500/80 to-amber-400/80 transition group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              if (installPromptEvent) {
                try {
                  await installPromptEvent.prompt();
                  await installPromptEvent.userChoice;
                } finally {
                  setInstallPromptEvent(null);
                }
                return;
              }
              window.alert("To install: open your browser menu and choose 'Install App' or 'Add to Home Screen'.");
            }}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <span className="inline-flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download App
            </span>
          </button>
          <div className="relative hidden md:block">
            <button
              ref={langButtonRef}
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={langOpen}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              <Globe className="h-4 w-4" />
              {activeLangLabel}
            </button>
            {langOpen && (
              <div
                ref={langMenuRef}
                role="menu"
                aria-label="Language"
                className="absolute right-0 mt-3 w-56 border border-white/10 bg-black/70 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur"
              >
                {languageOptions.map((opt) => {
                  const active = opt.code === i18n.language;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        if (!opt.enabled) return;
                        void i18n.changeLanguage(opt.code);
                        setLangOpen(false);
                      }}
                      disabled={!opt.enabled}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                        !opt.enabled
                          ? "cursor-not-allowed text-white/35"
                          : active
                            ? "bg-white/10 text-white"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {!opt.enabled ? (
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
                          {t("common.soon")}
                        </span>
                      ) : active ? (
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">On</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {onLogin ? (
            <button
              type="button"
              onClick={onLogin}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Log in
            </button>
          ) : (
            <Link
              href={rightLinkTo}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              {resolvedRightLabel}
            </Link>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </header>
  );
};

export default LandingHeader;
