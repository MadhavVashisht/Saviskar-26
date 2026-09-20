import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/events",
  "/register",
  "/gallery",
  "/schedule",
  "/starnight",
  "/team",
  "/sponsors",
  "/legacy",
];

test.describe("Full-Site Smoke Tests", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`Route "${route}" returns 200 with zero console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          // Filter out benign noise from third-party WebGL / audio autoplay policies if any
          const text = msg.text();
          if (!text.includes("favicon.ico") && !text.includes("Autoplay")) {
            consoleErrors.push(text);
          }
        }
      });

      page.on("pageerror", (err) => {
        pageErrors.push(err.message);
      });

      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response).not.toBeNull();
      expect(response?.status()).toBe(200);

      // Give route a brief moment to hydrate
      await page.waitForTimeout(1000);

      expect(pageErrors, `Uncaught page errors on ${route}`).toHaveLength(0);
      expect(consoleErrors, `Console errors on ${route}`).toHaveLength(0);
    });
  }
});
