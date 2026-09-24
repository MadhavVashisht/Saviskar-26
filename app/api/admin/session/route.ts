import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";

export async function GET() {
  const auth = await requireAdmin();

  if (auth.error) {
    return NextResponse.json(
      { authenticated: false, error: auth.error },
      {
        status: auth.status,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      user_id: auth.user.id,
      email: auth.user.email,
      role: auth.role,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
