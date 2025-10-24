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
    this.agentId = process.env.VIRTUALS_AGENT_ID || "";
    this.apiKey = process.env.VIRTUALS_API_KEY || "";
  }

  /**
   * Send governance update to Virtuals agent
   */
  async notifyProposalUpdate(proposals: Proposal[]): Promise<void> {
    try {
      // Format proposals for agent understanding
      const summary = this.generateProposalSummary(proposals);

      console.log(`📡 Notifying Virtuals agent about ${proposals.length} proposal(s)`);
      console.log(`Summary: ${summary}`);

      // In production, this would be an actual API call to Virtuals
      // For demo, we log the interaction
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

      // Simulated API call
      // await axios.post(`${VIRTUALS_API_BASE}/agents/${this.agentId}/notify`, payload, {
      //   headers: { Authorization: `Bearer ${this.apiKey}` }
      // });

      console.log("✅ Virtuals agent notified");
    } catch (error) {
      console.error("Error notifying Virtuals agent:", error);
    }
  }

  /**
   * Request agent decision on governance action
   */
  async requestDecision(
    proposal: Proposal
  ): Promise<{ action: string; reason: string }> {
    try {
      console.log(`🤔 Asking Virtuals agent for decision on proposal ${proposal.id}`);

      // In production, agent would use AI reasoning
      // For demo, we return simple logic-based decisions
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

      console.log(`💡 Agent decision: ${action} - ${reason}`);

      return { action, reason };
    } catch (error) {
      console.error("Error requesting agent decision:", error);
      return { action: "monitor", reason: "Error occurred" };
    }
  }

  /**
   * Log action execution to agent
   */
  async logAction(action: GovernanceAction): Promise<void> {
    try {
      console.log(`📝 Logging action to Virtuals agent:`, action);

      const payload = {
        type: "action_executed",
        agentId: this.agentId,
        action,
        timestamp: new Date().toISOString(),
      };

      // Simulated API call
      // await axios.post(`${VIRTUALS_API_BASE}/agents/${this.agentId}/log`, payload, {
      //   headers: { Authorization: `Bearer ${this.apiKey}` }
      // });

      console.log("✅ Action logged to agent");
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

