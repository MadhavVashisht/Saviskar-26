/**
 * Utility library for parsing, resolving, and formatting Google Drive images
 * into high-speed Google CDN URLs (lh3.googleusercontent.com/d/{id}=w{width})
 * with zero bandwidth overhead and native Next.js Image caching.
 */

export interface ParsedDriveTarget {
  type: "folder" | "file";
  id: string;
}

/**
 * Extracts Google Drive File ID or Folder ID from various sharing URL patterns.
 */
export function parseGoogleDriveUrl(urlOrId: string): ParsedDriveTarget | null {
  if (!urlOrId || typeof urlOrId !== "string") return null;

  const trimmed = urlOrId.trim();

  // If it's already a clean alphanum/hyphen/underscore ID without slashes
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return { type: "file", id: trimmed };
  }

  // Folder patterns: /drive/folders/{folderId} or ?id={folderId}&usp=drive_web
  const folderMatch = trimmed.match(/\/drive\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) {
    return { type: "folder", id: folderMatch[1] };
  }

  // File patterns: /file/d/{fileId}/... or /d/{fileId}
  const fileMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return { type: "file", id: fileMatch[1] };
  }

  // Query parameter patterns: ?id={id}
  const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryMatch) {
    // If url contains "folders", treat as folder
    const isFolder = trimmed.includes("folders");
    return { type: isFolder ? "folder" : "file", id: queryMatch[1] };
  }

  return null;
}

/**
 * Converts a Google Drive File ID into an edge CDN image URL.
 * Google's lh3.googleusercontent.com CDN is drastically faster than drive.google.com/uc
 * and supports custom dimension downscaling (e.g. =w1600, =w800, =w400).
 */
export function getDriveDirectImageUrl(fileId: string, width = 1600): string {
  if (!fileId) return "";
  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
}

/**
 * High-speed fallback festival images (using preserved backgrounds & campus scenes)
 * to ensure that galleries render smoothly even before the user inputs their Google Drive link.
 */
export const FALLBACK_GALLERY_IMAGES = [
  {
    id: "fb-1",
    src: "/images/concert-stadium.webp",
    title: "Stadium Illuminations & 25,000+ Voices",
    category: "Main Stage" as const,
    description: "Aerial perspective of the CGC University main amphitheatre bathed in concert lasers and golden pyrotechnics.",
    aspectRatio: "landscape" as const,
    featured: true,
  },
  {
    id: "fb-2",
    src: "/images/scene-realms-stage.webp",
    title: "Festival Sky Blossom",
    category: "Main Stage" as const,
    description: "Vibrant magenta and violet pyrotechnics illuminating the main campus festival quadrangle.",
    aspectRatio: "landscape" as const,
    featured: true,
  },
  {
    id: "fb-3",
    src: "/images/realm-technical-v2.webp",
    title: "Nexus Hackathon & Robotics Proving Ground",
    category: "Technical & AI" as const,
    description: "Innovators engineering autonomous hardware systems and full-stack AI solutions at Saviskar.",
    aspectRatio: "landscape" as const,
    featured: true,
  },
  {
    id: "fb-4",
    src: "/images/realm-cultural-v2.webp",
    title: "Choreography & Theatrical Splendour",
    category: "Culture & Arts" as const,
    description: "Spectacular stage choreography, traditional rhythm spectacles, and classical musical performances.",
    aspectRatio: "landscape" as const,
    featured: false,
  },
  {
    id: "fb-5",
    src: "/images/realm-sports.webp",
    title: "Inter-University National Sports Arena",
    category: "Sports" as const,
    description: "High-octane athletics, track & field events, and inter-collegiate tournament matches across campus.",
    aspectRatio: "landscape" as const,
    featured: false,
  },
  {
    id: "fb-6",
    src: "/images/scene-starnight-show.webp",
    title: "Concert Laser Canopy",
    category: "Main Stage" as const,
    description: "Cutting-edge moving head lighting rigs and arena concert soundscapes at CGC University.",
    aspectRatio: "wide" as const,
    featured: true,
  },
  {
    id: "fb-7",
    src: "/images/realm-nontech-v2.webp",
    title: "Literary & Managerial Showcases",
    category: "Showcases" as const,
    description: "Business pitch battles, debate summits, and creative writing arenas bringing forth national talent.",
    aspectRatio: "landscape" as const,
    featured: false,
  },
  {
    id: "fb-8",
    src: "/images/realm-aivishkar-ai.webp",
    title: "AI Vishkar // Autonomous Intelligence",
    category: "Technical & AI" as const,
    description: "Deep learning models and generative AI showcases engineered by competitive collegiate developers.",
    aspectRatio: "landscape" as const,
    featured: false,
  },
  {
    id: "fb-9",
    src: "/images/firework-launch.webp",
    title: "Pyrotechnic Launch Sequence",
    category: "Main Stage" as const,
    description: "Grand midnight fireworks ascension marking the culmination of competitive realms.",
    aspectRatio: "portrait" as const,
    featured: true,
  },
  {
    id: "fb-10",
    src: "/images/hero.webp",
    title: "Saviskar Festival Welcome Gates",
    category: "Campus" as const,
    description: "Students and delegates arriving at CGC University Mohali for North India's benchmark youth fest.",
    aspectRatio: "landscape" as const,
    featured: false,
  },
  {
    id: "fb-11",
    src: "/images/concert-mission-centerstage.webp",
    title: "Centerstage Vocal Anthems",
    category: "Main Stage" as const,
    description: "Live vocalists commanding the stadium stage under an ocean of audience phone lights.",
    aspectRatio: "landscape" as const,
    featured: false,
  },
  {
    id: "fb-12",
    src: "/images/scene-finale-celebration.webp",
    title: "Aevorian Reverie Grand Finale",
    category: "Main Stage" as const,
    description: "Golden cascade finale celebrating the winning delegations across all 50+ realms.",
    aspectRatio: "wide" as const,
    featured: true,
  },
];
