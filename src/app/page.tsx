import AgentStatus from "@/components/AgentStatus";
import ProposalList from "@/components/ProposalList";
import TransactionHistory from "@/components/TransactionHistory";
import { Bot } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Proxy
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            The Delegated Governance Executor
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            An autonomous agent on Virtuals that monitors Compound Governor,
            analyzes proposals, and executes governance actions using delegated
            authority via Lit Protocol
          </p>

          {/* Partner Badges */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-semibold">
              Virtuals
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
              Envio HyperSync
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
              Lit Protocol
            </span>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-semibold">
              BlockScout
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
        <div className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">
            Built for ETHGlobal Bangkok 2024 🇹🇭
          </p>
          <p>
            Powered by Virtuals • Envio • Lit Protocol • BlockScout
          </p>
        </div>
      </div>
    </main>
  );
}

