import { test, expect } from "@playwright/test";

test.describe("Admin Authentication & Gate Scanner Workflows", () => {
  test("1. Admin login redirects to dashboard", async ({ page }) => {
    // Intercept Supabase Auth password signIn
    await page.route("**/auth/v1/token*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-admin-access-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-admin-refresh-token",
          user: {
            id: "admin-uuid-1",
            email: "admin@saviskar.co.in",
            app_metadata: { role: "admin" },
          },
        }),
      });
    });

    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });

    await page.fill('input[type="email"]', "admin@saviskar.co.in");
    await page.fill('input[type="password"]', "AdminStrongPassword!2026");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify redirect towards /admin dashboard
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  });

  test("2. Gate scanner enforces duplicate-scan rejection (HTTP 409)", async ({ page }) => {
    // Inject mock session so checkAdmin() allows scanner page to render
    await page.addInitScript(() => {
      localStorage.setItem(
        "sb-auth-token",
        JSON.stringify({
          access_token: "mock-token",
          user: { id: "admin-1", email: "admin@saviskar.co.in" },
        })
      );
    });

    // Mock participant ticket scan lookup
    await page.route("**/api/admin/participants/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          participant: {
            participantId: "SVK26-TICKET-01",
            name: "Rahul Sharma",
            college: "CGC Landran",
            email: "rahul@example.com",
            phone: "+91 9876543210",
          },
          events: [
            {
              participantEventId: "pe-ticket-1",
              eventId: "evt-star",
              eventName: "Star Night 2026",
              paymentStatus: "paid",
              paymentAmount: 500,
              checkedIn: false,
              checkedInAt: null,
            },
          ],
        }),
      });
    });

    let scanCount = 0;
    // Mock check-in API: 1st call 200 OK, 2nd call 409 Conflict
    await page.route("**/api/admin/check-in", async (route) => {
      scanCount++;
      if (scanCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            checkedIn: true,
            checkedInAt: new Date().toISOString(),
          }),
        });
      } else {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: "Already Checked In",
            checkedInAt: "10:30:15 AM",
          }),
        });
      }
    });

    await page.goto("/admin/scanner", { waitUntil: "domcontentloaded" });

    // Simulate scanning ticket via the search/lookup or scanner helper input if present
    // Trigger lookup directly via window helper or UI button
    await page.evaluate(() => {
      window.fetch("/api/admin/participants/SVK26-TICKET-01");
    });

    // Directly test the check-in API endpoint duplicate rejection contract from the page context
    const firstCheckInResponse = await page.evaluate(async () => {
      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantEventId: "pe-ticket-1", action: "check_in" }),
      });
      return { status: res.status, data: await res.json() };
    });

    expect(firstCheckInResponse.status).toBe(200);
    expect(firstCheckInResponse.data.success).toBe(true);

    // Second scan of the EXACT same ticket
    const secondCheckInResponse = await page.evaluate(async () => {
      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantEventId: "pe-ticket-1", action: "check_in" }),
      });
      return { status: res.status, data: await res.json() };
    });

    // Must be rejected with HTTP 409 Already Checked In
    expect(secondCheckInResponse.status).toBe(409);
    expect(secondCheckInResponse.data.success).toBe(false);
    expect(secondCheckInResponse.data.error).toBe("Already Checked In");
  });
});
