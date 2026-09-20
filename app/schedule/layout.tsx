import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Schedule & Timeline — Full Event Lineup | Saviskar 2026",
  description:
    "Complete two-day festival schedule for Saviskar 2026 at CGC University, Mohali. Track competitive realms, hackathons, cultural showcases, and star night concerts.",
  openGraph: {
    title: "Schedule & Timeline | Saviskar 2026: Aevorian Reverie",
    description:
      "Explore the hour-by-hour itinerary of 50+ competitions, robotics arenas, cultural stages, and headline concerts.",
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
