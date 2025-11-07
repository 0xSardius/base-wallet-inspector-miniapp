/**
 * CDP SQL API Proxy Route
 * 
 * Server-side proxy for executing CDP SQL queries
 * This prevents exposing API keys to the client
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeCDPQuery, getCDPConfig } from '~/lib/cdp-client';

export async function POST(request: NextRequest) {
  try {
    const { sql, address } = await request.json();

    if (!sql || typeof sql !== 'string') {
      return NextResponse.json(
        { error: 'SQL query is required' },
        { status: 400 }
      );
    }

    // Validate address if provided
    if (address && !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    // Get CDP config
    const config = getCDPConfig();

    // Execute query
    const result = await executeCDPQuery(sql, config);

    return NextResponse.json({
      success: true,
      data: result.data || result,
    });
  } catch (error) {
    console.error('CDP query error:', error);
    
    if (error instanceof Error) {
      // Check if it's a configuration error
      if (error.message.includes('CDP API credentials')) {
        return NextResponse.json(
          { error: 'Server configuration error. Please contact support.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Failed to execute query' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

