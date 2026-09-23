import type { Metadata } from "next";
import LegacyView from "@/components/legacy/LegacyView";

export const metadata: Metadata = {
  title: "The Legacy | Saviskar 2026 — Aevorian Reverie",
  description:
    "The institutional leadership, founders, Department of Student Affairs, and cherished alumni powering Saviskar 2026: Aevorian Reverie at CGC University, Mohali.",
  openGraph: {
    title: "The Legacy | Saviskar 2026",
    description:
      "Honoring the chancellor, leadership, DSA team, and alumni behind Saviskar 2026 at CGC University, Mohali.",
    images: ["/images/concert-stadium.webp"],
  },
};

export default function LegacyPage() {
  return <LegacyView />;
}
