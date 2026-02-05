import { NextRequest, NextResponse } from "next/server";
import { getPitch, getChatMessages, addChatMessage } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch chat messages (for polling)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: pitchId } = await params;

    const pitch = await getPitch(pitchId);
    if (!pitch) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    const messages = await getChatMessages(pitchId);

    // Check if there's a verdict
    let verdict = null;
    if (pitch.status === "funded" || pitch.status === "rejected") {
      verdict = {
        score: pitch.score,
        valuation: pitch.valuation,
        feedback: pitch.feedback,
        funded: pitch.status === "funded",
      };
    }

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.created_at,
      })),
      verdict,
      status: pitch.status,
    });
  } catch (error) {
    console.error("Chat fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

// POST - Founder sends a message (or starts chat)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: pitchId } = await params;
    const body = await request.json();
    const { action, content } = body;

    const pitch = await getPitch(pitchId);
    if (!pitch) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    // Start action - just return current messages, Kaido will pick it up
    if (action === "start") {
      const messages = await getChatMessages(pitchId);
      
      return NextResponse.json({
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.created_at,
        })),
        status: pitch.status,
        // Tell frontend to poll since Kaido will respond async
        polling: true,
      });
    }

    // Message action - founder sends a message
    if (action === "message" && content) {
      // Don't allow messages if verdict already given
      if (pitch.status === "funded" || pitch.status === "rejected") {
        return NextResponse.json(
          { error: "Pitch already evaluated" },
          { status: 400 }
        );
      }

      // Save founder's message
      await addChatMessage(pitchId, "founder", content);

      return NextResponse.json({
        success: true,
        // Frontend should poll for Kaido's response
        polling: true,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
