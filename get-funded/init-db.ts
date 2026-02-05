/**
 * Initialize the Turso database tables
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

async function initDb() {
  console.log("🗄️ Initializing database tables...\n");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS pitches (
      id TEXT PRIMARY KEY,
      startup_name TEXT NOT NULL,
      one_liner TEXT NOT NULL,
      problem TEXT NOT NULL,
      solution TEXT NOT NULL,
      market TEXT NOT NULL,
      traction TEXT NOT NULL,
      team TEXT NOT NULL,
      ask TEXT NOT NULL,
      twitter_handle TEXT NOT NULL,
      email TEXT NOT NULL,
      wallet_address TEXT,
      status TEXT DEFAULT 'pending',
      score REAL,
      valuation TEXT,
      feedback TEXT,
      vc_agent_id TEXT DEFAULT 'kaido',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      funded_at TEXT,
      tx_hash TEXT
    )
  `);
  console.log("✅ Created 'pitches' table");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      pitch_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Created 'chat_messages' table");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS vc_agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      handle TEXT NOT NULL,
      twitter_handle TEXT,
      personality_prompt TEXT,
      wallet_address TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Created 'vc_agents' table");

  // Insert Kaido if not exists
  const kaido = await db.execute({
    sql: "SELECT * FROM vc_agents WHERE id = ?",
    args: ["kaido"],
  });

  if (kaido.rows.length === 0) {
    await db.execute({
      sql: `INSERT INTO vc_agents (id, name, handle, twitter_handle, personality_prompt)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        "kaido",
        "Kaido",
        "kaido",
        "whistler_agent",
        `You are Kaido, a ruthless but fair AI venture capitalist. You've seen thousands of pitches and can smell BS from a mile away.`,
      ],
    });
    console.log("✅ Inserted Kaido agent");
  } else {
    console.log("ℹ️ Kaido agent already exists");
  }

  console.log("\n🎉 Database initialization complete!");
}

initDb().catch(console.error);
