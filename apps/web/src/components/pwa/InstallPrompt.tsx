'use client';

import { useEffect, useState } from 'react';

/**
 * Shows an "Add to Home Screen" prompt on mobile after 30 seconds.
 * Listens for the browser's beforeinstallprompt event.
 */
export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => Promise<void> } | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => Promise<void> });
      // Only show on touch-capable (mobile) devices, after 30 s
      if (window.matchMedia('(hover: none)').matches) {
        setTimeout(() => setShow(true), 30_000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div
      role="alertdialog"
      aria-label="Install FairChain app"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up"
    >
      <div className="glass flex items-center gap-4 px-5 py-4 shadow-glow">
        {/* Chain icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500/15 border border-accent-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" className="text-accent-500">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <div className="mr-2">
          <p className="text-sm font-semibold text-white">Add FairChain to Home Screen</p>
          <p className="text-xs text-slate-400">Access contracts offline, anytime.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleInstall} className="btn-primary !px-3 !py-1.5 text-xs" type="button">
            Install
          </button>
          <button
            onClick={() => setShow(false)}
            className="btn-ghost !px-3 !py-1.5 text-xs"
            type="button"
            aria-label="Dismiss"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
