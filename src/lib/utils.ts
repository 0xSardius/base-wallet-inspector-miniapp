/**
 * Utility functions for the wallet inspector
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Ethereum address - truncate to show first 6 and last 4 characters
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length < start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format wei to ETH
 */
export function formatEther(wei: string | bigint): string {
  const weiBigInt = typeof wei === 'string' ? BigInt(wei) : wei;
  const eth = Number(weiBigInt) / 1e18;
  return eth.toFixed(4);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  return numValue.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
}

/**
 * Format USD value
 */
export function formatUSD(value: number | undefined): string {
  if (value === undefined || isNaN(value)) return 'N/A';
  return `$${formatNumber(value)}`;
}

/**
 * Get Basescan URL for a transaction
 */
export function getBasescanTxUrl(txHash: string): string {
  return `https://basescan.org/tx/${txHash}`;
}

/**
 * Get Basescan URL for an address
 */
export function getBasescanAddressUrl(address: string): string {
  return `https://basescan.org/address/${address}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: string | number): string {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format timestamp to date only (for grouping)
 */
export function formatDateOnly(timestamp: string | number): string {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get day name from day number (0 = Sunday, 6 = Saturday)
 */
export function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || 'Unknown';
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Convert address to lowercase for consistent querying
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}
