"use client";

import { useEffect, useState } from "react";
import { Zap, Eye, CheckCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Image from "next/image";

interface AgentStatusData {
  agent: {
    id: string;
    name: string;
    status: string;
    lastActive: string;
    walletAddress?: string;
    platform?: string;
    virtualsUrl?: string;
  };
  capabilities: string[];
  integrations: {
    envio: string;
    lit: string;
    blockscout: string;
    virtuals: string;
  };
}

export default function AgentStatus() {
  const [status, setStatus] = useState<AgentStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/agent/status");
      const data = await response.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching agent status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-gradient rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="card-gradient rounded-xl p-6">
        <p className="text-red-500">Failed to load agent status</p>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-xl overflow-hidden">
      {/* Header Section */}
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-white">Agents</h2>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image 
                src="/logos/PROXYNEWICON.png" 
                alt="Proxy" 
                width={40} 
                height={40}
                className="object-contain glow-effect"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{status.agent.name}</p>
              <div className="flex items-center gap-2">
                <span className="status-badge status-active text-xs">
                  {status.agent.status}
                </span>
                {status.agent.virtualsUrl && (
                  <a
                    href={status.agent.virtualsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/70 hover:text-white hover:underline flex items-center gap-1"
                  >
                    View on Virtuals <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-white" />
          ) : (
            <ChevronDown className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-6 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image 
                  src="/logos/PROXYNEWICON.png" 
                  alt="Proxy" 
                  width={48} 
                  height={48}
                  className="object-contain glow-effect"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{status.agent.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="status-badge status-active">
                    {status.agent.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    ID: {status.agent.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Wallet Address</p>
              <p className="text-sm font-mono text-white">
                {status.agent.walletAddress 
                  ? `${status.agent.walletAddress.slice(0, 6)}...${status.agent.walletAddress.slice(-4)}`
                  : "Not set"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {status.agent.platform || "Virtuals Protocol"}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
              <Zap className="w-5 h-5" />
              Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {status.capabilities.map((capability, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
              <Eye className="w-5 h-5" />
              Partner Integrations
            </h3>
            <div className="space-y-3">
              {Object.entries(status.integrations).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-dark/50 border border-white/10 rounded-lg hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-darker text-xs font-bold uppercase">
                        {key.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium capitalize text-gray-200">{key}</p>
                      <p className="text-sm text-gray-400">{value}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

