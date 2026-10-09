import { describe, it, expect } from "vitest";
import { formatAccommodationDate } from "@/components/registration/RegistrationForm";

describe("formatAccommodationDate", () => {
  it("formats 1-day accommodation with default/unselected date", () => {
    expect(formatAccommodationDate(1)).toBe("28 or 29 Oct");
  });

  it("formats 1-day accommodation with 28th October selected", () => {
    expect(formatAccommodationDate(1, "2026-10-28")).toBe("28 Oct (Day 1)");
  });

  it("formats 1-day accommodation with 29th October selected", () => {
    expect(formatAccommodationDate(1, "2026-10-29")).toBe("29 Oct (Day 2)");
  });

  it("formats 2-day accommodation spanning both days", () => {
    expect(formatAccommodationDate(2)).toBe("28–29 Oct");
  });

  it("formats 3-day accommodation", () => {
    expect(formatAccommodationDate(3)).toBe("28–30 Oct");
  });
});
