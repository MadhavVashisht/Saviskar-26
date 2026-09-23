import type { Metadata } from "next";
import TeamView from "@/components/team/TeamView";

export const metadata: Metadata = {
  title: "Organising Team & Student Advisory Council (SAC) | Saviskar 2026",
  description:
    "Meet the visionary faculty directorate, executive leadership, and the 54-member Student Advisory Council (SAC) organizing Saviskar 2026: Aevorian Reverie at CGC University, Mohali.",
  openGraph: {
    title: "Organising Team & SAC Roster | Saviskar 2026",
    description:
      "Honoring the faculty leaders, domain heads, and the 54-member Student Advisory Council (SAC) behind Saviskar 2026 at CGC University, Mohali.",
    images: ["/images/concert-stadium.webp"],
  },
};

export default function TeamPage() {
  return <TeamView />;
}
