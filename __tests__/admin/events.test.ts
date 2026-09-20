import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH, POST } from "@/app/api/admin/events/route";
import * as serverLib from "@/lib/supabase/server";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-secret-key";

interface MockEvent {
  id: string;
  created_at?: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  venue: string | null;
  active: boolean;
  registration_open: boolean;
  registration_type: string;
  min_team_size: number | null;
  max_team_size: number | null;
  registration_fee: number;
  payment_type: string;
  payment_unit: "per_student" | "per_team" | null;
}

let mockEvents: Record<string, MockEvent> = {};
let lastUpdatedPayload: Record<string, unknown> | null = null;
let lastInsertedPayload: Record<string, unknown> | null = null;

function createMockClient() {
  return {
    from: (table: string) => {
      if (table === "events") {
        return {
          insert: (payload: Record<string, unknown>) => {
            lastInsertedPayload = payload;
            // Validate PostgreSQL check constraint: events_payment_unit_check
            // (payment_unit IS NULL OR payment_unit = ANY (ARRAY['per_student', 'per_team']))
            if (
              payload.payment_unit !== null &&
              payload.payment_unit !== "per_student" &&
              payload.payment_unit !== "per_team"
            ) {
              return {
                select: () => ({
                  single: async () => ({
                    data: null,
                    error: {
                      code: "23514",
                      message:
                        'new row for relation "events" violates check constraint "events_payment_unit_check"',
                    },
                  }),
                }),
              };
            }

            const newRecord: MockEvent = {
              ...(payload as unknown as MockEvent),
              id: (payload.id as string) || `evt-${Date.now()}`,
            };
            mockEvents[newRecord.id] = newRecord;

            return {
              select: () => ({
                single: async () => ({
                  data: newRecord,
                  error: null,
                }),
              }),
            };
          },

          update: (payload: Record<string, unknown>) => {
            lastUpdatedPayload = payload;
            let targetId: string | null = null;

            // Validate PostgreSQL check constraint: events_payment_unit_check
            if (
              payload.payment_unit !== null &&
              payload.payment_unit !== "per_student" &&
              payload.payment_unit !== "per_team"
            ) {
              return {
                eq: () => ({
                  select: () => ({
                    maybeSingle: async () => ({
                      data: null,
                      error: {
                        code: "23514",
                        message:
                          'new row for relation "events" violates check constraint "events_payment_unit_check"',
                      },
                    }),
                  }),
                }),
              };
            }

            const chain = {
              eq: (col: string, val: string) => {
                if (col === "id") targetId = val;
                return chain;
              },
              select: () => ({
                maybeSingle: async () => {
                  if (!targetId || !mockEvents[targetId]) {
                    return { data: null, error: null };
                  }
                  const existing = mockEvents[targetId];
                  const updated: MockEvent = {
                    ...existing,
                    ...payload,
                  };
                  mockEvents[targetId] = updated;
                  return { data: updated, error: null };
                },
              }),
            };
            return chain;
          },
        };
      }
      return {};
    },
  };
}

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => createMockClient(),
}));

describe("Admin Events API - events_payment_unit_check constraint & normalization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastUpdatedPayload = null;
    lastInsertedPayload = null;

    // Reset mock events store
    mockEvents = {
      "evt-hackathon": {
        id: "evt-hackathon",
        slug: "hackathon",
        name: "Hackathon",
        category: "technical",
        description: "24-hour hackathon",
        event_date: "2026-10-15",
        start_time: "09:00",
        venue: "Auditorium",
        active: true,
        registration_open: true,
        registration_type: "team",
        min_team_size: 2,
        max_team_size: 4,
        registration_fee: 0,
        payment_type: "free",
        payment_unit: null, // As stored in production
      },
      "evt-robotics": {
        id: "evt-robotics",
        slug: "robotics",
        name: "Robotics Combat",
        category: "technical",
        description: "Robotics war",
        event_date: "2026-10-16",
        start_time: "10:00",
        venue: "Arena",
        active: true,
        registration_open: true,
        registration_type: "team",
        min_team_size: 2,
        max_team_size: 5,
        registration_fee: 200,
        payment_type: "paid",
        payment_unit: "per_team",
      },
    };

    // Authenticate as Master Admin
    vi.spyOn(serverLib, "requireMasterAdmin").mockResolvedValue({
      supabase: {},
      user: { id: "master-uuid", email: "master@example.com" },
      role: "master",
      error: null,
      status: 200,
    } as unknown as Awaited<ReturnType<typeof serverLib.requireMasterAdmin>>);
  });

  // 1. PATCH a free event with registration_fee: 0, payment_unit: "free", and a changed name.
  //    Assert HTTP 200 and payment_unit sent/stored as null.
  it("1. PATCH free event with fee=0 and payment_unit='free' normalizes to null and returns 200", async () => {
    const req = new Request("http://localhost/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "evt-hackathon",
        name: "Hackathon 2026 Updated",
        category: "technical",
        registration_fee: 0,
        payment_unit: "free",
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.event.name).toBe("Hackathon 2026 Updated");
    expect(data.event.payment_unit).toBeNull();
    expect(data.event.payment_type).toBe("free");
    expect(lastUpdatedPayload!.payment_unit).toBeNull();
    expect(mockEvents["evt-hackathon"].payment_unit).toBeNull();
  });

  // 2. PATCH a free event with registration_fee: 0, payment_unit: null.
  //    Assert HTTP 200 and payment_unit remains null.
  it("2. PATCH free event with fee=0 and payment_unit=null preserves null and returns 200", async () => {
    const req = new Request("http://localhost/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "evt-hackathon",
        name: "Hackathon",
        category: "technical",
        registration_fee: 0,
        payment_unit: null,
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.event.payment_unit).toBeNull();
    expect(data.event.payment_type).toBe("free");
    expect(lastUpdatedPayload!.payment_unit).toBeNull();
    expect(mockEvents["evt-hackathon"].payment_unit).toBeNull();
  });

  // 3. PATCH a paid event with registration_fee: 100, payment_unit: "per_team".
  //    Assert per_team is preserved.
  it("3. PATCH paid event with fee=100 and payment_unit='per_team' preserves per_team", async () => {
    const req = new Request("http://localhost/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "evt-robotics",
        name: "Robotics Combat Pro",
        category: "technical",
        registration_fee: 100,
        payment_unit: "per_team",
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.event.payment_unit).toBe("per_team");
    expect(data.event.payment_type).toBe("paid");
    expect(data.event.registration_fee).toBe(100);
    expect(lastUpdatedPayload!.payment_unit).toBe("per_team");
    expect(mockEvents["evt-robotics"].payment_unit).toBe("per_team");
  });

  // 4. PATCH a paid event with registration_fee: 100, payment_unit: "per_student".
  //    Assert per_student is preserved.
  it("4. PATCH paid event with fee=100 and payment_unit='per_student' preserves per_student", async () => {
    const req = new Request("http://localhost/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "evt-robotics",
        name: "Robotics Solo",
        category: "technical",
        registration_fee: 100,
        payment_unit: "per_student",
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.event.payment_unit).toBe("per_student");
    expect(data.event.payment_type).toBe("paid");
    expect(data.event.registration_fee).toBe(100);
    expect(lastUpdatedPayload!.payment_unit).toBe("per_student");
    expect(mockEvents["evt-robotics"].payment_unit).toBe("per_student");
  });

  // 5. Ensure "tbd" can never reach the database as payment_unit.
  //    Either safely normalize it to null where appropriate or reject it with HTTP 400.
  describe("5. 'tbd' can NEVER reach database as payment_unit", () => {
    it("5a. Paid event with payment_unit='tbd' is rejected with HTTP 400", async () => {
      const req = new Request("http://localhost/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "evt-robotics",
          name: "Robotics TBD",
          category: "technical",
          registration_fee: 100,
          payment_unit: "tbd",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe(
        "Paid events must specify a payment unit ('per_student' or 'per_team')."
      );
      // DB was never called with "tbd"
      expect(lastUpdatedPayload).toBeNull();
      expect(mockEvents["evt-robotics"].payment_unit).toBe("per_team");
    });

    it("5b. Free event with payment_unit='tbd' safely normalizes to null", async () => {
      const req = new Request("http://localhost/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "evt-hackathon",
          name: "Hackathon TBD",
          category: "technical",
          registration_fee: 0,
          payment_unit: "tbd",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.event.payment_unit).toBeNull();
      expect(lastUpdatedPayload!.payment_unit).toBeNull();
      expect(mockEvents["evt-hackathon"].payment_unit).toBeNull();
    });
  });

  // 6. Specifically test the original bug:
  //    Load/edit the existing free Hackathon event whose database payment_unit is NULL.
  //    Change ONLY its name.
  //    Verify the PATCH succeeds and does not attempt to write payment_unit = "free".
  it("6. Original bug reproduction: Editing ONLY name of free Hackathon (with DB payment_unit=null) succeeds without constraint error", async () => {
    // Verify initial DB state matches production
    expect(mockEvents["evt-hackathon"].payment_unit).toBeNull();
    expect(mockEvents["evt-hackathon"].registration_fee).toBe(0);

    // Simulate the admin UI behavior:
    // When editing, UI converts null to "free" for dropdown, but saveEvent converts it to null before sending PATCH.
    // Even if client sent payment_unit: null OR payment_unit: "free", backend safely normalizes to null.
    const req = new Request("http://localhost/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "evt-hackathon",
        name: "Hackathon Championship",
        slug: "hackathon-championship",
        category: "technical",
        description: "24-hour hackathon",
        event_date: "2026-10-15",
        start_time: "09:00",
        venue: "Auditorium",
        active: true,
        registration_open: true,
        registration_type: "team",
        min_team_size: 2,
        max_team_size: 4,
        registration_fee: 0,
        payment_unit: null, // Safe UI submission
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.event.name).toBe("Hackathon Championship");
    expect(data.event.payment_unit).toBeNull();
    expect(lastUpdatedPayload!.payment_unit).toBeNull();
    expect(lastUpdatedPayload!.payment_unit).not.toBe("free");
    expect(mockEvents["evt-hackathon"].name).toBe("Hackathon Championship");
    expect(mockEvents["evt-hackathon"].payment_unit).toBeNull();
  });

  // Extra: Test POST route to ensure creation also normalizes payment_unit
  it("7. POST new free event with payment_unit='free' normalizes to null on creation", async () => {
    const req = new Request("http://localhost/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Coding Contest",
        category: "technical",
        registration_fee: 0,
        payment_unit: "free",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.event.payment_unit).toBeNull();
    expect(lastInsertedPayload!.payment_unit).toBeNull();
  });
});
