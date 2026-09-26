/**
 * Saviskar 2026 Admin Session Management & Expiration Authority
 *
 * Enforces authoritative server-side absolute session expiration for all
 * admin dashboard requests and admin API routes.
 */

export const DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours (28,800 seconds)

/**
 * Retrieves the configured maximum admin session lifetime in seconds.
 * Defaults to 28,800 seconds (8 hours) if ADMIN_SESSION_MAX_AGE_SECONDS is not set or invalid.
 */
export function getAdminSessionMaxAgeSeconds(): number {
  const configured = process.env.ADMIN_SESSION_MAX_AGE_SECONDS?.trim();
  if (configured) {
    const parsed = parseInt(configured, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS;
}

/**
 * Authoritatively validates whether a Supabase Auth admin user session has expired.
 *
 * Uses `user.last_sign_in_at` from Supabase Auth as the authoritative session start timestamp.
 * In Supabase Auth, `last_sign_in_at` represents the initial authentication time (password / OTP / OAuth)
 * and is NOT updated on background token refreshes, preventing indefinite session extension.
 */
export function isAdminSessionExpired(
  user: { last_sign_in_at?: string | null } | null | undefined,
  maxAgeSeconds: number = getAdminSessionMaxAgeSeconds()
): boolean {
  if (!user) return true;

  // Fail closed if the user has no recorded authentication timestamp
  if (!user.last_sign_in_at) {
    return true;
  }

  const authTime = new Date(user.last_sign_in_at).getTime();
  if (Number.isNaN(authTime)) {
    return true;
  }

  // Reject future-dated authentication timestamps beyond a reasonable 60s clock skew
  if (authTime > Date.now() + 60000) {
    return true;
  }

  const maxAgeMs = maxAgeSeconds * 1000;
  return Date.now() - authTime > maxAgeMs;
}

/**
 * Transforms cookie options for admin authentication to enforce browser-session scoping.
 *
 * For cookie deletion (maxAge <= 0), the deletion maxAge is preserved so the browser clears the cookie.
 * For active authentication cookies, maxAge and expires are removed (undefined) so that the browser treats
 * the cookie as a session-only cookie that is discarded when the browser process exits.
 */
export function toAdminSessionCookieOptions<
  T extends { maxAge?: number; expires?: Date | number }
>(options: T): T;
export function toAdminSessionCookieOptions<
  T extends { maxAge?: number; expires?: Date | number }
>(options?: T): T | undefined;
export function toAdminSessionCookieOptions<
  T extends { maxAge?: number; expires?: Date | number }
>(options?: T): T | undefined {
  if (!options) return undefined;
  const isDeletion = typeof options.maxAge === "number" && options.maxAge <= 0;
  if (isDeletion) {
    return { ...options };
  }
  const sessionOptions = { ...options };
  delete sessionOptions.maxAge;
  delete sessionOptions.expires;
  return sessionOptions;
}
