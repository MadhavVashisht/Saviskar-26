/**
 * Saviskar 2026 Registration Auth Session
 *
 * Stateless cryptographically signed tokens (HMAC-SHA256)
 * stored in HTTP-only, secure cookies for verified registration access.
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type RegistrationSessionPayload = {
  email: string;
  iat: number;
  exp: number;
  nonce: string;
};

export const SESSION_COOKIE_NAME = "svk_reg_session";
export const DEFAULT_SESSION_EXP_MS = 48 * 60 * 60 * 1000; // 48 hours

export function getSessionSecret(secretOverride?: string): string {
  if (secretOverride) return secretOverride;

  const sessionSecret = process.env.SESSION_SECRET?.trim();
  if (sessionSecret) {
    return sessionSecret;
  }

  // In production, fail closed immediately — never derive or fall back
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is not configured in production environment."
    );
  }

  // Development/test environments only.
  // Explicitly forbidden to use NEXT_PUBLIC_* or PAYMENT_RESUME_TOKEN_SECRET as fallback.
  return "dev-only-registration-session-secret-salt-32bytes-minimum";
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

function computeHmacSignature(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function createRegistrationSessionToken(
  email: string,
  expiresInMs: number = DEFAULT_SESSION_EXP_MS,
  secretOverride?: string
): string {
  const secret = getSessionSecret(secretOverride);
  const now = Date.now();
  const payload: RegistrationSessionPayload = {
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + expiresInMs,
    nonce: randomBytes(16).toString("hex"),
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = computeHmacSignature(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export function verifyRegistrationSessionToken(
  token: string,
  secretOverride?: string
): {
  valid: boolean;
  payload?: RegistrationSessionPayload;
  error?: string;
} {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing session token." };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed session token." };
  }

  const [payloadB64, providedSig] = parts;

  let secret: string;
  try {
    secret = getSessionSecret(secretOverride);
  } catch {
    return { valid: false, error: "Session secret is not configured." };
  }

  const expectedSig = computeHmacSignature(payloadB64, secret);

  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);

  if (
    providedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return { valid: false, error: "Invalid session token signature." };
  }

  let payload: RegistrationSessionPayload;
  try {
    const jsonStr = base64UrlDecode(payloadB64);
    payload = JSON.parse(jsonStr) as RegistrationSessionPayload;
  } catch {
    return { valid: false, error: "Corrupted session payload." };
  }

  if (
    !payload ||
    typeof payload.email !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return { valid: false, error: "Invalid session payload structure." };
  }

  if (Date.now() > payload.exp) {
    return { valid: false, error: "Session has expired." };
  }

  return { valid: true, payload };
}

/**
 * Server Component / Route Handler helper to inspect current registration session
 */
export async function getRegistrationSession(): Promise<{
  authenticated: boolean;
  email?: string;
}> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return { authenticated: false };
    }

    const verification = verifyRegistrationSessionToken(sessionCookie);
    if (!verification.valid || !verification.payload) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      email: verification.payload.email,
    };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Sets the registration session cookie on response headers
 */
export async function setRegistrationSessionCookie(email: string): Promise<string> {
  const token = createRegistrationSessionToken(email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(DEFAULT_SESSION_EXP_MS / 1000),
  });
  return token;
}

/**
 * Clears the registration session cookie
 */
export async function clearRegistrationSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
