"use client";

import { useState, useEffect } from 'react';
import { isValidAddress, normalizeAddress } from '~/lib/utils';

interface WalletInputProps {
  defaultAddress?: string;
  onAddressChange: (address: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function WalletInput({
  defaultAddress,
  onAddressChange,
  loading = false,
  error = null,
}: WalletInputProps) {
  const [inputValue, setInputValue] = useState(defaultAddress || '');
  const [localError, setLocalError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (defaultAddress) {
      setInputValue(defaultAddress);
    }
  }, [defaultAddress]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setLocalError(null);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Validate and debounce
    if (!value.trim()) {
      onAddressChange('');
      return;
    }

    // Basic format check
    if (!value.startsWith('0x')) {
      setLocalError('Address must start with 0x');
      return;
    }

    // Debounce validation and callback
    const timer = setTimeout(() => {
      if (isValidAddress(value)) {
        onAddressChange(normalizeAddress(value));
        setLocalError(null);
      } else {
        setLocalError('Invalid Ethereum address format');
      }
    }, 500);

    setDebounceTimer(timer);
  };

  const displayError = localError || error;

  return (
    <div className="card">
      <label htmlFor="wallet-address" className="block text-sm font-bold mb-2">
        WALLET ADDRESS
      </label>
      <input
        id="wallet-address"
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="0x..."
        disabled={loading}
        className={`input w-full ${displayError ? 'border-red-500' : ''}`}
      />
      {displayError && (
        <p className="mt-2 text-sm text-red-600 font-bold">{displayError}</p>
      )}
      {defaultAddress && inputValue === defaultAddress && (
        <p className="mt-2 text-xs text-gray-600">
          Using your connected wallet address
        </p>
      )}
    </div>
  );
}

