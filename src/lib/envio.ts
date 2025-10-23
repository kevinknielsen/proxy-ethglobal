/**
 * Envio HyperSync Integration
 * Streams governance events from Compound Governor on Ethereum mainnet
 */

import { EnvioEvent, Proposal, ProposalState } from "@/types/governance";

const COMPOUND_GOVERNOR_ADDRESS = process.env.COMPOUND_GOVERNOR_ADDRESS || "0xc0Da02939E1441F497fd74F78cE7Decb17B66529";
const ENVIO_API_URL = process.env.ENVIO_API_URL || "https://eth.hypersync.xyz";

// Lazy-load HyperSync client to avoid build-time issues with native bindings
let HypersyncClient: any;
let Decoder: any;
let Query: any;

const loadHyperSyncClient = async () => {
  if (!HypersyncClient) {
    try {
      const hyperSyncModule = await import("@envio-dev/hypersync-client");
      HypersyncClient = hyperSyncModule.HypersyncClient;
      Decoder = hyperSyncModule.Decoder;
      Query = hyperSyncModule.Query;
    } catch (error) {
      console.warn("HyperSync client not available, using mock data");
      return false;
    }
  }
  return true;
};

// Event signatures for Compound Governor
const EVENT_SIGNATURES = {
  ProposalCreated: "0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0",
  ProposalQueued: "0x9a2e42fd6722813d69113e7d0079d3d940171428df7373df9c7f7617cfda2892",
  ProposalExecuted: "0x712ae1383f79ac853f8d882153778e0260ef8f03b504e2866e0593e04d2b291f",
  VoteCast: "0xb8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda4",
};

export class EnvioService {
  private client: any = null;
  private decoder: any = null;
  private initialized: boolean = false;

  async initialize() {
    if (this.initialized) return true;
    
    const loaded = await loadHyperSyncClient();
    if (loaded && HypersyncClient) {
      this.client = HypersyncClient.new({
        url: ENVIO_API_URL,
      });
      this.decoder = Decoder.new();
      this.initialized = true;
      return true;
    }
    return false;
  }

  private getMockProposals(): Proposal[] {
    // Return mock proposal data for demo/build purposes
    return [
      {
        id: "123",
        proposalId: BigInt(123),
        proposer: "0x6626593C237f530D15aE9980A95ef938Ac15c35c",
        targets: [],
        values: [],
        signatures: [],
        calldatas: [],
        startBlock: BigInt(18000000),
        endBlock: BigInt(18050000),
        description: "[Demo] Increase block gas limit to 50M",
        state: ProposalState.Active,
        forVotes: BigInt("1500000000000000000000000"),
        againstVotes: BigInt("50000000000000000000000"),
        abstainVotes: BigInt("10000000000000000000000"),
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(),
      },
      {
        id: "124",
        proposalId: BigInt(124),
        proposer: "0x2B384212EDc04Ae8bB41738D05BA20E33277bf33",
        targets: [],
        values: [],
        signatures: [],
        calldatas: [],
        startBlock: BigInt(18050000),
        endBlock: BigInt(18100000),
        description: "[Demo] Update Compound treasury allocation",
        state: ProposalState.Succeeded,
        forVotes: BigInt("2500000000000000000000000"),
        againstVotes: BigInt("80000000000000000000000"),
        createdAt: new Date(Date.now() - 86400000 * 5),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Query recent proposals from Compound Governor
   */
  async getRecentProposals(limit: number = 10): Promise<Proposal[]> {
    try {
      const initialized = await this.initialize();
      
      // If HyperSync not available, return mock data
      if (!initialized || !this.client) {
        console.log("Using mock proposal data (HyperSync not available)");
        return this.getMockProposals().slice(0, limit);
      }

      const query = {
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

      return proposals.length > 0 ? proposals : this.getMockProposals().slice(0, limit);
    } catch (error) {
      console.error("Error fetching proposals from Envio:", error);
      return this.getMockProposals().slice(0, limit);
    }
  }

  /**
   * Stream governance events in real-time
   */
  async *streamEvents(): AsyncGenerator<EnvioEvent> {
    const initialized = await this.initialize();
    if (!initialized || !this.client) {
      console.warn("HyperSync not available, cannot stream events");
      return;
    }

    let currentBlock = await this.getCurrentBlock();

    while (true) {
      const query = {
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
    if (!this.client) return 0;
    
    try {
      const query = {
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

