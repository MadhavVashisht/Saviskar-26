"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Trophy } from "lucide-react";

export default function EventDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Event detail error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-[75vh] items-center justify-center px-6 py-20 text-white">
      <div className="relative z-10 max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
          <AlertCircle size={28} />
        </div>

        <div className="inline-block font-mono text-[10px] tracking-widest text-rose-400 uppercase mb-2">
          COMPETITION RECORD OFFLINE
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white">
          Event Specifications Unavailable
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Unable to retrieve registration criteria and prize structures for this competition. Please retry or browse other events.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-violet-100 sm:w-auto"
          >
            <RefreshCw size={14} />
            <span>Reload Event</span>
          </button>

          <Link
            href="/events"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium text-white transition hover:border-violet-400 sm:w-auto"
          >
            <Trophy size={14} />
            <span>Browse All Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
