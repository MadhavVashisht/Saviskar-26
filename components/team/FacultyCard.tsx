"use client";

import React from "react";
import { FacultyMember } from "@/data/teamData";
import PortraitPlaceholder from "./PortraitPlaceholder";
import { ShieldCheck, Award, Sparkles, Building2, Crown } from "lucide-react";

interface FacultyCardProps {
  member: FacultyMember;
}

export default function FacultyCard({ member }: FacultyCardProps) {
  const isTier1 = member.tier === "tier1";

  // Tier 1 Solo Apex Spotlight Card (Mrs. Bismin Dhaliwal)
  if (isTier1) {
    return (
      <div className="liquid-glass-card group relative overflow-hidden rounded-3xl p-6 sm:p-10 transition-all duration-500 hover:border-amber-400/40">
        {/* Theatrical background glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-500/15 blur-[120px] transition-all duration-500 group-hover:scale-125" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-violet-600/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
          {/* Portrait Photo Slot Container */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <PortraitPlaceholder
              image={member.image}
              name={member.name}
              size="hero"
              aspectRatio="portrait"
              glowColor="amber"
            />
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-300">
              <Crown size={10} className="text-amber-400" />
              <span>APEX PATRON</span>
            </div>
          </div>

          {/* Leader Information */}
          <div className="flex flex-col flex-1 text-center md:text-left justify-between h-full">
            <div>
              {/* Header Badge */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300 border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <ShieldCheck size={11} className="text-amber-400" />
                  <span>{member.honorific}</span>
                </span>

                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  CGC University • Executive Directorate
                </span>
              </div>

              {/* Name with Editorial Heading */}
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white transition-colors duration-300 group-hover:text-amber-200">
                {member.name}
              </h3>

              <p className="mt-2 text-lg sm:text-xl font-medium text-amber-300/90 tracking-wide font-editorial">
                {member.designation}
              </p>

              <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-xs text-white/60">
                <Building2 size={13} className="text-white/40 flex-shrink-0" />
                <span>{member.department}</span>
              </div>

              {/* Bio Statement */}
              {member.bio && (
                <p className="mt-5 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl border-t border-white/[0.08] pt-4 font-normal">
                  {member.bio}
                </p>
              )}
            </div>

            {/* Badges Footer */}
            {member.badges && (
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                {member.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur-md transition-colors hover:border-amber-400/40 hover:text-white"
                  >
                    <Award size={11} className="text-amber-400/70" />
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tier 2 Cards (Dr. Sachin Sharma, Mr. Vaibhav Kailey, Mrs. Monika Dhaliwal, Mr. Anand Kumar)
  return (
    <div className="liquid-glass-interactive group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-7 transition-all duration-300">
      {/* Background glow on hover */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-col gap-5">
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-300 border-cyan-400/30">
            <Sparkles size={10} />
            <span>{member.honorific}</span>
          </span>

          <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">
            CGC Directorate
          </span>
        </div>

        {/* Center: Portrait Placeholder + Basic Info */}
        <div className="flex items-center gap-4">
          <PortraitPlaceholder
            image={member.image}
            name={member.name}
            size="large"
            aspectRatio="square"
            glowColor="cyan"
          />

          <div className="flex flex-col min-w-0">
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-cyan-200 truncate">
              {member.name}
            </h4>

            <p className="text-sm font-semibold text-cyan-300/90 mt-0.5 leading-snug">
              {member.designation}
            </p>

            <div className="mt-1 flex items-center gap-1 text-[11px] text-white/50 truncate">
              <Building2 size={11} className="flex-shrink-0 text-white/40" />
              <span className="truncate">{member.department}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {member.bio && (
          <p className="text-xs sm:text-sm text-zinc-300/80 leading-relaxed border-t border-white/[0.06] pt-3 line-clamp-3">
            {member.bio}
          </p>
        )}
      </div>

      {/* Badges Footer */}
      {member.badges && member.badges.length > 0 && (
        <div className="relative z-10 mt-5 flex flex-wrap gap-1.5 pt-1 border-t border-white/[0.04]">
          {member.badges.map((badge, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[9px] font-medium text-white/60 backdrop-blur-md"
            >
              <Award size={9} className="text-cyan-400/60" />
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
