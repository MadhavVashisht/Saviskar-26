import { NextRequest } from "next/server";

export const STABLE_PRODUCTION_ORIGIN = "https://saviskar.co.in";

export const ALLOWED_PRODUCTION_ORIGINS = [
  "https://saviskar.co.in",
  "https://saviskar-2026.vercel.app",
];

export function getTrustedAuthOrigin(req?: Request | NextRequest): string {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production";

  if (!isProduction) {
    if (req) {
      const origin = req.headers.get("origin");
      if (origin && !origin.includes("null")) return origin.replace(/\/+$/, "");

      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "http";
      if (host) {
        return `${proto}://${host}`.replace(/\/+$/, "");
      }
    }
    return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  }

  // Production logic:
  // Check the request origin/host first to support valid Vercel staging environments.
  if (req) {
    let requestOrigin = "";
    const origin = req.headers.get("origin");
    if (origin && !origin.includes("null")) {
      requestOrigin = origin.replace(/\/+$/, "");
    } else {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "https";
      if (host) {
        requestOrigin = `${proto}://${host}`.replace(/\/+$/, "");
      }
    }

    if (ALLOWED_PRODUCTION_ORIGINS.includes(requestOrigin)) {
      return requestOrigin;
    }
  }

  // Fallback to NEXT_PUBLIC_SITE_URL if valid, otherwise safe canonical origin.
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const cleaned = configured.replace(/\/+$/, "");
    if (ALLOWED_PRODUCTION_ORIGINS.includes(cleaned)) {
      return cleaned;
    }
  }

  return STABLE_PRODUCTION_ORIGIN;
}
