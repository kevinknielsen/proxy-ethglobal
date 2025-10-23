"use client";

import { useState } from "react";
import { Shield, ExternalLink } from "lucide-react";

const COMP_TOKEN_ADDRESS = "0xc00e94Cb662C3520282E6f5717214004A7f26888";
const PROXY_AGENT_ADDRESS = process.env.NEXT_PUBLIC_PROXY_AGENT_ADDRESS || "0x0000000000000000000000000000000000000000";

export default function DelegateButton() {
  const [delegating, setDelegating] = useState(false);
  const [delegated, setDelegated] = useState(false);

  const handleDelegate = async () => {
    try {
      setDelegating(true);

      // Check if MetaMask is installed
      if (!window.ethereum) {
        alert("Please install MetaMask to delegate your COMP voting power!");
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAddress = accounts[0];

      // COMP token ABI for delegation
      const compABI = [
        {
          constant: false,
          inputs: [{ name: "delegatee", type: "address" }],
          name: "delegate",
          outputs: [],
          type: "function",
        },
      ];

      // Encode the delegate function call
      const web3 = await import("web3");
      const contract = new web3.default.eth.Contract(compABI as any, COMP_TOKEN_ADDRESS);
      const data = contract.methods.delegate(PROXY_AGENT_ADDRESS).encodeABI();

      // Send transaction
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: userAddress,
            to: COMP_TOKEN_ADDRESS,
            data: data,
          },
        ],
      });

      console.log("Delegation transaction sent:", txHash);
      alert(`Delegation successful! Tx: ${txHash}`);
      setDelegated(true);
    } catch (error) {
      console.error("Delegation error:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Failed to delegate"}`);
    } finally {
      setDelegating(false);
    }
  };

  return (
    <div className="card-gradient rounded-xl p-6 mb-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-8 h-8 text-white" />
          <h2 className="text-2xl font-bold text-white">Delegate Your Voting Power</h2>
        </div>

        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Delegate your COMP voting power to Proxy agent. You keep your tokens,
          and Proxy votes on your behalf using Lit Protocol's non-custodial execution.
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-left">
            <p className="text-xs text-gray-500">Proxy Agent Address</p>
            <p className="text-sm font-mono text-gray-300">
              {PROXY_AGENT_ADDRESS.slice(0, 8)}...{PROXY_AGENT_ADDRESS.slice(-6)}
            </p>
          </div>
          <a
            href={`https://etherscan.io/address/${PROXY_AGENT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {delegated ? (
          <div className="bg-white/10 border border-white/20 rounded-lg px-6 py-4 inline-block">
            <p className="text-white font-semibold">✅ Successfully Delegated!</p>
            <p className="text-sm text-gray-400 mt-1">
              Proxy can now vote with your COMP power
            </p>
          </div>
        ) : (
          <button
            onClick={handleDelegate}
            disabled={delegating}
            className="px-8 py-3 bg-white text-darker font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {delegating ? "Delegating..." : "Delegate to Proxy"}
          </button>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>
            💡 You can revoke delegation anytime by delegating to yourself or another address
          </p>
        </div>
      </div>
    </div>
  );
}

