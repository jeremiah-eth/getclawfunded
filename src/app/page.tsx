import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            🦈 Get Claw Funded
          </Link>
          <div className="flex gap-4">
            <Link href="/leaderboard">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                Leaderboard
              </Button>
            </Link>
            <Link href="/pitch">
              <Button className="bg-white text-black hover:bg-zinc-200">
                Pitch Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🦈</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Pitch Your Startup<br />to an AI VC
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Get grilled by Kaido, a ruthless AI venture capitalist. 
            Score 8.0+ and get funded up to $100 USDC on Base. 
            Get roasted either way.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/pitch">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 text-lg px-8 py-6">
                Start Pitching →
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="lg" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-900 text-lg px-8 py-6">
                View Funded Startups
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Submit Your Pitch", desc: "Fill out a structured pitch form with your startup details" },
              { step: "02", title: "Face the Shark", desc: "Enter a live chat where Kaido grills you on your assumptions" },
              { step: "03", title: "Get Your Score", desc: "Receive a score (0-10) and brutally honest feedback" },
              { step: "04", title: "Get Funded", desc: "Score 8.0+ = $1-$100 USDC on Base + announcement on X" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-bold text-zinc-700 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
            <div>
              <div className="text-4xl font-bold text-white mb-2">$1-$100</div>
              <div className="text-zinc-500">Funding per startup</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">8.0+</div>
              <div className="text-zinc-500">Score needed to fund</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">10</div>
              <div className="text-zinc-500">Pitches per day</div>
            </div>
          </div>
          
          {/* Funding Tiers */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-center mb-4">Funding Tiers</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-zinc-800/50">
                <div className="text-2xl font-bold text-white mb-1">$1-$4</div>
                <div className="text-zinc-400 text-sm">Score 8.0 - 9.0</div>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800/50">
                <div className="text-2xl font-bold text-white mb-1">$5-$10</div>
                <div className="text-zinc-400 text-sm">Score 9.1 - 9.9</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400 mb-1">$100</div>
                <div className="text-zinc-400 text-sm">Perfect 10</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Kaido */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Meet Your VC</h2>
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <div className="text-5xl mb-4">🦈</div>
            <h3 className="text-2xl font-bold mb-2">Kaido</h3>
            <p className="text-zinc-400 mb-4">@whistler_agent</p>
            <p className="text-zinc-300 max-w-xl mx-auto">
              "I've seen a thousand pitch decks. I can smell a bad TAM calculation from across the room. 
              I'm direct, I'm blunt, and I don't waste time. But if you've got something real? 
              I'll tell you that too."
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Roasted?</h2>
          <p className="text-zinc-400 mb-8">
            10 spots per day. First come, first served.
          </p>
          <Link href="/pitch">
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 text-lg px-8 py-6">
              Pitch Now →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-zinc-500 text-sm">
          <div>© 2026 Get Claw Funded</div>
          <div className="flex gap-4">
            <a href="https://x.com/whistler_agent" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              X/Twitter
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
