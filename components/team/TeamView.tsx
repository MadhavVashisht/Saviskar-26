"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LEVEL_3_CULTURAL_DIRECTORATE,
  LEVEL_4_OPERATIONS_COMMAND,
  EDITORIAL_DIRECTOR,
  EDITORIAL_DEAN,
  EDITORIAL_PRESIDENCY,
  TEAM_STATS,
} from "@/data/teamData";
import DeskEditorialSpread from "./DeskEditorialSpread";
import SacEditorialSection from "./SacEditorialSection";
import EditorialPortraitCard from "./EditorialPortraitCard";
import MouseSpotlight from "@/components/ui/MouseSpotlight";
import {
  Sparkles,
  ArrowUpRight,
  ArrowLeft,
  Crown,
  Layers,
} from "lucide-react";

export default function TeamView() {
  const telemetryDials = [
    { value: "01", label: "Apex Patron", sub: "Director Student Affairs" },
    { value: "01", label: "Dean Leadership", sub: "Dean Student Affairs" },
    { value: "04", label: "Directorate Leads", sub: "Culture & Operations" },
    { value: "53", label: "SAC Council", sub: "Student Architects" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* 1. FIXED FULL-BLEED PANORAMIC STADIUM BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Image
          src="/images/concert-stadium.jpg"
          alt="Saviskar 2026 Festival Arena"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30 will-change-transform"
        />

        {/* Multi-layered cinematic gradient vignettes */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.85)_100%)]" />

        {/* Deep Violet Stage Haze Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.14)_0%,rgba(0,0,0,0.35)_60%,transparent_100%)]" />

        {/* Top Spotlight Rim Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[80vw] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08)_0%,transparent_70%)] blur-[90px]" />

        {/* Ambient colored side hazes */}
        <div className="absolute left-[10%] top-[20%] h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[180px]" />
        <div className="absolute right-[10%] top-[40%] h-[550px] w-[550px] rounded-full bg-cyan-500/10 blur-[170px]" />
        <div className="absolute left-[15%] bottom-[15%] h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[180px]" />
      </div>

      {/* Mouse Spotlight */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <MouseSpotlight />
      </div>

      {/* FLOATING TOP HEADER — matches Realms page */}
      <header className="relative z-30 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-6 md:px-10">
        <Link
          href="/"
          className="transition-all hover:scale-105 hover:opacity-90"
        >
          <Image
            src="/logo.png"
            alt="Saviskar 2026"
            width={160}
            height={160}
            unoptimized
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* University Badge */}
        <div className="liquid-glass hidden sm:inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
          <span>CGC UNIVERSITY MOHALI</span>
          <span className="text-white/30">|</span>
          <span className="text-violet-300">AEVORIAN REVERIE</span>
        </div>

        <Link
          href="/events"
          className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black transition-all hover:bg-violet-100 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          Explore Realms
        </Link>
      </header>


      {/* ========================================================
          HERO & COMMAND TELEMETRY INTRO
      ======================================================== */}
      <section className="relative z-20 pt-12 pb-8 sm:pt-16 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono tracking-widest text-violet-300 mb-6 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>SAVISKAR 2026 • ORGANISING COMMAND</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.08]">
              The Architects of{" "}
              <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-amber-200 to-cyan-300">
                Aevorian Reverie
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl font-normal leading-relaxed">
              Meet the executive patrons, cultural directorate, and student council leaders crafting North India’s premier techno-cultural convergence at CGC University, Mohali.
            </p>

            {/* INLINE TYPOGRAPHIC STAT ROW — no boxes, no backgrounds */}
            <div className="mt-10 flex flex-wrap items-start gap-x-8 gap-y-4">
              {telemetryDials.map((dial, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  {idx > 0 && (
                    <span className="h-8 w-px bg-white/[0.08] self-center flex-shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <div className="font-editorial text-3xl sm:text-4xl font-bold text-white leading-none tracking-tight">
                      {dial.value}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 mt-1.5 leading-tight">
                      {dial.label}
                    </div>
                    <div className="font-mono text-[8px] text-white/25 tracking-wider mt-0.5">
                      {dial.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Free-floating editorial graphic — no container, no border */}
          <div className="lg:col-span-5 flex justify-center items-center py-8 lg:py-0">
            <div className="relative flex flex-col items-center text-center gap-4">
              {/* Ambient radial glow — not a box, just atmospheric */}
              <div className="pointer-events-none absolute inset-0 scale-150 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.12)_0%,transparent_70%)]" aria-hidden="true" />

              <div className="relative z-10 flex flex-col items-center gap-3">
                {/* Crown — bare, no pill */}
                <Crown size={32} className="text-amber-300/70" />

                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-400/70">
                  APEX COMMAND • COUNCIL CADRE
                </span>

                <h3 className="font-editorial text-3xl sm:text-4xl font-bold text-white leading-tight">
                  Saviskar 2026
                </h3>

                <p className="font-editorial text-sm sm:text-base text-zinc-400 italic">
                  Aevorian Reverie • CGC University
                </p>

                <div className="flex items-center gap-2 text-[11px] font-mono text-white/30 tracking-wide mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>53 Student Leaders • 7 Wings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          1. CANVA SPREAD: MRS. BISMIN DHALIWAL (CHIEF PATRON)
      ======================================================== */}
      <div id="patron-director">
        <DeskEditorialSpread
          titleBadge={EDITORIAL_DIRECTOR.titleBadge}
          deskTitle={EDITORIAL_DIRECTOR.deskTitle}
          dropCap={EDITORIAL_DIRECTOR.dropCap}
          paragraphs={EDITORIAL_DIRECTOR.paragraphs}
          signeeName={EDITORIAL_DIRECTOR.signeeName}
          signeeRole={EDITORIAL_DIRECTOR.signeeRole}
          initials={EDITORIAL_DIRECTOR.initials}
          image={EDITORIAL_DIRECTOR.image}
          accent="amber"
          align="left"
          showDeskPrefix
        />
      </div>

      {/* ========================================================
          2. CANVA SPREAD: DR. SACHIN SHARMA (DEAN STUDENT AFFAIRS)
      ======================================================== */}
      <div id="patron-dean">
        <DeskEditorialSpread
          titleBadge={EDITORIAL_DEAN.titleBadge}
          deskTitle={EDITORIAL_DEAN.deskTitle}
          dropCap={EDITORIAL_DEAN.dropCap}
          paragraphs={EDITORIAL_DEAN.paragraphs}
          signeeName={EDITORIAL_DEAN.signeeName}
          signeeRole={EDITORIAL_DEAN.signeeRole}
          initials={EDITORIAL_DEAN.initials}
          image={EDITORIAL_DEAN.image}
          accent="cyan"
          align="right"
          showDeskPrefix
        />
      </div>

      {/* ========================================================
          3. CULTURAL & OPERATIONS DIRECTORATE
          Full-width editorial spreads — one per faculty member, alternating
      ======================================================== */}
      <div id="directorate">
        {/* Section header — standalone, above the spreads */}
        <div className="relative z-20 pt-16 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-violet-400 mb-3">
            <Layers size={11} />
            <span>Festival Directorate // Cultural & Operations Command</span>
          </div>
          <h3 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.0]">
            The Directorate
          </h3>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-2xl">
            Faculty leads supervising arena production, cultural competitions, fine arts curation, and campus logistics — the institutional spine of Saviskar 2026.
          </p>
        </div>

        {/* Each directorate member as a full-width editorial spread, alternating alignment */}
        {[...LEVEL_3_CULTURAL_DIRECTORATE, ...LEVEL_4_OPERATIONS_COMMAND].map((faculty, idx) => (
          <DeskEditorialSpread
            key={faculty.id}
            titleBadge={`FESTIVAL DIRECTORATE // ${(faculty.honorific ?? "FACULTY").toUpperCase()}`}
            deskTitle={(faculty.name ?? "").toUpperCase()}
            dropCap={(faculty.bio ?? "F").charAt(0)}
            paragraphs={[
              (faculty.bio ?? `${faculty.name} oversees a critical domain of Saviskar 2026 — bringing institutional expertise, operational precision, and creative vision to every facet of festival execution.`).slice(1),
              `${faculty.department ?? "CGC University"} — one of the pillars on which Aevorian Reverie stands.`,
            ]}
            signeeName={faculty.name ?? ""}
            signeeRole={faculty.designation ?? (faculty.honorific ?? "")}
            initials={(faculty.name ?? "??").split(" ").filter((n) => !["Dr.","Mrs.","Mr.","Ms."].includes(n)).slice(0,2).map((n) => n[0]).join("")}
            image={faculty.image ?? ""}
            accent="violet"
            align={idx % 2 === 0 ? "right" : "left"}
            showDeskPrefix={false}
          />
        ))}
      </div>

      {/* ========================================================
          4. SAC PRESIDENCY — Side-by-Side Editorial Spread
          Left: heading + drop-cap manifesto text, top-aligned
          Right: SAC group photo placeholder, full height
      ======================================================== */}
      <section id="sac-presidency" className="relative z-20 py-16 sm:py-20"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

        {/* ── 2-column spread: text left / photo right, top-aligned ── */}
        <div className="flex flex-col md:flex-row md:items-start min-h-[560px] sm:min-h-[640px]">

          {/* LEFT — heading + manifesto text stacked, top-aligned, flush left */}
          <div className="flex flex-col px-4 sm:px-6 lg:px-8 md:pl-8 lg:pl-16
                          md:w-1/2 py-12 md:pt-0">

            {/* Heading lives here, directly above the drop-cap text */}
            <div className="mb-8">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-violet-400 mb-3">
                {EDITORIAL_PRESIDENCY.titleBadge}
              </div>
              <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05]">
                Student Advisory<br />Council Presidency
              </h2>
            </div>

            {/* Drop-cap paragraph — fills full column width */}
            <div className="text-base sm:text-lg md:text-xl text-zinc-200 leading-relaxed font-light text-justify">
              <span className="float-left font-editorial font-bold text-[5.5rem] sm:text-[6.5rem] leading-[0.82] pr-3 pt-1 select-none text-violet-400">
                {EDITORIAL_PRESIDENCY.dropCap}
              </span>
              {EDITORIAL_PRESIDENCY.paragraphs[0].slice(EDITORIAL_PRESIDENCY.dropCap?.length ?? 1)}
            </div>

            {/* Remaining paragraphs */}
            <div className="mt-6 space-y-5 text-sm sm:text-base text-zinc-300/80 leading-[1.85] font-light text-justify">
              {EDITORIAL_PRESIDENCY.paragraphs.slice(1).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* RIGHT — SAC group photo, full height, flush to edge */}
          <div className="relative md:w-1/2 min-h-[360px] md:min-h-full bg-zinc-950 flex-shrink-0 self-stretch">
            {/* Ghost placeholder */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-bl from-violet-950/50 via-black to-black">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.8) 3px,rgba(255,255,255,0.8) 4px)",
                }}
              />
              <div className="flex flex-col items-center gap-4 select-none">
                <span
                  className="font-editorial font-black text-white leading-none tracking-tighter"
                  style={{ fontSize: "clamp(5rem, 12vw, 10rem)", opacity: 0.07 }}
                  aria-hidden="true"
                >
                  SAC
                </span>
                <span className="font-mono text-[10px] tracking-[0.3em] text-violet-400/50 uppercase">
                  Group Photo — Forthcoming
                </span>
              </div>
            </div>
            {/* Left-edge fade so photo blends into text column */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent" />
          </div>
        </div>
      </section>



      {/* ========================================================
          5. SAC OPERATIONAL TEAMS (NO CARD CONTAINERS - PURE EDITORIAL)
          Sequence:
          1. Overall Heads
          2. Bills & Budget
          3. Website Team (Madhav Vashisht as Lead Web Architect)
          4. Branding
          5. Creativity
          6. Sponsorship Team
          7. Calling Team (2 Heads + Core -> State Heads -> Members)
      ======================================================== */}
      <div id="sac-wings">
        <SacEditorialSection />
      </div>

      {/* ========================================================
          FOOTER CALL TO ACTION
      ======================================================== */}
      <section className="relative z-20 mt-12 border-t border-white/[0.08] bg-gradient-to-b from-transparent to-black py-16 px-4 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center">
          <div className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-mono text-violet-300 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles size={12} />
            <span>JOIN 25,000+ PARTICIPANTS NATIONWIDE</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-light text-white tracking-tight">
            Ready to Experience{" "}
            <span className="font-editorial text-violet-300 font-normal">
              Saviskar 2026?
            </span>
          </h3>

          <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-xl mx-auto font-normal">
            50+ realms across technology, national hackathons, cultural arts, and stadium concerts. Register now to secure your digital gate pass.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="liquid-glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white border-violet-500/50 bg-violet-600/30 transition-all hover:bg-violet-600/40 hover:scale-105 shadow-[0_0_25px_rgba(168,85,247,0.35)]"
            >
              <span>Fast-Track Registration</span>
              <ArrowUpRight size={14} />
            </Link>

            <Link
              href="/events"
              className="liquid-glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
            >
              <span>View All 4 Realms</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
