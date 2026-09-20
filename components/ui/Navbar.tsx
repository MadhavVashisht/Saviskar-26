"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Sparkles, X, Compass, Radio } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  category: string;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "01",
    label: "Home",
    href: "/",
    category: "COMMAND",
    description: "Aevorian Reverie mainstage & theme anthem",
  },
  {
    id: "02",
    label: "Realms",
    href: "/events",
    category: "REALMS",
    description: "50+ Technical, Cultural, Sports & Non-Tech realms",
  },
  {
    id: "03",
    label: "Organising Team",
    href: "/team",
    category: "CREW",
    description: "Faculty convenors, leads & student council",
  },
  {
    id: "04",
    label: "Gallery",
    href: "/gallery",
    category: "ARCHIVE",
    description: "Photographic archive of stadium lights & concerts",
  },
  {
    id: "05",
    label: "Legacy",
    href: "/legacy",
    category: "CHRONICLE",
    description: "Srijan, Avishkar & the evolution of Saviskar",
  },
  {
    id: "06",
    label: "Schedule",
    href: "/schedule",
    category: "TIMELINE",
    description: "48-hour live competition & stage timeline",
  },
  {
    id: "07",
    label: "Sponsors",
    href: "/sponsors",
    category: "ALLIES",
    description: "National corporate allies & technology partners",
  },
  {
    id: "08",
    label: "Star Night",
    href: "/starnight",
    category: "FINALE",
    description: "Stadium concerts & headline performances",
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for subtle dynamic appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when menu is expanded on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. FIXED TOP BRAND LOGO (TOP-LEFT)
          Smoothly glides in when user scrolls past centered hero logo
          Always visible on non-home routes
      ─────────────────────────────────────────────────────────────── */}
      <div className="fixed left-4 top-4 z-50 md:left-8 md:top-6">
        <motion.div
          initial={false}
          animate={{
            opacity: pathname !== "/" || scrolled ? 1 : 0,
            y: pathname !== "/" || scrolled ? 0 : -8,
            scale: pathname !== "/" || scrolled ? 1 : 0.94,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ pointerEvents: pathname !== "/" || scrolled ? "auto" : "none" }}
        >
          <Link
            href="/"
            className={`group flex items-center rounded-full border px-3 py-1.5 md:px-3.5 md:py-1.5 transition-all duration-300 backdrop-blur-xl ${
              scrolled
                ? "border-white/15 bg-black/80 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.2)] hover:border-violet-500/40 hover:scale-105"
                : "border-white/10 bg-black/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-violet-500/40 hover:scale-105"
            }`}
          >
            <Image
              src="/logo.png"
              alt="Saviskar 2026"
              width={1448}
              height={307}
              unoptimized
              priority
              className="h-5 sm:h-6 md:h-6.5 w-auto object-contain transition-transform duration-200"
            />
          </Link>
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FIXED TOP CENTER PILL BADGE
          "CGC UNIVERSITY • MOHALI | AEVORIAN REVERIE"
          Hidden by default at top of home; smoothly pinches to top on scroll
      ─────────────────────────────────────────────────────────────── */}
      <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <motion.div
          initial={false}
          animate={{
            opacity: pathname !== "/" || scrolled ? 1 : 0,
            y: pathname !== "/" || scrolled ? 0 : -10,
            scale: pathname !== "/" || scrolled ? 1 : 0.92,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ pointerEvents: pathname !== "/" || scrolled ? "auto" : "none" }}
          className={`liquid-glass inline-flex items-center gap-2 sm:gap-2.5 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-[9px] sm:text-[10px] md:text-[11px] font-semibold uppercase tracking-wider sm:tracking-[0.3em] text-white/85 shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-xl transition-all duration-300 max-w-[70vw] sm:max-w-none truncate ${
            scrolled
              ? "border-white/15 bg-black/80 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.25)]"
              : "border-white/10 bg-black/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          }`}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
          <span className="truncate">CGC UNIVERSITY • MOHALI</span>
          <span className="text-white/30">|</span>
          <span className="text-violet-300 shrink-0">AEVORIAN REVERIE</span>
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CORNER SINGULARITY DISC TRIGGER (TOP-RIGHT)
          Futuristic rotating HUD disc with pulsating singularity core
      ─────────────────────────────────────────────────────────────── */}
      <div className="fixed right-4 top-4 z-50 md:right-8 md:top-6">
        <motion.button
          type="button"
          onClick={toggleMenu}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          aria-label={isOpen ? "Close menu" : "Open orbital navigation"}
          aria-expanded={isOpen}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          {/* Outer Rotating HUD Reticle Ring */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 360 }}
            transition={{
              duration: isOpen ? 0.6 : 16,
              repeat: isOpen ? 0 : Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border border-dashed border-violet-400/40 group-hover:border-violet-400 group-hover:shadow-[0_0_18px_rgba(168,85,247,0.6)]"
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%)",
            }}
          />

          {/* Secondary Concentric Orbit Line */}
          <div
            className={`absolute inset-1.5 rounded-full border transition-all duration-500 ${
              isOpen
                ? "border-violet-400/70 bg-violet-950/40"
                : "border-white/15 bg-black/60 backdrop-blur-xl group-hover:border-violet-400/40 group-hover:bg-black/80"
            }`}
          />

          {/* Ambient Radial Singularity Aura */}
          <motion.div
            animate={{
              opacity: isOpen ? [0.6, 0.9, 0.6] : isHovered ? 0.8 : 0.35,
              scale: isOpen ? [1, 1.15, 1] : 1,
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-radial from-violet-500/35 via-fuchsia-600/20 to-transparent blur-md pointer-events-none"
          />

          {/* Center Singularity Core / Icon Switcher */}
          <div className="relative z-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close-icon"
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25, ease: "backOut" }}
                  className="text-violet-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                >
                  <X size={20} strokeWidth={2.2} />
                </motion.div>
              ) : (
                <motion.div
                  key="singularity-core"
                  initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25, ease: "backOut" }}
                  className="flex flex-col items-center justify-center"
                >
                  {/* Singularity Glyph (4 Orbital Coordinate Nodes) */}
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    <span className="absolute h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_#c084fc]" />
                    <span className="absolute -top-0.5 h-1 w-1 rounded-full bg-white/70" />
                    <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-white/70" />
                    <span className="absolute -left-0.5 h-1 w-1 rounded-full bg-white/70" />
                    <span className="absolute -right-0.5 h-1 w-1 rounded-full bg-white/70" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Micro HUD Label Pill (appears on hover or when open) */}
          <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.25em] text-violet-300/80 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
            {isOpen ? "CLOSE" : "MENU"}
          </span>
        </motion.button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ORBITAL SPOKE MENU MODAL (EXPANDED FROM TOP-RIGHT)
          Bespoke high-tech HUD command deck with spring-loaded spoke items
      ─────────────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────
          3. FULL-SCREEN SCATTERED CARDS NAVIGATION CONSTELLATION
          Interactive holographic cards floating all over the screen
      ─────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10 select-none">
            {/* Cinematic Blur & Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-3xl"
            />

            {/* Stage Spotlight Glows in Background */}
            <div className="pointer-events-none fixed left-[15%] top-[20%] h-[550px] w-[550px] rounded-full bg-violet-600/15 blur-[170px]" />
            <div className="pointer-events-none fixed right-[10%] bottom-[15%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/15 blur-[180px]" />

            {/* Top Navigation HUD Header */}
            <div className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/15 text-violet-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <Compass size={16} className="animate-spin-slow" />
                </div>
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/90 font-bold">
                    SAVISKAR 2026 • ORBITAL CARDS
                  </span>
                  <p className="font-mono text-[9px] text-white/40 tracking-widest">
                    CGC UNIVERSITY MOHALI // SELECT A DESTINATION REALM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden font-mono text-[10px] tracking-widest text-white/40 sm:inline-block">
                  [ ESC TO CLOSE ]
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:scale-110 hover:bg-white/20 hover:border-violet-400"
                  aria-label="Close navigation"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scattered Cards Layout Container */}
            {/* Desktop: Scattered absolute constellation across viewport */}
            <div className="relative z-10 mx-auto hidden min-h-[78vh] w-full max-w-[1440px] lg:block">
              {MENU_ITEMS.map((item, index) => {
                const active = isActiveLink(item.href);
                const pos = [
                  { top: "6%", left: "3%", rotate: -3.5 },
                  { top: "4%", left: "36%", rotate: 2.8 },
                  { top: "8%", left: "70%", rotate: -2.2 },
                  { top: "37%", left: "8%", rotate: 3.2 },
                  { top: "35%", left: "41%", rotate: -3.8 },
                  { top: "39%", left: "73%", rotate: 2.4 },
                  { top: "68%", left: "16%", rotate: -2.6 },
                  { top: "66%", left: "54%", rotate: 3.4 },
                ][index];

                return (
                  <motion.div
                    key={item.id}
                    initial={{
                      opacity: 0,
                      scale: 0.5,
                      y: 60,
                      rotate: pos.rotate * 2.2,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      rotate: pos.rotate,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.6,
                      y: 40,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                      delay: index * 0.045,
                    }}
                    style={{
                      top: pos.top,
                      left: pos.left,
                    }}
                    className="absolute w-[290px] xl:w-[320px]"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`liquid-glass group relative block rounded-[28px] p-6 border transition-all duration-300 ${
                        active
                          ? "border-violet-400 bg-violet-950/40 shadow-[0_20px_50px_rgba(168,85,247,0.35),0_0_30px_rgba(168,85,247,0.3)]"
                          : "border-white/15 bg-black/80 hover:border-violet-400/70 hover:bg-violet-950/30 hover:shadow-[0_25px_60px_rgba(168,85,247,0.4),0_0_35px_rgba(168,85,247,0.25)] hover:scale-105 hover:rotate-0 hover:z-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-violet-300 font-semibold">
                          {item.category} {"//"} {item.id}
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-black">
                          <ArrowUpRight size={14} className="text-white group-hover:text-black" />
                        </div>
                      </div>

                      <h3 className="mt-4 text-xl font-bold tracking-tight text-white group-hover:text-violet-200">
                        {item.label}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-white/50 group-hover:text-white/70">
                        {item.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/35 font-mono">
                        <span>DESTINATION</span>
                        <span className="text-violet-300 font-semibold">EXPLORE →</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile / Tablet: Responsive Scattered Grid with Playful Rotations */}
            <div className="relative z-10 mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
              {MENU_ITEMS.map((item, index) => {
                const active = isActiveLink(item.href);
                const rotations = [-2.5, 2, -1.8, 2.2, -2, 1.8, -2.2, 2.5];
                const rot = rotations[index % rotations.length];

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: rot }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 26,
                      delay: index * 0.04,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`liquid-glass group block rounded-[24px] p-5 border transition-all ${
                        active
                          ? "border-violet-400 bg-violet-950/40 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                          : "border-white/15 bg-black/85 hover:border-violet-400/60 hover:bg-violet-950/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-300">
                          {item.category} {"//"} {item.id}
                        </span>
                        <ArrowUpRight size={14} className="text-white/40 group-hover:text-white" />
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-white">
                        {item.label}
                      </h3>
                      <p className="mt-1 text-xs text-white/50 leading-relaxed">
                        {item.description}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}