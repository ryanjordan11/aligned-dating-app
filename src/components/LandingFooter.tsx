"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <Link href={href} className="text-sm text-white/70 hover:text-white transition">
    {label}
  </Link>
);

const LandingFooter = () => {
  const { t } = useTranslation();
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-base font-semibold text-white">
              <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-rose-500 to-amber-400" />
              {t("common.appName")}
            </div>
            <p className="text-sm text-white/60">Verified dating for real connections.</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Product</p>
            <div className="flex flex-col gap-2">
              <FooterLink href="/about" label={t("common.about")} />
              <FooterLink href="/blog" label={t("common.blog")} />
              <FooterLink href="/groups" label="Facebook Groups" />
              <FooterLink href="/safety" label={t("common.safety")} />
              <FooterLink href="/support" label={t("common.support")} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Legal</p>
            <div className="flex flex-col gap-2">
              <FooterLink href="/privacy" label="Privacy" />
              <FooterLink href="/terms" label="Terms" />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {t("common.appName")}. All rights reserved.
          </p>
          <p>Chat unlocks only after both users opt in.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;

