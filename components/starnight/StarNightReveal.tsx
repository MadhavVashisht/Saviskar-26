"use client";

import { motion } from "motion/react";
import { ArrowDown, Sparkles } from "lucide-react";

const headliners = [
  {
    artist: "Salim-Sulaiman",
    genre: "Bollywood • Sufi • Live Symphony",
    tagline: "The legendary composer duo live under stadium spotlights.",
    status: "CONFIRMED HEADLINER",
  },
  {
    artist: "Sunanda Sharma",
    genre: "Punjabi Folk & Contemporary Pop",
    tagline: "Electrifying folk vocals that bring the entire stadium to its feet.",
    status: "CONFIRMED HEADLINER",
  },
  {
    artist: "Kushagra Thakur",
    genre: "Indie Rock & Acoustic Melodies",
    tagline: "Soulful indie anthems echoing across thousands of voices.",
    status: "CONFIRMED HEADLINER",
  },
];

export default function StarNightReveal() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Blackout atmosphere */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4 }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,rgba(168,85,247,0.18),transparent_55%)]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 0.4 }}
        className="absolute left-1/2 top-[62%] h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/15 blur-[160px]"
      />

      {/* Dust / stars */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <span className="absolute left-[18%] top-[28%] h-1 w-1 rounded-full bg-purple-200/50" />
        <span className="absolute left-[72%] top-[22%] h-1 w-1 rounded-full bg-white/30" />
        <span className="absolute left-[82%] top-[55%] h-1 w-1 rounded-full bg-purple-200/40" />
        <span className="absolute left-[27%] top-[68%] h-1 w-1 rounded-full bg-white/25" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-28 text-center">
        {/* 01 — blackout */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <div className="liquid-glass mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[9px] uppercase tracking-[0.35em] text-violet-300">
            THE MOMENT AFTER THE LIGHTS GO OUT
          </div>

          <h2 className="mt-4 text-[clamp(2.5rem,9vw,9rem)] font-light leading-[0.8] tracking-tight text-white">
            AND THEN... <br />
            <span className="font-editorial text-violet-300 font-normal">THE STAGE IGNITES.</span>
          </h2>
        </motion.div>

        {/* 02 — year */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.45 }}
          className="mt-14"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.55em] text-violet-400">
            SAVISKAR 2026 OFFICIAL LINEUP
          </p>

          <div className="mt-2 font-mono text-[clamp(3rem,15vw,13rem)] font-extrabold leading-[0.75] tracking-tight text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.25)]">
            2026
          </div>

          <div className="mx-auto mt-6 h-px w-36 bg-gradient-to-r from-transparent via-violet-400/80 to-transparent" />
        </motion.div>

        {/* 03 — Real Headliners Showcase */}
        <div className="mt-16 w-full max-w-5xl space-y-6">
          {headliners.map((item, idx) => (
            <motion.div
              key={item.artist}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 + idx * 0.15 }}
              className="liquid-glass group relative overflow-hidden rounded-[26px] border border-white/12 p-8 transition-all hover:border-violet-500/40 hover:shadow-[0_20px_50px_rgba(168,85,247,0.2)] md:p-10"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="text-left">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300">
                      {item.status}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-xs uppercase tracking-wider text-white/50">
                      {item.genre}
                    </span>
                  </div>

                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-5xl">
                    {item.artist}
                  </h3>

                  <p className="mt-2 text-sm text-white/60">
                    {item.tagline}
                  </p>
                </div>

                <span className="liquid-glass self-start md:self-auto rounded-full px-5 py-2 text-xs font-mono uppercase tracking-wider text-white/80">
                  CGC STADIUM STAGE
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 04 — future CTA placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 flex flex-col items-center"
        >
          <p className="text-[9px] uppercase tracking-[0.45em] text-white/25">
            SAVE THE NIGHT
          </p>

          <button
            type="button"
            disabled
            className="mt-5 inline-flex cursor-not-allowed items-center gap-3 rounded-full border border-white/10 px-7 py-3 text-xs text-white/30"
          >
            EXPLORE STAR NIGHT
            <ArrowDown size={14} className="-rotate-90" />
          </button>

          <div className="mt-12 flex items-center gap-3 text-purple-300/35">
            <Sparkles size={12} />
            <span className="text-[8px] uppercase tracking-[0.4em]">
              Details will be revealed soon
            </span>
            <Sparkles size={12} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}