/**
 * Kaido Response Script
 * 
 * Send a message to a pitch as Kaido.
 * 
 * Usage: 
 *   bun run respond.ts <pitch_id> "<message>"
 *   bun run respond.ts <pitch_id> --verdict <score> "<valuation>" "<feedback>"
 */

import { createClient } from "@libsql/client";

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

async function addMessage(pitchId: string, content: string) {
  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO chat_messages (id, pitch_id, role, content) VALUES (?, ?, ?, ?)",
    args: [id, pitchId, "vc", content],
  });
  console.log(`✅ Message sent to pitch ${pitchId}`);
}

async function setVerdict(pitchId: string, score: number, valuation: string, feedback: string) {
  const status = score >= 8.0 ? "funded" : "rejected";
  
  await db.execute({
    sql: "UPDATE pitches SET score = ?, valuation = ?, feedback = ?, status = ? WHERE id = ?",
    args: [score, valuation, feedback, status, pitchId],
  });
  
  console.log(`✅ Verdict set for pitch ${pitchId}`);
  console.log(`   Score: ${score}`);
  console.log(`   Status: ${status}`);
  console.log(`   Valuation: ${valuation}`);
}

async function getPitchInfo(pitchId: string) {
  const result = await db.execute({
    sql: "SELECT startup_name, twitter_handle, status FROM pitches WHERE id = ?",
    args: [pitchId],
  });
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return {
    name: result.rows[0].startup_name as string,
    twitter: result.rows[0].twitter_handle as string,
    status: result.rows[0].status as string,
  };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage:
  bun run respond.ts <pitch_id> "<message>"
  bun run respond.ts <pitch_id> --verdict <score> "<valuation>" "<feedback>"
  
Examples:
  bun run respond.ts abc123 "What's your current MRR?"
  bun run respond.ts abc123 --verdict 8.5 "$500K" "Strong team, clear problem, but need more traction"
    `);
    process.exit(1);
  }
  
  const pitchId = args[0];
  
  // Check pitch exists
  const pitch = await getPitchInfo(pitchId);
  if (!pitch) {
    console.error(`❌ Pitch not found: ${pitchId}`);
    process.exit(1);
  }
  
  console.log(`\n🎯 Pitch: ${pitch.name} (@${pitch.twitter})`);
  console.log(`   Status: ${pitch.status}\n`);
  
  if (args[1] === "--verdict") {
    if (args.length < 5) {
      console.error("❌ Verdict requires: <score> <valuation> <feedback>");
      process.exit(1);
    }
    
    const score = parseFloat(args[2]);
    const valuation = args[3];
    const feedback = args[4];
    
    if (isNaN(score) || score < 0 || score > 10) {
      console.error("❌ Score must be between 0 and 10");
      process.exit(1);
    }
    
    await setVerdict(pitchId, score, valuation, feedback);
  } else {
    const message = args.slice(1).join(" ");
    await addMessage(pitchId, message);
  }
}

main().catch(console.error);
