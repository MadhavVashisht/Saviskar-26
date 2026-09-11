"use client";

import Image from "next/image";
import { motion } from "motion/react";
import MouseSpotlight from "@/components/ui/MouseSpotlight";
import { ArrowDown, ArrowRight } from "lucide-react";
import SplitText from "@/components/SplitText";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent text-white">
      {/* 01. 8K Concert Photography Background with Slow Ambient Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full animate-slow-zoom">
          <Image
            src="/images/concert-stadium.jpg"
            alt="Saviskar 2026 Stadium Concert Crowd"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-60"
          />
        </div>

        {/* Theatrical Concert Lighting & Overlays */}
        {/* Deep Violet Stage Haze Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.18)_0%,rgba(0,0,0,0.45)_50%,#000000_90%)]" />

        {/* Volumetric Stage Smoke Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black pointer-events-none" />

        {/* Soft Spotlight Rim Lighting from top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[80vw] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12)_0%,transparent_70%)] blur-[90px] pointer-events-none" />
      </div>

      {/* Mouse Spotlight */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <MouseSpotlight />
      </div>

      {/* Content Container */}
      <div className="relative z-30 mx-auto flex w-full max-w-7xl flex-col items-center px-6 pt-24 text-center">
        {/* University Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="liquid-glass mb-8 inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/80 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
          <span>CGC UNIVERSITY • MOHALI</span>
          <span className="text-white/30">|</span>
          <span className="text-violet-300">AEVORIAN REVERIE</span>
        </motion.div>

        {/* SAVISKAR Main Festival Title */}
        <SplitText
          text="SAVISKAR"
          className="text-[clamp(4.8rem,14vw,11.5rem)] font-black tracking-[-0.07em] leading-none text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.25)] select-none"
          delay={50}
          duration={1}
          splitType="chars"
          from={{ opacity: 0, y: 120 }}
          to={{ opacity: 1, y: 0 }}
          onLetterAnimationComplete={undefined}
        />

        {/* Theme Lockup: Aevorian Reverie */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-3 flex flex-col items-center gap-1"
        >
          <span className="font-mono text-xs uppercase tracking-[0.45em] text-violet-300/90 font-medium">
            AEVORIAN REVERIE
          </span>
          <span className="font-editorial text-sm sm:text-base text-white/60 tracking-wider font-normal italic">
            Where Tomorrow Dreams Awake
          </span>
        </motion.div>

        {/* Editorial Punchline Accent */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-6 text-3xl font-light tracking-tight text-white/90 md:text-5xl lg:text-6xl"
        >
          The <span className="font-editorial text-violet-300 font-normal">Stage</span> is Yours.
        </motion.h2>

        {/* Festival Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-6 max-w-2xl text-base leading-7 text-white/60 md:text-lg md:leading-8"
        >
          Technology, Culture, Innovation and Competition —
          ignited under stadium spotlights into one unforgettable 8K concert experience.
        </motion.p>

        {/* Live Metrics Pill Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.8 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs tracking-wider uppercase text-white/70"
        >
          {["50+ Events", "100+ Colleges", "2 Days"].map((item) => (
            <motion.div
              key={item}
              whileHover={{ scale: 1.08, y: -3, borderColor: "rgba(168,85,247,0.5)" }}
              whileTap={{ scale: 0.96 }}
              className="liquid-glass cursor-default rounded-full px-4 py-1.5 transition-colors"
            >
              {item}
            </motion.div>
          ))}
          <motion.div
            whileHover={{ scale: 1.08, y: -3, borderColor: "rgba(168,85,247,0.8)" }}
            whileTap={{ scale: 0.96 }}
            className="liquid-glass cursor-default rounded-full px-4 py-1.5 text-violet-300 transition-colors"
          >
            ∞ Possibilities
          </motion.div>
        </motion.div>

        {/* Call to Actions (with ON hover/tap animations) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-5"
        >
          <motion.a
            href="#events"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 45px rgba(255,255,255,0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="group rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-wide text-black shadow-[0_0_30px_rgba(255,255,255,0.35)] transition-colors hover:bg-violet-100"
          >
            <span className="flex items-center gap-3">
              Explore Arenas
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </motion.a>

          <motion.a
            href="/register"
            whileHover={{
              scale: 1.05,
              borderColor: "rgba(168,85,247,0.6)",
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="liquid-glass-interactive rounded-full px-8 py-4 text-sm font-medium tracking-wide text-white transition-all"
          >
            Register for Saviskar
          </motion.a>
        </motion.div>
      </div>

      {/* Ambient Scroll Down Indicator */}
      <motion.div
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 2.2,
          ease: "easeInOut",
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/35 flex flex-col items-center gap-1"
      >
        <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown size={14} />
      </motion.div>

      {/* Multi-stop Continuous Atmosphere Blend into Next Section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-black/70 to-black" />
    </section>
  );
}