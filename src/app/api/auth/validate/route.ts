/**
 * Quick Auth Token Validation Route
 * 
 * Validates Quick Auth JWT tokens from the Farcaster SDK
 * 
 * Note: For production, install @farcaster/quick-auth and use:
 *   import { createClient } from "@farcaster/quick-auth";
 *   const client = createClient();
 *   const payload = await client.verifyJwt({ token, domain });
 * 
 * For now, we use basic JWT decoding. The JWT payload contains:
 *   - sub: FID (number)
 *   - exp: expiration timestamp
 *   - iss: issuer (https://auth.farcaster.xyz)
 *   - aud: audience (domain)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Decode JWT to get FID (basic validation)
    // For production, install @farcaster/quick-auth and use client.verifyJwt()
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8')
      );

      // Basic validation - check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }

      // Return user data with FID
      return NextResponse.json({
        success: true,
        user: {
          fid: payload.sub,
          // Note: Quick Auth JWT doesn't include username/avatar by default
          // Username/avatar come from SDK context on the client side
        },
      });
    } catch (decodeError) {
      throw new Error('Failed to decode token');
    }
  } catch (error) {
    console.error('Token validation error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Invalid token', message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Token validation failed' },
      { status: 401 }
    );
  }
}
