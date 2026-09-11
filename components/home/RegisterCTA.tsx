"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function RegisterCTA() {
  return (
    <section
      id="register"
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-transparent px-6 py-28 text-white md:px-10 md:py-36"
    >
      {/* 01. 8K Finale Pyrotechnics Photography with Ambient Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full animate-slow-zoom">
          <Image
            src="/images/concert-cta-finale.jpg"
            alt="Midnight pyrotechnics and fireworks over the festival mainstage"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-45"
          />
        </div>

        {/* Theatrical stage lighting overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.22)_0%,rgba(0,0,0,0.6)_60%,#000000_95%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1300px]">
        {/* Festival Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="liquid-glass mb-8 inline-flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80"
        >
          <Sparkles size={12} className="text-violet-400" />
          <span>CGC UNIVERSITY • SAVISKAR 2026 • AEVORIAN REVERIE</span>
        </motion.div>

        {/* Grand Headline with Editorial Accent */}
        <motion.h2
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="max-w-[1100px] text-[clamp(4.2rem,10vw,10rem)] font-light leading-[0.82] tracking-tight text-white"
        >
          This time, <br />
          <span className="font-editorial text-violet-300 font-normal">be in it.</span>
        </motion.h2>

        {/* CTA Footer Bar */}
        <div className="mt-16 flex flex-col gap-8 border-t border-white/10 pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-lg text-base leading-7 text-white/60 md:text-lg">
            Where tomorrow dreams awake — under the floodlights of CGC University Mohali, your Saviskar story starts now.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex flex-wrap items-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/register"
                className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-wide text-black shadow-[0_0_35px_rgba(255,255,255,0.35)] transition-colors hover:bg-violet-100 hover:shadow-[0_0_50px_rgba(255,255,255,0.55)]"
              >
                Register for Saviskar 2026
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/events"
                className="liquid-glass-interactive rounded-full px-7 py-4 text-sm font-medium tracking-wide text-white transition-all"
              >
                View All Arenas
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}