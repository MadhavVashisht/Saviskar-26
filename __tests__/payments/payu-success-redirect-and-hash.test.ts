import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { verifyPayUResponseHash } from "@/lib/payments/payu-hash";

describe("PayU Success Redirect & Hash Hardening", () => {
  const salt = "HZy5fripG66XE07xHeEmW20k47XLUZg3";
  const key = "BKoVsM";
  const status = "success";
  const udf1 = "SVK-TEST-REF";
  const email = "test@saviskar.co.in";
  const firstname = "Test User";
  const productinfo = "Saviskar 2026 Registration";
  const amount = "5.00";
  const txnid = "SVK-12345";

  it("A. Standard reverse hash matches without additional charges", () => {
    const raw = `${salt}|${status}||||||||||${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const receivedHash = crypto.createHash("sha512").update(raw).digest("hex").toLowerCase();

    const isValid = verifyPayUResponseHash({
      status,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key,
      salt,
      udf1,
      receivedHash,
    });

    expect(isValid).toBe(true);
  });

  it("B. Reverse hash matches when additional charges are included in hash", () => {
    const additionalCharges = "0.01";
    const raw = `${additionalCharges}|${salt}|${status}||||||||||${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const receivedHash = crypto.createHash("sha512").update(raw).digest("hex").toLowerCase();

    const isValid = verifyPayUResponseHash({
      status,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key,
      salt,
      udf1,
      additionalCharges,
      receivedHash,
    });

    expect(isValid).toBe(true);
  });

  it("C. Reverse hash matches when additional charges are present in body but standard hash was sent", () => {
    const raw = `${salt}|${status}||||||||||${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const receivedHash = crypto.createHash("sha512").update(raw).digest("hex").toLowerCase();

    const isValid = verifyPayUResponseHash({
      status,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key,
      salt,
      udf1,
      additionalCharges: "0.01",
      receivedHash,
    });

    expect(isValid).toBe(true);
  });

  it("D. Sanitizes keys and salts with surrounding quotes or whitespace", () => {
    const raw = `${salt}|${status}||||||||||${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const receivedHash = crypto.createHash("sha512").update(raw).digest("hex").toLowerCase();

    const isValid = verifyPayUResponseHash({
      status,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key: ` "${key}" `,
      salt: ` "${salt}" `,
      udf1,
      receivedHash,
    });

    expect(isValid).toBe(true);
  });

  it("E. Asserts app/api/payments/payu/success/route.ts never redirects to request.url", () => {
    const successRoutePath = path.join(process.cwd(), "app/api/payments/payu/success/route.ts");
    const content = fs.readFileSync(successRoutePath, "utf-8");

    expect(content).not.toContain("request.url)");
    expect(content).toContain("redirectBase");
  });

  it("F. Asserts app/api/payments/payu/failure/route.ts never redirects to request.url", () => {
    const failureRoutePath = path.join(process.cwd(), "app/api/payments/payu/failure/route.ts");
    const content = fs.readFileSync(failureRoutePath, "utf-8");

    expect(content).not.toContain("request.url)");
    expect(content).toContain("redirectBase");
  });
});
