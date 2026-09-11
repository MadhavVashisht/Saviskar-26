"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
} from "motion/react";
import { ArrowUpRight, FileDown } from "lucide-react";

type Event = {
  number: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  image: string;
  rulebookUrl?: string;
  tags?: string[];
};

interface Props {
  event: Event;
  index: number;
  ease: readonly [number, number, number, number];
}

export default function EventCard({ event, index, ease }: Props) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(rotateX, {
    stiffness: 220,
    damping: 22,
  });

  const springY = useSpring(rotateY, {
    stiffness: 220,
    damping: 22,
  });

  // Cursor-following violet concert stage spotlight
  const spotlight = useMotionTemplate`
    radial-gradient(
      320px circle at ${mouseX}px ${mouseY}px,
      rgba(168, 85, 247, 0.25),
      rgba(168, 85, 247, 0.08) 45%,
      transparent 75%
    )
  `;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);

    const rx = ((y - rect.height / 2) / rect.height) * -7;
    const ry = ((x - rect.width / 2) / rect.width) * 7;

    rotateX.set(rx);
    rotateY.set(ry);
  }

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: index * 0.08,
        ease,
      }}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="group relative h-[540px] overflow-hidden rounded-[32px] border border-white/12 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-colors hover:border-violet-500/40 md:h-[680px]"
    >
      {/* 8K Concert Photography with Ambient Zoom */}
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={event.image}
          alt={`${event.title} arena live concert stage`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />

        {/* Dynamic Dark Gradient & Concert Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black pointer-events-none" />

        {/* Interactive Spotlight Overlay */}
        <motion.div
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Glass Card Border Lighting */}
        <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/10 transition-all duration-500 group-hover:border-violet-500/40 group-hover:shadow-[inset_0_0_60px_rgba(168,85,247,0.18)]" />

        {/* Top Header Information */}
        <div className="absolute left-7 right-7 top-7 z-20 flex items-center justify-between">
          <span className="font-mono text-xs tracking-[0.3em] text-white/60">
            ARENA {event.number}
          </span>

          <div className="flex items-center gap-2">
            {event.rulebookUrl && (
              <motion.a
                whileHover={{ scale: 1.06, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.95 }}
                href={event.rulebookUrl}
                download
                onClick={(e) => e.stopPropagation()}
                className="liquid-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white/80 transition-colors"
                title="Download Rulebook"
              >
                <FileDown size={12} />
                Rulebook
              </motion.a>
            )}

            <span className="liquid-glass rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-violet-300">
              CGC University
            </span>
          </div>
        </div>

        {/* Bottom Content Area */}
        <div className="absolute bottom-0 z-20 w-full p-7 md:p-9 text-white">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
            {event.subtitle}
          </p>

          <div className="flex items-end justify-between gap-4">
            <h3 className="text-[clamp(2.8rem,5vw,5rem)] font-light leading-none tracking-tight text-white">
              {event.title}
            </h3>

            <motion.div
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={`/events/${event.slug}`}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-colors group-hover:bg-violet-200"
                aria-label={`Explore ${event.title} Arena`}
              >
                <ArrowUpRight size={22} className="transition-transform group-hover:rotate-45" />
              </Link>
            </motion.div>
          </div>

          <p className="mt-4 max-w-lg text-sm leading-6 text-white/65">
            {event.description}
          </p>

          {/* Arena Tags */}
          {event.tags && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              {event.tags.map((tag) => (
                <motion.span
                  key={tag}
                  whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.12)", color: "#ffffff" }}
                  transition={{ duration: 0.15 }}
                  className="cursor-default rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-white/50 transition-colors"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}