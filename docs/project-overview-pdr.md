# SuiGate - Project Overview

## Vision

Mobile wallet enabling VND ↔ USDC conversion on Sui, targeting Vietnam's newly legalized crypto market.

## Tech Stack

- **Mobile**: Expo (React Native) - cross-platform iOS/Android
- **Blockchain**: Sui Network with Move smart contracts
- **Stablecoin**: Native USDC on Sui

## Core Integrations

### Sui zkLogin
- Wallet creation via Google/Apple OAuth
- No seed phrase required
- Frictionless onboarding for mainstream users

### Sponsored Transactions
- Gasless UX for end users
- App covers transaction fees
- Removes crypto complexity from user experience

### Native USDC on Sui
- Direct stablecoin support
- No bridging required
- Fast, low-cost transfers

## Technical Challenge

**VND Oracle Problem**: Vietnamese Dong (VND) isn't supported by major blockchain oracles (Pyth, Supra).

Requires custom solution for VND/USDC price feeds.

## Target Market

- Vietnam's newly legalized cryptocurrency market
- Users unfamiliar with crypto concepts (seed phrases, gas fees)
- VND on/off ramp use case

## Regulatory Compliance

### eKYC Requirement
- Users must complete eKYC verification before VND ↔ USDC transactions
- Required: ID card/passport + liveness check
- KYC status stored on-chain or backend (TBD)

### Geographic Restriction (Sandbox)
- **Phase 1**: Da Nang sandbox only
- GPS-based location verification required
- Users outside Da Nang cannot access VND conversion features
- USDC wallet features available nationwide (view balance, receive)

```
┌─────────────────────────────────────────┐
│           FEATURE ACCESS                │
├─────────────────────────────────────────┤
│ Feature          │ Da Nang │ Other     │
├──────────────────┼─────────┼───────────┤
│ zkLogin Wallet   │   ✅    │    ✅     │
│ View USDC        │   ✅    │    ✅     │
│ Receive USDC     │   ✅    │    ✅     │
│ Send USDC        │   ✅    │    ⚠️*    │
│ VND → USDC       │   ✅    │    ❌     │
│ USDC → VND       │   ✅    │    ❌     │
└─────────────────────────────────────────┘
* Send USDC may require KYC for AML compliance
```

## Hackathon Context

**Event**: ETHGlobal HackMoney 2026
**Timeline**: Jan 30 - Feb 8, 2026
**Team**: Solo

## Project Structure

```
suigate/
├── docs/           # Documentation
├── plans/          # Implementation plans
├── contracts/      # Move smart contracts (TBD)
└── app/            # Expo mobile app (TBD)
```

## Key Features (Planned)

1. **Wallet Creation** - zkLogin with Google/Apple
2. **eKYC Verification** - ID + liveness check (required for VND features)
3. **GPS Location Check** - Da Nang sandbox validation
4. **VND Deposit** - Bank transfer integration
5. **VND → USDC Conversion** - On-chain swap
6. **USDC → VND Conversion** - Off-ramp to bank
7. **USDC Transfers** - Send/receive on Sui
```
