/**
 * Governance Proposals API
 * Fetches and returns current proposals from Compound Governor
 */

import { NextRequest, NextResponse } from "next/server";
import { envioService } from "@/lib/envio";
import { virtualsService } from "@/lib/virtuals";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    console.log(`📋 Fetching ${limit} recent proposals...`);

    // Fetch proposals from Envio HyperSync
    const proposals = await envioService.getRecentProposals(limit);

    // Notify Virtuals agent about current proposals (non-blocking)
    if (proposals.length > 0) {
      virtualsService.notifyProposalUpdate(proposals).catch((err) => {
        console.error("Error notifying Virtuals (non-critical):", err);
      });
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedProposals = proposals.map((p) => ({
      ...p,
      proposalId: p.proposalId.toString(),
      startBlock: p.startBlock.toString(),
      endBlock: p.endBlock.toString(),
      forVotes: p.forVotes?.toString() || "0",
      againstVotes: p.againstVotes?.toString() || "0",
      abstainVotes: p.abstainVotes?.toString() || "0",
    }));

    return NextResponse.json({
      success: true,
      count: serializedProposals.length,
      proposals: serializedProposals,
    });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "");
    
    return NextResponse.json(
      { 
        error: "Failed to fetch proposals",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

