"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Compass } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root route error captured:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07050a] px-6 text-white selection:bg-violet-500 selection:text-white">
      {/* Deep atmospheric ambient lights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.18)_0%,rgba(6,182,212,0.06)_40%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,0,0,0.85)_0%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-lg text-center">
        {/* Warning Icon Badge */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
          <AlertTriangle size={32} />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1 text-[11px] font-mono tracking-widest text-violet-300 uppercase mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          SYSTEM RECOVERY PROTOCOL
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
          Temporary Realm Interruption
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
          An unexpected interruption occurred while syncing festival frequencies. The session has been protected to ensure your data and registrations remain secure.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-white/35">
            DIAGNOSTIC ID: <span className="text-violet-300">{error.digest}</span>
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-violet-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] sm:w-auto"
          >
            <RefreshCw size={16} />
            <span>Reconnect & Retry</span>
          </button>

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:border-violet-400 hover:bg-white/10 sm:w-auto"
          >
            <Home size={16} />
            <span>Return to Mainstage</span>
          </Link>

          <Link
            href="/events"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-violet-400 hover:bg-white/10 sm:w-auto"
          >
            <Compass size={16} />
            <span>Realms</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
