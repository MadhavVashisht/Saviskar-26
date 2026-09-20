import Link from "next/link";
import { ArrowLeft, Compass, CalendarDays, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07050a] px-6 text-white selection:bg-violet-500 selection:text-white">
      {/* Deep atmospheric ambient lights */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15)_0%,rgba(6,182,212,0.05)_45%,transparent_75%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      <div className="relative z-10 mx-auto max-w-lg text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1 text-[11px] font-mono tracking-widest text-violet-300 uppercase mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          SECTOR 404 // UNCHARTED REALM
        </div>

        <h1 className="text-7xl font-extrabold tracking-tight sm:text-8xl md:text-9xl bg-gradient-to-b from-white via-white/80 to-white/20 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]">
          404
        </h1>

        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Coordinate Beyond Known Realms
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
          The stage or rulebook you are searching for does not exist in the Saviskar 2026 registry. Verify your navigation link or explore the active festival sectors below.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-violet-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] sm:w-auto"
          >
            <Home size={16} />
            <span>Return to Mainstage</span>
          </Link>

          <Link
            href="/events"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:border-violet-400 hover:bg-white/10 sm:w-auto"
          >
            <Compass size={16} />
            <span>Explore 50+ Realms</span>
          </Link>

          <Link
            href="/schedule"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-violet-400 hover:bg-white/10 sm:w-auto"
          >
            <CalendarDays size={16} />
            <span>Schedule</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
