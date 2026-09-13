import type { Metadata } from "next";
import Hero from "@/components/starnight/Hero/Hero";
import PastPerformances from "@/components/starnight/PastPerformances/PastPerformances";
import GuessArtist from "@/components/starnight/GuessArtist/GuessArtist";
import LightsOut from "@/components/starnight/LightsOut/LightsOut";
import StarNightReveal from "@/components/starnight/StarNightReveal";

export const metadata: Metadata = {
  title: "Star Night — Headline Concerts",
  description:
    "Experience Star Night at Saviskar 2026: Aevorian Reverie at CGC University, Mohali. Stadium lights, chart-topping headline artists, and 25,000+ voices singing in unison under the night sky.",
  openGraph: {
    title: "Star Night | Saviskar 2026: Aevorian Reverie",
    description:
      "Headline concerts, laser pyrotechnics, and electric stadium performances at CGC University, Mohali.",
  },
};

export default function StarNightPage() {
  return (
    <main className="w-full overflow-x-hidden bg-black">
      <Hero />

      <PastPerformances />

      <GuessArtist />

      <LightsOut />

      <StarNightReveal />
    </main>
  );
}