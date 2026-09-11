"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "About", href: "/#about" },
    { label: "Events", href: "/#events" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Schedule", href: "/schedule" },
    { label: "Star Night", href: "/starnight" },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="fixed left-0 top-0 z-50 w-full px-3 pt-4 md:px-6"
      >
        <div
          className={`
            mx-auto max-w-[1240px]
            rounded-full
            transition-all
            duration-500
            liquid-glass
            ${scrolled
              ? "border-white/20 bg-black/60 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.12)] backdrop-blur-2xl"
              : "border-white/10 bg-black/30 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            }
          `}
        >
          <div className="flex h-[66px] items-center justify-between px-6 md:px-8">
            {/* Logo */}
            <Link
              href="/"
              className="relative z-50 flex items-center gap-2.5 font-sans text-[15px] font-bold tracking-[0.18em] text-white transition-opacity hover:opacity-80"
            >
              <motion.span
                animate={{
                  scale: [1, 1.25, 1],
                  boxShadow: [
                    "0 0 8px rgba(168,85,247,0.7)",
                    "0 0 16px rgba(168,85,247,1)",
                    "0 0 8px rgba(168,85,247,0.7)",
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="h-2 w-2 rounded-full bg-violet-400"
              />
              <span>SAVISKAR</span>
              <motion.span
                whileHover={{ scale: 1.06, borderColor: "rgba(168,85,247,0.7)" }}
                transition={{ duration: 0.2 }}
                className="hidden sm:inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-mono text-[9px] font-normal tracking-[0.2em] text-violet-300"
              >
                AEVORIAN REVERIE
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
              {navItems.map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    className="text-[13px] font-medium tracking-wide text-white/65 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Register Action */}
            <div className="hidden items-center gap-4 md:flex">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/register"
                  className="group flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[12px] font-semibold tracking-wide text-black transition-all hover:bg-violet-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.45)]"
                >
                  Register
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="relative z-50 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
            >
              {menuOpen ? (
                <X size={20} strokeWidth={1.5} />
              ) : (
                <Menu size={20} strokeWidth={1.5} />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu (with IN and OUT animations via AnimatePresence) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />

            {/* Theatrical stage haze in menu */}
            <div className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/15 blur-[100px] pointer-events-none" />

            <div className="relative flex h-full flex-col px-7 pb-10 pt-32">
              {/* Navigation */}
              <div className="flex flex-1 flex-col justify-center gap-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between border-b border-white/10 py-5 font-sans text-3xl font-light tracking-tight text-white transition-colors hover:text-violet-300 active:text-violet-400"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight
                        size={20}
                        strokeWidth={1.3}
                        className="text-white/40"
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Register CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-14 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold tracking-wide text-black shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all hover:bg-violet-100 active:scale-98"
                >
                  Register for Saviskar 2026
                  <ArrowUpRight size={16} strokeWidth={1.5} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}