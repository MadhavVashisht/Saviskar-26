"use client";

import Link from "next/link";
import { ArrowUpRight, FileDown, Sparkles } from "lucide-react";
import EventCard from "@/components/home/EventCard";
import { motion } from "motion/react";

const arenas = [
  {
    number: "01",
    title: "Cultural",
    slug: "cultural",
    subtitle: "Dance. Music. Performance.",
    description:
      "Take the spotlight and turn every musical note, dance move, and theatrical act into an unforgettable headline performance.",
    image: "/images/concert-cultural-stage.jpg",
    rulebookUrl: "/rulebooks/saviskar-2026-cultural-rulebook.pdf",
    tags: ["Music", "Dance", "Theatre", "Fashion"],
  },
  {
    number: "02",
    title: "Technical",
    slug: "technical",
    subtitle: "Build. Invent. Compete.",
    description:
      "Where cutting-edge code meets mechanical ingenuity. Step into futuristic laser-lit arenas designed for elite inventors and problem solvers.",
    image: "/images/concert-tech-stage.jpg",
    rulebookUrl: "/rulebooks/saviskar-2026-technical-rulebook.pdf",
    tags: ["Coding", "Robotics", "Drones", "Hackathons"],
  },
  {
    number: "03",
    title: "Sports",
    slug: "sports",
    subtitle: "Play. Push. Win.",
    description:
      "Under towering stadium floodlights and pyrotechnics, bring unstoppable athletic energy, represent your campus, and fight for glory.",
    image: "/images/concert-sports-arena.jpg",
    rulebookUrl: "/rulebooks/saviskar-2026-sports-rulebook.pdf",
    tags: ["Athletics", "Basketball", "Badminton", "Volleyball"],
  },
  {
    number: "04",
    title: "Non-Technical",
    slug: "non-technical",
    subtitle: "Create. Think. Express.",
    description:
      "Strategy, visual arts, cinematic storytelling and unconventional challenges that unleash raw creative genius without boundaries.",
    image: "/images/concert-solution-panoramic.jpg",
    rulebookUrl: "/rulebooks/saviskar-2026-non-technical-rulebook.pdf",
    tags: ["Photography", "Short Film", "Open Mic", "Doodle Art"],
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function Events() {
  return (
    <section
      id="events"
      className="relative overflow-hidden bg-transparent px-4 pb-32 pt-28 text-white md:px-8 md:pb-44 md:pt-36"
    >
      {/* Theatrical background glow */}
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-violet-700/10 blur-[150px]" />
      <div className="pointer-events-none absolute left-[5%] bottom-[15%] h-[550px] w-[550px] rounded-full bg-fuchsia-700/10 blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-[1440px]">
        {/* Header Bar */}
        <div className="mb-14 px-2 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.6, ease }}
            className="mb-8 flex items-center justify-between border-b border-white/10 pb-5"
          >
            <div className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300">
              <Sparkles size={12} />
              Featured Competitions
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">
              04 ARENAS • 50+ EVENTS
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-[1.6fr_0.8fr] md:items-end">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.9, ease }}
              className="text-[clamp(3.8rem,8.5vw,8.5rem)] font-light leading-[0.82] tracking-tight text-white"
            >
              Find your <br />
              <span className="font-editorial text-violet-300 font-normal">arena.</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.12, ease }}
              className="md:pb-3"
            >
              <p className="max-w-md text-sm leading-6 text-white/55 md:text-base">
                From high-speed algorithmic hackathons to thunderous stadium dance crews.
                Select your battleground, inspect official rulebooks, and step into the arena.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href="/events"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-violet-300"
                >
                  Explore All 50+ Events
                  <ArrowUpRight
                    size={15}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Arenas Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {arenas.map((event, index) => (
            <EventCard
              key={event.slug}
              event={event}
              index={index}
              ease={ease}
            />
          ))}
        </div>

        {/* Bottom Banner with Rulebook Downloads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="liquid-glass mt-14 flex flex-col gap-6 rounded-[28px] p-8 md:mt-20 md:flex-row md:items-center md:justify-between md:p-10"
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-violet-400">
              Official Regulations
            </span>
            <h3 className="mt-1 text-xl font-semibold text-white md:text-2xl">
              Download Festival Rulebooks
            </h3>
            <p className="mt-2 max-w-xl text-xs leading-5 text-white/50 md:text-sm">
              Review eligibility criteria, judging guidelines, and arena regulations verified by the CGC University academic and festival committee.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/rulebooks/saviskar-2026-cultural-rulebook.pdf"
              download
              className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-white transition hover:border-violet-400 hover:text-violet-300"
            >
              <FileDown size={14} /> Cultural
            </a>
            <a
              href="/rulebooks/saviskar-2026-technical-rulebook.pdf"
              download
              className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-white transition hover:border-violet-400 hover:text-violet-300"
            >
              <FileDown size={14} /> Technical
            </a>
            <a
              href="/rulebooks/saviskar-2026-sports-rulebook.pdf"
              download
              className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-white transition hover:border-violet-400 hover:text-violet-300"
            >
              <FileDown size={14} /> Sports
            </a>
            <a
              href="/rulebooks/saviskar-2026-non-technical-rulebook.pdf"
              download
              className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-white transition hover:border-violet-400 hover:text-violet-300"
            >
              <FileDown size={14} /> Non-Tech
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
