/**
 * Hook to fetch activity data for heatmap visualization
 */

import { useCDPQuery } from './useCDPQuery';
import { normalizeAddress } from '~/lib/utils';
import type { ActivityHour, ActivityDay } from '~/types';
import { useMemo } from 'react';

interface UseActivityHeatmapOptions {
  address: string;
  enabled?: boolean;
}

export function useActivityHeatmap({ address, enabled = true }: UseActivityHeatmapOptions) {
  const normalizedAddress = address ? normalizeAddress(address) : '';

  // Query for hourly activity
  const hourlySql = normalizedAddress
    ? `
      SELECT
        toHour(block_timestamp) as hour,
        count(*) as tx_count
      FROM base.transactions
      WHERE (from_address = '${normalizedAddress}' OR to_address = '${normalizedAddress}')
        AND block_timestamp >= now() - INTERVAL 30 DAY
      GROUP BY hour
      ORDER BY hour
    `
    : '';

  const hourlyQuery = useCDPQuery({
    sql: hourlySql,
    enabled: enabled && !!normalizedAddress,
    address: normalizedAddress,
  });

  // Query for daily activity (day of week)
  const dailySql = normalizedAddress
    ? `
      SELECT
        toDayOfWeek(block_timestamp) - 1 as day,
        count(*) as tx_count
      FROM base.transactions
      WHERE (from_address = '${normalizedAddress}' OR to_address = '${normalizedAddress}')
        AND block_timestamp >= now() - INTERVAL 30 DAY
      GROUP BY day
      ORDER BY day
    `
    : '';

  const dailyQuery = useCDPQuery({
    sql: dailySql,
    enabled: enabled && !!normalizedAddress,
    address: normalizedAddress,
  });

  // Process hourly data
  const hourlyData: ActivityHour[] = useMemo(() => {
    if (!hourlyQuery.data?.data) {
      // Return empty array with all 24 hours
      return Array.from({ length: 24 }, (_, i) => ({ hour: i, tx_count: 0 }));
    }

    const dataMap = new Map<number, number>();
    hourlyQuery.data.data.forEach((item: any) => {
      dataMap.set(item.hour, item.tx_count);
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      tx_count: dataMap.get(i) || 0,
    }));
  }, [hourlyQuery.data]);

  // Process daily data
  const dailyData: ActivityDay[] = useMemo(() => {
    if (!dailyQuery.data?.data) {
      // Return empty array with all 7 days
      return Array.from({ length: 7 }, (_, i) => ({ day: i, tx_count: 0 }));
    }

    const dataMap = new Map<number, number>();
    dailyQuery.data.data.forEach((item: any) => {
      dataMap.set(item.day, item.tx_count);
    });

    return Array.from({ length: 7 }, (_, i) => ({
      day: i,
      tx_count: dataMap.get(i) || 0,
    }));
  }, [dailyQuery.data]);

  // Calculate max for normalization
  const maxHourly = Math.max(...hourlyData.map((d) => d.tx_count), 1);
  const maxDaily = Math.max(...dailyData.map((d) => d.tx_count), 1);

  return {
    hourlyData,
    dailyData,
    maxHourly,
    maxDaily,
    isLoading: hourlyQuery.isLoading || dailyQuery.isLoading,
    isError: hourlyQuery.isError || dailyQuery.isError,
    error: hourlyQuery.error || dailyQuery.error,
    refetch: () => {
      hourlyQuery.refetch();
      dailyQuery.refetch();
    },
  };
}

