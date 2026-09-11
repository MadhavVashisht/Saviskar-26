"use client";
import Link from "next/link";
import { ArrowUpRight, Mail, Phone, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="relative z-10 border-t border-white/10 bg-black px-6 py-16 text-white md:px-10 md:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-12 border-b border-white/10 pb-16 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-2xl font-bold tracking-[0.15em]">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
              SAVISKAR 2026
            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
              The premier annual techno-cultural celebration of CGC University, Mohali.
              Two days of high-octane competition, innovation, and star performances.
            </p>

            <div className="mt-6 flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.22em] text-violet-400 font-medium">
                Theme: Aevorian Reverie
              </span>
              <span className="font-editorial text-xs text-white/50 tracking-wider">
                Where Tomorrow Dreams Awake
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm text-white/55 md:grid-cols-3">
            <Link href="/#about" className="transition-colors hover:text-white">
              About
            </Link>

            <Link href="/#events" className="transition-colors hover:text-white">
              Arenas
            </Link>

            <Link href="/#gallery" className="transition-colors hover:text-white">
              Moments
            </Link>

            <Link href="/schedule" className="transition-colors hover:text-white">
              Schedule
            </Link>

            <Link href="/starnight" className="transition-colors hover:text-white">
              Star Night
            </Link>

            <Link href="/register" className="transition-colors hover:text-white">
              Register
            </Link>

            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="text-left transition-colors hover:text-white"
            >
              Contact Team
            </button>

            <a
              href="https://www.instagram.com/saviskar.cgcuniversity/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-white"
            >
              Instagram
              <ArrowUpRight size={13} />
            </a>

            <a
              href="/rulebooks/saviskar-2026-general-rulebook.pdf"
              target="_blank"
              download
              className="flex items-center gap-1 text-violet-300 hover:text-white"
            >
              Rulebooks
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-[12px] text-white/35 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Saviskar • CGC University, Mohali. All rights reserved.</p>

          <p className="font-mono text-[11px] tracking-wider text-white/40">
            SECTOR 112, LANDRAN, MOHALI, PUNJAB • 140307
          </p>
        </div>
      </div>

      {/* Liquid Glass Contact Modal with IN, OUT, and ON animations */}
      <AnimatePresence>
        {contactOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
            onClick={() => setContactOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass relative w-full max-w-md rounded-[32px] border border-white/15 bg-black/90 p-8 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.18)] md:p-10"
              onClick={(event) => event.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setContactOpen(false)}
                className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:text-white"
                aria-label="Close contact"
              >
                <X size={16} />
              </motion.button>

              <p className="text-[10px] uppercase tracking-[0.3em] text-violet-400">
                CGC University • Mohali
              </p>

              <h2 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-white">
                Official <span className="font-editorial text-violet-300">Helpline</span>
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/50">
                Have questions regarding event registrations, schedules, or campus venue? Contact the student coordinators.
              </p>

              <div className="mt-8 space-y-3">
                <motion.a
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  href="mailto:saviskar@cgcuniversity.in"
                  className="liquid-glass flex items-center gap-4 rounded-2xl border border-white/10 p-4 transition-colors hover:border-violet-500/40 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                      Official Email
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-white">
                      saviskar@cgcuniversity.in
                    </p>
                  </div>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  href="tel:+917667340235"
                  className="liquid-glass flex items-center gap-4 rounded-2xl border border-white/10 p-4 transition-colors hover:border-violet-500/40 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                      Student Coordinator Helpline
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-white">
                      +91 76673 40235
                    </p>
                  </div>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  href="tel:+918099731133"
                  className="liquid-glass flex items-center gap-4 rounded-2xl border border-white/10 p-4 transition-colors hover:border-violet-500/40 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                      Technical & Event Support
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-white">
                      +91 80997 31133
                    </p>
                  </div>
                </motion.a>
              </div>

              <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center text-[10px] text-white/40">
                Campus Venue: CGC University, Sector 112, Landran, Mohali, Punjab
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}