import { describe, it, expect } from "vitest";
import {
  REALMS_DATA,
  matchesRealm,
  matchesSearch,
  sortEvents,
  EventItem,
} from "@/components/events/EventsView";

describe("Public EventsView — Supabase Data Source & Search Architecture", () => {
  const sampleEvents: EventItem[] = [
    {
      id: "tech-01",
      slug: "roborace",
      name: "RoboRace",
      category: "technical",
      description: "High speed obstacle combat race for remote robots.",
      event_date: "2026-04-10",
      start_time: "10:00",
      venue: "Robotics Arena Lab 3",
      active: true,
      registration_open: true,
    },
    {
      id: "tech-02",
      slug: "hackathon",
      name: "24H National Hackathon",
      category: "technical",
      description: "Build neural agent software in 24 hours.",
      event_date: "2026-04-10",
      start_time: "12:00",
      venue: "Computing Hall Alpha",
      active: true,
      registration_open: true,
    },
    {
      id: "tech-03",
      slug: "cad-design",
      name: "CAD Mechanical Challenge",
      category: "technical",
      description: "Parametric 3D solid modeling challenge.",
      event_date: "2026-04-11",
      start_time: "09:00",
      venue: "CAD Station 4",
      active: true,
      registration_open: true,
    },
    {
      id: "tech-04",
      slug: "tech-event-4",
      name: "Cyber Security CTF",
      category: "technical",
      description: "Reverse engineering and cryptography.",
      event_date: "2026-04-11",
      start_time: "11:00",
      venue: "Cyber Lab",
      active: true,
      registration_open: true,
    },
    {
      id: "tech-05",
      slug: "tech-event-5",
      name: "Drone Simulator Derby",
      category: "technical",
      description: "FPV drone navigation.",
      event_date: "2026-04-12",
      start_time: "10:00",
      venue: "Open Ground",
      active: true,
      registration_open: true,
    },
    {
      id: "tech-06",
      slug: "tech-event-6",
      name: "PCB Soldering Sprint",
      category: "technical",
      description: "Micro-electronics soldering tournament.",
      event_date: "2026-04-12",
      start_time: "13:00",
      venue: "VLSI Studio",
      active: true,
      registration_open: true,
    },
    {
      id: "tech-07",
      slug: "tech-event-7",
      name: "Tech Paper Presentation",
      category: "technical",
      description: "Publish research papers.",
      event_date: "2026-04-12",
      start_time: "15:00",
      venue: "Conference Room 1",
      active: true,
      registration_open: true,
    },
    {
      id: "nontech-01",
      slug: "mock-stock",
      name: "Mock Stock Exchange",
      category: "non-technical",
      description: "Fast-paced market floor trading simulation.",
      event_date: "2026-04-10",
      start_time: "11:00",
      venue: "Management Seminar Hall",
      active: true,
      registration_open: true,
    },
    {
      id: "cult-01",
      slug: "battle-of-bands",
      name: "Battle of the Bands",
      category: "cultural",
      description: "Rock fusion electric guitar stage showdown.",
      event_date: "2026-04-11",
      start_time: "18:00",
      venue: "Central Concert Stage",
      active: true,
      registration_open: true,
    },
    {
      id: "ai-01",
      slug: "ai-pitch",
      name: "AI Startup Venture Pitch",
      category: "aivishkar",
      description: "Pitch neural agent startups to VC angel investors.",
      event_date: "2026-04-10",
      start_time: "14:00",
      venue: "Innovation Hub Floor 2",
      active: true,
      registration_open: true,
    },
  ];

  // Helper simulating computeRealms
  function computeRealms(
    events: EventItem[],
    selectedCategory: string,
    query: string
  ) {
    const trimmed = query.trim().toLowerCase();

    const realmsWithEvents = REALMS_DATA.map((realm) => {
      const allRealmEvents = sortEvents(
        events.filter((e) => matchesRealm(e.category, realm.id))
      );
      const matchingEvents = trimmed
        ? allRealmEvents.filter((e) => matchesSearch(e, trimmed))
        : allRealmEvents;

      const displayedChips = matchingEvents.slice(0, 6);
      const dynamicEventCount = `${allRealmEvents.length} Competition${allRealmEvents.length === 1 ? "" : "s"}`;

      return {
        ...realm,
        allEvents: allRealmEvents,
        matchingEvents,
        displayedChips,
        dynamicEventCount,
      };
    });

    return realmsWithEvents.filter((realm) => {
      const matchesCategory =
        selectedCategory === "all" || realm.id === selectedCategory;

      if (!matchesCategory) return false;

      if (trimmed) {
        return realm.matchingEvents.length > 0;
      }

      return true;
    });
  }

  it("1. A supplied Technical database event named 'RoboRace' is searchable", () => {
    const roboEvent = sampleEvents.find((e) => e.name === "RoboRace");
    expect(roboEvent).toBeDefined();
    expect(matchesSearch(roboEvent!, "RoboRace")).toBe(true);
  });

  it("2. Searching 'robo' matches 'RoboRace'", () => {
    const roboEvent = sampleEvents.find((e) => e.name === "RoboRace");
    expect(matchesSearch(roboEvent!, "robo")).toBe(true);
  });

  it("3. Searching 'ROBO' matches 'RoboRace'", () => {
    const roboEvent = sampleEvents.find((e) => e.name === "RoboRace");
    expect(matchesSearch(roboEvent!, "ROBO")).toBe(true);
  });

  it("4. Partial matching works for names, descriptions, and venues", () => {
    const roboEvent = sampleEvents.find((e) => e.name === "RoboRace")!;
    expect(matchesSearch(roboEvent, "Race")).toBe(true);
    expect(matchesSearch(roboEvent, "combat")).toBe(true);
    expect(matchesSearch(roboEvent, "Lab 3")).toBe(true);
  });

  it("5. Whitespace is trimmed in search queries", () => {
    const roboEvent = sampleEvents.find((e) => e.name === "RoboRace")!;
    expect(matchesSearch(roboEvent, "   robo   ")).toBe(true);
  });

  it("6. Description matching works", () => {
    const hackEvent = sampleEvents.find((e) => e.slug === "hackathon")!;
    expect(matchesSearch(hackEvent, "neural agent")).toBe(true);
  });

  it("7. Venue matching works", () => {
    const stockEvent = sampleEvents.find((e) => e.slug === "mock-stock")!;
    expect(matchesSearch(stockEvent, "Management Seminar")).toBe(true);
  });

  it("8. Technical events do not appear under Non-Technical", () => {
    const nonTechEvents = sampleEvents.filter((e) =>
      matchesRealm(e.category, "non-technical")
    );
    expect(nonTechEvents.some((e) => e.name === "RoboRace")).toBe(false);
  });

  it("9. Non-Technical events do not appear under Technical", () => {
    const techEvents = sampleEvents.filter((e) =>
      matchesRealm(e.category, "technical")
    );
    expect(techEvents.some((e) => e.name === "Mock Stock Exchange")).toBe(false);
  });

  it("10. Cultural events remain isolated", () => {
    const cultEvents = sampleEvents.filter((e) =>
      matchesRealm(e.category, "cultural")
    );
    expect(cultEvents).toHaveLength(1);
    expect(cultEvents[0].name).toBe("Battle of the Bands");
    expect(matchesRealm("cultural", "technical")).toBe(false);
    expect(matchesRealm("cultural", "non-technical")).toBe(false);
    expect(matchesRealm("cultural", "aivishkar")).toBe(false);
  });

  it("11. AIvishkar remains isolated and handles avishkar alias", () => {
    expect(matchesRealm("aivishkar", "aivishkar")).toBe(true);
    expect(matchesRealm("avishkar", "aivishkar")).toBe(true);
    expect(matchesRealm("aivishkar", "technical")).toBe(false);
    expect(matchesRealm("aivishkar", "cultural")).toBe(false);
  });

  it("12. All Realms searches across all loaded actual events", () => {
    const results = computeRealms(sampleEvents, "all", "");
    expect(results).toHaveLength(4);
  });

  it("13. A realm appears during search only when at least one actual event matches", () => {
    const results = computeRealms(sampleEvents, "all", "robo");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("technical");
  });

  it("14. Search results use actual event names", () => {
    const results = computeRealms(sampleEvents, "all", "robo");
    expect(results[0].displayedChips[0].name).toBe("RoboRace");
    expect(results[0].displayedChips[0].slug).toBe("roborace");
  });

  it("15. No hardcoded event tag list is required on realm data objects", () => {
    REALMS_DATA.forEach((realm) => {
      expect((realm as unknown as Record<string, unknown>).tags).toBeUndefined();
    });
  });

  it("16. Maximum six actual events are displayed per realm", () => {
    // technical realm in sampleEvents has 7 events
    const results = computeRealms(sampleEvents, "technical", "");
    expect(results[0].allEvents).toHaveLength(7);
    expect(results[0].displayedChips).toHaveLength(6);
  });

  it("17. Fewer than six actual events displays all available events", () => {
    // non-technical has 1 event, cultural has 1, aivishkar has 1
    const results = computeRealms(sampleEvents, "non-technical", "");
    expect(results[0].displayedChips).toHaveLength(1);
    expect(results[0].displayedChips[0].name).toBe("Mock Stock Exchange");
  });

  it("18. Event count is calculated from actual loaded events", () => {
    const results = computeRealms(sampleEvents, "all", "");
    const techRealm = results.find((r) => r.id === "technical")!;
    expect(techRealm.dynamicEventCount).toBe("7 Competitions");
    const nonTechRealm = results.find((r) => r.id === "non-technical")!;
    expect(nonTechRealm.dynamicEventCount).toBe("1 Competition");
  });

  it("19. Clearing search restores the first six actual events per realm", () => {
    const searched = computeRealms(sampleEvents, "technical", "cad");
    expect(searched[0].displayedChips).toHaveLength(1);
    expect(searched[0].displayedChips[0].name).toBe("CAD Mechanical Challenge");

    const cleared = computeRealms(sampleEvents, "technical", "");
    expect(cleared[0].displayedChips).toHaveLength(6);
  });

  describe("Realm Titles Punctuation Verification", () => {
    it("20. Realm title 'Technical' has no trailing period", () => {
      const tech = REALMS_DATA.find((r) => r.id === "technical")!;
      expect(tech.title.endsWith(".")).toBe(false);
      expect(tech.title).toBe("Technical");
    });

    it("21. Realm title 'Non-Technical' has no trailing period", () => {
      const nonTech = REALMS_DATA.find((r) => r.id === "non-technical")!;
      expect(nonTech.title.endsWith(".")).toBe(false);
      expect(nonTech.title).toBe("Non-Technical");
    });

    it("22. Realm title 'Cultural' has no trailing period", () => {
      const cult = REALMS_DATA.find((r) => r.id === "cultural")!;
      expect(cult.title.endsWith(".")).toBe(false);
      expect(cult.title).toBe("Cultural");
    });

    it("23. Realm title 'AIvishkar: An AI Tech Expo' has no trailing period", () => {
      const ai = REALMS_DATA.find((r) => r.id === "aivishkar")!;
      expect(ai.title.endsWith(".")).toBe(false);
      expect(ai.title).toBe("AIvishkar: An AI Tech Expo");
    });

    it("24. Normal periods in descriptions and unrelated text remain unchanged", () => {
      const tech = REALMS_DATA.find((r) => r.id === "technical")!;
      expect(tech.tagline).toBe("Build. Invent. Compete.");
      expect(tech.description.endsWith(".")).toBe(true);
      expect(tech.description).toContain("innovators.");
    });
  });
});
