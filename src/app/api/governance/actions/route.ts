/**
 * Governance Actions API
 * Handles vote, queue, and execute actions
 */

import { NextRequest, NextResponse } from "next/server";
import { litService } from "@/lib/lit";
import { virtualsService } from "@/lib/virtuals";
import { GovernanceAction } from "@/types/governance";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, proposalId, support } = body;

    if (!action || !proposalId) {
      return NextResponse.json(
        { error: "Missing required fields: action, proposalId" },
        { status: 400 }
      );
    }

    console.log(`🎯 Processing governance action: ${action} for proposal ${proposalId}`);

    let txHash: string;
    const proposalIdBigInt = BigInt(proposalId);

    switch (action) {
      case "vote":
        if (support === undefined) {
          return NextResponse.json(
            { error: "Missing support parameter for vote action" },
            { status: 400 }
          );
        }
        txHash = await litService.castVote(proposalIdBigInt, support);
        break;

      case "queue":
        txHash = await litService.queueProposal(proposalIdBigInt);
        break;

      case "execute":
        txHash = await litService.executeProposal(proposalIdBigInt);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // Log the action to Virtuals agent
    const governanceAction: GovernanceAction = {
      type: action,
      proposalId: proposalIdBigInt,
      timestamp: new Date(),
      txHash,
      status: "success",
    };

    await virtualsService.logAction(governanceAction);

    return NextResponse.json({
      success: true,
      action,
      proposalId,
      txHash,
      message: `Successfully ${action}ed proposal ${proposalId}`,
    });
  } catch (error) {
    console.error("Error executing governance action:", error);
    return NextResponse.json(
      { error: "Failed to execute action" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "Governance Actions API",
    availableActions: ["vote", "queue", "execute"],
    parameters: {
      vote: ["proposalId", "support (0=against, 1=for, 2=abstain)"],
      queue: ["proposalId"],
      execute: ["proposalId"],
    },
  });
}

