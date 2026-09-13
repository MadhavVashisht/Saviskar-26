import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Saviskar 2026 | Aevorian Reverie — Annual National University Fest | CGC University, Mohali",
    template: "%s | Saviskar 2026 — Aevorian Reverie | CGC University, Mohali",
  },
  description:
    "Official portal for Saviskar 2026: Aevorian Reverie — Where Tomorrow Dreams Awake. North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali. A future imagined so vividly, it begins to exist. Featuring 50+ competitive realms across technology, cultural arts, national hackathons, robotics, sports, and headline Star Night concerts.",
  keywords: [
    "Saviskar 2026",
    "Aevorian Reverie",
    "Where Tomorrow Dreams Awake",
    "A future imagined so vividly it begins to exist",
    "Srijan",
    "Avishkar",
    "CGC University Mohali",
    "CGC Landran",
    "Annual National University Festival",
    "North India University Fest",
    "Techno-Cultural Fest 2026",
    "Star Night CGC University",
    "National Hackathons 2026",
    "Robotics Realm",
    "Inter-University Competitions",
    "Punjab University Festival",
    "Student Festival Registrations"
  ],
  authors: [{ name: "CGC University, Mohali", url: "https://saviskar-2026.vercel.app" }],
  creator: "CGC University, Mohali",
  publisher: "CGC University, Mohali",
  category: "University Festival & National Competitions",
  metadataBase: new URL("https://saviskar-2026.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Saviskar 2026: Aevorian Reverie | CGC University, Mohali",
    description:
      "Where Tomorrow Dreams Awake. North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali. 50+ Realms, 500+ Colleges & Universities, 25,000+ Participants, 2 Action-Packed Days.",
    url: "https://saviskar-2026.vercel.app",
    siteName: "Saviskar 2026",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/concert-stadium.jpg",
        width: 1920,
        height: 1080,
        alt: "Saviskar 2026 Aevorian Reverie Mainstage Stadium Realm at CGC University, Mohali",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saviskar 2026: Aevorian Reverie | CGC University, Mohali",
    description:
      "Where Tomorrow Dreams Awake. North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali.",
    images: ["/images/concert-stadium.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-white selection:text-black">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
