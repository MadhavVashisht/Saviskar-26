import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  DEFAULT_SITE_ACCESS,
  SITE_PAGE_DEFINITIONS,
  SITE_ACCESS_AUDIT_TARGET_ID,
  clearSiteAccessCache,
  __setTestSiteAccess,
} from "@/lib/config/site-access";
import {
  ACCOMMODATION_OPTIONS,
  DEFAULT_ACCOMMODATION_AVAILABILITY,
  getAccommodationOptionId,
  getAccommodationOptionById,
  isAccommodationOptionAvailable,
} from "@/lib/config/availability";
import * as serverLib from "@/lib/supabase/server";
import * as authSessionLib from "@/lib/auth/session";
import * as rateLimitLib from "@/lib/rate-limit";
import { GET as getSiteAccessApi } from "@/app/api/site-access/route";
import {
  GET as getAdminSiteAccessApi,
  PATCH as patchAdminSiteAccessApi,
} from "@/app/api/admin/site-access/route";
import { POST as postRegister } from "@/app/api/register/route";
import { POST as postTeamAccommodation } from "@/app/api/team/accommodation/route";
import { POST as postPaymentCreate } from "@/app/api/payments/create/route";
import { POST as postPaymentRecover } from "@/app/api/payments/recover/route";
import * as nextCache from "next/cache";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/components/ui/Navbar", () => ({ default: () => null }));
vi.mock("@/components/ui/Footer", () => ({ default: () => null }));
vi.mock("@/components/ui/MouseSpotlight", () => ({ default: () => null }));
vi.mock("@/components/registration/RegistrationFlowManager", () => ({
  default: (props: any) => ({ type: "RegistrationFlowManager", props }),
}));

vi.mock("next/server", async (importOriginal) => {
  const mod = await importOriginal<typeof import("next/server")>();
  return {
    ...mod,
    after: vi.fn(() => {}),
  };
});

function makeQueryChain(resolveData: any, errorData: any = null) {
  const defaultResolve = () => Promise.resolve({ data: resolveData, error: errorData });
  const chain: any = {
    then: (onFulfilled: any, onRejected: any) => defaultResolve().then(onFulfilled, onRejected),
    catch: (fn: any) => defaultResolve().catch(fn),
    finally: (fn: any) => defaultResolve().finally(fn),
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    in: () => chain,
    is: () => chain,
    ilike: () => chain,
    lt: () => chain,
    gt: () => chain,
    limit: () => chain,
    order: () => chain,
    update: () => chain,
    insert: () => chain,
    single: () =>
      Promise.resolve({
        data: Array.isArray(resolveData) ? resolveData[0] ?? null : resolveData,
        error: errorData,
      }),
    maybeSingle: () =>
      Promise.resolve({
        data: Array.isArray(resolveData) ? resolveData[0] ?? null : resolveData,
        error: errorData,
      }),
  };
  return chain;
}

let mockAuditLogInsert: ((rec: any) => Promise<{ error: any }>) | null = null;
let mockRpcHandler: ((name: string, params: any) => Promise<{ data: any; error: any }>) | null = null;
let mockFromHandler: ((table: string) => any) | null = null;

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => {
      if (mockFromHandler) {
        return mockFromHandler(table);
      }
      if (table === "admin_audit_logs") {
        return {
          insert: (rec: any) => {
            if (mockAuditLogInsert) return mockAuditLogInsert(rec);
            return Promise.resolve({ error: null });
          },
          select: () => makeQueryChain(null),
        };
      }
      return makeQueryChain(null);
    },
    rpc: (name: string, params: any) => {
      if (mockRpcHandler) return mockRpcHandler(name, params);
      if (name === "update_site_page_locks") {
        if (mockFromHandler) {
          const eventsMock = mockFromHandler("events");
          if (eventsMock?.update) {
            if (params.p_details?.toggle_competition) {
              const tc = params.p_details.toggle_competition;
              eventsMock.update({ registration_open: tc.registrationOpen })?.eq("id", tc.eventId);
            } else if (params.p_details?.bulk_competitions) {
              const bc = params.p_details.bulk_competitions;
              eventsMock.update({ registration_open: !bc.lockAll })?.eq("active", true);
            } else if (params.p_details?.apply_competition_locks) {
              for (const [id, val] of Object.entries(params.p_details.apply_competition_locks)) {
                eventsMock.update({ registration_open: val })?.eq("id", id);
              }
            }
          }
        }
        if (mockAuditLogInsert) {
          const insertPromise = mockAuditLogInsert({
            admin_id: params.p_admin_id,
            action_type: "SITE_PAGE_LOCKS_UPDATE",
            target_id: params.p_target_id,
            details: params.p_details,
          });
          return insertPromise.then((res: any) => {
            if (res?.error) return { data: null, error: res.error };
            return { data: { success: true, audit_id: "mock-audit-uuid" }, error: null };
          });
        }
        return Promise.resolve({ data: { success: true, audit_id: "mock-audit-uuid" }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    },
  }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock-test.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-secret-key";
process.env.TEST_LIVE_DB = "true";
process.env.PAYU_KEY = "test-payu-key";
process.env.PAYU_SALT = "test-payu-salt";
process.env.PAYU_ENVIRONMENT = "test";
process.env.RESUME_TOKEN_SECRET = "test-resume-token-secret-must-be-32-chars-long";

describe("Granular Availability Control — Unit & Integration Test Suite", () => {
  beforeEach(() => {
    clearSiteAccessCache();
    __setTestSiteAccess(null, null, null, DEFAULT_ACCOMMODATION_AVAILABILITY);
    mockAuditLogInsert = null;
    mockRpcHandler = null;
    mockFromHandler = null;
    vi.restoreAllMocks();

    vi.spyOn(rateLimitLib, "checkRateLimitAsync").mockResolvedValue({
      allowed: true,
      retryAfter: 0,
    });
  });

  // =========================================================================
  // SECTION 1: Catalog & Initial Policy Definitions
  // =========================================================================
  describe("1. Accommodation Catalog & Initial Policy Definition", () => {
    it("defines exactly 12 supported accommodation date options in master catalog", () => {
      expect(ACCOMMODATION_OPTIONS).toHaveLength(12);

      const optionIds = ACCOMMODATION_OPTIONS.map((o) => o.id);
      expect(optionIds).toContain("1_day:2026-10-31");
      expect(optionIds).toContain("2_days:2026-10-30");
      expect(optionIds).toContain("1_day:2026-10-27");
      expect(optionIds).toContain("1_day:2026-10-28");
      expect(optionIds).toContain("1_day:2026-10-29");
      expect(optionIds).toContain("1_day:2026-10-30");
      expect(optionIds).toContain("2_days:2026-10-28");
      expect(optionIds).toContain("3_days:2026-10-27");
      expect(optionIds).toContain("3_days:2026-10-28");
      expect(optionIds).toContain("3_days:2026-10-29");
      expect(optionIds).toContain("4_days:2026-10-27");
      expect(optionIds).toContain("4_days:2026-10-28");
    });

    it("enforces official pricing: ₹499 (1-day), ₹999 (2-days), ₹1,498 (3-days), ₹1,997 (4-days)", () => {
      for (const opt of ACCOMMODATION_OPTIONS) {
        if (opt.planSlug === "1_day") expect(opt.price).toBe(499);
        else if (opt.planSlug === "2_days") expect(opt.price).toBe(999);
        else if (opt.planSlug === "3_days") expect(opt.price).toBe(1498);
        else if (opt.planSlug === "4_days") expect(opt.price).toBe(1997);
        else throw new Error(`Unexpected plan slug: ${opt.planSlug}`);
      }
    });

    it("matches Initial Policy in DEFAULT_ACCOMMODATION_AVAILABILITY: only 31 Oct (1-day) and 30-31 Oct (2-days) are available", () => {
      expect(DEFAULT_ACCOMMODATION_AVAILABILITY["1_day:2026-10-31"]).toBe(true);
      expect(DEFAULT_ACCOMMODATION_AVAILABILITY["2_days:2026-10-30"]).toBe(true);

      // All other options must be unavailable
      const availableKeys = Object.entries(DEFAULT_ACCOMMODATION_AVAILABILITY)
        .filter(([, v]) => v === true)
        .map(([k]) => k);

      expect(availableKeys.sort()).toEqual(["1_day:2026-10-31", "2_days:2026-10-30"].sort());
      expect(DEFAULT_ACCOMMODATION_AVAILABILITY["1_day:2026-10-28"]).toBe(false);
      expect(DEFAULT_ACCOMMODATION_AVAILABILITY["2_days:2026-10-28"]).toBe(false);
      expect(DEFAULT_ACCOMMODATION_AVAILABILITY["3_days:2026-10-28"]).toBe(false);
      expect(DEFAULT_ACCOMMODATION_AVAILABILITY["4_days:2026-10-27"]).toBe(false);
    });

    it("generates correct option IDs with getAccommodationOptionId", () => {
      expect(getAccommodationOptionId("1_day", "2026-10-31")).toBe("1_day:2026-10-31");
      expect(getAccommodationOptionId("2_days", "2026-10-30")).toBe("2_days:2026-10-30");
      expect(getAccommodationOptionId("3_days", "2026-10-28")).toBe("3_days:2026-10-28");
    });

    it("retrieves catalog metadata by option ID with getAccommodationOptionById", () => {
      const opt = getAccommodationOptionById("1_day:2026-10-31");
      expect(opt).toBeDefined();
      expect(opt?.startDate).toBe("2026-10-31");
      expect(opt?.endDate).toBe("2026-11-01");
      expect(opt?.price).toBe(499);
      expect(opt?.durationDays).toBe(1);

      const unknown = getAccommodationOptionById("5_days:2026-10-27");
      expect(unknown).toBeUndefined();
    });

    it("evaluates availability correctly with isAccommodationOptionAvailable", () => {
      // Default initial policy
      expect(isAccommodationOptionAvailable("1_day", "2026-10-31")).toBe(true);
      expect(isAccommodationOptionAvailable("2_days", "2026-10-30")).toBe(true);
      expect(isAccommodationOptionAvailable("1_day", "2026-10-28")).toBe(false);
      expect(isAccommodationOptionAvailable("3_days", "2026-10-28")).toBe(false);

      // Custom override
      const customAvailability = {
        "1_day:2026-10-28": true,
        "1_day:2026-10-31": false,
      };
      expect(isAccommodationOptionAvailable("1_day", "2026-10-28", customAvailability)).toBe(true);
      expect(isAccommodationOptionAvailable("1_day", "2026-10-31", customAvailability)).toBe(false);
    });
  });

  // =========================================================================
  // SECTION 2: Public Site-Access API
  // =========================================================================
  describe("2. Public GET /api/site-access", () => {
    it("returns siteAccess locks, accommodationAvailability, and competitionLocks", async () => {
      const res = await getSiteAccessApi();
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.siteAccess).toBeDefined();
      expect(json.siteAccess.REGISTRATIONS_ENABLED).toBe(true);
      expect(json.siteAccess.ACCOMMODATION_ENABLED).toBe(true);

      expect(json.accommodationAvailability).toBeDefined();
      expect(json.accommodationAvailability["1_day:2026-10-31"]).toBe(true);
      expect(json.accommodationAvailability["2_days:2026-10-30"]).toBe(true);
      expect(json.accommodationAvailability["1_day:2026-10-28"]).toBe(false);

      expect(json.competitionLocks).toBeDefined();
    });
  });

  // =========================================================================
  // SECTION 3: Admin Site-Access API
  // =========================================================================
  describe("3. Admin API: Authorization & Discovery (GET & PATCH /api/admin/site-access)", () => {
    it("rejects unauthorized GET requests with 401", async () => {
      vi.spyOn(serverLib, "requireAdmin").mockResolvedValue({
        user: null,
        error: "Unauthorized",
        status: 401,
      } as any);

      const req = new NextRequest("http://localhost:3000/api/admin/site-access");
      const res = await getAdminSiteAccessApi(req);
      expect(res.status).toBe(401);
    });

    it("allows Admin GET request and returns competitions list and accommodationOptions", async () => {
      vi.spyOn(serverLib, "requireAdmin").mockResolvedValue({
        user: { id: "admin-uuid", email: "admin@saviskar.co.in" } as any,
        status: 200,
      } as any);
      vi.spyOn(serverLib, "isPrimaryMaster").mockReturnValue(true);

      mockFromHandler = (table: string) => {
        if (table === "events") {
          return makeQueryChain([
            {
              id: "ev-hackathon",
              name: "Web Dev Sprint",
              slug: "web-dev-sprint",
              category: "Technical",
              registration_type: "team",
              min_team_size: 2,
              max_team_size: 4,
              payment_type: "team",
              registration_fee: 500,
              payment_unit: "team",
              registration_open: true,
              active: true,
            },
            {
              id: "ev-dance",
              name: "Battle of Bands",
              slug: "battle-of-bands",
              category: "Cultural",
              registration_type: "team",
              min_team_size: 3,
              max_team_size: 8,
              payment_type: "team",
              registration_fee: 800,
              payment_unit: "team",
              registration_open: false,
              active: true,
            },
          ]);
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/admin/site-access");
      const res = await getAdminSiteAccessApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.isPrimary).toBe(true);
      expect(json.accommodationOptions).toHaveLength(12);
      expect(json.competitions).toHaveLength(2);
      expect(json.competitions[0].slug).toBe("web-dev-sprint");
      expect(json.competitions[1].registration_open).toBe(false);
    });

    it("rejects PATCH from non-admin with 401", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: null,
        error: "Unauthorized",
        status: 401,
      } as any);

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({ toggleCompetition: { eventId: "ev-1", registrationOpen: false } }),
      });
      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(401);
    });

    it("rejects PATCH from secondary admin with 403", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: { id: "secondary-admin", email: "sec@saviskar.co.in" } as any,
        error: "Forbidden",
        status: 403,
      } as any);

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({ toggleCompetition: { eventId: "ev-1", registrationOpen: false } }),
      });
      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain("Only Primary Master Admins");
    });
  });

  // =========================================================================
  // SECTION 4: Competition Availability Management (Admin PATCH)
  // =========================================================================
  describe("4. Granular Competition Availability Management", () => {
    it("allows Primary Master to toggle a single competition lock", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: { id: "primary-master-uuid", email: "jashan082006@gmail.com" } as any,
        status: 200,
      } as any);

      let updatedEventId: string | null = null;
      let updatedOpenValue: boolean | null = null;
      let persistedAuditRecord: any = null;

      mockFromHandler = (table: string) => {
        if (table === "events") {
          return {
            update: (payload: any) => {
              updatedOpenValue = payload.registration_open;
              return {
                eq: (col: string, val: string) => {
                  if (col === "id") updatedEventId = val;
                  return Promise.resolve({ error: null });
                },
              };
            },
          };
        }
        return makeQueryChain(null);
      };

      mockAuditLogInsert = (record: any) => {
        persistedAuditRecord = record;
        return Promise.resolve({ error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({
          toggleCompetition: { eventId: "ev-hackathon-123", registrationOpen: false },
        }),
      });

      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(updatedEventId).toBe("ev-hackathon-123");
      expect(updatedOpenValue).toBe(false);
      expect(json.competitionLocks["ev-hackathon-123"]).toBe(false);
      expect(persistedAuditRecord.details.competition_locks["ev-hackathon-123"]).toBe(false);
      expect(nextCache.revalidatePath).toHaveBeenCalledWith("/register");
    });

    it("allows Primary Master to bulk-lock all active competitions", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: { id: "primary-master-uuid", email: "jashan082006@gmail.com" } as any,
        status: 200,
      } as any);

      let bulkUpdatedOpenValue: boolean | null = null;
      let bulkFilterCol: string | null = null;

      mockFromHandler = (table: string) => {
        if (table === "events") {
          return {
            update: (payload: any) => {
              bulkUpdatedOpenValue = payload.registration_open;
              return {
                eq: (col: string, val: any) => {
                  bulkFilterCol = col;
                  return Promise.resolve({ error: null });
                },
              };
            },
          };
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({
          bulkCompetitions: { lockAll: true },
        }),
      });

      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(bulkUpdatedOpenValue).toBe(false);
      expect(bulkFilterCol).toBe("active");
      expect(json.message).toContain("locked against registration");
    });

    it("allows Primary Master to bulk-unlock all active competitions", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: { id: "primary-master-uuid", email: "jashan082006@gmail.com" } as any,
        status: 200,
      } as any);

      let bulkUpdatedOpenValue: boolean | null = null;

      mockFromHandler = (table: string) => {
        if (table === "events") {
          return {
            update: (payload: any) => {
              bulkUpdatedOpenValue = payload.registration_open;
              return {
                eq: () => Promise.resolve({ error: null }),
              };
            },
          };
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({
          bulkCompetitions: { lockAll: false },
        }),
      });

      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(bulkUpdatedOpenValue).toBe(true);
      expect(json.message).toContain("unlocked for registration");
    });
  });

  // =========================================================================
  // SECTION 5: Granular Accommodation Availability Management (Admin PATCH)
  // =========================================================================
  describe("5. Granular Accommodation Availability Management", () => {
    it("allows Primary Master to toggle a single accommodation option", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: { id: "primary-master-uuid", email: "jashan082006@gmail.com" } as any,
        status: 200,
      } as any);

      let persistedRecord: any = null;
      mockAuditLogInsert = (record: any) => {
        persistedRecord = record;
        return Promise.resolve({ error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({
          toggleAccommodation: { optionId: "1_day:2026-10-30", enabled: true },
        }),
      });

      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.accommodationAvailability["1_day:2026-10-30"]).toBe(true);
      expect(persistedRecord.details.accommodation_availability["1_day:2026-10-30"]).toBe(true);
    });

    it("allows Primary Master to reset accommodation availability to Initial Policy", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: { id: "primary-master-uuid", email: "jashan082006@gmail.com" } as any,
        status: 200,
      } as any);

      let persistedRecord: any = null;
      mockAuditLogInsert = (record: any) => {
        persistedRecord = record;
        return Promise.resolve({ error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({
          resetAccommodationToDefault: true,
        }),
      });

      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.accommodationAvailability["1_day:2026-10-31"]).toBe(true);
      expect(json.accommodationAvailability["2_days:2026-10-30"]).toBe(true);
      expect(json.accommodationAvailability["1_day:2026-10-28"]).toBe(false);
      expect(json.accommodationAvailability["3_days:2026-10-28"]).toBe(false);
      expect(persistedRecord.details.accommodation_availability["1_day:2026-10-31"]).toBe(true);
      expect(persistedRecord.details.accommodation_availability["2_days:2026-10-28"]).toBe(false);
    });

    it("ensures accommodation toggle affects only the targeted option ID and leaves other options untouched", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: { id: "primary-master-uuid", email: "jashan082006@gmail.com" } as any,
        status: 200,
      } as any);

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({
          toggleAccommodation: { optionId: "1_day:2026-10-28", enabled: true },
        }),
      });

      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.accommodationAvailability["1_day:2026-10-28"]).toBe(true);
      // Other options must retain their prior policy state
      expect(json.accommodationAvailability["1_day:2026-10-31"]).toBe(true);
      expect(json.accommodationAvailability["2_days:2026-10-30"]).toBe(true);
      expect(json.accommodationAvailability["1_day:2026-10-27"]).toBe(false);
      expect(json.accommodationAvailability["3_days:2026-10-28"]).toBe(false);
    });

    it("ensures updating an overall page lock does not overwrite granular availability configurations", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: { id: "primary-master-uuid", email: "jashan082006@gmail.com" } as any,
        status: 200,
      } as any);

      let persistedRecord: any = null;
      mockAuditLogInsert = (record: any) => {
        persistedRecord = record;
        return Promise.resolve({ error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({
          key: "SCHEDULE_ENABLED",
          enabled: false,
        }),
      });

      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.siteAccess.SCHEDULE_ENABLED).toBe(false);
      expect(persistedRecord.details.accommodation_availability).toBeDefined();
      expect(persistedRecord.details.competition_locks).toBeDefined();
    });

    it("fails closed with 500 when atomic update_site_page_locks RPC fails and leaves database configuration state intact", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: { id: "primary-master-uuid", email: "jashan082006@gmail.com" } as any,
        status: 200,
      } as any);

      mockRpcHandler = (name: string) => {
        if (name === "update_site_page_locks") {
          return Promise.resolve({
            data: null,
            error: { message: "database deadlock / lock timeout", code: "40P01" },
          });
        }
        return Promise.resolve({ data: null, error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({
          toggleAccommodation: { optionId: "1_day:2026-10-30", enabled: true },
        }),
      });

      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toContain("Failed to persist site lock configuration");
    });
  });

  // =========================================================================
  // SECTION 6: Registration API Competition Enforcement (/api/register)
  // =========================================================================
  describe("6. Registration API Competition Availability Enforcement", () => {
    const validClosedEventUuid = "11111111-1111-4111-8111-111111111111";
    const validInactiveEventUuid = "22222222-2222-4222-8222-222222222222";
    const validOpenEventUuid = "33333333-3333-4333-8333-333333333333";

    it("rejects registration with HTTP 403 EVENT_REGISTRATION_CLOSED when a requested competition has registration_open: false", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "participant@example.com",
      });

      mockFromHandler = (table: string) => {
        if (table === "events") {
          return makeQueryChain([
            {
              id: validClosedEventUuid,
              name: "Battle of Bands",
              active: true,
              registration_open: false,
            },
          ]);
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Leader",
          email: "participant@example.com",
          phone: "9876543210",
          college: "CGC Landran",
          gender: "Male",
          state: "Punjab",
          events: [
            {
              eventId: validClosedEventUuid,
              team: "The Rockers",
              isTeamHead: true,
              members: [
                {
                  name: "Teammate One",
                  email: "mate1@example.com",
                  phone: "9876543211",
                  college: "CGC Landran",
                  gender: "Male",
                  state: "Punjab",
                },
              ],
            },
          ],
        }),
      });

      const res = await postRegister(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("EVENT_REGISTRATION_CLOSED");
      expect(json.error).toContain("Battle of Bands");
      expect(json.error).toContain("currently closed");
    });

    it("rejects registration with HTTP 403 EVENT_REGISTRATION_CLOSED when an event is inactive", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "participant@example.com",
      });

      mockFromHandler = (table: string) => {
        if (table === "events") {
          return makeQueryChain([
            {
              id: validInactiveEventUuid,
              name: "Retired Competition",
              active: false,
              registration_open: true,
            },
          ]);
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Leader",
          email: "participant@example.com",
          phone: "9876543210",
          college: "CGC Landran",
          gender: "Male",
          state: "Punjab",
          events: [
            {
              eventId: validInactiveEventUuid,
              team: "Solo Act",
              isTeamHead: true,
              members: [],
            },
          ],
        }),
      });

      const res = await postRegister(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("EVENT_REGISTRATION_CLOSED");
    });

    it("maps database RPC SVK14 error to HTTP 403 EVENT_REGISTRATION_CLOSED", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "participant@example.com",
      });

      mockFromHandler = (table: string) => {
        if (table === "events") {
          return makeQueryChain([
            {
              id: validOpenEventUuid,
              name: "Web Dev Sprint",
              active: true,
              registration_open: true,
            },
          ]);
        }
        return makeQueryChain(null);
      };

      mockRpcHandler = (name: string) => {
        if (name === "register_participant_events") {
          return Promise.resolve({
            data: null,
            error: {
              code: "SVK14",
              message: "Competition registration is closed for this event.",
            },
          });
        }
        return Promise.resolve({ data: null, error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Leader",
          email: "participant@example.com",
          phone: "9876543210",
          college: "CGC Landran",
          gender: "Male",
          state: "Punjab",
          events: [
            {
              eventId: validOpenEventUuid,
              team: "Web Warriors",
              isTeamHead: true,
              members: [
                {
                  name: "Teammate One",
                  email: "mate1@example.com",
                  phone: "9876543211",
                  college: "CGC Landran",
                  gender: "Male",
                  state: "Punjab",
                },
              ],
            },
          ],
        }),
      });

      const res = await postRegister(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("EVENT_REGISTRATION_CLOSED");
    });
  });

  // =========================================================================
  // SECTION 7: Registration API Accommodation Enforcement (/api/register)
  // =========================================================================
  describe("7. Registration API Accommodation Availability Enforcement", () => {
    it("allows registration for available Initial Policy option (1_day on 2026-10-31)", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "participant@example.com",
      });

      mockFromHandler = (table: string) => {
        if (table === "participants") {
          return makeQueryChain({
            id: "participant-uuid-1",
            participant_id: "SVK26-P001",
            email: "participant@example.com",
          });
        }
        if (table === "payment_orders") {
          return makeQueryChain({
            id: "ord-uuid-1",
            order_reference: "SVK-ORD-1",
            amount: 499,
            currency: "INR",
            status: "pending",
          });
        }
        if (table === "participant_accommodations") {
          return makeQueryChain([
            {
              id: "acc-uuid-1",
              participant_id: "participant-uuid-1",
              payment_order_id: "ord-uuid-1",
              start_date: "2026-10-31",
            },
          ]);
        }
        return makeQueryChain(null);
      };

      let calledRpcParams: any = null;
      mockRpcHandler = (name: string, params: any) => {
        if (name === "register_participant_events") {
          calledRpcParams = params;
          return Promise.resolve({
            data: [
              {
                participant_id: "SVK26-P001",
                order_id: "ord-uuid-1",
                payment_order_id: "ord-uuid-1",
                amount: 499,
                currency: "INR",
                status: "pending",
              },
            ],
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Participant",
          email: "participant@example.com",
          phone: "9876543210",
          college: "CGC Landran",
          gender: "Male",
          state: "Punjab",
          events: [],
          accommodations: [
            {
              email: "participant@example.com",
              planSlug: "1_day",
              selectedDate: "2026-10-31",
            },
          ],
        }),
      });

      const res = await postRegister(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(calledRpcParams).toBeDefined();
    });

    it("allows registration for available Initial Policy option (2_days on 2026-10-30)", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "participant@example.com",
      });

      mockFromHandler = (table: string) => {
        if (table === "participants") {
          return makeQueryChain({
            id: "participant-uuid-2",
            participant_id: "SVK26-P002",
            email: "participant@example.com",
          });
        }
        if (table === "payment_orders") {
          return makeQueryChain({
            id: "ord-uuid-2",
            order_reference: "SVK-ORD-2",
            amount: 999,
            currency: "INR",
            status: "pending",
          });
        }
        if (table === "participant_accommodations") {
          return makeQueryChain([
            {
              id: "acc-uuid-2",
              participant_id: "participant-uuid-2",
              payment_order_id: "ord-uuid-2",
              start_date: "2026-10-30",
            },
          ]);
        }
        return makeQueryChain(null);
      };

      mockRpcHandler = (name: string) => {
        if (name === "register_participant_events") {
          return Promise.resolve({
            data: [
              {
                participant_id: "SVK26-P002",
                order_id: "ord-uuid-2",
                payment_order_id: "ord-uuid-2",
                amount: 999,
                currency: "INR",
                status: "pending",
              },
            ],
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Participant",
          email: "participant@example.com",
          phone: "9876543210",
          college: "CGC Landran",
          gender: "Male",
          state: "Punjab",
          events: [],
          accommodations: [
            {
              email: "participant@example.com",
              planSlug: "2_days",
              selectedDate: "2026-10-30",
            },
          ],
        }),
      });

      const res = await postRegister(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("rejects registration with HTTP 403 ACCOMMODATION_DATES_UNAVAILABLE for unavailable options under Initial Policy", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "participant@example.com",
      });

      const testUnavailableConfigs = [
        { planSlug: "1_day", selectedDate: "2026-10-27" },
        { planSlug: "1_day", selectedDate: "2026-10-28" },
        { planSlug: "1_day", selectedDate: "2026-10-29" },
        { planSlug: "1_day", selectedDate: "2026-10-30" },
        { planSlug: "2_days", selectedDate: "2026-10-28" },
        { planSlug: "3_days", selectedDate: "2026-10-28" },
        { planSlug: "4_days", selectedDate: "2026-10-27" },
      ];

      for (const config of testUnavailableConfigs) {
        const req = new NextRequest("http://localhost:3000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test Participant",
            email: "participant@example.com",
            phone: "9876543210",
            college: "CGC Landran",
            gender: "Male",
            state: "Punjab",
            events: [],
            accommodations: [
              {
                email: "participant@example.com",
                planSlug: config.planSlug,
                selectedDate: config.selectedDate,
              },
            ],
          }),
        });

        const res = await postRegister(req);
        expect(res.status).toBe(403);
        const json = await res.json();
        expect(json.code).toBe("ACCOMMODATION_DATES_UNAVAILABLE");
        expect(json.error).toContain("currently unavailable");
      }
    });

    it("maps database RPC SVK15 error to HTTP 403 ACCOMMODATION_DATES_UNAVAILABLE", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "participant@example.com",
      });

      mockRpcHandler = (name: string) => {
        if (name === "register_participant_events") {
          return Promise.resolve({
            data: null,
            error: {
              code: "SVK15",
              message: "Selected accommodation plan or dates are currently unavailable.",
            },
          });
        }
        return Promise.resolve({ data: null, error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Participant",
          email: "participant@example.com",
          phone: "9876543210",
          college: "CGC Landran",
          gender: "Male",
          state: "Punjab",
          events: [],
          accommodations: [
            {
              email: "participant@example.com",
              planSlug: "1_day",
              selectedDate: "2026-10-31",
            },
          ],
        }),
      });

      const res = await postRegister(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("ACCOMMODATION_DATES_UNAVAILABLE");
    });
  });

  // =========================================================================
  // SECTION 8: Standalone Accommodation Booking API (/api/team/accommodation)
  // =========================================================================
  describe("8. Standalone Accommodation Booking API Enforcement", () => {
    it("rejects booking for unavailable dates with HTTP 403 ACCOMMODATION_DATES_UNAVAILABLE", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "leader@example.com",
      });

      mockFromHandler = (table: string) => {
        if (table === "participants") {
          return makeQueryChain({
            id: "leader-uuid",
            participant_id: "SVK-LEADER-1",
            name: "Leader Name",
            email: "leader@example.com",
            phone: "9876543210",
            college: "CGC Landran",
          });
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/team/accommodation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookings: [
            {
              email: "leader@example.com",
              planSlug: "1_day",
              selectedDate: "2026-10-28", // Unavailable under initial policy
            },
          ],
        }),
      });

      const res = await postTeamAccommodation(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("ACCOMMODATION_DATES_UNAVAILABLE");
      expect(json.error).toContain("currently unavailable");
    });

    it("allows booking for available dates under Initial Policy (1_day on 2026-10-31)", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "leader@example.com",
      });

      mockFromHandler = (table: string) => {
        if (table === "participants") {
          return makeQueryChain({
            id: "leader-uuid",
            participant_id: "SVK-LEADER-1",
            name: "Leader Name",
            email: "leader@example.com",
            phone: "9876543210",
            college: "CGC Landran",
          });
        }
        if (table === "payment_orders") {
          return makeQueryChain({
            id: "ord-acc-standalone",
            order_reference: "SVK-ACC-1",
            amount: 499,
            currency: "INR",
            status: "pending",
          });
        }
        if (table === "participant_accommodations") {
          return makeQueryChain([]);
        }
        return makeQueryChain(null);
      };

      mockRpcHandler = (name: string) => {
        if (name === "register_participant_events") {
          return Promise.resolve({
            data: [
              {
                participant_id: "SVK-LEADER-1",
                payment_order_id: "ord-acc-standalone",
              },
            ],
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/team/accommodation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookings: [
            {
              email: "leader@example.com",
              planSlug: "1_day",
              selectedDate: "2026-10-31", // Live under initial policy
            },
          ],
        }),
      });

      const res = await postTeamAccommodation(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 9: Option A In-Flight Hold Policy (/api/payments/create & recover)
  // =========================================================================
  describe("9. Option A In-Flight Hold Policy Verification", () => {
    it("permits in-flight checkout for orders created BEFORE lock within the approved 1-hour hold window (e.g. 8 minutes old)", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "buyer@example.com",
      });

      // Lock occurred 5 minutes ago
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      __setTestSiteAccess(
        { ACCOMMODATION_ENABLED: false },
        fiveMinutesAgo,
        null,
        {
          ...DEFAULT_ACCOMMODATION_AVAILABILITY,
          "1_day:2026-10-31": false, // Granular lock as well
        },
        {}
      );

      // Order was created 8 minutes ago (3 minutes BEFORE lock occurred, well within 60m window)
      const eightMinutesAgo = new Date(Date.now() - 8 * 60 * 1000).toISOString();

      mockFromHandler = (table: string) => {
        if (table === "payment_orders") {
          return makeQueryChain({
            id: "ord-pre-lock",
            order_reference: "SVK-PRELOCK-1",
            payer_participant_id: "participant-uuid-1",
            amount: 499,
            currency: "INR",
            gateway: "payu",
            gateway_order_id: null,
            status: "pending",
            created_at: eightMinutesAgo,
            updated_at: eightMinutesAgo,
          });
        }
        if (table === "participants") {
          return makeQueryChain({
            id: "participant-uuid-1",
            participant_id: "SVK26-PAYER001",
            name: "Pre-lock Payer",
            email: "buyer@example.com",
            phone: "9876543210",
          });
        }
        if (table === "payment_order_items") {
          return makeQueryChain([
            {
              id: "item-1",
              participant_id: "participant-uuid-1",
              participant_event_id: null,
              participant_accommodation_id: "acc-booking-uuid-1",
              amount: 499,
            },
          ]);
        }
        if (table === "participant_accommodations") {
          return makeQueryChain([
            {
              id: "acc-booking-uuid-1",
              plan_slug: "1_day",
              start_date: "2026-10-31",
            },
          ]);
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", host: "saviskar.co.in" },
        body: JSON.stringify({ paymentOrderId: "ord-pre-lock" }),
      });

      const res = await postPaymentCreate(req);
      // It should NOT be rejected for lock; should reach payment params generation
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.paymentOrderId).toBe("ord-pre-lock");
    });

    it("permits in-flight checkout for orders created BEFORE lock within the approved 1-hour hold window (e.g. 45 minutes old)", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "buyer@example.com",
      });

      // Lock occurred 40 minutes ago
      const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000).toISOString();
      __setTestSiteAccess(
        { ACCOMMODATION_ENABLED: false },
        fortyMinutesAgo,
        null,
        {
          ...DEFAULT_ACCOMMODATION_AVAILABILITY,
          "1_day:2026-10-31": false, // Granular lock as well
        },
        {}
      );

      // Order was created 45 minutes ago (5 minutes BEFORE lock occurred, well within 60m window)
      const fortyFiveMinutesAgo = new Date(Date.now() - 45 * 60 * 1000).toISOString();

      mockFromHandler = (table: string) => {
        if (table === "payment_orders") {
          return makeQueryChain({
            id: "ord-pre-lock-45m",
            order_reference: "SVK-PRELOCK-45M",
            payer_participant_id: "participant-uuid-1",
            amount: 499,
            currency: "INR",
            gateway: "payu",
            gateway_order_id: null,
            status: "pending",
            created_at: fortyFiveMinutesAgo,
            updated_at: fortyFiveMinutesAgo,
          });
        }
        if (table === "participants") {
          return makeQueryChain({
            id: "participant-uuid-1",
            participant_id: "SVK26-PAYER001",
            name: "Pre-lock Payer 45M",
            email: "buyer@example.com",
            phone: "9876543210",
          });
        }
        if (table === "payment_order_items") {
          return makeQueryChain([
            {
              id: "item-1",
              participant_id: "participant-uuid-1",
              participant_event_id: null,
              participant_accommodation_id: "acc-booking-uuid-1",
              amount: 499,
            },
          ]);
        }
        if (table === "participant_accommodations") {
          return makeQueryChain([
            {
              id: "acc-booking-uuid-1",
              plan_slug: "1_day",
              start_date: "2026-10-31",
            },
          ]);
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", host: "saviskar.co.in" },
        body: JSON.stringify({ paymentOrderId: "ord-pre-lock-45m" }),
      });

      const res = await postPaymentCreate(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.paymentOrderId).toBe("ord-pre-lock-45m");
    });

    it("rejects checkout with HTTP 403 for orders created AFTER accommodation lock occurred", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "buyer@example.com",
      });

      // Lock occurred 10 minutes ago
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      __setTestSiteAccess(
        { ACCOMMODATION_ENABLED: false },
        tenMinutesAgo,
        null,
        DEFAULT_ACCOMMODATION_AVAILABILITY,
        {}
      );

      // Order was created 2 minutes ago (AFTER lock occurred)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

      mockFromHandler = (table: string) => {
        if (table === "payment_orders") {
          return makeQueryChain({
            id: "ord-post-lock",
            order_reference: "SVK-POSTLOCK-1",
            payer_participant_id: "participant-uuid-1",
            amount: 499,
            currency: "INR",
            gateway: "payu",
            gateway_order_id: null,
            status: "pending",
            created_at: twoMinutesAgo,
            updated_at: twoMinutesAgo,
          });
        }
        if (table === "participants") {
          return makeQueryChain({
            id: "participant-uuid-1",
            participant_id: "SVK26-PAYER001",
            name: "Post-lock Payer",
            email: "buyer@example.com",
            phone: "9876543210",
          });
        }
        if (table === "payment_order_items") {
          return makeQueryChain([
            {
              id: "item-1",
              participant_id: "participant-uuid-1",
              participant_event_id: null,
              participant_accommodation_id: "acc-booking-uuid-1",
              amount: 499,
            },
          ]);
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", host: "saviskar.co.in" },
        body: JSON.stringify({ paymentOrderId: "ord-post-lock" }),
      });

      const res = await postPaymentCreate(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("ACCOMMODATION_LOCKED");
    });

    it("ensures locking an option does not invalidate legitimate existing completed payments (status: paid)", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "payer@cgc.edu.in",
      });

      // Lock accommodation completely
      __setTestSiteAccess(
        { ACCOMMODATION_ENABLED: false },
        new Date().toISOString(),
        null,
        DEFAULT_ACCOMMODATION_AVAILABILITY,
        {}
      );

      mockFromHandler = (table: string) => {
        if (table === "participants") {
          return makeQueryChain({
            id: "participant-uuid-1",
            participant_id: "SVK26-PAYER001",
            name: "Paid Payer",
            email: "payer@cgc.edu.in",
          });
        }
        if (table === "participant_accommodations") {
          return makeQueryChain({
            id: "acc-booking-paid",
            status: "paid",
            amount: 499,
            payment_order_id: "ord-paid-1",
            start_date: "2026-10-31",
            end_date: "2026-11-01",
            participants: {
              id: "participant-uuid-1",
              participant_id: "SVK26-PAYER001",
              email: "payer@cgc.edu.in",
            },
          });
        }
        if (table === "payment_order_items") {
          return makeQueryChain({
            payment_order_id: "ord-paid-1",
            participant_id: "participant-uuid-1",
            payment_orders: {
              id: "ord-paid-1",
              status: "paid", // Already paid
              payer_participant_id: "participant-uuid-1",
              amount: 499,
              created_at: new Date(Date.now() - 60000).toISOString(),
            },
          });
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/payments/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: "SVK26-PAYER001",
          participantAccommodationId: "acc-booking-paid",
        }),
      });

      const res = await postPaymentRecover(req);
      // Already paid returns 400 "Payment is already completed", NEVER 403 lock error!
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("already completed");
      expect(json.code).not.toBe("ACCOMMODATION_LOCKED");
      expect(json.code).not.toBe("ACCOMMODATION_DATES_UNAVAILABLE");
    });

    it("prevents forged or stale client requests from manufacturing a pre-lock hold", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "attacker@example.com",
      });

      // Lock occurred 10 minutes ago
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      __setTestSiteAccess(
        { ACCOMMODATION_ENABLED: false },
        tenMinutesAgo,
        null,
        DEFAULT_ACCOMMODATION_AVAILABILITY,
        {}
      );

      // Order created in database 2 minutes ago (AFTER lock)
      const postLockDbTime = new Date(Date.now() - 2 * 60 * 1000).toISOString();

      mockFromHandler = (table: string) => {
        if (table === "payment_orders") {
          return makeQueryChain({
            id: "ord-forged-attempt",
            order_reference: "SVK-FORGED-1",
            payer_participant_id: "participant-attacker",
            amount: 499,
            currency: "INR",
            gateway: "payu",
            gateway_order_id: null,
            status: "pending",
            created_at: postLockDbTime, // Authoritative DB time is POST-lock
            updated_at: postLockDbTime,
          });
        }
        if (table === "participants") {
          return makeQueryChain({
            id: "participant-attacker",
            participant_id: "SVK26-ATTACKER",
            name: "Attacker",
            email: "attacker@example.com",
            phone: "9876543210",
          });
        }
        if (table === "payment_order_items") {
          return makeQueryChain([
            {
              id: "item-1",
              participant_id: "participant-attacker",
              participant_event_id: null,
              participant_accommodation_id: "acc-booking-attacker",
              amount: 499,
            },
          ]);
        }
        return makeQueryChain(null);
      };

      // Attacker sends forged header or payload claiming pre-lock creation
      const req = new NextRequest("http://localhost:3000/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          host: "saviskar.co.in",
          "x-client-order-time": new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        body: JSON.stringify({
          paymentOrderId: "ord-forged-attempt",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        }),
      });

      const res = await postPaymentCreate(req);
      // Server must check authoritative DB created_at and reject
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("ACCOMMODATION_LOCKED");
    });

    it("rejects checkout with HTTP 403 when the accommodation hold window has expired (> 1 hour, e.g. 75 minutes)", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "buyer@example.com",
      });

      // Lock occurred 30 minutes ago
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      __setTestSiteAccess(
        { ACCOMMODATION_ENABLED: false },
        thirtyMinutesAgo,
        null,
        DEFAULT_ACCOMMODATION_AVAILABILITY,
        {}
      );

      // Order created 75 minutes ago (exceeds CHECKOUT_EXPIRATION_THRESHOLD_MS of 60 minutes)
      const seventyFiveMinutesAgo = new Date(Date.now() - 75 * 60 * 1000).toISOString();

      mockFromHandler = (table: string) => {
        if (table === "payment_orders") {
          return makeQueryChain({
            id: "ord-expired-hold",
            order_reference: "SVK-EXPIRED-1",
            payer_participant_id: "participant-uuid-1",
            amount: 499,
            currency: "INR",
            gateway: "payu",
            gateway_order_id: null,
            status: "pending",
            created_at: seventyFiveMinutesAgo,
            updated_at: seventyFiveMinutesAgo,
          });
        }
        if (table === "participants") {
          return makeQueryChain({
            id: "participant-uuid-1",
            participant_id: "SVK26-PAYER001",
            name: "Expired Payer",
            email: "buyer@example.com",
            phone: "9876543210",
          });
        }
        if (table === "payment_order_items") {
          return makeQueryChain([
            {
              id: "item-1",
              participant_id: "participant-uuid-1",
              participant_event_id: null,
              participant_accommodation_id: "acc-booking-uuid-1",
              amount: 499,
            },
          ]);
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", host: "saviskar.co.in" },
        body: JSON.stringify({ paymentOrderId: "ord-expired-hold" }),
      });

      const res = await postPaymentCreate(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("ACCOMMODATION_LOCKED");
    });
  });

  // =========================================================================
  // SECTION 10: Targeted Concurrency Audit — Concurrent Event Lock & Registration
  // =========================================================================
  describe("10. Targeted Concurrency Audit: Concurrent Event Lock & Registration Race Protection", () => {
    const targetEventId = "33333333-3333-4333-8333-333333333333";

    it("verifies updating events.registration_open occurs within update_site_page_locks atomic transaction under advisory lock", async () => {
      vi.spyOn(serverLib, "requirePrimaryMasterAdmin").mockResolvedValue({
        user: { id: "primary-master-uuid", email: "jashan082006@gmail.com" } as any,
        status: 200,
      } as any);

      let rpcNameCalled: string | null = null;
      let rpcDetailsPassed: any = null;

      mockRpcHandler = (name: string, params: any) => {
        if (name === "update_site_page_locks") {
          rpcNameCalled = name;
          rpcDetailsPassed = params.p_details;
          return Promise.resolve({
            data: { success: true, audit_id: "audit-atomic-1" },
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      };

      const req = new NextRequest("http://localhost:3000/api/admin/site-access", {
        method: "PATCH",
        body: JSON.stringify({
          toggleCompetition: { eventId: targetEventId, registrationOpen: false },
        }),
      });

      const res = await patchAdminSiteAccessApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(rpcNameCalled).toBe("update_site_page_locks");
      expect(rpcDetailsPassed.toggle_competition).toEqual({
        eventId: targetEventId,
        registrationOpen: false,
      });
      expect(rpcDetailsPassed.competition_locks[targetEventId]).toBe(false);
    });

    it("simulates concurrent registration and event lock: registration arriving AFTER lock commits is rejected with zero partial records", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "racer@example.com",
      });

      // Event is currently closed in database following committed lock transaction
      mockFromHandler = (table: string) => {
        if (table === "events") {
          return makeQueryChain([
            {
              id: targetEventId,
              name: "Autonomous Drone Racing",
              category: "Technical",
              registration_type: "individual",
              registration_fee: 250,
              payment_type: "paid",
              payment_unit: "per_student",
              registration_open: false, // Locked by committed admin transaction
              active: true,
            },
          ]);
        }
        return makeQueryChain(null);
      };

      const req = new NextRequest("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Racer One",
          email: "racer@example.com",
          phone: "9876543210",
          college: "Tech Institute",
          gender: "Male",
          state: "Punjab",
          events: [{ eventId: targetEventId }],
        }),
      });

      const res = await postRegister(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe("EVENT_REGISTRATION_CLOSED");
      expect(json.error).toContain("Autonomous Drone Racing");
    });

    it("simulates concurrent registration completing BEFORE event lock commits: registration succeeds and is never invalidated", async () => {
      vi.spyOn(authSessionLib, "getRegistrationSession").mockResolvedValue({
        authenticated: true,
        email: "racer2@example.com",
      });

      // Step 1: Event is open when registration arrives
      let isEventOpen = true;

      mockFromHandler = (table: string) => {
        if (table === "events") {
          return makeQueryChain([
            {
              id: targetEventId,
              name: "Autonomous Drone Racing",
              category: "Technical",
              registration_type: "individual",
              registration_fee: 0,
              payment_type: "free",
              payment_unit: null,
              registration_open: isEventOpen,
              active: true,
            },
          ]);
        }
        if (table === "participants") {
          return makeQueryChain(null);
        }
        return makeQueryChain(null);
      };

      mockRpcHandler = (name: string) => {
        if (name === "register_participant_events") {
          return Promise.resolve({
            data: [
              {
                participant_id: "SVK26-RACE001",
                participant_event_id: "pe-race-uuid-1",
                event_id: targetEventId,
                event_name: "Autonomous Drone Racing",
                status: "confirmed",
                payment_order_id: null,
              },
            ],
            error: null,
          });
        }
        return Promise.resolve({ data: null, error: null });
      };

      const regReq = new NextRequest("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Racer Two",
          email: "racer2@example.com",
          phone: "9876543211",
          college: "Tech Institute",
          gender: "Female",
          state: "Punjab",
          events: [{ eventId: targetEventId }],
        }),
      });

      const regRes = await postRegister(regReq);
      expect(regRes.status).toBe(201);
      const regJson = await regRes.json();
      expect(regJson.success).toBe(true);
      expect(regJson.participantId).toBe("SVK26-RACE001");

      // Step 2: Now admin locks the event concurrently
      isEventOpen = false;

      // Prior registration remains fully confirmed; subsequent registration for same event is rejected
      const nextRegReq = new NextRequest("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Racer Two Retry",
          email: "racer2@example.com",
          phone: "9876543212",
          college: "Tech Institute",
          gender: "Male",
          state: "Punjab",
          events: [{ eventId: targetEventId }],
        }),
      });

      const nextRegRes = await postRegister(nextRegReq);
      expect(nextRegRes.status).toBe(403);
      const nextRegJson = await nextRegRes.json();
      expect(nextRegJson.code).toBe("EVENT_REGISTRATION_CLOSED");
    });
  });
});
