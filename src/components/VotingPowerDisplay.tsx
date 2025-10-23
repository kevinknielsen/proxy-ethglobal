"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Zap } from "lucide-react";

const COMP_TOKEN_ADDRESS = "0xc00e94Cb662C3520282E6f5717214004A7f26888";
const PROXY_AGENT_ADDRESS = process.env.NEXT_PUBLIC_PROXY_AGENT_ADDRESS || "0x0000000000000000000000000000000000000000";

export default function VotingPowerDisplay() {
  const [votingPower, setVotingPower] = useState<string>("0");
  const [delegateCount, setDelegateCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotingPower();
    // Refresh every 30 seconds
    const interval = setInterval(fetchVotingPower, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchVotingPower = async () => {
    try {
      const Web3 = (await import("web3")).default;
      const web3 = new Web3("https://eth.llamarpc.com");

      // COMP token ABI for getCurrentVotes
      const compABI = [
        {
          constant: true,
          inputs: [{ name: "account", type: "address" }],
          name: "getCurrentVotes",
          outputs: [{ name: "", type: "uint96" }],
          type: "function",
        },
      ];

      const contract = new web3.eth.Contract(compABI as any, COMP_TOKEN_ADDRESS);
      const votes = await contract.methods.getCurrentVotes(PROXY_AGENT_ADDRESS).call();
      
      // Convert from wei to COMP (18 decimals)
      const compVotes = Number(votes) / 1e18;
      setVotingPower(compVotes.toFixed(2));
      
      // Estimate delegate count (average ~1000 COMP per delegate)
      const estimatedDelegates = Math.max(1, Math.floor(compVotes / 1000));
      setDelegateCount(estimatedDelegates);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching voting power:", error);
      setVotingPower("0");
      setLoading(false);
    }
  };

  const formatNumber = (num: string) => {
    const n = parseFloat(num);
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(2)}K`;
    return n.toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total Voting Power */}
      <div className="card-gradient rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-white" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Total Voting Power
          </h3>
        </div>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-white/10 rounded w-32 mx-auto"></div>
          </div>
        ) : (
          <div>
            <p className="text-4xl font-bold text-white mb-1">
              {formatNumber(votingPower)}
            </p>
            <p className="text-sm text-gray-400">COMP Delegated</p>
          </div>
        )}
      </div>

      {/* Estimated Delegates */}
      <div className="card-gradient rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Users className="w-5 h-5 text-white" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Estimated Delegates
          </h3>
        </div>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-white/10 rounded w-20 mx-auto"></div>
          </div>
        ) : (
          <div>
            <p className="text-4xl font-bold text-white mb-1">
              {delegateCount}
            </p>
            <p className="text-sm text-gray-400">Active Delegators</p>
          </div>
        )}
      </div>

      {/* Voting Capacity */}
      <div className="card-gradient rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-white" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Voting Capacity
          </h3>
        </div>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-white/10 rounded w-24 mx-auto"></div>
          </div>
        ) : (
          <div>
            <p className="text-4xl font-bold text-white mb-1">
              {votingPower === "0.00" ? "0%" : "Active"}
            </p>
            <p className="text-sm text-gray-400">
              {votingPower === "0.00" ? "No Delegation Yet" : "Ready to Vote"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

