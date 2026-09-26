/**
 * GET /api/participants/[participantId]
 *
 * Public participant lookup for the registration form with ownership challenge.
 *
 * Requires both participantId and the registered email address to prevent
 * unauthorized profile enumeration and PII harvesting.
 *
 * Rate limited to 10 requests/minute per IP.
 * PII is masked and response is minimized to only the fields consumed by the frontend.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit";

const PARTICIPANT_ID_PATTERN = /^SVK26-[A-Z0-9]{8}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ participantId: string }>;
  }
) {
  // ─── Rate Limiting (10 requests per minute per IP) ──────
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimitAsync(`lookup:${clientIp}`, 10, 60 * 1000);

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

  const { participantId: rawParticipantId } = await context.params;
  const participantId = rawParticipantId.trim().toUpperCase();

  if (!PARTICIPANT_ID_PATTERN.test(participantId)) {
    return jsonResponse(
      {
        success: false,
        error: "Invalid participant ID.",
      },
      400
    );
  }

  const { searchParams } = new URL(request.url);
  const rawEmail = searchParams.get("email");

  if (!rawEmail || !rawEmail.trim()) {
    return jsonResponse(
      {
        success: false,
        error: "Participant ID and registered email are required.",
      },
      400
    );
  }

  const normalizedEmail = rawEmail.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return jsonResponse(
      {
        success: false,
        error: "Invalid email format.",
      },
      400
    );
  }

  // ─── Supabase Admin ─────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error("Public participant lookup: Missing Supabase config.");
    return jsonResponse(
      {
        success: false,
        error: "Participant lookup is not configured.",
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

  // ─── Look Up Participant ────────────────────────────────
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
    .eq("participant_id", participantId)
    .maybeSingle();

  if (error) {
    console.error("Participant lookup failed:", error);
    return jsonResponse(
      {
        success: false,
        error: "Unable to look up this participant.",
      },
      500
    );
  }

  // Ownership verification: compare normalized email against authoritative participant email
  // If no record or email mismatch, return non-enumerating 404
  if (!data || !data.email || data.email.trim().toLowerCase() !== normalizedEmail) {
    return jsonResponse(
      {
        success: false,
        error: "Participant not found.",
      },
      404
    );
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

  return jsonResponse({
    success: true,
    participant: {
      participantId: data.participant_id,
      name: data.name,
      college: data.college,
      email: maskEmail(data.email),
      phone: maskPhone(data.phone),
    },
    events: Array.from(eventsByParticipantEventId.values()),
  });
}
