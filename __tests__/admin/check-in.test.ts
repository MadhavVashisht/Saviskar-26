import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/admin/check-in/route";
import * as serverLib from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-secret-key";

const mockDbState: {
  participantEvents: Record<
    string,
    {
      id: string;
      payment_status: string;
      checked_in: boolean;
      checked_in_at: string | null;
      events: { payment_amount: number };
    }
  >;
} = {
  participantEvents: {},
};

function createMockSupabaseAdmin() {
  return {
    from: (table: string) => {
      if (table === "participant_events") {
        return {
          select: (_columns: string) => ({
            eq: (column: string, value: string) => ({
              single: async () => {
                if (column === "id") {
                  const record = mockDbState.participantEvents[value];
                  if (!record) {
                    return { data: null, error: { message: "Not found" } };
                  }
                  return { data: record, error: null };
                }
                return { data: null, error: { message: "Not found" } };
              },
            }),
          }),
          update: (updates: { checked_in: boolean; checked_in_at: string | null }) => {
            let targetId: string | null = null;
            let requiredPaymentStatus: string | null = null;

            const chain = {
              eq: (col: string, val: string) => {
                if (col === "id") targetId = val;
                if (col === "payment_status") requiredPaymentStatus = val;
                return chain;
              },
              select: () => ({
                single: async () => {
                  if (!targetId || !mockDbState.participantEvents[targetId]) {
                    return { data: null, error: { message: "Not found" } };
                  }
                  const rec = mockDbState.participantEvents[targetId];
                  if (requiredPaymentStatus && rec.payment_status !== requiredPaymentStatus) {
                    return { data: null, error: null }; // Condition failed, 0 rows updated
                  }
                  rec.checked_in = updates.checked_in;
                  rec.checked_in_at = updates.checked_in_at;
                  return { data: rec, error: null };
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
  createClient: () => createMockSupabaseAdmin(),
}));

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/admin/check-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("P0-02: Check-In API Payment Gate Enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDbState.participantEvents = {
      // Free event (amount = 0, status = not_required)
      "pe-free": {
        id: "pe-free",
        payment_status: "not_required",
        checked_in: false,
        checked_in_at: null,
        events: { payment_amount: 0 },
      },
      // Paid event with completed payment (amount = 200, status = paid)
      "pe-paid-ok": {
        id: "pe-paid-ok",
        payment_status: "paid",
        checked_in: false,
        checked_in_at: null,
        events: { payment_amount: 200 },
      },
      // Paid event with pending payment (amount = 200, status = pending)
      "pe-paid-pending": {
        id: "pe-paid-pending",
        payment_status: "pending",
        checked_in: false,
        checked_in_at: null,
        events: { payment_amount: 200 },
      },
      // Paid event with failed payment (amount = 200, status = failed)
      "pe-paid-failed": {
        id: "pe-paid-failed",
        payment_status: "failed",
        checked_in: false,
        checked_in_at: null,
        events: { payment_amount: 200 },
      },
      // Paid event with missing / refunded payment (amount = 200, status = refunded)
      "pe-paid-refunded": {
        id: "pe-paid-refunded",
        payment_status: "refunded",
        checked_in: false,
        checked_in_at: null,
        events: { payment_amount: 200 },
      },
    };

    // Default: Authenticated Admin
    vi.spyOn(serverLib, "requireAdmin").mockResolvedValue({
      supabase: {} as any,
      user: { id: "admin-uuid", email: "admin@example.com" } as any,
      role: "admin",
      error: null,
      status: 200,
    });
  });

  it("A. Free event -> check-in allowed", async () => {
    const res = await POST(makeRequest({ participantEventId: "pe-free", action: "check_in" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.checked_in).toBe(true);
    expect(mockDbState.participantEvents["pe-free"].checked_in).toBe(true);
  });

  it("B. Paid event + paid status -> check-in allowed", async () => {
    const res = await POST(makeRequest({ participantEventId: "pe-paid-ok", action: "check_in" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.checked_in).toBe(true);
    expect(mockDbState.participantEvents["pe-paid-ok"].checked_in).toBe(true);
  });

  it("C. Paid event + pending status -> denied with 402 Payment Required", async () => {
    const res = await POST(makeRequest({ participantEventId: "pe-paid-pending", action: "check_in" }));
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Payment not complete");
    expect(data.paymentStatus).toBe("pending");
    expect(mockDbState.participantEvents["pe-paid-pending"].checked_in).toBe(false);
  });

  it("D. Paid event + failed status -> denied with 402 Payment Required", async () => {
    const res = await POST(makeRequest({ participantEventId: "pe-paid-failed", action: "check_in" }));
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Payment not complete");
    expect(data.paymentStatus).toBe("failed");
    expect(mockDbState.participantEvents["pe-paid-failed"].checked_in).toBe(false);
  });

  it("E. Paid event + refunded status -> denied with 402 Payment Required", async () => {
    const res = await POST(makeRequest({ participantEventId: "pe-paid-refunded", action: "check_in" }));
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Payment not complete");
    expect(data.paymentStatus).toBe("refunded");
    expect(mockDbState.participantEvents["pe-paid-refunded"].checked_in).toBe(false);
  });

  it("F. Invalid participantEventId -> denied safely with 404", async () => {
    const res = await POST(makeRequest({ participantEventId: "nonexistent-id", action: "check_in" }));
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Participant event not found.");
  });

  it("G. Already checked-in -> idempotent check-in succeeds", async () => {
    mockDbState.participantEvents["pe-paid-ok"].checked_in = true;
    mockDbState.participantEvents["pe-paid-ok"].checked_in_at = new Date().toISOString();

    const res = await POST(makeRequest({ participantEventId: "pe-paid-ok", action: "check_in" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.checked_in).toBe(true);
  });

  it("H. Check-out action works regardless of payment gate", async () => {
    mockDbState.participantEvents["pe-paid-ok"].checked_in = true;

    const res = await POST(makeRequest({ participantEventId: "pe-paid-ok", action: "check_out" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.checked_in).toBe(false);
    expect(data.checked_in_at).toBe(null);
  });

  it("I. Forged client payment status in body cannot bypass server gate", async () => {
    // Attempting to send { payment_status: 'paid' } in body for a pending event
    const res = await POST(
      makeRequest({
        participantEventId: "pe-paid-pending",
        action: "check_in",
        payment_status: "paid",
        paymentStatus: "paid",
      })
    );
    expect(res.status).toBe(402);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.paymentStatus).toBe("pending");
  });

  it("J. Unauthorized user -> denied with 401", async () => {
    vi.spyOn(serverLib, "requireAdmin").mockResolvedValueOnce({
      supabase: {} as any,
      user: null,
      role: null,
      error: "Unauthorized" as const,
      status: 401,
    });

    const res = await POST(makeRequest({ participantEventId: "pe-paid-ok", action: "check_in" }));
    expect(res.status).toBe(401);
  });
});
