import { NextResponse } from "next/server";
import { getSiteAccessState } from "@/lib/config/site-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getSiteAccessState();
  return NextResponse.json(
    {
      siteAccess: state.locks,
      accommodationAvailability: state.accommodationAvailability,
      competitionLocks: state.competitionLocks,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
      },
    }
  );
}
