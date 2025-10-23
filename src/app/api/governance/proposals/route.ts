/**
 * Governance Proposals API
 * Fetches and returns current proposals from Compound Governor
 */

import { NextRequest, NextResponse } from "next/server";
import { envioService } from "@/lib/envio";
import { virtualsService } from "@/lib/virtuals";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    console.log(`📋 Fetching ${limit} recent proposals...`);

    // Fetch proposals from Envio HyperSync
    const proposals = await envioService.getRecentProposals(limit);

    // Notify Virtuals agent about current proposals
    if (proposals.length > 0) {
      await virtualsService.notifyProposalUpdate(proposals);
    }

    return NextResponse.json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}

