# 🤖 Proxy - The Delegated Governance Executor

<div align="center">

![Proxy Banner](https://img.shields.io/badge/ETHGlobal-Bangkok_2024-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**An autonomous Virtuals agent that automates governance execution using delegated authority**

[Demo](#-demo) • [Features](#-features) • [Setup](#-setup) • [Architecture](#-architecture) • [API](#-api-reference)

</div>

---

## 🎯 Overview

**Proxy** is a self-driving governance delegate that listens for onchain DAO events, analyzes proposals, and executes transactions using delegated authority. It combines four powerful protocols to create a seamless governance automation experience:

- **Virtuals** - Agent runtime and identity on Base
- **Envio HyperSync** - Real-time governance event streaming from Ethereum mainnet
- **Lit Protocol** - Non-custodial transaction execution via delegated authority
- **BlockScout** - Transaction history and governance activity verification

## ✨ Features

### 🔍 Real-Time Monitoring
- Streams governance events from Compound Governor using Envio HyperSync
- Detects proposals, votes, queued actions, and executions in real-time
- Maintains full historical context of governance activity

### 🤖 Autonomous Decision Making
- Virtuals agent analyzes proposal states and determines optimal actions
- Personality-driven decision logic (analytical, governance-focused)
- Transparent reasoning for every action taken

### ⚡ Delegated Execution
- Non-custodial transaction execution using Lit Protocol Vincent Abilities
- Vote on active proposals
- Queue successful proposals
- Execute queued proposals after timelock

### 📊 Transparent Verification
- BlockScout integration for transaction history
- Decoded governance method calls
- Human-readable transaction summaries
- Full audit trail of agent actions

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Agent      │  │  Proposals   │  │ Transactions │     │
│  │   Status     │  │     List     │  │   History    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   API Routes      │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼─────┐         ┌────▼─────┐         ┌────▼─────┐
   │  Envio   │         │   Lit    │         │BlockScout│
   │HyperSync │         │ Protocol │         │   SDK    │
   └────┬─────┘         └────┬─────┘         └────┬─────┘
        │                    │                     │
   ┌────▼─────┐         ┌────▼─────┐         ┌────▼─────┐
   │Ethereum  │         │  Base    │         │Ethereum  │
   │ Mainnet  │         │(Virtuals)│         │ Mainnet  │
   └──────────┘         └──────────┘         └──────────┘
```

## 🚀 Setup

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Vercel account (for deployment)
- API keys for all partner protocols

### 1️⃣ Clone and Install

```bash
cd proxy-ethglobal
npm install
```

### 2️⃣ Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Virtuals Agent Configuration
VIRTUALS_AGENT_ID=your_agent_id
VIRTUALS_API_KEY=your_virtuals_api_key
VIRTUALS_WEBHOOK_SECRET=your_webhook_secret

# Lit Protocol Configuration
LIT_PKP_PUBLIC_KEY=your_pkp_public_key
LIT_SESSION_SIGS=your_session_signatures

# Envio HyperSync Configuration
ENVIO_API_URL=https://eth.hypersync.xyz
ENVIO_API_KEY=your_envio_api_key_if_needed

# BlockScout Configuration
BLOCKSCOUT_API_URL=https://eth.blockscout.com/api
BLOCKSCOUT_API_KEY=your_blockscout_api_key

# Ethereum Configuration
ETHEREUM_RPC_URL=your_ethereum_rpc_url
PRIVATE_KEY=your_deployer_private_key

# Compound Governor Configuration
COMPOUND_GOVERNOR_ADDRESS=0xc0Da02939E1441F497fd74F78cE7Decb17B66529
COMPOUND_TIMELOCK_ADDRESS=0x6d903f6003cca6255D85CcA4D3B5E5146dC33925

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Proxy agent!

### 4️⃣ Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings > Environment Variables > Add all keys from .env.local

# Link your local environment to pull keys
vercel link
vercel env pull
```

## 🔑 Getting API Keys

### Virtuals Agent
1. Visit [virtuals.io](https://www.virtuals.io/)
2. Create a new agent with:
   - **Name**: Proxy
   - **Bio**: Governance execution and delegation assistant
   - **Personality**: Analytical, concise
3. Deploy to Base and note your Agent ID
4. Generate API key from dashboard
5. Set webhook endpoint to: `https://your-app.vercel.app/api/webhooks/virtuals`

### Envio HyperSync
1. Visit [Envio Docs](https://docs.envio.dev/docs/hypersync)
2. Use public endpoint: `https://eth.hypersync.xyz`
3. No API key required for basic usage
4. For higher rate limits, contact Envio team

### Lit Protocol
1. Visit [Lit Protocol](https://developer.litprotocol.com/)
2. Create a PKP (Programmable Key Pair)
3. Define Vincent Abilities for governance actions
4. Delegate abilities to your Proxy agent
5. Export PKP public key and session signatures

### BlockScout
1. Visit [BlockScout](https://eth.blockscout.com/)
2. Create account and generate API key
3. Free tier includes 5 requests/second
4. Use for transaction history and verification

## 📡 API Reference

### Governance Proposals

```bash
# Get recent proposals
GET /api/governance/proposals?limit=10

# Response
{
  "success": true,
  "count": 10,
  "proposals": [...]
}
```

### Governance Actions

```bash
# Execute governance action
POST /api/governance/actions
Content-Type: application/json

{
  "action": "vote" | "queue" | "execute",
  "proposalId": "123",
  "support": 1  // Only for vote: 0=against, 1=for, 2=abstain
}

# Response
{
  "success": true,
  "action": "vote",
  "proposalId": "123",
  "txHash": "0x..."
}
```

### Proposal State

```bash
# Get proposal state
GET /api/governance/state?proposalId=123

# Response
{
  "success": true,
  "proposalId": "123",
  "state": 1,
  "stateName": "Active"
}
```

### Transaction History

```bash
# Get transaction history
GET /api/transactions?address=0x...&limit=20

# Get governance activity (no address = Compound Governor)
GET /api/transactions?limit=50

# Response
{
  "success": true,
  "address": "0x...",
  "count": 20,
  "transactions": [...]
}
```

### Agent Status

```bash
# Get agent status
GET /api/agent/status

# Response
{
  "success": true,
  "agent": {
    "id": "...",
    "name": "Proxy",
    "status": "active",
    "lastActive": "2024-10-23T..."
  },
  "capabilities": [...],
  "integrations": {...}
}
```

### Virtuals Webhook

```bash
# Webhook endpoint (called by Virtuals agent)
POST /api/webhooks/virtuals
Content-Type: application/json
X-Virtuals-Signature: signature_here

{
  "type": "execute_action",
  "data": {
    "action": {
      "type": "vote",
      "proposalId": "123",
      "timestamp": "2024-10-23T..."
    }
  }
}
```

## 🧩 Integration Details

### Envio HyperSync Integration

```typescript
// src/lib/envio.ts
import { HypersyncClient } from "@envio-dev/hypersync-client";

const client = HypersyncClient.new({
  url: "https://eth.hypersync.xyz",
});

// Stream governance events
const proposals = await envioService.getRecentProposals(10);
```

**What it does:**
- Streams real-time events from Compound Governor
- Filters for ProposalCreated, ProposalQueued, ProposalExecuted, VoteCast
- Provides historical proposal data
- No polling required - efficient event streaming

### Lit Protocol Integration

```typescript
// src/lib/lit.ts
import { LitNodeClient } from "@lit-protocol/lit-node-client";

// Initialize Lit client
await litService.connect();

// Execute governance action with delegated authority
const txHash = await litService.castVote(proposalId, support);
```

**What it does:**
- Non-custodial execution using PKPs
- Delegated authority via Vincent Abilities
- Scoped permissions for governance actions only
- Secure transaction signing without private key exposure

### BlockScout Integration

```typescript
// src/lib/blockscout.ts
import axios from "axios";

// Get transaction history
const transactions = await blockScoutService.getAddressTransactions(
  address,
  limit
);

// Decode governance methods
const summary = blockScoutService.generateTransactionSummary(tx);
```

**What it does:**
- Fetches transaction history for verification
- Decodes governance method calls
- Generates human-readable summaries
- Provides block explorer links

### Virtuals Integration

```typescript
// src/lib/virtuals.ts

// Notify agent of proposal updates
await virtualsService.notifyProposalUpdate(proposals);

// Request decision from agent
const decision = await virtualsService.requestDecision(proposal);

// Log executed actions
await virtualsService.logAction(action);
```

**What it does:**
- Hosts agent identity and personality on Base
- Provides AI reasoning for governance decisions
- Maintains agent state and history
- Handles webhook communication

## 🎨 Frontend Components

### AgentStatus.tsx
Displays agent identity, status, capabilities, and partner integrations with real-time updates.

### ProposalList.tsx
Shows active proposals with state badges, voting stats, and action buttons (Vote/Queue/Execute).

### TransactionHistory.tsx
Displays transaction history with decoded methods, BlockScout links, and success/failure indicators.

## 🔐 Security Considerations

- **Non-Custodial**: Lit Protocol PKPs ensure no private keys are stored
- **Scoped Permissions**: Vincent Abilities limit actions to governance only
- **Webhook Verification**: Signature validation on all incoming webhooks
- **Environment Variables**: All secrets stored in Vercel environment variables
- **Audit Trail**: Full transaction history via BlockScout

## 🛠️ Development

### Project Structure

```
proxy-ethglobal/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── webhooks/     # Virtuals webhook handler
│   │   │   ├── governance/   # Governance actions
│   │   │   ├── transactions/ # Transaction history
│   │   │   └── agent/        # Agent status
│   │   ├── page.tsx          # Main dashboard
│   │   ├── layout.tsx        # App layout
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── AgentStatus.tsx
│   │   ├── ProposalList.tsx
│   │   └── TransactionHistory.tsx
│   ├── lib/                  # SDK integrations
│   │   ├── envio.ts
│   │   ├── lit.ts
│   │   ├── blockscout.ts
│   │   └── virtuals.ts
│   └── types/                # TypeScript types
│       └── governance.ts
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

### Adding New Features

1. **New Governance Action**: Add to `src/lib/lit.ts` and create API route
2. **New Event Type**: Update `src/lib/envio.ts` event signatures
3. **New UI Component**: Add to `src/components/` and import in `page.tsx`
4. **New API Endpoint**: Create route in `src/app/api/`

### Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Test production build locally
npm run start
```

## 📊 Demo Flow

1. **Agent Identity**: View Proxy's status on Virtuals with live capabilities
2. **Proposal Detection**: Envio detects new proposal on Compound Governor
3. **Agent Analysis**: Proxy evaluates proposal state and determines action
4. **Delegated Execution**: Lit Protocol executes vote/queue/execute using PKP
5. **Verification**: BlockScout displays transaction with decoded method
6. **UI Update**: Dashboard shows new action in real-time

## 🎯 ETHGlobal Bangkok Partner Prizes

This project integrates all 4 partner protocols:

### ✅ Virtuals
- Agent runtime and identity on Base
- Personality-driven decision making
- Webhook integration for real-time communication

### ✅ Envio
- HyperSync client for governance event streaming
- Real-time proposal monitoring
- Historical data access

### ✅ Lit Protocol
- PKP-based delegated authority
- Vincent Abilities for governance actions
- Non-custodial transaction execution

### ✅ BlockScout
- Transaction history and verification
- Method decoding and summaries
- Explorer integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with ❤️ for ETHGlobal 2025 using:
- [Virtuals](https://www.virtuals.io/)
- [Envio](https://envio.dev/)
- [Lit Protocol](https://litprotocol.com/)
- [BlockScout](https://blockscout.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

**[Website](https://your-app.vercel.app)** • **[Documentation](https://github.com/yourusername/proxy-ethglobal)** • **[Twitter](https://twitter.com/yourhandle)**

Made with 🤖 by [Your Team]

</div>

