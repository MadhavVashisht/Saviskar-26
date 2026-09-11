import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
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
    default: "Saviskar 2026 | Aevorian Reverie",
    template: "%s | Saviskar 2026 — Aevorian Reverie",
  },
  description:
    "Official portal for Saviskar 2026: Aevorian Reverie — Where Tomorrow Dreams Awake. The premier techno-cultural festival of CGC University, Mohali.",
  metadataBase: new URL("https://saviskar-2026.vercel.app"),
  openGraph: {
    title: "Saviskar 2026: Aevorian Reverie | CGC University, Mohali",
    description:
      "Register for Saviskar 2026: Aevorian Reverie — Where Tomorrow Dreams Awake. 50+ Events, 100+ Colleges, 2 Days.",
    siteName: "Saviskar 2026",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
