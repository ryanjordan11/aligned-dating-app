"use client";

export default function PreferencesPage() {
  return (
    <main className="p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-white">Preferences</h2>
        <p className="mt-2 text-sm text-white/60">Control who you see and how you discover matches.</p>
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Gender Preference</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Age Range</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Distance</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Show Verified Only</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
      </div>
    </main>
  );
}
