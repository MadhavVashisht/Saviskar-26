import { NextRequest, NextResponse } from "next/server";
import {
  MAIN_GALLERY_GDRIVE_IMAGES,
  GLIMPSE_GALLERY_GDRIVE_IMAGES,
} from "@/data/gdriveManifest";

export const revalidate = 3600; // Cache on edge for 1 hour


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || "main"; // 'main' or 'glimpse'

  if (source === "glimpse") {
    return NextResponse.json(
      {
        source: "glimpse",
        total: GLIMPSE_GALLERY_GDRIVE_IMAGES.length,
        isExternal: true,
        items: GLIMPSE_GALLERY_GDRIVE_IMAGES,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  // Main Gallery items (40 high-res photos streamed from user's Google Drive)
  return NextResponse.json(
    {
      source: "main",
      total: MAIN_GALLERY_GDRIVE_IMAGES.length,
      isExternal: true,
      items: MAIN_GALLERY_GDRIVE_IMAGES,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
