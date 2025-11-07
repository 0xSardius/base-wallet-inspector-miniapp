/**
 * Hook to get wallet address from Quick Auth
 * 
 * Uses Quick Auth and SDK context to get the user's verified wallet addresses
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

        // Get user info from SDK context (sdk.context is a promise)
        const context = await sdk.context;
        const contextUser = context.user;

        if (contextUser) {
          const userData: QuickAuthUser = {
            fid: contextUser.fid,
            username: contextUser.username,
            displayName: contextUser.displayName,
            pfpUrl: contextUser.pfpUrl,
          };

          setUser(userData);

          // Fetch primary Ethereum address from Farcaster API
          try {
            const response = await fetch(
              `https://api.farcaster.xyz/fc/primary-address?fid=${contextUser.fid}&protocol=ethereum`
            );
            
            if (response.ok) {
              const data = await response.json();
              const walletAddress = data.result?.address?.address;
              
              if (walletAddress) {
                setAddress(walletAddress.toLowerCase());
              }
              // If no address found, that's okay - user can enter manually
            }
            // If API call fails, that's okay - user can enter address manually
          } catch (fetchError) {
            // Silently fail - user can enter address manually
            console.log('Could not fetch primary address, user can enter manually');
          }
        }
      } catch (err) {
        console.error('Error getting wallet address:', err);
        // Don't set error - allow user to enter address manually
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

