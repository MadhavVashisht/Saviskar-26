import { NextRequest } from "next/server";

export const CANONICAL_SITE_ORIGIN = "https://saviskar.co.in";
export const STABLE_PRODUCTION_ORIGIN = CANONICAL_SITE_ORIGIN;

export const ALLOWED_PRODUCTION_ORIGINS = [
  "https://saviskar.co.in",
];

/**
 * Resolves the canonical, trusted origin for admin auth redirects (invites, password resets).
 * Auth emails MUST redirect users to the canonical production domain (https://saviskar.co.in)
 * so that:
 * 1. Supabase Auth whitelist accepts the redirect URL and does NOT fall back to the landing page.
 * 2. External users receiving emails are never directed to preview Vercel URLs or localhost.
 */
export function getTrustedAuthOrigin(req?: Request | NextRequest): string {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    Boolean(process.env.VERCEL);

  // In production / Vercel / live deployments, ALWAYS return the canonical production origin
  if (isProduction) {
    return CANONICAL_SITE_ORIGIN;
  }

  // In local development, check if NEXT_PUBLIC_SITE_URL is explicitly set to localhost
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const cleaned = configured.replace(/\/+$/, "");
    if (cleaned.includes("localhost") || cleaned.includes("127.0.0.1")) {
      return cleaned;
    }
  }

  return CANONICAL_SITE_ORIGIN;
}
