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
        "Monitor Compound Governor proposals",
        "Cast votes on active proposals",
        "Queue successful proposals",
        "Execute queued proposals",
      ],
      integrations: {
        envio: "Connected - Real-time governance events",
        lit: "Connected - Delegated transaction execution",
        blockscout: "Connected - Transaction history and verification",
        virtuals: "Active - Agent runtime on Base",
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

