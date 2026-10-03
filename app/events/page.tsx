import type { Metadata } from "next";
import EventsView from "@/components/events/EventsView";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "50+ Events & Realms (₹25 LACS Prize Pool) | CGC Saviskar 2026 — CGC University Mohali",
  description:
    "Explore 50+ national collegiate competitions across 500+ universities with endless possibilities at CGC University Mohali for Saviskar 2026: Aevorian Reverie. Cash prizes upto ₹25 LACS across Technical, Cultural, Non-Technical, and AIvishkar realms. Two Days. Countless Stories. One Campus. Infinite Ways To Make Your Mark.",
  keywords: [
    // Brand & College Queries
    "CGC Fest Events",
    "CGC University Competitions",
    "CGC Mohali Fest 2026",
    "CGC Landran Fest Events",
    "Saviskar 2026 Events",
    "Saviskar Competitions",
    "Savishkar Competitions",
    "Aevorian Reverie Events",
    "Aevorian Reviere Competitions",
    "Chandigarh College Fests",
    "Punjab Inter-College Competitions",
    "Tricity College Fests 2026",
    "Saviskar Prize Pool 25 Lakhs",
    "Cash Prizes Upto 25 Lacs",
    "500+ Universities",
    "Endless Possibilities",

    // Technical Events
    "RoboWars",
    "Combat RoboWars 15kg 30kg",
    "RoboWars CGC Mohali",
    "RoboWars Punjab",
    "Nitro Circuit RoboRace",
    "CodePulse 24h Hackathon",
    "National Hackathon Punjab",
    "Hackathon CGC Mohali",
    "Web3 and AI Hackathon",
    "Autonomous Robotics Challenge",
    "Circuitron Electronics Challenge",
    "CAD Quest Engineering Contest",

    // Cultural Events
    "Symphony of Chaos Battle of the Bands",
    "Battle of the Bands Punjab",
    "Vibrato Music Band Contest",
    "Footloose Western Dance",
    "Choreonite Dance Showcase",
    "Nachda Punjab Bhangra Giddha Championship",
    "Punjabi Folk Dance Competition",
    "Runway of the Future Fashion Show",
    "Inter-College Fashion Pageant Mohali",
    "Street Beat Nukkad Natak",
    "Mono Acting Drama Competition",
    "Mr & Ms Saviskar 2026",

    // AI & Non-Technical Events
    "AIvishkar AI Tech Expo",
    "Humanoid Robotics Expo",
    "Founders Arena Angel Pitch",
    "Startup Venture Grants CGC",
    "Saviskar E-Clash Valorant 5v5",
    "BGMI Mobile Championship",
    "FIFA LAN Gaming Cup",
    "The Chakravyuh General Quiz",
    "Youth Parliament CGC",
    "IPL Mock Auction",
    "Stock Market Simulation",
  ],
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "50+ Events & Realms (₹25 LACS Prize Pool) | CGC Saviskar 2026",
    description:
      "50+ competitions across 500+ universities with endless possibilities at CGC University, Mohali. Technical, Cultural, Non-Technical, and AIvishkar with cash prizes upto ₹25 LACS.",
    images: ["/images/realms-page-bg.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "50+ Events & Realms (₹25 LACS Prize Pool) | CGC Saviskar 2026",
    description:
      "50+ competitions across 500+ universities with endless possibilities at CGC University, Mohali. Technical, Cultural, Non-Technical, and AIvishkar with cash prizes upto ₹25 LACS.",
    images: ["/images/realms-page-bg.webp"],
  },
};

const jsonLdEventsList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Metal Mayhem — Combat RoboWars (15kg & 30kg Category)",
      description: "Heavy armor combat battlebots in bulletproof polycarbonate arena at CGC Block 2.",
      url: "https://saviskar.co.in/events/technical",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "CodePulse 24-Hour National Hackathon",
      description: "24-hour overnight code sprint evaluated by Google & Microsoft engineering leads.",
      url: "https://saviskar.co.in/events/technical",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Nitro Circuit — High-Speed RoboRace",
      description: "High-speed custom rover racing through hairpin ramps and sand hazards.",
      url: "https://saviskar.co.in/events/technical",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Symphony of Chaos — Battle of the Bands",
      description: "Live collegiate rock and indie bands battle on the concert soundstage.",
      url: "https://saviskar.co.in/events/cultural",
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Footloose — Western & Thematic Group Dance Showcase",
      description: "Synchronized hip-hop and contemporary dance crews under concert lighting.",
      url: "https://saviskar.co.in/events/cultural",
    },
    {
      "@type": "ListItem",
      position: 6,
      name: "Nachda Punjab — Bhangra & Giddha Championship",
      description: "Authentic high-energy Punjabi folk dance championship on the amphitheater stage.",
      url: "https://saviskar.co.in/events/cultural",
    },
    {
      "@type": "ListItem",
      position: 7,
      name: "Runway of the Future — Haute Couture Fashion Show",
      description: "Futuristic avant-garde fashion walk judged by industry style designers.",
      url: "https://saviskar.co.in/events/cultural",
    },
    {
      "@type": "ListItem",
      position: 8,
      name: "AIvishkar: Flagship AI Tech Expo & Humanoid Robotics",
      description: "Autonomous humanoid robotics, computer vision demos, and startup venture grants.",
      url: "https://saviskar.co.in/events/aivishkar",
    },
    {
      "@type": "ListItem",
      position: 9,
      name: "Saviskar E-Clash: Valorant 5v5 Championship",
      description: "240Hz esports tournament with live caster commentary at Block 3 LAN Arena.",
      url: "https://saviskar.co.in/events/non-technical",
    },
    {
      "@type": "ListItem",
      position: 10,
      name: "BGMI Mobile Battlegrounds National Tournament",
      description: "Battlegrounds Mobile India inter-university squad showdown.",
      url: "https://saviskar.co.in/events/non-technical",
    },
    {
      "@type": "ListItem",
      position: 11,
      name: "The Chakravyuh — National General Quiz",
      description: "Inter-collegiate quiz covering geopolitics, history, pop culture, and sci-fi.",
      url: "https://saviskar.co.in/events/non-technical",
    },
    {
      "@type": "ListItem",
      position: 12,
      name: "Founders Arena — Angel Pitch & Startup Venture Conclave",
      description: "Early-stage collegiate founders pitching to angels and venture funds.",
      url: "https://saviskar.co.in/events/technical",
    },
  ],
};

export default function EventsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEventsList) }}
      />
      <EventsView />
    </>
  );
}