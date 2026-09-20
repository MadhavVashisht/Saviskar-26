import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { captureException, captureMessage } from "@/lib/monitoring/error-reporter";

describe("Error Monitoring & Telemetry", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("captures Error instances and emits structured telemetry log", () => {
    const error = new Error("Database query timed out");
    captureException(error, {
      route: "/api/register",
      userId: "usr_test_123",
      digest: "NEXT_DIGEST_456",
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    const [tag, payloadStr] = consoleErrorSpy.mock.calls[0];
    expect(tag).toBe("[SAVISKAR_TELEMETRY]");

    const parsed = JSON.parse(payloadStr as string);
    expect(parsed.level).toBe("ERROR");
    expect(parsed.message).toBe("Database query timed out");
    expect(parsed.name).toBe("Error");
    expect(parsed.context.route).toBe("/api/register");
    expect(parsed.context.userId).toBe("usr_test_123");
    expect(parsed.context.digest).toBe("NEXT_DIGEST_456");
  });

  it("normalizes non-Error objects into Error instances", () => {
    captureException("String-based error payload", {
      route: "/api/payments/create",
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    const [, payloadStr] = consoleErrorSpy.mock.calls[0];
    const parsed = JSON.parse(payloadStr as string);

    expect(parsed.message).toBe("String-based error payload");
    expect(parsed.name).toBe("Error");
    expect(parsed.context.route).toBe("/api/payments/create");
  });

  it("captures operational messages at different log levels", () => {
    captureMessage("Info heartbeat", "info", { route: "/api/health" });
    expect(consoleLogSpy).toHaveBeenCalled();

    captureMessage("Rate limit spike detected", "warning", {
      route: "/api/register",
    });
    expect(consoleWarnSpy).toHaveBeenCalled();

    captureMessage("Critical gateway outage", "error", {
      route: "/api/payments/verify",
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
