import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const migrationFilePath = path.resolve(
  __dirname,
  "../../supabase/migrations/20260911000000_p0_complete_register_function.sql"
);

describe("P0-01: Corrective SQL Migration & register_participant_events Invariants", () => {
  const sqlContent = fs.readFileSync(migrationFilePath, "utf8");

  it("1. Migration file exists and is non-empty", () => {
    expect(fs.existsSync(migrationFilePath)).toBe(true);
    expect(sqlContent.length).toBeGreaterThan(1000);
  });

  it("2. Preserves exact CREATE OR REPLACE FUNCTION signature matching application RPC calls", () => {
    expect(sqlContent).toContain('CREATE OR REPLACE FUNCTION "public"."register_participant_events"(');
    expect(sqlContent).toContain('"p_participant_id" "text" DEFAULT NULL::"text"');
    expect(sqlContent).toContain('"p_name" "text" DEFAULT NULL::"text"');
    expect(sqlContent).toContain('"p_college" "text" DEFAULT NULL::"text"');
    expect(sqlContent).toContain('"p_email" "text" DEFAULT NULL::"text"');
    expect(sqlContent).toContain('"p_phone" "text" DEFAULT NULL::"text"');
    expect(sqlContent).toContain('"p_events" "jsonb" DEFAULT \'[]\'::"jsonb"');
    expect(sqlContent).toContain('RETURNS TABLE(');
  });

  it("3. Enforces SECURITY DEFINER and search_path = 'public'", () => {
    expect(sqlContent).toContain('SECURITY DEFINER');
    expect(sqlContent).toContain("SET \"search_path\" TO 'public'");
  });

  it("4. Contains the deterministic deadlock fix (ORDER BY event_id UUID)", () => {
    expect(sqlContent).toMatch(/order\s+by\s+\(value->>'event_id'\)::uuid/i);
  });

  it("5. Contains atomic payment_orders creation logic", () => {
    expect(sqlContent).toContain("insert into public.payment_orders (");
    expect(sqlContent).toContain("order_reference,");
    expect(sqlContent).toContain("payer_participant_id,");
    expect(sqlContent).toContain("amount,");
    expect(sqlContent).toContain("currency,");
    expect(sqlContent).toContain("status");
    expect(sqlContent).toContain("returning id into v_payment_order_id;");
  });

  it("6. Contains atomic payment_order_items creation loop", () => {
    expect(sqlContent).toContain("insert into public.payment_order_items (");
    expect(sqlContent).toContain("payment_order_id,");
    expect(sqlContent).toContain("participant_id,");
    expect(sqlContent).toContain("participant_event_id,");
    expect(sqlContent).toContain("event_id,");
    expect(sqlContent).toContain("amount");
  });

  it("7. Preserves all structured application error codes SVK01 through SVK11", () => {
    for (let i = 1; i <= 11; i++) {
      const code = `SVK${String(i).padStart(2, "0")}`;
      expect(sqlContent).toContain(code);
    }
  });

  it("8. Preserves participant collision retry bounded loop (up to 3 attempts)", () => {
    expect(sqlContent).toContain("Failed to generate unique Participant ID after 3 attempts");
  });

  it("9. Preserves team registration and participant_event_members insertion", () => {
    expect(sqlContent).toContain("insert into public.participant_event_members (");
    expect(sqlContent).toContain("is_team_leader");
  });

  it("10. Preserves duplicate registration handling with ON CONFLICT", () => {
    expect(sqlContent).toContain("ON CONFLICT ON CONSTRAINT participant_events_unique_event");
    expect(sqlContent).toContain("'already_registered'::text");
    expect(sqlContent).toContain("'added'::text");
  });

  it("11. Preserves secure grants (restricted to service_role, revoked from public/anon/authenticated)", () => {
    expect(sqlContent).toContain('REVOKE ALL ON FUNCTION "public"."register_participant_events"');
    expect(sqlContent).toContain('FROM PUBLIC');
    expect(sqlContent).toContain('FROM anon');
    expect(sqlContent).toContain('FROM authenticated');
    expect(sqlContent).toContain('GRANT ALL ON FUNCTION "public"."register_participant_events"');
    expect(sqlContent).toContain('TO "service_role"');
  });

  it("12. Does not contain any unescaped or corrupted double single-quotes in string literals", () => {
    // Check that errcode lines use 'SVKxx' and not ''SVKxx''
    expect(sqlContent).not.toMatch(/errcode\s*=\s*''SVK/);
    expect(sqlContent).toMatch(/errcode\s*=\s*'SVK01'/);
  });
});
