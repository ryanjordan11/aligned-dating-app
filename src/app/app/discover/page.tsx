"use client";

export default function DiscoverPage() {
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_360px]">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Explore</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Discover</h1>
            <p className="mt-3 text-sm text-white/70">
              Swipe and search live here later. This is the inside layout preview.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70">
            radius: 500mi
            <br />
            incognito: on
            <br />
            views: on
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
              <div className="h-56 bg-gradient-to-br from-amber-400/10 via-rose-500/20 to-sky-500/15" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-white/90">Profile {i + 1}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                    verified
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/70">
                  Prompt: “My spiritual practice looks like …” (placeholder)
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition">
                    Pass
                  </button>
                  <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition">
                    Request
                  </button>
                  <button className="rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-105">
                    Like
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="grid gap-5">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Filters</p>
          <div className="mt-4 grid gap-2 text-sm text-white/80">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">show me: all</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">age: 24–38</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">intentions: dating + community</div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">spiritual tags: multi-tradition</div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Boost</p>
          <p className="mt-3 text-sm text-white/70">Admin-toggle feature. 3 hour default.</p>
          <button className="mt-4 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105">
            Activate Boost
          </button>
        </section>
      </aside>
    </div>
  );
}

