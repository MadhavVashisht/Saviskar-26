import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/payments/webhook/route";
import { NextRequest } from "next/server";
import { createHmac } from "crypto";

const TEST_WEBHOOK_SECRET = "test_webhook_secret_32bytes_value";
process.env.RAZORPAY_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test_supabase_secret";
process.env.RAZORPAY_KEY_ID = "rzp_test_key_id";
process.env.RAZORPAY_KEY_SECRET = "rzp_test_key_secret";

const mockDbPaymentOrders: Record<string, Record<string, unknown>> = {
  "order_GATEWAY_100": {
    id: "po-100",
    status: "pending",
    payer_participant_id: "part-100",
    amount: 500, // ₹500 = 50000 paise
    currency: "INR",
    gateway_order_id: "order_GATEWAY_100",
  },
  "order_GATEWAY_ALREADY_PAID": {
    id: "po-paid",
    status: "paid",
    payer_participant_id: "part-100",
    amount: 500,
    currency: "INR",
    gateway_order_id: "order_GATEWAY_ALREADY_PAID",
  },
};

const processedEvents = new Set<string>();
const updatedOrders: Record<string, unknown> = {};

let mockFetchPaymentDetailsResult: Record<string, unknown> | null = null;

vi.mock("@/lib/payments", () => {
  return {
    getPaymentGateway: () => ({
      name: "razorpay",
      validateWebhook: (params: { body: string; signature: string }) => {
        const expectedSig = createHmac("sha256", TEST_WEBHOOK_SECRET)
          .update(params.body)
          .digest("hex");

        if (params.signature !== expectedSig) {
          return { valid: false, error: "Invalid webhook signature." };
        }

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(params.body);
        } catch {
          return { valid: false, error: "Invalid JSON" };
        }

        const paymentEntity = (payload?.payload as Record<string, unknown>)?.payment as Record<string, unknown>;
        const entity = paymentEntity?.entity as Record<string, unknown> | undefined;

        return {
          valid: true,
          event: {
            eventType: payload.event as string,
            gatewayOrderId: (entity?.order_id as string) || "",
            gatewayPaymentId: (entity?.id as string) || "",
            status: payload.event === "payment.captured" ? "paid" : "failed",
            amount: typeof entity?.amount === "number" ? entity.amount : undefined,
            currency: typeof entity?.currency === "string" ? entity.currency : undefined,
            rawPayload: payload,
          },
        };
      },
      fetchPaymentDetails: async () => {
        if (!mockFetchPaymentDetailsResult) {
          throw new Error("fetchPaymentDetails mock not configured");
        }
        return mockFetchPaymentDetailsResult;
      },
    }),
  };
});

vi.mock("@/lib/payments/post-payment", () => ({
  ensurePaymentConfirmationSent: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: (_col: string, val: string) => ({
          maybeSingle: async () => {
            if (table === "payment_orders") {
              return { data: mockDbPaymentOrders[val] || null, error: null };
            }
            if (table === "payments") {
              return { data: null, error: null };
            }
            return { data: null, error: null };
          },
          then: (resolve: (val: unknown) => void) => {
            if (table === "payment_order_items") {
              resolve({ data: [{ participant_event_id: "pe-1", participant_id: "part-100" }], error: null });
            } else {
              resolve({ data: null, error: null });
            }
          },
        }),
      }),
      insert: (record: Record<string, unknown>) => ({
        select: () => ({
          maybeSingle: async () => {
            if (table === "processed_payment_events") {
              const key = `${record.payment_id}:${record.event_type}`;
              if (processedEvents.has(key)) {
                return { data: null, error: { code: "23505", message: "unique violation" } };
              }
              processedEvents.add(key);
              return { data: { id: "claim-id-1" }, error: null };
            }
            return { data: { id: "inserted-id" }, error: null };
          },
        }),
        then: (resolve: (val: unknown) => void) => resolve({ error: null }),
      }),
      update: (fields: Record<string, unknown>) => ({
        eq: (_col: string, val: string) => {
          updatedOrders[val] = fields;
          return {
            then: (resolve: (val: unknown) => void) => resolve({ error: null }),
          };
        },
        in: () => ({
          then: (resolve: (val: unknown) => void) => resolve({ error: null }),
        }),
      }),
    }),
  }),
}));

function makeWebhookRequest(payload: Record<string, unknown>, signatureOverride?: string): NextRequest {
  const body = JSON.stringify(payload);
  const signature =
    signatureOverride ??
    createHmac("sha256", TEST_WEBHOOK_SECRET).update(body).digest("hex");

  return new NextRequest("http://localhost/api/payments/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-razorpay-signature": signature,
    },
    body,
  });
}

describe("Section 11 & 20: Razorpay Webhook Defense-In-Depth Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    processedEvents.clear();
    for (const key of Object.keys(updatedOrders)) delete updatedOrders[key];
    mockFetchPaymentDetailsResult = null;
  });

  it("1. Invalid HMAC signature -> rejected with 400", async () => {
    const req = makeWebhookRequest(
      { event: "payment.captured", payload: {} },
      "invalid_signature_hex"
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("2. Valid HMAC with nonexistent gateway order -> returns safe 200 without DB update", async () => {
    const req = makeWebhookRequest({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_unknown",
            order_id: "order_NONEXISTENT",
            amount: 50000,
            currency: "INR",
          },
        },
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(updatedOrders["po-100"]).toBeUndefined();
  });

  it("3. Valid HMAC with mismatched amount -> rejected with 400 and does NOT mark paid", async () => {
    // Internal amount is ₹500 (50000 paise). Webhook claims 100 paise (₹1).
    const req = makeWebhookRequest({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_tampered_amount",
            order_id: "order_GATEWAY_100",
            amount: 100, // WRONG AMOUNT!
            currency: "INR",
          },
        },
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("Amount mismatch");
    expect(updatedOrders["po-100"]).toBeUndefined();
  });

  it("4. Valid HMAC with mismatched currency -> rejected with 400 and does NOT mark paid", async () => {
    // Internal currency is INR. Webhook claims USD.
    const req = makeWebhookRequest({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_tampered_currency",
            order_id: "order_GATEWAY_100",
            amount: 50000,
            currency: "USD", // WRONG CURRENCY!
          },
        },
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("Currency mismatch");
    expect(updatedOrders["po-100"]).toBeUndefined();
  });

  it("5. Missing amount/currency in webhook payload -> triggers server-to-server Razorpay lookup", async () => {
    mockFetchPaymentDetailsResult = {
      gatewayPaymentId: "pay_lookup_ok",
      gatewayOrderId: "order_GATEWAY_100",
      status: "captured",
      amount: 50000,
      currency: "INR",
    };

    // Payload has no amount/currency
    const req = makeWebhookRequest({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_lookup_ok",
            order_id: "order_GATEWAY_100",
          },
        },
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(updatedOrders["po-100"]).toMatchObject({ status: "paid" });
  });

  it("6. Server-to-server Razorpay lookup returns wrong amount -> rejected and does NOT mark paid", async () => {
    mockFetchPaymentDetailsResult = {
      gatewayPaymentId: "pay_lookup_wrong_amount",
      gatewayOrderId: "order_GATEWAY_100",
      status: "captured",
      amount: 10000, // ₹100 instead of ₹500
      currency: "INR",
    };

    const req = makeWebhookRequest({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_lookup_wrong_amount",
            order_id: "order_GATEWAY_100",
          },
        },
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(updatedOrders["po-100"]).toBeUndefined();
  });

  it("7. Valid matching webhook -> successfully updates status to paid", async () => {
    const req = makeWebhookRequest({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_legit_001",
            order_id: "order_GATEWAY_100",
            amount: 50000,
            currency: "INR",
          },
        },
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(updatedOrders["po-100"]).toMatchObject({
      status: "paid",
      gateway_payment_id: "pay_legit_001",
    });
  });

  it("8. Duplicate webhook -> idempotent claim prevents duplicate processing", async () => {
    // Prime processedEvents
    processedEvents.add("pay_legit_001:payment.captured");

    const req = makeWebhookRequest({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_legit_001",
            order_id: "order_GATEWAY_100",
            amount: 50000,
            currency: "INR",
          },
        },
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    // Should NOT have updated orders because idempotency intercepted it
    expect(updatedOrders["po-100"]).toBeUndefined();
  });

  it("9. Order already in paid state -> safe idempotent 200 without re-mutation", async () => {
    const req = makeWebhookRequest({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_already_done",
            order_id: "order_GATEWAY_ALREADY_PAID",
            amount: 50000,
            currency: "INR",
          },
        },
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(updatedOrders["po-paid"]).toBeUndefined();
  });
});
