"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  Activity,
  Cpu,
  Radio,
  Sparkles,
  Volume2,
  Zap,
  Disc,
  Terminal,
  Shield,
  Layers,
} from "lucide-react";
import type { FestivalEdition } from "@/data/starnightArtists";

export default function ArtistCard({
  year,
  edition,
  subtitle,
  attendance,
  tagline,
  heroImage,
  days,
}: FestivalEdition) {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black py-28 text-white selection:bg-violet-500 selection:text-white md:py-36">
      {/* ═══════════════════════════════════════════════════════
          FUTURISTIC ATMOSPHERE: SCANLINES, NEON CONDUITS & GLOW
      ═══════════════════════════════════════════════════════ */}

      {/* Parallax deep background image */}
      <motion.div
        initial={{ scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src={heroImage}
          alt={edition}
          fill
          sizes="100vw"
          className="object-cover object-center opacity-25"
        />
      </motion.div>

      {/* Cybernetic Dark Overlays */}
      <div className="absolute inset-0 bg-black/85" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      {/* High-Tech Cyber Scanlines Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(168, 85, 247, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Plasma Core Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[850px] w-[850px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8A2EFF]/15 blur-[220px]" />
      <div className="pointer-events-none absolute right-[10%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[200px]" />

      {/* Huge Cyber Watermark Year */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
        <span className="font-mono text-[28vw] font-black tracking-tighter text-white/[0.035] drop-shadow-[0_0_80px_rgba(168,85,247,0.15)]">
          {year}
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN HUD CONTAINER
      ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-[1650px] px-5 sm:px-8 md:px-12 lg:px-16">
        {/* Top Sci-Fi Telemetry Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-violet-500/30 pb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_12px_#a855f7] animate-ping" />
            </span>
            <span className="text-violet-300 font-semibold">
              CHRONO_NODE // {year} RECORDINGS
            </span>
            <span className="text-white/20">•</span>
            <span className="hidden sm:inline text-white/40">
              SECTOR: CGC STADIUM MAINSTAGE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Radio size={12} className="animate-pulse" />
              <span>TRANSMISSION: DECLASSIFIED</span>
            </div>
            <span className="text-white/20">•</span>
            <span className="rounded border border-violet-400/40 bg-violet-500/10 px-2.5 py-0.5 text-violet-200">
              {attendance}
            </span>
          </div>
        </motion.div>

        {/* Header HUD Block */}
        <div className="mt-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 items-center gap-1.5 rounded-sm border border-violet-400/40 bg-violet-500/15 px-3 font-mono text-xs uppercase tracking-[0.3em] text-violet-200 backdrop-blur-md">
              <Terminal size={13} className="text-violet-400" />
              <span>SAVISKAR_{year}_ARCHIVE_V{year.slice(-2)}.0</span>
            </div>
            <span className="font-mono text-xs text-white/30">
              [TELEMETRY VERIFIED]
            </span>
          </motion.div>

          {/* Main Glitch/Laser Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 text-[clamp(2.5rem,6.5vw,6rem)] font-extrabold leading-[0.88] tracking-tight uppercase"
          >
            <span className="bg-gradient-to-r from-white via-violet-100 to-white/70 bg-clip-text text-transparent">
              {subtitle}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 max-w-3xl font-mono text-sm leading-relaxed text-white/60 sm:text-base"
          >
            &gt; {tagline}
          </motion.p>
        </div>

        {/* ═══════════════════════════════════════════════════════
            DUAL SCI-FI QUANTUM CHAMBERS (DAY 01 & DAY 02)
        ═══════════════════════════════════════════════════════ */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {days.map((day, idx) => {
            const isDay1 = day.dayNumber.includes("01");
            const accentColor = isDay1 ? "violet" : "cyan";

            return (
              <motion.div
                key={day.dayNumber}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.85, delay: idx * 0.15 }}
                className="group relative flex flex-col justify-between overflow-hidden border border-white/15 bg-black/60 p-7 backdrop-blur-2xl transition-all duration-500 hover:border-violet-400/60 hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] md:p-10"
                style={{
                  clipPath:
                    "polygon(0 20px, 20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px))",
                }}
              >
                {/* ── Sci-Fi Corner Crosshairs & Framing Brackets ── */}
                <div className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-violet-400/60 transition-colors group-hover:border-violet-300" />
                <div className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-violet-400/60 transition-colors group-hover:border-violet-300" />
                <div className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-violet-400/60 transition-colors group-hover:border-violet-300" />
                <div className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-violet-400/60 transition-colors group-hover:border-violet-300" />

                {/* Cyber ambient top corner pulse */}
                <div
                  className={`pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full blur-[90px] transition-opacity ${
                    isDay1
                      ? "bg-violet-500/20 group-hover:opacity-100"
                      : "bg-cyan-500/20 group-hover:opacity-100"
                  }`}
                />

                {/* Animated Horizontal Scanline on Hover */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-pulse" />

                <div>
                  {/* Top HUD Telemetry Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 font-mono">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`rounded-sm border px-3 py-1 text-xs font-extrabold uppercase tracking-widest ${
                          isDay1
                            ? "border-violet-400/50 bg-violet-500/25 text-violet-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            : "border-cyan-400/50 bg-cyan-500/25 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                        }`}
                      >
                        [PHASE // {day.dayNumber}]
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-white/50">
                        {day.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                      <Activity size={12} className="text-emerald-400" />
                      <span>{day.date || `SAVISKAR '${year.slice(-2)}`}</span>
                    </div>
                  </div>

                  {/* Artist Identity Hologram */}
                  <div className="mt-6">
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-violet-300/80">
                      HEADLINE TRANSMISSION
                    </span>
                    <h3 className="mt-1 text-3xl font-black uppercase tracking-tight text-white transition-colors group-hover:text-violet-200 sm:text-4xl md:text-5xl">
                      {day.artists}
                    </h3>

                    {/* Technical Genre Matrix */}
                    <div className="mt-3 flex items-center gap-2 font-mono text-xs text-cyan-300/90">
                      <Zap size={13} className="text-cyan-400" />
                      <span className="uppercase tracking-wider">
                        {day.genre}
                      </span>
                    </div>
                  </div>

                  {/* ── Holographic Projection Bay (Concert Image) ── */}
                  <div className="relative mt-7 h-60 w-full overflow-hidden border border-white/15 bg-black/90 md:h-72">
                    <Image
                      src={day.image}
                      alt={day.artists}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center filter saturate-125 transition-all duration-700 group-hover:scale-105 group-hover:contrast-110"
                    />

                    {/* Holographic overlay grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
                    <div
                      className="pointer-events-none absolute inset-0 opacity-15 mix-blend-overlay"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168,85,247,0.3) 2px, rgba(168,85,247,0.3) 4px)",
                      }}
                    />

                    {/* HUD Viewport Overlays */}
                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded bg-black/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-white/90 backdrop-blur-md border border-white/10">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>REC // LIVE_CGC_FEED</span>
                    </div>

                    <div className="absolute right-3 top-3 font-mono text-[9px] uppercase tracking-widest text-cyan-300/80 bg-black/60 px-2 py-0.5 border border-cyan-500/20">
                      LAT: 30.70°N // LON: 76.71°E
                    </div>

                    {/* Bottom HUD bar with Equalizer */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between border-t border-white/15 bg-black/75 px-3 py-1.5 backdrop-blur-md">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-white/80">
                        <Volume2 size={12} className="text-violet-400" />
                        <span>AUDIO LOAD: 112.4 dBA</span>
                      </div>

                      {/* Animated audio equalizer bars */}
                      <div className="flex items-end gap-1 h-3">
                        <span className="w-1 bg-violet-400 h-2 animate-pulse" />
                        <span className="w-1 bg-violet-300 h-3 animate-ping" />
                        <span className="w-1 bg-cyan-400 h-1.5 animate-pulse" />
                        <span className="w-1 bg-purple-400 h-2.5 animate-bounce" />
                      </div>
                    </div>
                  </div>

                  {/* Transmission Log / Narrative */}
                  <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-5 font-mono">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-violet-300">
                      <Terminal size={12} />
                      <span>TRANSMISSION_LOG_ENTRY</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-white/75 sm:text-sm font-sans">
                      {day.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Sci-Fi Telemetry Metrics & Highlights */}
                <div className="mt-8 border-t border-white/10 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                      SPECTRAL SIGNATURES:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                      <Shield size={11} />
                      <span>VERIFIED CONCERT ARCHIVE</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {day.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-white/70 transition-colors group-hover:border-violet-400/40 group-hover:text-violet-200"
                      >
                        [+ {highlight}]
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Conduit Interconnect Rail */}
        <div className="mt-16 flex items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
          <span className="flex items-center gap-2 text-violet-400/80">
            <Cpu size={13} />
            TEMPORAL_NODE // SAVISKAR {year} COMPLETE
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}