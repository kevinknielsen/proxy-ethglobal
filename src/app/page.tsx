import AgentStatus from "@/components/AgentStatus";
import ProposalList from "@/components/ProposalList";
import TransactionHistory from "@/components/TransactionHistory";
import { Zap, Shield, Activity } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center relative">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-2xl glow-effect">
              <Image 
                src="/logos/proxy.jpg" 
                alt="Proxy Logo" 
                width={80} 
                height={80}
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-6xl font-bold text-white">
              Proxy
            </h1>
          </div>
          
          <p className="text-2xl text-white font-semibold mb-3 flex items-center justify-center gap-2">
            The Delegated Governance Executor for
            <Image 
              src="/logos/unnamed.png" 
              alt="Compound" 
              width={90} 
              height={24}
              className="object-contain inline-block"
            />
          </p>
          <p className="text-base text-gray-400 max-w-2xl mx-auto mb-8">
            An autonomous agent that monitors Compound Governor, analyzes proposals,
            and executes governance actions using non-custodial delegated authority
          </p>

          {/* Key Features */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-gray-300">Real-time Monitoring</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-gray-300">Non-custodial</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-white" />
              <span className="text-gray-300">Autonomous Execution</span>
            </div>
          </div>

          {/* Partner Badges */}
          <div className="flex items-center justify-center flex-wrap gap-3 mt-6">
            <span className="px-4 py-2 bg-white/5 text-white border border-white/20 rounded-full text-xs font-semibold backdrop-blur-sm hover:bg-white/10 transition-all">
              🌐 Envio HyperSync
            </span>
            <span className="px-4 py-2 bg-white/5 text-white border border-white/20 rounded-full text-xs font-semibold backdrop-blur-sm hover:bg-white/10 transition-all">
              🔒 Lit Protocol
            </span>
            <span className="px-4 py-2 bg-white/5 text-white border border-white/20 rounded-full text-xs font-semibold backdrop-blur-sm hover:bg-white/10 transition-all">
              🔍 BlockScout
            </span>
            <span className="px-4 py-2 bg-white/5 text-white border border-white/20 rounded-full text-xs font-semibold backdrop-blur-sm hover:bg-white/10 transition-all">
              🤖 Virtuals
            </span>
          </div>
        </div>

        {/* Agent Status */}
        <div className="mb-8">
          <AgentStatus />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Proposals - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ProposalList />
          </div>

          {/* Transaction History - Takes 1 column */}
          <div className="lg:col-span-1">
            <TransactionHistory />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-block card-gradient rounded-2xl px-8 py-6 mb-4">
            <p className="text-white font-semibold mb-2">
              Built for ETHGlobal 2025
            </p>
            <p className="text-sm text-gray-400">
              Powered by Envio • Lit Protocol • BlockScout • Virtuals
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

