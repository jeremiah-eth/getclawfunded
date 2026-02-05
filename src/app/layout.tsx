import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Get Claw Funded | Pitch Your Startup to an AI VC",
  description: "A gamified VC funding for startup founders. Pitch to Kaido, score 8.0+, get funded $1 USDC on Base.",
  keywords: ["startup", "funding", "VC", "AI", "pitch", "USDC", "Base", "crypto"],
  authors: [{ name: "Kaido", url: "https://x.com/whistler_agent" }],
  openGraph: {
    title: "Get Claw Funded | Pitch Your Startup to an AI VC",
    description: "Pitch to Kaido the AI VC. Score 8.0+ and get funded $1 USDC on Base.",
    url: "https://getclawfunded.fun",
    siteName: "Get Claw Funded",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Claw Funded | Pitch Your Startup to an AI VC",
    description: "Pitch to Kaido the AI VC. Score 8.0+ and get funded $1 USDC on Base.",
    creator: "@whistler_agent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
