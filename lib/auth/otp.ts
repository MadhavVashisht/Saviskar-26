/**
 * Saviskar 2026 - Registration OTP Manager (Serverless-Safe Persistent Storage)
 *
 * Persistent, cross-instance OTP storage using Supabase backend with HMAC-SHA256 salted hashes.
 * Security guarantees:
 *   - Plaintext OTP is NEVER persisted in any database or store
 *   - Timing-safe verification
 *   - Single-use invalidation
 *   - 10-minute expiration
 *   - Max 5 verification attempts lockout
 *   - 60-second resend cooldown
 *   - Cross-serverless instance reliability
 */

import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { sendOtpEmail } from "./send-otp-email";
import { checkRateLimit } from "@/lib/rate-limit";

export const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
export const MAX_VERIFY_ATTEMPTS = 5;

export type OtpRecord = {
  id: string;
  email: string;
  otpHash: string;
  issuedAt: number;
  expiresAt: number;
  attempts: number;
  consumedAt: number | null;
};

export interface IOtpStore {
  createOtp(data: {
    email: string;
    otpHash: string;
    issuedAt: number;
    expiresAt: number;
  }): Promise<OtpRecord>;
  getActiveOtp(email: string): Promise<OtpRecord | null>;
  incrementAttempts(id: string): Promise<number>;
  consumeOtp(id: string): Promise<boolean>;
  invalidatePreviousOtps(email: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// 1. SUPABASE PERSISTENT OTP STORE (Cross-Instance / Serverless-Safe)
// ---------------------------------------------------------------------------
export class SupabaseOtpStore implements IOtpStore {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async createOtp(data: {
    email: string;
    otpHash: string;
    issuedAt: number;
    expiresAt: number;
  }): Promise<OtpRecord> {
    const { data: inserted, error } = await this.client
      .from("registration_otps")
      .insert({
        email: data.email,
        otp_hash: data.otpHash,
        issued_at: new Date(data.issuedAt).toISOString(),
        expires_at: new Date(data.expiresAt).toISOString(),
        attempts: 0,
      })
      .select("id, email, otp_hash, issued_at, expires_at, attempts, consumed_at")
      .single();

    if (error || !inserted) {
      throw new Error(`Failed to persist OTP record: ${error?.message || "Unknown DB error"}`);
    }

    return {
      id: inserted.id,
      email: inserted.email,
      otpHash: inserted.otp_hash,
      issuedAt: new Date(inserted.issued_at).getTime(),
      expiresAt: new Date(inserted.expires_at).getTime(),
      attempts: inserted.attempts ?? 0,
      consumedAt: inserted.consumed_at ? new Date(inserted.consumed_at).getTime() : null,
    };
  }

  async getActiveOtp(email: string): Promise<OtpRecord | null> {
    const { data: record, error } = await this.client
      .from("registration_otps")
      .select("id, email, otp_hash, issued_at, expires_at, attempts, consumed_at")
      .eq("email", email)
      .is("consumed_at", null)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !record) {
      return null;
    }

    return {
      id: record.id,
      email: record.email,
      otpHash: record.otp_hash,
      issuedAt: new Date(record.issued_at).getTime(),
      expiresAt: new Date(record.expires_at).getTime(),
      attempts: record.attempts ?? 0,
      consumedAt: record.consumed_at ? new Date(record.consumed_at).getTime() : null,
    };
  }

  async incrementAttempts(id: string): Promise<number> {
    try {
      const { data, error } = await this.client.rpc(
        "increment_registration_otp_attempts",
        { p_otp_id: id }
      );
      if (!error && typeof data === "number") {
        return data;
      }
    } catch {
      // Proceed to fallback if RPC is not present yet
    }

    const { data: record } = await this.client
      .from("registration_otps")
      .select("attempts")
      .eq("id", id)
      .single();

    const nextAttempts = (record?.attempts ?? 0) + 1;

    await this.client
      .from("registration_otps")
      .update({
        attempts: nextAttempts,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return nextAttempts;
  }

  async consumeOtp(id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("registration_otps")
      .update({
        consumed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("consumed_at", null)
      .select("id");

    if (error) {
      throw new Error(`Failed to consume OTP: ${error.message}`);
    }

    return Array.isArray(data) && data.length > 0;
  }

  async invalidatePreviousOtps(email: string): Promise<void> {
    await this.client
      .from("registration_otps")
      .update({
        consumed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .is("consumed_at", null);
  }
}

// ---------------------------------------------------------------------------
// 2. MEMORY OTP STORE (Fallback & Local Test Adapter)
// ---------------------------------------------------------------------------
export class MemoryOtpStore implements IOtpStore {
  private store: Map<string, OtpRecord>;

  constructor() {
    const globalStore = globalThis as unknown as {
      __svk_persistent_otp_store__?: Map<string, OtpRecord>;
    };
    if (!globalStore.__svk_persistent_otp_store__) {
      globalStore.__svk_persistent_otp_store__ = new Map<string, OtpRecord>();
    }
    this.store = globalStore.__svk_persistent_otp_store__;
  }

  async createOtp(data: {
    email: string;
    otpHash: string;
    issuedAt: number;
    expiresAt: number;
  }): Promise<OtpRecord> {
    const record: OtpRecord = {
      id: randomInt(10000000, 99999999).toString(),
      email: data.email,
      otpHash: data.otpHash,
      issuedAt: data.issuedAt,
      expiresAt: data.expiresAt,
      attempts: 0,
      consumedAt: null,
    };
    this.store.set(data.email, record);
    return record;
  }

  async getActiveOtp(email: string): Promise<OtpRecord | null> {
    const record = this.store.get(email);
    if (!record || record.consumedAt !== null) return null;
    return record;
  }

  async incrementAttempts(id: string): Promise<number> {
    for (const record of this.store.values()) {
      if (record.id === id) {
        record.attempts += 1;
        return record.attempts;
      }
    }
    return 1;
  }

  async consumeOtp(id: string): Promise<boolean> {
    for (const [email, record] of this.store.entries()) {
      if (record.id === id) {
        if (record.consumedAt !== null) {
          return false;
        }
        record.consumedAt = Date.now();
        this.store.delete(email);
        return true;
      }
    }
    return false;
  }

  async invalidatePreviousOtps(email: string): Promise<void> {
    const record = this.store.get(email);
    if (record) {
      record.consumedAt = Date.now();
      this.store.delete(email);
    }
  }

  clear() {
    this.store.clear();
  }
}

// ---------------------------------------------------------------------------
// 3. STORE FACTORY & STORE OVERRIDE FOR TESTING
// ---------------------------------------------------------------------------
let storeOverride: IOtpStore | null = null;
const memoryFallback = new MemoryOtpStore();

export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
  );
}

export function setOtpStoreOverride(store: IOtpStore | null) {
  storeOverride = store;
}

export function getOtpStore(): IOtpStore {
  if (storeOverride) return storeOverride;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  const isProd = isProductionEnvironment();

  if (supabaseUrl && supabaseSecretKey) {
    const client = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    return new SupabaseOtpStore(client);
  }

  if (isProd) {
    throw new Error(
      "[AUTH OTP FATAL] Production environment requires Supabase credentials (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY). Silent fallback to in-memory OTP storage is forbidden in production."
    );
  }

  return memoryFallback;
}

// ---------------------------------------------------------------------------
// 4. CRYPTOGRAPHIC HASH & GENERATION
// ---------------------------------------------------------------------------
function getOtpSecret(): string {
  return (
    process.env.OTP_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim() ||
    process.env.PAYMENT_RESUME_TOKEN_SECRET?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    "saviskar-2026-default-otp-secret-salt-32bytes"
  );
}

export function hashOtp(email: string, otp: string, issuedAt: number): string {
  const secret = getOtpSecret();
  return createHmac("sha256", secret)
    .update(`${email.trim().toLowerCase()}:${otp}:${issuedAt}`)
    .digest("hex");
}

export function generate6DigitOtp(): string {
  return randomInt(100000, 1000000).toString();
}

// ---------------------------------------------------------------------------
// 5. PUBLIC API: REQUEST OTP & VERIFY OTP
// ---------------------------------------------------------------------------
export type RequestOtpResult = {
  success: boolean;
  error?: string;
  retryAfter?: number;
};

export async function requestOtp(
  rawEmail: string,
  clientIp: string
): Promise<RequestOtpResult> {
  const normalizedEmail = rawEmail.trim().toLowerCase();
  const now = Date.now();

  // 1. IP Rate Limiting (15 requests per 10 minutes)
  const ipLimit = checkRateLimit(`auth:otp:ip:${clientIp}`, 15, OTP_EXPIRATION_MS);
  if (!ipLimit.allowed) {
    return {
      success: false,
      error: "Too many verification requests from this network. Please wait a moment.",
      retryAfter: ipLimit.retryAfter,
    };
  }

  // 2. Email Rate Limiting (4 requests per 10 minutes)
  const emailLimit = checkRateLimit(
    `auth:otp:email:${normalizedEmail}`,
    4,
    OTP_EXPIRATION_MS
  );
  if (!emailLimit.allowed) {
    return {
      success: false,
      error: "Too many codes requested for this email. Please wait a few minutes.",
      retryAfter: emailLimit.retryAfter,
    };
  }

  let store: IOtpStore;
  try {
    store = getOtpStore();
  } catch (storeErr: unknown) {
    console.error("[AUTH OTP] Store initialization failure:", storeErr);
    return {
      success: false,
      error: "Authentication service is temporarily unavailable. Please try again.",
    };
  }

  // 3. Resend Cooldown (minimum 60 seconds between requests)
  try {
    const existing = await store.getActiveOtp(normalizedEmail);
    if (existing && now - existing.issuedAt < OTP_RESEND_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS - (now - existing.issuedAt)) / 1000
      );
      return {
        success: false,
        error: `Please wait ${remainingSeconds}s before requesting a new code.`,
        retryAfter: remainingSeconds,
      };
    }

    // Invalidate previous OTPs for this email (resend replaces previous OTP)
    await store.invalidatePreviousOtps(normalizedEmail);
  } catch (err) {
    console.warn("[AUTH OTP] Active OTP lookup failed in persistent store, proceeding:", err);
  }

  // 4. Generate new cryptographically random 6-digit OTP
  const otp = generate6DigitOtp();
  const issuedAt = now;
  const exp = now + OTP_EXPIRATION_MS;
  const otpHash = hashOtp(normalizedEmail, otp, issuedAt);

  // 5. Persist hashed OTP (never plaintext)
  let createdRecord: OtpRecord | null = null;
  try {
    createdRecord = await store.createOtp({
      email: normalizedEmail,
      otpHash,
      issuedAt,
      expiresAt: exp,
    });
  } catch (err) {
    console.error("[AUTH OTP] Error writing to persistent store:", err);
    if (isProductionEnvironment()) {
      return {
        success: false,
        error: "Unable to process verification request. Please try again later.",
      };
    }
    // Only in non-production environments allow test memory fallback
    if (store !== memoryFallback) {
      createdRecord = await memoryFallback.createOtp({
        email: normalizedEmail,
        otpHash,
        issuedAt,
        expiresAt: exp,
      });
    } else {
      return {
        success: false,
        error: "Unable to process verification request. Please try again later.",
      };
    }
  }

  // 6. Send OTP via Resend
  const emailResult = await sendOtpEmail(normalizedEmail, otp);
  if (!emailResult.success) {
    if (createdRecord) {
      try {
        await store.consumeOtp(createdRecord.id);
      } catch {}
    }
    return {
      success: false,
      error: emailResult.error || "Unable to send verification code. Please try again.",
    };
  }

  return { success: true };
}

export type VerifyOtpResult = {
  success: boolean;
  error?: string;
};

export async function verifyOtp(
  rawEmail: string,
  rawOtp: string
): Promise<VerifyOtpResult> {
  const normalizedEmail = rawEmail.trim().toLowerCase();
  const cleanOtp = rawOtp.trim();

  let store: IOtpStore;
  try {
    store = getOtpStore();
  } catch (storeErr: unknown) {
    console.error("[AUTH OTP] Store initialization failure:", storeErr);
    return {
      success: false,
      error: "Authentication service is temporarily unavailable. Please try again.",
    };
  }

  let entry: OtpRecord | null = null;

  try {
    entry = await store.getActiveOtp(normalizedEmail);
  } catch (err) {
    console.error("[AUTH OTP] Persistent getActiveOtp error:", err);
    if (isProductionEnvironment()) {
      return {
        success: false,
        error: "Unable to verify code at this time. Please try again later.",
      };
    }
    entry = await memoryFallback.getActiveOtp(normalizedEmail);
  }

  const now = Date.now();

  if (!entry) {
    return {
      success: false,
      error: "No verification code found. Please request a new code.",
    };
  }

  // Check expiration
  if (now > entry.expiresAt) {
    try {
      await store.consumeOtp(entry.id);
    } catch {}
    return {
      success: false,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  // Check attempt threshold lockout
  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    try {
      await store.consumeOtp(entry.id);
    } catch {}
    return {
      success: false,
      error: "Too many incorrect attempts. Please request a new verification code.",
    };
  }

  // Increment attempts counter
  let newAttempts = entry.attempts + 1;
  try {
    newAttempts = await store.incrementAttempts(entry.id);
  } catch {}

  // Compute expected hash using the record's issuedAt timestamp
  const computedHash = hashOtp(normalizedEmail, cleanOtp, entry.issuedAt);
  const computedBuf = Buffer.from(computedHash, "hex");
  const storedBuf = Buffer.from(entry.otpHash, "hex");

  const isMatch =
    computedBuf.length === storedBuf.length &&
    timingSafeEqual(computedBuf, storedBuf);

  if (!isMatch) {
    const remaining = MAX_VERIFY_ATTEMPTS - newAttempts;
    if (remaining <= 0) {
      try {
        await store.consumeOtp(entry.id);
      } catch {}
      return {
        success: false,
        error: "Too many incorrect attempts. Please request a new code.",
      };
    }
    return {
      success: false,
      error: `Invalid verification code. ${remaining} ${
        remaining === 1 ? "attempt" : "attempts"
      } remaining.`,
    };
  }

  // Success: mark consumed / invalidate immediately (atomic single-use check)
  let consumed = false;
  try {
    consumed = await store.consumeOtp(entry.id);
  } catch (err) {
    console.error("[AUTH OTP] Error consuming OTP on success:", err);
  }

  if (!consumed) {
    return {
      success: false,
      error: "Verification code has already been used. Please request a new code.",
    };
  }

  return { success: true };
}

/**
 * Testing helper to reset state
 */
export function _clearOtpStoreForTesting() {
  memoryFallback.clear();
  setOtpStoreOverride(null);
}
