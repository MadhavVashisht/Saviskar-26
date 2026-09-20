import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/health/route";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn().mockImplementation(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ error: null }),
    }),
  })),
}));

describe("Health Check Endpoint (/api/health)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://mock-supabase.co",
      SUPABASE_SECRET_KEY: "mock_secret_key",
      RAZORPAY_KEY_ID: "mock_rzp_id",
      RAZORPAY_KEY_SECRET: "mock_rzp_sec",
      RESEND_API_KEY: "mock_resend_key",
      PRIMARY_ADMIN_USER_ID: "mock_admin_id",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it("returns status 200 and healthy checks when configured and DB reachable", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.checks.database).toBe("healthy");
    expect(body.checks.environment.supabase).toBe(true);
    expect(body.checks.environment.razorpay).toBe(true);
    expect(body.checks.environment.resend).toBe(true);
    expect(body.checks.environment.primaryAdmin).toBe(true);
    expect(body.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("reports database as unconfigured if credentials are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const res = await GET();
    const body = await res.json();

    expect(body.checks.database).toBe("unconfigured");
    expect(body.checks.environment.supabase).toBe(false);
  });
});
