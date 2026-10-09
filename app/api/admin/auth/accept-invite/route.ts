import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/admin/onboarding";

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

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) return null;

  return createSupabaseAdminClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * POST /api/admin/auth/accept-invite
 *
 * Allows invited administrators to complete their onboarding and set their password
 * without expiring. Works for both active invitation sessions and invitation links
 * where email tokens may have expired or were pre-fetched by corporate mail security filters.
 */
export async function POST(request: Request) {
  const clientIp = getIpFromRequest(request);
  const rateLimit = checkRateLimit(`accept_invite:${clientIp}`, 10, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Service configuration error." }, { status: 500 });
  }

  let body: { email?: string; password?: string; confirmPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email address is required." }, { status: 400 });
  }

  const passwordError = validatePassword(password, confirmPassword);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  // 1. Look up user by email in auth.users
  const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError || !usersData?.users) {
    console.error("List users error during invite activation:", listError);
    return NextResponse.json({ error: "Could not verify administrator." }, { status: 500 });
  }

  const targetUser = usersData.users.find(
    (u) => u.email?.trim().toLowerCase() === email
  );

  if (!targetUser) {
    return NextResponse.json(
      { error: "This email address is not registered as an administrator." },
      { status: 404 }
    );
  }

  // 2. Verify target user has an entry in admins table
  const { data: adminRecord, error: adminError } = await adminClient
    .from("admins")
    .select("user_id, role, assigned_category, assigned_events, created_at")
    .eq("user_id", targetUser.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return NextResponse.json(
      { error: "This email address is not registered as an administrator." },
      { status: 403 }
    );
  }

  // 3. Security invariant: Only allow activating accounts that are invited / unconfirmed / never completed initial onboarding.
  // Active established admins who already completed setup must use standard password reset.
  const lastSignInTime = targetUser.last_sign_in_at ? new Date(targetUser.last_sign_in_at).getTime() : 0;
  const adminCreatedTime = adminRecord.created_at ? new Date(adminRecord.created_at).getTime() : 0;

  const isPendingInvite =
    !targetUser.email_confirmed_at ||
    !targetUser.last_sign_in_at ||
    Boolean(targetUser.invited_at && (!targetUser.last_sign_in_at || targetUser.last_sign_in_at === targetUser.invited_at)) ||
    (adminCreatedTime > 0 && adminCreatedTime >= lastSignInTime) ||
    targetUser.user_metadata?.onboarding_completed !== true;

  if (!isPendingInvite) {
    return NextResponse.json(
      {
        error:
          "This administrator account is already activated. Please sign in or use Forgot Password.",
      },
      { status: 400 }
    );
  }

  // 4. Update user password, confirm email, and mark onboarding completed atomically
  const { data: updatedData, error: updateError } =
    await adminClient.auth.admin.updateUserById(targetUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(targetUser.user_metadata || {}),
        onboarding_completed: true,
        saviskar_role: adminRecord.role,
      },
    });

  if (updateError || !updatedData?.user) {
    console.error("Failed to update user during invite activation:", updateError);
    return NextResponse.json(
      { error: updateError?.message || "Failed to set administrator password." },
      { status: 500 }
    );
  }

  // 5. Audit log
  try {
    await adminClient.from("admin_audit_logs").insert({
      admin_id: targetUser.id,
      action_type: "ADMIN_INVITE_ACTIVATED",
      target_id: targetUser.id,
      details: {
        email,
        role: adminRecord.role,
        ip: clientIp,
      },
    });
  } catch (auditErr) {
    console.error("Failed to write audit log for invite activation:", auditErr);
  }

  return NextResponse.json({
    success: true,
    email,
    role: adminRecord.role,
    message: "Administrator account activated successfully.",
  });
}
