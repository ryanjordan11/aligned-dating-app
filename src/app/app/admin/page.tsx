"use client";

export default function AdminPage() {
  return (
    <div className="grid gap-5">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-3 text-sm text-white/70">
          Placeholder UI. Later: roles (superadmin/admin/mod/support), reports, user lookup, feature toggles.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Reports</p>
          <p className="mt-3 text-4xl font-bold">12</p>
          <p className="mt-2 text-sm text-white/65">Pending review</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Chat requests</p>
          <p className="mt-3 text-4xl font-bold">248</p>
          <p className="mt-2 text-sm text-white/65">Last 24 hours</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Boost</p>
          <p className="mt-3 text-4xl font-bold">On</p>
          <p className="mt-2 text-sm text-white/65">Admin toggle (free for now)</p>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Moderation queue</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white/90">Report #{1000 + i}</p>
              <p className="mt-2 text-sm text-white/70">Reason: harassment (placeholder)</p>
              <div className="mt-4 flex gap-2">
                <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition">
                  Dismiss
                </button>
                <button className="rounded-2xl bg-rose-500/85 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition">
                  Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

