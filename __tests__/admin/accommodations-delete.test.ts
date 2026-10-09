import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "@/app/api/admin/accommodations/route";
import { NextRequest } from "next/server";

const mockRequireAccommodationAdmin = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  requireAccommodationAdmin: () => mockRequireAccommodationAdmin(),
}));

const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc,
    from: mockFrom,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
  process.env.SUPABASE_SECRET_KEY = "test_secret_key";
});

describe("DELETE /api/admin/accommodations", () => {
  it("rejects unauthorized access when not accommodation admin", async () => {
    mockRequireAccommodationAdmin.mockResolvedValueOnce({
      error: "Accommodation access required",
      status: 403,
    });

    const req = new NextRequest("http://localhost:3000/api/admin/accommodations?id=acc-1", {
      method: "DELETE",
    });

    const res = await DELETE(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 if accommodation ID is missing", async () => {
    mockRequireAccommodationAdmin.mockResolvedValueOnce({
      user: { id: "admin-1" },
      role: "master",
      accommodation_access: true,
      status: 200,
      error: null,
    });

    const req = new NextRequest("http://localhost:3000/api/admin/accommodations", {
      method: "DELETE",
    });

    const res = await DELETE(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("successfully deletes accommodation via RPC", async () => {
    mockRequireAccommodationAdmin.mockResolvedValueOnce({
      user: { id: "admin-1" },
      role: "master",
      accommodation_access: true,
      status: 200,
      error: null,
    });

    mockRpc.mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    const req = new NextRequest("http://localhost:3000/api/admin/accommodations?id=acc-123", {
      method: "DELETE",
    });

    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith("delete_accommodation_permanently", {
      p_accommodation_id: "acc-123",
      p_admin_id: "admin-1",
    });
  });

  it("falls back to direct admin deletion when RPC function is not installed", async () => {
    mockRequireAccommodationAdmin.mockResolvedValueOnce({
      user: { id: "admin-1" },
      role: "admin",
      accommodation_access: true,
      status: 200,
      error: null,
    });

    // RPC reports function does not exist
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "function delete_accommodation_permanently does not exist" },
    });

    // Mock direct table queries
    mockFrom.mockImplementation((table: string) => {
      if (table === "participant_accommodations") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: "acc-123",
                    participant_id: "p-1",
                    amount: 499,
                    status: "paid",
                    start_date: "2026-10-28",
                    end_date: "2026-10-29",
                    participants: { name: "Test User", email: "test@example.com", participant_id: "SVK-001" },
                  },
                  error: null,
                }),
            }),
          }),
          delete: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === "accommodation_allocations" || table === "payment_order_items") {
        return {
          delete: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === "admin_audit_logs") {
        return {
          insert: () => Promise.resolve({ error: null }),
        };
      }
      return {};
    });

    const req = new NextRequest("http://localhost:3000/api/admin/accommodations?id=acc-123", {
      method: "DELETE",
    });

    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("falls back to direct admin deletion when RPC gives 'schema cache' error", async () => {
    mockRequireAccommodationAdmin.mockResolvedValueOnce({
      user: { id: "admin-1" },
      role: "admin",
      accommodation_access: true,
      status: 200,
      error: null,
    });

    // Exact error message reported by PostgREST in production
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "Could not find the function public.delete_accommodation_permanently(p_accommodation_id, p_admin_id) in the schema cache" },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "participant_accommodations") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: {
                    id: "acc-123",
                    participant_id: "p-1",
                    amount: 499,
                    status: "pending",
                    start_date: "2026-10-28",
                    end_date: "2026-10-29",
                    participants: { name: "Ananya Negi", email: "241030464@juitsolan.in", participant_id: "SVK26-0F717392" },
                  },
                  error: null,
                }),
            }),
          }),
          delete: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === "accommodation_allocations" || table === "payment_order_items") {
        return {
          delete: () => ({
            eq: () => ({
              is: () => ({
                eq: () => Promise.resolve({ error: null }),
              }),
            }),
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      }
      if (table === "admin_audit_logs") {
        return {
          insert: () => Promise.resolve({ error: null }),
        };
      }
      return {};
    });

    const req = new NextRequest("http://localhost:3000/api/admin/accommodations?id=acc-123", {
      method: "DELETE",
    });

    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe("Accommodation record deleted successfully.");
  });
});
