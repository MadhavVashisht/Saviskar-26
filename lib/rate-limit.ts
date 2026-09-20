/**
 * Distributed sliding-window rate limiter.
 *
 * Backed by Supabase PostgreSQL `rate_limits` table with an atomic
 * row-locking `check_rate_limit` RPC function to enforce rate limits
 * across distributed serverless lambda instances on Vercel.
 *
 * Falls back gracefully to an in-memory sliding window cache if
 * the database is temporarily unreachable or running in test environments.
 */

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// Global rate limit store for in-memory fallback
const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = Date.now();

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Synchronous local sliding-window check (primarily used for unit tests
 * and instant fallback).
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60 * 1000
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const [k, entry] of rateLimitStore) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(k);
      }
    }
  }

  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/**
 * Distributed asynchronous rate limit check using Supabase PostgreSQL.
 * Holds rate limits across serverless lambda containers.
 */
export async function checkRateLimitAsync(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 60 * 1000
): Promise<{ allowed: boolean; retryAfter: number }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  // If Supabase credentials are missing (e.g. unit tests / local mock), use in-memory
  if (!supabaseUrl || !supabaseSecretKey || process.env.NODE_ENV === "test") {
    return checkRateLimit(key, maxRequests, windowMs);
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

    const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
      p_key: key,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error || !data || data.length === 0) {
      console.warn("[RATE LIMIT] Database RPC failed, using in-memory fallback:", error?.message);
      return checkRateLimit(key, maxRequests, windowMs);
    }

    const row = data[0];
    return {
      allowed: Boolean(row.allowed),
      retryAfter: Number(row.retry_after) || 0,
    };
  } catch (err) {
    console.warn("[RATE LIMIT] Exception in distributed check, using fallback:", err);
    return checkRateLimit(key, maxRequests, windowMs);
  }
}

export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
