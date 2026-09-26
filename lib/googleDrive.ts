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
 * Google's lh3.googleusercontent.com CDN with =s0 serves the 100% full-resolution,
 * pristine uncompressed original image file (JPEG/PNG) without lossy WebP downsampling.
 */
export function getDriveDirectImageUrl(fileId: string, width?: number): string {
  if (!fileId) return "";
  if (width && width > 0) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
  }
  return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
}

import { MAIN_GALLERY_GDRIVE_IMAGES } from "@/data/gdriveManifest";

/**
 * Fallback festival images streamed directly from Google Drive CDN
 */
export const FALLBACK_GALLERY_IMAGES = MAIN_GALLERY_GDRIVE_IMAGES.slice(0, 12);
