import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saviskar 2026: Aevorian Reverie | CGC University, Mohali",
    short_name: "Saviskar 2026",
    description:
      "North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali. 50+ Realms, ₹25L+ prize pool, 35,000+ students, national hackathons, and star night concerts.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "en-IN",
    categories: ["education", "entertainment", "lifestyle"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/images/saviskar-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/saviskar-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
