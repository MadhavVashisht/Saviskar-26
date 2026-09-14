"use client";

import React from "react";
import { QuoteByte } from "@/data/teamData";
import { Quote, Sparkles, Shield, Users } from "lucide-react";

interface QuoteByteCardProps {
  data: QuoteByte;
  variant?: "tier1" | "tier2" | "sac";
}

export default function QuoteByteCard({
  data,
  variant = "tier1",
}: QuoteByteCardProps) {
  const isTier1 = variant === "tier1";
  const isTier2 = variant === "tier2";
  const isSac = variant === "sac";

  const badgeColor = isTier1
    ? "border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
    : isTier2
    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
    : "border-violet-400/30 bg-violet-400/10 text-violet-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]";

  const iconColor = isTier1
    ? "text-amber-400"
    : isTier2
    ? "text-cyan-400"
    : "text-violet-400";

  return (
    <div className="liquid-glass-card group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300">
      {/* Soft stage haze overlay */}
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-25 transition-all duration-500 group-hover:opacity-40 ${
          isTier1 ? "bg-amber-500" : isTier2 ? "bg-cyan-500" : "bg-violet-500"
        }`}
      />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Tier badge header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] ${badgeColor}`}
          >
            {isTier1 && <Shield size={12} className={iconColor} />}
            {isTier2 && <Sparkles size={12} className={iconColor} />}
            {isSac && <Users size={12} className={iconColor} />}
            <span>{data.tierLabel}</span>
          </div>

          <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
            Saviskar 2026 • Official Roster
          </span>
        </div>

        {/* Quote Body with Editorial Serif Accent */}
        <div className="relative pl-6 sm:pl-8">
          <Quote
            size={28}
            className={`absolute -left-1 top-0 opacity-20 transition-opacity duration-300 group-hover:opacity-40 ${iconColor}`}
          />
          <blockquote className="text-base sm:text-lg md:text-xl font-light leading-relaxed text-white/95">
            &ldquo;
            <span className="font-editorial text-white/95 font-normal tracking-wide">
              {data.quote}
            </span>
            &rdquo;
          </blockquote>
        </div>

        {/* Attribution Bar */}
        <div className="mt-2 flex flex-col border-t border-white/[0.08] pt-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold text-xs sm:text-sm text-white/95 flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isTier1
                  ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                  : isTier2
                  ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                  : "bg-violet-400 shadow-[0_0_8px_#c084fc]"
              } animate-pulse`}
            />
            {data.attribution}
          </div>
          <div className="font-mono text-[11px] text-white/40 mt-1 sm:mt-0">
            {data.designation}
          </div>
        </div>
      </div>
    </div>
  );
}
