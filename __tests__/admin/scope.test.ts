import { describe, it, expect } from "vitest";
import {
  parseAdminCategories,
  normalizeAdminCategory,
  formatCategoryScopeLabel,
  formatCategoryBadgeLabel,
  getCanonicalCategoryValue,
  isEventCategoryAllowed,
  CATEGORY_COMBINATIONS,
} from "@/lib/admin/scope";

describe("Admin Scope Utilities", () => {
  describe("parseAdminCategories", () => {
    it("returns empty array for unrestricted / null / undefined / all", () => {
      expect(parseAdminCategories(null)).toEqual([]);
      expect(parseAdminCategories(undefined)).toEqual([]);
      expect(parseAdminCategories("")).toEqual([]);
      expect(parseAdminCategories("all")).toEqual([]);
      expect(parseAdminCategories(["all"])).toEqual([]);
    });

    it("parses single category string and array", () => {
      expect(parseAdminCategories("technical")).toEqual(["technical"]);
      expect(parseAdminCategories("Cultural")).toEqual(["cultural"]);
      expect(parseAdminCategories(["non-technical"])).toEqual(["non-technical"]);
    });

    it("parses double categories from comma-separated string or array", () => {
      expect(parseAdminCategories("technical,cultural")).toEqual([
        "technical",
        "cultural",
      ]);
      expect(parseAdminCategories(" cultural , non-technical ")).toEqual([
        "cultural",
        "non-technical",
      ]);
      expect(parseAdminCategories(["technical", "non-technical"])).toEqual([
        "technical",
        "non-technical",
      ]);
    });

    it("returns empty array (unrestricted) if all 3 categories are provided", () => {
      expect(
        parseAdminCategories("technical,cultural,non-technical")
      ).toEqual([]);
      expect(
        parseAdminCategories(["cultural", "technical", "non-technical"])
      ).toEqual([]);
    });
  });

  describe("normalizeAdminCategory", () => {
    it("returns null for null, undefined, empty, or all", () => {
      expect(normalizeAdminCategory(null)).toBeNull();
      expect(normalizeAdminCategory("")).toBeNull();
      expect(normalizeAdminCategory("all")).toBeNull();
      expect(normalizeAdminCategory(["all"])).toBeNull();
    });

    it("normalizes single category", () => {
      expect(normalizeAdminCategory("technical")).toBe("technical");
      expect(normalizeAdminCategory("Cultural")).toBe("cultural");
      expect(normalizeAdminCategory(["Non-Technical"])).toBe("non-technical");
    });

    it("normalizes and canonically orders double categories", () => {
      expect(normalizeAdminCategory("cultural,technical")).toBe(
        "technical,cultural"
      );
      expect(normalizeAdminCategory(["non-technical", "technical"])).toBe(
        "technical,non-technical"
      );
      expect(normalizeAdminCategory("non-technical,cultural")).toBe(
        "cultural,non-technical"
      );
    });

    it("returns null when all categories are selected (equivalent to all)", () => {
      expect(
        normalizeAdminCategory("technical,cultural,non-technical")
      ).toBeNull();
    });
  });

  describe("formatCategoryScopeLabel", () => {
    it("formats unrestricted", () => {
      expect(formatCategoryScopeLabel(null)).toBe(
        "All Categories (Unrestricted)"
      );
      expect(formatCategoryScopeLabel("all")).toBe(
        "All Categories (Unrestricted)"
      );
    });

    it("formats single category", () => {
      expect(formatCategoryScopeLabel("technical")).toBe(
        "Technical Events Only"
      );
      expect(formatCategoryScopeLabel("cultural")).toBe("Cultural Events Only");
      expect(formatCategoryScopeLabel("non-technical")).toBe(
        "Non-Technical Events Only"
      );
    });

    it("formats double categories", () => {
      expect(formatCategoryScopeLabel("technical,cultural")).toBe(
        "Technical & Cultural Events"
      );
      expect(formatCategoryScopeLabel("technical,non-technical")).toBe(
        "Technical & Non-Technical Events"
      );
      expect(formatCategoryScopeLabel("cultural,non-technical")).toBe(
        "Cultural & Non-Technical Events"
      );
    });
  });

  describe("formatCategoryBadgeLabel", () => {
    it("formats badges correctly", () => {
      expect(formatCategoryBadgeLabel(null)).toBe("All Categories");
      expect(formatCategoryBadgeLabel("technical")).toBe("Technical");
      expect(formatCategoryBadgeLabel("technical,cultural")).toBe(
        "Technical & Cultural"
      );
      expect(formatCategoryBadgeLabel("cultural,non-technical")).toBe(
        "Cultural & Non-Technical"
      );
    });
  });

  describe("getCanonicalCategoryValue", () => {
    it("maps any equivalent input to canonical value", () => {
      expect(getCanonicalCategoryValue(null)).toBe("all");
      expect(getCanonicalCategoryValue("all")).toBe("all");
      expect(getCanonicalCategoryValue("technical")).toBe("technical");
      expect(getCanonicalCategoryValue("cultural,technical")).toBe(
        "technical,cultural"
      );
      expect(getCanonicalCategoryValue(["cultural", "non-technical"])).toBe(
        "cultural,non-technical"
      );
    });
  });

  describe("isEventCategoryAllowed", () => {
    it("allows any event when unrestricted", () => {
      expect(isEventCategoryAllowed("technical", null)).toBe(true);
      expect(isEventCategoryAllowed("cultural", "all")).toBe(true);
    });

    it("matches single category", () => {
      expect(isEventCategoryAllowed("technical", "technical")).toBe(true);
      expect(isEventCategoryAllowed("cultural", "technical")).toBe(false);
    });

    it("matches double categories", () => {
      expect(isEventCategoryAllowed("technical", "technical,cultural")).toBe(
        true
      );
      expect(isEventCategoryAllowed("cultural", "technical,cultural")).toBe(
        true
      );
      expect(
        isEventCategoryAllowed("non-technical", "technical,cultural")
      ).toBe(false);
    });
  });

  describe("CATEGORY_COMBINATIONS", () => {
    it("includes all 7 combination presets", () => {
      expect(CATEGORY_COMBINATIONS).toHaveLength(7);
      const values = CATEGORY_COMBINATIONS.map((c) => c.value);
      expect(values).toContain("all");
      expect(values).toContain("technical");
      expect(values).toContain("cultural");
      expect(values).toContain("non-technical");
      expect(values).toContain("technical,cultural");
      expect(values).toContain("technical,non-technical");
      expect(values).toContain("cultural,non-technical");
    });
  });
});
