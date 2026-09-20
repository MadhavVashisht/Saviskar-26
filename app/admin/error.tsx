"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#07050a] px-6 text-white">
      <div className="relative z-10 max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
          <ShieldAlert size={28} />
        </div>

        <div className="inline-block font-mono text-[10px] tracking-widest text-rose-400 uppercase mb-2">
          ADMIN CONSOLE SESSION ANOMALY
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white">
          Admin Portal Interrupted
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-white/60">
          An error occurred while loading administrative records or gate verification data. Your administrative privileges remain unaffected.
        </p>

        {error.digest && (
          <p className="mt-2 font-mono text-[10px] text-white/35">
            DIGEST: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-violet-100 sm:w-auto"
          >
            <RefreshCw size={14} />
            <span>Retry Operation</span>
          </button>

          <Link
            href="/admin"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium text-white transition hover:border-violet-400 sm:w-auto"
          >
            <LayoutDashboard size={14} />
            <span>Admin Console</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
