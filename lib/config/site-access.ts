/**
 * Central site access and feature flags configuration for Saviskar 2026.
 *
 * This allows controlled launching and blocking of pages that are not ready
 * for public access on the hosted production site.
 *
 * You can toggle these anytime either:
 * 1. By updating these boolean flags directly.
 * 2. By setting the corresponding NEXT_PUBLIC_ environment variables in Vercel.
 */

export const SITE_ACCESS = {
  // Registrations portal (/register and POST /api/register)
  REGISTRATIONS_ENABLED: true,

  // Festival schedule and campus map (/schedule)
  SCHEDULE_ENABLED:
    process.env.NEXT_PUBLIC_ENABLE_SCHEDULE === "true",

  // Sponsors & partners showcase (/sponsors)
  SPONSORS_ENABLED:
    process.env.NEXT_PUBLIC_ENABLE_SPONSORS === "true",

  // Star Night concert lineup (/starnight)
  STARNIGHT_ENABLED:
    process.env.NEXT_PUBLIC_ENABLE_STARNIGHT === "true",

  // Individual event detail dossiers (/events/[category]/[event])
  // When false, visitors can browse the event list under each category,
  // but individual event detail dossiers and direct registrations remain locked.
  EVENT_DETAILS_ENABLED: true,

  // Institutional legacy & alumni citations (/legacy)
  LEGACY_ENABLED:
    process.env.NEXT_PUBLIC_ENABLE_LEGACY === "true",
} as const;

export type SiteAccessConfig = typeof SITE_ACCESS;
