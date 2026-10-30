import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  requireAdmin,
  requirePrimaryMasterAdmin,
  isPrimaryMaster,
} from "@/lib/supabase/server";
import {
  getSiteAccess,
  getSiteAccessState,
  clearSiteAccessCache,
  DEFAULT_SITE_ACCESS,
  DEFAULT_ACCOMMODATION_AVAILABILITY,
  ACCOMMODATION_OPTIONS,
  SITE_PAGE_DEFINITIONS,
  SITE_ACCESS_AUDIT_TARGET_ID,
  type SitePageKey,
  type SiteAccessConfig,
} from "@/lib/config/site-access";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const state = await getSiteAccessState({ bypassCache: true });
    const isPrimary = isPrimaryMaster(auth.user);

    let competitions: any[] = [];
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      try {
        const { data: compData } = await supabaseAdmin
          .from("events")
          .select(
            "id, name, slug, category, registration_type, min_team_size, max_team_size, payment_type, registration_fee, payment_unit, registration_open, active"
          )
          .eq("active", true)
          .order("name", { ascending: true });
        competitions = compData || [];
      } catch (e) {
        console.warn("Failed to load events for site-access admin view:", e);
      }
    }

    return NextResponse.json(
      {
        success: true,
        siteAccess: state.locks,
        isPrimary,
        definitions: SITE_PAGE_DEFINITIONS,
        accommodationAvailability: state.accommodationAvailability,
        accommodationOptions: ACCOMMODATION_OPTIONS,
        competitions,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("GET /api/admin/site-access error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requirePrimaryMasterAdmin();

    if (auth.error) {
      return NextResponse.json(
        {
          error:
            auth.status === 403
              ? "Access denied. Only Primary Master Admins have authorization to lock or unlock site pages."
              : auth.error,
        },
        { status: auth.status }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database configuration is missing." },
        { status: 500 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      key?: string;
      enabled?: boolean;
      locks?: Partial<SiteAccessConfig>;
      accommodationAvailability?: Record<string, boolean>;
      toggleAccommodation?: { optionId: string; enabled: boolean };
      resetAccommodationToDefault?: boolean;
      toggleCompetition?: { eventId: string; registrationOpen: boolean };
      bulkCompetitions?: { lockAll: boolean };
      competitionLocks?: Record<string, boolean>;
    };

    const currentState = await getSiteAccessState({ bypassCache: true });
    const currentLocks = currentState.locks;
    const updatedLocks: SiteAccessConfig = { ...currentLocks };
    let accommodationLockedAt = currentState.accommodationLockTimestamp;
    let registrationLockedAt = currentState.registrationLockTimestamp;

    const updatedAccommodationAvailability: Record<string, boolean> = {
      ...currentState.accommodationAvailability,
    };
    const updatedCompetitionLocks: Record<string, boolean> = {
      ...currentState.competitionLocks,
    };

    let changeDescription = "Site page locks updated successfully.";

    const hasPageLockUpdate =
      (body.key && typeof body.enabled === "boolean") ||
      (body.locks && typeof body.locks === "object");

    const hasAccommodationUpdate =
      Boolean(body.toggleAccommodation) ||
      Boolean(body.accommodationAvailability && typeof body.accommodationAvailability === "object") ||
      Boolean(body.resetAccommodationToDefault);

    const hasCompetitionUpdate =
      Boolean(body.toggleCompetition) ||
      Boolean(body.bulkCompetitions) ||
      Boolean(body.competitionLocks && typeof body.competitionLocks === "object");

    if (!hasPageLockUpdate && !hasAccommodationUpdate && !hasCompetitionUpdate) {
      return NextResponse.json(
        {
          error:
            "Provide a valid page lock mutation, accommodation availability update, or competition toggle.",
        },
        { status: 400 }
      );
    }

    // 1. Process Page Locks
    if (body.key && typeof body.enabled === "boolean") {
      const validKey = body.key as SitePageKey;
      if (!(validKey in DEFAULT_SITE_ACCESS)) {
        return NextResponse.json(
          { error: `Invalid page lock key: '${body.key}'` },
          { status: 400 }
        );
      }
      updatedLocks[validKey] = body.enabled;

      if (validKey === "ACCOMMODATION_ENABLED") {
        if (!body.enabled) {
          if (currentLocks.ACCOMMODATION_ENABLED !== false || !accommodationLockedAt) {
            accommodationLockedAt = new Date().toISOString();
          }
        } else {
          accommodationLockedAt = null;
        }
      }

      if (validKey === "REGISTRATIONS_ENABLED" || validKey === "REGISTRATION_ENABLED") {
        updatedLocks.REGISTRATIONS_ENABLED = body.enabled;
        updatedLocks.REGISTRATION_ENABLED = body.enabled;

        if (!body.enabled) {
          if (
            (currentLocks.REGISTRATIONS_ENABLED !== false && currentLocks.REGISTRATION_ENABLED !== false) ||
            !registrationLockedAt
          ) {
            registrationLockedAt = new Date().toISOString();
          }
        } else {
          registrationLockedAt = null;
        }
      }
      changeDescription = `${SITE_PAGE_DEFINITIONS[validKey]?.name || validKey} has been ${body.enabled ? "unlocked" : "locked"}.`;
    } else if (body.locks && typeof body.locks === "object") {
      for (const [k, v] of Object.entries(body.locks)) {
        if (k in DEFAULT_SITE_ACCESS && typeof v === "boolean") {
          updatedLocks[k as SitePageKey] = v;
        }
      }

      if (typeof body.locks.ACCOMMODATION_ENABLED === "boolean") {
        if (!body.locks.ACCOMMODATION_ENABLED) {
          if (currentLocks.ACCOMMODATION_ENABLED !== false || !accommodationLockedAt) {
            accommodationLockedAt = new Date().toISOString();
          }
        } else {
          accommodationLockedAt = null;
        }
      }

      let regVal: boolean | undefined = undefined;
      if (typeof body.locks.REGISTRATION_ENABLED === "boolean" && typeof body.locks.REGISTRATIONS_ENABLED === "boolean") {
        if (body.locks.REGISTRATIONS_ENABLED !== currentLocks.REGISTRATIONS_ENABLED) {
          regVal = body.locks.REGISTRATIONS_ENABLED;
        } else if (body.locks.REGISTRATION_ENABLED !== currentLocks.REGISTRATION_ENABLED) {
          regVal = body.locks.REGISTRATION_ENABLED;
        } else {
          regVal = body.locks.REGISTRATION_ENABLED;
        }
      } else if (typeof body.locks.REGISTRATION_ENABLED === "boolean") {
        regVal = body.locks.REGISTRATION_ENABLED;
      } else if (typeof body.locks.REGISTRATIONS_ENABLED === "boolean") {
        regVal = body.locks.REGISTRATIONS_ENABLED;
      }

      if (typeof regVal === "boolean") {
        updatedLocks.REGISTRATIONS_ENABLED = regVal;
        updatedLocks.REGISTRATION_ENABLED = regVal;
        if (!regVal) {
          if (
            (currentLocks.REGISTRATIONS_ENABLED !== false && currentLocks.REGISTRATION_ENABLED !== false) ||
            !registrationLockedAt
          ) {
            registrationLockedAt = new Date().toISOString();
          }
        } else {
          registrationLockedAt = null;
        }
      }
      changeDescription = "Site page locks updated successfully.";
    }

    // 2. Process Granular Accommodation Availability
    if (body.toggleAccommodation) {
      const { optionId, enabled } = body.toggleAccommodation;
      if (typeof optionId === "string" && typeof enabled === "boolean") {
        updatedAccommodationAvailability[optionId] = enabled;
        changeDescription = `Accommodation option ${optionId} is now ${enabled ? "available" : "unavailable"}.`;
      }
    } else if (body.resetAccommodationToDefault) {
      for (const k of Object.keys(DEFAULT_ACCOMMODATION_AVAILABILITY)) {
        updatedAccommodationAvailability[k] = DEFAULT_ACCOMMODATION_AVAILABILITY[k];
      }
      changeDescription = "Accommodation availability reset to default initial policy.";
    } else if (body.accommodationAvailability && typeof body.accommodationAvailability === "object") {
      for (const [k, v] of Object.entries(body.accommodationAvailability)) {
        if (typeof v === "boolean") {
          updatedAccommodationAvailability[k] = v;
        }
      }
      changeDescription = "Accommodation availability options updated.";
    }

    // 3. Process Granular Competition Locks
    if (body.toggleCompetition) {
      const { eventId, registrationOpen } = body.toggleCompetition;
      if (typeof eventId === "string" && typeof registrationOpen === "boolean") {
        updatedCompetitionLocks[eventId] = registrationOpen;
        changeDescription = `Competition registration has been ${registrationOpen ? "unlocked (opened)" : "locked (closed)"}.`;
      }
    } else if (body.bulkCompetitions) {
      const targetOpen = !body.bulkCompetitions.lockAll;
      changeDescription = targetOpen
        ? "All active competitions unlocked for registration."
        : "All active competitions locked against registration.";
    } else if (body.competitionLocks && typeof body.competitionLocks === "object") {
      for (const [eventId, isOpen] of Object.entries(body.competitionLocks)) {
        if (typeof isOpen === "boolean") {
          updatedCompetitionLocks[eventId] = isOpen;
        }
      }
      changeDescription = "Competition registration locks updated.";
    }

    const auditDetails = {
      locks: updatedLocks,
      lock_timestamps: {
        ACCOMMODATION_ENABLED: accommodationLockedAt,
        REGISTRATION_ENABLED: registrationLockedAt,
        REGISTRATIONS_ENABLED: registrationLockedAt,
      },
      accommodation_locked_at: accommodationLockedAt,
      registration_locked_at: registrationLockedAt,
      accommodation_availability: updatedAccommodationAvailability,
      competition_locks: updatedCompetitionLocks,
      toggle_competition: body.toggleCompetition,
      bulk_competitions: body.bulkCompetitions,
      apply_competition_locks: body.competitionLocks,
      changed_key: body.key || "granular_availability",
      changed_value: typeof body.enabled === "boolean" ? body.enabled : undefined,
      updated_by: auth.user.email,
      updated_at: new Date().toISOString(),
    };

    // Database-level Synchronization:
    // Execute atomic RPC with exclusive advisory lock to eliminate races with booking creation.
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc("update_site_page_locks", {
      p_admin_id: auth.user.id,
      p_target_id: SITE_ACCESS_AUDIT_TARGET_ID,
      p_details: auditDetails,
    });

    if (rpcError || !rpcResult?.success) {
      console.error("Failed to persist site page lock via atomic RPC:", rpcError);
      const isMissingRpc =
        rpcError?.code === "PGRST202" ||
        rpcError?.code === "42883" ||
        rpcError?.message?.includes("does not exist");

      return NextResponse.json(
        {
          error: isMissingRpc
            ? "Atomic site page lock service is unavailable. Please verify database migrations."
            : "Failed to persist site lock configuration.",
        },
        { status: 500 }
      );
    }

    clearSiteAccessCache();

    try {
      revalidatePath("/register");
      revalidatePath("/schedule");
      revalidatePath("/starnight");
      revalidatePath("/gallery");
      revalidatePath("/sponsors");
      revalidatePath("/team");
      revalidatePath("/legacy");
      revalidatePath("/events");
    } catch {
      // Ignore static generation store errors in offline/test environments
    }

    return NextResponse.json(
      {
        success: true,
        siteAccess: updatedLocks,
        accommodationAvailability: updatedAccommodationAvailability,
        competitionLocks: updatedCompetitionLocks,
        message: changeDescription,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("PATCH /api/admin/site-access error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
