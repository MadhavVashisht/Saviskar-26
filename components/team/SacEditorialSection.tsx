"use client";

import React from "react";
import {
  OVERALL_HEADS,
  BILLS_BUDGET_TEAM,
  WEBSITE_TEAM,
  BRANDING_TEAM,
  CREATIVITY_TEAM,
  SPONSORSHIP_TEAM,
  CALLING_TEAM,
  STATE_HEADS_DIRECTORY,
  SacMember,
} from "@/data/teamData";
import {
  Crown,
  Code2,
  Palette,
  Lightbulb,
  BadgeDollarSign,
  PhoneCall,
  MapPin,
  Layers,
} from "lucide-react";
import DeskEditorialSpread from "./DeskEditorialSpread";

// ============================================================
// TIER → ACCENT COLOUR
// Green Leads  → emerald
// Blue Core    → cyan
// Standard     → amber
// Overall Head → amber (gold)
// ============================================================
const GREEN_LEAD_IDS = new Set([
  "sac-core-saaransh-sharma",
  "sac-core-prabneet-kaur",
  "sac-core-abhay-vishwakarma",
  "sac-core-nitin-kumar",
  "sac-core-dhruv-kumar",
  "sac-core-anmol-agarwal",
  "sac-core-ayush-choudhary",
  "sac-core-sukhdeep-singh",
  "sac-core-kush-dethliya",
  "sac-core-prajval-kaur",
]);

const BLUE_CORE_IDS = new Set([
  "sac-core-jashan-jot-singh",
  "sac-mem-madhav-vashisht", // Website Team — identical to Jashan
  "sac-core-vinay-verma",
  "sac-core-gurkeerat-singh",
  "sac-core-prajval-kaur",
  "sac-core-krishna-jaswal",
  "sac-core-avneet-kour",
  "sac-core-chahat",
  "sac-core-goutam-bajaj",
  "sac-core-prince",
]);

function getAccent(m: SacMember): "amber" | "cyan" | "violet" | "emerald" {
  if (m.personDetail === "President" || m.personDetail === "Vice President" || m.personDetail === "Overall Head") {
    return "violet";
  }
  if (GREEN_LEAD_IDS.has(m.id)) return "emerald";
  if (BLUE_CORE_IDS.has(m.id)) return "cyan";
  return "amber";
}

// ============================================================
// BIO GENERATOR
// Provides a contextual short manifesto paragraph for members
// who do not have an explicit long bio.
// ============================================================
function generateBio(m: SacMember): string[] {
  const name = m.name.split(" ")[0];
  const wing = m.wing;
  const role = m.personDetail || "Member";

  const wingBios: Record<string, string> = {
    "Overall": `${name} holds the seat of executive oversight at Saviskar 2026. As ${role}, every cross-wing decision, every resource allocation, and every last-mile coordination flows through this command node. The festival's structural coherence is a direct reflection of this leadership.`,
    "Bills & Budget": `${name} governs the financial architecture of Saviskar 2026. Every vendor invoice, procurement mandate, and resource disbursement passes through this meticulous command, ensuring fiscal discipline across all seven operational wings without exception.`,
    "Website": `${name} architects the digital face of Saviskar 2026. From responsive infrastructure and registration pipelines to real-time event dashboards, every pixel and API endpoint reflects this engineer's relentless precision. The festival begins online, and it begins here.`,
    "Branding": `${name} shapes the visual identity and storytelling language of Saviskar 2026. From the motion graphics of the opening ceremony to every printed poster across campus, this creative voice ensures the festival's aesthetic lands with unmistakable power and cohesion.`,
    "Creativity": `${name} is the imagination engine behind Saviskar 2026's stage craft and experiential design. Art installations, theatrical productions, cultural competitions, and headline performance design all carry the unmistakable imprint of this creative force.`,
    "Sponsorship": `${name} forges the industry alliances that make Saviskar 2026 financially and operationally formidable. Through persistent pitch decks, corporate negotiations, and brand partnership frameworks, this wing secures the external backing our festival demands.`,
    "Calling Team": `${name} leads national outreach and delegate relations for Saviskar 2026. Through direct student-to-student engagement across states, this frontline voice brings thousands of participants into the Aevorian Reverie arena — turning ambition into footfall.`,
    "Office Bearers": `${name} anchors the student executive command of Saviskar 2026. At the intersection of policy, people, and operational rhythm, this leadership presence ensures that the vision of Aevorian Reverie translates faithfully from whiteboard sketches to stadium-scale reality.`,
  };

  const baseBio = wingBios[wing] || `${name} contributes to the ${wing} operations of Saviskar 2026 with focused intent. Behind every seamless coordination and every detail that makes Aevorian Reverie exceptional, there is a student builder whose dedication keeps the machine running.`;

  // All spreads get a second paragraph for layout consistency
  const closingLines: string[] = [
    `Saviskar 2026 is the sum of individuals who chose to build rather than simply attend. ${name} is one of those builders.`,
    `Every detail that makes Aevorian Reverie extraordinary has a name behind it. Here is one of them.`,
    `The architecture of a great festival is not visible on stage — it lives in the choices made in the months before curtain rise. ${name} made those choices.`,
    `Beyond the spotlight and the stadium roar is the quiet, relentless work of people like ${name}. That work is Saviskar.`,
  ];

  // Pick a deterministic closing line based on the member's name length
  const closing = closingLines[m.name.length % closingLines.length];

  return [baseBio, closing];
}

// ============================================================
// MEMBER → EDITORIAL SPREAD PROPS
// ============================================================
function memberToSpread(m: SacMember, index: number): {
  titleBadge: string;
  deskTitle: string;
  dropCap: string;
  paragraphs: string[];
  signeeName: string;
  signeeRole: string;
  initials: string;
  image: string;
  accent: "amber" | "cyan" | "violet" | "emerald";
  align: "left" | "right";
} {
  const bio = generateBio(m);
  const accent = getAccent(m);
  const align: "left" | "right" = index % 2 === 0 ? "left" : "right";

  // Eyebrow badge text — wing name, no hardcoded strings
  const titleBadge = `${m.wing.toUpperCase()} // ${(m.personDetail || "MEMBER").toUpperCase()}`;

  // Desk title — member's name in editorial format
  const deskTitle = m.name.toUpperCase();

  // Drop cap — first letter of the bio
  const dropCap = bio[0].charAt(0);

  // Paragraphs — first paragraph drops its leading letter (the drop cap renders it separately)
  const paragraphs = [bio[0].slice(1), ...bio.slice(1)];

  return {
    titleBadge,
    deskTitle,
    dropCap,
    paragraphs,
    signeeName: m.name,
    signeeRole: `${m.personDetail || "Member"} // ${m.wing}`,
    initials: m.initials || m.name.split(" ").map((n) => n[0]).join("").slice(0, 2),
    image: m.image || "",
    accent,
    align,
  };
}

// ============================================================
// CHAPTER BREAK — full-width typographic section divider
// ============================================================
interface ChapterBreakProps {
  number: string;
  title: string;
  descriptor: string;
  icon: React.ReactNode;
  accentClass: string;
  memberCount: number;
}

function ChapterBreak({ number, title, descriptor, icon, accentClass, memberCount }: ChapterBreakProps) {
  return (
    <div
      className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-end justify-between">
        <div>
          <div className={`flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase mb-2 ${accentClass}`}>
            {icon}
            <span>{descriptor}</span>
          </div>
          <h2 className="font-editorial text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.0]">
            {title}
          </h2>
        </div>
        <div className="hidden sm:flex flex-col items-end">
          <span className="font-mono text-[10px] tracking-[0.3em] text-white/15 uppercase mb-1">Chapter</span>
          <span className="font-editorial text-[5rem] font-black text-white/[0.04] leading-none select-none">
            {number}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/[0.06]" />
        <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase">
          {memberCount} {memberCount === 1 ? "Member" : "Members"}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// MEMBER SPREAD RENDERER — drives DeskEditorialSpread per member
// ============================================================
function MemberSpread({ member, index }: { member: SacMember; index: number }) {
  const props = memberToSpread(member, index);
  return (
    <div id={`member-${member.id}`}>
      <DeskEditorialSpread {...props} />
    </div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================
export default function SacEditorialSection() {
  // Running index for alternating layout — shared across ALL sections
  let idx = 0;

  // Wing label / descriptor helpers
  const chapterConfig = {
    overall:     { num: "01", title: "Overall Heads",      descriptor: "Executive Council Apex",                  icon: <Crown size={12} />,           accent: "text-amber-400"   },
    budget:      { num: "02", title: "Bills & Budget",     descriptor: "Financial Audit & Resource Governance",   icon: <BadgeDollarSign size={12} />,  accent: "text-cyan-400"    },
    website:     { num: "03", title: "Website Team",       descriptor: "Digital Architecture & Infrastructure",   icon: <Code2 size={12} />,            accent: "text-cyan-400"    },
    branding:    { num: "04", title: "Branding Team",      descriptor: "Visual Identity & Aesthetic Direction",   icon: <Palette size={12} />,          accent: "text-emerald-400" },
    creativity:  { num: "05", title: "Creativity Team",    descriptor: "Stage Craft, Art & Experiential Design",  icon: <Lightbulb size={12} />,        accent: "text-violet-400"  },
    sponsorship: { num: "06", title: "Sponsorship Team",   descriptor: "Corporate Partnerships & Alliances",      icon: <BadgeDollarSign size={12} />,  accent: "text-emerald-400" },
    calling:     { num: "07", title: "Calling Team",       descriptor: "National Outreach & Delegate Relations",  icon: <PhoneCall size={12} />,        accent: "text-cyan-400"    },
  };

  // Flatten all members in correct sequence for idx counter
  const allSections = [
    { key: "overall",     members: OVERALL_HEADS },
    { key: "budget",      members: BILLS_BUDGET_TEAM },
    { key: "website",     members: WEBSITE_TEAM },
    { key: "branding",    members: [...BRANDING_TEAM.leads, ...BRANDING_TEAM.core, ...BRANDING_TEAM.members] },
    { key: "creativity",  members: [...CREATIVITY_TEAM.leads, ...CREATIVITY_TEAM.core, ...CREATIVITY_TEAM.members] },
    { key: "sponsorship", members: [...SPONSORSHIP_TEAM.leads, ...SPONSORSHIP_TEAM.members] },
    { key: "calling",     members: [...CALLING_TEAM.leads, ...CALLING_TEAM.core, ...CALLING_TEAM.members] },
  ] as const;

  return (
    <div className="relative z-20">

      {/* ── Section opener ── */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-violet-400 mb-4">
          Operational Wings // Student Architects
        </div>
        <h2 className="font-editorial text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.0]">
          The Council<br />Cadre
        </h2>
        <p className="mt-5 text-base sm:text-lg text-zinc-400 font-light leading-relaxed max-w-2xl">
          Every person who built Saviskar 2026 — rendered as a full-spread editorial portrait. Seven operational wings. One shared vision.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/[0.06]" />
          <span className="font-mono text-[9px] tracking-widest text-white/20 uppercase">
            {allSections.reduce((acc, s) => acc + s.members.length, 0)} members across 7 wings
          </span>
        </div>
      </div>

      {/* ── 01 OVERALL HEADS ── */}
      {(() => {
        const cfg = chapterConfig.overall;
        return (
          <>
            <ChapterBreak {...cfg} number={cfg.num} accentClass={cfg.accent} memberCount={OVERALL_HEADS.length} />
            {OVERALL_HEADS.map((m) => <MemberSpread key={m.id} member={m} index={idx++} />)}
          </>
        );
      })()}

      {/* ── 02 BILLS & BUDGET ── */}
      {(() => {
        const cfg = chapterConfig.budget;
        return (
          <>
            <ChapterBreak {...cfg} number={cfg.num} accentClass={cfg.accent} memberCount={BILLS_BUDGET_TEAM.length} />
            {BILLS_BUDGET_TEAM.map((m) => <MemberSpread key={m.id} member={m} index={idx++} />)}
          </>
        );
      })()}

      {/* ── 03 WEBSITE TEAM ── Both members get identical cyan treatment ── */}
      {(() => {
        const cfg = chapterConfig.website;
        return (
          <>
            <ChapterBreak {...cfg} number={cfg.num} accentClass={cfg.accent} memberCount={WEBSITE_TEAM.length} />
            {WEBSITE_TEAM.map((m) => <MemberSpread key={m.id} member={m} index={idx++} />)}
          </>
        );
      })()}

      {/* ── 04 BRANDING ── */}
      {(() => {
        const cfg = chapterConfig.branding;
        const members = [...BRANDING_TEAM.leads, ...BRANDING_TEAM.core, ...BRANDING_TEAM.members];
        return (
          <>
            <ChapterBreak {...cfg} number={cfg.num} accentClass={cfg.accent} memberCount={members.length} />
            {members.map((m) => <MemberSpread key={m.id} member={m} index={idx++} />)}
          </>
        );
      })()}

      {/* ── 05 CREATIVITY ── */}
      {(() => {
        const cfg = chapterConfig.creativity;
        const members = [...CREATIVITY_TEAM.leads, ...CREATIVITY_TEAM.core, ...CREATIVITY_TEAM.members];
        return (
          <>
            <ChapterBreak {...cfg} number={cfg.num} accentClass={cfg.accent} memberCount={members.length} />
            {members.map((m) => <MemberSpread key={m.id} member={m} index={idx++} />)}
          </>
        );
      })()}

      {/* ── 06 SPONSORSHIP ── */}
      {(() => {
        const cfg = chapterConfig.sponsorship;
        const members = [...SPONSORSHIP_TEAM.leads, ...SPONSORSHIP_TEAM.members];
        return (
          <>
            <ChapterBreak {...cfg} number={cfg.num} accentClass={cfg.accent} memberCount={members.length} />
            {members.map((m) => <MemberSpread key={m.id} member={m} index={idx++} />)}
          </>
        );
      })()}

      {/* ── 07 CALLING TEAM ── */}
      {(() => {
        const cfg = chapterConfig.calling;
        const leads = CALLING_TEAM.leads;
        const core = CALLING_TEAM.core;
        const members = CALLING_TEAM.members;
        const allMembers = [...leads, ...core, ...members];
        return (
          <>
            <ChapterBreak {...cfg} number={cfg.num} accentClass={cfg.accent} memberCount={allMembers.length} />
            {allMembers.map((m) => <MemberSpread key={m.id} member={m} index={idx++} />)}
          </>
        );
      })()}

      {/* ── STATE HEADS DIRECTORY — editorial table ── */}
      <div
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-amber-400 mb-2">
            <MapPin size={11} />
            <span>Regional Allocation Directory</span>
          </div>
          <h3 className="font-editorial text-3xl sm:text-4xl font-bold text-white tracking-tight">
            State Heads
          </h3>
          <p className="mt-2 text-sm text-zinc-500 font-light">
            State-wise operational leads heading student outreach across India for Saviskar 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-10 max-w-4xl">
          {STATE_HEADS_DIRECTORY.map((item, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[11px] text-zinc-400 tracking-wide flex-shrink-0">
                {item.region}
              </span>
              <span className="h-px flex-1 bg-white/[0.05] self-center mx-2" aria-hidden="true" />
              <span className="font-editorial text-sm font-semibold text-white text-right flex-shrink-0">
                {item.heads}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
