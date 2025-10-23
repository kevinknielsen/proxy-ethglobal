/**
 * Governance State API
 * Returns the current state of a proposal
 */

import { NextRequest, NextResponse } from "next/server";
import { litService } from "@/lib/lit";
import { ProposalState } from "@/types/governance";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const proposalId = searchParams.get("proposalId");

    if (!proposalId) {
      return NextResponse.json(
        { error: "Missing proposalId parameter" },
        { status: 400 }
      );
    }

    const state = await litService.getProposalState(BigInt(proposalId));

    const stateNames = [
      "Pending",
      "Active",
      "Canceled",
      "Defeated",
      "Succeeded",
      "Queued",
      "Expired",
      "Executed",
    ];

    return NextResponse.json({
      success: true,
      proposalId,
      state,
      stateName: stateNames[state] || "Unknown",
    });
  } catch (error) {
    console.error("Error fetching proposal state:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal state" },
      { status: 500 }
    );
  }
}

