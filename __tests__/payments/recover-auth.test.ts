import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/payments/recover/route";
import { NextRequest } from "next/server";
import { createRegistrationSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { createPaymentResumeToken } from "@/lib/payments/resume-token";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-secret-key-32bytes-for-hmac";
process.env.SESSION_SECRET = "test-session-secret-high-entropy-32bytes";
process.env.PAYMENT_RESUME_TOKEN_SECRET = "test-resume-secret-high-entropy-32bytes";

const mockDbParticipantEvents: Record<string, Record<string, unknown>> = {
  "pe-alice-1": {
    id: "pe-alice-1",
    payment_status: "pending",
    event_id: "evt-robo",
    payment_amount: 400,
    participants: {
      id: "uuid-alice",
      participant_id: "SVK26-ALICE001",
      email: "alice@example.com",
    },
    events: {
      payment_type: "paid",
    },
  },
  "pe-bob-1": {
    id: "pe-bob-1",
    payment_status: "pending",
    event_id: "evt-hack",
    payment_amount: 600,
    participants: {
      id: "uuid-bob",
      participant_id: "SVK26-BOB00002",
      email: "bob@example.com",
    },
    events: {
      payment_type: "paid",
    },
  },
  "pe-alice-paid": {
    id: "pe-alice-paid",
    payment_status: "paid",
    event_id: "evt-robo",
    payment_amount: 400,
    participants: {
      id: "uuid-alice",
      participant_id: "SVK26-ALICE001",
      email: "alice@example.com",
    },
    events: {
      payment_type: "paid",
    },
  },
};

const mockDbExistingOrderItems: Record<string, Record<string, unknown>> = {
  "pe-alice-1": {
    payment_order_id: "po-alice-pending",
    participant_id: "uuid-alice",
    payment_orders: {
      id: "po-alice-pending",
      status: "pending",
      payer_participant_id: "uuid-alice",
    },
  },
};

vi.mock("@supabase/supabase-js", () => {
  const createQueryBuilder = (table: string, filters: Record<string, string> = {}) => ({
    eq: (col: string, val: string) => createQueryBuilder(table, { ...filters, [col]: val }),
    limit: () => createQueryBuilder(table, filters),
    maybeSingle: async () => {
      if (table === "participant_events") {
        const peId = filters["id"];
        return { data: mockDbParticipantEvents[peId || ""] || null, error: null };
      }
      if (table === "payment_order_items") {
        const peId = filters["participant_event_id"];
        return { data: mockDbExistingOrderItems[peId || ""] || null, error: null };
      }
      return { data: null, error: null };
    },
  });

  return {
    createClient: () => ({
      from: (table: string) => ({
        select: () => createQueryBuilder(table),
        insert: () => ({
          select: () => ({
            single: async () => ({
              data: { id: "po-new-recovered-order" },
              error: null,
            }),
          }),
          then: (resolve: (val: unknown) => void) => resolve({ error: null }),
        }),
      }),
    }),
  };
});

const mockCookieStore: Map<string, string> = new Map();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const val = mockCookieStore.get(name);
      return val ? { name, value: val } : undefined;
    },
    set: (name: string, val: string) => {
      mockCookieStore.set(name, val);
    },
    delete: (name: string) => {
      mockCookieStore.delete(name);
    },
  }),
}));

function makeRequest(
  body: Record<string, unknown>,
  headersObj?: Record<string, string>
): NextRequest {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...(headersObj || {}),
  });

  return new NextRequest("http://localhost/api/payments/recover", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("Section 9 & 10: Payment Recovery Authorization & Ownership Chain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("1. No session and no token -> returns 401", async () => {
    const req = makeRequest({
      participantId: "SVK26-ALICE001",
      participantEventId: "pe-alice-1",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("authorization required");
  });

  it("2. User B session + User A registration -> rejected with 403", async () => {
    const bobSession = createRegistrationSessionToken("bob@example.com", 60_000);
    mockCookieStore.set(SESSION_COOKIE_NAME, bobSession);

    const req = makeRequest({
      participantId: "SVK26-ALICE001",
      participantEventId: "pe-alice-1",
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Unauthorized");
  });

  it("3. User B token + User A registration event -> rejected with 403", async () => {
    const bobToken = createPaymentResumeToken({
      paymentOrderId: "po-bob-pending",
      participantId: "SVK26-BOB00002",
      payerParticipantUuid: "uuid-bob",
      expiresInMs: 60_000,
      secretOverride: process.env.PAYMENT_RESUME_TOKEN_SECRET,
    });

    const req = makeRequest({
      participantId: "SVK26-ALICE001",
      participantEventId: "pe-alice-1",
      resumeToken: bobToken,
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("4. Expired or tampered resume token -> rejected with 403", async () => {
    const req = makeRequest({
      participantId: "SVK26-ALICE001",
      participantEventId: "pe-alice-1",
      resumeToken: "malformed.or.tampered.token",
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("5. Valid Alice session recovers Alice registration -> returns existing pending order (200)", async () => {
    const aliceSession = createRegistrationSessionToken("alice@example.com", 60_000);
    mockCookieStore.set(SESSION_COOKIE_NAME, aliceSession);

    const req = makeRequest({
      participantId: "SVK26-ALICE001",
      participantEventId: "pe-alice-1",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.paymentOrderId).toBe("po-alice-pending");
  });

  it("6. Valid Alice resume token recovers Alice registration -> returns existing pending order (200)", async () => {
    const aliceToken = createPaymentResumeToken({
      paymentOrderId: "po-alice-pending",
      participantId: "SVK26-ALICE001",
      payerParticipantUuid: "uuid-alice",
      expiresInMs: 60_000,
      secretOverride: process.env.PAYMENT_RESUME_TOKEN_SECRET,
    });

    const req = makeRequest({
      participantId: "SVK26-ALICE001",
      participantEventId: "pe-alice-1",
      resumeToken: aliceToken,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.paymentOrderId).toBe("po-alice-pending");
  });

  it("7. Alice token with mismatched paymentOrderId -> rejected with 403", async () => {
    const aliceTokenWrongOrder = createPaymentResumeToken({
      paymentOrderId: "po-other-order",
      participantId: "SVK26-ALICE001",
      payerParticipantUuid: "uuid-alice",
      expiresInMs: 60_000,
      secretOverride: process.env.PAYMENT_RESUME_TOKEN_SECRET,
    });

    const req = makeRequest({
      participantId: "SVK26-ALICE001",
      participantEventId: "pe-alice-1",
      resumeToken: aliceTokenWrongOrder,
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Payment token does not match this order");
  });

  it("8. Attempting to recover already-paid event -> rejected with 400", async () => {
    const aliceSession = createRegistrationSessionToken("alice@example.com", 60_000);
    mockCookieStore.set(SESSION_COOKIE_NAME, aliceSession);

    const req = makeRequest({
      participantId: "SVK26-ALICE001",
      participantEventId: "pe-alice-paid",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Payment is already completed");
  });
});
