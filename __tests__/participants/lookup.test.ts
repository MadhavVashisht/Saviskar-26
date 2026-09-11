import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/participants/[participantId]/route";
import { NextRequest } from "next/server";
import { resetRateLimitStore } from "@/lib/rate-limit";

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-secret-key";

const mockDbParticipants: Record<string, any> = {
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
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: (_cols: string) => ({
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
});
