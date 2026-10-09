import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PATCH as updateScope } from "@/app/api/admin/admins/[userId]/scope/route";
import { POST as createAdmin } from "@/app/api/admin/admins/route";
import * as serverLib from "@/lib/supabase/server";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-secret-key";

// Mock Supabase admin client
const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockListUsers = vi.fn().mockResolvedValue({ data: { users: [] }, error: null });
const mockInviteUserByEmail = vi.fn().mockResolvedValue({
  data: { user: { id: "new-user-id", email: "doublecat@saviskar.co.in" } },
  error: null,
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc,
    from: mockFrom,
    auth: {
      admin: {
        getUserById: vi.fn().mockResolvedValue({
          data: { user: { id: "user-123", email: "test@example.com" } },
          error: null,
        }),
        listUsers: mockListUsers,
        inviteUserByEmail: mockInviteUserByEmail,
      },
    },
  })),
}));

describe("Admin Double Category Scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PATCH /api/admin/admins/[userId]/scope", () => {
    it("successfully sets double category scope (technical,cultural)", async () => {
      vi.spyOn(serverLib, "requireMasterAdmin").mockResolvedValue({
        supabase: {} as any,
        user: { id: "master-id", email: "master@test.com" } as any,
        role: "master",
        accommodation_access: true,
        assigned_category: null,
        assigned_events: [],
        error: null,
        status: 200,
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "admins") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { user_id: "admin-456", role: "admin" },
                  error: null,
                }),
              }),
            }),
            update: updateMock,
          };
        }
        if (table === "admin_audit_logs") {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const req = new NextRequest(
        "http://localhost:3000/api/admin/admins/admin-456/scope",
        {
          method: "PATCH",
          body: JSON.stringify({
            assigned_category: "technical,cultural",
            assigned_events: ["ev-1", "ev-2"],
          }),
        }
      );

      const paramsPromise = Promise.resolve({ userId: "admin-456" });
      const res = await updateScope(req, { params: paramsPromise });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.assigned_category).toBe("technical,cultural");
      expect(json.assigned_events).toEqual(["ev-1", "ev-2"]);

      expect(updateMock).toHaveBeenCalledWith({
        assigned_category: "technical,cultural",
        assigned_events: ["ev-1", "ev-2"],
      });
    });

    it("accepts category arrays and normalizes to canonical comma-separated string", async () => {
      vi.spyOn(serverLib, "requireMasterAdmin").mockResolvedValue({
        supabase: {} as any,
        user: { id: "master-id", email: "master@test.com" } as any,
        role: "master",
        accommodation_access: true,
        assigned_category: null,
        assigned_events: [],
        error: null,
        status: 200,
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "admins") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { user_id: "admin-456", role: "admin" },
                  error: null,
                }),
              }),
            }),
            update: updateMock,
          };
        }
        if (table === "admin_audit_logs") {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const req = new NextRequest(
        "http://localhost:3000/api/admin/admins/admin-456/scope",
        {
          method: "PATCH",
          body: JSON.stringify({
            assigned_category: ["non-technical", "technical"],
            assigned_events: [],
          }),
        }
      );

      const paramsPromise = Promise.resolve({ userId: "admin-456" });
      const res = await updateScope(req, { params: paramsPromise });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.assigned_category).toBe("technical,non-technical");

      expect(updateMock).toHaveBeenCalledWith({
        assigned_category: "technical,non-technical",
        assigned_events: [],
      });
    });

    it("resets category to null when 'all' is passed", async () => {
      vi.spyOn(serverLib, "requireMasterAdmin").mockResolvedValue({
        supabase: {} as any,
        user: { id: "master-id", email: "master@test.com" } as any,
        role: "master",
        accommodation_access: true,
        assigned_category: null,
        assigned_events: [],
        error: null,
        status: 200,
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "admins") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { user_id: "admin-456", role: "admin" },
                  error: null,
                }),
              }),
            }),
            update: updateMock,
          };
        }
        if (table === "admin_audit_logs") {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const req = new NextRequest(
        "http://localhost:3000/api/admin/admins/admin-456/scope",
        {
          method: "PATCH",
          body: JSON.stringify({
            assigned_category: "all",
            assigned_events: [],
          }),
        }
      );

      const paramsPromise = Promise.resolve({ userId: "admin-456" });
      const res = await updateScope(req, { params: paramsPromise });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.assigned_category).toBeNull();

      expect(updateMock).toHaveBeenCalledWith({
        assigned_category: null,
        assigned_events: [],
      });
    });
  });

  describe("POST /api/admin/admins", () => {
    it("creates an administrator with double categories assigned", async () => {
      vi.spyOn(serverLib, "requireMasterAdmin").mockResolvedValue({
        supabase: {} as any,
        user: { id: "master-id", email: "master@test.com" } as any,
        role: "master",
        accommodation_access: true,
        assigned_category: null,
        assigned_events: [],
        error: null,
        status: 200,
      });

      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockImplementation((table: string) => {
        if (table === "admins") {
          return {
            insert: insertMock,
            select: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: null, // user does not already exist as admin
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "admin_audit_logs") {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const req = new NextRequest("http://localhost:3000/api/admin/admins", {
        method: "POST",
        body: JSON.stringify({
          email: "doublecat@saviskar.co.in",
          role: "admin",
          assigned_category: "cultural,non-technical",
          assigned_events: ["event-1"],
        }),
      });

      const res = await createAdmin(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          assigned_category: "cultural,non-technical",
          assigned_events: ["event-1"],
        })
      );
    });
  });
});
