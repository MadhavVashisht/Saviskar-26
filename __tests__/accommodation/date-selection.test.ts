import { describe, it, expect } from "vitest";
import {
  formatAccommodationDate,
  resolveAccommodationSelection,
} from "@/components/registration/RegistrationForm";

describe("formatAccommodationDate", () => {
  it("formats 1-day accommodation with default/unselected date", () => {
    expect(formatAccommodationDate(1)).toBe("28 or 29 Oct");
  });

  it("formats 1-day accommodation with 27th October (Day Before) selected", () => {
    expect(formatAccommodationDate(1, "2026-10-27")).toBe("27 Oct (Day Before)");
  });

  it("formats 1-day accommodation with 28th October selected", () => {
    expect(formatAccommodationDate(1, "2026-10-28")).toBe("28 Oct (Day 1)");
  });

  it("formats 1-day accommodation with 29th October selected", () => {
    expect(formatAccommodationDate(1, "2026-10-29")).toBe("29 Oct (Day 2)");
  });

  it("formats 1-day accommodation with 30th October (Day After) selected", () => {
    expect(formatAccommodationDate(1, "2026-10-30")).toBe("30 Oct (Day After)");
  });

  it("formats 2-day accommodation without extra days", () => {
    expect(formatAccommodationDate(2)).toBe("28–29 Oct");
  });

  it("formats 2-day accommodation with day before (27th)", () => {
    expect(formatAccommodationDate(2, undefined, "before_27")).toBe("27–29 Oct (3 Days)");
  });

  it("formats 2-day accommodation with day after (30th)", () => {
    expect(formatAccommodationDate(2, undefined, "after_30")).toBe("28–30 Oct (3 Days)");
  });

  it("formats 2-day accommodation with both extra days", () => {
    expect(formatAccommodationDate(2, undefined, "both")).toBe("27–30 Oct (4 Days)");
  });

  it("formats 3-day accommodation", () => {
    expect(formatAccommodationDate(3)).toBe("27th or 30th Oct");
    expect(formatAccommodationDate(3, "2026-10-27")).toBe("27–29 Oct (3 Days)");
    expect(formatAccommodationDate(3, "2026-10-30")).toBe("28–30 Oct (3 Days)");
  });

  it("formats 4-day accommodation", () => {
    expect(formatAccommodationDate(4)).toBe("27–30 Oct (4 Days)");
  });
});

describe("resolveAccommodationSelection", () => {
  it("resolves 1-day plan with various dates", () => {
    expect(resolveAccommodationSelection("1_day", "2026-10-27")).toEqual({
      planSlug: "1_day",
      selectedDate: "2026-10-27",
      extraDays: "none",
    });
    expect(resolveAccommodationSelection("1_day", "2026-10-28")).toEqual({
      planSlug: "1_day",
      selectedDate: "2026-10-28",
      extraDays: "none",
    });
    expect(resolveAccommodationSelection("1_day", "2026-10-29")).toEqual({
      planSlug: "1_day",
      selectedDate: "2026-10-29",
      extraDays: "none",
    });
    expect(resolveAccommodationSelection("1_day", "2026-10-30")).toEqual({
      planSlug: "1_day",
      selectedDate: "2026-10-30",
      extraDays: "none",
    });
    expect(resolveAccommodationSelection("1_day", "")).toEqual({
      planSlug: "1_day",
      selectedDate: "2026-10-28",
      extraDays: "none",
    });
  });

  it("resolves 2-day plan with standard (no extra days)", () => {
    expect(resolveAccommodationSelection("2_days", undefined, "none")).toEqual({
      planSlug: "2_days",
      selectedDate: "2026-10-28",
      extraDays: "none",
    });
  });

  it("resolves 2-day plan with early arrival (day before 27th)", () => {
    expect(resolveAccommodationSelection("2_days", undefined, "before_27")).toEqual({
      planSlug: "3_days",
      selectedDate: "2026-10-27",
      extraDays: "before_27",
    });
  });

  it("resolves 2-day plan with extended stay (day after 30th)", () => {
    expect(resolveAccommodationSelection("2_days", undefined, "after_30")).toEqual({
      planSlug: "3_days",
      selectedDate: "2026-10-30",
      extraDays: "after_30",
    });
  });

  it("resolves 2-day plan with both extra days (27th & 30th)", () => {
    expect(resolveAccommodationSelection("2_days", undefined, "both")).toEqual({
      planSlug: "4_days",
      selectedDate: "2026-10-27",
      extraDays: "both",
    });
  });

  it("resolves 3-day plan with choice between 27th or 30th", () => {
    expect(resolveAccommodationSelection("3_days", "2026-10-27")).toEqual({
      planSlug: "3_days",
      selectedDate: "2026-10-27",
      extraDays: "before_27",
    });
    expect(resolveAccommodationSelection("3_days", "2026-10-30")).toEqual({
      planSlug: "3_days",
      selectedDate: "2026-10-30",
      extraDays: "after_30",
    });
    // Default fallback to 27th
    expect(resolveAccommodationSelection("3_days")).toEqual({
      planSlug: "3_days",
      selectedDate: "2026-10-27",
      extraDays: "before_27",
    });
  });
});

