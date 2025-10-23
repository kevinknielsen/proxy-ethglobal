/**
 * Envio HyperSync Integration
 * Streams governance events from Compound Governor on Ethereum mainnet
 */

import { HypersyncClient, Decoder, Query } from "@envio-dev/hypersync-client";
import { EnvioEvent, Proposal, ProposalState } from "@/types/governance";

const COMPOUND_GOVERNOR_ADDRESS = process.env.COMPOUND_GOVERNOR_ADDRESS!;
const ENVIO_API_URL = process.env.ENVIO_API_URL || "https://eth.hypersync.xyz";

// Event signatures for Compound Governor
const EVENT_SIGNATURES = {
  ProposalCreated: "0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0",
  ProposalQueued: "0x9a2e42fd6722813d69113e7d0079d3d940171428df7373df9c7f7617cfda2892",
  ProposalExecuted: "0x712ae1383f79ac853f8d882153778e0260ef8f03b504e2866e0593e04d2b291f",
  VoteCast: "0xb8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda4",
};

export class EnvioService {
  private client: HypersyncClient;
  private decoder: Decoder;

  constructor() {
    this.client = HypersyncClient.new({
      url: ENVIO_API_URL,
    });
    this.decoder = Decoder.new();
  }

  /**
   * Query recent proposals from Compound Governor
   */
  async getRecentProposals(limit: number = 10): Promise<Proposal[]> {
    try {
      const query: Query = {
        fromBlock: 0,
        toBlock: undefined, // latest
        logs: [
          {
            address: [COMPOUND_GOVERNOR_ADDRESS],
            topics: [[EVENT_SIGNATURES.ProposalCreated]],
          },
        ],
        fieldSelection: {
          log: [
            "block_number",
            "log_index",
            "transaction_hash",
            "transaction_index",
            "address",
            "data",
            "topic0",
            "topic1",
            "topic2",
            "topic3",
          ],
          block: ["number", "timestamp"],
        },
      };

      const res = await this.client.sendReq(query);
      
      // Parse proposal events
      const proposals: Proposal[] = [];
      
      if (res.data.logs) {
        for (const log of res.data.logs.slice(-limit)) {
          // Decode the proposal created event
          // ProposalCreated(uint256 proposalId, address proposer, address[] targets, ...)
          const proposalId = BigInt(log.topic1 || "0");
          
          proposals.push({
            id: proposalId.toString(),
            proposalId,
            proposer: `0x${(log.topic2 || "0").slice(-40)}`,
            targets: [],
            values: [],
            signatures: [],
            calldatas: [],
            startBlock: BigInt(0),
            endBlock: BigInt(0),
            description: "Proposal from Compound Governor",
            state: ProposalState.Pending,
            createdAt: new Date(Number(log.block_number || 0) * 12 * 1000), // rough estimate
            updatedAt: new Date(),
          });
        }
      }

      return proposals;
    } catch (error) {
      console.error("Error fetching proposals from Envio:", error);
      return [];
    }
  }

  /**
   * Stream governance events in real-time
   */
  async *streamEvents(): AsyncGenerator<EnvioEvent> {
    let currentBlock = await this.getCurrentBlock();

    while (true) {
      const query: Query = {
        fromBlock: currentBlock,
        toBlock: undefined,
        logs: [
          {
            address: [COMPOUND_GOVERNOR_ADDRESS],
            topics: [
              [
                EVENT_SIGNATURES.ProposalCreated,
                EVENT_SIGNATURES.ProposalQueued,
                EVENT_SIGNATURES.ProposalExecuted,
                EVENT_SIGNATURES.VoteCast,
              ],
            ],
          },
        ],
        fieldSelection: {
          log: ["block_number", "topic0", "topic1", "data"],
          block: ["number", "timestamp"],
        },
      };

      const res = await this.client.sendReq(query);

      if (res.data.logs && res.data.logs.length > 0) {
        for (const log of res.data.logs) {
          const eventType = this.getEventType(log.topic0 || "");
          const proposalId = log.topic1 || "0";

          yield {
            type: eventType,
            proposalId,
            blockNumber: Number(log.block_number || 0),
            timestamp: Date.now(),
            data: log,
          };

          currentBlock = Number(log.block_number || 0) + 1;
        }
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 12000)); // 12 seconds (avg block time)
    }
  }

  private getEventType(topic0: string): EnvioEvent["type"] {
    switch (topic0) {
      case EVENT_SIGNATURES.ProposalCreated:
        return "ProposalCreated";
      case EVENT_SIGNATURES.ProposalQueued:
        return "ProposalQueued";
      case EVENT_SIGNATURES.ProposalExecuted:
        return "ProposalExecuted";
      case EVENT_SIGNATURES.VoteCast:
        return "VoteCast";
      default:
        return "ProposalCreated";
    }
  }

  private async getCurrentBlock(): Promise<number> {
    try {
      const query: Query = {
        fromBlock: 0,
        toBlock: undefined,
        logs: [],
        fieldSelection: {
          block: ["number"],
        },
      };

      const res = await this.client.sendReq(query);
      return res.archiveHeight || 0;
    } catch (error) {
      console.error("Error getting current block:", error);
      return 0;
    }
  }
}

export const envioService = new EnvioService();

