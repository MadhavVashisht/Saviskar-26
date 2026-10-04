/**
 * GET /api/participants/me
 *
 * Authenticated participant lookup for current registration session.
 *
 * Automatically resolves the logged-in participant using the cryptographically
 * verified svk_reg_session HTTP-only cookie. No participant ID parameter required
 * from the client, eliminating manual ID typing.
 *
 * Rate limited to 30 requests/minute per IP.
 * PII is masked and response is minimized to only the fields consumed by the frontend.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit";
import { getRegistrationSession } from "@/lib/auth/session";
import { getPaymentGateway } from "@/lib/payments";

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function maskEmail(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex <= 1) {
    return `***${email.slice(atIndex)}`;
  }
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  return `${local[0]}***${domain}`;
}

function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length >= 6) {
    return `${cleaned.slice(0, 2)}*****${cleaned.slice(-2)}`;
  }
  return "******";
}

export async function GET(request: NextRequest) {
  // ─── Rate Limiting (30 requests per minute per IP) ──────
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimitAsync(`lookup-me:${clientIp}`, 30, 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many lookup attempts. Please wait a moment and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  // ─── Session Verification ──────────────────────────────
  const session = await getRegistrationSession();

  if (!session.authenticated || !session.email) {
    return jsonResponse(
      {
        success: false,
        error: "Registration authentication required.",
      },
      401
    );
  }

  const normalizedEmail = session.email.trim().toLowerCase();

  // ─── Supabase Admin ─────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Authenticated participant lookup: Missing Supabase config.");
    return jsonResponse(
      {
        success: false,
        error: "Participant service is not configured.",
      },
      500
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // ─── Look Up Participant by Session Email ────────────────
  const { data, error } = await supabaseAdmin
    .from("participants")
    .select(
      `
      id,
      participant_id,
      name,
      college,
      email,
      phone,
      participant_events (
        id,
        event_id,
        payment_status,
        payment_amount,
        is_archived,
        events (
          name
        )
      ),
      participant_event_members (
        id,
        participant_event_id,
        participant_events (
          id,
          event_id,
          payment_status,
          payment_amount,
          is_archived,
          events (
            name
          )
        )
      )
    `
    )
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("Session participant lookup failed:", error);
    return jsonResponse(
      {
        success: false,
        error: "Unable to retrieve participant details.",
      },
      500
    );
  }

  // If no record found, this is an authenticated user who hasn't registered yet
  if (!data) {
    return jsonResponse({
      success: true,
      found: false,
    });
  }

  // ─── Format Events (Minimizing to only UI-required fields) ───
  type RawEventRecord = {
    id: string;
    event_id: string;
    payment_status: string | null;
    payment_amount: number | null;
    is_archived?: boolean | null;
    events:
      | { name: string | null }
      | { name: string | null }[]
      | null;
  };

  const directEvents = (data.participant_events as RawEventRecord[] | null) ?? [];
  const memberRows =
    (data.participant_event_members as Array<{
      id: string;
      participant_event_id: string;
      participant_events: RawEventRecord | RawEventRecord[] | null;
    }> | null) ?? [];

  const eventsByParticipantEventId = new Map<
    string,
    {
      participantEventId: string;
      eventId: string;
      eventName: string;
      paymentStatus: string | null;
      paymentAmount: number | null;
    }
  >();

  // 1. Process direct events (individual or team events where this participant is the registrant/leader)
  for (const event of directEvents) {
    if (!event || event.is_archived === true) continue;
    const eventName =
      (Array.isArray(event.events) ? event.events[0] : event.events)?.name ??
      "Unknown event";

    eventsByParticipantEventId.set(event.id, {
      participantEventId: event.id,
      eventId: event.event_id,
      eventName,
      paymentStatus: event.payment_status,
      paymentAmount: event.payment_amount,
    });
  }

  // 2. Process team member events (events where this participant is registered as a team member)
  for (const memberRow of memberRows) {
    const event = Array.isArray(memberRow.participant_events)
      ? memberRow.participant_events[0]
      : memberRow.participant_events;

    if (!event || event.is_archived === true) continue;
    if (eventsByParticipantEventId.has(event.id)) continue;

    const eventName =
      (Array.isArray(event.events) ? event.events[0] : event.events)?.name ??
      "Unknown event";

    eventsByParticipantEventId.set(event.id, {
      participantEventId: event.id,
      eventId: event.event_id,
      eventName,
      paymentStatus: event.payment_status,
      paymentAmount: event.payment_amount,
    });
  }

  // ─── Auto-Reconcile Pending Orders with Gateway ───────────
  // If the participant has pending events, check if any pending payment order has already
  // been captured on the gateway (e.g. attendee completed payment on phone, or webhook was delayed).
  const hasPendingEvents = Array.from(eventsByParticipantEventId.values()).some(
    (e) => e.paymentStatus === "pending"
  );

  if (hasPendingEvents) {
    try {
      const { data: pendingOrders } = await supabaseAdmin
        .from("payment_orders")
        .select("id, gateway_order_id, gateway, amount")
        .eq("payer_participant_id", data.id)
        .eq("status", "pending")
        .not("gateway_order_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(3);

      if (pendingOrders && pendingOrders.length > 0) {
        for (const pOrder of pendingOrders) {
          if (!pOrder.gateway_order_id) continue;
          const gateway = getPaymentGateway(pOrder.gateway ?? undefined);
          try {
            const details = await gateway.fetchPaymentDetails(pOrder.gateway_order_id);
            if (details.status === "paid") {
              const fetchedGatewayPaymentId = details.gatewayPaymentId;

              const { data: eventClaim, error: claimError } = await supabaseAdmin
                .from("processed_payment_events")
                .insert({
                  order_id: pOrder.id,
                  payment_id: fetchedGatewayPaymentId,
                  event_type: "payment.captured.recovery",
                })
                .select("id")
                .maybeSingle();

              const isDuplicate = claimError?.code === "23505" || (!claimError && !eventClaim);

              if (!isDuplicate) {
                await supabaseAdmin
                  .from("payment_orders")
                  .update({
                    status: "paid",
                    gateway_payment_id: fetchedGatewayPaymentId,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", pOrder.id);

                const { data: orderItems } = await supabaseAdmin
                  .from("payment_order_items")
                  .select("participant_event_id, participant_id")
                  .eq("payment_order_id", pOrder.id);

                const participantEventIds = (orderItems ?? [])
                  .map((item) => item.participant_event_id)
                  .filter(Boolean) as string[];

                if (participantEventIds.length > 0) {
                  await supabaseAdmin
                    .from("participant_events")
                    .update({
                      payment_status: "paid",
                      payment_id: fetchedGatewayPaymentId,
                      updated_at: new Date().toISOString(),
                    })
                    .in("id", participantEventIds);

                  for (const peId of participantEventIds) {
                    const existing = eventsByParticipantEventId.get(peId);
                    if (existing) {
                      existing.paymentStatus = "paid";
                    }
                  }
                }

                await supabaseAdmin
                  .from("payments")
                  .insert({
                    participant_id: data.id,
                    participant_event_id: participantEventIds[0] ?? null,
                    amount: Number(pOrder.amount),
                    status: "paid",
                    gateway: gateway.name,
                    gateway_payment_id: fetchedGatewayPaymentId,
                    gateway_order_id: pOrder.gateway_order_id,
                  });

                const { ensurePaymentConfirmationSent } = await import("@/lib/payments/post-payment");
                void ensurePaymentConfirmationSent(pOrder.id);
              }
            }
          } catch (fetchErr) {
            console.warn("Participant me gateway check skipped:", fetchErr);
          }
        }
      }
    } catch (reconcileErr) {
      console.warn("Participant me auto-reconcile error:", reconcileErr);
    }
  }

  return jsonResponse({
    success: true,
    found: true,
    participant: {
      participantId: data.participant_id,
      name: data.name,
      college: data.college,
      email: data.email,
      phone: data.phone,
    },
    events: Array.from(eventsByParticipantEventId.values()),
  });
}
