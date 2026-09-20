/**
 * Saviskar 2026 — Production Error Monitoring & Telemetry
 *
 * Lightweight, zero-bloat error reporter supporting structured JSON logging
 * and direct Sentry ingestion via Sentry Store API without heavy dependencies.
 */

export interface ErrorReportContext {
  route?: string;
  userId?: string;
  orderId?: string;
  paymentId?: string;
  digest?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  [key: string]: unknown;
}

const SENTRY_DSN =
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "";

const RELEASE =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  "saviskar-2026@production";

const ENVIRONMENT =
  process.env.NODE_ENV === "production" ? "production" : "development";

/**
 * Parses Sentry DSN into components
 */
function parseDsn(dsn: string): {
  protocol: string;
  publicKey: string;
  host: string;
  projectId: string;
} | null {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const host = url.host;
    const pathParts = url.pathname.split("/").filter(Boolean);
    const projectId = pathParts[0];

    if (!publicKey || !host || !projectId) return null;

    return {
      protocol: url.protocol,
      publicKey,
      host,
      projectId,
    };
  } catch {
    return null;
  }
}

/**
 * Dispatches an error payload to Sentry if DSN is configured
 */
async function sendToSentry(
  error: Error,
  context?: ErrorReportContext,
  level: "error" | "warning" | "info" = "error"
): Promise<void> {
  if (!SENTRY_DSN) return;

  const parsed = parseDsn(SENTRY_DSN);
  if (!parsed) return;

  const { protocol, publicKey, host, projectId } = parsed;
  const endpoint = `${protocol}//${host}/api/${projectId}/store/`;

  const payload = {
    event_id: crypto.randomUUID().replace(/-/g, ""),
    timestamp: new Date().toISOString().slice(0, 19),
    platform: "javascript",
    level,
    release: RELEASE,
    environment: ENVIRONMENT,
    exception: {
      values: [
        {
          type: error.name || "Error",
          value: error.message || "Unknown error",
          stacktrace: error.stack
            ? {
                frames: error.stack
                  .split("\n")
                  .slice(1)
                  .map((line) => ({ filename: line.trim() })),
              }
            : undefined,
        },
      ],
    },
    tags: {
      environment: ENVIRONMENT,
      route: context?.route || "unknown",
      ...context?.tags,
    },
    extra: {
      ...context?.extra,
      userId: context?.userId,
      orderId: context?.orderId,
      paymentId: context?.paymentId,
      digest: context?.digest,
    },
  };

  const authHeader = `Sentry sentry_version=7, sentry_client=saviskar-telemetry/1.0, sentry_key=${publicKey}`;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": authHeader,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Fail silently in telemetry dispatch so user request is never broken
    console.warn("[Telemetry] Failed to forward exception to Sentry:", err);
  }
}

/**
 * Captures and logs exceptions across API routes, server actions, and UI boundaries.
 */
export function captureException(
  error: unknown,
  context?: ErrorReportContext
): void {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));

  const logPayload = {
    timestamp: new Date().toISOString(),
    level: "ERROR",
    release: RELEASE,
    environment: ENVIRONMENT,
    message: normalizedError.message,
    name: normalizedError.name,
    stack: normalizedError.stack,
    context: {
      ...context,
      digest:
        context?.digest ||
        ("digest" in normalizedError
          ? String((normalizedError as { digest?: unknown }).digest)
          : undefined),
    },
  };

  // Structured console log for container/Vercel log drains
  console.error("[SAVISKAR_TELEMETRY]", JSON.stringify(logPayload));

  // Async dispatch to Sentry if DSN is set
  if (SENTRY_DSN) {
    sendToSentry(normalizedError, context, "error").catch(() => {});
  }
}

/**
 * Captures non-fatal operational messages (e.g. payment gateway degradation)
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: ErrorReportContext
): void {
  const logPayload = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    release: RELEASE,
    environment: ENVIRONMENT,
    message,
    context,
  };

  if (level === "error") {
    console.error("[SAVISKAR_TELEMETRY]", JSON.stringify(logPayload));
  } else if (level === "warning") {
    console.warn("[SAVISKAR_TELEMETRY]", JSON.stringify(logPayload));
  } else {
    console.log("[SAVISKAR_TELEMETRY]", JSON.stringify(logPayload));
  }

  if (SENTRY_DSN) {
    sendToSentry(new Error(message), context, level).catch(() => {});
  }
}
