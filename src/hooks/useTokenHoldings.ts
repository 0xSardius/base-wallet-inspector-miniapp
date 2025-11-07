/**
 * Hook to fetch and aggregate token holdings for a wallet
 */

import { useCDPQuery } from './useCDPQuery';
import { normalizeAddress, formatEther } from '~/lib/utils';
import type { TokenBalance } from '~/types';
import { useMemo } from 'react';

interface UseTokenHoldingsOptions {
  address: string;
  enabled?: boolean;
}

export function useTokenHoldings({ address, enabled = true }: UseTokenHoldingsOptions) {
  const normalizedAddress = address ? normalizeAddress(address) : '';

  // Query for token transfers
  const transfersSql = normalizedAddress
    ? `
      SELECT
        transaction_hash,
        block_timestamp,
        contract_address,
        from_address,
        to_address,
        value
      FROM base.transfers
      WHERE from_address = '${normalizedAddress}' OR to_address = '${normalizedAddress}'
      ORDER BY block_timestamp DESC
      LIMIT 1000
    `
    : '';

  const transfersQuery = useCDPQuery({
    sql: transfersSql,
    enabled: enabled && !!normalizedAddress,
    address: normalizedAddress,
  });

  // Query for native ETH balance (from transactions)
  const ethBalanceSql = normalizedAddress
    ? `
      SELECT
        SUM(CASE WHEN to_address = '${normalizedAddress}' THEN CAST(value AS UInt256) ELSE 0 END) -
        SUM(CASE WHEN from_address = '${normalizedAddress}' THEN CAST(value AS UInt256) ELSE 0 END) as balance
      FROM base.transactions
      WHERE from_address = '${normalizedAddress}' OR to_address = '${normalizedAddress}'
    `
    : '';

  const ethBalanceQuery = useCDPQuery({
    sql: ethBalanceSql,
    enabled: enabled && !!normalizedAddress,
    address: normalizedAddress,
  });

  // Aggregate token balances
  const tokenBalances = useMemo(() => {
    if (!transfersQuery.data?.data) return [];

    const balances: Map<string, TokenBalance> = new Map();

    // Process transfers
    transfersQuery.data.data.forEach((transfer: any) => {
      const contractAddress = transfer.contract_address?.toLowerCase();
      if (!contractAddress) return;

      const isIncoming = transfer.to_address?.toLowerCase() === normalizedAddress;
      const isOutgoing = transfer.from_address?.toLowerCase() === normalizedAddress;

      if (!balances.has(contractAddress)) {
        balances.set(contractAddress, {
          contract_address: contractAddress,
          balance: '0',
          balanceFormatted: '0',
          decimals: 18, // Default, should fetch from contract
        });
      }

      const balance = balances.get(contractAddress)!;
      const transferValue = BigInt(transfer.value || '0');

      if (isIncoming) {
        balance.balance = (BigInt(balance.balance) + transferValue).toString();
      } else if (isOutgoing) {
        balance.balance = (BigInt(balance.balance) - transferValue).toString();
      }

      balance.balanceFormatted = formatEther(balance.balance);
    });

    // Add native ETH balance
    const ethBalance = ethBalanceQuery.data?.data?.[0]?.balance || '0';
    if (BigInt(ethBalance) > 0n) {
      balances.set('native', {
        contract_address: 'native',
        symbol: 'ETH',
        name: 'Ethereum',
        balance: ethBalance,
        balanceFormatted: formatEther(ethBalance),
        isNative: true,
      });
    }

    return Array.from(balances.values())
      .filter((b) => BigInt(b.balance) > 0n)
      .sort((a, b) => {
        // Sort by USD value if available, otherwise by balance
        if (a.usdValue && b.usdValue) {
          return b.usdValue - a.usdValue;
        }
        return BigInt(b.balance) > BigInt(a.balance) ? 1 : -1;
      });
  }, [transfersQuery.data, ethBalanceQuery.data, normalizedAddress]);

  return {
    tokenBalances,
    isLoading: transfersQuery.isLoading || ethBalanceQuery.isLoading,
    isError: transfersQuery.isError || ethBalanceQuery.isError,
    error: transfersQuery.error || ethBalanceQuery.error,
    refetch: () => {
      transfersQuery.refetch();
      ethBalanceQuery.refetch();
    },
  };
}

