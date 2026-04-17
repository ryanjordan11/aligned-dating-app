"use client";

export default function AccountSettingsPage() {
  return (
    <main className="p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-white">Account Settings</h2>
        <p className="mt-2 text-sm text-white/60">Email, password, and login management.</p>
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Email</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Password</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Login Methods</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Delete Account</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
      </div>
    </main>
  );
}
