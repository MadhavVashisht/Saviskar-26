import { NextRequest, NextResponse } from "next/server";
import { GDRIVE_GALLERY_CONFIG } from "@/data/galleryConfig";
import { parseGoogleDriveUrl, getDriveDirectImageUrl } from "@/lib/googleDrive";

// In-memory cache for resolved Glimpse Gallery file IDs
let cachedGlimpseFileIds: string[] | null = null;
let lastGlimpseFetchTime = 0;

const FALLBACK_TILES = [
  "/images/concert-stadium.webp",
  "/images/scene-realms-stage.webp",
  "/images/scene-starnight-show.webp",
  "/images/realm-technical-v2.webp",
  "/images/realm-cultural-v2.webp",
  "/images/realm-sports.webp",
  "/images/hero.webp",
  "/images/firework-launch.webp",
  "/images/scene-finale-celebration.webp",
  "/images/realm-nontech-v2.webp",
  "/images/realm-aivishkar-ai.webp",
  "/images/concert-mission-centerstage.webp",
];

async function getGlimpseFileIds(): Promise<string[]> {
  const now = Date.now();
  if (cachedGlimpseFileIds && now - lastGlimpseFetchTime < 3600000) {
    return cachedGlimpseFileIds;
  }

  const url = GDRIVE_GALLERY_CONFIG.glimpseGalleryDriveUrl;
  const parsed = parseGoogleDriveUrl(url);

  if (parsed && parsed.type === "folder") {
    try {
      const embeddedUrl = `https://drive.google.com/embeddedfolderview?id=${parsed.id}#grid`;
      const res = await fetch(embeddedUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (res.ok) {
        const html = await res.text();
        const idSet = new Set<string>();
        const patterns = [
          /https:\/\/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{25,50})/g,
          /\/file\/d\/([a-zA-Z0-9_-]{25,50})/g,
          /data-id="([a-zA-Z0-9_-]{25,50})"/g,
        ];

        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            if (match[1] && match[1] !== parsed.id) {
              idSet.add(match[1]);
            }
          }
        }

        const ids = Array.from(idSet);
        if (ids.length > 0) {
          cachedGlimpseFileIds = ids;
          lastGlimpseFetchTime = now;
          return ids;
        }
      }
    } catch (e) {
      console.error("Glimpse tile resolver error:", e);
    }
  }

  return [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Extract tile number e.g. "tile_042.jpg" -> 42
  const match = slug.match(/tile_(\d+)/);
  const index = match ? parseInt(match[1], 10) - 1 : 0;

  const fileIds = await getGlimpseFileIds();

  let targetUrl: string;

  if (fileIds.length > 0) {
    const fileId = fileIds[index % fileIds.length];
    // Use w400 for high-density 3D sphere tiles (fastest load, minimal bandwidth)
    targetUrl = getDriveDirectImageUrl(fileId, 400);
  } else {
    // Fallback to preserved local background images
    targetUrl = FALLBACK_TILES[index % FALLBACK_TILES.length];
  }

  return NextResponse.redirect(new URL(targetUrl, request.url), {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
