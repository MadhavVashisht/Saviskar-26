import { createClient as createSupabaseAdminClient, SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  requireMasterAdmin,
  isPrimaryMaster,
} from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function getIpFromRequest(request: Request): string {
  try {
    const forwarded = request.headers?.get?.("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    const realIp = request.headers?.get?.("x-real-ip");
    if (realIp?.trim()) return realIp.trim();
  } catch {
    // ignore
  }
  return "127.0.0.1";
}

async function isTargetPrimaryMaster(
  adminClient: SupabaseClient,
  targetUserId: string
): Promise<boolean> {
  if (isPrimaryMaster({ id: targetUserId })) {
    return true;
  }

  try {
    const { data: userResp } = await adminClient.auth.admin.getUserById(targetUserId);
    if (userResp?.user?.email) {
      return isPrimaryMaster({ id: targetUserId, email: userResp.user.email });
    }
  } catch {
    // ignore
  }

  return false;
}

async function logAudit(
  adminClient: SupabaseClient,
  adminId: string,
  actionType: string,
  targetId: string,
  details: Record<string, unknown>
) {
  try {
    await adminClient.from("admin_audit_logs").insert({
      admin_id: adminId,
      action_type: actionType,
      target_id: targetId,
      details,
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    return null;
  }

  return createSupabaseAdminClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * PATCH /api/admin/admins/[userId]/scope
 *
 * Sets the event & category scope for a given administrator.
 *
 * Request body:
 * {
 *   assigned_category?: string | null, // e.g. "technical" | "cultural" | "non-technical" | null ("all")
 *   assigned_events?: string[] // array of event UUIDs
 * }
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const auth = await requireMasterAdmin();

  if (auth.error) {
    return NextResponse.json(
      {
        error:
          auth.error === "MFA_REQUIRED"
            ? "Master Admin MFA verification required."
            : auth.error,
      },
      { status: auth.status }
    );
  }

  const clientIp = getIpFromRequest(request);
  const rateLimit = checkRateLimit(`admin_scope_patch:${auth.user?.id}:${clientIp}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many admin requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin management is not configured." }, { status: 500 });
  }

  const { userId: rawUserId } = await context.params;
  const targetUserId = rawUserId?.trim();

  if (!targetUserId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  let body: {
    assigned_category?: unknown;
    assigned_events?: unknown;
  };
  try {
    body = (await request.json()) as {
      assigned_category?: unknown;
      assigned_events?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawCat =
    typeof body.assigned_category === "string"
      ? body.assigned_category.trim().toLowerCase()
      : null;
  const assignedCategory = rawCat && rawCat !== "all" ? rawCat : null;

  const assignedEvents = Array.isArray(body.assigned_events)
    ? (body.assigned_events.filter(
        (e) => typeof e === "string" && e.trim()
      ) as string[])
    : [];

  // 1. Fetch target administrator from DB
  const { data: targetAdmin, error: targetError } = await adminClient
    .from("admins")
    .select("user_id, role")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (targetError || !targetAdmin) {
    return NextResponse.json({ error: "Administrator not found." }, { status: 404 });
  }

  // 2. Primary Master target protection
  const isTargetPrimary = await isTargetPrimaryMaster(adminClient, targetUserId);
  if (isTargetPrimary) {
    return NextResponse.json(
      { error: "The Primary Master scope is protected and cannot be restricted." },
      { status: 403 }
    );
  }

  // 3. Hierarchy Check: Master Admin modifying another Master Admin
  const callerIsPrimary = isPrimaryMaster(auth.user);
  if (targetAdmin.role === "master" && !callerIsPrimary) {
    return NextResponse.json(
      { error: "Only the Primary Master Admin can modify permissions of Master Admins." },
      { status: 403 }
    );
  }

  // 4. Update assigned_category & assigned_events
  const updatePayload: Record<string, unknown> = {
    assigned_category: targetAdmin.role === "master" ? null : assignedCategory,
    assigned_events: targetAdmin.role === "master" ? [] : assignedEvents,
  };

  const { error: updateError } = await adminClient
    .from("admins")
    .update(updatePayload)
    .eq("user_id", targetUserId);

  if (updateError) {
    if (
      updateError.code === "42703" ||
      updateError.code === "PGRST204" ||
      updateError.message?.includes("assigned_category") ||
      updateError.message?.includes("assigned_events")
    ) {
      if (
        updatePayload.assigned_category === null &&
        (!Array.isArray(updatePayload.assigned_events) || updatePayload.assigned_events.length === 0)
      ) {
        return NextResponse.json({
          success: true,
          message: "Administrator scope is unrestricted (default).",
          assigned_category: null,
          assigned_events: [],
        });
      }
      return NextResponse.json(
        {
          error:
            "Database columns for event/category scoping are not applied yet. Please run the SQL in Supabase SQL Editor: ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS assigned_category text DEFAULT NULL, ADD COLUMN IF NOT EXISTS assigned_events text[] DEFAULT '{}'::text[];",
        },
        { status: 400 }
      );
    }
    console.error("Scope update error:", updateError);
    return NextResponse.json({ error: "Could not update administrator scope." }, { status: 500 });
  }

  if (auth.user) {
    await logAudit(
      adminClient,
      auth.user.id,
      "UPDATE_ADMIN_SCOPE",
      targetUserId,
      {
        previous_role: targetAdmin.role,
        assigned_category: updatePayload.assigned_category,
        assigned_events: updatePayload.assigned_events,
      }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Administrator event & category scope updated successfully.",
    assigned_category: updatePayload.assigned_category,
    assigned_events: updatePayload.assigned_events,
  });
}
