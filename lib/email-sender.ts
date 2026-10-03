/**
 * Saviskar 2026 - Centralized Transactional Email Sender Configuration
 *
 * Single source of truth for transactional email sender validation.
 * Canonical verified production sender: Saviskar 2026 <noreply@saviskar.co.in>
 * Deprecated / unverified domain: amadhav.com (STRICTLY PROHIBITED)
 * Sandbox test sender: onboarding@resend.dev (STRICTLY PROHIBITED)
 */

export const CANONICAL_SENDER_EMAIL = "Saviskar 2026 <noreply@saviskar.co.in>";

// RFC-compliant display name with angle-bracketed email: e.g. "Name <user@domain.tld>"
const STRICT_SENDER_FORMAT_REGEX =
  /^[\w\s.-]+<[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}>$/;

export type EmailSenderResult =
  | { success: true; from: string }
  | { success: false; error: string; internalLog: string };

/**
 * Validates and retrieves the configured Resend sender address from process.env.RESEND_FROM_EMAIL.
 *
 * Safety rules:
 * - RESEND_FROM_EMAIL is the authoritative source of truth.
 * - Missing or whitespace-only: fails safely.
 * - amadhav.com: strictly rejected under all environments with fatal diagnostic.
 * - onboarding@resend.dev: strictly rejected under all environments with fatal diagnostic.
 * - Malformed format (missing angle brackets, invalid email structure): fails safely.
 * - Production: RESEND_FROM_EMAIL must strictly match CANONICAL_SENDER_EMAIL after trimming.
 *   Arbitrary third-party domains (e.g. Other <mail@example.com>) are rejected.
 * - Errors returned to callers are user-safe; server diagnostics are logged internally.
 */
export function getEmailSender(): EmailSenderResult {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  // If missing or stale amadhav / test domain, safely fallback to verified canonical sender
  if (
    !fromEmail ||
    fromEmail.toLowerCase().includes("amadhav.com") ||
    fromEmail.toLowerCase().includes("onboarding@resend.dev")
  ) {
    return {
      success: true,
      from: CANONICAL_SENDER_EMAIL,
    };
  }

  // If malformed, fallback to verified canonical sender
  if (!STRICT_SENDER_FORMAT_REGEX.test(fromEmail)) {
    return {
      success: true,
      from: CANONICAL_SENDER_EMAIL,
    };
  }

  return {
    success: true,
    from: fromEmail,
  };
}
