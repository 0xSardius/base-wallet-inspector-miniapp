/**
 * React Query hook for executing CDP SQL queries
 */

import { useQuery } from '@tanstack/react-query';
import type { CDPQueryResponse } from '~/types';

interface UseCDPQueryOptions {
  sql: string;
  enabled?: boolean;
  address?: string;
}

export function useCDPQuery({ sql, enabled = true, address }: UseCDPQueryOptions) {
  return useQuery<CDPQueryResponse>({
    queryKey: ['cdp-query', sql, address],
    queryFn: async () => {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, address }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute query');
      }

      return response.json();
    },
    enabled: enabled && !!sql,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

