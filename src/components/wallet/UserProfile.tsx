"use client";

import { truncateAddress } from '~/lib/utils';
import type { QuickAuthUser } from '~/types';

interface UserProfileProps {
  user: QuickAuthUser;
  address: string;
}

export function UserProfile({ user, address }: UserProfileProps) {
  return (
    <div className="card bg-neon/10">
      <div className="flex items-center gap-4">
        {user.pfpUrl && (
          <img
            src={user.pfpUrl}
            alt={user.username || `FID ${user.fid}`}
            className="w-16 h-16 border-4 border-black object-cover"
          />
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-1">
            {user.displayName || user.username || `User ${user.fid}`}
          </h2>
          {user.username && (
            <p className="text-sm text-gray-600 mb-1">@{user.username}</p>
          )}
          <p className="text-xs font-mono text-gray-700">
            FID: {user.fid}
          </p>
          <p className="text-xs font-mono text-gray-700 mt-1">
            {truncateAddress(address)}
          </p>
        </div>
      </div>
    </div>
  );
}

