import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/starnight/Hero/Hero";
import PastPerformances from "@/components/starnight/PastPerformances/PastPerformances";
import TerminalPlaceholder from "@/components/ui/TerminalPlaceholder";
import { SITE_ACCESS } from "@/lib/config/site-access";

const GuessArtist = dynamic(
  () => import("@/components/starnight/GuessArtist/GuessArtist")
);
const LightsOut = dynamic(
  () => import("@/components/starnight/LightsOut/LightsOut")
);
const StarNightReveal = dynamic(
  () => import("@/components/starnight/StarNightReveal")
);

export const metadata: Metadata = {
  title: "Star Night — Headline Concerts",
  description:
    "Experience Star Night at Saviskar 2026: Aevorian Reverie at CGC University, Mohali. Stadium lights, chart-topping headline artists, and 35,000+ voices singing in unison under the night sky.",
  openGraph: {
    title: "Star Night | Saviskar 2026: Aevorian Reverie",
    description:
      "Headline concerts, laser pyrotechnics, and electric stadium performances at CGC University, Mohali.",
  },
};

export default function StarNightPage() {
  if (!SITE_ACCESS.STARNIGHT_ENABLED) {
    return (
      <TerminalPlaceholder
        moduleCode="STARNIGHT.SYS"
        moduleName="Star Night Concerts"
        category="ARTIST PROTOCOL"
        classification="TOP SECRET // ARTIST LOCKDOWN"
        estimatedRelease="HEADLINER DROP STAGE"
        summary="Chart-topping headline concert reveals, celebrity artists, stadium lights, and stadium pass allocations for Saviskar 2026 at CGC University, Mohali will be decrypted soon."
      />
    );
  }

  return (
    <main className="w-full overflow-x-hidden bg-black">
      <Navbar />
      <Hero />

      <PastPerformances />

      <GuessArtist />

      <LightsOut />

      <StarNightReveal />
    </main>
  );
}