/**
 * Hook to fetch top counterparties for a wallet
 */

import { useCDPQuery } from './useCDPQuery';
import { normalizeAddress } from '~/lib/utils';
import type { Counterparty } from '~/types';
import { useMemo } from 'react';

interface UseCounterpartiesOptions {
  address: string;
  limit?: number;
  sortBy?: 'count' | 'volume';
  enabled?: boolean;
}

export function useCounterparties({
  address,
  limit = 10,
  sortBy = 'count',
  enabled = true,
}: UseCounterpartiesOptions) {
  const normalizedAddress = address ? normalizeAddress(address) : '';

  const sql = normalizedAddress
    ? `
      SELECT
        CASE
          WHEN from_address = '${normalizedAddress}' THEN to_address
          ELSE from_address
        END as counterparty,
        count(*) as interaction_count,
        sum(CAST(value AS UInt256)) as total_value
      FROM base.transactions
      WHERE from_address = '${normalizedAddress}' OR to_address = '${normalizedAddress}'
      GROUP BY counterparty
      ORDER BY ${sortBy === 'count' ? 'interaction_count' : 'total_value'} DESC
      LIMIT ${limit}
    `
    : '';

  const query = useCDPQuery({
    sql,
    enabled: enabled && !!normalizedAddress,
    address: normalizedAddress,
  });

  const counterparties: Counterparty[] = useMemo(() => {
    if (!query.data?.data) return [];

    return query.data.data.map((item: any) => ({
      address: item.counterparty?.toLowerCase() || '',
      interaction_count: item.interaction_count || 0,
      total_value: item.total_value?.toString() || '0',
      // TODO: Add ENS resolution and contract detection
      isContract: false, // Would need to check against contract addresses
    }));
  }, [query.data]);

  return {
    ...query,
    counterparties,
  };
}

