import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPaymentGateway } from "@/lib/payments";
import { generatePaymentResumeUrl } from "@/lib/payments/resume-token";
import { getCanonicalPaymentBaseUrl, STABLE_PRODUCTION_ORIGIN } from "@/lib/payments/canonical-url";
import { WebhookEvent } from "@/lib/payments/types";

export async function POST(request: NextRequest) {
  // ─── Resolve Canonical Redirect Base Origin ─────────────
  const baseUrlResult = getCanonicalPaymentBaseUrl(request);
  if (!baseUrlResult.success) {
    console.error(baseUrlResult.internalLog);
  }
  const redirectBase = baseUrlResult.success ? baseUrlResult.origin : STABLE_PRODUCTION_ORIGIN;

  // ─── Supabase Admin ─────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error("PayU failure API: Missing Supabase config.");
    return NextResponse.redirect(new URL("/register?error=server-config", redirectBase), 303);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // ─── Parse Request ──────────────────────────────────────
  let bodyText = "";
  try {
    bodyText = await request.text();
  } catch {
    return NextResponse.redirect(new URL("/register?error=invalid-request", redirectBase), 303);
  }

  const gateway = getPaymentGateway("payu");

  // Validate the webhook / response hash
  const validateResult = gateway.validateWebhook({ body: bodyText, signature: "" });
  const rawParams = new URLSearchParams(bodyText);

  const gatewayOrderId = validateResult.event?.gatewayOrderId || rawParams.get("txnid")?.trim() || "";

  if (!gatewayOrderId) {
    return NextResponse.redirect(new URL("/register?error=missing-order-id", redirectBase), 303);
  }

  // ─── Look Up Payment Order ──────────────────────────────
  const { data: paymentOrder, error: lookupError } = await supabaseAdmin
    .from("payment_orders")
    .select(`
      id,
      order_reference,
      payer_participant_id,
      amount,
      currency,
      gateway,
      gateway_order_id,
      status
    `)
    .eq("gateway_order_id", gatewayOrderId)
    .maybeSingle();

  if (lookupError || !paymentOrder) {
    console.error("Payment order lookup for failure route failed:", lookupError);
    return NextResponse.redirect(new URL("/register?error=order-not-found", redirectBase), 303);
  }

  const paymentOrderId = paymentOrder.id;

  // Find participant IDs for generating the resume token
  let participantPublicId = "";
  const payerParticipantUuid = paymentOrder.payer_participant_id ?? "";

  if (payerParticipantUuid) {
    const { data: payer } = await supabaseAdmin
      .from("participants")
      .select("participant_id")
      .eq("id", payerParticipantUuid)
      .maybeSingle();
    participantPublicId = payer?.participant_id ?? "";
  }

  const resumeUrl = generatePaymentResumeUrl({
    paymentOrderId,
    participantId: participantPublicId,
    payerParticipantUuid,
    baseUrl: redirectBase,
  });

  // We can update the status of paymentOrder to 'failed' if we wanted to, 
  // but Saviskar currently keeps it 'pending' and lets them retry creating a new gateway order
  // or resuming the existing one. We will just redirect to the resume screen.

  // The resume token will show them the pending payment UI which lets them retry.
  return NextResponse.redirect(new URL(resumeUrl), 303);
}
