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

  // Stream high-definition JPEG from Google Drive directly (s800 delivers crisp retina resolution without Safari memory crash)
  const driveUrl = `https://lh3.googleusercontent.com/d/${item.fileId}=s800`;

  try {
    const upstreamRes = await fetch(driveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
    });

    if (upstreamRes.ok) {
      const buffer = await upstreamRes.arrayBuffer();
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": upstreamRes.headers.get("content-type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        },
      });
    }

    // Direct fallback if resized URL fails
    const rawRes = await fetch(item.src);
    const rawBuffer = await rawRes.arrayBuffer();
    return new Response(rawBuffer, {
      status: 200,
      headers: {
        "Content-Type": rawRes.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to stream Google Drive tile:", item.fileId, error);
    // Direct redirect as ultimate fallback
    return NextResponse.redirect(item.src, { status: 302 });
  }
}

