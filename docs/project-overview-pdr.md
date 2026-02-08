# SuiGate - Project Overview & PDR

## Vision

Mobile wallet enabling VND ↔ USDC conversion on Sui, targeting Vietnam's newly legalized crypto market.

## Tech Stack

- **Mobile**: Expo 54 + React Native 0.81.5 + Zustand state management
- **Backend**: NestJS + TypeScript + PostgreSQL (Supabase)
- **Admin**: Next.js 14 + React 18 + Tailwind CSS + Radix UI
- **Blockchain**: Sui Network + Move smart contracts (5 modules)
- **Authentication**: Sui zkLogin + OAuth (Google/Apple)

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

## Key Features (Implemented)

1. **Wallet Creation** - zkLogin with Google/Apple OAuth
2. **eKYC Verification** - Mock verification (auto-approve for demo)
3. **GPS Location Check** - Da Nang sandbox validation (500m radius)
4. **Buy USDC** - VietQR bank transfer (0.5% fee)
5. **Quick Sell** - Instant USDC → VND at market rate (0.5% fee)
6. **Smart Sell** - Set target rate, auto-execute when hit (0.2% fee)
7. **Bank Account Management** - Save and manage multiple accounts
8. **Transaction History** - Full order tracking with filtering
9. **Admin Dashboard** - Real-time order management and analytics
10. **Multi-language UI** - Vietnamese + English support

## Architecture Components

**Mobile (Expo 54, 8,965 LOC):**
- zkLogin authentication with Google/Apple OAuth
- Location permission handler for Da Nang sandbox
- Zustand stores for global state (auth, wallet, trading, UI)
- 8 main screens (login, KYC, location, wallet, conversion, history, settings)
- SuiWallet service with transaction signing
- Comprehensive error handling and loading states

**Backend (NestJS, 5,967 LOC):**
- 8 core modules: auth, users, orders, rates, wallet, webhooks, bank-accounts, admin
- Order matching engine for smart sell rate optimization
- Automatic settlement when target rates hit
- SePay webhook integration for payment notifications
- Supabase PostgreSQL with Row Level Security
- Redis queue for async jobs (rate updates, order processing)
- Deployed on Render.com (Singapore region)

**Admin Dashboard (Next.js 14, 70 files):**
- Real-time order management (approve, settle, cancel)
- User analytics (KYC status, location verification, volume)
- Settlement history with manual review queue
- Multi-user RBAC (admin/support roles)
- Recharts analytics visualizations
- Deployed on Vercel

**Smart Contracts (Move, 564 LOC, 5 modules):**
- admin_cap.move: Capability pattern for privileged ops
- price_oracle.move: Buy/sell rates with staleness check
- liquidity_pool.move: Platform USDC reserve
- escrow.move: Smart sell order escrow with partial fills
- test_usdc.move: Testnet USDC token
- Package ID: 0xa0293d10661a51dadbed27335bb79de99f572a0e216502ffb39865312b92d828
- Network: Sui Testnet

## Deployment

- **Mobile**: EAS Build (development client) + APK demo
- **Backend**: Render.com (NestJS + Redis, Singapore)
- **Admin**: Vercel (Next.js global CDN)
- **Database**: Supabase free tier (PostgreSQL, free auth)
- **Contracts**: Sui Testnet (0xa029...)

## PDR (Product Development Requirements)

**Functional Requirements:**
- FR-01: Users create wallets via OAuth without managing seed phrases
- FR-02: Users complete mock eKYC verification to unlock VND features
- FR-03: Users verify location (GPS) for sandbox zone access
- FR-04: Users buy USDC via VietQR bank transfer integration
- FR-05: Users instantly sell USDC at market rate (0.5% fee)
- FR-06: Users set target rates and auto-sell when hit (0.2% fee)
- FR-07: Users manage multiple bank accounts for off-ramp
- FR-08: Admins manage orders, users, and settlements in real-time
- FR-09: Backend automatically matches smart sell orders at optimal rates
- FR-10: Contracts enforce rate validation and escrow locking

**Non-Functional Requirements:**
- NFR-01: API response time <100ms for rate queries
- NFR-02: Smart sell order matching every 5 minutes
- NFR-03: Multi-language support (Vietnamese/English)
- NFR-04: Rate staleness check (max 10 minutes)
- NFR-05: Gasless transactions via Sui Enoki sponsorship
- NFR-06: Bank account data encrypted at rest
- NFR-07: Row Level Security on all user data
- NFR-08: HMAC-SHA256 signature verification for webhooks

**Success Metrics:**
- All 12 user stories fully implemented
- Zero broken links in demo flows
- Atomic transactions for order settlement
- Rate oracle updates every 5 minutes
- Admin dashboard functional for manual review
- Mobile app boots in <5 seconds
- All tests passing (11/11 Move tests, backend unit tests)

**Technical Constraints:**
- Sui Testnet network (cannot use mainnet during hackathon)
- 24-hour JWT expiry (no silent refresh for simplicity)
- Da Nang sandbox location only (regulatory)
- Ephemeral keys rotate every epoch
- Free exchange-api rate source (rate limit 100 req/min)
- Supabase free tier limits (no custom extensions)
