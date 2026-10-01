import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dome Gallery & Festival Glimpses | Saviskar 2026",
  description:
    "Explore the immersive 3D Dome Gallery and visual archives of Saviskar: Aevorian Reverie at CGC University, Mohali. High-voltage hackathons, RoboWars, stage performances, and Star Night concert energy.",
  keywords: [
    "Saviskar 2026 Gallery",
    "Saviskar Dome Gallery",
    "CGC University Fest photos",
    "Saviskar concert images",
    "RoboWars CGC Mohali",
    "Aevorian Reverie visual archives",
    "North India college fest glimpses",
  ],
  openGraph: {
    title: "Dome Gallery & Festival Archives | Saviskar 2026",
    description:
      "Step inside the interactive 3D Dome Gallery capturing 35,000+ creators, hackers, and performers across 500+ universities at CGC University, Mohali.",
    images: ["/images/concert-stadium.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dome Gallery & Visual Archives | Saviskar 2026",
    description:
      "Interactive 3D Dome Gallery of Saviskar 2026: Aevorian Reverie at CGC University, Mohali.",
    images: ["/images/concert-stadium.webp"],
  },
  alternates: {
    canonical: "/gallery",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
