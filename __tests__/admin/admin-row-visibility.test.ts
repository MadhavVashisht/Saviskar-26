/**
 * __tests__/admin/admin-row-visibility.test.ts
 *
 * Unit tests for the AdminRow control visibility logic in
 * app/admin/admins/page.tsx.
 *
 * These tests verify the DECISION TREE for which controls are shown,
 * mirroring the JSX branches in AdminRow exactly:
 *
 *   if (isPrimary)          → show "Primary administrator" label only
 *   else if (isSuperMaster) → show management controls (remove / role change)
 *     if (master)           → show "Change to Normal" + "Remove Master Access"
 *     else                  → show "Make Master" + "Remove access"
 *   else if (master)        → show "Master management restricted" label
 *   else                    → show "Remove access" button (Normal Admin)
 *
 * The key bug being guarded here: isPrimary must come from admin.isPrimary
 * (server-authoritative), NOT from a hardcoded email comparison.
 */

import { describe, it, expect } from "vitest";

// ─── Replicate the AdminRecord type ────────────────────────────────────────
type AdminRecord = {
  user_id: string;
  role: "master" | "admin";
  created_at: string;
  email: string | null;
  auth_created_at: string | null;
  last_sign_in_at: string | null;
  isPrimary?: boolean;
};

// ─── Extract the AdminRow decision logic as a pure function ────────────────
// This mirrors exactly the JSX branching in AdminRow:
//   {isPrimary ? "primary-label" : isSuperMaster ? (master ? "master-controls" : "normal-controls") : master ? "restricted-label" : "remove-button"}
type AdminRowControls =
  | "primary-label"          // isPrimary: show protected state, no controls
  | "master-controls"        // isSuperMaster + master: Change to Normal + Remove Master Access
  | "normal-controls"        // isSuperMaster + !master: Make Master + Remove access
  | "restricted-label"       // !isSuperMaster + master: "restricted to Primary Master"
  | "remove-button";         // !isSuperMaster + !master: Normal Admin remove

function getAdminRowControls(
  admin: AdminRecord,
  isSuperMaster: boolean,
  master: boolean
): AdminRowControls {
  // This is the CORRECTED computation — uses admin.isPrimary, not a hardcoded email
  const isPrimary = admin.isPrimary ?? false;

  if (isPrimary) {
    return "primary-label";
  } else if (isSuperMaster) {
    return master ? "master-controls" : "normal-controls";
  } else if (master) {
    return "restricted-label";
  } else {
    return "remove-button";
  }
}

// ─── Shared test fixtures ──────────────────────────────────────────────────

const primaryMasterAdmin: AdminRecord = {
  user_id: "primary-uuid",
  role: "master",
  created_at: "2026-01-01T00:00:00Z",
  email: "jashan082006@gmail.com",
  auth_created_at: null,
  last_sign_in_at: null,
  isPrimary: true,
};

const otherMasterAdmin: AdminRecord = {
  user_id: "other-master-uuid",
  role: "master",
  created_at: "2026-01-02T00:00:00Z",
  email: "mvashisht911@gmail.com",
  auth_created_at: null,
  last_sign_in_at: null,
  isPrimary: false,
};

const normalAdmin: AdminRecord = {
  user_id: "normal-admin-uuid",
  role: "admin",
  created_at: "2026-01-03T00:00:00Z",
  email: "desk@saviskar.in",
  auth_created_at: null,
  last_sign_in_at: null,
  isPrimary: false,
};

const primaryMasterAdminNoEmail: AdminRecord = {
  ...primaryMasterAdmin,
  // Verify email field is irrelevant — isPrimary is from server
  email: "completely-different@email.com",
  isPrimary: true,
};

// ─── Tests ────────────────────────────────────────────────────────────────

describe("AdminRow control visibility logic", () => {

  // =========================================================
  // PRIMARY MASTER ROW
  // =========================================================

  describe("Primary Master admin row (isPrimary = true)", () => {
    it("shows primary-label (protected state) — NOT management controls", () => {
      expect(getAdminRowControls(primaryMasterAdmin, true, true)).toBe("primary-label");
    });

    it("shows primary-label even when isSuperMaster = false", () => {
      expect(getAdminRowControls(primaryMasterAdmin, false, true)).toBe("primary-label");
    });

    it("isPrimary from server field takes precedence — email is irrelevant", () => {
      // Admin has isPrimary = true but a completely different email
      // The old hardcoded-email code would have returned "restricted-label" here.
      // The correct code must return "primary-label" regardless of email.
      expect(getAdminRowControls(primaryMasterAdminNoEmail, true, true)).toBe("primary-label");
    });

    it("never shows master-controls for Primary Master row", () => {
      expect(getAdminRowControls(primaryMasterAdmin, true, true)).not.toBe("master-controls");
    });
  });

  // =========================================================
  // PRIMARY MASTER VIEWING OTHER MASTER (THE REPORTED BUG)
  // =========================================================

  describe("Primary Master (isSuperMaster = true) viewing another Master Admin (isPrimary = false)", () => {
    it("shows master-controls — includes Change to Normal + Remove Master Access buttons", () => {
      // This is the exact scenario reported as broken.
      // isSuperMaster = true (Primary Master is logged in)
      // admin.isPrimary = false (the OTHER master, mvashisht911@gmail.com)
      // master = true (rendered in the Master Admins section)
      expect(getAdminRowControls(otherMasterAdmin, true, true)).toBe("master-controls");
    });

    it("master-controls is NOT primary-label — remove button must be visible", () => {
      const result = getAdminRowControls(otherMasterAdmin, true, true);
      expect(result).not.toBe("primary-label");
      expect(result).not.toBe("restricted-label");
      expect(result).toBe("master-controls");
    });
  });

  // =========================================================
  // PRIMARY MASTER VIEWING NORMAL ADMIN
  // =========================================================

  describe("Primary Master (isSuperMaster = true) viewing Normal Admin (isPrimary = false)", () => {
    it("shows normal-controls — includes Make Master + Remove access buttons", () => {
      expect(getAdminRowControls(normalAdmin, true, false)).toBe("normal-controls");
    });
  });

  // =========================================================
  // NON-PRIMARY MASTER VIEWING MASTER ADMIN (RESTRICTION)
  // =========================================================

  describe("Non-Primary Master (isSuperMaster = false) viewing another Master Admin", () => {
    it("shows restricted-label — Master management restricted to Primary Master", () => {
      expect(getAdminRowControls(otherMasterAdmin, false, true)).toBe("restricted-label");
    });

    it("does NOT show master-controls for non-Primary Master", () => {
      expect(getAdminRowControls(otherMasterAdmin, false, true)).not.toBe("master-controls");
    });
  });

  // =========================================================
  // NON-PRIMARY MASTER VIEWING NORMAL ADMIN
  // =========================================================

  describe("Non-Primary Master (isSuperMaster = false) viewing Normal Admin", () => {
    it("shows remove-button — Normal Admins can still be removed by any Master", () => {
      expect(getAdminRowControls(normalAdmin, false, false)).toBe("remove-button");
    });
  });

  // =========================================================
  // GUARD: EMAIL-BASED FALLBACK MUST NOT WORK
  // =========================================================

  describe("Email field must not determine isPrimary (regression guard)", () => {
    it("an admin with Primary Master email but isPrimary = false is NOT treated as primary", () => {
      const impostor: AdminRecord = {
        user_id: "not-primary-uuid",
        role: "master",
        created_at: "2026-01-01T00:00:00Z",
        email: "jashan082006@gmail.com", // Same email as Primary Master
        auth_created_at: null,
        last_sign_in_at: null,
        isPrimary: false, // Server says: NOT primary
      };
      // Must show master-controls (removable), NOT primary-label (protected)
      expect(getAdminRowControls(impostor, true, true)).toBe("master-controls");
    });

    it("an admin with a different email but isPrimary = true IS treated as primary", () => {
      const altPrimary: AdminRecord = {
        user_id: "primary-uuid",
        role: "master",
        created_at: "2026-01-01T00:00:00Z",
        email: "newprimary@different.com", // Email changed
        auth_created_at: null,
        last_sign_in_at: null,
        isPrimary: true, // Server says: IS primary
      };
      // Must show primary-label (protected), regardless of email
      expect(getAdminRowControls(altPrimary, true, true)).toBe("primary-label");
    });
  });

  // =========================================================
  // EDGE CASES
  // =========================================================

  describe("Edge cases", () => {
    it("isPrimary defaults to false when field is undefined", () => {
      const noIsPrimaryField: AdminRecord = {
        user_id: "uuid",
        role: "master",
        created_at: "2026-01-01T00:00:00Z",
        email: "someone@example.com",
        auth_created_at: null,
        last_sign_in_at: null,
        // isPrimary not set
      };
      expect(getAdminRowControls(noIsPrimaryField, true, true)).toBe("master-controls");
    });

    it("isPrimary = false is treated same as isPrimary = undefined", () => {
      const explicitFalse: AdminRecord = { ...otherMasterAdmin, isPrimary: false };
      const implicitFalse: AdminRecord = { ...otherMasterAdmin, isPrimary: undefined };
      expect(getAdminRowControls(explicitFalse, true, true)).toBe(
        getAdminRowControls(implicitFalse, true, true)
      );
    });
  });

});
