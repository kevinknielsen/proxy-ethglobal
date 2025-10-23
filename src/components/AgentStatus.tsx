"use client";

import { useEffect, useState } from "react";
import { Zap, Eye, CheckCircle } from "lucide-react";
import Image from "next/image";

interface AgentStatusData {
  agent: {
    id: string;
    name: string;
    status: string;
    lastActive: string;
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
    <div className="card-gradient rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden glow-effect">
            <Image 
              src="/logos/proxy.jpg" 
              alt="Proxy" 
              width={48} 
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{status.agent.name}</h2>
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
          <p className="text-sm text-gray-500">Last Active</p>
          <p className="text-sm font-medium">
            {new Date(status.agent.lastActive).toLocaleString()}
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
  );
}

