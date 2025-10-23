// Compound Governor Types
export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7,
}

export interface Proposal {
  id: string;
  proposalId: bigint;
  proposer: string;
  targets: string[];
  values: bigint[];
  signatures: string[];
  calldatas: string[];
  startBlock: bigint;
  endBlock: bigint;
  description: string;
  state: ProposalState;
  forVotes?: bigint;
  againstVotes?: bigint;
  abstainVotes?: bigint;
  eta?: bigint;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  voter: string;
  proposalId: bigint;
  support: number; // 0 = against, 1 = for, 2 = abstain
  votes: bigint;
  reason?: string;
  timestamp: Date;
}

export interface GovernanceAction {
  type: 'vote' | 'queue' | 'execute';
  proposalId: bigint;
  timestamp: Date;
  txHash?: string;
  status: 'pending' | 'success' | 'failed';
}

export interface EnvioEvent {
  type: 'ProposalCreated' | 'ProposalQueued' | 'ProposalExecuted' | 'VoteCast';
  proposalId: string;
  blockNumber: number;
  timestamp: number;
  data: any;
}

export interface VirtualsWebhookPayload {
  type: 'governance_update' | 'execute_action';
  data: {
    proposals?: Proposal[];
    action?: GovernanceAction;
  };
  timestamp: string;
}

export interface BlockScoutTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  input: string;
  blockNumber: string;
  timestamp: string;
  status: string;
  methodId?: string;
  decoded?: {
    methodName: string;
    parameters: Array<{
      name: string;
      type: string;
      value: string;
    }>;
  };
}

