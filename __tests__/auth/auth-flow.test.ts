import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import {
  createRegistrationSessionToken,
  verifyRegistrationSessionToken,
  DEFAULT_SESSION_EXP_MS,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import {
  requestOtp,
  verifyOtp,
  getOtpStore,
  _clearOtpStoreForTesting,
  setOtpStoreOverride,
  hashOtp,
  MAX_VERIFY_ATTEMPTS,
  IOtpStore,
  OtpRecord,
  MemoryOtpStore,
  SupabaseOtpStore,
} from "@/lib/auth/otp";
import { POST as requestOtpHandler } from "@/app/api/auth/request-otp/route";
import { POST as verifyOtpHandler } from "@/app/api/auth/verify-otp/route";
import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

let lastDispatchedOtp: string | null = null;
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

vi.mock("@/lib/auth/send-otp-email", () => ({
  sendOtpEmail: vi.fn(async (_toEmail: string, otp: string) => {
    lastDispatchedOtp = otp;
    return {
      success: true,
      messageId: "mock-otp-msg-id",
    };
  }),
}));

describe("Passwordless Registration Auth Flow & Persistent Storage", () => {
  const TEST_SECRET = "test-secret-salt-for-saviskar-auth-32-chars-long";
  const testEmail = "delegate@university.ac.in";

  beforeEach(() => {
    lastDispatchedOtp = null;
    mockCookieStore.clear();
    process.env.SESSION_SECRET = TEST_SECRET;
    _clearOtpStoreForTesting();
    setOtpStoreOverride(new MemoryOtpStore());
  });

  afterEach(() => {
    _clearOtpStoreForTesting();
  });

  /* ================================================================
   * 1. SESSION TOKEN CRYPTOGRAPHY (HMAC-SHA256)
   * ================================================================ */
  describe("Stateless Session Token Cryptography", () => {
    it("creates a valid signed token in base64url format", () => {
      const token = createRegistrationSessionToken(testEmail, 3600000, TEST_SECRET);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const parts = token.split(".");
      expect(parts.length).toBe(2);
    });

    it("verifies a valid token successfully and extracts email", () => {
      const token = createRegistrationSessionToken(testEmail, 3600000, TEST_SECRET);
      const result = verifyRegistrationSessionToken(token, TEST_SECRET);

      expect(result.valid).toBe(true);
      expect(result.payload?.email).toBe(testEmail);
      expect(result.payload?.exp).toBeGreaterThan(Date.now());
    });

    it("rejects tampered token signature safely", () => {
      const token = createRegistrationSessionToken(testEmail, 3600000, TEST_SECRET);
      const [payload, sig] = token.split(".");
      const tampered = `${payload}.${sig.slice(0, -4)}XXXX`;

      const result = verifyRegistrationSessionToken(tampered, TEST_SECRET);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid session token signature");
    });

    it("rejects expired session token", () => {
      const expiredToken = createRegistrationSessionToken(testEmail, -1000, TEST_SECRET);
      const result = verifyRegistrationSessionToken(expiredToken, TEST_SECRET);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("expired");
    });

    it("A: Default session lifetime is exactly 48 hours (172800000 ms)", () => {
      expect(DEFAULT_SESSION_EXP_MS).toBe(48 * 60 * 60 * 1000);
      expect(DEFAULT_SESSION_EXP_MS).toBe(172800000);

      const beforeCreation = Date.now();
      const token = createRegistrationSessionToken(testEmail, undefined, TEST_SECRET);
      const afterCreation = Date.now();

      const verification = verifyRegistrationSessionToken(token, TEST_SECRET);
      expect(verification.valid).toBe(true);
      expect(verification.payload).toBeDefined();

      const { iat, exp } = verification.payload!;
      expect(exp - iat).toBe(172800000);
      expect(exp).toBeGreaterThanOrEqual(beforeCreation + 172800000);
      expect(exp).toBeLessThanOrEqual(afterCreation + 172800000);
    });

    it("B: Valid 48-hour session verifies successfully within the 48-hour window", () => {
      const token = createRegistrationSessionToken(testEmail, undefined, TEST_SECRET);
      const result = verifyRegistrationSessionToken(token, TEST_SECRET);

      expect(result.valid).toBe(true);
      expect(result.payload?.email).toBe(testEmail);
      expect(result.payload?.exp).toBeGreaterThan(Date.now());
    });

    it("C: Expired session (past 48 hours) is rejected", () => {
      // Simulate token past its 48-hour window
      const expiredToken = createRegistrationSessionToken(testEmail, -1000, TEST_SECRET);
      const result = verifyRegistrationSessionToken(expiredToken, TEST_SECRET);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("expired");
    });

    it("D: Fixed expiration: validating session does not extend or alter expiration timestamp", () => {
      const token = createRegistrationSessionToken(testEmail, undefined, TEST_SECRET);
      const firstCheck = verifyRegistrationSessionToken(token, TEST_SECRET);
      expect(firstCheck.valid).toBe(true);

      const firstExp = firstCheck.payload!.exp;
      const firstIat = firstCheck.payload!.iat;
      const firstNonce = firstCheck.payload!.nonce;

      // Simulate subsequent check at a later point
      const secondCheck = verifyRegistrationSessionToken(token, TEST_SECRET);
      expect(secondCheck.valid).toBe(true);
      expect(secondCheck.payload!.exp).toBe(firstExp);
      expect(secondCheck.payload!.iat).toBe(firstIat);
      expect(secondCheck.payload!.nonce).toBe(firstNonce);
    });

    it("E: Cookie maxAge calculation exactly matches 48 hours in seconds (172800s)", () => {
      expect(SESSION_COOKIE_NAME).toBe("svk_reg_session");
      const cookieMaxAgeSeconds = Math.floor(DEFAULT_SESSION_EXP_MS / 1000);
      expect(cookieMaxAgeSeconds).toBe(172800);
      expect(cookieMaxAgeSeconds).toBe(48 * 60 * 60);
    });
  });

  /* ================================================================
   * 2. PERSISTENT OTP STORE & SERVERLESS MULTI-INSTANCE LIFECYCLE
   * ================================================================ */
  describe("Persistent Server-Side OTP Store & Security Guarantees", () => {
    it("Requirement 1: OTP request creates persistent server-side record", async () => {
      // Mock persistent store tracking records
      const persistentRecords = new Map<string, OtpRecord>();
      const mockStore: IOtpStore = {
        async createOtp(data) {
          const rec: OtpRecord = {
            id: "persisted-uuid-001",
            email: data.email,
            otpHash: data.otpHash,
            issuedAt: data.issuedAt,
            expiresAt: data.expiresAt,
            attempts: 0,
            consumedAt: null,
          };
          persistentRecords.set(data.email, rec);
          return rec;
        },
        async getActiveOtp(email) {
          const rec = persistentRecords.get(email);
          return rec && rec.consumedAt === null ? rec : null;
        },
        async incrementAttempts(id) {
          for (const rec of persistentRecords.values()) {
            if (rec.id === id) {
              rec.attempts += 1;
              return rec.attempts;
            }
          }
          return 1;
        },
        async consumeOtp(id) {
          for (const rec of persistentRecords.values()) {
            if (rec.id === id) {
              if (rec.consumedAt !== null) return false;
              rec.consumedAt = Date.now();
              return true;
            }
          }
          return false;
        },
        async invalidatePreviousOtps(email) {
          const rec = persistentRecords.get(email);
          if (rec) rec.consumedAt = Date.now();
        },
      };

      setOtpStoreOverride(mockStore);

      const res = await requestOtp(testEmail, "192.168.1.50");
      expect(res.success).toBe(true);

      const record = persistentRecords.get(testEmail);
      expect(record).toBeDefined();
      expect(record?.email).toBe(testEmail);
      expect(record?.otpHash).toBeDefined();
      expect(record?.otpHash.length).toBe(64); // SHA-256 hex string
      expect(record?.consumedAt).toBeNull();
    });

    it("Requirement 2 & Production Safety Check: Verification retrieves OTP state independently of request process (simulating Instance A -> Instance B)", async () => {
      // Shared persistent backend (e.g. database)
      const sharedDatabaseTable = new Map<string, OtpRecord>();

      // Instance A Store Handler (handles POST /api/auth/request-otp)
      const instanceAStore: IOtpStore = {
        async createOtp(data) {
          const rec: OtpRecord = {
            id: "db-row-instance-a-123",
            email: data.email,
            otpHash: data.otpHash,
            issuedAt: data.issuedAt,
            expiresAt: data.expiresAt,
            attempts: 0,
            consumedAt: null,
          };
          sharedDatabaseTable.set(data.email, rec);
          return rec;
        },
        async getActiveOtp(email) {
          const rec = sharedDatabaseTable.get(email);
          return rec && rec.consumedAt === null ? rec : null;
        },
        async incrementAttempts(id) {
          for (const rec of sharedDatabaseTable.values()) {
            if (rec.id === id) return ++rec.attempts;
          }
          return 1;
        },
        async consumeOtp(id) {
          for (const rec of sharedDatabaseTable.values()) {
            if (rec.id === id) {
              if (rec.consumedAt !== null) return false;
              rec.consumedAt = Date.now();
              return true;
            }
          }
          return false;
        },
        async invalidatePreviousOtps(email) {
          const rec = sharedDatabaseTable.get(email);
          if (rec) rec.consumedAt = Date.now();
        },
      };

      // Execution Context 1 (Instance A): request OTP
      setOtpStoreOverride(instanceAStore);
      const email = "cross-instance-user@university.edu";
      const requestResult = await requestOtp(email, "10.0.0.1");
      expect(requestResult.success).toBe(true);

      // Verify Instance A successfully wrote to shared database
      const dbEntry = sharedDatabaseTable.get(email);
      expect(dbEntry).toBeDefined();

      // Retrieve issued code from test email dispatch capture (deterministic, non-leaking)
      expect(lastDispatchedOtp).toBeDefined();
      expect(lastDispatchedOtp).toMatch(/^\d{6}$/);
      const issuedCode = lastDispatchedOtp!;

      // Now switch execution context to Instance B (separate process/container memory)
      // Instance B has its own fresh client connection to shared database
      const instanceBStore: IOtpStore = {
        async createOtp() {
          throw new Error("Instance B should not be creating in this step");
        },
        async getActiveOtp(e) {
          const rec = sharedDatabaseTable.get(e);
          return rec && rec.consumedAt === null ? rec : null;
        },
        async incrementAttempts(id) {
          for (const rec of sharedDatabaseTable.values()) {
            if (rec.id === id) return ++rec.attempts;
          }
          return 1;
        },
        async consumeOtp(id) {
          for (const rec of sharedDatabaseTable.values()) {
            if (rec.id === id) {
              if (rec.consumedAt !== null) return false;
              rec.consumedAt = Date.now();
              return true;
            }
          }
          return false;
        },
        async invalidatePreviousOtps(e) {
          const rec = sharedDatabaseTable.get(e);
          if (rec) rec.consumedAt = Date.now();
        },
      };

      setOtpStoreOverride(instanceBStore);

      // Verification on Instance B succeeds!
      const verifyResult = await verifyOtp(email, issuedCode);
      expect(verifyResult.success).toBe(true);

      // Record in shared database is now consumed
      expect(dbEntry?.consumedAt).not.toBeNull();
    });

    it("Requirement 3 & 7: Correct OTP succeeds and is single-use", async () => {
      const email = "single-use@university.edu";
      await requestOtp(email, "192.168.1.60");

      expect(lastDispatchedOtp).toBeDefined();
      expect(lastDispatchedOtp).toMatch(/^\d{6}$/);
      const validCode = lastDispatchedOtp!;

      // First verification succeeds
      const firstVerify = await verifyOtp(email, validCode);
      expect(firstVerify.success).toBe(true);

      // Second verification fails (single-use)
      const secondVerify = await verifyOtp(email, validCode);
      expect(secondVerify.success).toBe(false);
      expect(secondVerify.error).toContain("No verification code found");
    });

    it("Requirement 4 & 5: Incorrect OTP increments attempts and 5th failed attempt locks out", async () => {
      const email = "lockout-test@university.edu";
      await requestOtp(email, "192.168.1.70");

      for (let i = 0; i < MAX_VERIFY_ATTEMPTS; i++) {
        const result = await verifyOtp(email, "000000");
        if (i < MAX_VERIFY_ATTEMPTS - 1) {
          expect(result.success).toBe(false);
          expect(result.error).toContain("remaining");
        } else {
          expect(result.success).toBe(false);
          expect(result.error).toContain("Too many incorrect attempts");
        }
      }

      // Record is consumed/invalidated after 5th failure
      const subsequent = await verifyOtp(email, "123456");
      expect(subsequent.success).toBe(false);
      expect(subsequent.error).toContain("No verification code found");
    });

    it("Requirement 6: Expired OTP fails", async () => {
      const email = "expired-test@university.edu";
      const pastStore: IOtpStore = {
        async createOtp() {
          throw new Error();
        },
        async getActiveOtp() {
          return {
            id: "expired-row-1",
            email,
            otpHash: hashOtp(email, "123456", Date.now() - 15 * 60 * 1000),
            issuedAt: Date.now() - 15 * 60 * 1000,
            expiresAt: Date.now() - 5 * 60 * 1000, // expired 5 minutes ago
            attempts: 0,
            consumedAt: null,
          };
        },
        async incrementAttempts() {
          return 1;
        },
        async consumeOtp() {
          return true;
        },
        async invalidatePreviousOtps() {},
      };

      setOtpStoreOverride(pastStore);

      const result = await verifyOtp(email, "123456");
      expect(result.success).toBe(false);
      expect(result.error).toContain("expired");
    });

    it("Requirement 8: Requesting a new OTP invalidates the previous OTP", async () => {
      const email = "replacement-test@university.edu";
      let previousInvalidated = false;

      const mockStore: IOtpStore = {
        async createOtp(data) {
          return {
            id: "new-row-1",
            email: data.email,
            otpHash: data.otpHash,
            issuedAt: data.issuedAt,
            expiresAt: data.expiresAt,
            attempts: 0,
            consumedAt: null,
          };
        },
        async getActiveOtp() {
          // Returns null to simulate cooldown elapsed
          return null;
        },
        async incrementAttempts() {
          return 1;
        },
        async consumeOtp() {
          return true;
        },
        async invalidatePreviousOtps(e) {
          if (e === email) previousInvalidated = true;
        },
      };

      setOtpStoreOverride(mockStore);

      await requestOtp(email, "192.168.1.80");
      expect(previousInvalidated).toBe(true);
    });

    it("Requirement 9: Resend cooldown is enforced for 60 seconds", async () => {
      const email = "cooldown-enforced@university.edu";
      const first = await requestOtp(email, "192.168.1.90");
      expect(first.success).toBe(true);

      const second = await requestOtp(email, "192.168.1.90");
      expect(second.success).toBe(false);
      expect(second.error).toContain("Please wait");
      expect(second.retryAfter).toBeGreaterThan(0);
    });

    it("Requirement 10 & 11: Rate limits on email and IP are enforced", async () => {
      const email = "rate-limit-check@university.edu";
      const ip = "192.168.200.1";

      // 4 requests per email in 10 minutes limit
      // Force rate limit by simulating requests
      const { checkRateLimit } = await import("@/lib/rate-limit");
      for (let i = 0; i < 4; i++) {
        checkRateLimit(`auth:otp:email:${email}`, 4, 600000);
      }

      const blocked = await requestOtp(email, ip);
      expect(blocked.success).toBe(false);
      expect(blocked.error).toContain("Too many codes requested");
    });

    it("Requirement 12: Plaintext OTP is NEVER persisted in database", async () => {
      let savedPayload: Parameters<IOtpStore["createOtp"]>[0] | null = null;
      const mockStore: IOtpStore = {
        async createOtp(data) {
          savedPayload = data;
          return {
            id: "check-plaintext",
            email: data.email,
            otpHash: data.otpHash,
            issuedAt: data.issuedAt,
            expiresAt: data.expiresAt,
            attempts: 0,
            consumedAt: null,
          };
        },
        async getActiveOtp() {
          return null;
        },
        async incrementAttempts() {
          return 1;
        },
        async consumeOtp() {
          return true;
        },
        async invalidatePreviousOtps() {},
      };

      setOtpStoreOverride(mockStore);
      await requestOtp("security-audit@university.edu", "192.168.1.99");

      expect(savedPayload).not.toBeNull();
      const payload = savedPayload as unknown as {
        email: string;
        otpHash: string;
        issuedAt: number;
        expiresAt: number;
      };
      expect(payload.otpHash).toBeDefined();
      expect((payload as unknown as Record<string, unknown>)?.otp).toBeUndefined(); // plaintext OTP MUST NOT exist on record
      expect((payload as unknown as Record<string, unknown>)?.code).toBeUndefined();
      expect(payload.otpHash).toMatch(/^[a-f0-9]{64}$/); // only salted SHA-256 hash
    });

    it("Requirement 13: Database migration explicitly enables RLS, revokes public access, and defines atomic attempts RPC", () => {
      const migrationPath = path.resolve(
        __dirname,
        "../../supabase/migrations/20260919060000_create_registration_otps.sql"
      );
      expect(fs.existsSync(migrationPath)).toBe(true);

      const sql = fs.readFileSync(migrationPath, "utf-8");

      // Verify table creation
      expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.registration_otps");
      expect(sql).toContain("otp_hash text NOT NULL");
      expect(sql).not.toContain("otp text"); // No plaintext OTP column!

      // Verify indexes
      expect(sql).toContain("idx_registration_otps_email");
      expect(sql).toContain("idx_registration_otps_active");

      // Verify RLS enabled
      expect(sql).toContain("ALTER TABLE public.registration_otps ENABLE ROW LEVEL SECURITY;");

      // Verify client roles revoked
      expect(sql).toContain("REVOKE ALL ON TABLE public.registration_otps FROM PUBLIC;");
      expect(sql).toContain("REVOKE ALL ON TABLE public.registration_otps FROM anon;");
      expect(sql).toContain("REVOKE ALL ON TABLE public.registration_otps FROM authenticated;");

      // Verify service_role grant
      expect(sql).toContain("GRANT ALL ON TABLE public.registration_otps TO service_role;");

      // Verify atomic concurrency increment RPC function
      expect(sql).toContain("CREATE OR REPLACE FUNCTION public.increment_registration_otp_attempts");
      expect(sql).toContain("SECURITY DEFINER");
      expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.increment_registration_otp_attempts(uuid) TO service_role;");
    });

    it("Production Safety: In production environment, missing Supabase credentials fails closed and NEVER returns MemoryOtpStore", () => {
      const originalEnv = process.env.NODE_ENV;
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.SUPABASE_SECRET_KEY;
      const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        setOtpStoreOverride(null);
        // Simulate production without Supabase credentials
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.SUPABASE_SECRET_KEY;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;

        expect(() => getOtpStore()).toThrowError(/\[AUTH OTP FATAL\]/);
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        if (originalUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
        if (originalKey) process.env.SUPABASE_SECRET_KEY = originalKey;
        if (originalServiceKey) process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
        setOtpStoreOverride(null);
      }
    });

    it("Production Safety: In production environment, failed atomic increment RPC fails closed and never falls back to read-then-write", async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";
        const mockSupabase = {
          rpc: vi.fn().mockResolvedValue({ data: null, error: new Error("RPC failure simulated") }),
          from: vi.fn(),
        };
        const store = new SupabaseOtpStore(mockSupabase as unknown as SupabaseClient);
        await expect(store.incrementAttempts("test-uuid")).rejects.toThrow(/\[AUTH OTP FATAL\]/);
        // Verify fallback .from().select() was NOT called in production
        expect(mockSupabase.from).not.toHaveBeenCalled();
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
      }
    });

    it("Concurrency Safety: Two simultaneous verification requests using the same OTP cannot both succeed (atomic single-use)", async () => {
      const email = "concurrency-test@university.edu";

      await requestOtp(email, "127.0.0.1");

      expect(lastDispatchedOtp).toBeDefined();
      expect(lastDispatchedOtp).toMatch(/^\d{6}$/);
      const capturedCode = lastDispatchedOtp!;

      // Execute two simultaneous verification requests using the same valid OTP
      const [res1, res2] = await Promise.all([
        verifyOtp(email, capturedCode),
        verifyOtp(email, capturedCode),
      ]);

      const successes = [res1, res2].filter((r) => r.success);
      const failures = [res1, res2].filter((r) => !r.success);

      // Exactly ONE request must succeed; the other must fail closed
      expect(successes.length).toBe(1);
      expect(failures.length).toBe(1);
      expect(failures[0].error).toContain("already been used");
    });
  });

  /* ================================================================
   * 3. API ROUTE HANDLERS
   * ================================================================ */
  describe("API Route Handlers (/api/auth/...)", () => {
    it("POST /api/auth/request-otp rejects invalid emails", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email: "invalid-email" }),
      });

      const res = await requestOtpHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("valid email");
    });

    it("POST /api/auth/request-otp succeeds with valid email and never leaks OTP", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email: "valid.student@cgc.edu.in" }),
      });

      const res = await requestOtpHandler(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toBeDefined();
      expect(json.otp).toBeUndefined();
    });

    it("POST /api/auth/verify-otp rejects invalid 6-digit formatting", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: "student@cgc.edu.in",
          otp: "12ab",
        }),
      });

      const res = await verifyOtpHandler(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("6 numeric digits");
    });

    it("1 & 7. Correct OTP -> 200 + valid session token created and verified", async () => {
      const email = "correct.otp@example.com";
      await requestOtp(email, "127.0.0.1");
      expect(lastDispatchedOtp).toBeTruthy();

      const req = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp: lastDispatchedOtp }),
      });

      const res = await verifyOtpHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.email).toBe(email);

      // Verify cookie was set in mockCookieStore
      const sessionCookie = mockCookieStore.get(SESSION_COOKIE_NAME);
      expect(sessionCookie).toBeTruthy();

      const verified = verifyRegistrationSessionToken(sessionCookie!, TEST_SECRET);
      expect(verified.valid).toBe(true);
      expect(verified.payload?.email).toBe(email);
    });

    it("2. Wrong OTP -> 400 rejected with remaining attempts", async () => {
      const email = "wrong.otp@example.com";
      await requestOtp(email, "127.0.0.1");

      const req = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp: "999999" }),
      });

      const res = await verifyOtpHandler(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("Invalid verification code");
      expect(mockCookieStore.get(SESSION_COOKIE_NAME)).toBeUndefined();
    });

    it("3. Expired OTP -> 400 rejected with expired message", async () => {
      const email = "expired.otp@example.com";
      await requestOtp(email, "127.0.0.1");

      // Advance time beyond expiration in store
      const store = getOtpStore();
      const active = await store.getActiveOtp(email);
      expect(active).toBeTruthy();
      if (active) {
        // Expire by updating expiresAt to past
        active.expiresAt = Date.now() - 1000;
      }

      const req = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp: lastDispatchedOtp }),
      });

      const res = await verifyOtpHandler(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("expired");
    });

    it("4 & 9. Used OTP / OTP replay -> 400 rejected", async () => {
      const email = "replay.otp@example.com";
      await requestOtp(email, "127.0.0.1");
      const otp = lastDispatchedOtp!;

      // First verification: succeeds
      const req1 = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      const res1 = await verifyOtpHandler(req1);
      expect(res1.status).toBe(200);

      // Second verification using same code: rejected
      const req2 = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      const res2 = await verifyOtpHandler(req2);
      expect(res2.status).toBe(400);

      const json2 = await res2.json();
      expect(json2.success).toBe(false);
      expect(json2.error).toMatch(/already been used|No verification code found/);
    });

    it("5. OTP attempt limit -> locked out after max attempts", async () => {
      const email = "bruteforce@example.com";
      await requestOtp(email, "127.0.0.1");

      for (let i = 0; i < MAX_VERIFY_ATTEMPTS; i++) {
        const req = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
          method: "POST",
          body: JSON.stringify({ email, otp: "000000" }),
        });
        const res = await verifyOtpHandler(req);
        expect(res.status).toBe(400);
      }

      // Next attempt should report too many attempts
      const finalReq = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp: "000000" }),
      });
      const finalRes = await verifyOtpHandler(finalReq);
      expect(finalRes.status).toBe(400);
      const json = await finalRes.json();
      expect(json.error).toMatch(/Too many incorrect attempts|No verification code found/);
    });

    it("6 & 11. Missing SESSION_SECRET in production -> fail closed without burning valid OTP", async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalSecret = process.env.SESSION_SECRET;

      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";
        delete process.env.SESSION_SECRET;

        const email = "failclosed.prod@example.com";
        // Create OTP manually in store
        const store = getOtpStore();
        const now = Date.now();
        const code = "654321";
        const otpHash = hashOtp(email, code, now);
        await store.createOtp({
          email,
          otpHash,
          issuedAt: now,
          expiresAt: now + 600000,
        });

        const req = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
          method: "POST",
          body: JSON.stringify({ email, otp: code }),
        });

        const res = await verifyOtpHandler(req);
        // Pre-flight check fails closed with 500
        expect(res.status).toBe(500);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error).toContain("Authentication service is temporarily unavailable");

        // CRITICAL: The OTP was NOT burned because pre-flight checked SESSION_SECRET first!
        const activeOtp = await store.getActiveOtp(email);
        expect(activeOtp).not.toBeNull();
        expect(activeOtp?.consumedAt).toBeNull();
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        process.env.SESSION_SECRET = originalSecret;
      }
    });

    it("8. Session cookie has correct production security properties", async () => {
      const email = "cookie.props@example.com";
      await requestOtp(email, "127.0.0.1");

      const req = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp: lastDispatchedOtp }),
      });

      const res = await verifyOtpHandler(req);
      expect(res.status).toBe(200);

      // Verify response cookie headers
      const setCookie = res.cookies.get(SESSION_COOKIE_NAME);
      expect(setCookie).toBeDefined();
      expect(setCookie?.httpOnly).toBe(true);
      expect(setCookie?.sameSite).toBe("lax");
      expect(setCookie?.path).toBe("/");
      expect(setCookie?.maxAge).toBe(48 * 60 * 60);
    });

    it("10. Request OTP + verify OTP with whitespace and casing differences succeeds", async () => {
      const emailInput = "  Student.Capital@Example.COM  ";
      const normalized = "student.capital@example.com";

      const req1 = new NextRequest("http://localhost:3000/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email: emailInput }),
      });
      const res1 = await requestOtpHandler(req1);
      expect(res1.status).toBe(200);

      const req2 = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: "  sTUDENT.cAPITAL@eXAMPLE.com ", otp: `  ${lastDispatchedOtp}  ` }),
      });
      const res2 = await verifyOtpHandler(req2);
      expect(res2.status).toBe(200);

      const json2 = await res2.json();
      expect(json2.email).toBe(normalized);
    });

    it("12. 500 verification failure surfaces safe structured message", async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalSecret = process.env.SESSION_SECRET;

      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";
        delete process.env.SESSION_SECRET;

        const req = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
          method: "POST",
          body: JSON.stringify({ email: "safe.error@example.com", otp: "123456" }),
        });

        const res = await verifyOtpHandler(req);
        expect(res.status).toBe(500);

        const json = await res.json();
        // Never leaks stack trace, env names, or internal secrets
        expect(json.error).toBe("Authentication service is temporarily unavailable. Please try again later.");
        expect(json.stack).toBeUndefined();
        expect(JSON.stringify(json)).not.toContain("SESSION_SECRET");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        process.env.SESSION_SECRET = originalSecret;
      }
    });
  });
});
