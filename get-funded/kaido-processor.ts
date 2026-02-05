/**
 * Kaido Pitch Processor
 * 
 * This script is run by Kaido (via OpenClaw) to process pending pitches.
 * It connects to Turso, checks for pitches needing a response, and handles them.
 * 
 * Usage: bun run kaido-processor.ts
 * 
 * Environment variables needed:
 * - TURSO_DATABASE_URL
 * - TURSO_AUTH_TOKEN
 */

import { createClient } from "@libsql/client";

// Configuration
const TURSO_URL = process.env.TURSO_DATABASE_URL || "libsql://getclawfunded-jeremiah.aws-us-east-2.turso.io";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_TOKEN) {
  console.error("❌ TURSO_AUTH_TOKEN not set");
  process.exit(1);
}

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

interface Pitch {
  id: string;
  startup_name: string;
  one_liner: string;
  problem: string;
  solution: string;
  market: string;
  traction: string;
  team: string;
  ask: string;
  twitter_handle: string;
  message_count: number;
}

interface ChatMessage {
  role: "vc" | "founder";
  content: string;
}

async function getPitchesNeedingResponse(): Promise<Pitch[]> {
  const result = await db.execute(`
    SELECT p.*, 
           (SELECT COUNT(*) FROM chat_messages WHERE pitch_id = p.id) as message_count,
           (SELECT role FROM chat_messages WHERE pitch_id = p.id ORDER BY created_at DESC LIMIT 1) as last_role
    FROM pitches p
    WHERE p.status NOT IN ('funded', 'rejected')
    ORDER BY p.created_at ASC
  `);

  return result.rows
    .filter((row) => {
      const messageCount = row.message_count as number;
      const lastRole = row.last_role as string | null;
      return messageCount === 0 || lastRole === "founder";
    })
    .map((row) => ({
      id: row.id as string,
      startup_name: row.startup_name as string,
      one_liner: row.one_liner as string,
      problem: row.problem as string,
      solution: row.solution as string,
      market: row.market as string,
      traction: row.traction as string,
      team: row.team as string,
      ask: row.ask as string,
      twitter_handle: row.twitter_handle as string,
      message_count: row.message_count as number,
    }));
}

async function getChatHistory(pitchId: string): Promise<ChatMessage[]> {
  const result = await db.execute({
    sql: "SELECT role, content FROM chat_messages WHERE pitch_id = ? ORDER BY created_at ASC",
    args: [pitchId],
  });

  return result.rows.map((row) => ({
    role: row.role as "vc" | "founder",
    content: row.content as string,
  }));
}

async function addMessage(pitchId: string, role: "vc" | "founder", content: string) {
  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO chat_messages (id, pitch_id, role, content) VALUES (?, ?, ?, ?)",
    args: [id, pitchId, role, content],
  });
}

async function updatePitchVerdict(pitchId: string, score: number, valuation: string, feedback: string, status: "funded" | "rejected") {
  await db.execute({
    sql: "UPDATE pitches SET score = ?, valuation = ?, feedback = ?, status = ? WHERE id = ?",
    args: [score, valuation, feedback, status, pitchId],
  });
}

// Main execution
async function main() {
  console.log("🦈 Kaido Pitch Processor starting...\n");

  const pitches = await getPitchesNeedingResponse();

  if (pitches.length === 0) {
    console.log("✅ No pitches need attention right now.");
    return;
  }

  console.log(`📋 Found ${pitches.length} pitch(es) needing response:\n`);

  for (const pitch of pitches) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎯 PITCH: ${pitch.startup_name}`);
    console.log(`   One-liner: ${pitch.one_liner}`);
    console.log(`   Twitter: @${pitch.twitter_handle}`);
    console.log(`   Messages so far: ${pitch.message_count}`);
    console.log(`${"=".repeat(60)}\n`);

    const history = await getChatHistory(pitch.id);

    console.log("📝 PITCH DETAILS:");
    console.log(`   Problem: ${pitch.problem}`);
    console.log(`   Solution: ${pitch.solution}`);
    console.log(`   Market: ${pitch.market}`);
    console.log(`   Traction: ${pitch.traction}`);
    console.log(`   Team: ${pitch.team}`);
    console.log(`   Ask: ${pitch.ask}`);

    if (history.length > 0) {
      console.log("\n💬 CONVERSATION HISTORY:");
      for (const msg of history) {
        const prefix = msg.role === "vc" ? "🦈 Kaido" : "👤 Founder";
        console.log(`   ${prefix}: ${msg.content.slice(0, 100)}${msg.content.length > 100 ? "..." : ""}`);
      }
    }

    console.log("\n" + "─".repeat(60));
    console.log("⏳ Waiting for your response as Kaido...");
    console.log("   (This info is for you to formulate your response)");
    console.log("─".repeat(60));
  }

  // Output summary for easy processing
  console.log("\n\n📊 SUMMARY FOR PROCESSING:");
  console.log(JSON.stringify(pitches.map(p => ({
    id: p.id,
    name: p.startup_name,
    messageCount: p.message_count,
  })), null, 2));
}

main().catch(console.error);
