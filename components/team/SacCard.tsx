"use client";

import React from "react";
import { SacMember } from "@/data/teamData";
import PortraitPlaceholder from "./PortraitPlaceholder";
import {
  Crown,
  Sparkles,
  Cpu,
  Palette,
  Megaphone,
  Truck,
  Briefcase,
  Layers,
} from "lucide-react";

interface SacCardProps {
  member: SacMember;
}

export default function SacCard({ member }: SacCardProps) {
  const isOfficeBearer = member.tier === "office_bearer";
  const isCore = member.tier === "core";

  // Category Wing Icon Helper
  const getWingIcon = () => {
    switch (member.wing) {
      case "Technical & AI":
        return <Cpu size={10} className="text-cyan-400" />;
      case "Cultural & Stage":
        return <Palette size={10} className="text-fuchsia-400" />;
      case "Media & PR":
        return <Megaphone size={10} className="text-pink-400" />;
      case "Logistics & Hospitality":
        return <Truck size={10} className="text-emerald-400" />;
      case "Corporate & Sponsorship":
        return <Briefcase size={10} className="text-amber-400" />;
      case "Creative & Design":
        return <Sparkles size={10} className="text-purple-400" />;
      default:
        return <Layers size={10} className="text-violet-400" />;
    }
  };

  // ==========================================
  // 1. TIER 3: SAC OFFICE BEARER (Medium-Large Card)
  // ==========================================
  if (isOfficeBearer) {
    return (
      <div className="liquid-glass-interactive group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-amber-400/50">
        {/* Soft amber radial haze */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header Status */}
          <div className="flex items-center justify-between">
            <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300 border-amber-400/30">
              <Crown size={10} className="text-amber-400" />
              <span>OFFICE BEARER</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">
              SAC // APEX
            </span>
          </div>

          {/* Profile: Image Slot + Details */}
          <div className="flex items-center gap-4">
            <PortraitPlaceholder
              image={member.image}
              name={member.name}
              initials={member.initials}
              size="large"
              aspectRatio="square"
              glowColor="amber"
            />

            <div className="flex flex-col min-w-0">
              <h4 className="text-base sm:text-lg font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-amber-200 truncate">
                {member.name}
              </h4>
              <p className="font-mono text-xs font-semibold text-amber-400/90 leading-snug mt-0.5">
                {member.role}
              </p>
            </div>
          </div>

          {/* Department & Academic Year */}
          <div className="mt-1 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-white/50">
            <span className="truncate">{member.department}</span>
            {member.year && (
              <span className="flex-shrink-0 font-mono text-white/40">
                {member.year}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. TIER 4: SAC CORE COMMITTEE LEAD (Medium Card)
  // ==========================================
  if (isCore) {
    return (
      <div className="liquid-glass-interactive group relative flex flex-col justify-between overflow-hidden rounded-xl p-4 sm:p-5 transition-all duration-300 hover:border-violet-400/50">
        {/* Soft violet radial haze */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex flex-col gap-3">
          {/* Header status */}
          <div className="flex items-center justify-between">
            <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-violet-300 border-violet-400/30">
              {getWingIcon()}
              <span>{member.wing}</span>
            </span>
            <span className="font-mono text-[8px] text-white/30 uppercase">
              CORE LEAD
            </span>
          </div>

          {/* Member Details + Image Placeholder */}
          <div className="flex items-center gap-3">
            <PortraitPlaceholder
              image={member.image}
              name={member.name}
              initials={member.initials}
              size="medium"
              aspectRatio="square"
              glowColor="violet"
            />

            <div className="flex flex-col min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white truncate transition-colors duration-200 group-hover:text-violet-200">
                {member.name}
              </h4>
              <p className="text-xs text-white/70 truncate font-medium">
                {member.role}
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px] text-white/45">
            <span className="truncate">{member.department}</span>
            {member.year && <span className="font-mono">{member.year}</span>}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. TIER 5: SAC COUNCIL & EXECUTIVE (Compact Mini-Card)
  // ==========================================
  return (
    <div className="liquid-glass-interactive group relative flex flex-col justify-between overflow-hidden rounded-xl p-3 transition-all duration-200 hover:border-white/25">
      <div className="relative z-10 flex flex-col gap-2">
        {/* Top: Compact Image Slot + Wing Tag */}
        <div className="flex items-center justify-between gap-2">
          <PortraitPlaceholder
            image={member.image}
            name={member.name}
            initials={member.initials}
            size="compact"
            aspectRatio="square"
            glowColor="emerald"
          />

          <span className="liquid-glass inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[8px] text-white/60 truncate max-w-[120px]">
            {getWingIcon()}
            <span className="truncate">{member.wing}</span>
          </span>
        </div>

        {/* Name & Role */}
        <div className="flex flex-col">
          <h5 className="text-xs font-semibold text-white tracking-tight truncate group-hover:text-violet-200">
            {member.name}
          </h5>
          <p className="text-[10px] text-white/60 truncate leading-tight mt-0.5">
            {member.role}
          </p>
        </div>

        {/* Department Tag */}
        <div className="border-t border-white/[0.04] pt-1.5 flex items-center justify-between text-[9px] text-white/40">
          <span className="truncate">{member.department}</span>
        </div>
      </div>
    </div>
  );
}
