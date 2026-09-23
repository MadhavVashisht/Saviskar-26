import { NextRequest, NextResponse } from "next/server";
import { GLIMPSE_GALLERY_GDRIVE_IMAGES } from "@/data/gdriveManifest";
import { GDRIVE_GALLERY_CONFIG } from "@/data/galleryConfig";
import { parseGoogleDriveUrl, getDriveDirectImageUrl } from "@/lib/googleDrive";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Extract tile number e.g. "tile_042.jpg" -> 42
  const match = slug.match(/tile_(\d+)/);
  const index = match ? parseInt(match[1], 10) - 1 : 0;

  // Select external Google Drive image from user's Glimpse Gallery folder
  const item = GLIMPSE_GALLERY_GDRIVE_IMAGES[index % GLIMPSE_GALLERY_GDRIVE_IMAGES.length];
  const targetUrl = item.thumbnailSrc;

  return NextResponse.redirect(new URL(targetUrl, request.url), {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
