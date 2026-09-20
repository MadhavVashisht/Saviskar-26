import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/otp";
import { setRegistrationSessionCookie } from "@/lib/auth/session";
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_PATTERN = /^\d{6}$/;

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimitAsync(`auth:verify:ip:${clientIp}`, 20, 600 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts from this network. Please wait a moment." },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": String(rateLimit.retryAfter),
          },
        }
      );
    }
    const body = await req.json().catch(() => null);

    if (!body || typeof body.email !== "string" || typeof body.otp !== "string") {
      return NextResponse.json(
        { success: false, error: "Email and 6-digit verification code are required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const email = body.email.trim().toLowerCase();
    const otp = body.otp.trim();

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!OTP_PATTERN.test(otp)) {
      return NextResponse.json(
        { success: false, error: "Verification code must be exactly 6 numeric digits." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const result = await verifyOtp(email, otp);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Invalid or expired verification code.",
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Establish secure HTTP-only session cookie
    await setRegistrationSessionCookie(email);

    return NextResponse.json(
      {
        success: true,
        email,
        message: "Email verification successful.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err) {
    console.error("[VERIFY OTP ERROR]", err);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during verification. Please try again.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
