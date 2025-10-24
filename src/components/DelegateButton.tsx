"use client";

import { useState, useEffect } from "react";
import { Shield, ExternalLink, Wallet } from "lucide-react";

const COMP_TOKEN_ADDRESS = "0xc00e94Cb662C3520282E6f5717214004A7f26888";
const PROXY_AGENT_ADDRESS = process.env.NEXT_PUBLIC_PROXY_AGENT_ADDRESS || "0xA736A27F53ADB6536C20f81D254Fa6cDfd79B37a";

export default function DelegateButton() {
  const [delegating, setDelegating] = useState(false);
  const [delegated, setDelegated] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [compBalance, setCompBalance] = useState("0");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check if already delegated (from localStorage)
    try {
      const savedDelegation = localStorage.getItem("proxy_delegation");
      if (savedDelegation) {
        const data = JSON.parse(savedDelegation);
        if (data && data.txHash && data.address) {
          setDelegated(true);
          setTxHash(data.txHash);
          setWalletAddress(data.address);
        }
      }
    } catch (error) {
      console.error("Error loading saved delegation:", error);
      // Clear corrupted data
      try {
        localStorage.removeItem("proxy_delegation");
      } catch (e) {
        // localStorage not available, ignore
      }
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to delegate your COMP voting power!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      setWalletAddress(address);
      setConnected(true);

      // Get COMP balance (always check Ethereum mainnet)
      const { ethers } = await import("ethers");
      const mainnetProvider = new ethers.JsonRpcProvider("https://ethereum-rpc.publicnode.com");
      const compContract = new ethers.Contract(
        COMP_TOKEN_ADDRESS,
        ["function balanceOf(address) view returns (uint256)"],
        mainnetProvider
      );
      
      const balance = await compContract.balanceOf(address);
      const formattedBalance = ethers.formatUnits(balance, 18);
      setCompBalance(parseFloat(formattedBalance).toFixed(4));
      
      console.log(`Connected wallet, COMP Balance on Ethereum mainnet: ${formattedBalance}`);
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect wallet");
    }
  };

  const handleDelegate = async () => {
    try {
      setDelegating(true);

      if (!connected || !walletAddress) {
        await connectWallet();
        return;
      }

      console.log(`🔗 Delegating COMP voting power to Proxy agent`);

      const { ethers } = await import("ethers");
      
      // Validate proxy agent address
      if (!ethers.isAddress(PROXY_AGENT_ADDRESS)) {
        const error = "Invalid proxy agent address configured";
        console.error(error, PROXY_AGENT_ADDRESS);
        alert(`Configuration error: ${error}. Please contact support.`);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      // Ensure we're on Ethereum mainnet (chainId 1)
      if (network.chainId !== 1n) {
        alert(`Please switch to Ethereum Mainnet in MetaMask.\n\nCOMP delegation must be done on Ethereum mainnet (you're on chain ${network.chainId}).`);
        
        // Request network switch
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }], // Ethereum mainnet
          });
          // Retry after switch
          await handleDelegate();
        } catch (switchError: any) {
          console.error("Network switch error:", switchError);
          if (switchError.code === 4001) {
            alert("Please switch to Ethereum Mainnet manually to delegate COMP.");
          }
        }
        return;
      }

      const signer = await provider.getSigner();

      // COMP token contract
      const compContract = new ethers.Contract(
        COMP_TOKEN_ADDRESS,
        ["function delegate(address delegatee) external"],
        signer
      );

      // Send delegation transaction
      const tx = await compContract.delegate(PROXY_AGENT_ADDRESS);
      console.log("Transaction sent:", tx.hash);
      
      // Wait for confirmation
      await tx.wait();
      console.log("✅ Delegation confirmed!");

      setTxHash(tx.hash);
      setDelegated(true);

      // Save to localStorage to persist across refreshes
      localStorage.setItem("proxy_delegation", JSON.stringify({
        txHash: tx.hash,
        address: walletAddress,
        timestamp: Date.now(),
      }));

      // Trigger voting power refresh
      window.dispatchEvent(new Event("delegation-updated"));
      
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
          and Proxy votes on your behalf using Lit Protocol&apos;s non-custodial execution.
        </p>

        {connected && (
          <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-4 inline-block">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-white" />
              <div className="text-left">
                <p className="text-xs text-gray-400">Connected Wallet</p>
                <p className="text-sm font-mono text-white">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  COMP Balance: <span className="text-white font-semibold">{compBalance}</span>
                </p>
              </div>
            </div>
          </div>
        )}

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
            <p className="text-sm text-gray-400 mt-2">
              Proxy can now vote with your {compBalance} COMP
            </p>
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white hover:underline mt-2 inline-flex items-center gap-1"
            >
              View on Etherscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {!connected ? (
              <button
                onClick={connectWallet}
                className="px-8 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </span>
              </button>
            ) : (
              <button
                onClick={handleDelegate}
                disabled={delegating}
                className="px-8 py-3 bg-white text-darker font-semibold rounded-lg hover:shadow-lg hover:shadow-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {delegating ? "Delegating..." : "Delegate to Proxy"}
              </button>
            )}
          </div>
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

