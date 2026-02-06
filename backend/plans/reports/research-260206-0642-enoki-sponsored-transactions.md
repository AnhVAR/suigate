# Research Report: Enoki Sponsored Transactions

**Date:** 2026-02-06

## Executive Summary

Enoki provides hosted sponsored transactions for Sui blockchain. Key finding: Enoki uses a **2-step flow** - first sponsor the tx kind, then execute with user signature.

## Key Findings

### Enoki Sponsor API Endpoint

**URL:** `POST https://api.enoki.mystenlabs.com/v1/transaction-blocks/sponsor`

**Headers:**
```
Authorization: Bearer <ENOKI_API_KEY>
zklogin-jwt: <JWT_TOKEN>  (required for zkLogin users)
```

**Request Body:**
```json
{
  "network": "testnet",
  "transactionBlockKindBytes": "<BASE64_TX_KIND_BYTES>"
}
```

**Response:**
```json
{
  "data": {
    "bytes": "base64EncodedTransactionBytes...",
    "digest": "transactionDigestString...",
    "signature": "sponsorSignatureBase64..."
  }
}
```

### Enoki Execute Endpoint

After user signs, execute via:

**URL:** `POST https://api.enoki.mystenlabs.com/v1/transaction-blocks/sponsor/:digest`

**Request Body:**
```json
{
  "signature": "<USER_ZKLOGIN_SIGNATURE>"
}
```

### Flow Summary

```
1. Client builds tx kind (onlyTransactionKind: true)
2. POST /v1/transaction-blocks/sponsor → get bytes + digest + sponsor signature
3. User signs `bytes` with zkLogin → user signature
4. POST /v1/transaction-blocks/sponsor/:digest with user signature
   OR execute via RPC with [userSig, sponsorSig]
```

## Implementation for SuiGate

### Option A: Use Enoki's execute endpoint

```typescript
// 1. Sponsor
const sponsorRes = await fetch(`${ENOKI_BASE_URL}/transaction-blocks/sponsor`, {
  method: 'POST',
  headers: getEnokiHeaders(jwt),
  body: JSON.stringify({
    network: 'testnet',
    transactionBlockKindBytes: txKindBase64,
  }),
});
const { data: { bytes, digest, signature: sponsorSig } } = await sponsorRes.json();

// 2. User signs
const userSig = await getZkLoginSignature({ inputs, bytes, maxEpoch });

// 3. Execute via Enoki
const execRes = await fetch(`${ENOKI_BASE_URL}/transaction-blocks/sponsor/${digest}`, {
  method: 'POST',
  headers: getEnokiHeaders(jwt),
  body: JSON.stringify({ signature: userSig }),
});
```

### Option B: Execute via Sui RPC (current approach)

```typescript
// After getting sponsor response
const result = await suiClient.executeTransactionBlock({
  transactionBlock: bytes,
  signature: [userSig, sponsorSig],
});
```

## Current Issue Analysis

The error "Object used as owned is not owned" suggests:
1. USDC coins in tx kind are not owned by user's new Enoki-derived address
2. Or sponsor is trying to use coins it doesn't own

**Fix:** The user's new Enoki address `0x9560a6084f60456eb0c93a2956cb34ca2958e76dbcb2adee3b1e7400c09af00e` likely has no USDC. Need to fund this address first.

## Unresolved Questions

1. Does Enoki's `/sponsor/:digest` endpoint handle execution automatically?
2. What's the response format from the execute endpoint?
