import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: {
    database: "healthy" | "unhealthy" | "unconfigured";
    environment: {
      supabase: boolean;
      payu: boolean;
      resend: boolean;
      primaryAdmin: boolean;
    };
  } = {
    database: "unconfigured",
    environment: {
      supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY),
      payu: Boolean(process.env.PAYU_KEY && process.env.PAYU_SALT),
      resend: Boolean(process.env.RESEND_API_KEY),
      primaryAdmin: Boolean(process.env.PRIMARY_ADMIN_USER_ID),
    },
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      // Quick head count ping to verify DB connection
      const { error } = await client
        .from("events")
        .select("id", { count: "exact", head: true });

      if (error) {
        checks.database = "unhealthy";
      } else {
        checks.database = "healthy";
      }
    } catch {
      checks.database = "unhealthy";
    }
  }

  const isHealthy = checks.database !== "unhealthy";
  const latencyMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      latencyMs,
      checks,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
