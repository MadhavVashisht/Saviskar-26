import { NextResponse } from "next/server";
import {
  getRegistrationSession,
  clearRegistrationSessionCookie,
} from "@/lib/auth/session";

export async function GET() {
  const session = await getRegistrationSession();
  return NextResponse.json(session, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function DELETE() {
  await clearRegistrationSessionCookie();
  return NextResponse.json(
    { success: true, message: "Registration session cleared." },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
