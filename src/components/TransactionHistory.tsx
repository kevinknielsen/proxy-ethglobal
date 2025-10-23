"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react";
import { BlockScoutTransaction } from "@/types/governance";

interface TransactionWithSummary extends BlockScoutTransaction {
  summary: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionWithSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions?limit=15");
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="card-gradient rounded-xl p-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
          <p className="text-gray-500">
            Governance actions will appear here once executed
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {tx.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-semibold">{tx.summary}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatTimestamp(tx.timestamp)}
                  </p>
                </div>
                <a
                  href={`https://eth.blockscout.com/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm"
                >
                  View
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">From</p>
                  <p className="font-mono text-xs">
                    {tx.from.slice(0, 10)}...{tx.from.slice(-8)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">To</p>
                  <p className="font-mono text-xs">
                    {tx.to.slice(0, 10)}...{tx.to.slice(-8)}
                  </p>
                </div>
              </div>

              {tx.decoded && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm">
                    <span className="text-gray-500">Method:</span>{" "}
                    <span className="font-mono font-semibold">
                      {tx.decoded.methodName}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

