"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DeskEditorialSpread from "@/components/team/DeskEditorialSpread";

// ============================================================
// DIGNITARIES DATA
// ============================================================
const DIGNITARIES = [
  {
    id: "chancellor-rashpal",
    titleBadge: "INSTITUTIONAL FOUNDER // CHANCELLOR",
    deskTitle: "MR. RASHPAL SINGH DHALIWAL",
    dropCap: "T",
    paragraphs: [
      "he story of Saviskar begins here — with a single unwavering belief that education must ignite, not merely inform. Mr. Rashpal Singh Dhaliwal, Chancellor of CGC University, transformed a vision of academic excellence into one of North India's most dynamic university ecosystems.",
      "Under his stewardship, CGC has grown into a nationally ranked institution where technical brilliance meets cultural vitality. Saviskar 2026 — Aevorian Reverie — is the living proof of that founding philosophy: that a university campus should be a stage for the boldest ideas and the most fearless human expression.",
      "His legacy is not built in stone. It is built in every student who steps onto this campus, finds their calling, and carries it forward.",
    ],
    signeeName: "Mr. Rashpal Singh Dhaliwal",
    signeeRole: "Chancellor // CGC Group of Colleges",
    initials: "RD",
    accent: "amber" as const,
    align: "left" as const,
  },
  {
    id: "md-arsh-dhaliwal",
    titleBadge: "EXECUTIVE LEADERSHIP // MANAGING DIRECTOR",
    deskTitle: "MR. ARSH DHALIWAL",
    dropCap: "A",
    paragraphs: [
      "new generation of leadership defines the modern university — one that speaks fluently in both the language of industry and the language of aspiration. Mr. Arsh Dhaliwal, Worthy Managing Director, brings this duality with remarkable clarity and drive.",
      "His conviction that student achievement is the highest institutional metric has shaped every strategic decision at CGC University. Saviskar 2026 stands as his direct mandate: an invitation to 25,000+ participants to prove that student-led excellence can rival any professional production in scale, quality, and imagination.",
      "The arena is set. The directive is clear. Aevorian Reverie is his challenge to every student who dares to be extraordinary.",
    ],
    signeeName: "Mr. Arsh Dhaliwal",
    signeeRole: "Worthy Managing Director // CGC University",
    initials: "AD",
    accent: "violet" as const,
    align: "right" as const,
  },
  {
    id: "director-bismin",
    titleBadge: "CHIEF PATRON MANIFESTO // DIRECTOR STUDENT AFFAIRS",
    deskTitle: "MRS. BISMIN DHALIWAL",
    dropCap: "S",
    paragraphs: [
      "aviskar 2026 is a celebration of fearless imagination, youthful tenacity, and intellectual wonder. When 25,000+ passionate students converge at CGC University, Mohali, tomorrow begins to exist.",
      "Aevorian Reverie is not merely a date on our academic calendar — it is a proving ground where bold concepts transform into living realities. Across technical arenas, research hackathons, and stadium-scale cultural showcases, our students demonstrate that youth is not just preparing for the future; they are actively architecting it.",
      "To every competitor, visionary, and guest stepping onto our campus: immerse yourselves completely. Let curiosity guide your inquiries, let passion fuel your performances, and let the camaraderie forged here endure for a lifetime. I applaud our Student Advisory Council whose tireless devotion elevates Saviskar into an unforgettable national benchmark.",
    ],
    signeeName: "Mrs. Bismin Dhaliwal",
    signeeRole: "Director Students Affairs // Chief Patron, Saviskar 2026",
    initials: "BD",
    accent: "emerald" as const,
    align: "left" as const,
  },
  {
    id: "vc-vinay-goyal",
    titleBadge: "ACADEMIC APEX // VICE CHANCELLOR",
    deskTitle: "DR. VINAY GOYAL",
    dropCap: "E",
    paragraphs: [
      "xcellence in academia is not a destination — it is a daily practice, a commitment renewed in every lecture hall, every laboratory, and every competitive arena. Dr. Vinay Goyal, Vice Chancellor of CGC University, embodies this philosophy with quiet, relentless purpose.",
      "His tenure has been defined by a singular ambition: to align academic rigour with the real demands of a rapidly evolving world. Saviskar 2026 is the most visible expression of that alignment — where students compete not just for prizes, but for the experience of operating at a professional standard.",
      "In every event at Aevorian Reverie, the standards he has set for CGC University are reflected. The pursuit of excellence is non-negotiable. The opportunity to achieve it, unlimited.",
    ],
    signeeName: "Dr. Vinay Goyal",
    signeeRole: "Vice Chancellor // CGC University, Mohali",
    initials: "VG",
    accent: "cyan" as const,
    align: "right" as const,
  },
  {
    id: "provc-anish-goyal",
    titleBadge: "ACADEMIC GOVERNANCE // PRO VICE CHANCELLOR",
    deskTitle: "DR. ANISH GOYAL",
    dropCap: "T",
    paragraphs: [
      "he architecture of a great academic institution is built on two pillars: the rigour of its curriculum and the spirit of its community. Dr. Anish Goyal, Pro Vice Chancellor (Academics), holds both with unwavering dedication and a deep understanding of what it means to lead a modern university.",
      "His academic governance has ensured that CGC University's programmes evolve in step with industry demands, and that the student experience remains the centrepiece of every institutional decision. Saviskar 2026 is the annual crystallisation of that student-centred philosophy.",
      "From admissions to alumni, from the classroom to the concert stage, Dr. Goyal's influence shapes the CGC ecosystem that makes an Aevorian Reverie not just possible — but inevitable.",
    ],
    signeeName: "Dr. Anish Goyal",
    signeeRole: "Pro Vice Chancellor (Academics) // CGC University",
    initials: "AG",
    accent: "amber" as const,
    align: "left" as const,
  },
] as const;

// ============================================================
// TEAM DSA GROUP SPREAD DATA
// ============================================================
const DSA_BIO = [
  "he Department of Student Affairs at CGC University is the living engine of Saviskar 2026. Behind every event announcement, every registration window, every artist liaison, and every logistical triumph is this department — a cohesive, relentless team of faculty and professional staff who transform institutional vision into on-ground reality.",
  "From coordinating national outreach campaigns across 11 states to managing the operational choreography of a 25,000-strong festival, Team DSA operates with a precision that is rarely visible and always essential. They are the unseen architecture of Aevorian Reverie.",
  "Saviskar 2026 is a student festival, built by students. But it stands on the institutional foundation that Team DSA pours every year — with expertise, commitment, and an extraordinary belief in what young people can achieve when given the right stage.",
];

// ============================================================
// LEGACY VIEW
// ============================================================
export default function LegacyView() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">

      {/* ── Subtle background ambient field ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.07)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom-right,rgba(6,182,212,0.05)_0%,transparent_50%)]" />
      </div>

      {/* ══════════════════════════════════════════════════════
          NAVBAR — 3-column floating header
      ══════════════════════════════════════════════════════ */}
      <header className="relative z-30 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-6 md:px-10">

        {/* Left — minimalist text back link */}
        <Link
          href="/"
          className="group flex items-center gap-1.5 text-xs font-medium text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="tracking-wide">Home</span>
        </Link>

        {/* Centre — dark pill badge */}
        <div className="hidden sm:inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
          <span>The Legacy</span>
          <span className="text-white/25">|</span>
          <span className="text-violet-300">Saviskar 2026</span>
        </div>

        {/* Right — solid white CTA */}
        <Link
          href="/events"
          className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black transition-all hover:bg-violet-100 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.25)]"
        >
          Explore Realms
        </Link>
      </header>

      {/* ══════════════════════════════════════════════════════
          PAGE HERO — pure typographic opener
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-16">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-violet-400 mb-4">
          Institutional Patrons // Festival Heritage
        </div>
        <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.0]">
          The Legacy
        </h1>
        <p className="mt-5 text-base sm:text-lg text-zinc-400 font-light leading-relaxed max-w-2xl">
          The visionaries who built the institution, defined its mission, and made Saviskar 2026 — Aevorian Reverie — possible. Rendered here as they deserve: in full.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-white/[0.05]" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-white/20 uppercase flex-shrink-0">
            5 Distinguished Patrons // CGC University
          </span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DIGNITY SPREADS — one per person, alternating
      ══════════════════════════════════════════════════════ */}
      <div className="relative z-20">
        {DIGNITARIES.map((person) => (
          <div
            key={person.id}
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <DeskEditorialSpread
              titleBadge={person.titleBadge}
              deskTitle={person.deskTitle}
              paragraphs={[
                person.paragraphs[0],
                ...person.paragraphs.slice(1),
              ]}
              signeeName={person.signeeName}
              signeeRole={person.signeeRole}
              initials={person.initials}
              image=""
              accentColor={person.accent ?? "violet"}
              align={person.align}
            />
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TEAM DSA GROUP FEATURE
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative z-20 mt-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        {/* Section header */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-16 pb-10">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-emerald-400 mb-3">
            Department of Student Affairs // Institutional Engine
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.0]">
            Team DSA
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-xl">
            The faculty and professional staff whose expertise, coordination, and institutional authority underpin every moment of Saviskar 2026.
          </p>
        </div>

        {/* Full-bleed group photo placeholder */}
        <div className="relative w-full overflow-hidden bg-zinc-950" style={{ height: "clamp(300px, 45vw, 580px)" }}>
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-950/40 via-black to-black">
            {/* Scan texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.9) 3px,rgba(255,255,255,0.9) 4px)",
              }}
            />
            <div className="flex flex-col items-center gap-4 select-none">
              <span
                className="font-editorial font-black text-white leading-none tracking-tighter"
                style={{ fontSize: "clamp(4rem, 15vw, 12rem)", opacity: 0.06 }}
                aria-hidden="true"
              >
                DSA
              </span>
              <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-400/50 uppercase">
                Team DSA Group Photo — Forthcoming
              </span>
            </div>
          </div>
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Description block — full editorial text */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
          <div className="max-w-4xl">
            {/* Drop-cap first paragraph */}
            <div className="text-base sm:text-lg md:text-xl text-zinc-200 leading-relaxed font-light text-justify">
              <span className="float-left font-editorial font-bold text-[5.5rem] sm:text-[6.5rem] leading-[0.82] pr-3 pt-1 select-none text-emerald-400">
                T
              </span>
              {DSA_BIO[0].slice(1)}
            </div>

            {/* Remaining paragraphs */}
            <div className="mt-6 space-y-5 text-sm sm:text-base text-zinc-300/80 leading-[1.85] font-light text-justify">
              {DSA_BIO.slice(1).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* DSA attribution */}
            <div className="mt-10 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="font-editorial text-2xl sm:text-3xl font-semibold text-white leading-tight">
                Department of Student Affairs
              </div>
              <div className="font-mono text-[10px] tracking-widest uppercase mt-2 text-emerald-300/70">
                Institutional Operations &amp; Student Welfare // CGC University, Mohali
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-20 border-t border-white/[0.06] bg-gradient-to-b from-transparent to-black py-16 px-4 text-center">
        <div className="mx-auto max-w-2xl flex flex-col items-center">
          <div className="font-mono text-[9px] tracking-[0.3em] text-white/20 uppercase mb-4">
            Saviskar 2026 // Aevorian Reverie
          </div>
          <h3 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Experience the{" "}
            <span className="font-editorial text-violet-300 font-normal italic">
              Festival
            </span>
          </h3>
          <p className="mt-3 text-sm text-white/40 leading-relaxed max-w-md">
            50+ competitive realms, stadium concerts, and 25,000+ participants. The stage is set at CGC University, Mohali.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/events"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-violet-100 hover:scale-105 shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              Explore Realms
            </Link>
            <Link
              href="/team"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition-all hover:text-white hover:border-white/20"
            >
              Meet the Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
