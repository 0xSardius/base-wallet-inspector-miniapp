/**
 * Hook to get wallet address from Quick Auth
 * 
 * Uses Quick Auth to get the user's verified wallet addresses
 */

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import type { QuickAuthUser } from '~/types';

export function useWalletAddress() {
  const [user, setUser] = useState<QuickAuthUser | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getWalletAddress() {
      try {
        setLoading(true);
        setError(null);

        // Get Quick Auth token
        const { token } = await sdk.quickAuth.getToken();

        if (!token) {
          throw new Error('Failed to get authentication token');
        }

        // Verify token on server to get user info
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify authentication');
        }

        const data = await response.json();
        const userData = data.user;

        setUser(userData);

        // Extract wallet address - prefer verified addresses, fallback to custody address
        const walletAddress =
          userData.verified_addresses?.[0] || userData.custody_address || '';

        if (walletAddress) {
          setAddress(walletAddress.toLowerCase());
        } else {
          setError('No wallet address found');
        }
      } catch (err) {
        console.error('Error getting wallet address:', err);
        setError(err instanceof Error ? err.message : 'Failed to get wallet address');
      } finally {
        setLoading(false);
      }
    }

    getWalletAddress();
  }, []);

  return {
    user,
    address,
    loading,
    error,
  };
}

