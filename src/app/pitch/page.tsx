"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PitchFormData {
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
}

export default function PitchPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PitchFormData>({
    startupName: "",
    oneLiner: "",
    problem: "",
    solution: "",
    market: "",
    traction: "",
    team: "",
    ask: "",
    twitterHandle: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const { pitchId } = await res.json();
        router.push(`/pitch/${pitchId}/chat`);
      } else {
        alert("Failed to submit pitch. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "startupName", label: "Startup Name", placeholder: "e.g., Acme Inc.", type: "input" },
    { name: "oneLiner", label: "One-Liner", placeholder: "Describe your startup in one sentence (max 100 chars)", type: "input", maxLength: 100 },
    { name: "problem", label: "Problem", placeholder: "What pain are you solving? Who has this problem?", type: "textarea" },
    { name: "solution", label: "Solution", placeholder: "How do you solve it? What makes your approach unique?", type: "textarea" },
    { name: "market", label: "Market", placeholder: "Who's your customer? How big is the TAM? Who are your competitors?", type: "textarea" },
    { name: "traction", label: "Traction", placeholder: "Any users, revenue, waitlist, LOIs? If pre-launch, what validation do you have?", type: "textarea" },
    { name: "team", label: "Team", placeholder: "Who's building this? What's your unfair advantage? Why you?", type: "textarea" },
    { name: "ask", label: "The Ask", placeholder: "Beyond the $1, what would you do with real funding? What's your goal?", type: "textarea" },
  ];

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
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🦈</div>
            <h1 className="text-3xl font-bold mb-2">Submit Your Pitch</h1>
            <p className="text-zinc-400">
              Fill out the form below. Be concise but thorough. Kaido doesn't have patience for fluff.
            </p>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Pitch Details</CardTitle>
              <CardDescription className="text-zinc-400">
                All fields are required. Your Twitter handle will be used for the funding announcement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      {field.label}
                    </label>
                    {field.type === "input" ? (
                      <Input
                        name={field.name}
                        value={formData[field.name as keyof PitchFormData]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        required
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    ) : (
                      <Textarea
                        name={field.name}
                        value={formData[field.name as keyof PitchFormData]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required
                        rows={3}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    )}
                    {field.maxLength && (
                      <div className="text-xs text-zinc-500 mt-1 text-right">
                        {formData[field.name as keyof PitchFormData].length}/{field.maxLength}
                      </div>
                    )}
                  </div>
                ))}

                <div className="border-t border-zinc-800 pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Twitter/X Handle
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-zinc-800 border border-r-0 border-zinc-700 rounded-l-md text-zinc-400">
                        @
                      </span>
                      <Input
                        name="twitterHandle"
                        value={formData.twitterHandle}
                        onChange={handleChange}
                        placeholder="yourhandle"
                        required
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-l-none"
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Required for the funding announcement on X
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="founder@startup.com"
                      required
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      We'll send your feedback here (never shared publicly)
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-white text-black hover:bg-zinc-200 py-6 text-lg"
                  >
                    {isSubmitting ? "Submitting..." : "Submit & Enter the Shark Tank →"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-zinc-500 text-sm mt-6">
            By submitting, you agree that your pitch may be discussed publicly if funded.
            Rejected pitches remain private.
          </p>
        </div>
      </div>
    </main>
  );
}
