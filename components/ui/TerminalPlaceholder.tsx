"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Terminal, ShieldAlert, Cpu, Radio, Sparkles } from "lucide-react";
import Navbar from "@/components/ui/Navbar";

interface TerminalPlaceholderProps {
  moduleCode: string;
  moduleName: string;
  category: string;
  classification: string;
  estimatedRelease: string;
  summary: string;
}

const HEX_CHARS = "0123456789ABCDEF!@#$%&*<>[]{}";

export default function TerminalPlaceholder({
  moduleCode,
  moduleName,
  category,
  classification,
  estimatedRelease,
  summary,
}: TerminalPlaceholderProps) {
  const [cipherText, setCipherText] = useState("");
  const [percentage, setPercentage] = useState(64);

  // Dynamic cyberpunk cipher stream effect
  useEffect(() => {
    const interval = setInterval(() => {
      let str = "";
      for (let i = 0; i < 28; i++) {
        str += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
      }
      setCipherText(str);
    }, 90);

    const progressInterval = setInterval(() => {
      setPercentage((prev) => (prev >= 98 ? 64 : prev + 1));
    }, 450);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 text-white selection:bg-white selection:text-black">
      {/* Corner Singularity Disc Navigation */}
      <Navbar />

      {/* Futuristic Background Atmospheric Spotlights */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[30%] top-[20%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[170px]" />
        <div className="absolute right-[25%] bottom-[20%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[160px]" />

        {/* Scanline Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl py-24">
        {/* Terminal HUD Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass overflow-hidden rounded-[32px] border border-violet-500/30 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_60px_rgba(168,85,247,0.2)] md:p-12 backdrop-blur-3xl"
        >
          {/* Top Telemetry Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/40 bg-violet-500/20 text-violet-300">
                <Terminal size={14} />
              </div>
              <span className="font-mono text-xs font-bold tracking-[0.25em] text-white">
                SAVISKAR // {moduleCode}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-violet-300">
              <Radio size={12} className="animate-pulse text-violet-400" />
              <span>TRANSMISSION ACTIVE</span>
            </div>
          </div>

          {/* Core Content */}
          <div className="mt-8 space-y-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3.5 py-1 font-mono text-[9px] uppercase tracking-[0.3em] text-violet-300">
              <ShieldAlert size={12} />
              <span>{classification}</span>
            </div>

            <h1 className="font-sans text-4xl font-light tracking-tight text-white md:text-5xl">
              {moduleName}
            </h1>

            <p className="mx-auto max-w-md text-sm leading-6 text-white/60">
              {summary}
            </p>
          </div>

          {/* Holographic Decryption Readout */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/60 p-5 font-mono">
            <div className="flex items-center justify-between text-[10px] text-white/40 tracking-wider">
              <span className="flex items-center gap-1.5 text-violet-400">
                <Cpu size={12} /> DECRYPTION_MATRIX:
              </span>
              <span>{percentage}% COMPLETE</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 shadow-[0_0_12px_#c084fc]"
                style={{ width: `${percentage}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>

            {/* Live Scrambling Cipher String */}
            <div className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] tracking-widest text-violet-300/70">
              HASH: {cipherText}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[9px] text-white/35">
              <span>LOCATION: CGC UNIVERSITY MOHALI</span>
              <span>TARGET: {estimatedRelease}</span>
            </div>
          </div>

          {/* Action Gateway */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-xs font-medium text-white transition hover:border-violet-400 hover:text-violet-300"
            >
              <ArrowLeft size={14} />
              <span>Return to Command</span>
            </Link>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold text-black transition hover:bg-violet-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
            >
              <span>Explore Active Realms</span>
              <Sparkles size={13} className="text-violet-700" />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
