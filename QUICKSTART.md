# ⚡ Quick Start Guide

Get Proxy up and running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
# Minimum required for demo:
VIRTUALS_AGENT_ID=demo_agent
VIRTUALS_API_KEY=demo_key
ETHEREUM_RPC_URL=https://eth.llamarpc.com
COMPOUND_GOVERNOR_ADDRESS=0xc0Da02939E1441F497fd74F78cE7Decb17B66529
```

> **Note**: For full functionality, you'll need API keys from all 4 partners. See [README.md](./README.md) for details.

## 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 4. Test the API

In a new terminal:

```bash
# Check agent status
curl http://localhost:3000/api/agent/status

# Get proposals
curl http://localhost:3000/api/governance/proposals?limit=5

# Get transactions
curl http://localhost:3000/api/transactions?limit=10
```

## 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings > Environment Variables
```

## Demo Mode

The app works in **demo mode** without full API keys:

- ✅ Frontend loads and displays UI
- ✅ API endpoints respond
- ✅ Mock data for proposals
- ⚠️ Real blockchain interactions require proper keys

## Partner Integration Checklist

### Virtuals ✨
- [ ] Create agent on [virtuals.io](https://virtuals.io)
- [ ] Copy Agent ID
- [ ] Generate API key
- [ ] Set webhook URL

### Envio 📡
- [ ] Use public HyperSync endpoint: `https://eth.hypersync.xyz`
- [ ] No API key required for basic usage
- [ ] Monitor governance events in real-time

### Lit Protocol 🔒
- [ ] Create PKP (Programmable Key Pair)
- [ ] Define Vincent Abilities for governance
- [ ] Delegate to Proxy agent
- [ ] Export public key and session signatures

### BlockScout 🔍
- [ ] Get API key from [BlockScout](https://eth.blockscout.com)
- [ ] Free tier: 5 requests/second
- [ ] Use for transaction history

## Troubleshooting

### Port 3000 already in use?

```bash
npm run dev -- -p 3001
```

### Build errors?

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Build again
npm run build
```

### Environment variables not loading?

```bash
# Make sure .env.local exists
ls -la .env.local

# Restart dev server
npm run dev
```

## Next Steps

1. **Full Setup**: Follow [README.md](./README.md) for complete API key setup
2. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to Vercel
3. **Architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
4. **Customize**: Modify components in `src/components/` to match your style

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Run ESLint

# Vercel
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel logs              # View logs
vercel env pull          # Pull environment variables
```

## Demo Data

The app includes mock data for demonstration:

- **Proposals**: Simulated Compound Governor proposals
- **Transactions**: Sample governance actions
- **Agent Status**: Demo agent with capabilities

To see real data, add proper API keys and connect to mainnet.

## Support

- 📖 [Full Documentation](./README.md)
- 🏗️ [Architecture Details](./ARCHITECTURE.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 💬 [GitHub Issues](https://github.com/yourusername/proxy-ethglobal/issues)

---

**Ready to build?** Start with `npm run dev` and you're good to go! 🚀

