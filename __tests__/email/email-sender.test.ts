import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getEmailSender, CANONICAL_SENDER_EMAIL } from "@/lib/email-sender";
import { sendOtpEmail } from "@/lib/auth/send-otp-email";
import { sendRegistrationEmail } from "@/lib/send-registration-email";

// Mock Resend SDK
const mockSend = vi.fn();
vi.mock("resend", () => {
  return {
    Resend: class {
      emails = {
        send: mockSend,
      };
    },
  };
});

describe("Resend Sender Email Configuration & Security Invariants", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("1. getEmailSender() Configuration Validation", () => {
    it("returns success with canonical sender when RESEND_FROM_EMAIL is set", () => {
      process.env.RESEND_FROM_EMAIL = CANONICAL_SENDER_EMAIL;
      const result = getEmailSender();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.from).toBe("Saviskar 2026 <noreply@saviskar.co.in>");
      }
    });

    it("succeeds with canonical sender even with surrounding whitespace (trimmed)", () => {
      process.env.RESEND_FROM_EMAIL = "   Saviskar 2026 <noreply@saviskar.co.in>   ";
      const result = getEmailSender();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.from).toBe("Saviskar 2026 <noreply@saviskar.co.in>");
      }
    });

    it("succeeds with canonical sender in production environment", () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.RESEND_FROM_EMAIL = CANONICAL_SENDER_EMAIL;
      const result = getEmailSender();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.from).toBe("Saviskar 2026 <noreply@saviskar.co.in>");
      }
    });

    it("fails safely when RESEND_FROM_EMAIL is missing or empty", () => {
      delete process.env.RESEND_FROM_EMAIL;
      const result = getEmailSender();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Email service is temporarily unavailable. Please try again later.");
        expect(result.internalLog).toContain("RESEND_FROM_EMAIL environment variable is missing");
      }

      process.env.RESEND_FROM_EMAIL = "   ";
      const whitespaceResult = getEmailSender();
      expect(whitespaceResult.success).toBe(false);
    });

    it("STRICTLY rejects deprecated unverified domain amadhav.com", () => {
      process.env.RESEND_FROM_EMAIL = "Saviskar 2026 <noreply@amadhav.com>";
      const result = getEmailSender();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Email service is temporarily unavailable. Please try again later.");
        expect(result.internalLog).toContain("amadhav.com");
      }
    });

    it("STRICTLY rejects sandbox test sender onboarding@resend.dev", () => {
      process.env.RESEND_FROM_EMAIL = "Saviskar 2026 <onboarding@resend.dev>";
      const result = getEmailSender();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Email service is temporarily unavailable. Please try again later.");
        expect(result.internalLog).toContain("onboarding@resend.dev");
      }
    });

    it("STRICTLY rejects arbitrary third-party senders in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.RESEND_FROM_EMAIL = "Other <noreply@example.com>";
      const result = getEmailSender();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Email service is temporarily unavailable. Please try again later.");
        expect(result.internalLog).toContain("Non-canonical sender detected in production");
      }

      process.env.RESEND_FROM_EMAIL = "Hackathon Team <alerts@customdomain.io>";
      const result2 = getEmailSender();
      expect(result2.success).toBe(false);
    });

    it("STRICTLY rejects malformed sender values", () => {
      const malformedExamples = [
        "noreply@saviskar.co.in",                     // Missing display name + angle brackets
        "Saviskar 2026 noreply@saviskar.co.in",        // Missing angle brackets
        "Saviskar 2026 <not-an-email>",               // Invalid email structure
        "Saviskar 2026 <>",                           // Empty brackets
        "Saviskar 2026 <@saviskar.co.in>",            // Missing local part
        "<noreply@saviskar.co.in>",                   // Missing display name
        "Saviskar 2026 <noreply@saviskar>",           // Missing TLD
      ];

      for (const badValue of malformedExamples) {
        process.env.RESEND_FROM_EMAIL = badValue;
        const result = getEmailSender();
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("Email service is temporarily unavailable. Please try again later.");
          expect(result.internalLog).toContain("Malformed RESEND_FROM_EMAIL value");
        }
      }
    });
  });

  describe("2. OTP Email Dispatch (sendOtpEmail)", () => {
    it("fails safely without calling Resend API when RESEND_FROM_EMAIL is missing", async () => {
      delete process.env.RESEND_FROM_EMAIL;
      process.env.RESEND_API_KEY = "re_test_key_12345";

      const res = await sendOtpEmail("student@cgc.edu.in", "123456");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Email service is temporarily unavailable. Please try again later.");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("fails safely without calling Resend API when RESEND_FROM_EMAIL uses amadhav.com", async () => {
      process.env.RESEND_FROM_EMAIL = "Saviskar 2026 <noreply@amadhav.com>";
      process.env.RESEND_API_KEY = "re_test_key_12345";

      const res = await sendOtpEmail("student@cgc.edu.in", "123456");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Email service is temporarily unavailable. Please try again later.");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("fails safely in production when RESEND_FROM_EMAIL is non-canonical", async () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.RESEND_FROM_EMAIL = "Other <noreply@example.com>";
      process.env.RESEND_API_KEY = "re_test_key_12345";

      const res = await sendOtpEmail("student@cgc.edu.in", "123456");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Email service is temporarily unavailable. Please try again later.");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("dispatches with canonical RESEND_FROM_EMAIL when configured correctly", async () => {
      process.env.RESEND_FROM_EMAIL = CANONICAL_SENDER_EMAIL;
      process.env.RESEND_API_KEY = "re_test_key_12345";
      mockSend.mockResolvedValueOnce({ data: { id: "msg_12345" }, error: null });

      const res = await sendOtpEmail("student@cgc.edu.in", "654321");
      expect(res.success).toBe(true);
      expect(res.messageId).toBe("msg_12345");
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "Saviskar 2026 <noreply@saviskar.co.in>",
          to: ["student@cgc.edu.in"],
        })
      );
    });

    it("never leaks internal Resend provider error messages to the client", async () => {
      process.env.RESEND_FROM_EMAIL = CANONICAL_SENDER_EMAIL;
      process.env.RESEND_API_KEY = "re_test_key_12345";
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: "The amadhav.com domain is not verified.", name: "validation_error" },
      });

      const res = await sendOtpEmail("student@cgc.edu.in", "654321");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Unable to send verification code. Please try again later.");
      expect(res.error).not.toContain("amadhav.com");
      expect(res.error).not.toContain("verified");
    });
  });

  describe("3. Registration Email Dispatch (sendRegistrationEmail)", () => {
    it("fails safely when RESEND_FROM_EMAIL is missing", async () => {
      delete process.env.RESEND_FROM_EMAIL;
      process.env.RESEND_API_KEY = "re_test_key_12345";

      const res = await sendRegistrationEmail({
        participantId: "SVK26-TEST0001",
        eventName: "RoboWars",
        name: "Test Participant",
        college: "CGC Landran",
        email: "participant@test.com",
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe("Sender email is not configured.");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("fails safely when RESEND_FROM_EMAIL contains amadhav.com", async () => {
      process.env.RESEND_FROM_EMAIL = "Saviskar 2026 <noreply@amadhav.com>";
      process.env.RESEND_API_KEY = "re_test_key_12345";

      const res = await sendRegistrationEmail({
        participantId: "SVK26-TEST0001",
        eventName: "RoboWars",
        name: "Test Participant",
        college: "CGC Landran",
        email: "participant@test.com",
      });

      expect(res.success).toBe(false);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("fails safely in production when RESEND_FROM_EMAIL is non-canonical", async () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.RESEND_FROM_EMAIL = "Other <noreply@example.com>";
      process.env.RESEND_API_KEY = "re_test_key_12345";

      const res = await sendRegistrationEmail({
        participantId: "SVK26-TEST0001",
        eventName: "RoboWars",
        name: "Test Participant",
        college: "CGC Landran",
        email: "participant@test.com",
      });

      expect(res.success).toBe(false);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("dispatches registration email from verified canonical RESEND_FROM_EMAIL", async () => {
      process.env.RESEND_FROM_EMAIL = CANONICAL_SENDER_EMAIL;
      process.env.RESEND_API_KEY = "re_test_key_12345";
      mockSend.mockResolvedValueOnce({ data: { id: "reg_msg_999" }, error: null });

      const res = await sendRegistrationEmail({
        participantId: "SVK26-TEST0001",
        eventName: "Web Hackathon",
        name: "Test Leader",
        college: "CGC Landran",
        email: "leader@test.com",
      });

      expect(res.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "Saviskar 2026 <noreply@saviskar.co.in>",
          to: ["leader@test.com"],
        })
      );
    });

    it("does NOT attempt fallback to onboarding@resend.dev when domain error occurs", async () => {
      process.env.RESEND_FROM_EMAIL = CANONICAL_SENDER_EMAIL;
      process.env.RESEND_API_KEY = "re_test_key_12345";
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { statusCode: 403, message: "The domain is not verified" },
      });

      const res = await sendRegistrationEmail({
        participantId: "SVK26-TEST0001",
        eventName: "Web Hackathon",
        name: "Test Leader",
        college: "CGC Landran",
        email: "leader@test.com",
      });

      // Exactly 1 send attempt made; no second fallback call with onboarding@resend.dev
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).not.toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining("onboarding@resend.dev"),
        })
      );
      expect(res.success).toBe(false);
    });
  });
});
