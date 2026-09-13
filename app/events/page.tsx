import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileDown, Sparkles } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "50+ Competitive Realms",
  description:
    "Explore 50+ competitive realms at Saviskar 2026: Aevorian Reverie at CGC University, Mohali. Technical hackathons, robotics, dance battles, athletic championships, and creative non-tech challenges.",
  openGraph: {
    title: "50+ Competitive Realms | Saviskar 2026: Aevorian Reverie",
    description:
      "Technical hackathons, robotics, dance battles, sports championships, and creative arts at CGC University, Mohali.",
  },
};

const categories = [
  {
    number: "01",
    title: "Technical",
    slug: "technical",
    tagline: "Build. Invent. Compete.",
    description:
      "Hackathons, drone obstacle courses, high-torque combat robotics, and competitive debugging. Engineer the future under the heat of high-stakes battle.",
    image: "/images/concert-tech-stage.jpg",
    rulebookUrl: "/rulebooks/saviskar-2026-technical-rulebook.pdf",
    tags: ["Bug Hunt", "Dronathon", "RoboRace", "TechXhibit"],
  },
  {
    number: "02",
    title: "Cultural",
    slug: "cultural",
    tagline: "Dance. Music. Performance.",
    description:
      "Battle of the bands, high-energy crew choreography, street-style rap faceoffs, and theatrical showcases rocking the central stadium mainstage.",
    image: "/images/concert-cultural-stage.jpg",
    rulebookUrl: "/rulebooks/saviskar-2026-cultural-rulebook.pdf",
    tags: ["Step Stars", "Solo Singing", "Gully War", "Battle of Bands"],
  },
  {
    number: "03",
    title: "Sports",
    slug: "sports",
    tagline: "Play. Push. Win.",
    description:
      "High-octane athletics, court championships, and thunderous stadium rivalries under blinding floodlights. Leave everything on the turf.",
    image: "/images/concert-sports-arena.jpg",
    rulebookUrl: "/rulebooks/saviskar-2026-sports-rulebook.pdf",
    tags: ["Athletics", "Basketball", "Badminton", "Volleyball"],
  },
  {
    number: "04",
    title: "Non-Technical",
    slug: "non-technical",
    tagline: "Create. Think. Express.",
    description:
      "High-stakes diplomacy, fast-paced mock trading, blitz debates, photography, and raw creative visual storytelling.",
    image: "/images/concert-solution-panoramic.jpg",
    rulebookUrl: "/rulebooks/saviskar-2026-non-technical-rulebook.pdf",
    tags: ["Photography", "Short Film", "Doodle Art", "Open Mic"],
  },
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Subtle stage haze background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[10%] h-[600px] w-[600px] rounded-full bg-violet-700/10 blur-[160px]" />
        <div className="absolute right-[10%] top-[40%] h-[550px] w-[550px] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      {/* HEADER */}
      <header className="relative z-20 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-8 md:px-10">
        <Link
          href="/"
          className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white/70 transition hover:text-white"
        >
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-white/50 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          <span>Realms • Aevorian Reverie</span>
        </div>

        <Link
          href="/register"
          className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black transition hover:bg-violet-100"
        >
          Register
        </Link>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-[1440px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        <div className="liquid-glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300">
          <Sparkles size={12} />
          CGC University • Aevorian Reverie • 50+ Competitions
        </div>

        <h1 className="max-w-[1100px] text-[clamp(4.5rem,11vw,11rem)] font-light leading-[0.8] tracking-tight text-white">
          Choose your <br />
          <span className="font-editorial text-violet-300 font-normal">realm.</span>
        </h1>

        <div className="mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-t border-white/10 pt-8">
          <p className="max-w-md text-base leading-7 text-white/60">
            Technology. Performance. Creativity. Championship Glory.
            Step into the realm that matches your ambition.
          </p>

          <div className="flex items-center gap-3 text-xs text-white/40">
            <span>Verified Rulebooks Available</span>
          </div>
        </div>
      </section>

      {/* EVENT CATEGORIES GRID */}
      <section className="relative z-10 mx-auto max-w-[1440px] px-6 pb-36 md:px-10">
        <div className="space-y-8">
          {categories.map((category) => (
            <div
              key={category.title}
              className="liquid-glass group relative overflow-hidden rounded-[32px] border border-white/12 p-8 transition-all hover:border-violet-500/40 hover:shadow-[0_20px_60px_rgba(168,85,247,0.18)] md:p-12"
            >
              <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
                {/* Information */}
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs tracking-widest text-violet-400">
                      REALM {category.number}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-xs uppercase tracking-wider text-white/50">
                      {category.tagline}
                    </span>
                  </div>

                  <h2 className="mt-3 text-[clamp(2.8rem,6vw,5.5rem)] font-light leading-none tracking-tight text-white">
                    {category.title}
                  </h2>

                  <p className="mt-4 max-w-lg text-sm leading-6 text-white/65 md:text-base">
                    {category.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {category.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href={`/events/${category.slug}`}
                      className="group/btn inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-all hover:scale-105 hover:bg-violet-100"
                    >
                      View {category.title} Events
                      <ArrowUpRight size={16} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </Link>

                    <a
                      href={category.rulebookUrl}
                      download
                      className="liquid-glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10 hover:border-violet-400"
                    >
                      <FileDown size={15} />
                      Download Rulebook PDF
                    </a>
                  </div>
                </div>

                {/* 8K Concert Photography Preview */}
                <div className="relative h-[280px] w-full overflow-hidden rounded-[24px] md:h-[380px]">
                  <Image
                    src={category.image}
                    alt={`${category.title} realm stage`}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/60 font-mono">
                    <span>STAGE 0{category.number}</span>
                    <span>CGC UNIVERSITY</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}