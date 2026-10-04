import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";

describe("PayU CSP Security Headers", () => {
  it("includes all necessary PayU redirect and endpoint domains in Content-Security-Policy", async () => {
    if (typeof nextConfig.headers !== "function") {
      throw new Error("nextConfig.headers is not a function");
    }

    const headerConfigs = await nextConfig.headers();
    const globalHeader = headerConfigs.find((h) => h.source === "/(.*)");

    expect(globalHeader).toBeDefined();

    const csp = globalHeader?.headers.find(
      (h) => h.key === "Content-Security-Policy"
    )?.value;

    expect(csp).toBeDefined();

    // Verify form-action includes secure.payu.in, test.payu.in, and crucially api.payu.in (the 302 redirect target)
    expect(csp).toContain("form-action");
    expect(csp).toMatch(/form-action[^;]*https:\/\/secure\.payu\.in/);
    expect(csp).toMatch(/form-action[^;]*https:\/\/test\.payu\.in/);
    expect(csp).toMatch(/form-action[^;]*https:\/\/api\.payu\.in/);
    expect(csp).toMatch(/form-action[^;]*https:\/\/\*\.payu\.in/);

    // Verify connect-src includes PayU endpoints
    expect(csp).toMatch(/connect-src[^;]*https:\/\/secure\.payu\.in/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/api\.payu\.in/);
  });
});
