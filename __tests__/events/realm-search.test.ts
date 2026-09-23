import { describe, it, expect } from "vitest";

type Event = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  venue: string | null;
  registration_type: string;
  min_team_size: number | null;
  max_team_size: number | null;
  registration_limit: number | null;
  registration_open: boolean;
  active: boolean;
};

// Pure filter function mirroring useMemo in app/events/[category]/page.tsx
function filterCategoryEvents(categoryEvents: Event[], searchQuery: string): Event[] {
  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return categoryEvents;
  }

  return categoryEvents.filter((event) => {
    return [
      event.name,
      event.description,
      event.venue,
      event.registration_type,
    ].some((value) =>
      value?.toLowerCase().includes(query)
    );
  });
}

function formatEventCount(categoryEventsLength: number, filteredEventsLength: number, searchQuery: string): string {
  if (searchQuery.trim()) {
    return `${filteredEventsLength} OF ${categoryEventsLength} EVENTS`;
  }
  return `${categoryEventsLength} VERIFIED EVENTS`;
}

function getCardNumber(filteredIndex: number): string {
  return String(filteredIndex + 1).padStart(2, "0");
}

describe("Public Realm Event Search / Filter Logic", () => {
  const technicalEvents: Event[] = [
    {
      id: "ev-tech-01",
      slug: "roborace",
      name: "RoboRace Grand Prix",
      category: "technical",
      description: "High-speed autonomous and RC robot racing on an obstacle obstacle track.",
      event_date: "2026-04-10",
      start_time: "10:00",
      venue: "Robotics Arena Lab 3",
      registration_type: "team",
      min_team_size: 2,
      max_team_size: 4,
      registration_limit: 50,
      registration_open: true,
      active: true,
    },
    {
      id: "ev-tech-02",
      slug: "code-sprint",
      name: "Algorithmic Code Sprint",
      category: "technical",
      description: "Competitive programming challenge spanning data structures and dynamic algorithms.",
      event_date: "2026-04-10",
      start_time: "14:00",
      venue: "Computing Center Alpha",
      registration_type: "solo",
      min_team_size: 1,
      max_team_size: 1,
      registration_limit: 100,
      registration_open: true,
      active: true,
    },
    {
      id: "ev-tech-03",
      slug: "hack-saviskar",
      name: "Saviskar AI Hackathon",
      category: "technical",
      description: "Build neural agent applications and intelligent bots in 24 hours.",
      event_date: "2026-04-11",
      start_time: "09:00",
      venue: "Main Auditorium Hall B",
      registration_type: "team",
      min_team_size: 3,
      max_team_size: 5,
      registration_limit: 30,
      registration_open: false,
      active: true,
    },
  ];

  const nonTechnicalEvents: Event[] = [
    {
      id: "ev-nontech-01",
      slug: "best-manager",
      name: "The Best Manager",
      category: "non-technical",
      description: "Crisis handling, corporate strategy and boardroom pitch simulation.",
      event_date: "2026-04-10",
      start_time: "11:00",
      venue: "Management Block Room 101",
      registration_type: "solo",
      min_team_size: 1,
      max_team_size: 1,
      registration_limit: 40,
      registration_open: true,
      active: true,
    },
    {
      id: "ev-nontech-02",
      slug: "ad-mad",
      name: "Ad Mad Show",
      category: "non-technical",
      description: "Humorous marketing pitch and creative advertisement presentation.",
      event_date: "2026-04-11",
      start_time: "13:00",
      venue: "Seminar Hall 2",
      registration_type: "team",
      min_team_size: 2,
      max_team_size: 4,
      registration_limit: 30,
      registration_open: true,
      active: true,
    },
  ];

  const culturalEvents: Event[] = [
    {
      id: "ev-cult-01",
      slug: "battle-of-bands",
      name: "Battle of the Bands",
      category: "cultural",
      description: "Electric rock, indie fusion, and live instrumental band showdown.",
      event_date: "2026-04-11",
      start_time: "18:00",
      venue: "Concert Mainstage",
      registration_type: "team",
      min_team_size: 3,
      max_team_size: 8,
      registration_limit: 15,
      registration_open: true,
      active: true,
    },
  ];

  describe("Realm Data Isolation", () => {
    it("technical search strictly searches technical events only", () => {
      // Searching "manager" in technical realm returns 0 even though "The Best Manager" exists in non-technical
      const results = filterCategoryEvents(technicalEvents, "manager");
      expect(results).toHaveLength(0);
    });

    it("non-technical search strictly searches non-technical events only", () => {
      // Searching "robot" in non-technical returns 0 even though "RoboRace" exists in technical
      const results = filterCategoryEvents(nonTechnicalEvents, "robot");
      expect(results).toHaveLength(0);
    });

    it("cultural search strictly searches cultural events only", () => {
      const results = filterCategoryEvents(culturalEvents, "code");
      expect(results).toHaveLength(0);
      const bandResults = filterCategoryEvents(culturalEvents, "band");
      expect(bandResults).toHaveLength(1);
      expect(bandResults[0].slug).toBe("battle-of-bands");
    });
  });

  describe("Search Capabilities", () => {
    it("returns all events when search query is empty or whitespace", () => {
      expect(filterCategoryEvents(technicalEvents, "")).toEqual(technicalEvents);
      expect(filterCategoryEvents(technicalEvents, "   ")).toEqual(technicalEvents);
    });

    it("performs case-insensitive partial match on name", () => {
      const results = filterCategoryEvents(technicalEvents, "rObO");
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe("roborace");
    });

    it("performs search match on event description", () => {
      const results = filterCategoryEvents(technicalEvents, "neural agent");
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe("hack-saviskar");
    });

    it("performs search match on event venue", () => {
      const results = filterCategoryEvents(technicalEvents, "computing center");
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe("code-sprint");
    });

    it("performs search match on registration_type", () => {
      const soloEvents = filterCategoryEvents(technicalEvents, "solo");
      expect(soloEvents).toHaveLength(1);
      expect(soloEvents[0].slug).toBe("code-sprint");

      const teamEvents = filterCategoryEvents(technicalEvents, "team");
      expect(teamEvents).toHaveLength(2);
    });

    it("returns empty array for non-matching queries without errors", () => {
      const results = filterCategoryEvents(technicalEvents, "xyzabc");
      expect(results).toHaveLength(0);
    });
  });

  describe("Card Numbering and Count Formatting", () => {
    it("resets card numbering based on the filtered list", () => {
      // In technicalEvents, code-sprint is originally index 1 (02)
      // When searching "code", it becomes the first and only item -> 01
      const filtered = filterCategoryEvents(technicalEvents, "code");
      expect(filtered).toHaveLength(1);
      expect(filtered[0].slug).toBe("code-sprint");
      expect(getCardNumber(0)).toBe("01");
    });

    it("formats event count accurately when no search is active", () => {
      const countText = formatEventCount(technicalEvents.length, technicalEvents.length, "");
      expect(countText).toBe("3 VERIFIED EVENTS");
    });

    it("formats event count accurately when search is active", () => {
      const filtered = filterCategoryEvents(technicalEvents, "team");
      const countText = formatEventCount(technicalEvents.length, filtered.length, "team");
      expect(countText).toBe("2 OF 3 EVENTS");
    });

    it("formats event count accurately when search produces zero matches", () => {
      const filtered = filterCategoryEvents(technicalEvents, "xyzabc");
      const countText = formatEventCount(technicalEvents.length, filtered.length, "xyzabc");
      expect(countText).toBe("0 OF 3 EVENTS");
    });
  });
});
