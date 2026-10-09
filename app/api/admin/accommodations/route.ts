import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireAccommodationAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) return null;

  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * DELETE /api/admin/accommodations
 *
 * Permanently removes a participant's accommodation booking.
 * Releases any room allocation, unlinks/cleans up associated order items,
 * writes an audit log, and removes the accommodation record.
 *
 * Query params or JSON body:
 * - id OR participantAccommodationId: UUID of the accommodation record
 */
export async function DELETE(request: Request) {
  try {
    const auth = await requireAccommodationAdmin();
    if (auth.error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message:
              auth.error === "MFA_REQUIRED"
                ? "Master Admin MFA verification required."
                : auth.error,
          },
        },
        { status: auth.status }
      );
    }

    const url = new URL(request.url);
    let accommodationId =
      url.searchParams.get("id") ||
      url.searchParams.get("participantAccommodationId");

    if (!accommodationId && request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json().catch(() => null);
      if (body) {
        accommodationId = body.id || body.participantAccommodationId;
      }
    }

    if (!accommodationId || typeof accommodationId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing accommodation record ID.",
          },
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SERVER_ERROR",
            message: "Admin service not configured.",
          },
        },
        { status: 500 }
      );
    }

    // 1. Try atomic RPC if installed
    try {
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
        "delete_accommodation_permanently",
        {
          p_accommodation_id: accommodationId,
          p_admin_id: auth.user.id,
        }
      );

      if (!rpcError && rpcData?.success) {
        return NextResponse.json({
          success: true,
          message: "Accommodation record deleted successfully.",
        });
      }

      if (rpcError) {
        console.warn(
          "delete_accommodation_permanently RPC skipped, falling back to direct admin deletion:",
          rpcError.message
        );
      }
    } catch (rpcEx) {
      console.warn("delete_accommodation_permanently RPC exception:", rpcEx);
    }

    // 2. Direct Admin Fallback (guaranteed execution across all database environments)
    const { data: acc, error: fetchError } = await supabaseAdmin
      .from("participant_accommodations")
      .select(`
        id,
        participant_id,
        amount,
        status,
        start_date,
        end_date,
        hostel_id,
        room_id,
        participants (
          id,
          name,
          email,
          participant_id
        )
      `)
      .eq("id", accommodationId)
      .maybeSingle();

    if (fetchError || !acc) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Accommodation record not found.",
          },
        },
        { status: 404 }
      );
    }

    // A. Delete allocation records
    await supabaseAdmin
      .from("accommodation_allocations")
      .delete()
      .eq("participant_accommodation_id", accommodationId);

    // B. Handle payment order items
    // Set participant_accommodation_id to null so foreign key never blocks deletion
    await supabaseAdmin
      .from("payment_order_items")
      .update({ participant_accommodation_id: null })
      .eq("participant_accommodation_id", accommodationId);

    // C. Audit log
    const p = Array.isArray(acc.participants) ? acc.participants[0] : acc.participants;
    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_id: auth.user.id,
      action_type: "DELETE_ACCOMMODATION",
      target_id: accommodationId,
      details: {
        participant_id: p?.participant_id,
        participant_name: p?.name,
        participant_email: p?.email,
        amount: acc.amount,
        status: acc.status,
        start_date: acc.start_date,
        end_date: acc.end_date,
        deleted_at: new Date().toISOString(),
      },
    });

    // D. Delete the accommodation record
    const { error: deleteError } = await supabaseAdmin
      .from("participant_accommodations")
      .delete()
      .eq("id", accommodationId);

    if (deleteError) {
      console.error("Direct accommodation delete failed:", deleteError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DELETE_FAILED",
            message: deleteError.message || "Could not delete accommodation record.",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Accommodation record deleted successfully.",
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/accommodations exception:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: err?.message || "Internal server error.",
        },
      },
      { status: 500 }
    );
  }
}
