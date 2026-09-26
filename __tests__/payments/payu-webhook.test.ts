import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/payments/webhook/route";
import { NextRequest } from "next/server";
import crypto from "crypto";

const TEST_SALT = "test-salt-for-webhook";
const TEST_KEY = "test-key-for-webhook";

// Same chain stub from previous concurrent test
function makeThenableChain(maybySingleOverride?: () => Promise<{ data: unknown; error: unknown }>): Record<string, unknown> {
  const defaultResolve = () => Promise.resolve({ data: null, error: null });
  const terminalFn = maybySingleOverride ?? defaultResolve;
  function then(this: void, onFulfilled: (v: { data: null; error: null }) => unknown) {
    return Promise.resolve({ data: null, error: null }).then(onFulfilled);
  }
  const chain: Record<string, unknown> = {
    then, catch: () => chain, finally: () => chain, select: () => chain, eq: () => chain,
    in: () => chain, not: () => chain, is: () => chain, or: () => chain, limit: () => chain,
    order: () => chain, update: () => chain, insert: () => chain, upsert: () => chain,
    delete: () => chain, maybeSingle: terminalFn, single: terminalFn,
  };
  return chain;
}

let peInsertCallCount = 0;

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: () => ({
      from: (table: string) => {
        if (table === "payment_orders") {
          return {
            select: () => makeThenableChain(() => Promise.resolve({
              data: {
                id: "po_uuid_001",
                status: "pending",
                payer_participant_id: "payer_uuid_001",
                amount: 299,
                currency: "INR",
                gateway_order_id: "txnid_001"
              },
              error: null,
            })),
            update: () => makeThenableChain(),
          };
        }
        if (table === "processed_payment_events") {
          peInsertCallCount += 1;
          const thisCallNumber = peInsertCallCount;
          return {
            insert: () => makeThenableChain(() => {
              if (thisCallNumber >= 2) {
                return Promise.resolve({
                  data: null,
                  error: { code: "23505", message: "duplicate key value" },
                });
              }
              return Promise.resolve({ data: { id: "event-claim-1" }, error: null });
            }),
            select: () => makeThenableChain(),
          };
        }
        return makeThenableChain();
      }
    })
  }
});

vi.mock("@/lib/payments/post-payment", () => ({
  ensurePaymentConfirmationSent: vi.fn(),
}));

describe("PayU Webhook Idempotency & Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    peInsertCallCount = 0;
    process.env.PAYU_ENVIRONMENT = "test";
    process.env.PAYU_KEY = TEST_KEY;
    process.env.PAYU_SALT = TEST_SALT;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.SUPABASE_SECRET_KEY = "test-service-role-key-concurrent";
  });

  it("7 & 8. Duplicate webhook is handled safely via idempotency (processed once)", async () => {
    // Generate valid payload and hash
    const body = new URLSearchParams({
      status: "success",
      email: "test@example.com",
      firstname: "Test",
      productinfo: "info",
      amount: "299.00",
      txnid: "txnid_001",
      key: TEST_KEY,
      mihpayid: "pay_001"
    });
    
    // Reverse Hash
    const hashString = `${TEST_SALT}|success|||||||||||test@example.com|Test|info|299.00|txnid_001|${TEST_KEY}`;
    const validHash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
    body.append("hash", validHash);
    
    const makeReq = () => new NextRequest("http://localhost/api/payments/webhook", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const [res1, res2] = await Promise.all([
      POST(makeReq()),
      POST(makeReq()),
    ]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(peInsertCallCount).toBe(2);
    
    const { ensurePaymentConfirmationSent } = await import("@/lib/payments/post-payment");
    expect(ensurePaymentConfirmationSent).toHaveBeenCalledTimes(1);
  });
  
  it("9. Webhook amount mismatch is rejected (Database expected 299, Webhook 10.00)", async () => {
    const body = new URLSearchParams({
      status: "success",
      email: "test@example.com",
      firstname: "Test",
      productinfo: "info",
      amount: "10.00", // Mismatch
      txnid: "txnid_001",
      key: TEST_KEY,
      mihpayid: "pay_001"
    });
    
    const hashString = `${TEST_SALT}|success|||||||||||test@example.com|Test|info|10.00|txnid_001|${TEST_KEY}`;
    const validHash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
    body.append("hash", validHash);
    
    const req = new NextRequest("http://localhost/api/payments/webhook", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    
    const text = await res.text();
    expect(text).toContain("Amount mismatch");
  });
});
