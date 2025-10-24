"use client";

import { useEffect, useState } from "react";
import { FileText, Users, Calendar, TrendingUp } from "lucide-react";
import { Proposal, ProposalState } from "@/types/governance";

// Format large vote numbers (in wei) to readable format
function formatVotes(votes: string | undefined): string {
  if (!votes) return "0";
  try {
    const num = BigInt(votes);
    // COMP has 18 decimals, so divide by 10^18
    // Use BigInt division to preserve precision for large numbers
    const compVotes = Number(num / BigInt(1e18));
    
    if (compVotes >= 1000000) {
      return `${(compVotes / 1000000).toFixed(2)}M`;
    } else if (compVotes >= 1000) {
      return `${(compVotes / 1000).toFixed(2)}K`;
    }
    return compVotes.toFixed(2);
  } catch {
    return "0";
  }
}

export default function ProposalList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/governance/proposals?limit=10");
      const data = await response.json();
      if (data.success) {
        setProposals(data.proposals);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: ProposalState) => {
    switch (state) {
      case ProposalState.Active:
        return "status-active";
      case ProposalState.Pending:
        return "status-pending";
      case ProposalState.Succeeded:
        return "status-succeeded";
      case ProposalState.Executed:
        return "status-executed";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStateName = (state: ProposalState) => {
    const stateNames = [
      "Pending",
      "Active",
      "Canceled",
      "Defeated",
      "Succeeded",
      "Queued",
      "Expired",
      "Executed",
    ];
    return stateNames[state] || "Unknown";
  };

  const handleAction = async (proposalId: string, action: string) => {
    try {
      const response = await fetch("/api/governance/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          proposalId,
          support: action === "vote" ? 1 : undefined, // Vote FOR by default
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully ${action}ed proposal ${proposalId}!\nTx: ${data.txHash}`);
        fetchProposals(); // Refresh list
      } else {
        alert(`Failed to ${action}: ${data.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing proposal:`, error);
      alert(`Failed to ${action} proposal`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-gradient rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="card-gradient rounded-xl p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Proposals Found</h3>
        <p className="text-gray-500">
          Waiting for governance events from Envio HyperSync...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Active Proposals</h2>
        <button
          onClick={fetchProposals}
          className="px-4 py-2 bg-white text-darker font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all"
        >
          Refresh
        </button>
      </div>

      {proposals.map((proposal) => (
        <div key={proposal.id} className="card-gradient rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">
                  Proposal #{proposal.id}
                </h3>
                <span className={`status-badge ${getStateColor(proposal.state)}`}>
                  {getStateName(proposal.state)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {proposal.description.length > 200 
                  ? proposal.description.slice(0, 200) + "..." 
                  : proposal.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Proposer</p>
                <p className="text-sm font-mono">
                  {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm">
                  {new Date(proposal.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {proposal.forVotes !== undefined && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">For Votes</p>
                  <p className="text-sm font-semibold text-green-600">
                    {formatVotes(proposal.forVotes.toString())} COMP
                  </p>
                </div>
              </div>
            )}

            {proposal.againstVotes !== undefined && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                <div>
                  <p className="text-xs text-gray-500">Against Votes</p>
                  <p className="text-sm font-semibold text-red-600">
                    {formatVotes(proposal.againstVotes.toString())} COMP
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {proposal.state === ProposalState.Active && (
              <button
                onClick={() => handleAction(proposal.id, "vote")}
                className="px-4 py-2 bg-white text-darker font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all text-sm"
              >
                Vote FOR
              </button>
            )}
            {proposal.state === ProposalState.Succeeded && (
              <button
                onClick={() => handleAction(proposal.id, "queue")}
                className="px-4 py-2 bg-gray-200 text-darker font-semibold rounded-lg hover:shadow-lg hover:shadow-gray-200/20 transition-all text-sm"
              >
                Queue
              </button>
            )}
            {proposal.state === ProposalState.Queued && (
              <button
                onClick={() => handleAction(proposal.id, "execute")}
                className="px-4 py-2 bg-gray-300 text-darker font-semibold rounded-lg hover:shadow-lg hover:shadow-gray-300/20 transition-all text-sm"
              >
                Execute
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

