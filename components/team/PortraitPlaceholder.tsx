"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Camera } from "lucide-react";

interface PortraitPlaceholderProps {
  image?: string;
  name: string;
  initials?: string;
  aspectRatio?: "square" | "portrait";
  size?: "hero" | "large" | "medium" | "compact";
  glowColor?: "amber" | "violet" | "cyan" | "emerald";
}

export default function PortraitPlaceholder({
  image,
  name,
  initials,
  aspectRatio = "portrait",
  size = "medium",
  glowColor = "violet",
}: PortraitPlaceholderProps) {
  const [imageError, setImageError] = useState(false);

  const displayInitials =
    initials ||
    name
      .split(" ")
      .filter((n) => !["Dr.", "Mrs.", "Mr.", "Ms."].includes(n))
      .slice(0, 2)
      .map((n) => n[0])
      .join("");

  const glowBorder = {
    amber: "border-amber-400/40 group-hover:border-amber-400/70 shadow-[0_0_25px_rgba(245,158,11,0.15)]",
    violet: "border-violet-400/40 group-hover:border-violet-400/70 shadow-[0_0_25px_rgba(168,85,247,0.15)]",
    cyan: "border-cyan-400/40 group-hover:border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.15)]",
    emerald: "border-emerald-400/40 group-hover:border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.15)]",
  }[glowColor];

  const ambientRadial = {
    amber: "from-amber-500/15 via-purple-900/10 to-transparent",
    violet: "from-violet-500/15 via-fuchsia-900/10 to-transparent",
    cyan: "from-cyan-500/15 via-blue-900/10 to-transparent",
    emerald: "from-emerald-500/15 via-teal-900/10 to-transparent",
  }[glowColor];

  const badgeTheme = {
    amber: "bg-amber-400/10 border-amber-400/30 text-amber-300",
    violet: "bg-violet-400/10 border-violet-400/30 text-violet-300",
    cyan: "bg-cyan-400/10 border-cyan-400/30 text-cyan-300",
    emerald: "bg-emerald-400/10 border-emerald-400/30 text-emerald-300",
  }[glowColor];

  // Size dimensions
  const getContainerDimensions = () => {
    switch (size) {
      case "hero":
        return aspectRatio === "portrait"
          ? "w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5]"
          : "w-36 h-36 sm:w-44 sm:h-44";
      case "large":
        return aspectRatio === "portrait"
          ? "w-full aspect-[4/5] max-h-[260px]"
          : "w-20 h-20 sm:w-24 sm:h-24";
      case "medium":
        return aspectRatio === "portrait"
          ? "w-full aspect-[1/1] max-h-[160px]"
          : "w-16 h-16 sm:w-20 sm:h-20";
      case "compact":
        return "w-10 h-10 sm:w-11 sm:h-11";
      default:
        return "w-20 h-20";
    }
  };

  const hasValidImage = Boolean(image && image.trim() !== "" && !imageError);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300 ${getContainerDimensions()} ${glowBorder} bg-black/40 backdrop-blur-xl`}
    >
      {/* Specular rim lighting */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.12] via-transparent to-black/60" />
      <div className={`pointer-events-none absolute inset-0 bg-radial-gradient ${ambientRadial}`} />

      {hasValidImage ? (
        <Image
          src={image!}
          alt={name}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Glassmorphic Placeholder Frame */
        <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
          {/* Subtle silhouette or icon circle */}
          <div
            className={`flex items-center justify-center rounded-full border backdrop-blur-md transition-transform duration-300 group-hover:scale-110 ${badgeTheme} ${
              size === "hero"
                ? "h-20 w-20 sm:h-24 sm:w-24 text-2xl font-black font-mono"
                : size === "large"
                ? "h-14 w-14 sm:h-16 sm:w-16 text-lg font-bold font-mono"
                : size === "medium"
                ? "h-11 w-11 sm:h-12 sm:w-12 text-sm font-bold font-mono"
                : "h-8 w-8 text-xs font-semibold font-mono"
            }`}
          >
            {displayInitials || <User size={size === "hero" ? 28 : 18} className="opacity-80" />}
          </div>

          {/* Micro tag indicating photo slot for hero / large sizes */}
          {size === "hero" && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/40">
              <Camera size={10} className="text-white/40" />
              <span>Portrait Slot</span>
            </div>
          )}

          {size === "large" && (
            <span className="font-mono text-[8px] uppercase tracking-wider text-white/30">
              Portrait Slot
            </span>
          )}
        </div>
      )}

      {/* Pulsing indicator node on corner */}
      <div className="absolute bottom-2 right-2 flex h-4 w-4 items-center justify-center rounded-full border border-black/80 bg-black/80 backdrop-blur-sm">
        <span
          className={`h-2 w-2 rounded-full ${
            glowColor === "amber"
              ? "bg-amber-400"
              : glowColor === "cyan"
              ? "bg-cyan-400"
              : glowColor === "emerald"
              ? "bg-emerald-400"
              : "bg-violet-400"
          } animate-pulse`}
        />
      </div>
    </div>
  );
}
