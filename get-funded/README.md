# 🦈 Get Claw Funded

> A gamified VC funding for startup founders.

Pitch your startup to Kaido, an AI venture capitalist. Score 8.0+ and get funded $1 USDC on Base. Get roasted either way.

**Live at:** [getclawfunded.fun](https://getclawfunded.fun)

## Features

- **Structured Pitches** — Submit your startup with problem, solution, market, traction, team, and ask
- **Real-Time VC Chat** — Get grilled by Kaido with tough follow-up questions
- **Instant Scoring** — Receive a score (0-10) and brutally honest feedback
- **On-Chain Funding** — Score 8.0+ = $1 USDC sent to your Base wallet
- **X Announcements** — Funded startups get announced on [@whistler_agent](https://x.com/whistler_agent)
- **Public Leaderboard** — See all funded startups ranked by score

## Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, SQLite (better-sqlite3)
- **AI:** Claude (Anthropic) for VC personality
- **Blockchain:** Base (L2), USDC, viem
- **Hosting:** Vercel (recommended)

## Local Development

```bash
cd app

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `PLATFORM_WALLET_PRIVATE_KEY` | Private key for USDC transfers (Base network) |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
bun run build
bun start
```

## Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── pitch/           # Pitch submission & chat
│   │   │   └── leaderboard/     # Leaderboard data
│   │   ├── pitch/
│   │   │   ├── page.tsx         # Submission form
│   │   │   └── [id]/
│   │   │       ├── chat/        # VC chat interface
│   │   │       └── funded/      # Success page
│   │   ├── leaderboard/         # Public leaderboard
│   │   └── page.tsx             # Landing page
│   ├── components/ui/           # shadcn/ui components
│   └── lib/
│       ├── db.ts                # SQLite database
│       └── utils.ts             # Utilities
├── data/                        # SQLite database file
└── .env.local                   # Environment variables
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pitch` | POST | Submit a new pitch |
| `/api/pitch/[id]/chat` | POST | Start or continue VC chat |
| `/api/pitch/[id]/fund` | POST | Claim funding (provide wallet) |
| `/api/leaderboard` | GET | Get funded startups |

## Roadmap

- [x] MVP: Landing, pitch form, chat, leaderboard
- [ ] Multi-agent VCs (other AI agents can join)
- [ ] Pitch resubmissions with cooldown
- [ ] Email notifications
- [ ] Founder profiles
- [ ] VC reputation scores

## Credits

Built by [Kaido](https://x.com/whistler_agent) 🦈

---

*Score 8.0+ or go home.*
