import { NextRequest } from "next/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getTrustedAuthOrigin } from "@/lib/auth/trusted-origin";

describe("Trusted Auth Origin Resolver", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("1. Production -> https://saviskar.co.in", () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = new NextRequest("https://saviskar.co.in/api/admin/admins");
    req.headers.set("origin", "https://saviskar.co.in");
    
    const origin = getTrustedAuthOrigin(req);
    expect(origin).toBe("https://saviskar.co.in");
  });

  it("1b. Production Vercel hostname -> https://saviskar.co.in", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://saviskar-26.vercel.app");
    const req = new NextRequest("https://saviskar-26.vercel.app/api/admin/admins");
    req.headers.set("origin", "https://saviskar-26.vercel.app");
    
    const origin = getTrustedAuthOrigin(req);
    expect(origin).toBe("https://saviskar.co.in");
  });

  it("2. Vercel deployment -> https://saviskar.co.in (never leak vercel.app to email links)", () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = new NextRequest("https://saviskar-2026.vercel.app/api/admin/admins");
    req.headers.set("origin", "https://saviskar-2026.vercel.app");
    
    const origin = getTrustedAuthOrigin(req);
    expect(origin).toBe("https://saviskar.co.in");
  });

  it("3. Localhost in development -> localhost origin", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    
    const req = new NextRequest("http://localhost:3000/api/admin/admins");
    req.headers.set("origin", "http://localhost:3000");
    
    const origin = getTrustedAuthOrigin(req);
    expect(origin).toBe("http://localhost:3000");
  });

  it("4. Unknown/untrusted production origin -> https://saviskar.co.in", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://saviskar.co.in");
    
    const req = new NextRequest("https://attacker.com/api/admin/admins");
    req.headers.set("origin", "https://attacker.com");
    
    const origin = getTrustedAuthOrigin(req);
    expect(origin).toBe("https://saviskar.co.in");
  });

  it("5. Existing-admin reset path gets appended securely (simulation)", () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = new NextRequest("https://saviskar.co.in/api/admin/admins");
    req.headers.set("origin", "https://saviskar.co.in");
    
    const origin = getTrustedAuthOrigin(req);
    const redirectTo = `${origin}/admin/reset-password`;
    expect(redirectTo).toBe("https://saviskar.co.in/admin/reset-password");
  });

  it("6. New-admin invite path gets appended securely (simulation)", () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = new NextRequest("https://saviskar.co.in/api/admin/admins");
    req.headers.set("origin", "https://saviskar.co.in");
    
    const origin = getTrustedAuthOrigin(req);
    const redirectTo = `${origin}/admin/accept-invite`;
    expect(redirectTo).toBe("https://saviskar.co.in/admin/accept-invite");
  });

  it("7. Fallback to canonical production origin if no request passed", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://saviskar.co.in");
    
    const origin = getTrustedAuthOrigin();
    expect(origin).toBe("https://saviskar.co.in");
  });
});
