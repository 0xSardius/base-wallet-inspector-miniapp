"use client";

import { useState } from 'react';
import { useWalletAddress } from '~/hooks/useWalletAddress';
import { WalletInput } from './wallet/WalletInput';
import { UserProfile } from './wallet/UserProfile';
import { TransactionHistory } from './transactions/TransactionHistory';
import { TokenHoldings } from './tokens/TokenHoldings';
import { ActivityHeatmap } from './activity/ActivityHeatmap';
import { TopCounterparties } from './counterparties/TopCounterparties';
import { sdk } from '@farcaster/miniapp-sdk';

export default function WalletInspector() {
  const { user, address: authAddress, loading: authLoading, error: authError } = useWalletAddress();
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'tokens' | 'activity' | 'counterparties'>('overview');

  // Use selected address or fall back to authenticated address
  const currentAddress = selectedAddress || authAddress;

  // Handle safe area insets for mobile
  const safeAreaInsets = sdk.context?.client?.safeAreaInsets;

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingTop: safeAreaInsets?.top ?? 0,
        paddingBottom: safeAreaInsets?.bottom ?? 0,
        paddingLeft: safeAreaInsets?.left ?? 0,
        paddingRight: safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 border-4 border-black p-4 bg-neon">
            BASE WALLET INSPECTOR
          </h1>
        </div>

        {/* User Profile */}
        {user && (
          <div className="mb-6">
            <UserProfile user={user} address={authAddress} />
          </div>
        )}

        {/* Wallet Input */}
        <div className="mb-6">
          <WalletInput
            defaultAddress={authAddress}
            onAddressChange={setSelectedAddress}
            loading={authLoading}
            error={authError}
          />
        </div>

        {/* Loading State */}
        {authLoading && !currentAddress && (
          <div className="card text-center py-12">
            <div className="spinner h-8 w-8 mx-auto mb-4"></div>
            <p className="text-lg font-bold">Loading wallet...</p>
          </div>
        )}

        {/* Error State */}
        {authError && !currentAddress && (
          <div className="card border-4 border-red-500 bg-red-50 p-6">
            <p className="font-bold text-red-900 mb-2">Error</p>
            <p className="text-red-700">{authError}</p>
            <p className="text-sm text-red-600 mt-2">
              You can still explore any wallet by entering an address above.
            </p>
          </div>
        )}

        {/* Main Content */}
        {currentAddress && (
          <>
            {/* Tab Navigation */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'overview' as const, label: 'Overview' },
                { id: 'transactions' as const, label: 'Transactions' },
                { id: 'tokens' as const, label: 'Tokens' },
                { id: 'activity' as const, label: 'Activity' },
                { id: 'counterparties' as const, label: 'Counterparties' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn flex-shrink-0 ${
                    activeTab === tab.id ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <TokenHoldings address={currentAddress} limit={5} />
                  <ActivityHeatmap address={currentAddress} />
                  <TopCounterparties address={currentAddress} limit={5} />
                </div>
              )}

              {activeTab === 'transactions' && (
                <TransactionHistory address={currentAddress} />
              )}

              {activeTab === 'tokens' && (
                <TokenHoldings address={currentAddress} />
              )}

              {activeTab === 'activity' && (
                <ActivityHeatmap address={currentAddress} />
              )}

              {activeTab === 'counterparties' && (
                <TopCounterparties address={currentAddress} />
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!authLoading && !currentAddress && !authError && (
          <div className="card text-center py-12">
            <p className="text-lg font-bold mb-2">No wallet selected</p>
            <p className="text-gray-600">
              Enter a wallet address above to start exploring
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

