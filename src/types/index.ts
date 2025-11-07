/**
 * TypeScript types for the Base Wallet Inspector app
 */

export interface Transaction {
  transaction_hash: string;
  block_number: number;
  block_timestamp: string;
  from_address: string;
  to_address: string;
  value: string; // in wei
  gas_used: string;
  gas_price: string;
  type?: 'send' | 'receive';
}

export interface TokenTransfer {
  transaction_hash: string;
  block_timestamp: string;
  contract_address: string;
  from_address: string;
  to_address: string;
  value: string;
  decoded_log?: any;
}

export interface TokenBalance {
  contract_address: string;
  symbol?: string;
  name?: string;
  balance: string; // raw balance
  balanceFormatted: string; // human-readable
  usdValue?: number;
  decimals?: number;
  isNative?: boolean; // true for ETH
}

export interface ActivityHour {
  hour: number;
  tx_count: number;
}

export interface ActivityDay {
  day: number; // 0-6 (Sunday-Saturday)
  tx_count: number;
}

export interface Counterparty {
  address: string;
  interaction_count: number;
  total_value: string; // in wei
  ens_name?: string;
  isContract?: boolean;
}

export interface QuickAuthUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custody_address?: string;
  verified_addresses?: string[];
}

export interface CDPQueryResponse {
  data: any[];
  error?: string;
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: 'send' | 'receive' | 'all';
  minAmount?: string; // in ETH
}

