"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface DeskEditorialSpreadProps {
  deskTitle: string;
  titleBadge?: string;
  dropCap: string;
  paragraphs: string[];
  signeeName: string;
  signeeRole: string;
  image?: string;
  initials?: string;
  accent?: "amber" | "cyan" | "violet" | "emerald";
  align?: "left" | "right";
  secondarySignees?: { name: string; role: string; initials?: string }[];
  /** When true, renders "The Desk of" as a prefix above deskTitle (for faculty spreads).
   *  When false (default), renders deskTitle as the primary full headline. */
  showDeskPrefix?: boolean;
}

export default function DeskEditorialSpread({
  deskTitle,
  titleBadge,
  dropCap,
  paragraphs,
  signeeName,
  signeeRole,
  image,
  initials,
  accent = "amber",
  align = "left",
  secondarySignees,
  showDeskPrefix = false,
}: DeskEditorialSpreadProps) {
  const [imageError, setImageError] = useState(false);

  const displayInitials =
    initials ||
    signeeName
      .split(" ")
      .filter((n) => !["Dr.", "Mrs.", "Mr.", "Ms.", "&"].includes(n))
      .slice(0, 2)
      .map((n) => n[0])
      .join("");

  const accentText = {
    amber:   "text-amber-300",
    cyan:    "text-cyan-300",
    violet:  "text-violet-300",
    emerald: "text-emerald-300",
  }[accent];

  const dropCapColor = {
    amber:   "text-amber-400",
    cyan:    "text-cyan-400",
    violet:  "text-violet-400",
    emerald: "text-emerald-400",
  }[accent];

  const signeeRoleColor = {
    amber:   "text-amber-300/70",
    cyan:    "text-cyan-300/70",
    violet:  "text-violet-300/70",
    emerald: "text-emerald-300/70",
  }[accent];

  const hasValidImage = Boolean(image && image.trim() !== "" && !imageError);

  const firstParagraph = paragraphs[0] || "";
  const remainingParagraphs = paragraphs.slice(1);
  const firstLetter = dropCap || firstParagraph.charAt(0);
  // restOfFirstParagraph: the bio text after the drop cap letter
  const restOfFirstParagraph = firstParagraph;

  // ── Text column ──────────────────────────────────────────────────
  const TextContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Paragraph 1 with drop cap */}
        <div className="text-base sm:text-lg md:text-xl text-zinc-200 leading-relaxed font-light text-justify">
          <span
            className={`float-left font-editorial font-bold text-[5.5rem] sm:text-[6.5rem] leading-[0.82] pr-3 pt-1 select-none ${dropCapColor}`}
          >
            {firstLetter}
          </span>
          {restOfFirstParagraph}
        </div>

        {/* Subsequent paragraphs */}
        {remainingParagraphs.length > 0 && (
          <div className="mt-6 space-y-5 text-sm sm:text-base text-zinc-300/80 leading-[1.85] font-light text-justify">
            {remainingParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </div>

      {/* Signature block */}
      <div className="mt-10 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {secondarySignees && secondarySignees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {secondarySignees.map((sig, i) => (
              <div key={i}>
                <div className="font-editorial text-lg sm:text-xl font-semibold text-white leading-tight tracking-wide">
                  {sig.name}
                </div>
                <div className={`text-xs font-mono tracking-widest uppercase mt-1 ${signeeRoleColor}`}>
                  {sig.role}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="font-editorial text-2xl sm:text-3xl font-semibold text-white leading-tight tracking-wide">
              {signeeName}
            </div>
            <div className={`text-xs font-mono tracking-widest uppercase mt-1.5 ${signeeRoleColor}`}>
              {signeeRole}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Portrait column ───────────────────────────────────────────────
  const VisualContent = (
    <div className="relative flex items-stretch justify-center">
      {hasValidImage ? (
        <div className="relative w-full h-[480px] sm:h-[560px] overflow-hidden">
          <Image
            src={image!}
            alt={signeeName}
            fill
            unoptimized
            className="object-cover object-top"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
        </div>
      ) : (
        /* Ghost initials placeholder */
        <div className="flex flex-col items-center justify-center py-20 sm:py-28 w-full">
          <div
            className={`font-editorial font-black leading-none select-none tracking-tighter ${dropCapColor}`}
            style={{ fontSize: "clamp(6rem, 18vw, 14rem)", opacity: 0.13 }}
            aria-hidden="true"
          >
            {displayInitials}
          </div>
          <div className="mt-5 font-mono text-[10px] sm:text-xs text-zinc-600 tracking-[0.3em] uppercase">
            Portrait forthcoming
          </div>
        </div>
      )}
    </div>
  );

  // ── Header: two modes ─────────────────────────────────────────────
  // Faculty mode:  eyebrow + "The Desk of" + accentName
  // Member mode:   eyebrow + big name as headline
  const Header = showDeskPrefix ? (
    <div className="text-center mb-12 sm:mb-16">
      {titleBadge && (
        <div className={`font-mono text-[10px] uppercase tracking-[0.3em] mb-4 ${accentText}`}>
          {titleBadge}
        </div>
      )}
      <h4 className="font-editorial text-3xl sm:text-4xl md:text-5xl uppercase tracking-[0.15em] text-white/80 font-extralight">
        The Desk of
      </h4>
      <div className="mt-1 flex items-center justify-center gap-4">
        <span className="h-px w-12 sm:w-24 bg-gradient-to-r from-transparent to-white/20" />
        <h3 className={`font-editorial text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-widest ${accentText}`}>
          {deskTitle}
        </h3>
        <span className="h-px w-12 sm:w-24 bg-gradient-to-l from-transparent to-white/20" />
      </div>
    </div>
  ) : (
    /* Member spread header — wing/role eyebrow + name as headline */
    <div className="mb-10 sm:mb-14" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "2.5rem" }}>
      {titleBadge && (
        <div className={`font-mono text-[10px] uppercase tracking-[0.3em] mb-3 ${accentText}`}>
          {titleBadge}
        </div>
      )}
      <h3 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.0]">
        {deskTitle}
      </h3>
    </div>
  );

  return (
    <section className="relative z-20 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {Header}

      {/* Two-column spread */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
        {align === "left" ? (
          <>
            <div className="md:col-span-7">{TextContent}</div>
            <div className="md:col-span-5">{VisualContent}</div>
          </>
        ) : (
          <>
            <div className="md:col-span-5 order-2 md:order-1">{VisualContent}</div>
            <div className="md:col-span-7 order-1 md:order-2">{TextContent}</div>
          </>
        )}
      </div>
    </section>
  );
}
