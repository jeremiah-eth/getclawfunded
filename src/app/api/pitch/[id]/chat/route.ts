import { NextRequest, NextResponse } from "next/server";
import { getPitch, getChatMessages, addChatMessage, updatePitchVerdict, getVcAgent } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: pitchId } = await params;
    const body = await request.json();
    const { action, content } = body;

    const pitch = await getPitch(pitchId);
    if (!pitch) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    const vcAgent = await getVcAgent(pitch.vc_agent_id);
    if (!vcAgent) {
      return NextResponse.json({ error: "VC agent not found" }, { status: 404 });
    }

    // Start action - initialize the conversation
    if (action === "start") {
      const existingMessages = await getChatMessages(pitchId);
      
      if (existingMessages.length === 0) {
        // Generate initial VC message based on pitch
        const pitchSummary = `
STARTUP: ${pitch.startup_name}
ONE-LINER: ${pitch.one_liner}

PROBLEM: ${pitch.problem}

SOLUTION: ${pitch.solution}

MARKET: ${pitch.market}

TRACTION: ${pitch.traction}

TEAM: ${pitch.team}

ASK: ${pitch.ask}
        `.trim();

        const initialPrompt = `${vcAgent.personality_prompt}

A founder just submitted their pitch. Here it is:

${pitchSummary}

Start the conversation. Acknowledge their pitch briefly, then ask your FIRST tough question. Be direct and challenging. Don't waste time with pleasantries. You'll have a few back-and-forth exchanges before giving your final verdict, so focus on understanding the most important aspects first.`;

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{ role: "user", content: initialPrompt }],
        });

        const vcMessage = response.content[0].type === "text" ? response.content[0].text : "";
        await addChatMessage(pitchId, "vc", vcMessage);

        return NextResponse.json({
          messages: [{
            id: "1",
            role: "vc",
            content: vcMessage,
            timestamp: new Date().toISOString(),
          }],
        });
      }

      // Return existing messages
      return NextResponse.json({
        messages: existingMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.created_at,
        })),
      });
    }

    // Message action - continue the conversation
    if (action === "message" && content) {
      // Save founder's message
      await addChatMessage(pitchId, "founder", content);

      // Get conversation history
      const messages = await getChatMessages(pitchId);
      
      // Check if we should give verdict (after ~4-6 exchanges)
      const founderMessages = messages.filter((m) => m.role === "founder");
      const shouldVerdict = founderMessages.length >= 3;

      // Build conversation for Claude
      const pitchContext = `
STARTUP: ${pitch.startup_name}
ONE-LINER: ${pitch.one_liner}
PROBLEM: ${pitch.problem}
SOLUTION: ${pitch.solution}
MARKET: ${pitch.market}
TRACTION: ${pitch.traction}
TEAM: ${pitch.team}
ASK: ${pitch.ask}
      `.trim();

      let systemPrompt = vcAgent.personality_prompt;
      
      if (shouldVerdict) {
        systemPrompt += `

IMPORTANT: This is your FINAL response. After this exchange, you MUST provide your verdict.

End your response with a verdict block in this EXACT format:
---VERDICT---
SCORE: [0.0-10.0]
VALUATION: [$X - your estimate of what this startup is worth]
FEEDBACK: [2-3 sentences of brutally honest feedback]
FUNDED: [YES if score >= 8.0, NO otherwise]
---END_VERDICT---

Be fair but demanding. Only score 8.0+ for genuinely compelling pitches.`;
      } else {
        systemPrompt += `

Continue the conversation. Ask follow-up questions to probe deeper into their pitch. Challenge their assumptions. Be direct but fair. You have ${3 - founderMessages.length} more exchanges before you'll need to give your verdict.`;
      }

      const conversationMessages = messages.map((m) => ({
        role: m.role === "vc" ? "assistant" as const : "user" as const,
        content: m.content,
      }));

      // Add the context as a system message
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: `${systemPrompt}\n\nPitch being evaluated:\n${pitchContext}`,
        messages: conversationMessages,
      });

      const vcResponse = response.content[0].type === "text" ? response.content[0].text : "";
      await addChatMessage(pitchId, "vc", vcResponse);

      // Parse verdict if present
      let verdict = null;
      const verdictMatch = vcResponse.match(/---VERDICT---([\s\S]*?)---END_VERDICT---/);
      
      if (verdictMatch) {
        const verdictText = verdictMatch[1];
        const scoreMatch = verdictText.match(/SCORE:\s*([\d.]+)/);
        const valuationMatch = verdictText.match(/VALUATION:\s*(.+)/);
        const feedbackMatch = verdictText.match(/FEEDBACK:\s*([\s\S]*?)(?=\n(?:FUNDED|$))/);
        const fundedMatch = verdictText.match(/FUNDED:\s*(YES|NO)/i);

        if (scoreMatch && valuationMatch && feedbackMatch && fundedMatch) {
          const score = parseFloat(scoreMatch[1]);
          const funded = fundedMatch[1].toUpperCase() === "YES" && score >= 8.0;

          verdict = {
            score,
            valuation: valuationMatch[1].trim(),
            feedback: feedbackMatch[1].trim(),
            funded,
          };

          // Update pitch in database
          await updatePitchVerdict(pitchId, {
            score: verdict.score,
            valuation: verdict.valuation,
            feedback: verdict.feedback,
            status: verdict.funded ? "funded" : "rejected",
          });
        }
      }

      // Clean up the response (remove verdict block from displayed message)
      const cleanMessage = vcResponse.replace(/---VERDICT---[\s\S]*?---END_VERDICT---/, "").trim();

      return NextResponse.json({
        message: cleanMessage,
        verdict,
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
