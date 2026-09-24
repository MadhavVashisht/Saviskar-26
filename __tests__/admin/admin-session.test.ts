import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isAdminSessionExpired,
  getAdminSessionMaxAgeSeconds,
  DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/supabase/admin-session";
import * as serverLib from "@/lib/supabase/server";
import { updateSession } from "@/lib/supabase/proxy";
import { NextRequest } from "next/server";
import { GET as getAdminSession } from "@/app/api/admin/session/route";
import { POST as postCheckIn } from "@/app/api/admin/check-in/route";

// Shared builder for DB queries in server client
const mockMaybeSingle = vi.fn();
const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();

const mockFrom = vi.fn().mockReturnValue({
  select: mockSelect,
  eq: mockEq,
  maybeSingle: mockMaybeSingle,
});

const mockGetUser = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue({ error: null });
const mockGetAAL = vi.fn();

const mockServerClient = {
  auth: {
    getUser: mockGetUser,
    signOut: mockSignOut,
    mfa: {
      getAuthenticatorAssuranceLevel: mockGetAAL,
    },
  },
  from: mockFrom,
};

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => mockServerClient,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    setAll: vi.fn(),
  }),
}));

describe("Admin Session Expiration and Lifecycle Authority", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.ADMIN_SESSION_MAX_AGE_SECONDS;
    delete process.env.PRIMARY_ADMIN_USER_ID;

    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
    mockMaybeSingle.mockResolvedValue({
      data: { user_id: "admin-uuid-1", role: "admin" },
      error: null,
    });
    mockGetAAL.mockResolvedValue({
      data: { currentLevel: "aal2" },
      error: null,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Configuration & Helper (isAdminSessionExpired)", () => {
    it("defaults to 28,800 seconds (8 hours) when env var is unset", () => {
      expect(getAdminSessionMaxAgeSeconds()).toBe(DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS);
      expect(DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS).toBe(28800);
    });

    it("respects valid ADMIN_SESSION_MAX_AGE_SECONDS environment variable", () => {
      process.env.ADMIN_SESSION_MAX_AGE_SECONDS = "14400";
      expect(getAdminSessionMaxAgeSeconds()).toBe(14400);
    });

    it("falls back to default if ADMIN_SESSION_MAX_AGE_SECONDS is invalid or negative", () => {
      process.env.ADMIN_SESSION_MAX_AGE_SECONDS = "invalid";
      expect(getAdminSessionMaxAgeSeconds()).toBe(28800);

      process.env.ADMIN_SESSION_MAX_AGE_SECONDS = "-500";
      expect(getAdminSessionMaxAgeSeconds()).toBe(28800);
    });

    it("rejects null or undefined user as expired (fail closed)", () => {
      expect(isAdminSessionExpired(null)).toBe(true);
      expect(isAdminSessionExpired(undefined)).toBe(true);
    });

    it("rejects user with missing or empty last_sign_in_at as expired", () => {
      expect(isAdminSessionExpired({ last_sign_in_at: null })).toBe(true);
      expect(isAdminSessionExpired({ last_sign_in_at: undefined })).toBe(true);
      expect(isAdminSessionExpired({ last_sign_in_at: "" })).toBe(true);
      expect(isAdminSessionExpired({ last_sign_in_at: "invalid-date" })).toBe(true);
    });

    it("rejects future-dated last_sign_in_at exceeding 60s clock skew", () => {
      const farFuture = new Date(Date.now() + 120_000).toISOString();
      expect(isAdminSessionExpired({ last_sign_in_at: farFuture })).toBe(true);
    });
  });

  describe("14 Mandatory Session Lifecycle Invariants", () => {
    // 1. Valid admin session is accepted
    it("1. valid admin session is accepted within max lifetime", async () => {
      const recentSignIn = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 mins ago
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: "admin-uuid-1",
            email: "admin@example.com",
            last_sign_in_at: recentSignIn,
          },
        },
        error: null,
      });

      const auth = await serverLib.requireAdmin();
      expect(auth.error).toBe(null);
      expect(auth.status).toBe(200);
      expect(auth.role).toBe("admin");
      expect(auth.user?.id).toBe("admin-uuid-1");
    });

    // 2. Expired admin session is rejected
    it("2. expired admin session is rejected authoritatively by requireAdmin", async () => {
      const nineHoursAgo = new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString();
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: "admin-uuid-1",
            email: "admin@example.com",
            last_sign_in_at: nineHoursAgo,
          },
        },
        error: null,
      });

      const auth = await serverLib.requireAdmin();
      expect(auth.status).toBe(401);
      expect(auth.error).toBe("Session expired");
      expect(auth.user).toBe(null);
      expect(auth.role).toBe(null);
      expect(mockSignOut).toHaveBeenCalled();
    });

    // 3. Expired admin session cannot access protected admin API
    it("3. expired admin session cannot access protected admin API (/api/admin/session)", async () => {
      const nineHoursAgo = new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString();
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: "admin-uuid-1",
            email: "admin@example.com",
            last_sign_in_at: nineHoursAgo,
          },
        },
        error: null,
      });

      const res = await getAdminSession();
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.authenticated).toBe(false);
      expect(json.error).toBe("Session expired");
    });

    // 4. Expired admin session cannot perform admin mutation
    it("4. expired admin session cannot perform admin mutation (check-in)", async () => {
      const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: "admin-uuid-1",
            email: "admin@example.com",
            last_sign_in_at: tenHoursAgo,
          },
        },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/admin/check-in", {
        method: "POST",
        body: JSON.stringify({ participantEventId: "pe-123", action: "check_in" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postCheckIn(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Session expired");
    });

    // 5. Manual logout still invalidates the session
    it("5. manual logout invalidates the session (user is null)", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const auth = await serverLib.requireAdmin();
      expect(auth.status).toBe(401);
      expect(auth.error).toBe("Unauthorized");
    });

    // 6. Primary Master authorization remains unchanged
    it("6. Primary Master authorization remains strictly enforced via PRIMARY_ADMIN_USER_ID", async () => {
      process.env.PRIMARY_ADMIN_USER_ID = "primary-uuid";
      const validSignIn = new Date().toISOString();

      mockGetUser.mockResolvedValue({
        data: {
          user: { id: "primary-uuid", email: "primary@example.com", last_sign_in_at: validSignIn },
        },
        error: null,
      });
      mockMaybeSingle.mockResolvedValue({
        data: { user_id: "primary-uuid", role: "master" },
        error: null,
      });

      const auth = await serverLib.requireSuperMasterAdmin();
      expect(auth.error).toBe(null);
      expect(auth.status).toBe(200);

      // Non-primary master fails
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: "other-master-uuid", email: "other@example.com", last_sign_in_at: validSignIn },
        },
        error: null,
      });
      mockMaybeSingle.mockResolvedValue({
        data: { user_id: "other-master-uuid", role: "master" },
        error: null,
      });

      const otherAuth = await serverLib.requireSuperMasterAdmin();
      expect(otherAuth.status).toBe(403);
      expect(otherAuth.error).toBe("Super Master Admin access required");
    });

    // 7. Master authorization remains unchanged
    it("7. Master authorization remains enforced (role=master required)", async () => {
      const validSignIn = new Date().toISOString();
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: "normal-admin", email: "normal@example.com", last_sign_in_at: validSignIn },
        },
        error: null,
      });
      mockMaybeSingle.mockResolvedValue({
        data: { user_id: "normal-admin", role: "admin" },
        error: null,
      });

      const auth = await serverLib.requireMasterAdmin();
      expect(auth.status).toBe(403);
      expect(auth.error).toBe("Master Admin access required");
    });

    // 8. Normal admin authorization remains unchanged
    it("8. Normal admin authorization remains valid for general admin access", async () => {
      const validSignIn = new Date().toISOString();
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: "normal-admin", email: "normal@example.com", last_sign_in_at: validSignIn },
        },
        error: null,
      });
      mockMaybeSingle.mockResolvedValue({
        data: { user_id: "normal-admin", role: "admin" },
        error: null,
      });

      const auth = await serverLib.requireAdmin();
      expect(auth.error).toBe(null);
      expect(auth.status).toBe(200);
      expect(auth.role).toBe("admin");
    });

    // 9. Master MFA/AAL2 requirement remains enforced
    it("9. Master MFA/AAL2 requirement remains strictly enforced", async () => {
      const validSignIn = new Date().toISOString();
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: "master-user", email: "master@example.com", last_sign_in_at: validSignIn },
        },
        error: null,
      });
      mockMaybeSingle.mockResolvedValue({
        data: { user_id: "master-user", role: "master" },
        error: null,
      });
      mockGetAAL.mockResolvedValue({
        data: { currentLevel: "aal1" }, // Insufficient MFA level
        error: null,
      });

      const auth = await serverLib.requireAdmin();
      expect(auth.status).toBe(403);
      expect(auth.error).toBe("MFA_REQUIRED");
    });

    // 10. Normal Supabase session handling still works
    it("10. normal Supabase session handling proceeds normally when unexpired", async () => {
      const validSignIn = new Date(Date.now() - 60_000).toISOString();
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: "admin-1", email: "a@b.com", last_sign_in_at: validSignIn },
        },
        error: null,
      });
      mockMaybeSingle.mockResolvedValue({
        data: { user_id: "admin-1", role: "admin" },
        error: null,
      });

      const auth = await serverLib.requireAdmin();
      expect(auth.status).toBe(200);
      expect(auth.error).toBe(null);
    });

    // 11. Session refresh cannot extend an admin session beyond maximum lifetime
    it("11. session refresh cannot extend an admin session beyond the configured maximum lifetime", async () => {
      // Scenario: User signed in 9 hours ago.
      // Background Supabase SSR refreshed tokens (so token was issued recently),
      // BUT last_sign_in_at remains 9 hours ago.
      process.env.ADMIN_SESSION_MAX_AGE_SECONDS = "28800"; // 8 hours
      const nineHoursAgo = new Date(Date.now() - 9 * 3600 * 1000).toISOString();

      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: "admin-refreshed",
            email: "refreshed@example.com",
            last_sign_in_at: nineHoursAgo, // Original sign-in timestamp does not advance on refresh
          },
        },
        error: null,
      });

      const auth = await serverLib.requireAdmin();
      expect(auth.status).toBe(401);
      expect(auth.error).toBe("Session expired");

      // Middleware check also rejects
      const req = new NextRequest("http://localhost/admin/events");
      const res = await updateSession(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/admin/login");
    });

    // 12. No client-side-only timeout is relied upon for security
    it("12. server authorization enforces expiration independently of client environment", async () => {
      // Directly invoking server API functions without client context
      const expiredTime = new Date(Date.now() - 30_000_000).toISOString(); // ~8.3 hours
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: "hacker-client", email: "hacker@example.com", last_sign_in_at: expiredTime },
        },
        error: null,
      });

      const auth = await serverLib.requireAdmin();
      expect(auth.status).toBe(401);
      expect(auth.error).toBe("Session expired");
    });

    // 13. Unauthenticated users are redirected to the existing admin login
    it("13. unauthenticated users in proxy are redirected to /admin/login", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const req = new NextRequest("http://localhost/admin/registrations");
      const res = await updateSession(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/admin/login");
    });

    // 14. Multiple requests after expiry remain rejected
    it("14. multiple consecutive requests after expiry remain consistently rejected", async () => {
      const expiredTime = new Date(Date.now() - 10 * 3600 * 1000).toISOString();
      mockGetUser.mockResolvedValue({
        data: {
          user: { id: "expired-user", email: "exp@example.com", last_sign_in_at: expiredTime },
        },
        error: null,
      });

      for (let i = 0; i < 5; i++) {
        const auth = await serverLib.requireAdmin();
        expect(auth.status).toBe(401);
        expect(auth.error).toBe("Session expired");
      }
    });
  });
});
