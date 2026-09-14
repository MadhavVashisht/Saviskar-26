"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FACULTY_LEADERSHIP,
  FACULTY_DIRECTORATE,
  SAC_OFFICE_BEARERS,
  SAC_CORE_LEADS,
  SAC_COUNCIL_MEMBERS,
  TIER_1_BYTE,
  TIER_2_BYTE,
  SAC_COLLECTIVE_BYTE,
} from "@/data/teamData";
import QuoteByteCard from "./QuoteByteCard";
import FacultyCard from "./FacultyCard";
import SacCard from "./SacCard";
import MouseSpotlight from "@/components/ui/MouseSpotlight";
import {
  Users,
  Sparkles,
  Search,
  ArrowUpRight,
  ArrowLeft,
  Crown,
  Compass,
  Layers,
  ShieldCheck,
} from "lucide-react";

export default function TeamView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWing, setSelectedWing] = useState<string>("All");

  // Wings list for filtering Council
  const WINGS = [
    "All",
    "Technical & AI",
    "Cultural & Stage",
    "Media & PR",
    "Logistics & Hospitality",
    "Corporate & Sponsorship",
    "Creative & Design",
  ];

  // Filtered Council members based on search and wing filter
  const filteredCouncilMembers = useMemo(() => {
    return SAC_COUNCIL_MEMBERS.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesWing =
        selectedWing === "All" || member.wing === selectedWing;

      return matchesSearch && matchesWing;
    });
  }, [searchQuery, selectedWing]);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
      {/* 1. FIXED FULL-BLEED PANORAMIC STADIUM BACKGROUND (MATCHING LANDING PAGE) */}
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

      {/* FROSTED LIQUID-GLASS STICKY NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/60 backdrop-blur-2xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2 text-xs font-semibold text-white/70 transition-colors hover:text-white"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-transform group-hover:-translate-x-0.5">
                <ArrowLeft size={13} />
              </div>
              <span className="hidden sm:inline">Saviskar 2026</span>
            </Link>

            <span className="text-white/20">/</span>

            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
              <Users size={13} />
              <span>Organising Team</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/events"
              className="liquid-glass flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/80 transition-all hover:text-white hover:scale-105"
            >
              <span>Explore Realms</span>
              <ArrowUpRight size={12} />
            </Link>

            <Link
              href="/register"
              className="liquid-glass flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-200 border-violet-500/40 bg-violet-600/20 transition-all hover:bg-violet-600/30 hover:scale-105 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
            >
              <Sparkles size={12} />
              <span>Register Now</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION (MATCHING LANDING PAGE AESTHETICS - COUNTS REMOVED) */}
      <section className="relative z-20 pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center flex flex-col items-center">
          {/* University Badge */}
          <div className="liquid-glass mb-5 inline-flex items-center gap-2 sm:gap-2.5 rounded-full px-4 py-1.5 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider sm:tracking-[0.35em] text-white/80 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
            <span>CGC UNIVERSITY • MOHALI</span>
            <span className="text-white/30">|</span>
            <span className="text-violet-300 shrink-0">ORGANISING COMMAND</span>
          </div>

          {/* Main Title with Editorial Serif */}
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-light leading-[0.98] sm:leading-[0.92] tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            Architects of <br />
            <span className="font-editorial text-violet-300 font-normal">Aevorian Reverie.</span>
          </h1>

          <p className="mt-6 text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Honoring the visionary faculty directorate, executive administration, and the 54-member Student Advisory Council (SAC) powering North India&apos;s flagship techno-cultural university festival.
          </p>

          {/* Quick Jump Navigation Pills */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-2 text-xs">
            <a
              href="#tier-1"
              className="liquid-glass rounded-full px-4 py-1.5 text-white/70 hover:text-amber-300 hover:border-amber-400/40 transition-all hover:scale-105"
            >
              Director Students Affairs
            </a>
            <a
              href="#tier-2"
              className="liquid-glass rounded-full px-4 py-1.5 text-white/70 hover:text-cyan-300 hover:border-cyan-400/40 transition-all hover:scale-105"
            >
              Dean &amp; Cultural Directorate
            </a>
            <a
              href="#tier-sac"
              className="liquid-glass rounded-full px-4 py-1.5 text-white/70 hover:text-violet-300 hover:border-violet-400/40 transition-all hover:scale-105"
            >
              SAC Office Bearers
            </a>
            <a
              href="#sac-core"
              className="liquid-glass rounded-full px-4 py-1.5 text-white/70 hover:text-fuchsia-300 hover:border-fuchsia-400/40 transition-all hover:scale-105"
            >
              Core Members (19)
            </a>
            <a
              href="#sac-council"
              className="liquid-glass rounded-full px-4 py-1.5 text-white/70 hover:text-emerald-300 hover:border-emerald-400/40 transition-all hover:scale-105"
            >
              Council Members (32)
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================
          TIER 1: APEX EXECUTIVE LEADERSHIP (MRS. BISMIN DHALIWAL)
      ======================================================== */}
      <section id="tier-1" className="relative z-20 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-20">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
              <Crown size={14} />
              <span>TIER 01 // APEX EXECUTIVE PATRON</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white mt-1">
              Directorate of Student Affairs
            </h2>
          </div>
          <span className="font-mono text-xs text-white/40">
            Institutional Leadership • Chief Patron
          </span>
        </div>

        {/* Tier 1 Quote Byte */}
        <div className="mb-8">
          <QuoteByteCard data={TIER_1_BYTE} variant="tier1" />
        </div>

        {/* Tier 1 Solo Hero Showcase Card */}
        <FacultyCard member={FACULTY_LEADERSHIP[0]} />
      </section>

      {/* ========================================================
          TIER 2: DEAN & CULTURAL DIRECTORATE (DR. SACHIN SHARMA & TEAM)
      ======================================================== */}
      <section id="tier-2" className="relative z-20 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-20">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
              <ShieldCheck size={14} />
              <span>TIER 02 // DEAN &amp; CULTURAL DIRECTORATE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white mt-1">
              Dean &amp; Operations Command
            </h2>
          </div>
          <span className="font-mono text-xs text-white/40">
            Council Governance &amp; Cultural Direction • 4 Leaders
          </span>
        </div>

        {/* Tier 2 Quote Byte */}
        <div className="mb-8">
          <QuoteByteCard data={TIER_2_BYTE} variant="tier2" />
        </div>

        {/* Tier 2 Cards (Responsive Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {FACULTY_DIRECTORATE.map((member) => (
            <FacultyCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      {/* ========================================================
          TIERS 3 TO 5: STUDENT ADVISORY COUNCIL (SAC) - 53 MEMBERS
      ======================================================== */}
      <section id="tier-sac" className="relative z-20 py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-20">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-violet-400">
              <Users size={14} />
              <span>STUDENT ADVISORY COUNCIL (SAC) // 53 ARCHITECTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white mt-1">
              The Student Command Roster
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-violet-300">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
            <span>Independent Cards With Photo Placeholders</span>
          </div>
        </div>

        {/* SAC Collective Manifesto Byte */}
        <div className="mb-12">
          <QuoteByteCard data={SAC_COLLECTIVE_BYTE} variant="sac" />
        </div>

        {/* ======================================================
            3A. SAC OFFICE BEARERS (PRESIDENT & VICE PRESIDENT)
        ====================================================== */}
        <div className="mb-14">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
              <Crown size={13} />
              <span>SAC Office Bearers (President &amp; Vice President)</span>
            </div>
            <span className="font-mono text-[11px] text-white/40">
              Tier 03 // Apex Student Executives
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
            {SAC_OFFICE_BEARERS.map((member) => (
              <SacCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* ======================================================
            3B. SAC CORE COMMITTEE (19 MEMBERS - MEDIUM CARDS)
        ====================================================== */}
        <div id="sac-core" className="mb-14 scroll-mt-24">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-violet-300">
              <Layers size={13} />
              <span>SAC Core Committee ({SAC_CORE_LEADS.length} Members)</span>
            </div>
            <span className="font-mono text-[11px] text-white/40">
              Tier 04 // Core Committee Executives
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SAC_CORE_LEADS.map((member) => (
              <SacCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* ======================================================
            3C. SAC COUNCIL MEMBERS (32 MEMBERS - COMPACT GRID)
        ====================================================== */}
        <div id="sac-council" className="scroll-mt-24">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-white/[0.08] pt-8">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Compass size={13} />
                <span>Student Advisory Council Members ({SAC_COUNCIL_MEMBERS.length} Members)</span>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Explore the student coordinators driving logistics, media, operations, fine arts, combat arenas, and stage engineering.
              </p>
            </div>

            {/* Live Search Input with Liquid Glass */}
            <div className="relative w-full md:w-72">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search name, role, dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="liquid-glass w-full rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 outline-none transition-all focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40"
              />
            </div>
          </div>

          {/* Filter Pills with Liquid Glass */}
          <div className="mb-6 flex flex-wrap gap-2">
            {WINGS.map((wing) => (
              <button
                key={wing}
                onClick={() => setSelectedWing(wing)}
                className={`liquid-glass rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedWing === wing
                    ? "border-violet-500/60 bg-violet-600/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] scale-105"
                    : "text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                {wing}
              </button>
            ))}
          </div>

          {/* Compact Mini-Cards Grid */}
          {filteredCouncilMembers.length === 0 ? (
            <div className="liquid-glass-card rounded-2xl p-10 text-center">
              <p className="text-sm text-white/50">
                No council members matched your search or wing filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedWing("All");
                }}
                className="mt-3 text-xs font-semibold text-violet-400 hover:text-violet-300"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {filteredCouncilMembers.map((member) => (
                <SacCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="relative z-20 mt-16 border-t border-white/[0.08] bg-gradient-to-b from-transparent to-black py-16 px-4 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center">
          <div className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-mono text-violet-300 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles size={12} />
            <span>JOIN 25,000+ PARTICIPANTS NATIONWIDE</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-light text-white tracking-tight">
            Ready to Experience <span className="font-editorial text-violet-300 font-normal">Saviskar 2026?</span>
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
