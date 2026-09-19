import { describe, it, expect } from "vitest";

type EventRecord = {
  id: string;
  created_at?: string | null;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  venue: string | null;
  active: boolean;
  registration_open: boolean;
  registration_type: "individual" | "team" | string | null;
  min_team_size: number | null;
  max_team_size: number | null;
  registration_fee: number | null;
  payment_type: string | null;
  payment_unit: string | null;
  registration_count: number;
};

type SortOption = "default" | "recently-added";
type DateFilterValue = "all" | "today" | "tomorrow" | "this-week" | "this-month" | "custom";
type PaymentFilterValue = "all" | "free" | "paid";

function isEventFree(event: EventRecord) {
  const fee = Number(event.registration_fee ?? 0);
  return fee === 0 || event.payment_unit === "free";
}

function matchesDateFilter(
  eventDate: string | null,
  filter: DateFilterValue,
  customFrom: string,
  customTo: string
): boolean {
  if (filter === "all") return true;
  if (!eventDate) return false;
  const d = new Date(`${eventDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filter) {
    case "today":
      return d.getTime() === today.getTime();
    case "tomorrow": {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return d.getTime() === tomorrow.getTime();
    }
    case "this-week": {
      const dayOfWeek = today.getDay();
      const diffToMonday = (dayOfWeek + 6) % 7;
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - diffToMonday);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return d >= weekStart && d <= weekEnd;
    }
    case "this-month":
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    case "custom": {
      if (customFrom) {
        const from = new Date(`${customFrom}T00:00:00`);
        if (!Number.isNaN(from.getTime()) && d < from) return false;
      }
      if (customTo) {
        const to = new Date(`${customTo}T00:00:00`);
        if (!Number.isNaN(to.getTime()) && d > to) return false;
      }
      return true;
    }
    default:
      return true;
  }
}

// Exactly replicating the filter and sort pipeline from app/admin/events/page.tsx
function runFilterAndSort({
  events,
  search = "",
  categoryFilter = "All",
  dateFilter = "all" as DateFilterValue,
  customDateFrom = "",
  customDateTo = "",
  paymentFilter = "all" as PaymentFilterValue,
  sortOrder = "default" as SortOption,
}: {
  events: EventRecord[];
  search?: string;
  categoryFilter?: string;
  dateFilter?: DateFilterValue;
  customDateFrom?: string;
  customDateTo?: string;
  paymentFilter?: PaymentFilterValue;
  sortOrder?: SortOption;
}) {
  const query = search.trim().toLowerCase();

  const result = events.filter((event) => {
    if (query) {
      const matches = [
        event.name,
        event.slug,
        event.category,
        event.venue,
        event.description,
      ].some((value) => value?.toLowerCase().includes(query));
      if (!matches) return false;
    }

    if (
      categoryFilter !== "All" &&
      event.category?.trim().toLowerCase() !== categoryFilter.toLowerCase()
    ) {
      return false;
    }

    if (!matchesDateFilter(event.event_date, dateFilter, customDateFrom, customDateTo)) {
      return false;
    }

    if (paymentFilter === "free" && !isEventFree(event)) return false;
    if (paymentFilter === "paid" && isEventFree(event)) return false;

    return true;
  });

  if (sortOrder === "recently-added") {
    return [...result].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : NaN;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : NaN;
      const validA = !Number.isNaN(timeA);
      const validB = !Number.isNaN(timeB);

      if (validA && validB) {
        if (timeB !== timeA) return timeB - timeA;
        return (a.name ?? "").localeCompare(b.name ?? "");
      }

      if (validA && !validB) return -1;
      if (!validA && validB) return 1;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }

  return result;
}

describe("Admin Events Management - Recently Added Filter / Sort", () => {
  const sampleEvents: EventRecord[] = [
    {
      id: "evt-1",
      name: "Alpha Hackathon",
      slug: "alpha-hackathon",
      category: "technical",
      description: "Oldest created event, scheduled late",
      created_at: "2026-08-01T10:00:00.000Z",
      event_date: "2026-11-20",
      start_time: "09:00",
      venue: "Main Hall",
      active: true,
      registration_open: true,
      registration_type: "team",
      min_team_size: 2,
      max_team_size: 4,
      registration_fee: 100,
      payment_type: "paid",
      payment_unit: "per_team",
      registration_count: 5,
    },
    {
      id: "evt-2",
      name: "Beta Robotics",
      slug: "beta-robotics",
      category: "technical",
      description: "Mid created event, scheduled early",
      created_at: "2026-08-15T12:00:00.000Z",
      event_date: "2026-09-01",
      start_time: "10:00",
      venue: "Arena",
      active: true,
      registration_open: true,
      registration_type: "individual",
      min_team_size: null,
      max_team_size: null,
      registration_fee: 0,
      payment_type: "free",
      payment_unit: null,
      registration_count: 12,
    },
    {
      id: "evt-3",
      name: "Gamma Cultural",
      slug: "gamma-cultural",
      category: "cultural",
      description: "Newest created event",
      created_at: "2026-09-18T15:30:00.000Z",
      event_date: "2026-10-10",
      start_time: "14:00",
      venue: "Auditorium",
      active: true,
      registration_open: true,
      registration_type: "team",
      min_team_size: 3,
      max_team_size: 6,
      registration_fee: 50,
      payment_type: "paid",
      payment_unit: "per_student",
      registration_count: 3,
    },
    {
      id: "evt-4",
      name: "Delta Workshop",
      slug: "delta-workshop",
      category: "workshop",
      description: "Event with missing created_at",
      created_at: null,
      event_date: "2026-10-05",
      start_time: "11:00",
      venue: "Lab 3",
      active: true,
      registration_open: false,
      registration_type: "individual",
      min_team_size: null,
      max_team_size: null,
      registration_fee: 0,
      payment_type: "free",
      payment_unit: null,
      registration_count: 0,
    },
    {
      id: "evt-5",
      name: "Epsilon Gaming",
      slug: "epsilon-gaming",
      category: "gaming",
      description: "Event with invalid created_at timestamp string",
      created_at: "invalid-timestamp",
      event_date: "2026-10-12",
      start_time: "16:00",
      venue: "Gaming Hub",
      active: true,
      registration_open: true,
      registration_type: "individual",
      min_team_size: null,
      max_team_size: null,
      registration_fee: 200,
      payment_type: "paid",
      payment_unit: "per_student",
      registration_count: 8,
    },
  ];

  it("1. Default sort preserves the original incoming order", () => {
    const result = runFilterAndSort({ events: sampleEvents, sortOrder: "default" });
    expect(result.map((e) => e.id)).toEqual(["evt-1", "evt-2", "evt-3", "evt-4", "evt-5"]);
  });

  it("2. Recently added orders newest-created events first based on created_at (not event_date)", () => {
    const result = runFilterAndSort({ events: sampleEvents, sortOrder: "recently-added" });
    // evt-3 (Sep 18) > evt-2 (Aug 15) > evt-1 (Aug 1) > [null / invalid at end]
    expect(result[0].id).toBe("evt-3");
    expect(result[1].id).toBe("evt-2");
    expect(result[2].id).toBe("evt-1");
  });

  it("3. Events with null or invalid created_at are placed safely at the end without throwing", () => {
    const result = runFilterAndSort({ events: sampleEvents, sortOrder: "recently-added" });
    const endIds = result.slice(3).map((e) => e.id);
    expect(endIds).toContain("evt-4");
    expect(endIds).toContain("evt-5");
  });

  it("4. Handles identical timestamps gracefully with name tie-breaking", () => {
    const identicalEvents: EventRecord[] = [
      { ...sampleEvents[0], id: "dup-b", name: "Bravo Event", created_at: "2026-09-01T10:00:00Z" },
      { ...sampleEvents[0], id: "dup-a", name: "Alpha Event", created_at: "2026-09-01T10:00:00Z" },
    ];
    const result = runFilterAndSort({ events: identicalEvents, sortOrder: "recently-added" });
    expect(result[0].name).toBe("Alpha Event");
    expect(result[1].name).toBe("Bravo Event");
  });

  it("5. Works combined with category filter", () => {
    const result = runFilterAndSort({
      events: sampleEvents,
      categoryFilter: "technical",
      sortOrder: "recently-added",
    });
    expect(result.length).toBe(2);
    // Between evt-1 (Aug 1) and evt-2 (Aug 15), evt-2 was created more recently
    expect(result[0].id).toBe("evt-2");
    expect(result[1].id).toBe("evt-1");
  });

  it("6. Works combined with search query", () => {
    const result = runFilterAndSort({
      events: sampleEvents,
      search: "hackathon",
      sortOrder: "recently-added",
    });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("evt-1");
  });

  it("7. Works combined with payment filter", () => {
    const paidResult = runFilterAndSort({
      events: sampleEvents,
      paymentFilter: "paid",
      sortOrder: "recently-added",
    });
    // Paid events: evt-3 (Sep 18), evt-1 (Aug 1), evt-5 (invalid date -> end)
    expect(paidResult.map((e) => e.id)).toEqual(["evt-3", "evt-1", "evt-5"]);

    const freeResult = runFilterAndSort({
      events: sampleEvents,
      paymentFilter: "free",
      sortOrder: "recently-added",
    });
    // Free events: evt-2 (Aug 15), evt-4 (null date -> end)
    expect(freeResult.map((e) => e.id)).toEqual(["evt-2", "evt-4"]);
  });

  it("8. Clearing filters restores default ordering and includes all events", () => {
    // Apply filters
    const filtered = runFilterAndSort({
      events: sampleEvents,
      categoryFilter: "technical",
      sortOrder: "recently-added",
    });
    expect(filtered.length).toBe(2);

    // Clear filters (restoring defaults)
    const cleared = runFilterAndSort({
      events: sampleEvents,
      categoryFilter: "All",
      search: "",
      paymentFilter: "all",
      dateFilter: "all",
      sortOrder: "default",
    });
    expect(cleared.length).toBe(sampleEvents.length);
    expect(cleared.map((e) => e.id)).toEqual(sampleEvents.map((e) => e.id));
  });

  it("9. Result count remains accurate when sorted", () => {
    const defaultOrder = runFilterAndSort({ events: sampleEvents, sortOrder: "default" });
    const recentOrder = runFilterAndSort({ events: sampleEvents, sortOrder: "recently-added" });
    expect(recentOrder.length).toBe(defaultOrder.length);
  });
});
