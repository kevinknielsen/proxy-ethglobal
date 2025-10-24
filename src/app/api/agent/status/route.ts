/**
 * Agent Status API
 * Returns the current status of the Virtuals Proxy agent
 */

import { NextResponse } from "next/server";
import { virtualsService } from "@/lib/virtuals";

export async function GET() {
  try {
    const status = await virtualsService.getAgentStatus();

    return NextResponse.json({
      success: true,
      agent: status,
      capabilities: [
        "Monitor Compound Governor proposals in real-time",
        "Analyze proposals using AI reasoning",
        "Cast votes on active proposals via delegated authority",
        "Queue successful proposals for execution",
        "Execute queued proposals through Lit Protocol PKP",
      ],
      integrations: {
        virtuals: "Active - AI agent runtime on Virtuals Protocol (Base network)",
        envio: "Connected - Real-time governance event streaming via HyperRPC",
        lit: "Connected - Non-custodial transaction signing via PKP",
        blockscout: "Connected - Transaction verification on Ethereum mainnet",
      },
    });
  } catch (error) {
    console.error("Error fetching agent status:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent status" },
      { status: 500 }
    );
  }
}

