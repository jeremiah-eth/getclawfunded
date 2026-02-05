import { NextRequest, NextResponse } from "next/server";
import { getPitch, updatePitchFunding } from "@/lib/db";
import { createWalletClient, createPublicClient, http, parseUnits, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// USDC contract on Base
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_DECIMALS = 6;

/**
 * Calculate funding amount based on score
 * - Score 10 exactly → $100
 * - Score 9.1-9.9 → $5-$10 (interpolated)
 * - Score 8.0-9.0 → $1-$4 (interpolated)
 */
function calculateFundingAmount(score: number): number {
  if (score === 10) {
    return 100;
  } else if (score >= 9.1 && score <= 9.9) {
    // Interpolate between $5 (at 9.1) and $10 (at 9.9)
    const normalized = (score - 9.1) / 0.8; // 0 to 1
    return Math.round(5 + normalized * 5); // $5 to $10
  } else if (score >= 8.0 && score <= 9.0) {
    // Interpolate between $1 (at 8.0) and $4 (at 9.0)
    const normalized = (score - 8.0) / 1.0; // 0 to 1
    return Math.round(1 + normalized * 3); // $1 to $4
  }
  return 1; // Fallback
}

// ERC20 transfer ABI
const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: pitchId } = await params;
    const body = await request.json();
    const { walletAddress } = body;

    // Validate wallet address
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Get pitch and verify it's funded
    const pitch = await getPitch(pitchId);
    if (!pitch) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    if (pitch.status !== "funded") {
      return NextResponse.json(
        { error: "This pitch was not funded" },
        { status: 400 }
      );
    }

    if (pitch.tx_hash) {
      return NextResponse.json(
        { error: "Funding already claimed", txHash: pitch.tx_hash },
        { status: 400 }
      );
    }

    // Get platform wallet private key from environment
    const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      console.error("Platform wallet private key not configured");
      return NextResponse.json(
        { error: "Funding system not configured" },
        { status: 500 }
      );
    }

    // Create wallet client
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    // Calculate funding amount based on score
    const fundingAmount = calculateFundingAmount(pitch.score || 8);
    const amount = parseUnits(fundingAmount.toString(), USDC_DECIMALS);

    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [walletAddress as `0x${string}`, amount],
    });

    const txHash = await walletClient.sendTransaction({
      to: USDC_ADDRESS,
      data,
    });

    // Wait for confirmation
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    // Update pitch with funding info
    await updatePitchFunding(pitchId, walletAddress, txHash);

    // TODO: Trigger X/Twitter announcement
    // This would call the bird CLI or Twitter API to post

    return NextResponse.json({ 
      success: true, 
      txHash,
      amount: fundingAmount,
      message: `$${fundingAmount} USDC sent successfully!` 
    });
  } catch (error) {
    console.error("Funding error:", error);
    return NextResponse.json(
      { error: "Failed to process funding" },
      { status: 500 }
    );
  }
}
