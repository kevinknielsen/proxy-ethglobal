/**
 * Virtuals Agent Webhook Handler
 * Receives notifications and commands from the Virtuals agent
 */

import { NextRequest, NextResponse } from "next/server";
import { VirtualsWebhookPayload } from "@/types/governance";
import { litService } from "@/lib/lit";
import { virtualsService } from "@/lib/virtuals";

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (in production)
    const webhookSecret = process.env.VIRTUALS_WEBHOOK_SECRET;
    const signature = request.headers.get("x-virtuals-signature");

    // For demo, we skip verification
    // if (!verifySignature(signature, webhookSecret, body)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const payload: VirtualsWebhookPayload = await request.json();

    console.log("📥 Received webhook from Virtuals agent:", payload.type);

    // Handle different webhook types
    switch (payload.type) {
      case "governance_update":
        // Agent is notifying us about governance state changes
        console.log(
          `📊 Governance update: ${payload.data.proposals?.length} proposals`
        );
        break;

      case "execute_action":
        // Agent wants us to execute a governance action
        const action = payload.data.action;
        if (!action) {
          return NextResponse.json(
            { error: "No action specified" },
            { status: 400 }
          );
        }

        console.log(`⚡ Executing action: ${action.type} for proposal ${action.proposalId}`);

        let txHash: string | undefined;

        switch (action.type) {
          case "vote":
            // Default to voting FOR (support = 1)
            txHash = await litService.castVote(action.proposalId, 1);
            break;

          case "queue":
            txHash = await litService.queueProposal(action.proposalId);
            break;

          case "execute":
            txHash = await litService.executeProposal(action.proposalId);
            break;
        }

        // Log the action back to the agent
        await virtualsService.logAction({
          ...action,
          txHash,
          status: "success",
        });

        return NextResponse.json({
          success: true,
          txHash,
          action: action.type,
        });

      default:
        console.log(`⚠️  Unknown webhook type: ${payload.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling Virtuals webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "Virtuals Webhook Handler",
    status: "active",
    timestamp: new Date().toISOString(),
  });
}

