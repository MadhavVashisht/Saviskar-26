import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Campus Map & Event Schedule | CGC Saviskar 2026 — CGC University Mohali",
  description:
    "Complete two-day live festival itinerary and interactive campus map for Saviskar 2026: Aevorian Reverie at CGC University, Mohali. Explore schedules for RoboWars, 24h Hackathon, Battle of the Bands, and Star Night concerts.",
  keywords: [
    "CGC Schedule 2026",
    "CGC University Campus Map",
    "Saviskar Event Itinerary",
    "CGC Fest Dates",
    "RoboWars Timing CGC Mohali",
    "Hackathon Schedule Punjab",
    "Star Night Timings CGC",
    "Block 2 Auditorium CGC",
    "CGC Landran Map",
    "Aevorian Reverie Schedule",
  ],
  alternates: {
    canonical: "/schedule",
  },
  openGraph: {
    title: "Campus Map & Event Schedule | CGC Saviskar 2026",
    description:
      "Explore the 48-hour live competition timeline and interactive campus map of 50+ competitions and headline concert stages at CGC University, Mohali.",
    images: ["/images/scene-realms-stage.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Map & Event Schedule | CGC Saviskar 2026",
    description:
      "Explore the 48-hour live competition timeline and interactive campus map of 50+ competitions and headline concert stages at CGC University, Mohali.",
    images: ["/images/scene-realms-stage.webp"],
  },
};

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
