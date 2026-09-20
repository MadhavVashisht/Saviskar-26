import type { Metadata } from "next";
import EventsView from "@/components/events/EventsView";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "50+ Competitive Realms — Technical, Non-Technical, Cultural & AIvishkar",
  description:
    "Explore the 4 signature competitive realms at Saviskar 2026: Aevorian Reverie at CGC University, Mohali — Technical, Non-Technical, Cultural, and the flagship AIvishkar AI Tech Expo. 50+ competitions, ₹10L+ in prizes and AI venture grants.",
  openGraph: {
    title: "50+ Competitive Realms | Saviskar 2026: Aevorian Reverie",
    description:
      "Technical hackathons & RoboWars, Cultural dance & music mainstage, Non-Technical strategy, and AIvishkar: An AI Tech Expo at CGC University, Mohali.",
    images: ["/images/realms-page-bg.webp"],
  },
};

export default function EventsPage() {
  return <EventsView />;
}