import { NextRequest, NextResponse } from "next/server";
import { getFundedStartups } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sort") as "score" | "date" | "valuation" | null;

    const startups = await getFundedStartups(sortBy || "date");

    // Transform to camelCase for frontend
    const formattedStartups = startups.map((s) => ({
      id: s.id,
      startupName: s.startup_name,
      oneLiner: s.one_liner,
      score: s.score,
      valuation: s.valuation,
      twitterHandle: s.twitter_handle,
      fundedAt: s.funded_at,
      txHash: s.tx_hash,
    }));

    return NextResponse.json({ startups: formattedStartups });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
