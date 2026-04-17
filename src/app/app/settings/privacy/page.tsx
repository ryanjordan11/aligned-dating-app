"use client";

export default function PrivacyPage() {
  return (
    <main className="p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-white">Privacy & Safety</h2>
        <p className="mt-2 text-sm text-white/60">Control your visibility and who can contact you.</p>
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Profile Visibility</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Who Can Message</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Location Precision</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Pause Profile</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
      </div>
    </main>
  );
}
