/**
 * BlockScout Integration
 * Provides transaction history and governance activity visualization
 */

import axios from "axios";
import { BlockScoutTransaction } from "@/types/governance";

const BLOCKSCOUT_API_URL =
  process.env.BLOCKSCOUT_API_URL || "https://eth.blockscout.com/api";

export class BlockScoutService {
  private apiUrl: string;
  private apiKey?: string;

  constructor() {
    this.apiUrl = BLOCKSCOUT_API_URL;
    this.apiKey = process.env.BLOCKSCOUT_API_KEY;
  }

  /**
   * Get transactions for a specific address (Proxy's execution wallet)
   */
  async getAddressTransactions(
    address: string,
    limit: number = 20
  ): Promise<BlockScoutTransaction[]> {
    try {
      const params: any = {
        module: "account",
        action: "txlist",
        address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: limit,
        sort: "desc",
      };

      if (this.apiKey) {
        params.apikey = this.apiKey;
      }

      const response = await axios.get(this.apiUrl, { params });

      if (response.data.status === "1" && response.data.result) {
        return response.data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          input: tx.input,
          blockNumber: tx.blockNumber,
          timestamp: tx.timeStamp,
          status: tx.isError === "0" ? "success" : "failed",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching transactions from BlockScout:", error);
      return [];
    }
  }

  /**
   * Get transaction details with decoded input
   */
  async getTransactionDetails(txHash: string): Promise<BlockScoutTransaction | null> {
    try {
      const params: any = {
        module: "proxy",
        action: "eth_getTransactionByHash",
        txhash: txHash,
      };

      if (this.apiKey) {
        params.apikey = this.apiKey;
      }

      const response = await axios.get(this.apiUrl, { params });

      if (response.data.result) {
        const tx = response.data.result;
        
        // Attempt to decode the method
        const decoded = this.decodeGovernanceMethod(tx.input);

        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          input: tx.input,
          blockNumber: tx.blockNumber,
          timestamp: Date.now().toString(),
          status: "pending",
          methodId: tx.input.slice(0, 10),
          decoded,
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      return null;
    }
  }

  /**
   * Decode governance method calls
   */
  private decodeGovernanceMethod(input: string): BlockScoutTransaction["decoded"] {
    if (input.length < 10) return undefined;

    const methodId = input.slice(0, 10);

    // Common Compound Governor method signatures
    const methods: Record<string, { name: string; params: string[] }> = {
      "0x56781388": { name: "castVote", params: ["proposalId", "support"] },
      "0xddf0b009": { name: "queue", params: ["proposalId"] },
      "0xfe0d94c1": { name: "execute", params: ["proposalId"] },
      "0xda95691a": { name: "propose", params: ["targets", "values", "calldatas", "description"] },
    };

    const method = methods[methodId];
    if (!method) return undefined;

    // Basic decoding (simplified for demo)
    const parameters = method.params.map((name, index) => ({
      name,
      type: name === "proposalId" ? "uint256" : "bytes",
      value: input.slice(10 + index * 64, 10 + (index + 1) * 64),
    }));

    return {
      methodName: method.name,
      parameters,
    };
  }

  /**
   * Get governance contract interactions
   */
  async getGovernanceActivity(
    governorAddress: string,
    limit: number = 50
  ): Promise<BlockScoutTransaction[]> {
    try {
      const params: any = {
        module: "account",
        action: "txlist",
        address: governorAddress,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: limit,
        sort: "desc",
      };

      if (this.apiKey) {
        params.apikey = this.apiKey;
      }

      const response = await axios.get(this.apiUrl, { params });

      if (response.data.status === "1" && response.data.result) {
        return response.data.result
          .filter((tx: any) => tx.to?.toLowerCase() === governorAddress.toLowerCase())
          .map((tx: any) => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            input: tx.input,
            blockNumber: tx.blockNumber,
            timestamp: tx.timeStamp,
            status: tx.isError === "0" ? "success" : "failed",
            decoded: this.decodeGovernanceMethod(tx.input),
          }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching governance activity:", error);
      return [];
    }
  }

  /**
   * Generate human-readable transaction summary
   */
  generateTransactionSummary(tx: BlockScoutTransaction): string {
    if (!tx.decoded) {
      return `Transaction ${tx.hash.slice(0, 10)}...`;
    }

    const { methodName, parameters } = tx.decoded;

    switch (methodName) {
      case "castVote":
        const support = parameters.find((p) => p.name === "support")?.value;
        const voteType = support === "01" ? "FOR" : support === "00" ? "AGAINST" : "ABSTAIN";
        return `Voted ${voteType} on proposal`;
      case "queue":
        return `Queued proposal for execution`;
      case "execute":
        return `Executed proposal`;
      case "propose":
        return `Created new proposal`;
      default:
        return `Called ${methodName}`;
    }
  }
}

export const blockScoutService = new BlockScoutService();

