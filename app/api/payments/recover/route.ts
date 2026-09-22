import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { getRegistrationSession } from "@/lib/auth/session";
import { verifyPaymentResumeToken } from "@/lib/payments/resume-token";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return errorResponse("Payment service is not configured.", 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  let body: {
    participantId?: string;
    participantEventId?: string;
    resumeToken?: string;
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const participantId =
    typeof body.participantId === "string" ? body.participantId.trim().toUpperCase() : "";
  const participantEventId =
    typeof body.participantEventId === "string" ? body.participantEventId.trim() : "";

  if (!participantId || !participantEventId) {
    return errorResponse("Missing required fields.", 400);
  }

  // ─── Token Input Conflict Hardening ─────────────────────
  const headerToken =
    request.headers.get("x-payment-resume-token")?.trim() || "";
  const bodyToken =
    typeof body.resumeToken === "string" ? body.resumeToken.trim() : "";

  if (headerToken && bodyToken && headerToken !== bodyToken) {
    return errorResponse("Mismatched payment resume tokens provided.", 400);
  }

  const resumeToken = headerToken || bodyToken;

  // ─── Initial Credential Check ───────────────────────────
  const session = await getRegistrationSession();

  if (!session.authenticated && !resumeToken) {
    return errorResponse("Payment recovery authorization required.", 401);
  }

  // ─── 1. Load Participant Event & Owner ──────────────────
  const { data: pe, error: peError } = await supabaseAdmin
    .from("participant_events")
    .select(`
      id, payment_status, event_id, payment_amount,
      participants!inner(participant_id, id, email),
      events!inner(payment_type)
    `)
    .eq("id", participantEventId)
    .maybeSingle();

  if (peError || !pe) {
    return errorResponse("Registration not found.", 404);
  }

  const rawParticipant = pe.participants;
  const participantData = Array.isArray(rawParticipant) ? rawParticipant[0] : rawParticipant;

  if (!participantData || participantData.participant_id !== participantId) {
    return errorResponse("Unauthorized. Registration does not belong to this participant.", 403);
  }

  // ─── 2. Authorize via Session or Resume Token ───────────
  let isAuthorized = false;

  // Option A: Active Registration Session
  if (session.authenticated && session.email) {
    if (
      participantData.email &&
      session.email.toLowerCase() === participantData.email.trim().toLowerCase()
    ) {
      isAuthorized = true;
    }
  }

  // Option B: Signed Payment Resume Token
  let verifiedTokenPayload: ReturnType<typeof verifyPaymentResumeToken>["payload"] = undefined;

  if (!isAuthorized && resumeToken) {
    const tokenResult = verifyPaymentResumeToken(resumeToken);
    if (tokenResult.valid && tokenResult.payload) {
      const payload = tokenResult.payload;
      if (
        payload.participantId === participantData.participant_id &&
        payload.payerParticipantUuid === participantData.id
      ) {
        isAuthorized = true;
        verifiedTokenPayload = payload;
      }
    }
  }

  if (!isAuthorized) {
    return errorResponse("Unauthorized access to this registration.", 403);
  }

  // ─── 3. Verify Payment Status & Amount ──────────────────
  if (pe.payment_status === "paid") {
    return errorResponse("Payment is already completed.", 400);
  }

  const amount = pe.payment_amount || 0;
  if (amount <= 0) {
    return errorResponse("No payment required for this event.", 400);
  }

  // ─── 4. Look For Existing Pending Payment Order ─────────
  const { data: existingItem } = await supabaseAdmin
    .from("payment_order_items")
    .select(`
      payment_order_id,
      participant_id,
      payment_orders!inner(id, status, payer_participant_id)
    `)
    .eq("participant_event_id", participantEventId)
    .eq("payment_orders.status", "pending")
    .limit(1)
    .maybeSingle();

  if (existingItem?.payment_order_id) {
    const paymentOrderData = Array.isArray(existingItem.payment_orders)
      ? existingItem.payment_orders[0]
      : existingItem.payment_orders;

    // Verify entire chain resolves to the same participant
    if (
      existingItem.participant_id !== participantData.id ||
      paymentOrderData?.payer_participant_id !== participantData.id
    ) {
      return errorResponse("Payment order data mismatch.", 403);
    }

    if (
      verifiedTokenPayload &&
      verifiedTokenPayload.paymentOrderId !== existingItem.payment_order_id
    ) {
      return errorResponse("Payment token does not match this order.", 403);
    }

    return NextResponse.json(
      { paymentOrderId: existingItem.payment_order_id },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // If authorized via resume token, token is tied to a specific paymentOrderId
  if (verifiedTokenPayload) {
    return errorResponse("Pending payment order for this link was not found.", 404);
  }

  // ─── 5. Create New Payment Order (Session Authorized) ───
  const orderRef = `SVK-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

  const { data: newOrder, error: orderError } = await supabaseAdmin
    .from("payment_orders")
    .insert({
      order_reference: orderRef,
      payer_participant_id: participantData.id,
      amount: amount,
      currency: "INR",
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !newOrder) {
    console.error("Order create error:", orderError);
    return errorResponse("Could not create payment order.", 500);
  }

  // ─── 6. Create Payment Order Item ───────────────────────
  const { error: itemError } = await supabaseAdmin
    .from("payment_order_items")
    .insert({
      payment_order_id: newOrder.id,
      participant_id: participantData.id,
      participant_event_id: participantEventId,
      event_id: pe.event_id,
      amount: amount,
    });

  if (itemError) {
    console.error("Order item create error:", itemError);
    return errorResponse("Could not link payment order.", 500);
  }

  return NextResponse.json(
    { paymentOrderId: newOrder.id },
    { headers: { "Cache-Control": "no-store" } }
  );
}
