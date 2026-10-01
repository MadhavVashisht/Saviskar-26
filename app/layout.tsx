import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import "./globals.css";


export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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
  metadataBase: new URL("https://saviskar.co.in"),
  applicationName: "Saviskar 2026",
  referrer: "origin-when-cross-origin",
  title: {
    default: "Saviskar 2026 | Aevorian Reverie — Annual National University Fest | CGC University, Mohali",
    template: "%s | Saviskar 2026 — Aevorian Reverie | CGC University, Mohali",
  },
  description:
    "Official portal for Saviskar 2026: Aevorian Reverie — Where Tomorrow Dreams Awake. North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali. 50+ competitive realms, ₹25L+ prize pool, national hackathons, RoboWars, cultural battlefields, and headline Star Night concerts.",
  keywords: [
    "Saviskar 2026",
    "Saviskar",
    "Savishkar",
    "Savishkar 2026",
    "Saviskar CGC",
    "Saviskar Fest",
    "Saviskar CGC University",
    "Aevorian Reverie",
    "Where Tomorrow Dreams Awake",
    "A future imagined so vividly it begins to exist",
    "Srijan",
    "Avishkar",
    "CGC University Mohali",
    "CGC Mohali fest",
    "CGC Landran fest",
    "Chandigarh Group of Colleges annual fest",
    "Annual National University Festival",
    "North India biggest university fest",
    "Techno-Cultural Fest 2026",
    "Punjab college fest 2026",
    "Chandigarh college fest 2026",
    "Engineering college fest North India",
    "Star Night CGC University",
    "Celebrity Star Night Mohali",
    "National Hackathons 2026",
    "Combat Robotics arena Punjab",
    "RoboWars CGC Mohali",
    "AIvishkar AI Tech Expo",
    "Battle of the Bands Punjab",
    "Inter-University Competitions",
    "College Fest Registrations 2026",
    "Festival Prize Pool 25 Lakhs",
    "Student Advisory Council CGC",
    "Department of Student Affairs CGC",
  ],
  authors: [
    { name: "CGC University, Mohali", url: "https://cgcuniversity.in" },
    { name: "Team DSA & SAC", url: "https://saviskar.co.in/team" },
  ],
  creator: "CGC University, Mohali",
  publisher: "CGC University, Mohali",
  category: "University Festival & National Competitions",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/saviskar-logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/images/saviskar-logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
    },
  },
  openGraph: {
    title: "Saviskar 2026: Aevorian Reverie | CGC University, Mohali",
    description:
      "Where Tomorrow Dreams Awake. North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali. 50+ Realms, 500+ Colleges, 35,000+ Participants, ₹25L+ Prize Pool.",
    url: "https://saviskar.co.in",
    siteName: "Saviskar 2026 — Aevorian Reverie",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/concert-stadium.webp",
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
      "Where Tomorrow Dreams Awake. North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali. 50+ Realms, ₹25L+ Prize Pool.",
    images: ["/images/concert-stadium.webp"],
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

// Rich Structured Data (JSON-LD) Schemas
const jsonLdFestival = {
  "@context": "https://schema.org",
  "@type": "Festival",
  "@id": "https://saviskar.co.in/#festival",
  name: "Saviskar 2026: Aevorian Reverie",
  alternateName: [
    "Saviskar 2026",
    "Saviskar",
    "Savishkar 2026",
    "Savishkar",
    "Aevorian Reverie",
    "Saviskar Fest",
    "CGC University Fest",
    "CGC Mohali Fest",
  ],
  description:
    "Where Tomorrow Dreams Awake. North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali. Featuring 50+ competitive realms across technology, cultural arts, national hackathons, combat robotics, and headline Star Night concerts.",
  url: "https://saviskar.co.in",
  image: [
    "https://saviskar.co.in/images/concert-stadium.webp",
    "https://saviskar.co.in/images/saviskar-logo.png",
  ],
  startDate: "2026-10-28T09:00:00+05:30",
  endDate: "2026-10-29T23:59:59+05:30",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "CGC University, Mohali",
    address: {
      "@type": "PostalAddress",
      streetAddress: "State Highway 12A, Chandigarh-Sirhind Road",
      addressLocality: "Sahibzada Ajit Singh Nagar",
      addressRegion: "Punjab",
      postalCode: "140307",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 30.6942,
      longitude: 76.6653,
    },
  },
  organizer: {
    "@type": "CollegeOrUniversity",
    name: "CGC University, Mohali",
    url: "https://cgcuniversity.in",
    sameAs: [
      "https://www.instagram.com/saviskar_cgc/",
      "https://cgcuniversity.in",
    ],
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "INR",
    lowPrice: "0",
    highPrice: "1500",
    offerCount: "50+",
    url: "https://saviskar.co.in/events",
    availability: "https://schema.org/InStock",
    validFrom: "2026-09-01T00:00:00+05:30",
  },
  subEvent: [
    {
      "@type": "Event",
      name: "Technical Realm (Hackathons & RoboWars)",
      description:
        "National coding hackathons, autonomous and combat robotics arenas, web3 and AI challenges with ₹5L+ prize pool.",
      url: "https://saviskar.co.in/events/technical",
    },
    {
      "@type": "Event",
      name: "Cultural Realm (Music, Dance & Fashion)",
      description:
        "Battle of the Bands, mega group choreography, runway fashion show, and street theater with ₹5L+ prize pool.",
      url: "https://saviskar.co.in/events/cultural",
    },
    {
      "@type": "Event",
      name: "AIvishkar: Flagship AI Tech Expo",
      description:
        "India's premier student AI innovation showcase, startup angel pitches, and venture grant competitions.",
      url: "https://saviskar.co.in/events/aivishkar",
    },
    {
      "@type": "Event",
      name: "Non-Technical & Gaming Realm",
      description:
        "National Esports arenas (BGMI, Valorant, FIFA), financial trading simulations, and youth parliament with ₹4L+ prize pool.",
      url: "https://saviskar.co.in/events/non-technical",
    },
    {
      "@type": "MusicEvent",
      name: "Star Night Stadium Concerts",
      description:
        "Celebrity headline artists, stadium laser lights, and 35,000+ voices singing under the night sky at CGC University, Mohali.",
      url: "https://saviskar.co.in/starnight",
    },
  ],
};

const jsonLdUniversity = {
  "@context": "https://schema.org",
  "@type": "CollegeOrUniversity",
  "@id": "https://cgcuniversity.in/#university",
  name: "CGC University, Mohali",
  alternateName: [
    "Chandigarh Group of Colleges University, Mohali",
    "CGC Mohali",
    "CGC Landran",
  ],
  url: "https://cgcuniversity.in",
  logo: "https://saviskar.co.in/images/saviskar-logo.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "State Highway 12A, Chandigarh-Sirhind Road",
    addressLocality: "Sahibzada Ajit Singh Nagar",
    addressRegion: "Punjab",
    postalCode: "140307",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "saviskar@cgcuniversity.in",
    contactType: "Student Affairs & Festival Secretariat",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi", "Punjabi"],
  },
  sameAs: [
    "https://www.instagram.com/saviskar_cgc/",
    "https://cgcuniversity.in",
  ],
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://saviskar.co.in/#website",
  url: "https://saviskar.co.in",
  name: "Saviskar 2026: Aevorian Reverie",
  alternateName: ["Saviskar", "Savishkar 2026", "Aevorian Reverie", "CGC Fest"],
  description:
    "Official Web Portal for Saviskar 2026: Annual National Techno-Cultural University Festival at CGC University, Mohali.",
  inLanguage: "en-IN",
  publisher: {
    "@id": "https://cgcuniversity.in/#university",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://saviskar.co.in/events?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFestival) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdUniversity) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className="min-h-full w-full max-w-[100vw] overflow-x-clip flex flex-col bg-black text-white selection:bg-white selection:text-black">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-xl focus:ring-2 focus:ring-white focus:outline-none"
        >
          Skip to main content
        </a>
        <SmoothScrollProvider>
          <div id="main-content" className="flex min-h-full flex-1 flex-col">
            {children}
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
