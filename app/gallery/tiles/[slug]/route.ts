import { NextRequest, NextResponse } from "next/server";
import { GLIMPSE_175_UNIQUE_TILES } from "@/data/gdriveManifest";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Extract tile number e.g. "tile_042.jpg" -> 42
  const match = slug.match(/tile_(\d+)/);
  const index = match ? parseInt(match[1], 10) - 1 : 0;

  // Select external Google Drive image: each tile from 1 to 175 is 100% unique (strictly 0 repeats)
  const safeIndex = Math.max(0, Math.min(index, GLIMPSE_175_UNIQUE_TILES.length - 1));
  const item = GLIMPSE_175_UNIQUE_TILES[safeIndex];

  // Redirect directly to Google Drive CDN (eliminating local server proxying)
  const targetUrl = item.thumbnailSrc || item.src;
  return NextResponse.redirect(targetUrl, {
    status: 308,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

