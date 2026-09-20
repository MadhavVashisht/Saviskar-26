import type { Metadata } from "next";

export const revalidate = 300;

const CATEGORY_META: Record<
  string,
  { title: string; description: string; ogImage: string }
> = {
  technical: {
    title: "Technical Realm — Hackathons, Robotics & Coding",
    description:
      "Compete in hackathons, RoboWars, algorithmic challenges, and innovative engineering events at Saviskar 2026.",
    ogImage: "/images/realm-technical-v2.webp",
  },
  "non-technical": {
    title: "Non-Technical Realm — Design, Strategy & Expression",
    description:
      "Showcase strategy, debates, media, digital arts, and business simulations at Saviskar 2026.",
    ogImage: "/images/realm-nontech-v2.webp",
  },
  cultural: {
    title: "Cultural Realm — Music, Dance & Theatre Mainstage",
    description:
      "Battle on the national cultural mainstage in dance choreography, vocal music, drama, and fine arts at Saviskar 2026.",
    ogImage: "/images/realm-cultural-v2.webp",
  },
  aivishkar: {
    title: "AIvishkar — National AI Tech Exposition & Venture Grants",
    description:
      "Flagship National AI Exposition featuring autonomous humanoid robotics, neural agent showcases, and venture grants.",
    ogImage: "/images/realm-aivishkar-ai.webp",
  },
  avishkar: {
    title: "AIvishkar — National AI Tech Exposition & Venture Grants",
    description:
      "Flagship National AI Exposition featuring autonomous humanoid robotics, neural agent showcases, and venture grants.",
    ogImage: "/images/realm-aivishkar-ai.webp",
  },
  sports: {
    title: "Sports Realm — National Inter-University Championships",
    description:
      "High-octane sports tournaments, athletics, esports, and arena championships at Saviskar 2026.",
    ogImage: "/images/realm-sports.webp",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORY_META[category] || {
    title: `${category.toUpperCase()} Realm`,
    description: `Explore competitive events and schedules in the ${category} realm at Saviskar 2026.`,
    ogImage: "/images/realms-page-bg.webp",
  };

  return {
    title: `${meta.title} | Saviskar 2026`,
    description: meta.description,
    openGraph: {
      title: `${meta.title} | Saviskar 2026`,
      description: meta.description,
      images: [meta.ogImage],
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
