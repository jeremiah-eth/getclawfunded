import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createPitch, getTodayPitchCount } from "@/lib/db";

const MAX_DAILY_PITCHES = 10;

export async function POST(request: NextRequest) {
  try {
    // Check daily limit
    const todayCount = await getTodayPitchCount();
    if (todayCount >= MAX_DAILY_PITCHES) {
      return NextResponse.json(
        { error: "Daily pitch limit reached. Try again tomorrow!" },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      "startupName",
      "oneLiner",
      "problem",
      "solution",
      "market",
      "traction",
      "team",
      "ask",
      "twitterHandle",
      "email",
    ];

    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Clean up Twitter handle (remove @ if present)
    const twitterHandle = body.twitterHandle.replace(/^@/, "");

    // Create pitch
    const pitchId = uuidv4();
    await createPitch({
      id: pitchId,
      startupName: body.startupName.trim(),
      oneLiner: body.oneLiner.trim().slice(0, 100),
      problem: body.problem.trim(),
      solution: body.solution.trim(),
      market: body.market.trim(),
      traction: body.traction.trim(),
      team: body.team.trim(),
      ask: body.ask.trim(),
      twitterHandle: twitterHandle.trim(),
      email: body.email.trim(),
    });

    return NextResponse.json({ pitchId });
  } catch (error) {
    console.error("Error creating pitch:", error);
    return NextResponse.json(
      { error: "Failed to create pitch" },
      { status: 500 }
    );
  }
}
