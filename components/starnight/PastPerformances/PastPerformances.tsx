'use client';

import { motion } from "motion/react";
import Image from "next/image";
import { Terminal, Radio, Activity, Cpu, Sparkles } from "lucide-react";
import ArtistCard from "./ArtistCard";
import { festivalEditions } from "@/data/starnightArtists";

/*
  Cleaner editorial photo mesh:
  - Mixes landscape and portrait crops.
  - Uses much less overlap.
  - Keeps the main text completely clear.
  - Portrait cards use object-cover to create a deliberate 9:16 crop.
*/
const starNightPhotos = [
  {
    src: "/images/artists/artist-4-salim-sulaiman.webp",
    alt: "Salim-Sulaiman Star Night live performance",
    className:
      "left-[2%] top-[4%] h-[310px] w-[205px] -rotate-[3deg] md:h-[390px] md:w-[255px]",
  },
  {
    src: "/images/concert-stadium.webp",
    alt: "Star Night stadium chorus",
    className:
      "left-[28%] top-[0%] h-[245px] w-[410px] rotate-[2deg] md:h-[300px] md:w-[500px]",
  },
  {
    src: "/images/artists/artist-3-kushagra-sunanda.webp",
    alt: "Kushagra Thakur & Sunanda Sharma performance",
    className:
      "right-[1%] top-[6%] h-[310px] w-[205px] rotate-[3deg] md:h-[390px] md:w-[255px]",
  },
  {
    src: "/images/scene-realms-stage.webp",
    alt: "Concert fireworks bloom",
    className:
      "left-[22%] top-[39%] h-[245px] w-[410px] -rotate-[2deg] md:h-[300px] md:w-[500px]",
  },
  {
    src: "/images/scene-starnight-show.webp",
    alt: "Star Night laser canopy",
    className:
      "right-[2%] top-[43%] h-[310px] w-[205px] -rotate-[3deg] md:h-[390px] md:w-[255px]",
  },
  {
    src: "/images/concert.webp",
    alt: "Star Night concert stage",
    className:
      "left-[1%] bottom-[2%] h-[245px] w-[410px] rotate-[2deg] md:h-[300px] md:w-[500px]",
  },
  {
    src: "/images/hero.webp",
    alt: "Star Night main entrance",
    className:
      "right-[28%] bottom-[0%] h-[245px] w-[410px] -rotate-[2deg] md:h-[300px] md:w-[500px]",
  },
];

export default function PastPerformances() {
  return (
    <section className="relative overflow-hidden bg-black py-24 text-white md:py-32">
      {/* Cinematic purple atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[62%] top-[18%] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#8A2EFF]/12 blur-[190px]" />
        <div className="absolute right-[-12%] top-[30%] h-[520px] w-[520px] rounded-full bg-[#5B21B6]/10 blur-[170px]" />
        <div className="absolute left-[40%] bottom-[-10%] h-[450px] w-[450px] rounded-full bg-[#7C3AED]/7 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1750px] px-6 md:px-10 lg:px-14">
        <div className="grid items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-8">
          {/* LEFT — futuristic sci-fi heading */}
          <div className="relative z-50 max-w-[610px] lg:pr-8 xl:pr-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded border border-violet-400/40 bg-violet-500/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.35em] text-violet-300 backdrop-blur-md"
            >
              <Terminal size={12} className="text-violet-400" />
              <span>[SYS.CHRONO_VAULT // STAR NIGHT]</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-[610px] text-[clamp(2.5rem,5.2vw,6.5rem)] font-extrabold leading-[0.86] tracking-[-0.055em] uppercase"
            >
              THE STAGE HAS
              <br />
              <span className="bg-gradient-to-r from-white via-violet-200 to-purple-400 bg-clip-text text-transparent">
                SEEN LEGENDS.
              </span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.65 }}
              className="mt-7 h-0.5 w-16 origin-left bg-gradient-to-r from-violet-500 to-cyan-400"
            />

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.75 }}
              className="mt-7 max-w-[500px] font-mono text-sm leading-7 text-white/60 sm:text-base"
            >
              &gt; Archival telemetry confirms: Every Star Night sends seismic sonic waves through CGC University. Relive the multi-day festival transmissions that united 25,000+ voices beneath the mainstage sky.
            </motion.p>

            <div className="mt-10 flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.35em] text-white/35">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Radio size={12} className="animate-pulse" />
                <span>CHRONO_STATUS: DECLASSIFIED</span>
              </span>
              <span>•</span>
              <span>2024–2025 LOGS</span>
            </div>
          </div>

          {/* RIGHT — open editorial photo mesh with holographic HUD corners */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto h-[760px] w-full max-w-[900px] md:h-[820px]"
          >
            {/* soft halo */}
            <div className="pointer-events-none absolute inset-[10%] rounded-full bg-[#8A2EFF]/10 blur-[130px]" />

            {starNightPhotos.map((photo, index) => (
              <motion.div
                key={photo.src}
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.65,
                  delay: 0.08 + index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  scale: 1.04,
                  rotate: 0,
                  zIndex: 50,
                  transition: { duration: 0.25 },
                }}
                style={{ zIndex: 10 + index }}
                className={`absolute overflow-hidden border border-white/[0.22] bg-black p-[3px] shadow-[0_25px_70px_rgba(0,0,0,0.7)] ${photo.className}`}
              >
                {/* Sci-fi corner markers */}
                <div className="pointer-events-none absolute left-1 top-1 z-30 h-2 w-2 border-l border-t border-violet-400" />
                <div className="pointer-events-none absolute right-1 bottom-1 z-30 h-2 w-2 border-r border-b border-cyan-400" />

                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 500px"
                    className="object-cover"
                  />

                  {/* Cinematic dark treatment */}
                  <div className="absolute inset-0 bg-black/[0.18]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
                </div>
              </motion.div>
            ))}

            {/* very subtle outer vignette */}
            <div className="pointer-events-none absolute inset-0 z-[60] bg-[radial-gradient(ellipse_at_center,transparent_63%,rgba(0,0,0,0.35)_100%)]" />
          </motion.div>
        </div>

        {/* Past artists: Rendered via futuristic sci-fi chambers */}
        <div className="mt-20 md:mt-24 space-y-16">
          {festivalEditions.map((edition) => (
            <ArtistCard key={edition.year} {...edition} />
          ))}
        </div>

        {/* Futuristic Closing Transition into 2026 */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8 }}
          className="relative mt-28 flex min-h-[30vh] w-full items-center justify-center overflow-hidden bg-black"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.18),transparent_62%)]" />

          <div className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center">
            <div className="flex w-full items-center gap-4 font-mono">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.45em] text-cyan-300">
                <Cpu size={13} />
                CHRONO_CONVERGENCE // SECTOR 2026 AHEAD
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
            </div>

            <p className="mt-8 font-mono text-2xl font-bold uppercase tracking-tight text-white/90 sm:text-4xl">
              THE PAST HAS SET THE BENCHMARK.
            </p>

            <p className="mt-2 font-mono text-xs uppercase tracking-[0.35em] text-violet-400">
              [CALIBRATING FREQUENCY DECRYPTOR // STAND BY]
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
