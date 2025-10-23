# 🏗️ Architecture Documentation

Detailed technical architecture of the Proxy governance agent.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                        (Next.js Frontend)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Proposals │  │ Actions  │  │  Txns    │  │ Webhooks │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer (TypeScript)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Envio   │  │   Lit    │  │BlockScout│  │ Virtuals │      │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Integrations                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Envio   │  │   Lit    │  │BlockScout│  │ Virtuals │      │
│  │HyperSync │  │ Protocol │  │   API    │  │   Base   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Blockchain Layer                             │
│                                                                  │
│  Ethereum Mainnet                          Base                 │
│  ┌─────────────────────┐                  ┌─────────────────┐ │
│  │ Compound Governor   │                  │ Virtuals Agent  │ │
│  │ - Proposals         │                  │ - Identity      │ │
│  │ - Votes             │                  │ - Personality   │ │
│  │ - Queue/Execute     │                  │ - Decision      │ │
│  └─────────────────────┘                  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Layer

#### `src/app/page.tsx`
Main dashboard that orchestrates all components.

**Responsibilities:**
- Layout and composition
- Partner badge display
- Responsive design

**Dependencies:**
- AgentStatus component
- ProposalList component
- TransactionHistory component

#### `src/components/AgentStatus.tsx`
Displays agent identity and integration status.

**Key Features:**
- Real-time status updates
- Capability list
- Integration health checks
- Last active timestamp

**API Calls:**
- `GET /api/agent/status`

#### `src/components/ProposalList.tsx`
Shows governance proposals with actions.

**Key Features:**
- Proposal state visualization
- Vote/Queue/Execute buttons
- Real-time vote counts
- Proposal filtering by state

**API Calls:**
- `GET /api/governance/proposals`
- `POST /api/governance/actions`

#### `src/components/TransactionHistory.tsx`
Displays transaction history with decoded methods.

**Key Features:**
- Transaction list with status
- Method decoding
- BlockScout explorer links
- Human-readable summaries

**API Calls:**
- `GET /api/transactions`

### API Layer

#### `GET /api/governance/proposals`
Fetches recent proposals from Compound Governor.

**Flow:**
1. Receive request with limit parameter
2. Call EnvioService.getRecentProposals()
3. Notify VirtualsService of updates
4. Return proposal list

**Response Schema:**
```typescript
{
  success: boolean;
  count: number;
  proposals: Proposal[];
}
```

#### `POST /api/governance/actions`
Executes governance actions via Lit Protocol.

**Flow:**
1. Validate request (action, proposalId, support)
2. Route to appropriate LitService method
3. Execute transaction with PKP
4. Log action to VirtualsService
5. Return transaction hash

**Request Schema:**
```typescript
{
  action: "vote" | "queue" | "execute";
  proposalId: string;
  support?: number; // Only for vote
}
```

#### `GET /api/transactions`
Fetches transaction history from BlockScout.

**Flow:**
1. Receive request with address/limit
2. Call BlockScoutService.getAddressTransactions()
3. Decode methods and generate summaries
4. Return transactions with metadata

**Response Schema:**
```typescript
{
  success: boolean;
  address: string;
  count: number;
  transactions: BlockScoutTransaction[];
}
```

#### `POST /api/webhooks/virtuals`
Receives webhooks from Virtuals agent.

**Flow:**
1. Verify webhook signature
2. Parse payload type
3. Handle governance_update or execute_action
4. Execute appropriate service methods
5. Return success/failure

**Security:**
- Signature verification
- Rate limiting
- Payload validation

### Service Layer

#### `src/lib/envio.ts` - EnvioService

**Purpose:** Stream governance events from Ethereum mainnet.

**Key Methods:**

```typescript
// Get recent proposals
async getRecentProposals(limit: number): Promise<Proposal[]>

// Stream events in real-time
async *streamEvents(): AsyncGenerator<EnvioEvent>

// Get current block number
private async getCurrentBlock(): Promise<number>
```

**Implementation Details:**
- Uses HyperSync client for efficient queries
- Filters by Compound Governor address
- Decodes event signatures
- Returns structured Proposal objects

**Event Signatures:**
- `ProposalCreated`: `0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0`
- `ProposalQueued`: `0x9a2e42fd6722813d69113e7d0079d3d940171428df7373df9c7f7617cfda2892`
- `ProposalExecuted`: `0x712ae1383f79ac853f8d882153778e0260ef8f03b504e2866e0593e04d2b291f`
- `VoteCast`: `0xb8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda4`

#### `src/lib/lit.ts` - LitService

**Purpose:** Execute governance transactions using delegated authority.

**Key Methods:**

```typescript
// Connect to Lit Network
async connect(): Promise<void>

// Cast vote on proposal
async castVote(proposalId: bigint, support: number): Promise<string>

// Queue successful proposal
async queueProposal(proposalId: bigint): Promise<string>

// Execute queued proposal
async executeProposal(proposalId: bigint): Promise<string>

// Get proposal state
async getProposalState(proposalId: bigint): Promise<number>
```

**Implementation Details:**
- Uses Lit Node Client for network communication
- Encodes function calls with ethers.js
- Signs transactions with PKP
- Returns transaction hashes

**Security:**
- Non-custodial (PKP-based)
- Scoped permissions via Vincent Abilities
- Session signatures for authentication

#### `src/lib/blockscout.ts` - BlockScoutService

**Purpose:** Fetch and decode transaction history.

**Key Methods:**

```typescript
// Get transactions for address
async getAddressTransactions(address: string, limit: number): Promise<BlockScoutTransaction[]>

// Get transaction details
async getTransactionDetails(txHash: string): Promise<BlockScoutTransaction | null>

// Get governance activity
async getGovernanceActivity(governorAddress: string, limit: number): Promise<BlockScoutTransaction[]>

// Generate human-readable summary
generateTransactionSummary(tx: BlockScoutTransaction): string

// Decode governance methods
private decodeGovernanceMethod(input: string): DecodedMethod | undefined
```

**Implementation Details:**
- Uses BlockScout API for data
- Decodes method signatures
- Generates readable summaries
- Provides explorer links

**Method Signatures:**
- `castVote`: `0x56781388`
- `queue`: `0xddf0b009`
- `execute`: `0xfe0d94c1`
- `propose`: `0xda95691a`

#### `src/lib/virtuals.ts` - VirtualsService

**Purpose:** Communicate with Virtuals agent.

**Key Methods:**

```typescript
// Notify agent of proposal updates
async notifyProposalUpdate(proposals: Proposal[]): Promise<void>

// Request decision from agent
async requestDecision(proposal: Proposal): Promise<{ action: string; reason: string }>

// Log executed action
async logAction(action: GovernanceAction): Promise<void>

// Get agent status
async getAgentStatus(): Promise<AgentStatus>
```

**Implementation Details:**
- Formats proposals for agent understanding
- Applies decision logic (demo mode)
- Logs all actions for transparency
- Maintains agent state

**Decision Logic (Demo):**
- Active proposals → Vote
- Succeeded proposals → Queue
- Queued proposals → Execute
- Others → Monitor

## Data Flow

### Proposal Detection Flow

```
1. Envio HyperSync streams events
   ↓
2. EnvioService decodes ProposalCreated event
   ↓
3. API endpoint receives proposal data
   ↓
4. VirtualsService notified of new proposal
   ↓
5. Frontend fetches and displays proposal
```

### Action Execution Flow

```
1. User clicks "Vote" button
   ↓
2. Frontend calls POST /api/governance/actions
   ↓
3. API validates request
   ↓
4. LitService encodes transaction
   ↓
5. Lit Protocol signs with PKP
   ↓
6. Transaction submitted to Ethereum
   ↓
7. VirtualsService logs action
   ↓
8. Frontend displays success + tx hash
```

### Webhook Flow

```
1. Virtuals agent triggers event
   ↓
2. Webhook sent to /api/webhooks/virtuals
   ↓
3. Signature verified
   ↓
4. Payload parsed (governance_update or execute_action)
   ↓
5. Appropriate service method called
   ↓
6. Action executed (if execute_action)
   ↓
7. Response sent to Virtuals
```

## State Management

### Frontend State
- React useState for component state
- API calls for data fetching
- No global state manager (simple architecture)

### Backend State
- Stateless API routes
- Services maintain connection state (Lit client)
- No persistent storage (can be added)

### Blockchain State
- Proposals on Ethereum mainnet (Compound Governor)
- Agent identity on Base (Virtuals)
- Transaction history on-chain

## Security Model

### Authentication
- Virtuals webhook signature verification
- No user authentication (demo mode)
- Can add wallet connect for production

### Authorization
- Lit Protocol PKP controls execution
- Vincent Abilities scope permissions
- Only governance actions allowed

### Data Validation
- API request validation
- Type safety with TypeScript
- Input sanitization

## Scalability

### Current Architecture
- Serverless functions (Vercel)
- No database (blockchain as source of truth)
- Stateless design

### Scaling Considerations
1. **Add Database**: Store proposal history, cache data
2. **Add Queue**: Use background jobs for long-running tasks
3. **Add Caching**: Redis for proposal/transaction caching
4. **Add Rate Limiting**: Protect API endpoints
5. **Add WebSockets**: Real-time updates to frontend

## Error Handling

### Frontend
- Try-catch blocks in API calls
- User-friendly error messages
- Loading states

### Backend
- Try-catch in all API routes
- Proper HTTP status codes
- Detailed error logging

### Services
- Graceful degradation
- Fallback to demo data
- Retry logic for network errors

## Testing Strategy

### Unit Tests
```typescript
// Test EnvioService
describe('EnvioService', () => {
  it('should fetch recent proposals', async () => {
    const proposals = await envioService.getRecentProposals(5);
    expect(proposals).toHaveLength(5);
  });
});
```

### Integration Tests
```typescript
// Test API endpoints
describe('GET /api/governance/proposals', () => {
  it('should return proposals', async () => {
    const response = await fetch('/api/governance/proposals');
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### E2E Tests
- Use Playwright or Cypress
- Test full user flows
- Mock blockchain interactions

## Deployment Architecture

### Vercel Deployment
```
┌─────────────────────────────────────┐
│         Vercel Edge Network         │
│  ┌────────────────────────────────┐ │
│  │  Static Assets (CDN)           │ │
│  │  - HTML, CSS, JS, Images       │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Serverless Functions          │ │
│  │  - API Routes                  │ │
│  │  - Auto-scaling                │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Environment Variables         │ │
│  │  - Secrets Management          │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Environment Separation
- **Development**: Local development with `.env.local`
- **Preview**: PR deployments with preview environment
- **Production**: Main branch deployment with production secrets

## Future Enhancements

### Phase 2
1. Add persistent database (PostgreSQL/Supabase)
2. Implement user authentication (Wallet Connect)
3. Add proposal notifications (email/push)
4. Support multiple DAOs
5. Advanced decision logic with AI

### Phase 3
1. Multi-chain support (Polygon, Arbitrum, etc.)
2. Proposal simulation before execution
3. Voting strategy optimization
4. Governance analytics dashboard
5. Community delegation marketplace

## Documentation

- [README.md](./README.md) - Quick start guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - This document
- API documentation in code comments
- Type definitions in `src/types/`

---

**Questions?** Open an issue or reach out on Discord!

