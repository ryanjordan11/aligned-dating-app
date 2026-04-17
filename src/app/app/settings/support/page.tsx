"use client";

export default function SupportPage() {
  return (
    <main className="p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-white">Help / Support</h2>
        <p className="mt-2 text-sm text-white/60">Get help with any questions or issues.</p>
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">FAQs</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Contact Support</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Report a Bug</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
        
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Community Guidelines</p>
          <p className="text-sm text-white">Coming soon</p>
        </div>
      </div>
    </main>
  );
}
