"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import { useRef } from "react";

function Word({
  children,
  progress,
  range,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [6, 0]);

  return (
    <span className="relative inline-block mr-[0.28em] my-[0.05em]">
      <motion.span
        style={{ opacity, y }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Expands smoothly into the viewport and exits gracefully into the next section
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.78, 1], [0.92, 1, 1, 0.95]);
  const cardOpacity = useTransform(scrollYProgress, [0.02, 0.12, 0.78, 0.95], [0, 1, 1, 0]);
  const cardY = useTransform(scrollYProgress, [0.78, 1], [0, -35]);

  // Natural unzoomed framing with subtle cinematic drift
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.03]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "2%"]);

  // Narrative words for word-by-word reveal (Content strictly preserved)
  const narrativeText =
    "Born from the roots of Srijan — the spark of creation, and Avishkar — the breakthrough of invention. SAVISKAR 2026 brings thousands of creators, engineers, and artists together at CGC University under one central anthem: Aevorian Reverie. One stage where your craft becomes unforgettable.";
  const words = narrativeText.split(" ");

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative min-h-[200vh] bg-transparent text-white"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div
          style={{
            scale,
            opacity: cardOpacity,
            y: cardY,
          }}
          className="relative h-[86vh] w-[94vw] max-w-[1550px] overflow-hidden rounded-[28px] md:rounded-[36px] border border-white/15 bg-black/40 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.85)]"
        >
          {/* Centerpiece 8K Concert Photography - Unzoomed natural perspective */}
          <motion.div
            style={{
              scale: imageScale,
              y: imageY,
            }}
            className="absolute inset-0"
          >
            <Image
              src="/images/concert-mission-centerstage.jpg"
              alt="Artist centerstage under brilliant spotlights at Saviskar concert"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-[0.85]"
            />
          </motion.div>

          {/* Liquid Glass Theatrical Lighting Overlays */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

          {/* Volumetric Center Spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.16)_0%,rgba(0,0,0,0.65)_70%,#000000_100%)]" />

          {/* Top & Bottom Multi-stop Blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

          {/* Story Narrative Content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-8 md:p-14 lg:p-18">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="liquid-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1 sm:px-4 sm:py-1.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-violet-300">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                The Origin Story
              </div>

              <span className="text-[9px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest text-white/75 uppercase">
                Srijan × Avishkar
              </span>
            </div>

            {/* Word-by-Word Scroll Reveal Statement (System strictly preserved) */}
            <div className="my-auto max-w-4xl mx-auto py-4 sm:py-6 text-center">
              <p className="font-sans text-lg sm:text-2xl md:text-4xl lg:text-[44px] font-light leading-relaxed md:leading-[1.35] tracking-tight text-white/95">
                {words.map((word, i) => {
                  const start = 0.18 + (i / words.length) * 0.45;
                  const end = start + 0.05;
                  const isSpecial = word.includes("SAVISKAR") || word.includes("Srijan") || word.includes("Avishkar");
                  const isTheme = word.includes("Aevorian") || word.includes("Reverie.");

                  return (
                    <Word key={i} progress={scrollYProgress} range={[start, end]}>
                      {isSpecial ? (
                        <span className="font-bold text-white tracking-normal drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                          {word}
                        </span>
                      ) : isTheme ? (
                        <span className="font-editorial text-violet-300 not-italic font-normal">
                          {word}
                        </span>
                      ) : (
                        word
                      )}
                    </Word>
                  );
                })}
              </p>
            </div>

            {/* Bottom Details */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 sm:pt-6 text-[9px] sm:text-[11px] font-mono uppercase tracking-wider sm:tracking-[0.25em] text-white/75">
              <span>CGC UNIVERSITY • MOHALI</span>
              <span className="hidden sm:inline">Theme: Aevorian Reverie</span>
              <span>24–25 OCT 2026</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}