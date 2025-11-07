/**
 * CDP SQL API Client
 * 
 * Handles authentication and query execution for Coinbase Developer Platform SQL API
 */

import crypto from 'crypto';

const CDP_API_BASE_URL = 'https://api.cdp.coinbase.com/platform/v2/data/query/run';

interface CDPConfig {
  apiKeyName: string;
  privateKey: string;
}

/**
 * Generate a JWT bearer token for CDP API authentication
 * Based on CDP authentication documentation
 */
function generateBearerToken(config: CDPConfig): string {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'ES256',
    typ: 'JWT',
  };

  const payload = {
    sub: config.apiKeyName,
    iss: 'coinbase-cloud',
    nbf: now,
    exp: now + 120, // 2 minutes expiry
    aud: 'https://api.cdp.coinbase.com',
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Sign with private key
  const privateKey = crypto.createPrivateKey({
    key: config.privateKey,
    format: 'pem',
  });

  const signature = crypto.sign(null, Buffer.from(signatureInput), privateKey);
  const encodedSignature = signature.toString('base64url');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Execute a SQL query against CDP SQL API
 */
export async function executeCDPQuery(
  sql: string,
  config: CDPConfig
): Promise<any> {
  const bearerToken = generateBearerToken(config);

  const response = await fetch(CDP_API_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CDP API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get CDP configuration from environment variables
 */
export function getCDPConfig(): CDPConfig {
  const apiKeyName = process.env.NEXT_PUBLIC_CDP_CLIENT_API;
  const privateKey = process.env.CDP_API_SECRET;

  if (!apiKeyName || !privateKey) {
    throw new Error(
      'CDP API credentials not configured. Please set NEXT_PUBLIC_CDP_CLIENT_API and CDP_API_SECRET environment variables.'
    );
  }

  return {
    apiKeyName,
    privateKey,
  };
}

