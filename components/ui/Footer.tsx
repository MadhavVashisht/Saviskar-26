"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, Phone, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <motion.footer
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 overflow-hidden border-t border-white/10 bg-black/60 backdrop-blur-2xl px-4 py-12 sm:px-6 sm:py-16 text-white md:px-10 md:py-20"
    >
      {/* 8K Stadium Concert Fireworks Continuation Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="relative h-full w-full">
          <Image
            src="/images/scene-finale-celebration.webp"
            alt="Saviskar 2026 Concert Stadium Celebration Continuation"
            fill
            sizes="100vw"
            className="object-cover object-bottom opacity-35"
          />
        </div>

        {/* Volumetric Concert Lighting & Multi-Layer Stage Haze Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.22)_0%,rgba(0,0,0,0.55)_50%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/90 pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[450px] w-[80vw] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12)_0%,transparent_70%)] blur-[90px] pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-12 border-b border-white/10 pb-16 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-2xl font-bold tracking-[0.15em]">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
              SAVISKAR 2026
            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
              North India&apos;s flagship Annual National Techno-Cultural University Festival at CGC University, Mohali. Born from the roots of Srijan and Avishkar, uniting 25,000+ creators across 500+ colleges under Aevorian Reverie.
            </p>

            <div className="mt-6 flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.22em] text-violet-400 font-medium">
                Theme: Aevorian Reverie
              </span>
              <span className="font-editorial text-xs text-white/50 tracking-wider">
                Where Tomorrow Dreams Awake • &ldquo;A future imagined so vividly, it begins to exist.&rdquo;
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm text-white/55 md:grid-cols-3">
            <Link href="/#about" className="transition-colors hover:text-white">
              About
            </Link>

            <Link href="/events" className="transition-colors hover:text-white">
              Realms
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
              href="https://www.youtube.com/@SaviskarCGCU"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-white"
            >
              YouTube
              <ArrowUpRight size={13} />
            </a>

            <a
              href="https://www.linkedin.com/company/cgcuniversitymohali/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-white"
            >
              LinkedIn
              <ArrowUpRight size={13} />
            </a>

            <Link
              href="/events"
              className="flex items-center gap-1 text-violet-300 hover:text-white"
            >
              Rulebooks
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-[12px] text-white/35 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium text-white/60">CGC University, Mohali</p>
            <p className="mt-0.5 text-[11px] text-white/40">
              State Highway 12A, Chandigarh-Sirhind Road, Sahibzada Ajit Singh Nagar, Punjab 140307
            </p>
          </div>

          <div className="flex flex-col items-start gap-1.5 md:items-end">
            <p className="font-mono text-[11px] tracking-wider text-white/40">
              © 2026 SAVISKAR • CGC UNIVERSITY MOHALI • ALL RIGHTS RESERVED
            </p>
            <p className="text-[11px] text-white/50 flex items-center gap-1">
              <span>Made by</span>
              <a
                href="https://www.amadhav.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-violet-300 transition-colors hover:text-white underline underline-offset-2 inline-flex items-center gap-0.5"
              >
                <span>Madhav Vashisht</span>
                <ArrowUpRight size={11} className="inline opacity-70" />
              </a>
            </p>
          </div>
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
              className="liquid-glass relative max-h-[90vh] overflow-y-auto w-full max-w-lg rounded-[28px] sm:rounded-[32px] border border-white/15 bg-black/95 p-6 sm:p-8 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.18)] md:p-10 scrollbar-thin scrollbar-thumb-white/10"
              onClick={(event) => event.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setContactOpen(false)}
                className="absolute right-4 top-4 sm:right-6 sm:top-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:text-white"
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
                Have questions regarding event registrations, university delegations, schedules, or campus venue? Contact our student coordinators.
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.a
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    href="tel:+917667340235"
                    className="liquid-glass flex items-center gap-3 rounded-2xl border border-white/10 p-3.5 transition-colors hover:border-violet-500/40 hover:bg-white/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                        Convenor Desk
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-white">
                        +91 76673 40235
                      </p>
                    </div>
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    href="tel:+916280039126"
                    className="liquid-glass flex items-center gap-3 rounded-2xl border border-white/10 p-3.5 transition-colors hover:border-violet-500/40 hover:bg-white/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                        Technical & Realm Ops
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-white">
                        +91 6280039126
                      </p>
                    </div>
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    href="tel:+917347250314"
                    className="liquid-glass flex items-center gap-3 rounded-2xl border border-white/10 p-3.5 transition-colors hover:border-violet-500/40 hover:bg-white/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                        Hospitality Desk
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-white">
                        +91 7347250314
                      </p>
                    </div>
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    href="tel:+918572815510"
                    className="liquid-glass flex items-center gap-3 rounded-2xl border border-white/10 p-3.5 transition-colors hover:border-violet-500/40 hover:bg-white/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                        Registrations
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-white">
                        +91 85728 15510
                      </p>
                    </div>
                  </motion.a>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center text-[10px] text-white/40">
                Campus Venue: CGC University, Sector 112, Landran, Mohali, Punjab - 140307, India
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.footer>
  );
}