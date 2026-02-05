"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  role: "vc" | "founder";
  content: string;
  timestamp: Date;
}

interface Verdict {
  score: number;
  valuation: string;
  feedback: string;
  funded: boolean;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const pitchId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmittingWallet, setIsSubmittingWallet] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load - get pitch details and start conversation
  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await fetch(`/api/pitch/${pitchId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start" }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Failed to init chat:", error);
      }
    };
    
    initChat();
  }, [pitchId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "founder",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`/api/pitch/${pitchId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "message", content: input }),
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.message) {
          const vcMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "vc",
            content: data.message,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, vcMessage]);
        }

        if (data.verdict) {
          setVerdict(data.verdict);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const submitWallet = async () => {
    if (!walletAddress.trim()) return;
    setIsSubmittingWallet(true);

    try {
      const res = await fetch(`/api/pitch/${pitchId}/fund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/pitch/${pitchId}/funded?tx=${data.txHash}`);
      } else {
        alert("Failed to process funding. Please try again.");
      }
    } catch (error) {
      console.error("Failed to submit wallet:", error);
      alert("Something went wrong.");
    } finally {
      setIsSubmittingWallet(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            🦈 Get Claw Funded
          </Link>
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Live Session
          </Badge>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="flex-1 pt-20 pb-32">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "founder" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className={message.role === "vc" ? "bg-zinc-800" : "bg-blue-900"}>
                    <AvatarFallback>
                      {message.role === "vc" ? "🦈" : "👤"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "vc"
                        ? "bg-zinc-900 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="bg-zinc-800">
                    <AvatarFallback>🦈</AvatarFallback>
                  </Avatar>
                  <div className="bg-zinc-900 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Verdict Card */}
          {verdict && (
            <Card className={`mt-6 ${verdict.funded ? "bg-green-950 border-green-800" : "bg-zinc-900 border-zinc-800"}`}>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{verdict.funded ? "🎉" : "😤"}</div>
                  <h2 className="text-2xl font-bold text-white">
                    {verdict.funded ? "FUNDED!" : "NOT THIS TIME"}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-black/30 rounded-lg">
                    <div className="text-3xl font-bold text-white">{verdict.score.toFixed(1)}</div>
                    <div className="text-zinc-400 text-sm">Score</div>
                  </div>
                  <div className="text-center p-3 bg-black/30 rounded-lg">
                    <div className="text-xl font-bold text-white">{verdict.valuation}</div>
                    <div className="text-zinc-400 text-sm">Kaido's Valuation</div>
                  </div>
                </div>

                <div className="p-3 bg-black/30 rounded-lg mb-4">
                  <h3 className="font-semibold text-white mb-2">Feedback</h3>
                  <p className="text-zinc-300 text-sm whitespace-pre-wrap">{verdict.feedback}</p>
                </div>

                {verdict.funded && (
                  <div className="border-t border-green-800 pt-4">
                    <h3 className="font-semibold text-white mb-2">Claim Your $1 USDC</h3>
                    <p className="text-zinc-400 text-sm mb-3">
                      Enter your Base wallet address to receive your funding:
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="0x..."
                        className="bg-black/50 border-green-800 text-white"
                      />
                      <Button
                        onClick={submitWallet}
                        disabled={isSubmittingWallet || !walletAddress}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSubmittingWallet ? "Sending..." : "Claim"}
                      </Button>
                    </div>
                  </div>
                )}

                {!verdict.funded && (
                  <div className="text-center pt-4">
                    <Link href="/pitch">
                      <Button variant="outline" className="border-zinc-700">
                        Try Again
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Input Area */}
      {!verdict && (
        <div className="fixed bottom-0 w-full bg-black border-t border-zinc-800">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                disabled={isLoading}
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-white text-black hover:bg-zinc-200"
              >
                Send
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-2 text-center">
              Be concise. Defend your assumptions. Don't BS.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
