"use client";

import LandingFooter from "@/components/LandingFooter";
import LandingHeader from "@/components/LandingHeader";
import HeroCollageBackdrop from "@/components/HeroCollageBackdrop";
import LandingChatBot from "@/components/LandingChatBot";
import Reveal from "@/components/Reveal";
import AmbientOrbs from "@/components/AmbientOrbs";
import { useTranslation } from "react-i18next";

type LandingHeroProps = {
  onCreateAccount: () => void;
  onLogin: () => void;
};

const LandingHero = ({ onCreateAccount, onLogin }: LandingHeroProps) => {
  const { t } = useTranslation();
  const whyBullets = t("landing.why.bullets", { returnObjects: true }) as unknown as string[];
  const energyBullets = t("landing.energy.bullets", { returnObjects: true }) as unknown as string[];

  return (
    <div className="w-full bg-black text-white">
      <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-black text-white">
        <HeroCollageBackdrop />
        <LandingHeader onLogin={onLogin} />
        <AmbientOrbs variant="warm" />

        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
          <Reveal from="up">
            <h1 className="text-balance text-5xl font-extrabold tracking-tight sm:text-7xl">
              {t("landing.hero.titleLine1")}
              <span className="block">{t("landing.hero.titleLine2")}</span>
            </h1>
          </Reveal>
          <Reveal from="scale" delay={0.06}>
            <p className="mt-6 max-w-2xl text-sm text-white/75 sm:text-base">{t("landing.hero.sub1")}</p>
          </Reveal>
          <Reveal from="up" delay={0.12}>
            <p className="mt-5 max-w-3xl text-sm text-white/70 sm:text-base">
              {t("landing.hero.sub2a")}
              <span className="block mt-3">{t("landing.hero.sub2b")}</span>
            </p>
          </Reveal>
          <Reveal from="up" delay={0.18}>
            <button
              type="button"
              onClick={onCreateAccount}
              data-testid="landing-create-account"
              className="mt-8 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(244,63,94,0.35)] transition hover:brightness-105"
            >
              {t("landing.hero.cta")}
            </button>
          </Reveal>
          <Reveal from="up" delay={0.22}>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              {t("landing.hero.badges")}
            </p>
          </Reveal>
        </main>
      </section>

      <section className="relative w-full border-t border-white/10 bg-black/20">
        <AmbientOrbs variant="cool" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto w-full max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.corePromise.kicker")}</p>
            <Reveal from="left">
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-6xl">
                {t("landing.corePromise.title")}
              </h2>
            </Reveal>
            <Reveal from="left" delay={0.08}>
              <p className="mt-8 max-w-3xl text-sm text-white/75 sm:text-base">{t("landing.corePromise.p1")}</p>
            </Reveal>
            <Reveal from="left" delay={0.14}>
              <p className="mt-4 max-w-3xl text-sm text-white/70 sm:text-base">{t("landing.corePromise.p2")}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative w-full border-t border-white/10">
        <AmbientOrbs variant="rose" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto w-full max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.features.kicker")}</p>
            <Reveal from="right">
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">{t("landing.features.title")}</h2>
            </Reveal>
            <Reveal from="right" delay={0.08}>
              <p className="mt-6 max-w-3xl text-sm text-white/70 sm:text-base">{t("landing.features.p1")}</p>
            </Reveal>
            <Reveal from="right" delay={0.14}>
              <p className="mt-4 max-w-3xl text-sm text-white/70 sm:text-base">{t("landing.features.p2")}</p>
            </Reveal>

            <div className="mt-12 grid gap-10 md:grid-cols-3">
              <Reveal from="up" delay={0.12}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">{t("landing.features.dKicker")}</p>
                  <p className="mt-3 text-sm text-white/75 sm:text-base">{t("landing.features.dBody")}</p>
                </div>
              </Reveal>
              <Reveal from="up" delay={0.18}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">{t("landing.features.vKicker")}</p>
                  <p className="mt-3 text-sm text-white/75 sm:text-base">{t("landing.features.vBody")}</p>
                </div>
              </Reveal>
              <Reveal from="up" delay={0.24}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">{t("landing.features.cKicker")}</p>
                  <p className="mt-3 text-sm text-white/75 sm:text-base">{t("landing.features.cBody")}</p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full border-t border-white/10 bg-black/20">
        <AmbientOrbs variant="cool" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.discovery.kicker")}</p>
              <Reveal from="left">
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                  {t("landing.discovery.title")}
                </h2>
              </Reveal>
            </div>
            <div className="space-y-8 text-sm text-white/75 sm:text-base">
              <Reveal from="right" delay={0.06}>
                <p className="max-w-xl">{t("landing.discovery.p1")}</p>
              </Reveal>
              <Reveal from="right" delay={0.12}>
                <p className="max-w-xl">{t("landing.discovery.p2")}</p>
              </Reveal>
              <Reveal from="right" delay={0.18}>
                <p className="max-w-xl">{t("landing.discovery.p3")}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full border-t border-white/10">
        <AmbientOrbs variant="rose" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.verification.kicker")}</p>
              <Reveal from="right">
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
                  {t("landing.verification.title")}
                </h2>
              </Reveal>
            </div>
            <div className="space-y-8 text-sm text-white/75 sm:text-base">
              <Reveal from="left" delay={0.06}>
                <p className="max-w-xl">{t("landing.verification.p1")}</p>
              </Reveal>
              <Reveal from="left" delay={0.12}>
                <p className="max-w-xl">{t("landing.verification.p2")}</p>
              </Reveal>
              <Reveal from="left" delay={0.18}>
                <p className="max-w-xl">{t("landing.verification.p3")}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full border-t border-white/10 bg-black/20">
        <AmbientOrbs variant="warm" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.consent.kicker")}</p>
              <Reveal from="left">
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">{t("landing.consent.title")}</h2>
              </Reveal>
            </div>
            <div className="space-y-8 text-sm text-white/75 sm:text-base">
              <Reveal from="up" delay={0.06}>
                <p className="max-w-xl">{t("landing.consent.p1")}</p>
              </Reveal>
              <Reveal from="up" delay={0.12}>
                <p className="max-w-xl">{t("landing.consent.p2")}</p>
              </Reveal>
              <Reveal from="up" delay={0.18}>
                <p className="max-w-xl">{t("landing.consent.p3")}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full border-t border-white/10">
        <AmbientOrbs variant="cool" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto w-full max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.how.kicker")}</p>
            <Reveal from="scale">
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">{t("landing.how.title")}</h2>
            </Reveal>

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <div className="space-y-6 text-sm text-white/75 sm:text-base">
                <Reveal from="left" delay={0.06}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">1</p>
                    <p className="mt-2 text-lg font-semibold text-white">{t("landing.how.s1t")}</p>
                    <p className="mt-2">{t("landing.how.s1b")}</p>
                  </div>
                </Reveal>
                <Reveal from="left" delay={0.12}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">2</p>
                    <p className="mt-2 text-lg font-semibold text-white">{t("landing.how.s2t")}</p>
                    <p className="mt-2">{t("landing.how.s2b")}</p>
                  </div>
                </Reveal>
              </div>
              <div className="space-y-6 text-sm text-white/75 sm:text-base">
                <Reveal from="right" delay={0.1}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">3</p>
                    <p className="mt-2 text-lg font-semibold text-white">{t("landing.how.s3t")}</p>
                    <p className="mt-2">{t("landing.how.s3b")}</p>
                  </div>
                </Reveal>
                <Reveal from="right" delay={0.16}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">4</p>
                    <p className="mt-2 text-lg font-semibold text-white">{t("landing.how.s4t")}</p>
                    <p className="mt-2">{t("landing.how.s4b")}</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full border-t border-white/10 bg-black/20">
        <AmbientOrbs variant="rose" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.why.kicker")}</p>
              <Reveal from="left">
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">{t("landing.why.title")}</h2>
              </Reveal>
            </div>
            <div className="space-y-6 text-sm text-white/75 sm:text-base">
              <Reveal from="right" delay={0.06}>
                <p className="max-w-xl">{t("landing.why.p1")}</p>
              </Reveal>
              <Reveal from="right" delay={0.12}>
                <p className="max-w-xl">{t("landing.why.p2")}</p>
              </Reveal>
              <Reveal from="up" delay={0.18}>
                <div className="space-y-2">
                  {whyBullets.map((b) => (
                    <p key={b} className="max-w-xl">
                      {b}
                    </p>
                  ))}
                </div>
              </Reveal>
              <Reveal from="right" delay={0.24}>
                <p className="max-w-xl">{t("landing.why.p3")}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full border-t border-white/10">
        <AmbientOrbs variant="cool" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.trust.kicker")}</p>
              <Reveal from="right">
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">{t("landing.trust.title")}</h2>
              </Reveal>
            </div>
            <div className="space-y-6 text-sm text-white/75 sm:text-base">
              <Reveal from="left" delay={0.06}>
                <p className="max-w-xl">{t("landing.trust.p1")}</p>
              </Reveal>
              <Reveal from="left" delay={0.12}>
                <p className="max-w-xl">{t("landing.trust.p2")}</p>
              </Reveal>
              <Reveal from="left" delay={0.18}>
                <p className="max-w-xl">{t("landing.trust.p3")}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full border-t border-white/10 bg-black/20">
        <AmbientOrbs variant="warm" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.energy.kicker")}</p>
              <Reveal from="left">
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">{t("landing.energy.title")}</h2>
              </Reveal>
            </div>
            <div className="space-y-6 text-sm text-white/75 sm:text-base">
              <Reveal from="right" delay={0.06}>
                <p className="max-w-xl">{t("landing.energy.p1")}</p>
              </Reveal>
              <Reveal from="up" delay={0.12}>
                <div className="space-y-2">
                  {energyBullets.map((b) => (
                    <p key={b} className="max-w-xl">
                      {b}
                    </p>
                  ))}
                </div>
              </Reveal>
              <Reveal from="right" delay={0.18}>
                <p className="max-w-xl">{t("landing.energy.p2")}</p>
              </Reveal>
              <Reveal from="right" delay={0.24}>
                <p className="max-w-xl">{t("landing.energy.p3")}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full border-t border-white/10">
        <AmbientOrbs variant="rose" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.faq.kicker")}</p>
              <Reveal from="scale">
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">{t("landing.faq.title")}</h2>
              </Reveal>
            </div>
            <div className="space-y-8 text-sm text-white/75 sm:text-base">
              <Reveal from="up" delay={0.06}>
                <div>
                  <h3 className="text-lg font-semibold text-white">{t("landing.faq.q1")}</h3>
                  <p className="mt-2 max-w-xl">{t("landing.faq.a1")}</p>
                </div>
              </Reveal>
              <Reveal from="up" delay={0.12}>
                <div>
                  <h3 className="text-lg font-semibold text-white">{t("landing.faq.q2")}</h3>
                  <p className="mt-2 max-w-xl">{t("landing.faq.a2")}</p>
                </div>
              </Reveal>
              <Reveal from="up" delay={0.18}>
                <div>
                  <h3 className="text-lg font-semibold text-white">{t("landing.faq.q3")}</h3>
                  <p className="mt-2 max-w-xl">{t("landing.faq.a3")}</p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full border-t border-white/10 bg-black/20">
        <AmbientOrbs variant="cool" />
        <div className="relative flex min-h-[100svh] items-center px-6 py-24 md:py-32">
          <div className="mx-auto w-full max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">{t("landing.final.kicker")}</p>
            <Reveal from="up">
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-6xl">
                {t("landing.final.title1")}
                <span className="block">{t("landing.final.title2")}</span>
              </h2>
            </Reveal>
            <Reveal from="up" delay={0.1}>
              <p className="mt-8 max-w-3xl text-sm text-white/70 sm:text-base">{t("landing.final.p1")}</p>
            </Reveal>
            <Reveal from="up" delay={0.16}>
              <div className="mt-10">
                <button
                  type="button"
                  onClick={onCreateAccount}
                  className="rounded-full bg-gradient-to-r from-rose-500 to-amber-400 px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(244,63,94,0.35)] transition hover:brightness-105"
                >
                  {t("common.createAccount")}
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <LandingFooter />
      <LandingChatBot onCreateAccount={onCreateAccount} />
    </div>
  );
};

export default LandingHero;
