"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface EditorialPortraitCardProps {
  name: string;
  role: string;            // e.g. "President" or "Team Lead"
  subrole?: string;        // e.g. "Student Advisory Council"
  image?: string;
  initials?: string;
  // Visual height in px — controls how tall the portrait block is
  height?: number;
  // Accent colour for initials ghost and role label
  accent?: "amber" | "cyan" | "violet" | "emerald" | "white";
  // Show a top label over the portrait (e.g. "EXECUTIVE HEAD")
  topLabel?: string;
}

const ACCENT_COLORS = {
  amber:   { ghost: "text-amber-400",   role: "text-amber-300/70"   },
  cyan:    { ghost: "text-cyan-400",    role: "text-cyan-300/70"    },
  violet:  { ghost: "text-violet-400",  role: "text-violet-300/70"  },
  emerald: { ghost: "text-emerald-400", role: "text-emerald-300/70" },
  white:   { ghost: "text-white/30",    role: "text-white/40"       },
};

/**
 * EditorialPortraitCard
 * ─────────────────────
 * A unified, rectangular, borderless editorial portrait card used across
 * the entire /team page. No circles, no glassmorphism, no glow boxes.
 *
 * When an image is available   → full-bleed photo with fade-to-black gradient at bottom.
 * When no image is available   → oversized ghost initials on a dark field, clean & elegant.
 *
 * The name and role sit BELOW the portrait in pure typography.
 */
export default function EditorialPortraitCard({
  name,
  role,
  subrole,
  image,
  initials,
  height = 280,
  accent = "white",
  topLabel,
}: EditorialPortraitCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayInitials =
    initials ||
    name
      .split(" ")
      .filter((n) => !["Dr.", "Mrs.", "Mr.", "Ms.", "&"].includes(n))
      .slice(0, 2)
      .map((n) => n[0])
      .join("");

  const hasValidImage = Boolean(image && image.trim() !== "" && !imageError);
  const colors = ACCENT_COLORS[accent];

  return (
    <div className="group flex flex-col">
      {/* ── Portrait Block ─────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden bg-zinc-950 transition-transform duration-500 group-hover:scale-[1.02]"
        style={{ height }}
      >
        {hasValidImage ? (
          <>
            <Image
              src={image!}
              alt={name}
              fill
              unoptimized
              className="object-cover object-top"
              onError={() => setImageError(true)}
            />
            {/* Bottom fade to black so text reads cleanly below */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </>
        ) : (
          /* Ghost initials placeholder — large, tinted, editorial */
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
            {/* Very subtle texture lines */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.6) 3px,rgba(255,255,255,0.6) 4px)",
              }}
            />
            <span
              className={`font-editorial font-black leading-none select-none tracking-tighter ${colors.ghost}`}
              style={{ fontSize: "clamp(4rem, 18vw, 9rem)", opacity: 0.12 }}
              aria-hidden="true"
            >
              {displayInitials}
            </span>
          </div>
        )}

        {/* Top label ribbon — e.g. "EXECUTIVE HEAD", "TEAM LEAD" */}
        {topLabel && (
          <div className="absolute top-3 left-3">
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/40">
              {topLabel}
            </span>
          </div>
        )}
      </div>

      {/* ── Name + Role Typography ──────────────────────────────── */}
      <div className="mt-3">
        <div className="font-editorial text-sm sm:text-base font-semibold text-white leading-tight tracking-tight">
          {name}
        </div>
        <div className={`font-mono text-[9px] sm:text-[10px] tracking-widest uppercase mt-1 ${colors.role}`}>
          {role}
        </div>
        {subrole && (
          <div className="font-mono text-[8px] text-white/20 tracking-wider mt-0.5">
            {subrole}
          </div>
        )}
      </div>
    </div>
  );
}
