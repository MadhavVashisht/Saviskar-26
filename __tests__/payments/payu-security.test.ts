import { describe, it, expect } from "vitest";
import * as crypto from "crypto";
import { 
  generatePayURequestHash, 
  verifyPayUResponseHash
} from "@/lib/payments/payu-hash";

describe("PayU Hash Security Integrity", () => {
  const TEST_KEY = "test_key_123";
  const TEST_SALT = "test_salt_456";

  it("1. Forged PayU hash is rejected", () => {
    const validHash = generatePayURequestHash({
      key: TEST_KEY,
      txnid: "txnid_1",
      amount: "100.00",
      productinfo: "info",
      firstname: "Test",
      email: "test@example.com",
      salt: TEST_SALT,
    });
    expect(validHash).toBeTypeOf("string");
    
    // Reverse hash verification
    const isValid = verifyPayUResponseHash({
      status: "success",
      email: "test@example.com",
      firstname: "Test",
      productinfo: "info",
      amount: "100.00",
      txnid: "txnid_1",
      key: TEST_KEY,
      salt: TEST_SALT,
      receivedHash: "forged_hash_value"
    });
    
    expect(isValid).toBe(false);
  });

  it("2. Modified amount invalidates hash", () => {
    // Generate valid response hash for 100.00
    const hashString = `${TEST_SALT}|success|||||||||||test@example.com|Test|info|100.00|txnid_1|${TEST_KEY}`;
    const validHash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
    
    // Attacker modifies amount to 10.00 in transit
    const isValid = verifyPayUResponseHash({
      status: "success",
      email: "test@example.com",
      firstname: "Test",
      productinfo: "info",
      amount: "10.00", // Tampered
      txnid: "txnid_1",
      key: TEST_KEY,
      salt: TEST_SALT,
      receivedHash: validHash
    });
    
    expect(isValid).toBe(false);
  });

  it("3. Modified txnid invalidates hash", () => {
    const hashString = `${TEST_SALT}|success|||||||||||test@example.com|Test|info|100.00|txnid_1|${TEST_KEY}`;
    const validHash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
    
    const isValid = verifyPayUResponseHash({
      status: "success",
      email: "test@example.com",
      firstname: "Test",
      productinfo: "info",
      amount: "100.00",
      txnid: "txnid_other", // Tampered
      key: TEST_KEY,
      salt: TEST_SALT,
      receivedHash: validHash
    });
    
    expect(isValid).toBe(false);
  });

  it("4. Modified email invalidates hash", () => {
    const hashString = `${TEST_SALT}|success|||||||||||test@example.com|Test|info|100.00|txnid_1|${TEST_KEY}`;
    const validHash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
    
    const isValid = verifyPayUResponseHash({
      status: "success",
      email: "attacker@example.com", // Tampered
      firstname: "Test",
      productinfo: "info",
      amount: "100.00",
      txnid: "txnid_1",
      key: TEST_KEY,
      salt: TEST_SALT,
      receivedHash: validHash
    });
    
    expect(isValid).toBe(false);
  });

  it("5. Modified productinfo invalidates hash", () => {
    const hashString = `${TEST_SALT}|success|||||||||||test@example.com|Test|info|100.00|txnid_1|${TEST_KEY}`;
    const validHash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
    
    const isValid = verifyPayUResponseHash({
      status: "success",
      email: "test@example.com",
      firstname: "Test",
      productinfo: "other_info", // Tampered
      amount: "100.00",
      txnid: "txnid_1",
      key: TEST_KEY,
      salt: TEST_SALT,
      receivedHash: validHash
    });
    
    expect(isValid).toBe(false);
  });

  it("6. Invalid merchant key invalidates hash", () => {
    const hashString = `${TEST_SALT}|success|||||||||||test@example.com|Test|info|100.00|txnid_1|${TEST_KEY}`;
    const validHash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
    
    const isValid = verifyPayUResponseHash({
      status: "success",
      email: "test@example.com",
      firstname: "Test",
      productinfo: "info",
      amount: "100.00",
      txnid: "txnid_1",
      key: "wrong_key", // Tampered
      salt: TEST_SALT,
      receivedHash: validHash
    });
    
    expect(isValid).toBe(false);
  });
  
  it("11. Forged success status invalidates hash", () => {
    const hashString = `${TEST_SALT}|failure|||||||||||test@example.com|Test|info|100.00|txnid_1|${TEST_KEY}`;
    const validHash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
    
    const isValid = verifyPayUResponseHash({
      status: "success", // Tampered status
      email: "test@example.com",
      firstname: "Test",
      productinfo: "info",
      amount: "100.00",
      txnid: "txnid_1",
      key: TEST_KEY,
      salt: TEST_SALT,
      receivedHash: validHash
    });
    
    expect(isValid).toBe(false);
  });
});

describe("P0-5: RPC Privilege Revocation", () => {
  // These tests verify the migration SQL is correct.
  // Since we can't execute SQL in unit tests, we verify the
  // migration file content matches expected revocations.

  it("G: migration revokes anon EXECUTE on register_participant_events", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const migrationPath = path.resolve(
      __dirname,
      "../../supabase/migrations/20260830060000_p0_security_hardening.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Verify revocations exist for all three functions
    expect(sql).toContain("REVOKE EXECUTE ON FUNCTION public.register_participant_events");
    expect(sql).toContain("FROM anon");
    expect(sql).toContain("FROM authenticated");

    expect(sql).toContain("REVOKE EXECUTE ON FUNCTION public.add_events_to_participant");
    expect(sql).toContain("REVOKE EXECUTE ON FUNCTION public.create_event_registration");

    // Verify NO DROP statements
    expect(sql).not.toContain("DROP FUNCTION");
  });

  it("G: migration enables RLS on payment tables", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const migrationPath = path.resolve(
      __dirname,
      "../../supabase/migrations/20260830060000_p0_security_hardening.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf-8");

    expect(sql).toContain("ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("ALTER TABLE public.payment_order_items ENABLE ROW LEVEL SECURITY");

    // Verify service_role grants
    expect(sql).toContain("GRANT ALL ON TABLE public.payment_orders TO service_role");
    expect(sql).toContain("GRANT ALL ON TABLE public.payment_order_items TO service_role");
  });

  it("G: migration preserves service_role access (no accidental blocks)", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const migrationPath = path.resolve(
      __dirname,
      "../../supabase/migrations/20260830060000_p0_security_hardening.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Should NOT revoke service_role from anything
    expect(sql).not.toContain("FROM service_role");

    // Should NOT drop any tables
    expect(sql).not.toContain("DROP TABLE");
  });
});

