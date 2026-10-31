/**
 * Saviskar 2026 — Granular Event & Accommodation Availability System
 *
 * Provides authoritative definitions, default availability policies,
 * and validation helpers for individual competitions and accommodation
 * plan/date combinations.
 */

export type AccommodationPlanSlug = "1_day" | "2_days" | "3_days" | "4_days";

export interface AccommodationOptionDefinition {
  id: string; // Composite key: `${planSlug}:${startDate}`
  planSlug: AccommodationPlanSlug;
  planName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  price: number;
  label: string;
  description: string;
}

/**
 * Authoritative master catalog of all supported accommodation plan and date
 * combinations in Saviskar 2026 at CGC University, Mohali.
 *
 * Official pricing:
 * - 1 Day Pass: ₹499
 * - 2 Days Pass: ₹999
 * - 3 Days Pass: ₹1,498
 * - 4 Days Full Festival: ₹1,997
 * (No 5-day plan exists).
 */
export const ACCOMMODATION_OPTIONS: readonly AccommodationOptionDefinition[] = [
  // ─── 1-Day Pass (₹499) ───
  {
    id: "1_day:2026-10-27",
    planSlug: "1_day",
    planName: "1 Day Pass",
    startDate: "2026-10-27",
    endDate: "2026-10-28",
    durationDays: 1,
    price: 499,
    label: "27 Oct (Day Before)",
    description: "Early arrival • Tue night stay, checkout 28 Oct morning",
  },
  {
    id: "1_day:2026-10-28",
    planSlug: "1_day",
    planName: "1 Day Pass",
    startDate: "2026-10-28",
    endDate: "2026-10-29",
    durationDays: 1,
    price: 499,
    label: "28 Oct (Day 1)",
    description: "Fest Day 1 • Wed night stay, checkout 29 Oct morning",
  },
  {
    id: "1_day:2026-10-29",
    planSlug: "1_day",
    planName: "1 Day Pass",
    startDate: "2026-10-29",
    endDate: "2026-10-30",
    durationDays: 1,
    price: 499,
    label: "29 Oct (Day 2)",
    description: "Fest Day 2 • Thu night stay, checkout 30 Oct morning",
  },
  {
    id: "1_day:2026-10-30",
    planSlug: "1_day",
    planName: "1 Day Pass",
    startDate: "2026-10-30",
    endDate: "2026-10-31",
    durationDays: 1,
    price: 499,
    label: "30 Oct (Day After)",
    description: "Fest Day 3 • Fri night stay, checkout 31 Oct morning",
  },
  {
    id: "1_day:2026-10-31",
    planSlug: "1_day",
    planName: "1 Day Pass",
    startDate: "2026-10-31",
    endDate: "2026-11-01",
    durationDays: 1,
    price: 499,
    label: "31 Oct (Day 4 • Checkout 1 Nov)",
    description: "Fest Day 4 • Sat night stay, checkout Sun 1 Nov morning",
  },

  // ─── 2-Days Pass (₹999) ───
  {
    id: "2_days:2026-10-28",
    planSlug: "2_days",
    planName: "2 Days Pass",
    startDate: "2026-10-28",
    endDate: "2026-10-30",
    durationDays: 2,
    price: 999,
    label: "28–29 Oct (Standard 2 Days)",
    description: "Fest Days 1 & 2 • 2 Nights stay, checkout 30 Oct morning",
  },
  {
    id: "2_days:2026-10-30",
    planSlug: "2_days",
    planName: "2 Days Pass",
    startDate: "2026-10-30",
    endDate: "2026-11-01",
    durationDays: 2,
    price: 999,
    label: "30–31 Oct (Weekend Extended)",
    description: "Weekend Stay • 2 Nights stay, checkout Sun 1 Nov morning",
  },

  // ─── 3-Days Pass (₹1,498) ───
  {
    id: "3_days:2026-10-27",
    planSlug: "3_days",
    planName: "3 Days Pass",
    startDate: "2026-10-27",
    endDate: "2026-10-30",
    durationDays: 3,
    price: 1498,
    label: "27–29 Oct (Early Arrival)",
    description: "Early Arrival • 3 Nights stay, checkout 30 Oct morning",
  },
  {
    id: "3_days:2026-10-28",
    planSlug: "3_days",
    planName: "3 Days Pass",
    startDate: "2026-10-28",
    endDate: "2026-10-31",
    durationDays: 3,
    price: 1498,
    label: "28–30 Oct (Fest + Day After)",
    description: "Fest Days • 3 Nights stay, checkout 31 Oct morning",
  },
  {
    id: "3_days:2026-10-29",
    planSlug: "3_days",
    planName: "3 Days Pass",
    startDate: "2026-10-29",
    endDate: "2026-11-01",
    durationDays: 3,
    price: 1498,
    label: "29–31 Oct (Extended Stay)",
    description: "Extended Fest • 3 Nights stay, checkout Sun 1 Nov morning",
  },

  // ─── 4-Days Full Festival (₹1,997) ───
  {
    id: "4_days:2026-10-27",
    planSlug: "4_days",
    planName: "4 Days Full Festival",
    startDate: "2026-10-27",
    endDate: "2026-10-31",
    durationDays: 4,
    price: 1997,
    label: "27–30 Oct (Full Fest Stay)",
    description: "Full Festival Stay • 4 Nights stay, checkout 31 Oct morning",
  },
  {
    id: "4_days:2026-10-28",
    planSlug: "4_days",
    planName: "4 Days Full Festival",
    startDate: "2026-10-28",
    endDate: "2026-11-01",
    durationDays: 4,
    price: 1997,
    label: "28–31 Oct (Extended Full Stay)",
    description: "Extended Full Stay • 4 Nights stay, checkout Sun 1 Nov morning",
  },
];

/**
 * INITIAL AVAILABILITY POLICY:
 * - AVAILABLE:
 *   1-day (31 Oct 2026, checkout 1 Nov morning, ₹499)
 *   2-days (30–31 Oct 2026, checkout 1 Nov morning, ₹999)
 * - UNAVAILABLE:
 *   All other 1-day dates (27, 28, 29, 30 Oct)
 *   All other 2-day dates (28–29 Oct)
 *   All 3-day plans
 *   All 4-day plans
 *   All unsupported dates
 */
export const DEFAULT_ACCOMMODATION_AVAILABILITY: Readonly<Record<string, boolean>> = Object.freeze({
  "1_day:2026-10-27": false,
  "1_day:2026-10-28": false,
  "1_day:2026-10-29": false,
  "1_day:2026-10-30": false,
  "1_day:2026-10-31": true, // AVAILABLE per initial policy
  "2_days:2026-10-28": false,
  "2_days:2026-10-30": true, // AVAILABLE per initial policy
  "3_days:2026-10-27": false,
  "3_days:2026-10-28": false,
  "3_days:2026-10-29": false,
  "4_days:2026-10-27": false,
  "4_days:2026-10-28": false,
});

/**
 * Computes the canonical option identifier `${planSlug}:${startDate}`.
 */
export function getAccommodationOptionId(
  planSlug: string,
  startDate?: string | null
): string {
  const normSlug = planSlug === "1_day_29" ? "1_day" : planSlug;
  const normDate = startDate ? startDate.slice(0, 10) : "";
  return `${normSlug}:${normDate}`;
}

/**
 * Retrieves the full option definition by option ID.
 */
export function getAccommodationOptionById(
  id: string
): AccommodationOptionDefinition | undefined {
  return ACCOMMODATION_OPTIONS.find((opt) => opt.id === id);
}

/**
 * Validates whether the given accommodation plan and start date combination
 * is currently available under the authoritative availability configuration.
 *
 * @param planSlug e.g. "1_day", "2_days", "3_days", "4_days"
 * @param startDate e.g. "2026-10-31"
 * @param availabilityMap Active overrides or null for default policy
 */
export function isAccommodationOptionAvailable(
  planSlug: string,
  startDate?: string | null,
  availabilityMap?: Record<string, boolean> | null
): boolean {
  if (!startDate) return false;
  const optionId = getAccommodationOptionId(planSlug, startDate);

  if (availabilityMap && typeof availabilityMap === "object" && optionId in availabilityMap) {
    return Boolean(availabilityMap[optionId]);
  }

  return Boolean(DEFAULT_ACCOMMODATION_AVAILABILITY[optionId]);
}
