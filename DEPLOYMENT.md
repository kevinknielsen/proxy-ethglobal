# 🚀 Deployment Guide

This guide walks you through deploying Proxy to Vercel and configuring all integrations.

## Prerequisites

- [ ] Vercel account
- [ ] GitHub repository (optional, but recommended)
- [ ] All API keys ready (see [README.md](./README.md))

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository or upload the folder
4. Vercel will automatically detect Next.js
5. Click "Deploy"

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your username/team
# - Link to existing project? No
# - Project name? proxy-governance-agent
# - Directory? ./
# - Override settings? No
```

## Step 2: Add Environment Variables

### Via Vercel Dashboard

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable from `.env.example`:

| Variable | Value | Required |
|----------|-------|----------|
| `VIRTUALS_AGENT_ID` | Your Virtuals agent ID | ✅ |
| `VIRTUALS_API_KEY` | Your Virtuals API key | ✅ |
| `VIRTUALS_WEBHOOK_SECRET` | Your webhook secret | ✅ |
| `LIT_PKP_PUBLIC_KEY` | Your Lit PKP public key | ✅ |
| `LIT_SESSION_SIGS` | Your Lit session signatures | ✅ |
| `ENVIO_API_URL` | `https://eth.hypersync.xyz` | ✅ |
| `ENVIO_API_KEY` | Your Envio key (if needed) | ⚪ |
| `BLOCKSCOUT_API_URL` | `https://eth.blockscout.com/api` | ✅ |
| `BLOCKSCOUT_API_KEY` | Your BlockScout API key | ⚪ |
| `ETHEREUM_RPC_URL` | Your Ethereum RPC URL | ✅ |
| `COMPOUND_GOVERNOR_ADDRESS` | `0xc0Da02939E1441F497fd74F78cE7Decb17B66529` | ✅ |
| `COMPOUND_TIMELOCK_ADDRESS` | `0x6d903f6003cca6255D85CcA4D3B5E5146dC33925` | ✅ |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL | ✅ |

4. Set environment for: **Production**, **Preview**, and **Development**
5. Click "Save"

### Via Vercel CLI

```bash
# Set production environment variables
vercel env add VIRTUALS_AGENT_ID production
vercel env add VIRTUALS_API_KEY production
vercel env add VIRTUALS_WEBHOOK_SECRET production
# ... continue for all variables

# Pull environment variables locally
vercel env pull
```

## Step 3: Configure Virtuals Webhook

1. Go to your Virtuals agent dashboard
2. Navigate to **Settings** → **Webhooks**
3. Add webhook URL: `https://your-app.vercel.app/api/webhooks/virtuals`
4. Copy the webhook secret
5. Add secret to Vercel environment variables as `VIRTUALS_WEBHOOK_SECRET`
6. Save and test the webhook

## Step 4: Configure Lit Protocol

### Create PKP

```typescript
// Use Lit Protocol SDK to create a PKP
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";

const litNodeClient = new LitNodeClient({
  litNetwork: LitNetwork.DatilDev,
});

await litNodeClient.connect();

// Create PKP (follow Lit Protocol docs)
// Export public key and session signatures
```

### Define Vincent Ability

```typescript
// Define governance ability
export const governanceAbility = {
  name: "GovernanceExecutor",
  description: "Execute governance actions on Compound Governor",
  actions: [
    {
      contractAddress: "0xc0Da02939E1441F497fd74F78cE7Decb17B66529",
      functionName: "castVote",
      args: ["proposalId", "support"],
    },
    {
      contractAddress: "0xc0Da02939E1441F497fd74F78cE7Decb17B66529",
      functionName: "queue",
      args: ["proposalId"],
    },
    {
      contractAddress: "0xc0Da02939E1441F497fd74F78cE7Decb17B66529",
      functionName: "execute",
      args: ["proposalId"],
    },
  ],
};
```

### Delegate to Proxy

1. Delegate the ability to your Proxy agent's wallet
2. Export session signatures
3. Add to Vercel environment variables

## Step 5: Test the Deployment

### Test API Endpoints

```bash
# Test agent status
curl https://your-app.vercel.app/api/agent/status

# Test proposals endpoint
curl https://your-app.vercel.app/api/governance/proposals?limit=5

# Test transactions endpoint
curl https://your-app.vercel.app/api/transactions?limit=10
```

### Test Webhook

```bash
# Send test webhook to Virtuals endpoint
curl -X POST https://your-app.vercel.app/api/webhooks/virtuals \
  -H "Content-Type: application/json" \
  -H "X-Virtuals-Signature: your_signature" \
  -d '{
    "type": "governance_update",
    "data": {
      "proposals": []
    },
    "timestamp": "2024-10-23T00:00:00Z"
  }'
```

## Step 6: Monitor Logs

### Via Vercel Dashboard

1. Go to your project
2. Click on "Deployments"
3. Select your deployment
4. Click "Logs" to see real-time logs

### Via Vercel CLI

```bash
# Stream logs
vercel logs --follow
```

## Step 7: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable
5. Update Virtuals webhook URL with new domain

## Troubleshooting

### Build Failures

```bash
# Check build logs
vercel logs --build

# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Dependency issues

# Fix and redeploy
vercel --prod
```

### Runtime Errors

```bash
# Check function logs
vercel logs

# Common issues:
# - API key not working
# - RPC URL issues
# - Network connectivity

# Update environment variables and redeploy
```

### Webhook Not Receiving Data

1. Check webhook URL is correct
2. Verify webhook secret matches
3. Test webhook manually with curl
4. Check Vercel function logs

## Production Checklist

- [ ] All environment variables configured
- [ ] Virtuals webhook configured and tested
- [ ] Lit Protocol PKP created and delegated
- [ ] Envio HyperSync streaming proposals
- [ ] BlockScout API working
- [ ] Frontend loads and displays data
- [ ] API endpoints responding
- [ ] Logs show no errors
- [ ] Custom domain configured (optional)
- [ ] Analytics setup (optional)

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys on Git push:

1. Connect GitHub repository
2. Every push to `main` triggers production deployment
3. Every PR creates preview deployment
4. Environment variables persist across deployments

### Manual Deployments

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## Scaling

Proxy should scale automatically with Vercel's serverless infrastructure:

- **API Routes**: Auto-scale based on traffic
- **Edge Functions**: Deploy globally for low latency
- **Static Assets**: Served via CDN
- **Database**: Consider adding database for persistence (optional)

## Monitoring

### Setup Monitoring

1. **Vercel Analytics**: Enable in dashboard
2. **Sentry**: Add for error tracking
3. **Custom Metrics**: Add logging for governance actions

### Key Metrics

- Proposal detection latency
- Action execution success rate
- Webhook response time
- API endpoint response times

## Support

If you encounter issues:

1. Check [README.md](./README.md) for API key setup
2. Review Vercel logs for errors
3. Test API endpoints individually
4. Contact partner support:
   - [Virtuals Discord](https://discord.gg/virtuals)
   - [Envio Discord](https://discord.gg/envio)
   - [Lit Protocol Discord](https://discord.gg/litprotocol)
   - [BlockScout Support](https://blockscout.com/support)

---

**Ready to deploy?** Run `vercel` and follow the prompts! 🚀

