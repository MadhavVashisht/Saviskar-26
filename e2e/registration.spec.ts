import { test, expect, Page } from "@playwright/test";

const MOCK_EVENTS = [
  {
    id: "evt-free-hack",
    name: "Code Sprint (Free)",
    slug: "code-sprint",
    category: "technical",
    registration_type: "solo",
    min_team_size: 1,
    max_team_size: 1,
    payment_type: "free",
    registration_fee: 0,
    payment_unit: "per_participant",
    active: true,
  },
  {
    id: "evt-paid-battle",
    name: "Battle of the Bands (Paid)",
    slug: "battle-of-bands",
    category: "cultural",
    registration_type: "solo",
    min_team_size: 1,
    max_team_size: 1,
    payment_type: "paid",
    registration_fee: 250,
    payment_unit: "per_participant",
    active: true,
  },
];

async function setupAndAuthenticateRegistration(page: Page, email: string) {
  // Intercept Supabase REST query for active events
  await page.route("**/rest/v1/events*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_EVENTS),
    });
  });

  // Intercept OTP request
  await page.route("**/api/auth/request-otp", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  // Intercept OTP verification
  await page.route("**/api/auth/verify-otp", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, email }),
    });
  });

  await page.goto("/register", { waitUntil: "networkidle" });

  // If on Auth Gate, complete OTP flow
  const emailInput = page.locator('input[type="email"]').first();
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await emailInput.fill(email);

  const continueBtn = page.locator('button[type="submit"]:has-text("Continue")').first();
  try {
    await expect(continueBtn).toBeEnabled({ timeout: 3000 });
  } catch {
    // If input was filled before hydration attached handlers, re-fill to trigger React onChange
    await emailInput.click();
    await emailInput.fill(email);
    await expect(continueBtn).toBeEnabled({ timeout: 10000 });
  }
  await continueBtn.click();

  // Wait for OTP input boxes and type 6 digits
  const firstOtpBox = page.locator('input[inputmode="numeric"], input[maxlength="1"]').first();
  await expect(firstOtpBox).toBeVisible({ timeout: 10000 });
  await firstOtpBox.focus();
  await page.keyboard.type("123456");

  // Wait for Registration Form to display events
  const freeEventBtn = page.locator('button:has-text("Code Sprint (Free)")').first();
  await expect(freeEventBtn).toBeVisible({ timeout: 15000 });
}

test.describe("Registration & Payment E2E Workflows", () => {
  test("1. Free-event registration through confirmation pass", async ({ page }) => {
    await page.route("**/api/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          participantId: "SVK26-FREE-DEMO",
          paymentStatus: "not_required",
          message: "Registration successful",
        }),
      });
    });

    await setupAndAuthenticateRegistration(page, "alex.turner@university.edu");

    // Select the free event
    await page.locator('button:has-text("Code Sprint (Free)")').first().click();

    // Fill primary details
    await page.getByRole("textbox", { name: "Full Name" }).fill("Alex Turner");
    await page.getByRole("textbox", { name: "College / University" }).fill("CGC University Mohali");
    await page.getByRole("textbox", { name: "Email Address" }).fill("alex.turner@university.edu");
    await page.getByRole("textbox", { name: "Phone / WhatsApp Number" }).fill("9876543210");

    // Check code of conduct agreement
    const consentCheckbox = page.locator('input[type="checkbox"]').last();
    await consentCheckbox.check();

    // Submit registration
    const submitBtn = page.locator('button[type="submit"]:has-text("Confirm Official Registration")');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify confirmation pass screen
    await expect(page.getByText("REGISTRATION CONFIRMED // SAVISKAR 2026")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("SVK26-FREE-DEMO")).toBeVisible();
    await expect(page.getByText("OFFICIAL DIGITAL ENTRY PASS")).toBeVisible();
  });

  test("2. Paid-event registration through mocked Razorpay success", async ({ page }) => {
    // Inject Mock Razorpay SDK into window before script loads
    await page.addInitScript(() => {
      interface MockRazorpayOptions {
        handler?: (res: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
        [key: string]: unknown;
      }
      (window as unknown as { Razorpay: unknown }).Razorpay = class {
        options: MockRazorpayOptions;
        constructor(opts: MockRazorpayOptions) {
          this.options = opts;
        }
        on() {}
        open() {
          setTimeout(() => {
            if (this.options.handler) {
              this.options.handler({
                razorpay_payment_id: "pay_mock_e2e_999",
                razorpay_order_id: "order_mock_e2e_123",
                razorpay_signature: "sig_mock_e2e_valid",
              });
            }
          }, 100);
        }
      };
    });

    await page.route("**/api/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          participantId: "SVK26-PAID-DEMO",
          paymentRequired: true,
          paymentStatus: "pending",
          totalAmount: 250,
          paymentOrder: { id: "po-e2e-order-1" },
        }),
      });
    });

    await page.route("**/api/payments/create", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          gatewayOrderId: "order_mock_e2e_123",
          checkoutConfig: {
            gateway: "razorpay",
            options: {
              key: "rzp_test_mockKey",
              amount: 25000,
              currency: "INR",
            },
          },
        }),
      });
    });

    await page.route("**/api/payments/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          verified: true,
          participantId: "SVK26-PAID-DEMO",
        }),
      });
    });

    await setupAndAuthenticateRegistration(page, "sarah.connor@cyberdyne.com");

    // Select paid event
    await page.locator('button:has-text("Battle of the Bands (Paid)")').first().click();

    // Fill primary details
    await page.getByRole("textbox", { name: "Full Name" }).fill("Sarah Connor");
    await page.getByRole("textbox", { name: "College / University" }).fill("Tech Institute");
    await page.getByRole("textbox", { name: "Email Address" }).fill("sarah.connor@cyberdyne.com");
    await page.getByRole("textbox", { name: "Phone / WhatsApp Number" }).fill("9876543211");

    // Check code of conduct agreement
    const consentCheckbox = page.locator('input[type="checkbox"]').last();
    await consentCheckbox.check();

    const payBtn = page.locator('button[type="submit"]:has-text("Proceed to Checkout")');
    await expect(payBtn).toBeEnabled();
    await payBtn.click();

    // Verify verified status / confirmed pass screen
    await expect(page.getByText("REGISTRATION CONFIRMED // SAVISKAR 2026")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("SVK26-PAID-DEMO")).toBeVisible();
    await expect(page.getByText("OFFICIAL DIGITAL ENTRY PASS")).toBeVisible();
  });

  test("3. Paid-event registration through mocked Razorpay failure shows recovery screen", async ({ page }) => {
    // Inject Mock Razorpay that triggers payment.failed
    await page.addInitScript(() => {
      interface MockRazorpayOptions {
        [key: string]: unknown;
      }
      type FailHandler = (res: { error: { description: string } }) => void;
      (window as unknown as { Razorpay: unknown }).Razorpay = class {
        options: MockRazorpayOptions;
        failHandlers: FailHandler[] = [];
        constructor(opts: MockRazorpayOptions) {
          this.options = opts;
        }
        on(event: string, handler: FailHandler) {
          if (event === "payment.failed") {
            this.failHandlers.push(handler);
          }
        }
        open() {
          setTimeout(() => {
            for (const h of this.failHandlers) {
              h({ error: { description: "Payment was cancelled or card declined by issuing bank" } });
            }
          }, 100);
        }
      };
    });

    await page.route("**/api/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          participantId: "SVK26-FAIL-DEMO",
          paymentRequired: true,
          paymentStatus: "pending",
          totalAmount: 250,
          paymentOrder: { id: "po-e2e-order-fail" },
        }),
      });
    });

    await page.route("**/api/payments/create", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          gatewayOrderId: "order_mock_fail_123",
          checkoutConfig: {
            gateway: "razorpay",
            options: { key: "rzp_test_mockKey", amount: 25000, currency: "INR" },
          },
        }),
      });
    });

    await setupAndAuthenticateRegistration(page, "john.connor@resistance.org");

    await page.locator('button:has-text("Battle of the Bands (Paid)")').first().click();

    await page.getByRole("textbox", { name: "Full Name" }).fill("John Connor");
    await page.getByRole("textbox", { name: "College / University" }).fill("Resistance Academy");
    await page.getByRole("textbox", { name: "Email Address" }).fill("john.connor@resistance.org");
    await page.getByRole("textbox", { name: "Phone / WhatsApp Number" }).fill("9876543212");

    const consentCheckbox = page.locator('input[type="checkbox"]').last();
    await consentCheckbox.check();

    const payBtn = page.locator('button[type="submit"]:has-text("Proceed to Checkout")');
    await payBtn.click();

    // Verify payment pending recovery screen appears
    await expect(page.getByText("ACTION REQUIRED")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Payment pending/i })).toBeVisible();
    await expect(page.getByText("SVK26-FAIL-DEMO")).toBeVisible();
  });

  test("4. checkout.js load failure triggers fallback UI", async ({ page }) => {
    // Abort Razorpay external script to simulate ad blocker
    await page.route("https://checkout.razorpay.com/v1/checkout.js", (route) => route.abort());
    await page.addInitScript(() => {
      delete (window as unknown as { Razorpay?: unknown }).Razorpay;
    });

    await page.route("**/api/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          participantId: "SVK26-BLOCKED-DEMO",
          paymentRequired: true,
          paymentStatus: "pending",
          totalAmount: 250,
          paymentOrder: { id: "po-e2e-order-blocked" },
        }),
      });
    });

    await page.route("**/api/payments/create", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          gatewayOrderId: "order_mock_blocked",
          checkoutConfig: { gateway: "razorpay", options: { key: "mock", amount: 25000 } },
        }),
      });
    });

    await setupAndAuthenticateRegistration(page, "miles.dyson@cyberdyne.com");

    await page.locator('button:has-text("Battle of the Bands (Paid)")').first().click();

    await page.getByRole("textbox", { name: "Full Name" }).fill("Miles Dyson");
    await page.getByRole("textbox", { name: "College / University" }).fill("Cyberdyne Systems");
    await page.getByRole("textbox", { name: "Email Address" }).fill("miles.dyson@cyberdyne.com");
    await page.getByRole("textbox", { name: "Phone / WhatsApp Number" }).fill("9876543213");

    const consentCheckbox = page.locator('input[type="checkbox"]').last();
    await consentCheckbox.check();

    const payBtn = page.locator('button[type="submit"]:has-text("Proceed to Checkout")');
    await payBtn.click();

    // Verify script blocking message appears on screen
    await expect(page.getByText(/Payment gateway script could not be loaded/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
