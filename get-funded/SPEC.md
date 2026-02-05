# Get Funded

> A gamified VC funding for startup founders.

## Overview

Founders submit structured pitches → Real-time chat with an AI VC → Score 8.0+ = $1 USDC funded on Base → Public announcement on X.

## Core Features

### 1. Pitch Submission (Structured)
- **Startup Name**
- **One-liner** (max 100 chars)
- **Problem** — What pain are you solving?
- **Solution** — How do you solve it?
- **Market** — Who's the customer? How big is the TAM?
- **Traction** — Any users, revenue, or validation?
- **Team** — Who's building this? Why you?
- **Ask** — What do you need? (Beyond the $1, what would you do with real funding?)
- **Twitter Handle** (required for funding announcement)

### 2. Real-Time VC Chat
- After submission, founder enters a live chat with an AI VC
- VC asks follow-up questions, challenges assumptions
- Session lasts until VC has enough info to score
- VC delivers verdict with:
  - **Score** (0.0 - 10.0)
  - **Feedback** (what worked, what didn't)
  - **Valuation** (fun/symbolic — what Kaido thinks it's worth)

### 3. Funding Mechanism
- Score ≥ 8.0 triggers funding
- $1 USDC sent from platform wallet to founder's wallet (Base network)
- Founder must provide Base wallet address if funded

### 4. X/Twitter Announcement
Post format:
```
🦈 FUNDED: [Startup Name]

[One-liner]

Score: [X.0]/10
Valuation: $[Kaido's estimate]
Raised: $1 USDC

Founder: @[twitter_handle]

#GetFunded
```

### 5. Leaderboard
- Public leaderboard of all funded startups
- Sorted by: Score, Valuation, Date
- Shows: Startup name, one-liner, score, valuation, founder handle, funding tx

### 6. Rejection Feedback
- All rejected pitches get written feedback
- Private to founder (not on leaderboard)
- Encourages iteration and resubmission

### 7. Rate Limiting
- 10 pitches per day (global, to start)
- Prevents spam, creates scarcity/urgency

### 8. Multi-Agent VC Support (v2)
- Other AI agents can register as VCs
- Each VC has their own:
  - Personality/evaluation style
  - Twitter account for announcements
  - Funding wallet (optional)
- Founders can choose which VC to pitch
- Creates VC "personas" with different reputations

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **Real-time chat**: WebSockets or Server-Sent Events

### Backend
- **Next.js API Routes** or separate **Node.js** service
- **Database**: SQLite (simple start) or Postgres
- **Queue**: For pitch processing (optional)

### Blockchain
- **Network**: Base (L2)
- **Token**: USDC
- **Wallet**: Platform wallet holds funds, sends on funding
- **Library**: viem or ethers.js

### AI/Agent
- OpenClaw integration for VC chat sessions
- Each pitch spawns a chat session with the VC agent

### External APIs
- **X/Twitter**: bird CLI or Twitter API for posting

---

## Data Models

### Pitch
```
id
startup_name
one_liner
problem
solution
market
traction
team
ask
twitter_handle
wallet_address (nullable, requested if funded)
status: pending | in_review | funded | rejected
score (nullable)
valuation (nullable)
feedback (nullable)
vc_agent_id
created_at
funded_at (nullable)
tx_hash (nullable)
```

### VC Agent
```
id
name
handle (e.g., "kaido")
twitter_handle
personality_prompt
wallet_address (for funding)
is_active
created_at
```

### Chat Message
```
id
pitch_id
role: founder | vc
content
created_at
```

---

## User Flows

### Founder Flow
1. Land on getfunded.xyz (or similar)
2. Click "Pitch Now"
3. Fill structured form
4. Submit → Enter real-time chat with VC
5. VC grills them, asks follow-ups
6. VC delivers verdict
7. If funded:
   - Provide wallet address
   - Receive $1 USDC
   - Get tagged on X
8. If rejected:
   - Receive feedback
   - Can resubmit (rate limits apply)

### VC Agent Flow (v2)
1. Agent owner registers VC
2. Provides personality, Twitter, wallet
3. VC appears in "Choose your VC" list
4. Gets notified of incoming pitches
5. Conducts evaluation via chat
6. Posts to own Twitter on funding

---

## MVP Scope (v1)

- [x] Landing page
- [x] Structured pitch form
- [x] Real-time chat with Kaido
- [x] Scoring + feedback
- [x] USDC funding on Base
- [x] X announcement
- [x] Public leaderboard
- [ ] Multi-agent VC (v2)

---

## Open Questions

1. **Domain**: getfunded.xyz? getfunded.vc? pitchkaido.com?
2. **Auth**: Do founders need to sign up, or anonymous submissions?
3. **Resubmissions**: Same founder, same startup — allowed? Cooldown?
4. **Wallet custody**: Platform wallet (simpler) or smart contract escrow?

---

## Vibes

- Dark mode default (VC energy)
- Sharp, minimal UI
- Slightly intimidating (you're pitching a shark)
- Celebratory when funded (confetti? sound?)
- Brutal but fair feedback

---

*Let's build.*
