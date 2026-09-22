import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/register/route";
import { NextRequest } from "next/server";
import { createRegistrationSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

// Mock Supabase environment
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-supabase-secret";
process.env.SESSION_SECRET = "test-session-secret-high-entropy-32bytes";

const mockRpc = vi.fn();

vi.mock("next/server", async (importOriginal) => {
  const mod = await importOriginal<typeof import("next/server")>();
  return {
    ...mod,
    after: vi.fn(() => {
      // no-op in unit test execution
    }),
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: mockRpc,
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  }),
}));

// Mock Next.js cookies()
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

function makeRegisterRequest(body: Record<string, unknown>, cookieHeader?: string): NextRequest {
  const headers = new Headers({
    "Content-Type": "application/json",
  });
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  return new NextRequest("http://localhost/api/register", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("Section 5: Registration API Authentication Boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("1. Missing registration session -> returns 401 and prevents DB access", async () => {
    const req = makeRegisterRequest({
      name: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      college: "Test College",
      events: [{ eventId: "a0000000-0000-4000-8000-000000000001" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Registration authentication required.");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("2. Malformed session token -> returns 401", async () => {
    mockCookieStore.set(SESSION_COOKIE_NAME, "malformed-cookie-value");

    const req = makeRegisterRequest({
      name: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      college: "Test College",
      events: [{ eventId: "a0000000-0000-4000-8000-000000000001" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("3. Expired session token -> returns 401", async () => {
    const expiredToken = createRegistrationSessionToken("john@example.com", -5000);
    mockCookieStore.set(SESSION_COOKIE_NAME, expiredToken);

    const req = makeRegisterRequest({
      name: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      college: "Test College",
      events: [{ eventId: "a0000000-0000-4000-8000-000000000001" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("4. Tampered session token -> returns 401", async () => {
    const validToken = createRegistrationSessionToken("john@example.com", 60_000);
    const [payloadB64] = validToken.split(".");
    mockCookieStore.set(SESSION_COOKIE_NAME, `${payloadB64}.tamperedSignature`);

    const req = makeRegisterRequest({
      name: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      college: "Test College",
      events: [{ eventId: "a0000000-0000-4000-8000-000000000001" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("5. Valid session but submitted email does not match authenticated email -> returns 403", async () => {
    const validToken = createRegistrationSessionToken("authenticated@example.com", 60_000);
    mockCookieStore.set(SESSION_COOKIE_NAME, validToken);

    const req = makeRegisterRequest({
      name: "Attacker",
      email: "victim@example.com",
      phone: "9876543210",
      college: "Test College",
      events: [{ eventId: "a0000000-0000-4000-8000-000000000001" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(403);

    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Submitted email does not match authenticated session.");
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("6. Valid session with matching email -> proceeds through authentication", async () => {
    const validToken = createRegistrationSessionToken("legitimate@example.com", 60_000);
    mockCookieStore.set(SESSION_COOKIE_NAME, validToken);

    mockRpc.mockResolvedValueOnce({
      data: [
        {
          participant_id: "SVK26-TEST1234",
          participant_event_id: "pe-uuid-1",
          event_id: "a0000000-0000-4000-8000-000000000001",
          event_name: "Code Wars",
          status: "success",
        },
      ],
      error: null,
    });

    const req = makeRegisterRequest({
      name: "Legit User",
      email: "legitimate@example.com",
      phone: "9876543210",
      college: "Test College",
      events: [{ eventId: "a0000000-0000-4000-8000-000000000001" }],
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.participantId).toBe("SVK26-TEST1234");
    expect(mockRpc).toHaveBeenCalledWith("register_participant_events", expect.anything());
  });
});
