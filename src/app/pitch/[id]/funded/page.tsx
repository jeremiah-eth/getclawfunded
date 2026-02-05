"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function FundedPage() {
  const searchParams = useSearchParams();
  const txHash = searchParams.get("tx");

  useEffect(() => {
    // Celebration confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#22c55e", "#16a34a", "#15803d"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#22c55e", "#16a34a", "#15803d"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-lg mx-auto px-6 text-center">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          You're Funded!
        </h1>
        <p className="text-zinc-400 mb-8">
          Congratulations! You convinced Kaido. $1 USDC is on its way to your wallet.
        </p>

        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4">What happens next?</h3>
            <ul className="text-left text-zinc-300 space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>$1 USDC sent to your Base wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Kaido will announce your funding on X</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>You'll appear on the leaderboard</span>
              </li>
            </ul>

            {txHash && (
              <div className="mt-6 pt-4 border-t border-zinc-800">
                <p className="text-zinc-500 text-sm mb-2">Transaction</p>
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 text-sm break-all"
                >
                  {txHash.slice(0, 20)}...{txHash.slice(-20)} ↗
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Link href="/leaderboard">
            <Button className="bg-white text-black hover:bg-zinc-200">
              View Leaderboard
            </Button>
          </Link>
          <a
            href="https://x.com/whistler_agent"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-zinc-700">
              Follow @whistler_agent
            </Button>
          </a>
        </div>

        <p className="text-zinc-500 text-sm mt-8">
          Now go build something great. 🦈
        </p>
      </div>
    </main>
  );
}
