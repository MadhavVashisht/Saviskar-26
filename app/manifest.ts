import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saviskar 2026: Aevorian Reverie | CGC University, Mohali",
    short_name: "Saviskar 2026",
    description:
      "North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali. 50+ Realms of Experience, 500+ Universities, 35,000+ Students, Endless Possibilities, Cash Prizes Upto ₹25 LACS, and Stadium Star Night Concerts.",
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
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
