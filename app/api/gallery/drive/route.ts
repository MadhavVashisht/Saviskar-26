import { NextRequest, NextResponse } from "next/server";
import { GDRIVE_GALLERY_CONFIG } from "@/data/galleryConfig";
import {
  parseGoogleDriveUrl,
  getDriveDirectImageUrl,
  FALLBACK_GALLERY_IMAGES,
} from "@/lib/googleDrive";

export const revalidate = 3600; // Cache on edge for 1 hour

interface DriveImageResponseItem {
  id: string;
  src: string;
  title: string;
  category: "Main Stage" | "Technical & AI" | "Culture & Arts" | "Showcases" | "Sports" | "Campus" | "Behind the Scenes";
  description: string;
  aspectRatio: "landscape" | "portrait" | "wide";
  featured?: boolean;
}

/**
 * Extracts public image file IDs from a Google Drive folder page.
 */
async function fetchGoogleDriveFolderFileIds(folderId: string): Promise<string[]> {
  try {
    // Google Drive public folder embedded grid view exposes file IDs cleanly
    const embeddedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
    const res = await fetch(embeddedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return [];
    }

    const html = await res.text();
    const idSet = new Set<string>();

    // Extract file IDs from thumbnail or link patterns in Google's embedded view
    const patterns = [
      /https:\/\/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{25,50})/g,
      /\/file\/d\/([a-zA-Z0-9_-]{25,50})/g,
      /data-id="([a-zA-Z0-9_-]{25,50})"/g,
      /"([a-zA-Z0-9_-]{25,50})",\["image\//g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1] && match[1] !== folderId) {
          idSet.add(match[1]);
        }
      }
    }

    return Array.from(idSet);
  } catch (error) {
    console.error("Failed to fetch Google Drive folder:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || "main"; // 'main' or 'glimpse'
  const customUrl = searchParams.get("url");

  const targetUrl =
    customUrl ||
    (source === "glimpse"
      ? GDRIVE_GALLERY_CONFIG.glimpseGalleryDriveUrl
      : GDRIVE_GALLERY_CONFIG.mainGalleryDriveUrl);

  const parsed = parseGoogleDriveUrl(targetUrl);

  // If a valid Google Drive target is provided
  if (parsed) {
    if (parsed.type === "folder") {
      const fileIds = await fetchGoogleDriveFolderFileIds(parsed.id);

      if (fileIds.length > 0) {
        const categories: Array<DriveImageResponseItem["category"]> = [
          "Main Stage",
          "Culture & Arts",
          "Technical & AI",
          "Showcases",
          "Sports",
          "Campus",
        ];

        const items: DriveImageResponseItem[] = fileIds.map((fileId, idx) => ({
          id: `gdrive-${fileId}`,
          src: getDriveDirectImageUrl(fileId, 1600),
          title: `Saviskar Archive Snapshot #${idx + 1}`,
          category: categories[idx % categories.length],
          description: "Live festival capture from CGC University Mohali archives.",
          aspectRatio: idx % 3 === 0 ? "wide" : idx % 2 === 0 ? "landscape" : "portrait",
          featured: idx < 4,
        }));

        return NextResponse.json(
          { source, total: items.length, isExternal: true, items },
          {
            headers: {
              "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
          }
        );
      }
    } else if (parsed.type === "file") {
      const singleItem: DriveImageResponseItem = {
        id: `gdrive-${parsed.id}`,
        src: getDriveDirectImageUrl(parsed.id, 1600),
        title: "Saviskar Feature Highlight",
        category: "Main Stage",
        description: "High-resolution showcase capture from Saviskar 2026.",
        aspectRatio: "landscape",
        featured: true,
      };

      return NextResponse.json(
        { source, total: 1, isExternal: true, items: [singleItem] },
        {
          headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        }
      );
    }
  }

  // Graceful high-speed fallback images when Google Drive link is pending
  return NextResponse.json(
    {
      source,
      total: FALLBACK_GALLERY_IMAGES.length,
      isExternal: false,
      items: FALLBACK_GALLERY_IMAGES,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
