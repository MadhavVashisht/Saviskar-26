import type { Metadata } from "next";
import EventsView from "@/components/events/EventsView";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "50+ Competitive Realms — Technical, Non-Technical, Cultural & AIvishkar",
  description:
    "Explore the 4 signature competitive realms at Saviskar 2026: Aevorian Reverie at CGC University, Mohali — Technical, Non-Technical, Cultural, and the flagship AIvishkar AI Tech Expo. 50+ competitions, ₹25L+ in prizes and AI venture grants.",
  keywords: [
    "Saviskar 2026 Realms",
    "Saviskar Competitions",
    "Technical Hackathons CGC Mohali",
    "RoboWars Combat Robotics Punjab",
    "Cultural Dance Competitions 2026",
    "Battle of the Bands Punjab",
    "AIvishkar AI Tech Expo",
    "CGC University College Fest Events",
    "Saviskar Prize Pool 25 Lakhs",
    "Esports Tournament CGC Mohali",
    "Fashion Show Inter-College Fest",
  ],
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "50+ Competitive Realms | Saviskar 2026: Aevorian Reverie",
    description:
      "Technical hackathons & RoboWars, Cultural dance & music mainstage, Non-Technical strategy, and AIvishkar: An AI Tech Expo at CGC University, Mohali. ₹25L+ Total Prize Pool.",
    images: ["/images/realms-page-bg.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "50+ Competitive Realms | Saviskar 2026: Aevorian Reverie",
    description:
      "Technical hackathons, Cultural battlefields, Esports, and AIvishkar AI Tech Expo with ₹25L+ in prize rewards at CGC University, Mohali.",
    images: ["/images/realms-page-bg.webp"],
  },
};

export default function EventsPage() {
  return <EventsView />;
}