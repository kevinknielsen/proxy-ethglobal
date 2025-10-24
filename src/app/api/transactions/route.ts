/**
 * Transaction History API
 * Fetches transaction history from BlockScout
 */

import { NextRequest, NextResponse } from "next/server";
import { blockScoutService } from "@/lib/blockscout";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!address) {
      // Return governance activity for Compound Governor
      const governorAddress = process.env.COMPOUND_GOVERNOR_ADDRESS || "0x309a862bbC1A00e45506cB8A802D1ff10004c8C0";
      const transactions = await blockScoutService.getGovernanceActivity(
        governorAddress,
        limit
      );

      // Generate summaries for each transaction
      const transactionsWithSummaries = transactions.map((tx) => ({
        ...tx,
        summary: blockScoutService.generateTransactionSummary(tx),
      }));

      return NextResponse.json({
        success: true,
        address: governorAddress,
        count: transactionsWithSummaries.length,
        transactions: transactionsWithSummaries,
      });
    }

    // Get transactions for specific address
    const transactions = await blockScoutService.getAddressTransactions(
      address,
      limit
    );

    const transactionsWithSummaries = transactions.map((tx) => ({
      ...tx,
      summary: blockScoutService.generateTransactionSummary(tx),
    }));

    return NextResponse.json({
      success: true,
      address,
      count: transactionsWithSummaries.length,
      transactions: transactionsWithSummaries,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

