"use client";

import { useState } from 'react';
import { useTokenHoldings } from '~/hooks/useTokenHoldings';
import { formatEther, formatUSD, truncateAddress, getBasescanAddressUrl } from '~/lib/utils';

interface TokenHoldingsProps {
  address: string;
  limit?: number;
}

export function TokenHoldings({ address, limit }: TokenHoldingsProps) {
  const [filter, setFilter] = useState<'all' | 'tokens' | 'native'>('all');
  const { tokenBalances, isLoading, isError, error, refetch } = useTokenHoldings({ address });

  // Filter tokens
  const filteredBalances = tokenBalances.filter((token) => {
    if (filter === 'native') return token.isNative;
    if (filter === 'tokens') return !token.isNative;
    return true;
  });

  // Apply limit if specified
  const displayedBalances = limit ? filteredBalances.slice(0, limit) : filteredBalances;

  if (isLoading) {
    return (
      <div className="card text-center py-12">
        <div className="spinner h-8 w-8 mx-auto mb-4"></div>
        <p className="font-bold">Loading token holdings...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card border-4 border-red-500 bg-red-50 p-6">
        <p className="font-bold text-red-900 mb-2">Error loading tokens</p>
        <p className="text-red-700 mb-4">{error?.message || 'Unknown error'}</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (tokenBalances.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="font-bold text-lg mb-2">No token holdings</p>
        <p className="text-gray-600">This wallet has no token balances</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      {!limit && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn flex-1 ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('native')}
            className={`btn flex-1 ${filter === 'native' ? 'btn-primary' : 'btn-secondary'}`}
          >
            ETH
          </button>
          <button
            onClick={() => setFilter('tokens')}
            className={`btn flex-1 ${filter === 'tokens' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Tokens
          </button>
        </div>
      )}

      {/* Token list */}
      <div className="space-y-3">
        {displayedBalances.map((token) => (
          <div
            key={token.contract_address}
            className="card hover:bg-neon/5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 border-4 border-black bg-gray-100 flex items-center justify-center font-bold">
                    {token.symbol?.slice(0, 2).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      {token.symbol || 'Unknown Token'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {token.name || truncateAddress(token.contract_address)}
                    </p>
                  </div>
                </div>

                {!token.isNative && (
                  <a
                    href={getBasescanAddressUrl(token.contract_address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-gray-600 hover:text-neon"
                  >
                    {truncateAddress(token.contract_address)}
                  </a>
                )}
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">
                  {parseFloat(token.balanceFormatted).toLocaleString('en-US', {
                    maximumFractionDigits: 4,
                  })}{' '}
                  {token.symbol || 'TOK'}
                </p>
                {token.usdValue && (
                  <p className="text-sm text-gray-600">{formatUSD(token.usdValue)}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more indicator */}
      {limit && tokenBalances.length > limit && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Showing {limit} of {tokenBalances.length} tokens
          </p>
        </div>
      )}

      {/* Total value (if we had USD prices) */}
      {tokenBalances.some((t) => t.usdValue) && (
        <div className="card bg-neon/10 border-4 border-black">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total Value:</span>
            <span className="font-bold text-lg">
              {formatUSD(
                tokenBalances.reduce((sum, token) => sum + (token.usdValue || 0), 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

