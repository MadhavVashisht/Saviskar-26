"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

interface ScrollToOptions {
  offset?: number;
  immediate?: boolean;
  duration?: number;
  easing?: (t: number) => number;
  lock?: boolean;
}

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: ScrollToOptions) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Respect reduced motion settings
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
      autoRaf: true,
      autoResize: true,
      anchors: true,
    });

    lenisRef.current = lenis;
    const rafId = requestAnimationFrame(() => {
      setLenisInstance(lenis);
    });

    // Make lenis globally accessible for debugging or third-party hooks
    if (typeof window !== "undefined") {
      (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    }

    // Automatically pause/resume Lenis when body overflow is toggled (e.g. modals, mobile menu)
    const observer = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") {
        lenis.stop();
      } else {
        lenis.start();
        lenis.resize();
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      if (typeof window !== "undefined") {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
    };
  }, []);

  // When pathname changes, reset scroll position smoothly
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: ScrollToOptions
  ) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    } else if (typeof window !== "undefined") {
      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "smooth" });
      } else if (typeof target === "string") {
        const el = document.querySelector(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const stop = () => {
    lenisRef.current?.stop();
  };

  const start = () => {
    lenisRef.current?.start();
  };

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisInstance,
        scrollTo,
        stop,
        start,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
