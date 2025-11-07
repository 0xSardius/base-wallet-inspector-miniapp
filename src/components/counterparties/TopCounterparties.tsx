"use client";

import { useState } from 'react';
import { useCounterparties } from '~/hooks/useCounterparties';
import { truncateAddress, formatEther, getBasescanAddressUrl } from '~/lib/utils';

interface TopCounterpartiesProps {
  address: string;
  limit?: number;
}

export function TopCounterparties({ address, limit = 10 }: TopCounterpartiesProps) {
  const [sortBy, setSortBy] = useState<'count' | 'volume'>('count');
  const { counterparties, isLoading, isError, error, refetch } = useCounterparties({
    address,
    limit,
    sortBy,
  });

  const displayedCounterparties = limit ? counterparties.slice(0, limit) : counterparties;

  if (isLoading) {
    return (
      <div className="card text-center py-12">
        <div className="spinner h-8 w-8 mx-auto mb-4"></div>
        <p className="font-bold">Loading counterparties...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card border-4 border-red-500 bg-red-50 p-6">
        <p className="font-bold text-red-900 mb-2">Error loading counterparties</p>
        <p className="text-red-700 mb-4">{error?.message || 'Unknown error'}</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (counterparties.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="font-bold text-lg mb-2">No counterparties found</p>
        <p className="text-gray-600">This wallet has no transaction history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort toggle */}
      {!limit && (
        <div className="card">
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('count')}
              className={`btn flex-1 ${sortBy === 'count' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Sort by Count
            </button>
            <button
              onClick={() => setSortBy('volume')}
              className={`btn flex-1 ${sortBy === 'volume' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Sort by Volume
            </button>
          </div>
        </div>
      )}

      {/* Counterparties list */}
      <div className="space-y-3">
        {displayedCounterparties.map((counterparty, index) => (
          <div
            key={counterparty.address}
            className="card hover:bg-neon/5 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 border-4 border-black bg-gray-100 flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      {counterparty.ens_name || truncateAddress(counterparty.address)}
                    </h4>
                    {counterparty.ens_name && (
                      <p className="text-xs font-mono text-gray-600">
                        {truncateAddress(counterparty.address)}
                      </p>
                    )}
                    {counterparty.isContract && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 border-2 border-black text-xs font-bold">
                        CONTRACT
                      </span>
                    )}
                  </div>
                </div>

                <a
                  href={getBasescanAddressUrl(counterparty.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-gray-600 hover:text-neon"
                >
                  {counterparty.address}
                </a>
              </div>

              <div className="text-right">
                <div className="mb-2">
                  <p className="text-xs text-gray-600">Interactions</p>
                  <p className="font-bold text-lg">{counterparty.interaction_count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Volume</p>
                  <p className="font-bold">
                    {formatEther(counterparty.total_value)} ETH
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more indicator */}
      {limit && counterparties.length > limit && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Showing top {limit} counterparties
          </p>
        </div>
      )}
    </div>
  );
}

