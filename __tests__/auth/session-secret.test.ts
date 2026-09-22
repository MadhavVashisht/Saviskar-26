import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getSessionSecret,
  createRegistrationSessionToken,
  verifyRegistrationSessionToken,
} from "@/lib/auth/session";

describe("Registration Session Secret Architecture & Fail-Closed Behavior", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("A. In production: missing SESSION_SECRET fails closed with an explicit error", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.SESSION_SECRET;
    delete process.env.PAYMENT_RESUME_TOKEN_SECRET;
    delete process.env.SUPABASE_SECRET_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-should-never-be-used";

    expect(() => getSessionSecret()).toThrow("SESSION_SECRET is not configured in production environment.");
  });

  it("B. NEXT_PUBLIC_SUPABASE_ANON_KEY is never used as session signing secret", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.SESSION_SECRET;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";

    expect(() => getSessionSecret()).toThrow();
  });

  it("C. PAYMENT_RESUME_TOKEN_SECRET is not silently used as fallback for SESSION_SECRET", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.SESSION_SECRET;
    process.env.PAYMENT_RESUME_TOKEN_SECRET = "resume-secret-should-not-be-fallback";

    expect(() => getSessionSecret()).toThrow();
  });

  it("D. Configured SESSION_SECRET signs and verifies tokens correctly", () => {
    process.env.SESSION_SECRET = "test-session-secret-high-entropy-32bytes";

    const email = "participant@example.com";
    const token = createRegistrationSessionToken(email, 60_000);
    expect(token).toBeTruthy();

    const result = verifyRegistrationSessionToken(token);
    expect(result.valid).toBe(true);
    expect(result.payload?.email).toBe(email);
  });

  it("E. Tampered session token fails verification", () => {
    process.env.SESSION_SECRET = "test-session-secret-high-entropy-32bytes";

    const token = createRegistrationSessionToken("user@example.com", 60_000);
    const [payloadB64] = token.split(".");
    const tamperedToken = `${payloadB64}.tamperedsignature12345`;

    const result = verifyRegistrationSessionToken(tamperedToken);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("signature");
  });

  it("F. Expired session token fails verification", () => {
    process.env.SESSION_SECRET = "test-session-secret-high-entropy-32bytes";

    // Expire immediately (-1000ms)
    const token = createRegistrationSessionToken("user@example.com", -1000);
    const result = verifyRegistrationSessionToken(token);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("expired");
  });

  it("G. Missing token or malformed format fails safely", () => {
    expect(verifyRegistrationSessionToken("").valid).toBe(false);
    expect(verifyRegistrationSessionToken("not-a-token").valid).toBe(false);
    expect(verifyRegistrationSessionToken("part1.part2.part3").valid).toBe(false);
  });
});
