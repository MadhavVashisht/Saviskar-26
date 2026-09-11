"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FastForward, Disc3, ShieldCheck } from "lucide-react";

interface PreloaderProps {
  onComplete?: () => void;
  durationSeconds?: number;
}

const CRITICAL_IMAGES = [
  "/images/concert-stadium.jpg",
  "/images/hero.jpg",
  "/images/concert.jpg",
  "/images/technical.jpg",
  "/images/cultural.jpg",
  "/images/sports.jpg",
];

const STATUS_STEPS = [
  { at: 0, text: "INITIALIZING AEVORIAN FREQUENCIES" },
  { at: 15, text: "PRELOADING 8K STAGE ASSETS & FONTS" },
  { at: 35, text: "TUNING VOLUMETRIC LIGHTING RIGS" },
  { at: 55, text: "SYNCHRONIZING FESTIVAL SOUNDSCAPES" },
  { at: 72, text: "EXPANDING CINEMA IMMERSION • FULLSCREEN ACTIVE" },
  { at: 92, text: "ALL SYSTEMS PRIMED • ENTERING AEVORIAN REVERIE" },
];

export default function Preloader({
  onComplete,
  durationSeconds = 8.5,
}: PreloaderProps) {
  const [showPreloader, setShowPreloader] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("nopreloader")) return false;
      } catch {
        // Fallback
      }
    }
    return true;
  });
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_STEPS[0].text);
  const [isExiting, setIsExiting] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: 1440, h: 900 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const assetsReadyRef = useRef(false);

  // Clear any legacy session flag so preloader is never blocked
  useEffect(() => {
    try {
      sessionStorage.removeItem("saviskar26_seen_intro");
    } catch {
      // Ignore
    }
  }, []);

  // Measure window for pixel-perfect expansion
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const finishLoading = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setShowPreloader(false);
      onComplete?.();
    }, 850);
  }, [isExiting, onComplete]);

  const finishLoadingRef = useRef(finishLoading);
  useEffect(() => {
    finishLoadingRef.current = finishLoading;
  }, [finishLoading]);

  // Real asset preloading (images, fonts, DOM)
  useEffect(() => {
    if (!showPreloader) return;

    let isMounted = true;
    const preloadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });

    const fontPromise =
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready
        : Promise.resolve();

    const docPromise =
      typeof document !== "undefined" && document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
          window.addEventListener("load", () => resolve(), { once: true });
        });

    const imagePromises = CRITICAL_IMAGES.map(preloadImage);

    Promise.allSettled([...imagePromises, fontPromise, docPromise]).then(() => {
      if (isMounted) {
        assetsReadyRef.current = true;
        setAssetsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [showPreloader]);

  // Progress pacing & reliable timer loop across durationSeconds
  useEffect(() => {
    if (!showPreloader) return;

    // Lock page scroll during preloading
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const totalMs = durationSeconds * 1000;
    const start = performance.now();

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - start;
      const naturalPct = (elapsed / totalMs) * 100;

      let nextPct = Math.floor(naturalPct);
      // Wait for assets if still downloading near end
      if (!assetsReadyRef.current && naturalPct >= 84) {
        nextPct = 84;
      } else {
        nextPct = Math.min(100, Math.max(0, nextPct));
      }

      setProgress(nextPct);

      // Update telemetry status text
      for (let i = STATUS_STEPS.length - 1; i >= 0; i--) {
        if (nextPct >= STATUS_STEPS[i].at) {
          setStatusText(STATUS_STEPS[i].text);
          break;
        }
      }

      if (nextPct >= 100) {
        clearInterval(interval);
        finishLoadingRef.current();
      }
    }, 40);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearInterval(interval);
    };
  }, [showPreloader, durationSeconds]);

  // Attempt video autoPlay gracefully
  useEffect(() => {
    if (showPreloader && videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, [showPreloader]);

  if (!showPreloader) return null;

  // Expansion curve calculation:
  // Starts expanding at 15% and covers 100% full screen by 88%
  const rawExpansion = Math.max(0, Math.min(1, (progress - 15) / (88 - 15)));
  // Smoothstep easing for cinematic expansion
  const easedExpansion = rawExpansion * rawExpansion * (3 - 2 * rawExpansion);

  // Exact pixel dimensions during expansion
  const initialWidth = Math.min(780, windowSize.w * 0.88);
  const initialHeight = Math.min(560, windowSize.h * 0.60);

  const currentWidth =
    easedExpansion >= 0.999
      ? windowSize.w
      : initialWidth + (windowSize.w - initialWidth) * easedExpansion;

  const currentHeight =
    easedExpansion >= 0.999
      ? windowSize.h
      : initialHeight + (windowSize.h - initialHeight) * easedExpansion;

  const currentRadius = Math.max(0, 22 * (1 - easedExpansion));
  const currentBorderOpacity = (1 - easedExpansion) * 0.2;
  const currentShadowSpread = 100 * (1 - easedExpansion);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="saviskar-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            filter: "brightness(1.4) blur(14px)",
            transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[99999] bg-black text-white select-none overflow-hidden"
          style={{ backgroundColor: "#000000" }}
        >
          {/* Subtle Film Grain & Scanlines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen z-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 2px)",
              backgroundSize: "100% 2px",
            }}
          />

          {/* Vignette Overlay that recedes as screen becomes fully covered */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.95)_100%)] z-20 transition-opacity duration-300"
            style={{ opacity: 1 - easedExpansion * 0.45 }}
          />

          {/* Top HUD Bar */}
          <div
            className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-5 md:px-12 md:py-8 transition-all duration-300"
            style={{
              transform: `translateY(${-20 * easedExpansion * (progress > 85 ? (progress - 85) / 15 : 0)}px)`,
            }}
          >
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/80">
                SAVISKAR 2026 // MONO ARCHIVE
              </span>
            </div>

            {/* Skip Button */}
            <button
              onClick={finishLoading}
              className="group flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-1.5 text-xs font-mono tracking-[0.2em] text-white/90 backdrop-blur-md transition-all hover:border-white/50 hover:bg-white/20 hover:text-white active:scale-95 shadow-lg pointer-events-auto"
            >
              <span>SKIP</span>
              <FastForward className="h-3 w-3 text-violet-400 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Center Stage: Gradually Expands to Cover Entire Screen */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden z-10 bg-neutral-950 flex items-center justify-center will-change-[width,height,border-radius]"
            style={{
              width: `${currentWidth}px`,
              height: `${currentHeight}px`,
              borderRadius: `${currentRadius}px`,
              borderWidth: `${(1 - easedExpansion) * 1.5}px`,
              borderColor: `rgba(255, 255, 255, ${currentBorderOpacity})`,
              boxShadow: `0 0 ${currentShadowSpread}px rgba(0,0,0,0.95)`,
              transition: "box-shadow 0.2s ease-out",
            }}
          >
            {/* Viewfinder Camera Crosshairs (gradually fade away during expansion) */}
            <div
              className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
              style={{ opacity: Math.max(0, 1 - easedExpansion * 2.0) }}
            >
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/70" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/70" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/70" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/70" />

              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest text-white/80">
                <Disc3 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                <span>REC • [MONO CINEMA EXPAND]</span>
              </div>
            </div>

            {/* Monochrome Video Playback with Multi-Format Fallback */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              loop
              preload="auto"
              className="w-full h-full object-cover grayscale contrast-125 filter transition-transform duration-700 ease-out"
              style={{
                transform: `scale(${1 + easedExpansion * 0.05})`,
              }}
            >
              <source src="/PreLoader/preloader.mp4" type="video/mp4" />
              <source src="/PreLoader/preloader.webm" type="video/webm" />
              {/* Fallback to Animated WebP */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/PreLoader/preloader.webp"
                alt="Saviskar Festival Preloader"
                className="w-full h-full object-cover"
              />
            </video>

            {/* Subtle Inner Ambient Vignette */}
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/30 z-20 transition-opacity duration-300"
              style={{ opacity: 1 - easedExpansion * 0.5 }}
            />
          </div>

          {/* Bottom Telemetry & Progress HUD */}
          <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center px-6 pb-8 md:pb-12 pointer-events-none">
            <div className="w-full max-w-4xl flex flex-col items-center bg-black/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300">
              {/* Progress Counter & Live Step */}
              <div className="w-full flex items-end justify-between text-xs font-mono mb-2.5">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-violet-400 font-semibold">
                      SYSTEM TELEMETRY
                    </span>
                    {assetsLoaded && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        <span>ASSETS PRIMED</span>
                      </span>
                    )}
                  </div>
                  <span className="text-white/90 tracking-wider text-xs md:text-sm font-medium">
                    {statusText}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl md:text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.4)]">
                    {String(progress).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-white/50">%</span>
                </div>
              </div>

              {/* Shimmer Progress Bar */}
              <div className="relative w-full h-[4px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-600 via-white to-violet-300 shadow-[0_0_14px_rgba(168,85,247,0.9)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>

              {/* Bottom Meta Badges */}
              <div className="w-full flex items-center justify-between text-[10px] font-mono text-white/40 tracking-[0.25em] mt-2.5">
                <span>AEVORIAN REVERIE</span>
                <span className="hidden sm:inline">
                  {easedExpansion > 0.85
                    ? "FULLSCREEN IMMERSION COMPLETE"
                    : "CALIBRATING STADIUM MATRIX"}
                </span>
                <span>CGC UNIVERSITY</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
