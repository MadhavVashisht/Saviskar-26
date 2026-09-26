import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/participants/[participantId]/route";
import { NextRequest } from "next/server";
import { resetRateLimitStore } from "@/lib/rate-limit";

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-secret-key";

const mockDbParticipants: Record<string, Record<string, unknown>> = {
  "SVK26-12345678": {
    participant_id: "SVK26-12345678",
    name: "Aarav Sharma",
    college: "IIT Bombay",
    email: "aarav.sharma@example.com",
    phone: "9876543210",
    participant_events: [
      {
        id: "pe-1",
        event_id: "evt-robotics",
        payment_status: "paid",
        payment_amount: 500,
        events: { name: "RoboWars" },
      },
    ],
  },
  "SVK26-D917882D": {
    participant_id: "SVK26-D917882D",
    name: "Anand",
    college: "CGC University",
    email: "anand.j4072@cgcuniversity.in",
    phone: "9876500000",
    participant_events: [],
    participant_event_members: [
      {
        id: "pem-1",
        participant_event_id: "pe-chords-1",
        participant_events: {
          id: "pe-chords-1",
          event_id: "evt-chords",
          payment_status: "paid",
          payment_amount: 15,
          events: { name: "Clash of Chords" },
        },
      },
    ],
  },
  "SVK26-MULTI001": {
    participant_id: "SVK26-MULTI001",
    name: "Priya Patel",
    college: "NIT Trichy",
    email: "priya.patel@example.com",
    phone: "9876511111",
    participant_events: [],
    participant_event_members: [
      {
        id: "pem-m1",
        participant_event_id: "pe-chords-1",
        participant_events: {
          id: "pe-chords-1",
          event_id: "evt-chords",
          payment_status: "paid",
          payment_amount: 15,
          events: { name: "Clash of Chords" },
        },
      },
      {
        id: "pem-m2",
        participant_event_id: "pe-hack-1",
        participant_events: {
          id: "pe-hack-1",
          event_id: "evt-hackathon",
          payment_status: "pending",
          payment_amount: 300,
          events: { name: "HackSaviskar" },
        },
      },
    ],
  },
  "SVK26-NOREG001": {
    participant_id: "SVK26-NOREG001",
    name: "Rahul Verma",
    college: "BITS Pilani",
    email: "rahul.verma@example.com",
    phone: "9876522222",
    participant_events: [],
    participant_event_members: [],
  },
  "SVK26-LEADER01": {
    participant_id: "SVK26-LEADER01",
    name: "Vikram Singh",
    college: "IIT Delhi",
    email: "vikram.singh@example.com",
    phone: "9876533333",
    participant_events: [
      {
        id: "pe-lead-1",
        event_id: "evt-robotics",
        payment_status: "paid",
        payment_amount: 500,
        events: { name: "RoboWars" },
      },
    ],
    participant_event_members: [
      {
        id: "pem-lead-1",
        participant_event_id: "pe-lead-1",
        participant_events: {
          id: "pe-lead-1",
          event_id: "evt-robotics",
          payment_status: "paid",
          payment_amount: 500,
          events: { name: "RoboWars" },
        },
      },
    ],
  },
  "SVK26-ARCHIVED": {
    participant_id: "SVK26-ARCHIVED",
    name: "Archived User",
    college: "IIT Bombay",
    email: "archived.user@example.com",
    phone: "9876544444",
    participant_events: [
      {
        id: "pe-archived-1",
        event_id: "evt-robotics",
        payment_status: "paid",
        payment_amount: 500,
        is_archived: true,
        events: { name: "RoboWars" },
      },
    ],
  },
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: (_col: string, val: string) => ({
          maybeSingle: async () => {
            const p = mockDbParticipants[val];
            if (!p) return { data: null, error: null };
            return { data: p, error: null };
          },
        }),
      }),
    }),
  }),
}));

function makeRequest(participantId: string, emailQuery?: string): [NextRequest, { params: Promise<{ participantId: string }> }] {
  const url = emailQuery !== undefined
    ? `http://localhost/api/participants/${participantId}?email=${encodeURIComponent(emailQuery)}`
    : `http://localhost/api/participants/${participantId}`;

  const req = new NextRequest(url, { method: "GET" });
  return [req, { params: Promise.resolve({ participantId }) }];
}

describe("P1-03: Participant Lookup API Ownership Challenge & PII Masking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
  });

  it("A. Correct participant ID + correct email -> allowed with masked PII", async () => {
    const [req, ctx] = makeRequest("SVK26-12345678", "aarav.sharma@example.com");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.participant.participantId).toBe("SVK26-12345678");
    expect(body.participant.name).toBe("Aarav Sharma");
    expect(body.participant.college).toBe("IIT Bombay");

    // Authoritative PII Masking: email and phone MUST be masked
    expect(body.participant.email).toBe("a***@example.com");
    expect(body.participant.phone).toBe("98*****10");

    // Events summary returned
    expect(body.events).toHaveLength(1);
    expect(body.events[0].eventName).toBe("RoboWars");
  });

  it("B. Case and whitespace normalization on email works", async () => {
    const [req, ctx] = makeRequest("SVK26-12345678", "  AaRav.ShARma@Example.COM  ");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.participant.name).toBe("Aarav Sharma");
  });

  it("C. Correct ID + wrong email -> returns 404 (non-enumerating)", async () => {
    const [req, ctx] = makeRequest("SVK26-12345678", "wrong.email@example.com");
    const res = await GET(req, ctx);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Participant not found.");
    expect(body.participant).toBeUndefined();
  });

  it("D. Nonexistent ID -> returns 404 (identical response to wrong email)", async () => {
    const [req, ctx] = makeRequest("SVK26-99999999", "anyone@example.com");
    const res = await GET(req, ctx);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Participant not found.");
  });

  it("E. Missing email parameter -> returns 400 bad request", async () => {
    const [req, ctx] = makeRequest("SVK26-12345678");
    const res = await GET(req, ctx);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Participant ID and registered email are required.");
  });

  it("F. Malformed email -> returns 400 bad request", async () => {
    const [req, ctx] = makeRequest("SVK26-12345678", "not-an-email");
    const res = await GET(req, ctx);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Invalid email format.");
  });

  it("G. Malformed participant ID format -> returns 400 bad request", async () => {
    const [req, ctx] = makeRequest("INVALID-ID", "aarav.sharma@example.com");
    const res = await GET(req, ctx);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Invalid participant ID.");
  });

  it("H. Rate limit enforcement: 10 requests allowed, 11th request receives 429", async () => {
    resetRateLimitStore();

    // Perform 10 requests
    for (let i = 0; i < 10; i++) {
      const [req, ctx] = makeRequest("SVK26-12345678", "aarav.sharma@example.com");
      const res = await GET(req, ctx);
      expect(res.status).toBe(200);
    }

    // 11th request must be blocked
    const [blockedReq, blockedCtx] = makeRequest("SVK26-12345678", "aarav.sharma@example.com");
    const blockedRes = await GET(blockedReq, blockedCtx);
    expect(blockedRes.status).toBe(429);

    const data = await blockedRes.json();
    expect(data.error).toContain("Too many lookup attempts");
  });

  it("I. Nonexistent participant and wrong email produce IDENTICAL JSON response and status", async () => {
    const [reqNonexistent, ctxNonexistent] = makeRequest("SVK26-99999999", "anyone@example.com");
    const resNonexistent = await GET(reqNonexistent, ctxNonexistent);

    const [reqWrongEmail, ctxWrongEmail] = makeRequest("SVK26-12345678", "wrong.email@example.com");
    const resWrongEmail = await GET(reqWrongEmail, ctxWrongEmail);

    expect(resNonexistent.status).toBe(resWrongEmail.status);
    expect(resNonexistent.status).toBe(404);

    const bodyNonexistent = await resNonexistent.json();
    const bodyWrongEmail = await resWrongEmail.json();
    expect(bodyNonexistent).toEqual(bodyWrongEmail);
  });

  it("J. Response does not leak internal UUIDs, payment secrets, or admin fields", async () => {
    const [req, ctx] = makeRequest("SVK26-12345678", "aarav.sharma@example.com");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);

    const body = await res.json();
    // Verify participant object contains no internal DB UUID or secret
    expect(body.participant.id).toBeUndefined();
    expect(body.participant._id).toBeUndefined();
    expect(body.participant.secret).toBeUndefined();
    expect(body.participant.token).toBeUndefined();
    expect(body.participant.role).toBeUndefined();

    // Verify raw email and phone are not leaked
    expect(body.participant.email).not.toBe("aarav.sharma@example.com");
    expect(body.participant.phone).not.toBe("9876543210");

    // Verify events contain no gateway credentials
    for (const evt of body.events) {
      expect(evt.gateway_order_id).toBeUndefined();
      expect(evt.gateway_payment_id).toBeUndefined();
      expect(evt.secret).toBeUndefined();
    }
  });

  it("K. Case B: Team-member participant retrieves team event via participant_event_members", async () => {
    const [req, ctx] = makeRequest("SVK26-D917882D", "anand.j4072@cgcuniversity.in");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.participant.participantId).toBe("SVK26-D917882D");
    expect(body.participant.name).toBe("Anand");
    expect(body.participant.college).toBe("CGC University");
    expect(body.participant.email).toBe("a***@cgcuniversity.in");

    // Events must include the team event
    expect(body.events).toHaveLength(1);
    expect(body.events[0].participantEventId).toBe("pe-chords-1");
    expect(body.events[0].eventId).toBe("evt-chords");
    expect(body.events[0].eventName).toBe("Clash of Chords");
    expect(body.events[0].paymentStatus).toBe("paid");
    expect(body.events[0].paymentAmount).toBe(15);
  });

  it("L. Case E: Participant belonging to multiple team events retrieves all applicable events", async () => {
    const [req, ctx] = makeRequest("SVK26-MULTI001", "priya.patel@example.com");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.events).toHaveLength(2);

    const eventNames = body.events.map((e: { eventName: string }) => e.eventName);
    expect(eventNames).toContain("Clash of Chords");
    expect(eventNames).toContain("HackSaviskar");
  });

  it("M. Case F: Participant with no registrations returns an empty events list", async () => {
    const [req, ctx] = makeRequest("SVK26-NOREG001", "rahul.verma@example.com");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.events).toEqual([]);
  });

  it("N. Deduplication: Team leader present in both participant_events and participant_event_members has no duplicates", async () => {
    const [req, ctx] = makeRequest("SVK26-LEADER01", "vikram.singh@example.com");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.events).toHaveLength(1);
    expect(body.events[0].participantEventId).toBe("pe-lead-1");
    expect(body.events[0].eventName).toBe("RoboWars");
  });

  it("O. Soft-deleted/archived registrations (is_archived = true) are excluded from active events", async () => {
    const [req, ctx] = makeRequest("SVK26-ARCHIVED", "archived.user@example.com");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.events).toEqual([]);
  });
});
