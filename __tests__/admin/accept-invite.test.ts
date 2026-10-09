import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/admin/auth/accept-invite/route";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-secret-key";

const mockBuilder: Record<string, any> = {};
const mockFrom = vi.fn(() => mockBuilder);
const mockListUsers = vi.fn();
const mockUpdateUserById = vi.fn();

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: () => {
      return {
        from: mockFrom,
        auth: {
          admin: {
            listUsers: mockListUsers,
            updateUserById: mockUpdateUserById,
          },
        },
      };
    },
  };
});

describe("Admin Permanent Invite Activation API (/api/admin/auth/accept-invite)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockBuilder.select = vi.fn().mockReturnThis();
    mockBuilder.insert = vi.fn().mockResolvedValue({ error: null });
    mockBuilder.eq = vi.fn().mockReturnThis();
    mockBuilder.maybeSingle = vi.fn().mockResolvedValue({
      data: {
        user_id: "invited-user-id",
        role: "admin",
        assigned_category: "technical",
        assigned_events: [],
        created_at: new Date().toISOString(),
      },
      error: null,
    });

    mockListUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: "invited-user-id",
            email: "dean.sa@cgcuniversity.in",
            email_confirmed_at: null,
            last_sign_in_at: null,
            invited_at: "2026-10-09T10:00:00Z",
            user_metadata: {},
          },
        ],
      },
      error: null,
    });

    mockUpdateUserById.mockResolvedValue({
      data: { user: { id: "invited-user-id" } },
      error: null,
    });
  });

  const createRequest = (body: unknown) => {
    return new Request("http://localhost/api/admin/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  it("fails if email is missing or invalid", async () => {
    const res = await POST(createRequest({ password: "ValidPassword123!", confirmPassword: "ValidPassword123!" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Valid email address is required.");
  });

  it("fails if password is too short or doesn't match", async () => {
    const res = await POST(createRequest({
      email: "dean.sa@cgcuniversity.in",
      password: "short",
      confirmPassword: "short",
    }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Password must be at least 8 characters.");
  });

  it("fails with 404 if user not found in auth.users", async () => {
    const res = await POST(createRequest({
      email: "unknown@cgcuniversity.in",
      password: "ValidPassword123!",
      confirmPassword: "ValidPassword123!",
    }));
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("This email address is not registered as an administrator.");
  });

  it("fails with 403 if user is not present in admins table", async () => {
    mockBuilder.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const res = await POST(createRequest({
      email: "dean.sa@cgcuniversity.in",
      password: "ValidPassword123!",
      confirmPassword: "ValidPassword123!",
    }));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe("This email address is not registered as an administrator.");
  });

  it("rejects activation if admin has already completed onboarding and has active sign ins", async () => {
    mockListUsers.mockResolvedValueOnce({
      data: {
        users: [
          {
            id: "invited-user-id",
            email: "dean.sa@cgcuniversity.in",
            email_confirmed_at: "2026-10-01T10:00:00Z",
            last_sign_in_at: "2026-10-08T10:00:00Z",
            user_metadata: { onboarding_completed: true },
          },
        ],
      },
      error: null,
    });

    mockBuilder.maybeSingle.mockResolvedValueOnce({
      data: {
        user_id: "invited-user-id",
        role: "admin",
        created_at: "2026-09-01T10:00:00Z",
      },
      error: null,
    });

    const res = await POST(createRequest({
      email: "dean.sa@cgcuniversity.in",
      password: "ValidPassword123!",
      confirmPassword: "ValidPassword123!",
    }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("already activated");
  });

  it("successfully activates unconfirmed/expired invited admin", async () => {
    const res = await POST(createRequest({
      email: "dean.sa@cgcuniversity.in",
      password: "ValidPassword123!",
      confirmPassword: "ValidPassword123!",
    }));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.email).toBe("dean.sa@cgcuniversity.in");
    expect(data.role).toBe("admin");

    expect(mockUpdateUserById).toHaveBeenCalledWith(
      "invited-user-id",
      expect.objectContaining({
        password: "ValidPassword123!",
        email_confirm: true,
        user_metadata: expect.objectContaining({
          onboarding_completed: true,
          saviskar_role: "admin",
        }),
      })
    );
  });
});
