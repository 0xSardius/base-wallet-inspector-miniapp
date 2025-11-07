"use client";

import { useState, useMemo } from 'react';
import { useTransactions } from '~/hooks/useTransactions';
import { formatDate, formatDateOnly, formatEther, truncateAddress, getBasescanTxUrl } from '~/lib/utils';
import type { Transaction, TransactionFilters } from '~/types';

interface TransactionHistoryProps {
  address: string;
}

export function TransactionHistory({ address }: TransactionHistoryProps) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
  });
  const itemsPerPage = 20;

  const { transactions, isLoading, isError, error, refetch } = useTransactions({
    address,
    limit: 1000, // Fetch more to allow filtering
  });

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((tx) => tx.type === filters.type);
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromTimestamp = Math.floor(new Date(filters.dateFrom).getTime() / 1000);
      filtered = filtered.filter((tx) => parseInt(tx.block_timestamp) >= fromTimestamp);
    }

    if (filters.dateTo) {
      const toTimestamp = Math.floor(new Date(filters.dateTo).getTime() / 1000);
      filtered = filtered.filter((tx) => parseInt(tx.block_timestamp) <= toTimestamp);
    }

    // Filter by min amount
    if (filters.minAmount) {
      const minWei = BigInt(Math.floor(parseFloat(filters.minAmount) * 1e18));
      filtered = filtered.filter((tx) => BigInt(tx.value) >= minWei);
    }

    return filtered;
  }, [transactions, filters]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};

    filteredTransactions.forEach((tx) => {
      const date = formatDateOnly(tx.block_timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  // Paginate grouped transactions
  const paginatedGroups = useMemo(() => {
    const dates = Object.keys(groupedTransactions).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return dates.slice(startIndex, endIndex).map((date) => ({
      date,
      transactions: groupedTransactions[date],
    }));
  }, [groupedTransactions, page]);

  const totalPages = Math.ceil(Object.keys(groupedTransactions).length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="card text-center py-12">
        <div className="spinner h-8 w-8 mx-auto mb-4"></div>
        <p className="font-bold">Loading transactions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card border-4 border-red-500 bg-red-50 p-6">
        <p className="font-bold text-red-900 mb-2">Error loading transactions</p>
        <p className="text-red-700 mb-4">{error?.message || 'Unknown error'}</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="font-bold text-lg mb-2">No transactions found</p>
        <p className="text-gray-600">
          {transactions.length === 0
            ? 'This wallet has no transactions'
            : 'No transactions match your filters'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <h3 className="font-bold text-lg mb-4">FILTERS</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Type</label>
            <select
              value={filters.type || 'all'}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value as 'all' | 'send' | 'receive' })
              }
              className="input w-full"
            >
              <option value="all">All</option>
              <option value="send">Sent</option>
              <option value="receive">Received</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Min Amount (ETH)</label>
            <input
              type="number"
              step="0.0001"
              value={filters.minAmount || ''}
              onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
              placeholder="0.0"
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Transactions grouped by date */}
      <div className="space-y-6">
        {paginatedGroups.map((group) => (
          <div key={group.date} className="card">
            <h3 className="font-bold text-lg mb-4 border-b-4 border-black pb-2">
              {group.date}
            </h3>
            <div className="space-y-3">
              {group.transactions.map((tx) => (
                <div
                  key={tx.transaction_hash}
                  className="border-2 border-black p-4 hover:bg-neon/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <a
                        href={getBasescanTxUrl(tx.transaction_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm hover:text-neon font-bold"
                      >
                        {truncateAddress(tx.transaction_hash)}
                      </a>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(tx.block_timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 border-2 border-black font-bold text-xs ${
                          tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'
                        }`}
                      >
                        {tx.type === 'send' ? 'SENT' : 'RECEIVED'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">From:</span>
                      <p className="font-mono font-bold">{truncateAddress(tx.from_address)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">To:</span>
                      <p className="font-mono font-bold">{truncateAddress(tx.to_address)}</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t-2 border-black">
                    <span className="font-bold">
                      {formatEther(tx.value)} ETH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

