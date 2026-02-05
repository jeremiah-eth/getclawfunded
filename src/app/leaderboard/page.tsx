"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FundedStartup {
  id: string;
  startupName: string;
  oneLiner: string;
  score: number;
  valuation: string;
  twitterHandle: string;
  fundedAt: string;
  txHash: string;
}

export default function LeaderboardPage() {
  const [startups, setStartups] = useState<FundedStartup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"score" | "date" | "valuation">("date");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`/api/leaderboard?sort=${sortBy}`);
        if (res.ok) {
          const data = await res.json();
          setStartups(data.startups || []);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sortBy]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            🦈 Get Claw Funded
          </Link>
          <div className="flex gap-4">
            <Link href="/pitch">
              <Button className="bg-white text-black hover:bg-zinc-200">
                Pitch Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
            <p className="text-zinc-400">
              Startups that convinced Kaido. Score 8.0+ = Funded.
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { value: "date", label: "Newest" },
              { value: "score", label: "Highest Score" },
              { value: "valuation", label: "Highest Valuation" },
            ].map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? "default" : "outline"}
                onClick={() => setSortBy(option.value as typeof sortBy)}
                className={
                  sortBy === option.value
                    ? "bg-white text-black"
                    : "border-zinc-700 text-zinc-400 hover:text-white"
                }
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Startups List */}
          {isLoading ? (
            <div className="text-center text-zinc-500 py-12">Loading...</div>
          ) : startups.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-4">🦈</div>
                <h3 className="text-xl font-semibold mb-2">No funded startups yet</h3>
                <p className="text-zinc-400 mb-6">
                  Be the first to convince Kaido your startup is worth backing.
                </p>
                <Link href="/pitch">
                  <Button className="bg-white text-black hover:bg-zinc-200">
                    Submit Your Pitch
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {startups.map((startup, index) => (
                <Card key={startup.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl font-bold text-zinc-700 w-12">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {startup.startupName}
                          </h3>
                          <p className="text-zinc-400 text-sm mb-3">
                            {startup.oneLiner}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-green-900 text-green-300">
                              Score: {startup.score.toFixed(1)}
                            </Badge>
                            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                              {startup.valuation}
                            </Badge>
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                              {formatDate(startup.fundedAt)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <a
                          href={`https://x.com/${startup.twitterHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          @{startup.twitterHandle}
                        </a>
                        <div className="mt-2">
                          <a
                            href={`https://basescan.org/tx/${startup.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-500 hover:text-zinc-400"
                          >
                            View Tx ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Stats */}
          {startups.length > 0 && (
            <div className="mt-12 grid grid-cols-3 gap-4 text-center">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">{startups.length}</div>
                  <div className="text-zinc-500 text-sm">Funded</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">
                    ${startups.length}
                  </div>
                  <div className="text-zinc-500 text-sm">Total Raised</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-white">
                    {(startups.reduce((acc, s) => acc + s.score, 0) / startups.length).toFixed(1)}
                  </div>
                  <div className="text-zinc-500 text-sm">Avg Score</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

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
