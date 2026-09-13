"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import Navbar from "@/components/ui/Navbar";

const images = [
  {
    src: "/gallery/crowd.jpg",
    title: "One Stage. Thousands of Voices.",
    category: "Main Stage",
    description: "Stadium floodlights, pyro sparks, and 25,000+ voices singing in unison.",
  },
  {
    src: "/gallery/car show.jpg",
    title: "Built to Turn Heads",
    category: "Showcase",
    description: "High-horsepower automotive and engineering exhibition.",
  },
  {
    src: "/gallery/entry.jpg",
    title: "The Experience Begins",
    category: "Arrivals",
    description: "Delegates checking in from universities across India.",
  },
  {
    src: "/gallery/gate.jpg",
    title: "Welcome to Saviskar",
    category: "Campus",
    description: "The grand illuminated gateway of CGC University Mohali.",
  },
  {
    src: "/gallery/decor.jpg",
    title: "A Campus Transformed",
    category: "Atmosphere",
    description: "Art installations and laser projection mapping across the campus grounds.",
  },
  {
    src: "/gallery/car.jpg",
    title: "Machines Meet Culture",
    category: "Showcase",
    description: "Where engineering horsepower meets contemporary art.",
  },
  {
    src: "/gallery/registration.jpg",
    title: "Where It All Begins",
    category: "Behind the Scenes",
    description: "Fast-track verification and delegate kit distribution.",
  },
  {
    src: "/gallery/non tech.jpg",
    title: "Ideas Beyond the Classroom",
    category: "Non-Technical",
    description: "Strategic simulations, open mic sessions, and visual storytelling.",
  },
  {
    src: "/gallery/dance.jpg",
    title: "Stories in Motion",
    category: "Culture",
    description: "Fierce dance crews fighting for the national trophy.",
  },
  {
    src: "/gallery/flash mob.jpg",
    title: "Move Together",
    category: "Campus",
    description: "Spontaneous stadium flash mob taking over the central quad.",
  },
  {
    src: "/gallery/gallery-3.jpg",
    title: "When the Night Takes Over",
    category: "Night",
    description: "Midnight stadium illumination and bass waves.",
  },
  {
    src: "/gallery/sports.jpg",
    title: "Play. Push. Win.",
    category: "Sports",
    description: "High-stakes inter-university athletic and court championships.",
  },
  {
    src: "/gallery/technical.jpg",
    title: "Build. Invent. Compete.",
    category: "Technical",
    description: "Combat robotics, algorithmic hackathons, and drone racing.",
  },
  {
    src: "/gallery/cultural.jpg",
    title: "Culture Takes the Stage",
    category: "Culture",
    description: "Bands, solo vocals, and theatrical performances under spotlights.",
  },
  {
    src: "/gallery/gallery-2.jpg",
    title: "Create Without Limits",
    category: "Non-Technical",
    description: "Live graffiti, visual arts, and digital canvas competitions.",
  },
  {
    src: "/gallery/team.jpg",
    title: "People Make the Festival",
    category: "Behind the Scenes",
    description: "The student coordinator team that makes every moment possible.",
  },
  {
    src: "/gallery/gallery-1.jpg",
    title: "This Is Saviskar.",
    category: "Main Stage",
    description: "The iconic grand finale under a sea of phone lanterns.",
  },
];

const CATEGORIES = [
  "All",
  "Main Stage",
  "Technical",
  "Culture",
  "Sports",
  "Showcase",
  "Behind the Scenes",
];

export default function FullGalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filteredImages =
    activeCategory === "All"
      ? images
      : images.filter((img) => img.category === activeCategory);

  const selected = selectedIndex !== null ? filteredImages[selectedIndex] : null;

  const next = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % filteredImages.length);
  };

  const prev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      (selectedIndex - 1 + filteredImages.length) % filteredImages.length
    );
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredImages.length]);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Corner Singularity Disc Navbar */}
      <Navbar />

      {/* Theatrical background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-[10%] h-[600px] w-[600px] rounded-full bg-violet-700/10 blur-[170px]" />
        <div className="absolute right-[10%] top-[40%] h-[550px] w-[550px] rounded-full bg-fuchsia-700/10 blur-[160px]" />
      </div>

      {/* Header Container */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-12 pt-28 md:px-10 md:pt-36">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white/70 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Return to Command</span>
          </Link>

          <span className="font-mono text-[10px] tracking-[0.3em] text-violet-400 uppercase">
            ARCHIVE // 17 FRAMES
          </span>
        </div>

        <div className="liquid-glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300">
          <Sparkles size={12} />
          Complete Photographic Chronicle
        </div>

        <h1 className="max-w-[1100px] text-[clamp(3.8rem,9vw,8.5rem)] font-light leading-[0.82] tracking-tight text-white">
          The Full <br />
          <span className="font-editorial text-violet-300 font-normal">Archive.</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-white/60 md:text-lg">
          Explore high-definition snapshots of stadium concerts, fierce inter-university realm battles,
          campus installations, and the delegates who define Saviskar at CGC University, Mohali.
        </p>

        {/* Category Filters */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-white/10 pb-8">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setSelectedIndex(null);
                }}
                className={`rounded-full px-5 py-2 text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                    : "border border-white/10 bg-white/[0.03] text-white/60 hover:border-violet-400/40 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Photo Grid */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-36 md:px-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((img, idx) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.5 }}
              whileHover={{ y: -6 }}
              onClick={() => setSelectedIndex(idx)}
              className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.02] shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all hover:border-violet-500/50 hover:shadow-[0_20px_50px_rgba(168,85,247,0.2)]"
            >
              <div className="relative h-72 w-full overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity group-hover:opacity-85" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="font-mono text-[9px] uppercase tracking-widest text-violet-300">
                  {img.category}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-white group-hover:text-violet-200">
                  {img.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-white/50">
                  {img.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl md:p-10"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>

            {/* Prev/Next Buttons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-white/20"
              aria-label="Previous image"
            >
              <ArrowLeft size={20} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-white/20"
              aria-label="Next image"
            >
              <ArrowRight size={20} />
            </button>

            <div
              className="relative max-h-[85vh] max-w-5xl overflow-hidden rounded-[28px] border border-white/20 bg-black/90 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-[65vh] w-[80vw] max-w-4xl overflow-hidden rounded-[20px]">
                <Image
                  src={selected.src}
                  alt={selected.title}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="mt-4 flex items-center justify-between px-3">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-violet-400 uppercase">
                    {selected.category}
                  </span>
                  <h2 className="text-xl font-semibold text-white">
                    {selected.title}
                  </h2>
                </div>
                <span className="font-mono text-xs text-white/40">
                  {selectedIndex! + 1} / {filteredImages.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
