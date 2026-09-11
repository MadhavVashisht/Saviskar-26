"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight, Music2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import StageTransition from "@/components/ui/StageTransition";
import { headliners2026 } from "@/data/starnightArtists";

export default function StarNight() {
  const [showTransition, setShowTransition] = useState(false);
  const router = useRouter();

  const handleStageTransition = () => {
    setShowTransition(true);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-black px-6 py-28 text-white md:px-10 md:py-36">
      {/* Theatrical concert illumination background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Massive Violet Stage Spotlights */}
        <div className="absolute left-[30%] top-[20%] h-[750px] w-[750px] -translate-x-1/2 rounded-full bg-purple-700/15 blur-[180px]" />
        <div className="absolute right-[20%] bottom-[10%] h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[160px]" />

        {/* Ambient Stage Rays */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[85vw] bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.12)_0%,rgba(0,0,0,0.6)_60%,transparent_90%)]" />

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px]">
        {/* Header Label */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="liquid-glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300"
            >
              <Sparkles size={12} />
              When The Lights Go Down
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="text-[clamp(4.2rem,11vw,11rem)] font-light leading-[0.78] tracking-tight text-white"
            >
              STAR <br />
              <span className="font-editorial text-violet-300 font-normal">NIGHT.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:max-w-md md:pb-4"
          >
            <p className="text-base leading-7 text-white/60">
              Thousands of voices singing in unison. The main festival stage ignites with
              legendary headline artists and unscripted stadium energy.
            </p>

            <button
              type="button"
              onClick={handleStageTransition}
              className="mt-6 group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-all hover:scale-105 hover:bg-violet-100"
            >
              Explore Star Night Legacy
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </motion.div>
        </div>

        {/* 2026 Headliners Liquid Glass Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:mt-24">
          {headliners2026.map((artist, idx) => (
            <motion.div
              key={artist.artist}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.12 }}
              whileHover={{ y: -6 }}
              className="liquid-glass group relative overflow-hidden rounded-[28px] border border-white/12 p-6 transition-all hover:border-violet-500/40 hover:shadow-[0_20px_50px_rgba(168,85,247,0.2)]"
            >
              <div className="relative h-64 w-full overflow-hidden rounded-[20px]">
                <Image
                  src={artist.image}
                  alt={artist.artist}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="liquid-glass rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-violet-300">
                    2026 HEADLINER
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs uppercase tracking-widest text-violet-300/80">
                    {artist.genre}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
                    {artist.artist}
                  </h3>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50">
                <span>{artist.tagline}</span>
                <Music2 size={15} className="text-violet-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stage Transition overlay */}
      {showTransition && (
        <StageTransition
          onComplete={() => {
            router.push("/starnight");
          }}
        />
      )}

      {/* Bottom Multi-stop Blend into RegisterCTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-black/80 to-black" />
    </section>
  );
}