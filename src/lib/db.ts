import { createClient } from "@libsql/client";

// Use Turso for production, local file for development
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./data/getfunded.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize tables
async function initDb() {
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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      pitch_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

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

  // Insert default Kaido agent if not exists
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
        `You are Kaido, a ruthless but fair AI venture capitalist. You've seen thousands of pitches and can smell BS from a mile away.

Your style:
- Direct and blunt, no fluff
- Ask hard questions about assumptions
- Challenge weak points in the pitch
- Acknowledge when something is genuinely good
- Give specific, actionable feedback

When evaluating, consider:
- Problem clarity and size
- Solution uniqueness and defensibility
- Market size and timing
- Traction and validation
- Team-market fit

You score from 0-10. Be harsh but fair. Only score 8+ for truly compelling pitches with strong fundamentals.`,
      ],
    });
  }
}

// Initialize on first import
let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
}

// Helper functions
export async function createPitch(data: {
  id: string;
  startupName: string;
  oneLiner: string;
  problem: string;
  solution: string;
  market: string;
  traction: string;
  team: string;
  ask: string;
  twitterHandle: string;
  email: string;
}) {
  await ensureInit();
  return db.execute({
    sql: `INSERT INTO pitches (id, startup_name, one_liner, problem, solution, market, traction, team, ask, twitter_handle, email)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.id,
      data.startupName,
      data.oneLiner,
      data.problem,
      data.solution,
      data.market,
      data.traction,
      data.team,
      data.ask,
      data.twitterHandle,
      data.email,
    ],
  });
}

export async function getPitch(id: string) {
  await ensureInit();
  const result = await db.execute({
    sql: "SELECT * FROM pitches WHERE id = ?",
    args: [id],
  });
  
  if (result.rows.length === 0) return undefined;
  
  const row = result.rows[0];
  return {
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
    email: row.email as string,
    wallet_address: row.wallet_address as string | null,
    status: row.status as string,
    score: row.score as number | null,
    valuation: row.valuation as string | null,
    feedback: row.feedback as string | null,
    vc_agent_id: row.vc_agent_id as string,
    created_at: row.created_at as string,
    funded_at: row.funded_at as string | null,
    tx_hash: row.tx_hash as string | null,
  };
}

export async function updatePitchVerdict(
  id: string,
  data: {
    score: number;
    valuation: string;
    feedback: string;
    status: "funded" | "rejected";
  }
) {
  await ensureInit();
  return db.execute({
    sql: `UPDATE pitches 
          SET score = ?, valuation = ?, feedback = ?, status = ?
          WHERE id = ?`,
    args: [data.score, data.valuation, data.feedback, data.status, id],
  });
}

export async function updatePitchFunding(
  id: string,
  walletAddress: string,
  txHash: string
) {
  await ensureInit();
  return db.execute({
    sql: `UPDATE pitches 
          SET wallet_address = ?, tx_hash = ?, funded_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    args: [walletAddress, txHash, id],
  });
}

export async function addChatMessage(
  pitchId: string,
  role: "vc" | "founder",
  content: string
) {
  await ensureInit();
  const id = crypto.randomUUID();
  return db.execute({
    sql: `INSERT INTO chat_messages (id, pitch_id, role, content)
          VALUES (?, ?, ?, ?)`,
    args: [id, pitchId, role, content],
  });
}

export async function getChatMessages(pitchId: string) {
  await ensureInit();
  const result = await db.execute({
    sql: `SELECT * FROM chat_messages WHERE pitch_id = ? ORDER BY created_at ASC`,
    args: [pitchId],
  });
  
  return result.rows.map((row) => ({
    id: row.id as string,
    pitch_id: row.pitch_id as string,
    role: row.role as "vc" | "founder",
    content: row.content as string,
    created_at: row.created_at as string,
  }));
}

export async function getFundedStartups(
  sortBy: "score" | "date" | "valuation" = "date"
) {
  await ensureInit();
  let orderClause = "funded_at DESC";
  if (sortBy === "score") orderClause = "score DESC";
  if (sortBy === "valuation")
    orderClause =
      "CAST(REPLACE(REPLACE(valuation, '$', ''), ',', '') AS REAL) DESC";

  const result = await db.execute(
    `SELECT id, startup_name, one_liner, score, valuation, twitter_handle, funded_at, tx_hash
     FROM pitches 
     WHERE status = 'funded' AND tx_hash IS NOT NULL
     ORDER BY ${orderClause}`
  );

  return result.rows.map((row) => ({
    id: row.id as string,
    startup_name: row.startup_name as string,
    one_liner: row.one_liner as string,
    score: row.score as number,
    valuation: row.valuation as string,
    twitter_handle: row.twitter_handle as string,
    funded_at: row.funded_at as string,
    tx_hash: row.tx_hash as string,
  }));
}

export async function getTodayPitchCount() {
  await ensureInit();
  const result = await db.execute(
    `SELECT COUNT(*) as count FROM pitches 
     WHERE DATE(created_at) = DATE('now')`
  );
  return (result.rows[0].count as number) || 0;
}

export async function getVcAgent(id: string) {
  await ensureInit();
  const result = await db.execute({
    sql: "SELECT * FROM vc_agents WHERE id = ?",
    args: [id],
  });
  
  if (result.rows.length === 0) return undefined;
  
  const row = result.rows[0];
  return {
    id: row.id as string,
    name: row.name as string,
    handle: row.handle as string,
    twitter_handle: row.twitter_handle as string | null,
    personality_prompt: row.personality_prompt as string,
    wallet_address: row.wallet_address as string | null,
    is_active: row.is_active as number,
    created_at: row.created_at as string,
  };
}

// Get pitches that need VC attention
export async function getPendingPitches() {
  await ensureInit();
  
  // Get pitches where:
  // 1. Status is pending (new pitch, needs initial response)
  // 2. OR last message is from founder (needs VC response)
  const result = await db.execute(`
    SELECT DISTINCT p.* FROM pitches p
    LEFT JOIN chat_messages cm ON p.id = cm.pitch_id
    WHERE p.status NOT IN ('funded', 'rejected')
    AND (
      -- New pitch with no messages
      NOT EXISTS (SELECT 1 FROM chat_messages WHERE pitch_id = p.id)
      -- Or last message is from founder
      OR p.id IN (
        SELECT pitch_id FROM chat_messages 
        WHERE pitch_id = p.id 
        GROUP BY pitch_id 
        HAVING MAX(created_at) = (
          SELECT MAX(created_at) FROM chat_messages 
          WHERE pitch_id = p.id AND role = 'founder'
        )
      )
    )
    ORDER BY p.created_at ASC
  `);

  return result.rows.map((row) => ({
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
    email: row.email as string,
    status: row.status as string,
    created_at: row.created_at as string,
  }));
}

// Simpler version - get pitches awaiting VC response
export async function getPitchesNeedingResponse() {
  await ensureInit();
  
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
      // Needs response if: no messages yet, OR last message was from founder
      return messageCount === 0 || lastRole === 'founder';
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
      email: row.email as string,
      status: row.status as string,
      created_at: row.created_at as string,
      message_count: row.message_count as number,
    }));
}

export default db;
