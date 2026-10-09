export const VALID_ADMIN_CATEGORIES = [
  "technical",
  "cultural",
  "non-technical",
] as const;

export type AdminCategory = (typeof VALID_ADMIN_CATEGORIES)[number];

export const CATEGORY_COMBINATIONS = [
  { value: "all", label: "All Categories (Unrestricted)" },
  { value: "technical", label: "Technical Events Only" },
  { value: "cultural", label: "Cultural Events Only" },
  { value: "non-technical", label: "Non-Technical Events Only" },
  { value: "technical,cultural", label: "Technical & Cultural Events" },
  { value: "technical,non-technical", label: "Technical & Non-Technical Events" },
  { value: "cultural,non-technical", label: "Cultural & Non-Technical Events" },
] as const;

/**
 * Parses a category scope string or array into an array of lowercase category identifiers.
 * Returns empty array if unrestricted (null, empty, "all", or all 3 categories).
 */
export function parseAdminCategories(
  category: string | string[] | null | undefined
): string[] {
  if (!category) return [];

  let items: string[] = [];
  if (Array.isArray(category)) {
    items = category.map((c) => String(c).trim().toLowerCase()).filter(Boolean);
  } else if (typeof category === "string") {
    items = category.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean);
  }

  // Filter out 'all' and only keep known categories
  items = items.filter(
    (c) =>
      c !== "all" &&
      VALID_ADMIN_CATEGORIES.includes(c as AdminCategory)
  );

  // Deduplicate
  const unique = Array.from(new Set(items));

  // If all 3 categories are present, it is effectively unrestricted
  if (unique.length >= VALID_ADMIN_CATEGORIES.length) {
    return [];
  }

  return unique;
}

/**
 * Normalizes category input for database storage as text or null.
 * e.g. ["technical", "cultural"] -> "technical,cultural"
 * Unrestricted or empty returns null.
 */
export function normalizeAdminCategory(
  category: unknown
): string | null {
  if (!category) return null;

  let rawList: string[] = [];
  if (Array.isArray(category)) {
    rawList = category.map((c) => String(c).trim().toLowerCase()).filter(Boolean);
  } else if (typeof category === "string") {
    rawList = category.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean);
  }

  rawList = rawList.filter(
    (c) =>
      c !== "all" &&
      VALID_ADMIN_CATEGORIES.includes(c as AdminCategory)
  );

  const unique = Array.from(new Set(rawList));

  if (unique.length === 0 || unique.length >= VALID_ADMIN_CATEGORIES.length) {
    return null;
  }

  // Canonical sort order based on VALID_ADMIN_CATEGORIES
  const sorted = unique.sort(
    (a, b) =>
      VALID_ADMIN_CATEGORIES.indexOf(a as AdminCategory) -
      VALID_ADMIN_CATEGORIES.indexOf(b as AdminCategory)
  );

  return sorted.join(",");
}

/**
 * Formats a category scope into a descriptive dropdown / selector label.
 */
export function formatCategoryScopeLabel(
  category: string | string[] | null | undefined
): string {
  const parsed = parseAdminCategories(category);
  if (parsed.length === 0) {
    return "All Categories (Unrestricted)";
  }

  const names = parsed.map((c) => {
    if (c === "technical") return "Technical";
    if (c === "cultural") return "Cultural";
    if (c === "non-technical") return "Non-Technical";
    return c;
  });

  if (names.length === 1) {
    return `${names[0]} Events Only`;
  }
  if (names.length === 2) {
    return `${names[0]} & ${names[1]} Events`;
  }
  return names.join(", ") + " Events";
}

/**
 * Formats a category scope into a compact badge label (e.g. "Technical & Cultural").
 */
export function formatCategoryBadgeLabel(
  category: string | string[] | null | undefined
): string {
  const parsed = parseAdminCategories(category);
  if (parsed.length === 0) {
    return "All Categories";
  }

  const names = parsed.map((c) => {
    if (c === "technical") return "Technical";
    if (c === "cultural") return "Cultural";
    if (c === "non-technical") return "Non-Technical";
    return c;
  });

  return names.join(" & ");
}

/**
 * Returns canonical dropdown option value (e.g. "technical,cultural" or "all").
 */
export function getCanonicalCategoryValue(
  category: string | string[] | null | undefined
): string {
  const normalized = normalizeAdminCategory(category);
  return normalized ?? "all";
}

/**
 * Helper to check if an event's category is permitted under the assigned scope.
 */
export function isEventCategoryAllowed(
  eventCategory: string | null | undefined,
  assignedCategory: string | string[] | null | undefined
): boolean {
  const allowed = parseAdminCategories(assignedCategory);
  if (allowed.length === 0) {
    return true; // unrestricted
  }
  if (!eventCategory) {
    return false;
  }
  return allowed.includes(eventCategory.trim().toLowerCase());
}
