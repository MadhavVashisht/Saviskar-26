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

  // Expands smoothly into the viewport
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.88, 1, 1, 0.94]);
  const radius = useTransform(scrollYProgress, [0, 0.28], ["32px", "0px"]);

  // Slow ambient zoom on the artist centerpiece
  const imageScale = useTransform(scrollYProgress, [0, 0.8], [1.14, 1.02]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  // Narrative words for word-by-word reveal
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
            borderRadius: radius,
          }}
          className="relative h-[88vh] w-[94vw] max-w-[1550px] overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.9)]"
        >
          {/* Centerpiece 8K Concert Photography */}
          <motion.div
            style={{
              scale: imageScale,
              y: imageY,
            }}
            className="absolute -inset-[8%]"
          >
            <Image
              src="/images/concert-mission-centerstage.jpg"
              alt="Artist centerstage under brilliant spotlights at Saviskar concert"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-75"
            />
          </motion.div>

          {/* Theatrical Lighting Overlays */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

          {/* Volumetric Center Spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18)_0%,rgba(0,0,0,0.7)_65%,#000000_100%)]" />

          {/* Top & Bottom Multi-stop Blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />

          {/* Story Narrative Content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-16 lg:p-20">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                The Origin Story
              </div>

              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
                Srijan × Avishkar
              </span>
            </div>

            {/* Word-by-Word Scroll Reveal Statement */}
            <div className="my-auto max-w-4xl py-6">
              <p className="font-sans text-2xl font-light leading-[1.4] tracking-tight text-white/95 md:text-4xl md:leading-[1.35] lg:text-[44px]">
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
            <div className="flex items-center justify-between border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.25em] text-white/40">
              <span>CGC UNIVERSITY • MOHALI</span>
              <span className="hidden sm:inline">Theme: Aevorian Reverie</span>
              <span>24–25 OCT 2026</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Seamless Multi-stop Bottom Blend into About Section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-black/80 to-black" />
    </section>
  );
}