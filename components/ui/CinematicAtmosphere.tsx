"use client";

import { useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

export default function CinematicAtmosphere() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001,
  });

  // Ambient glows drifting and pulsing with scroll
  const glowVioletY = useTransform(smoothProgress, [0, 1], ["0%", "75%"]);
  const glowVioletScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.35, 0.9]);

  const glowCyanY = useTransform(smoothProgress, [0, 1], ["10%", "-40%"]);
  const glowCyanScale = useTransform(smoothProgress, [0, 0.5, 1], [0.85, 1.25, 1]);

  const hazeOpacity = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.18, 0.28, 0.22, 0.3]);

  // Generate deterministic floating embers/particles
  const embers = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => {
      const left = ((i * 31.7) % 96) + 2;
      const size = (i % 3) * 1.5 + 2; // 2px to 5px
      const duration = 12 + ((i * 4.3) % 16); // 12s - 28s
      const delay = (i * 0.7) % 10;
      const isViolet = i % 2 === 0;
      return { id: i, left, size, duration, delay, isViolet };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 01. Volumetric Violet Stage Spotlight (Primary Concert Haze) */}
      <motion.div
        style={{
          y: glowVioletY,
          scale: glowVioletScale,
          opacity: hazeOpacity,
        }}
        className="absolute left-[15%] top-[-10%] h-[750px] w-[750px] -translate-x-1/2 rounded-full blur-[140px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.22 }}
        transition={{ duration: 1.8 }}
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.45)_0%,rgba(124,58,237,0.22)_40%,transparent_70%)]" />
      </motion.div>

      {/* 02. Ambient Cyan Rim Light (Secondary Stage Illumination) */}
      <motion.div
        style={{
          y: glowCyanY,
          scale: glowCyanScale,
        }}
        className="absolute right-[-10%] top-[30%] h-[650px] w-[650px] rounded-full opacity-15 blur-[160px]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35)_0%,rgba(99,102,241,0.15)_45%,transparent_70%)]" />
      </motion.div>

      {/* 03. Centerstage Spotlight Beam */}
      <motion.div
        style={{
          opacity: useTransform(smoothProgress, [0, 0.4, 0.8], [0.12, 0.22, 0.15]),
        }}
        className="absolute left-1/2 top-0 h-[90vh] w-[70vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08)_0%,rgba(168,85,247,0.06)_40%,transparent_75%)] blur-[100px]"
      />

      {/* 04. Floating Illuminated Embers / Stage Dust */}
      <div className="absolute inset-0">
        {embers.map((ember) => (
          <motion.span
            key={ember.id}
            className="absolute rounded-full"
            style={{
              left: `${ember.left}%`,
              width: ember.size,
              height: ember.size,
              backgroundColor: ember.isViolet ? "#c084fc" : "#ffffff",
              boxShadow: ember.isViolet
                ? "0 0 10px rgba(192, 132, 252, 0.8)"
                : "0 0 8px rgba(255, 255, 255, 0.9)",
              opacity: 0,
            }}
            animate={{
              y: ["100vh", "-10vh"],
              x: [0, (ember.id % 2 === 0 ? 1 : -1) * 35, 0],
              opacity: [0, 0.75, 0.85, 0],
            }}
            transition={{
              duration: ember.duration,
              repeat: Infinity,
              delay: ember.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* 05. Ultra-subtle Film Grain & Continuous Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)]" />

      {/* Subtle scanline/stage haze depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
    </div>
  );
}
