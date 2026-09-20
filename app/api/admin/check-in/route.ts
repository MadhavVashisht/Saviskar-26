import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/supabase/server";

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();

  if (auth.error) {
    return response(
      {
        success: false,
        error:
          auth.error === "MFA_REQUIRED"
            ? "Master Admin MFA verification required."
            : auth.error,
      },
      auth.status
    );
  }

  let body: {
    participantEventId?: string;
    action?: "check_in" | "check_out";
  };

  try {
    body = await request.json();
  } catch {
    return response({ success: false, error: "Invalid request body." }, 400);
  }

  const { participantEventId, action } = body;

  if (!participantEventId || (action !== "check_in" && action !== "check_out")) {
    return response({ success: false, error: "Missing or invalid parameters." }, 400);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Check-in API is missing Supabase server configuration.");
    return response({ success: false, error: "Check-in service is not configured." }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  let paymentAmount = 0;

  if (action === "check_in") {
    const { data: participantEvent, error: fetchError } = await supabaseAdmin
      .from("participant_events")
      .select("id, payment_status, payment_amount")
      .eq("id", participantEventId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116" || fetchError.message === "Not found") {
        return response({ success: false, error: "Participant event not found." }, 404);
      }
      console.error("Failed to fetch participant event for payment check:", fetchError);
      return response({ success: false, error: "Could not verify participant event." }, 500);
    }

    if (!participantEvent) {
      return response({ success: false, error: "Participant event not found." }, 404);
    }

    const rawAmount = participantEvent.payment_amount;
    const paymentStatus = participantEvent.payment_status;

    // Fail closed if payment_amount is null, undefined, or not a non-negative number
    if (
      rawAmount === null ||
      rawAmount === undefined ||
      typeof rawAmount !== "number" ||
      Number.isNaN(rawAmount) ||
      rawAmount < 0
    ) {
      console.error("Check-in rejected: invalid payment_amount on participant event", {
        participantEventId,
        payment_amount: rawAmount,
      });
      return response(
        {
          success: false,
          error: "Inconsistent payment record: invalid amount.",
          paymentStatus: paymentStatus ?? "unpaid",
        },
        400
      );
    }

    paymentAmount = rawAmount;

    // Fail closed on inconsistent payment state (e.g. not_required with positive amount)
    if (paymentAmount > 0 && paymentStatus === "not_required") {
      console.error("Check-in rejected: inconsistent payment state (not_required with positive amount)", {
        participantEventId,
        paymentAmount,
        paymentStatus,
      });
      return response(
        {
          success: false,
          error: "Inconsistent payment record.",
          paymentStatus,
        },
        400
      );
    }

    // For paid events (paymentAmount > 0), payment_status must be 'paid'
    if (paymentAmount > 0 && paymentStatus !== "paid") {
      return response(
        {
          success: false,
          error: "Payment not complete",
          paymentStatus: paymentStatus ?? "unpaid",
        },
        402
      );
    }

    // Fail closed on any non-free status that is not 'paid' (e.g. pending/failed/refunded with amount 0)
    if (paymentStatus !== "paid" && paymentStatus !== "not_required") {
      return response(
        {
          success: false,
          error: "Payment not complete",
          paymentStatus: paymentStatus ?? "unpaid",
        },
        402
      );
    }
  }

  const checkInTime = action === "check_in" ? new Date().toISOString() : null;

  let updateQuery = supabaseAdmin
    .from("participant_events")
    .update({
      checked_in: action === "check_in",
      checked_in_at: checkInTime,
    })
    .eq("id", participantEventId);

  // For check-in, atomically enforce that the pass is not already checked in
  if (action === "check_in") {
    updateQuery = updateQuery.eq("checked_in", false);
  }

  // For check-in on paid events, atomically enforce payment_status = 'paid'
  if (action === "check_in" && paymentAmount > 0) {
    updateQuery = updateQuery.eq("payment_status", "paid");
  }

  const { data: updatedRecord, error } = await updateQuery
    .select("id, checked_in, checked_in_at")
    .maybeSingle();

  if (error) {
    console.error("Check-in update failed:", error);
    return response({ success: false, error: "Could not update check-in status." }, 500);
  }

  if (action === "check_in" && !updatedRecord) {
    // The conditional update matched 0 rows -> check if already checked in
    const { data: existingRow } = await supabaseAdmin
      .from("participant_events")
      .select("checked_in, checked_in_at")
      .eq("id", participantEventId)
      .maybeSingle();

    if (existingRow?.checked_in) {
      const formattedTime = existingRow.checked_in_at
        ? new Date(existingRow.checked_in_at).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "earlier";

      return response(
        {
          success: false,
          error: "ALREADY_CHECKED_IN",
          message: `This pass has already been scanned and checked in (at ${formattedTime}). Gate entry rejected.`,
          checked_in_at: existingRow.checked_in_at,
        },
        409
      );
    }

    return response({ success: false, error: "Participant event could not be checked in." }, 400);
  }

  return response({
    success: true,
    checked_in: action === "check_in",
    checked_in_at: checkInTime,
  });
}
