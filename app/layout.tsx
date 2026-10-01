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
    default: "Saviskar 2026 | CGC University Mohali Fest — Aevorian Reverie | Official Portal",
    template: "%s | Saviskar 2026 (CGC Fest) — Aevorian Reverie | CGC University, Mohali",
  },
  description:
    "Official portal for Saviskar 2026: Aevorian Reverie — Where Tomorrow Dreams Awake. North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali (CGC). 50+ competitive realms, ₹25L+ prize pool, national hackathons, RoboWars, cultural battlefields, and headline Star Night concerts.",
  keywords: [
    // Primary Brand & Common Misspellings / Phonetic Variations
    "Saviskar 2026",
    "Saviskar",
    "Savishkar",
    "Savishkar 2026",
    "Sawiskar",
    "Sawishkar",
    "Saviskar '26",
    "Saviskar26",
    "Savishkar26",
    "Saviskar-26",
    "Saviskar Fest",
    "Savishkar Fest",

    // Theme, Meaning, Etymology & Common Theme Misspellings
    "Aevorian Reverie",
    "Aevorian Reviere",
    "Aevorian Revire",
    "Aevorian Revrie",
    "Aevorian Reveire",
    "Evorian Reverie",
    "Aeovorian Reverie",
    "Aevorian Reverie meaning",
    "Aevorian Reverie theme",
    "Where Tomorrow Dreams Awake",
    "A future imagined so vividly it begins to exist",
    "Saviskar theme meaning",
    "Saviskar etymology",
    "Srijan",
    "Avishkar",

    // CGC / University Specific High-Traffic Queries
    "CGC",
    "CGC Fest",
    "CGC Fest 2026",
    "CGC University",
    "CGC University Fest",
    "CGC Mohali",
    "CGC Mohali fest",
    "CGC Landran",
    "CGC Landran fest",
    "CGC Chandigarh",
    "Chandigarh Group of Colleges",
    "Chandigarh Group of Colleges annual fest",
    "CGC Saviskar",
    "Saviskar CGC",
    "CGC Annual Fest",
    "CGC Tech Fest",
    "CGC Cultural Fest",
    "CGC Star Night",
    "CGC Hackathon",
    "CGC Events",
    "CGC Campus",
    "CGC University Mohali Fest 2026",

    // Regional & College Fest Queries
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
    title: "Saviskar 2026: Aevorian Reverie | CGC University, Mohali (CGC Fest)",
    description:
      "Where Tomorrow Dreams Awake. North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali. 50+ Realms, 500+ Colleges, 35,000+ Participants, ₹25L+ Prize Pool.",
    url: "https://saviskar.co.in",
    siteName: "Saviskar 2026 — CGC University",
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
    title: "Saviskar 2026: Aevorian Reverie | CGC University, Mohali (CGC Fest)",
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

// 1. Festival / Event Schema (With Typos & Alternate Names)
const jsonLdFestival = {
  "@context": "https://schema.org",
  "@type": "Festival",
  "@id": "https://saviskar.co.in/#festival",
  name: "Saviskar 2026: Aevorian Reverie",
  alternateName: [
    "Saviskar 2026",
    "Saviskar",
    "Savishkar",
    "Savishkar 2026",
    "Sawiskar",
    "Sawishkar",
    "Saviskar '26",
    "Saviskar26",
    "Saviskar-26",
    "Saviskar Fest",
    "Savishkar Fest",
    "Aevorian Reverie",
    "Aevorian Reviere",
    "Aevorian Revire",
    "Aevorian Revrie",
    "Where Tomorrow Dreams Awake",
    "CGC Fest",
    "CGC Fest 2026",
    "CGC University Fest",
    "CGC Mohali Fest",
    "CGC Landran Fest",
    "CGC Annual Fest",
    "CGC Tech Fest",
    "CGC Cultural Fest",
    "CGC Star Night",
    "CGC Saviskar",
    "Saviskar CGC",
  ],
  description:
    "Where Tomorrow Dreams Awake. North India's flagship Annual National Techno-Cultural University Festival at CGC University, Mohali (CGC). A future imagined so vividly, it begins to exist. Featuring 50+ competitive realms across technology, cultural arts, national hackathons, combat robotics, and headline Star Night concerts.",
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
    alternateName: ["CGC", "CGC Mohali", "CGC Landran", "Chandigarh Group of Colleges"],
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
    alternateName: ["CGC", "CGC Mohali", "CGC Landran", "Chandigarh Group of Colleges"],
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

// 2. Definitive Institutional University Entity (Dominate "CGC" Searches)
const jsonLdUniversity = {
  "@context": "https://schema.org",
  "@type": "CollegeOrUniversity",
  "@id": "https://cgcuniversity.in/#cgc-university",
  name: "CGC University, Mohali",
  alternateName: [
    "CGC",
    "CGC University",
    "CGC Mohali",
    "CGC Landran",
    "CGC Chandigarh",
    "Chandigarh Group of Colleges",
    "Chandigarh Group of Colleges University, Mohali",
    "CGC Campus",
    "CGC Fest Host",
  ],
  disambiguatingDescription:
    "CGC (Chandigarh Group of Colleges / CGC University, Mohali) is a leading higher education institution in North India, host of the annual national techno-cultural university fest Saviskar 2026: Aevorian Reverie.",
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

// 3. DefinedTerm Schema: Aevorian Reverie (Theme Meaning & Typo Disambiguation)
const jsonLdDefinedTermTheme = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "@id": "https://saviskar.co.in/#aevorian-reverie",
  name: "Aevorian Reverie",
  alternateName: [
    "Aevorian Reviere",
    "Aevorian Revire",
    "Aevorian Revrie",
    "Aevorian Reveire",
    "Evorian Reverie",
    "Aeovorian Reverie",
    "Where Tomorrow Dreams Awake",
    "A future imagined so vividly it begins to exist",
  ],
  termCode: "AEVORIAN-REVERIE",
  description:
    "The official conceptual theme of Saviskar 2026 at CGC University, Mohali. Philosophy: 'A future imagined so vividly, it begins to exist.' Etymology: 'Aevorian' evokes aeon (eternity, timeless endurance) and aurora (a new dawn of luminous intelligence). 'Reverie' signifies a state of waking dream where bold human imagination crosses into physical reality. For Saviskar's third edition, it manifests as a dream core orbiting through luminous intelligence, uniting human creativity, AI, art, and technology in one dreamscape under the banner 'Where Tomorrow Dreams Awake'.",
  inDefinedTermSet: {
    "@type": "DefinedTermSet",
    name: "Saviskar Conceptual Lexicon",
    url: "https://saviskar.co.in",
  },
};

// 4. FAQPage Schema: Google AI Overviews & Featured Snippets Accelerator
const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the meaning and story behind Aevorian Reverie (or Aevorian Reviere)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Aevorian Reverie is the official conceptual theme of Saviskar 2026, North India's premier annual national techno-cultural festival hosted at CGC University, Mohali. Its guiding philosophy is 'A future imagined so vividly, it begins to exist.' Etymologically, 'Aevorian' evokes aeon (eternity, timeless endurance) and aurora (a luminous new dawn of intelligence). 'Reverie' is a state of waking dream where visionary human imagination crosses into physical reality. For Saviskar's 3rd landmark edition, it represents a world where every cycle births a more evolved reality—unifying human creativity, artificial intelligence, artistic expression, and advanced engineering into one transcendent dreamscape under the motto 'Where Tomorrow Dreams Awake'.",
      },
    },
    {
      "@type": "Question",
      name: "How is Saviskar spelled, and is it Saviskar or Savishkar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The official name of the festival is Saviskar (also written as Saviskar 2026 or Saviskar '26), commonly searched and phonetically written as Savishkar or Sawiskar. The name is historically derived from the fusion of 'Srijan' (creation) and 'Avishkar' (invention), celebrating the spirit of collegiate innovation, technology, and culture at CGC University, Mohali.",
      },
    },
    {
      "@type": "Question",
      name: "What is CGC's annual fest and how is CGC University connected to Saviskar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Saviskar is the official, flagship Annual National Techno-Cultural University Festival of CGC (CGC University, Mohali / Chandigarh Group of Colleges / CGC Landran). Held annually across CGC's sprawling Mohali campus on State Highway 12A, Saviskar is organized by Team DSA (Department of Student Affairs) and the Student Advisory Council (SAC), welcoming 35,000+ student delegates from 500+ colleges across India.",
      },
    },
    {
      "@type": "Question",
      name: "What are the competitive realms and prize pool at CGC Saviskar 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CGC Saviskar 2026 features an overall ₹25,00,000+ (25 Lakhs+) prize pool spanning 50+ national competitions across 4 signature realms: 1. Technical Realm (Hackathons, Combat Robotics RoboWars, Web3, AI challenges with ₹5L+ prizes); 2. Cultural Realm (Battle of the Bands, Group Dance Choreonite, Fashion Show, Drama with ₹5L+ prizes); 3. AIvishkar (Flagship AI Tech Expo & Startup Venture Grants); 4. Non-Technical Realm (Esports tournaments including BGMI, Valorant, FIFA, Strategy, and Youth Parliament with ₹4L+ prizes); plus stadium-scale Star Night celebrity concerts.",
      },
    },
    {
      "@type": "Question",
      name: "When and where is Saviskar 2026 held?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Saviskar 2026 takes place on October 28 and October 29, 2026 at CGC University, Mohali, located on State Highway 12A, Chandigarh-Sirhind Road, Sahibzada Ajit Singh Nagar, Punjab 140307, India. Official helpdesk contact: saviskar@cgcuniversity.in.",
      },
    },
  ],
};

// 5. WebSite Schema with SearchAction
const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://saviskar.co.in/#website",
  url: "https://saviskar.co.in",
  name: "Saviskar 2026: Aevorian Reverie | CGC Fest",
  alternateName: ["Saviskar", "Savishkar 2026", "Aevorian Reverie", "CGC Fest", "CGC University Fest"],
  description:
    "Official Web Portal for Saviskar 2026: Annual National Techno-Cultural University Festival at CGC University, Mohali (CGC).",
  inLanguage: "en-IN",
  publisher: {
    "@id": "https://cgcuniversity.in/#cgc-university",
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdDefinedTermTheme) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
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

        {/* Semantic Knowledge Graph & Search Accessibility Block for Web Crawlers, AI Assistants & Assistive Devices */}
        <section
          aria-label="Saviskar 2026 Festival Overview and CGC Entity Index"
          className="sr-only"
        >
          <h1>Saviskar 2026: Aevorian Reverie — Official Portal of CGC University, Mohali</h1>
          <p>
            Saviskar 2026 (also commonly written and searched as Savishkar, Sawiskar, or Saviskar &apos;26) is the premier Annual National Techno-Cultural University Festival organized by CGC (CGC University, Mohali / Chandigarh Group of Colleges / CGC Landran).
          </p>

          <h2>Theme Meaning &amp; Origin: Aevorian Reverie (Aevorian Reviere)</h2>
          <p>
            The official festival theme is <strong>Aevorian Reverie</strong> (commonly searched with phonetic spellings such as <em>aevorian reviere</em>, <em>aevorian revire</em>, <em>evorian reverie</em>, or <em>where tomorrow dreams awake</em>). The guiding philosophy of the theme is: &ldquo;A future imagined so vividly, it begins to exist.&rdquo;
          </p>
          <p>
            Etymology &amp; Concept: <strong>Aevorian</strong> blends <em>aeon</em> (eternity, boundless time, and enduring legacy) with <em>aurora</em> (a luminous new dawn of human and artificial intelligence). <strong>Reverie</strong> represents a state of waking dream where visionary creative imagination transforms into physical reality. For Saviskar&apos;s 3rd landmark edition, it manifests as a dream core orbiting through luminous intelligence, uniting human creativity, artificial intelligence (AI), music, stage arts, combat robotics, and engineering into one transcendent dreamscape.
          </p>
          <p>
            The festival name <strong>Saviskar</strong> originates from the linguistic fusion of <em>Srijan</em> (creation) and <em>Avishkar</em> (invention).
          </p>

          <h2>CGC University, Mohali (CGC Fest 2026)</h2>
          <p>
            Hosted by CGC University Mohali across State Highway 12A, Chandigarh-Sirhind Road, Punjab 140307. Organized by the Department of Student Affairs (Team DSA) and the Student Advisory Council (SAC). Welcoming 35,000+ student attendees from 500+ colleges across India.
          </p>

          <h2>Competitive Realms &amp; ₹25 Lakhs+ Prize Pool</h2>
          <ul>
            <li><strong>Technical Realm:</strong> National Hackathons, Combat Robotics (RoboWars), Web3, AI challenges with ₹5,00,000+ prize pool.</li>
            <li><strong>Cultural Realm:</strong> Battle of the Bands, Mega Choreography, Runway Fashion Show, Drama with ₹5,00,000+ prize pool.</li>
            <li><strong>AIvishkar:</strong> Flagship AI Tech Expo, Innovation Grants, Angel Pitches.</li>
            <li><strong>Non-Technical Realm:</strong> Esports (BGMI, Valorant, FIFA), Business Management, Youth Parliament with ₹4,00,000+ prize pool.</li>
            <li><strong>Star Night:</strong> Stadium celebrity concerts, laser pyrotechnics, and 35,000+ voices singing under the night sky.</li>
          </ul>

          <p>Dates: October 28 &ndash; October 29, 2026. Official Helpdesk Email: saviskar@cgcuniversity.in.</p>
        </section>

        <SmoothScrollProvider>
          <div id="main-content" className="flex min-h-full flex-1 flex-col">
            {children}
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
