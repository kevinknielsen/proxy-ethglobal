/**
 * Virtuals Agent Integration
 * Handles communication with the Proxy agent on Virtuals
 */

import axios from "axios";
import { Proposal, GovernanceAction } from "@/types/governance";

const VIRTUALS_API_BASE = "https://api.virtuals.io/api";

export class VirtualsService {
  private agentId: string;
  private apiKey: string;

  constructor() {
    this.agentId = process.env.VIRTUALS_AGENT_ID || "15865";
    this.apiKey = process.env.VIRTUALS_API_KEY || "";
    
    if (this.apiKey) {
      console.log(`✅ Virtuals agent configured (ID: ${this.agentId})`);
    } else {
      console.log("ℹ️ VIRTUALS_API_KEY not set, using demo decision logic");
    }
  }

  /**
   * Send governance update to Virtuals agent via GAME API
   */
  async notifyProposalUpdate(proposals: Proposal[]): Promise<void> {
    try {
      const summary = this.generateProposalSummary(proposals);

      console.log(`📡 Notifying Virtuals GAME agent about ${proposals.length} proposal(s)`);
      console.log(`Summary: ${summary}`);

      // Send to Virtuals API if available
      if (this.apiKey) {
        try {
          const payload = {
            type: "governance_update",
            agentId: this.agentId,
            message: summary,
            proposals: proposals.map((p) => ({
              id: p.id,
              state: p.state,
              description: p.description.slice(0, 200),
            })),
            timestamp: new Date().toISOString(),
          };

          // Send notification to Virtuals API
          await axios.post(`${VIRTUALS_API_BASE}/agents/${this.agentId}/notify`, payload, {
            headers: { 
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          });

          console.log("✅ Virtuals agent notified via API");
        } catch (apiError) {
          console.warn("⚠️ API notification failed (non-critical):", apiError);
        }
      } else {
        console.log("ℹ️ API key not available, skipping notification");
      }
    } catch (error) {
      console.error("Error notifying Virtuals agent:", error);
    }
  }

  /**
   * Request agent decision on governance action using GAME AI
   */
  async requestDecision(
    proposal: Proposal
  ): Promise<{ action: string; reason: string }> {
    try {
      console.log(`🤔 Asking Virtuals agent for decision on proposal ${proposal.id}`);

      // If API key is available, call Virtuals API for AI decision
      if (this.apiKey) {
        try {
          const stateNames = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];
          const stateName = stateNames[proposal.state] || "Unknown";
          
          // Call Virtuals API for AI decision
          const response = await axios.post(
            `${VIRTUALS_API_BASE}/agents/${this.agentId}/decide`,
            {
              goal: "Maximize protocol value and governance participation for Compound",
              state: {
                proposalId: proposal.id,
                description: proposal.description.slice(0, 500),
                state: stateName,
                forVotes: proposal.forVotes?.toString() || "0",
                againstVotes: proposal.againstVotes?.toString() || "0",
                abstainVotes: proposal.abstainVotes?.toString() || "0",
                proposer: proposal.proposer,
              },
              actions: ['vote_for', 'vote_against', 'abstain', 'queue', 'execute', 'monitor'],
              context: `Analyzing Compound governance proposal ${proposal.id}. Current state: ${stateName}. Make a decision based on proposal content, voting statistics, and what benefits the protocol.`,
            },
            {
              headers: { 
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const decision = response.data;
          console.log(`🤖 Virtuals AI decision:`, decision);
          
          // Map decision to our action format
          const actionMap: Record<string, string> = {
            'vote_for': 'vote',
            'vote_against': 'vote',
            'abstain': 'vote',
            'queue': 'queue',
            'execute': 'execute',
            'monitor': 'monitor',
          };

          return {
            action: actionMap[decision.action] || 'monitor',
            reason: decision.reasoning || decision.reason || "AI-powered decision",
          };
        } catch (apiError) {
          console.warn("⚠️ Virtuals API error, using fallback logic:", apiError);
        }
      }

      // Fallback: Simple state-based logic
      let action = "monitor";
      let reason = "Monitoring proposal progress";

      if (proposal.state === 4) {
        // Succeeded
        action = "queue";
        reason = "Proposal succeeded and should be queued for execution";
      } else if (proposal.state === 5) {
        // Queued
        action = "execute";
        reason = "Proposal is queued and timelock has passed";
      } else if (proposal.state === 1) {
        // Active
        action = "vote";
        reason = "Proposal is active and requires voting";
      }

      console.log(`💡 Agent decision (fallback logic): ${action} - ${reason}`);

      return { action, reason };
    } catch (error) {
      console.error("Error requesting agent decision:", error);
      return { action: "monitor", reason: "Error occurred" };
    }
  }

  /**
   * Log action execution to Virtuals GAME agent
   */
  async logAction(action: GovernanceAction): Promise<void> {
    try {
      console.log(`📝 Logging action to Virtuals GAME agent:`, action);

      if (this.apiKey) {
        try {
          const payload = {
            type: "action_executed",
            agentId: this.agentId,
            action: {
              type: action.type,
              proposalId: action.proposalId.toString(),
              txHash: action.txHash,
              status: action.status,
            },
            timestamp: new Date().toISOString(),
          };

          await axios.post(`${VIRTUALS_API_BASE}/agents/${this.agentId}/log`, payload, {
            headers: { 
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          });

          console.log("✅ Action logged to Virtuals GAME agent");
        } catch (apiError) {
          console.warn("⚠️ API log failed (non-critical):", apiError);
        }
      }
    } catch (error) {
      console.error("Error logging action:", error);
    }
  }

  /**
   * Generate human-readable proposal summary
   */
  private generateProposalSummary(proposals: Proposal[]): string {
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

    const summary = proposals
      .map((p) => {
        const state = stateNames[p.state] || "Unknown";
        return `Proposal ${p.id}: ${state}`;
      })
      .join("; ");

    return summary;
  }

  /**
   * Get agent status and identity
   */
  async getAgentStatus(): Promise<{
    id: string;
    name: string;
    status: string;
    lastActive: string;
    walletAddress: string;
    platform: string;
    virtualsUrl: string;
  }> {
    const agentId = this.agentId || "15865";
    const walletAddress = process.env.NEXT_PUBLIC_PROXY_AGENT_ADDRESS || "0xA736A27F53ADB6536C20f81D254Fa6cDfd79B37a";
    
    return {
      id: agentId,
      name: "Proxy Governance Agent",
      status: "active",
      lastActive: new Date().toISOString(),
      walletAddress,
      platform: "Virtuals Protocol (Base)",
      virtualsUrl: `https://app.virtuals.io/virtuals/${agentId}`,
    };
  }
}

export const virtualsService = new VirtualsService();

