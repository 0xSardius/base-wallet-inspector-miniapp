/**
 * Hook to fetch transaction history for a wallet
 */

import { useCDPQuery } from './useCDPQuery';
import { normalizeAddress } from '~/lib/utils';
import type { Transaction } from '~/types';

interface UseTransactionsOptions {
  address: string;
  limit?: number;
  enabled?: boolean;
}

export function useTransactions({ address, limit = 50, enabled = true }: UseTransactionsOptions) {
  const normalizedAddress = address ? normalizeAddress(address) : '';

  const sql = normalizedAddress
    ? `
      SELECT
        transaction_hash,
        block_number,
        block_timestamp,
        from_address,
        to_address,
        value,
        gas_used,
        gas_price
      FROM base.transactions
      WHERE from_address = '${normalizedAddress}' OR to_address = '${normalizedAddress}'
      ORDER BY block_number DESC
      LIMIT ${limit}
    `
    : '';

  const query = useCDPQuery({
    sql,
    enabled: enabled && !!normalizedAddress,
    address: normalizedAddress,
  });

  // Transform data and determine transaction type
  const transactions: Transaction[] = query.data?.data?.map((tx: any) => ({
    ...tx,
    type: tx.from_address.toLowerCase() === normalizedAddress ? 'send' : 'receive',
  })) || [];

  return {
    ...query,
    transactions,
  };
}

