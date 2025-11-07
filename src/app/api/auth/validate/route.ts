/**
 * Quick Auth Token Validation Route
 * 
 * Validates Quick Auth JWT tokens from the Farcaster SDK
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyQuickAuthJWT } from '@farcaster/miniapp-sdk/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the Quick Auth JWT
    const domain = process.env.NEXT_PUBLIC_QUICK_AUTH_DOMAIN || process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000';
    
    const payload = await verifyQuickAuthJWT(token, {
      domain: domain.replace(/^https?:\/\//, '').split('/')[0], // Remove protocol and path
    });

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        fid: payload.sub,
        // Note: Quick Auth JWT doesn't include username/avatar by default
        // You may need to fetch this from Farcaster API if needed
      },
    });
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
